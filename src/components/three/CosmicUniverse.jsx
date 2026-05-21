import React, { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, useGLTF, Center } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import useStore from '../../store/useStore';
import { ASSETS } from '../../config/paths.js';
import { getDeviceProfile } from '../../utils/deviceProfile.js';
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

function DustField({ count }) {
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

function EnduranceShip() {
  const ref = useRef();
  const scrollProgress = useStore((s) => s.scrollProgress);
  const { scene } = useGLTF(ASSETS.enduranceModel);

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
    state.camera.position.x = Math.sin(t * 0.08) * 0.35;
    state.camera.position.y = 1.2 + Math.sin(t * 0.12) * 0.18 - scrollProgress * 0.8;
    state.camera.position.z = 8 - scrollProgress * 2;
    state.camera.lookAt(0, scrollProgress * -0.3, 0);
  });
  return null;
}

function OrbitingPlanet({ radius, speed, size, color, offset }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed + offset;
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius - 8;
      ref.current.position.y = Math.sin(t * 0.5) * 0.35;
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 24, 24]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} roughness={0.85} />
    </mesh>
  );
}

function SceneContent({ profile }) {
  return (
    <>
      <color attach="background" args={['#020406']} />
      <fog attach="fog" args={['#020406', 12, 45]} />
      <ambientLight intensity={0.12} />
      <directionalLight position={[6, 4, 5]} intensity={2.2} color="#38bdf8" />
      <directionalLight position={[-4, -2, -6]} intensity={1.2} color="#6366f1" />

      <WormholePlane />
      <DustField count={profile.dustCount} />
      <Stars radius={130} depth={60} count={profile.starCount} factor={4} saturation={0.35} fade speed={1.2} />

      {profile.enablePlanets && (
        <>
          <OrbitingPlanet radius={5.5} speed={0.14} size={0.28} color="#1e3a5f" offset={0} />
          <OrbitingPlanet radius={8} speed={0.09} size={0.18} color="#312e81" offset={2} />
        </>
      )}

      {profile.enableShip && (
        <Suspense fallback={null}>
          <Center>
            <EnduranceShip />
          </Center>
        </Suspense>
      )}

      <CinematicCamera />

      {profile.enablePostFX && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={profile.bloomIntensity} luminanceThreshold={0.2} luminanceSmoothing={0.85} mipmapBlur />
          <Vignette eskil={false} offset={0.12} darkness={0.75} />
        </EffectComposer>
      )}
    </>
  );
}

function WebGLFallback() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #0c1929 0%, #020406 70%)',
      }}
      aria-hidden
    />
  );
}

export default function CosmicUniverse() {
  const [profile] = useState(() => getDeviceProfile());
  const [webglLost, setWebglLost] = useState(false);

  useEffect(() => {
    const onLost = (e) => {
      e.preventDefault();
      setWebglLost(true);
    };
    document.addEventListener('webglcontextlost', onLost, true);
    return () => document.removeEventListener('webglcontextlost', onLost, true);
  }, []);

  if (!profile.enable3D || webglLost) {
    return <WebGLFallback />;
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
      <Canvas
        camera={{ position: [0, 1.2, 8], fov: 48, near: 0.1, far: 200 }}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, Math.min(1.75, typeof window !== 'undefined' ? window.devicePixelRatio : 1.5)]}
        frameloop="always"
        style={{ pointerEvents: 'none' }}
        onCreated={({ gl }) => gl.setClearColor('#020406')}
      >
        <SceneContent profile={profile} />
      </Canvas>
    </div>
  );
}

if (typeof window !== 'undefined' && getDeviceProfile().enableShip) {
  try {
    useGLTF.preload(ASSETS.enduranceModel);
  } catch {
    /* optional */
  }
}
