import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, useGLTF, Center } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import useStore from '../../store/useStore';
import { wormholeVertex, wormholeFragment } from './shaders';

function WormholePlane() {
  const meshRef = useRef();
  const mouseSm = useRef({ x: 0, y: 0 });
  const scrollProgress = useStore((s) => s.scrollProgress);
  const isTransmitting = useStore((s) => s.isTransmitting);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      uPulse: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    uniforms.uTime.value = t;
    uniforms.uScroll.value = scrollProgress;
    uniforms.uPulse.value += ((isTransmitting ? 1 : 0) - uniforms.uPulse.value) * 0.08;

    const mx = state.pointer.x * 0.5;
    const my = state.pointer.y * 0.5;
    mouseSm.current.x += (mx - mouseSm.current.x) * 0.03;
    mouseSm.current.y += (my - mouseSm.current.y) * 0.03;
    uniforms.uMouse.value.set(mouseSm.current.x, mouseSm.current.y);

    if (meshRef.current) {
      meshRef.current.position.z = -14 - scrollProgress * 3;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -14]}>
      <planeGeometry args={[55, 35]} />
      <shaderMaterial vertexShader={wormholeVertex} fragmentShader={wormholeFragment} uniforms={uniforms} />
    </mesh>
  );
}

function DustField({ count = 800 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 35;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 22;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * 0.008;
      ref.current.rotation.x = Math.sin(t * 0.012) * 0.04;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#7dd3fc" transparent opacity={0.35} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function OrbitingPlanet({ radius, speed, size, color, offset }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed + offset;
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius - 8;
      ref.current.position.y = Math.sin(t * 0.5) * 0.4;
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} roughness={0.8} metalness={0.2} />
    </mesh>
  );
}

function Satellite({ orbit, speed, offset }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed + offset;
    if (ref.current) {
      ref.current.position.set(Math.cos(t) * orbit, Math.sin(t * 2) * 0.3 + 1, Math.sin(t) * orbit - 5);
      ref.current.rotation.y = t;
    }
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.08, 0.04, 0.12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.2, 0.01, 0.08]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function EnduranceShip() {
  const ref = useRef();
  const scrollProgress = useStore((s) => s.scrollProgress);
  const { scene } = useGLTF('/interstellar__endurance_high_fidelity.glb');

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * 0.035;
      ref.current.rotation.z = t * 0.006;
      ref.current.position.y = Math.sin(t * 0.35) * 0.1 - scrollProgress * 0.5;
      ref.current.position.z = scrollProgress * -1.5;
    }
  });

  return <primitive ref={ref} object={scene} scale={0.055} position={[0, 0, 0]} />;
}

function CinematicCamera() {
  const scrollProgress = useStore((s) => s.scrollProgress);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    state.camera.position.x = Math.sin(t * 0.08) * 0.3;
    state.camera.position.y = 1.2 + Math.sin(t * 0.12) * 0.15 - scrollProgress * 0.8;
    state.camera.position.z = 8 - scrollProgress * 2;
    state.camera.lookAt(0, scrollProgress * -0.3, 0);
    state.camera.updateProjectionMatrix();
  });
  return null;
}

function SceneContent() {
  return (
    <>
      <color attach="background" args={['#020406']} />
      <fog attach="fog" args={['#020406', 12, 45]} />
      <ambientLight intensity={0.12} />
      <directionalLight position={[6, 4, 5]} intensity={2.2} color="#38bdf8" />
      <directionalLight position={[-4, -2, -6]} intensity={1.2} color="#6366f1" />
      <pointLight position={[0, 5, -2]} intensity={0.6} color="#fbbf24" />
      <spotLight position={[0, 12, 2]} angle={0.2} penumbra={1} intensity={2.5} color="#e0f2fe" />

      <WormholePlane />
      <DustField count={typeof window !== 'undefined' && window.innerWidth < 768 ? 400 : 900} />

      <Stars radius={130} depth={60} count={4000} factor={3.5} saturation={0.2} fade speed={0.5} />

      <OrbitingPlanet radius={6} speed={0.12} size={0.35} color="#1e3a5f" offset={0} />
      <OrbitingPlanet radius={9} speed={0.08} size={0.2} color="#4a3728" offset={2} />
      <OrbitingPlanet radius={11} speed={0.05} size={0.5} color="#312e81" offset={4} />

      <Satellite orbit={4} speed={0.4} offset={0} />
      <Satellite orbit={5.5} speed={0.25} offset={1.5} />
      <Satellite orbit={7} speed={0.18} offset={3} />

      <Suspense fallback={null}>
        <Center>
          <EnduranceShip />
        </Center>
      </Suspense>

      <CinematicCamera />

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.45} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette eskil={false} offset={0.15} darkness={0.85} />
      </EffectComposer>
    </>
  );
}

export default function CosmicUniverse() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
      <Canvas
        camera={{ position: [0, 1.2, 8], fov: 48, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 1.5)]}
        style={{ pointerEvents: 'none' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}

try {
  useGLTF.preload('/interstellar__endurance_high_fidelity.glb');
} catch {
  /* model optional */
}
