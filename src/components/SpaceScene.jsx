import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Stars, Center } from '@react-three/drei';

function EnduranceModel() {
  const meshRef = useRef();
  // Load the model from the public directory
  const { scene } = useGLTF('/interstellar__endurance_high_fidelity.glb');

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Slow rotation mimicking gravity-generation spin
      meshRef.current.rotation.y = t * 0.05;
      meshRef.current.rotation.z = t * 0.01;
      
      // Floating/swaying animation
      meshRef.current.position.y = Math.sin(t * 0.5) * 0.15;
    }
  });

  return (
    <primitive 
      ref={meshRef}
      object={scene} 
      scale={0.065} 
      position={[0, 0, 0]} 
    />
  );
}

// Custom lighting rig to give a cinematic Interstellar glow
function LightingRig() {
  return (
    <>
      <ambientLight intensity={0.2} />
      
      {/* Front key light - ice blue */}
      <directionalLight 
        position={[5, 3, 5]} 
        intensity={2.0} 
        color="#38bdf8" 
        castShadow
      />
      
      {/* Back rim light - deep space dark blue/violet */}
      <directionalLight 
        position={[-5, -3, -5]} 
        intensity={1.5} 
        color="#818cf8" 
      />
      
      {/* Soft warm fill light simulating dust nebula */}
      <pointLight 
        position={[0, 5, -2]} 
        intensity={1.0} 
        color="#fbbf24" 
      />
      
      {/* Spotlight on the ship to enhance outline */}
      <spotLight 
        position={[0, 10, 0]} 
        angle={0.3} 
        penumbra={1} 
        intensity={3} 
        color="#e0f2fe" 
      />
    </>
  );
}

export default function SpaceScene() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
      <Canvas
        camera={{ position: [0, 2, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['transparent']} />
        
        <LightingRig />
        
        <Suspense fallback={null}>
          <Center>
            <EnduranceModel />
          </Center>
        </Suspense>

        {/* Slow drifting stars background inside the Canvas */}
        <Stars 
          radius={120} 
          depth={50} 
          count={2500} 
          factor={4} 
          saturation={0.5} 
          fade 
          speed={0.8} 
        />

        {/* Limit zoom & pan to ensure the UI is not obstructed */}
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          maxDistance={15}
          minDistance={4}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}

// Pre-load the GLTF file to optimize speed
useGLTF.preload('/interstellar__endurance_high_fidelity.glb');
