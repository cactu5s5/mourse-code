import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Stars, OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';

// ── Wormhole Shader ──────────────────────────────────────────
const wormholeVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const wormholeFragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Simplex-ish noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);
    vec3 g; g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    vec2 center = vec2(0.5 + uMouse.x * 0.05, 0.5 + uMouse.y * 0.05);
    vec2 delta = uv - center;
    float dist = length(delta);
    
    // Gravitational distortion
    float warp = 0.08 / (dist + 0.15);
    vec2 warped = uv + normalize(delta) * warp * 0.02;
    
    // Noise layers
    float n1 = snoise(warped * 3.0 + uTime * 0.08) * 0.5 + 0.5;
    float n2 = snoise(warped * 6.0 - uTime * 0.12) * 0.5 + 0.5;
    float n3 = snoise(warped * 12.0 + uTime * 0.05) * 0.5 + 0.5;
    
    // Nebula color mixing
    vec3 deepSpace = vec3(0.01, 0.02, 0.05);
    vec3 nebula1 = vec3(0.05, 0.12, 0.25); // deep blue
    vec3 nebula2 = vec3(0.15, 0.08, 0.28); // violet
    vec3 nebula3 = vec3(0.03, 0.15, 0.22); // teal
    vec3 warm = vec3(0.2, 0.08, 0.03); // warm dust
    
    vec3 col = deepSpace;
    col = mix(col, nebula1, n1 * 0.4);
    col = mix(col, nebula2, n2 * 0.25);
    col = mix(col, nebula3, n3 * 0.2);
    col = mix(col, warm, n1 * n2 * 0.3);
    
    // Wormhole ring glow
    float ringDist = abs(dist - 0.25);
    float ring = smoothstep(0.08, 0.0, ringDist) * 0.6;
    col += vec3(0.22, 0.74, 0.97) * ring; // ice blue ring
    
    // Center dark core
    float core = smoothstep(0.12, 0.0, dist);
    col *= (1.0 - core * 0.7);
    
    // Subtle vignette
    float vig = 1.0 - smoothstep(0.3, 0.85, dist);
    col *= mix(0.4, 1.0, vig);
    
    // Dust particles
    float dust = snoise(uv * 50.0 + uTime * 0.3);
    dust = smoothstep(0.75, 0.85, dust) * 0.15;
    col += vec3(0.6, 0.7, 0.9) * dust;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function WormholeBackground() {
  const meshRef = useRef();
  const mouseRef = useRef({ x: 0, y: 0 });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  }), []);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.getElapsedTime();
    // Smooth mouse follow
    const mx = state.pointer.x * 0.5;
    const my = state.pointer.y * 0.5;
    mouseRef.current.x += (mx - mouseRef.current.x) * 0.02;
    mouseRef.current.y += (my - mouseRef.current.y) * 0.02;
    uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -15]}>
      <planeGeometry args={[50, 30]} />
      <shaderMaterial
        vertexShader={wormholeVertexShader}
        fragmentShader={wormholeFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

// ── Floating Dust Particles ─────────────────────────────────
function DustParticles({ count = 600 }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * 0.01;
      ref.current.rotation.x = Math.sin(t * 0.015) * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#38bdf8" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

// ── Endurance Spaceship ─────────────────────────────────────
function EnduranceModel() {
  const ref = useRef();
  let scene;
  try {
    const gltf = useGLTF('/interstellar__endurance_high_fidelity.glb');
    scene = gltf.scene;
  } catch {
    return null;
  }

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * 0.04;
      ref.current.rotation.z = t * 0.008;
      ref.current.position.y = Math.sin(t * 0.4) * 0.12;
    }
  });

  return (
    <primitive ref={ref} object={scene} scale={0.06} position={[0, 0, 0]} />
  );
}

// ── Lighting Rig ────────────────────────────────────────────
function CinematicLighting() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 3, 5]} intensity={2.5} color="#38bdf8" />
      <directionalLight position={[-5, -2, -5]} intensity={1.5} color="#818cf8" />
      <pointLight position={[0, 6, -3]} intensity={0.8} color="#fbbf24" />
      <spotLight position={[0, 10, 0]} angle={0.25} penumbra={1} intensity={3} color="#e0f2fe" />
    </>
  );
}

// ── Main Scene ──────────────────────────────────────────────
export default function CosmicBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 1.5, 8], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 1.5]}
      >
        <WormholeBackground />
        <CinematicLighting />
        <Center>
          <EnduranceModel />
        </Center>
        <DustParticles count={500} />
        <Stars radius={100} depth={50} count={3000} factor={3} saturation={0.3} fade speed={0.6} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          maxDistance={14}
          minDistance={4}
          autoRotate={false}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}

try { useGLTF.preload('/interstellar__endurance_high_fidelity.glb'); } catch {}
