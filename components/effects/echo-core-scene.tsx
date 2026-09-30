"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, OrbitControls, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";

function WaveBar({
  x,
  z,
  delay,
}: {
  x: number;
  z: number;
  delay: number;
}) {
  const ref = useRef<Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const h = 0.28 + Math.abs(Math.sin(state.clock.elapsedTime * 2.5 + delay * 0.38)) * 0.85;
    ref.current.scale.y = h;
    ref.current.position.y = h * 0.5 - 0.18;
  });

  return (
    <mesh ref={ref} position={[x, 0, z]}>
      <boxGeometry args={[0.09, 1, 0.09]} />
      <meshStandardMaterial
        color="#e2b84a"
        emissive="#8c6508"
        emissiveIntensity={0.85}
        roughness={0.35}
      />
    </mesh>
  );
}

function EchoCore({ compact = false }: { compact?: boolean }) {
  const group = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const ringA = useRef<Mesh>(null);
  const ringB = useRef<Mesh>(null);
  const ringC = useRef<Mesh>(null);

  const bars = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => {
        const angle = (index / 18) * Math.PI * 2;
        return {
          x: Math.cos(angle) * 2.2,
          z: Math.sin(angle) * 2.2,
          delay: index,
        };
      }),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = t * 0.16;
      group.current.rotation.x = Math.sin(t * 0.28) * 0.07;
    }
    if (core.current) {
      const scale = 1 + Math.sin(t * 2.1) * 0.045;
      core.current.scale.setScalar(scale);
    }
    if (ringA.current) ringA.current.rotation.z = t * 0.42;
    if (ringB.current) ringB.current.rotation.x = t * 0.24;
    if (ringC.current) ringC.current.rotation.y = -t * 0.33;
  });

  return (
    <group ref={group}>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.74, 1]} />
        <meshStandardMaterial
          color="#f5e6b8"
          emissive="#d4a017"
          emissiveIntensity={1.2}
          roughness={0.22}
          metalness={0.4}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.76, 1]} />
        <meshBasicMaterial color="#ffe08a" wireframe transparent opacity={0.4} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.08, 48, 48]} />
        <meshPhysicalMaterial
          color="#143d3d"
          roughness={0.18}
          metalness={0.12}
          transparent
          opacity={0.28}
          clearcoat={1}
          clearcoatRoughness={0.15}
        />
      </mesh>
      <mesh ref={ringA} rotation={[Math.PI / 2.15, 0.18, 0]}>
        <torusGeometry args={[1.48, 0.032, 14, 90]} />
        <meshStandardMaterial color="#d4a017" emissive="#b8860b" emissiveIntensity={0.75} />
      </mesh>
      <mesh ref={ringB} rotation={[0.42, Math.PI / 3.1, 0.28]}>
        <torusGeometry args={[1.72, 0.024, 12, 90]} />
        <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={0.45} />
      </mesh>
      <mesh ref={ringC} rotation={[1.15, 0.55, 0.12]}>
        <torusGeometry args={[1.98, 0.018, 12, 90]} />
        <meshStandardMaterial color="#f5e6b8" emissive="#d4a017" emissiveIntensity={0.4} />
      </mesh>
      {!compact &&
        bars.map((bar) => (
          <WaveBar key={bar.delay} x={bar.x} z={bar.z} delay={bar.delay} />
        ))}
    </group>
  );
}

export function EchoCoreCanvas({ compact = false }: { compact?: boolean }) {
  return (
    <Canvas
      camera={{
        position: compact ? [0, 0.2, 3.6] : [0, 1.05, 5.15],
        fov: compact ? 34 : 40,
      }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 3]} intensity={1.3} color="#fff7e0" />
      <pointLight position={[2, 1, 2]} intensity={1.6} color="#d4a017" />
      <pointLight position={[-3, -1, 1]} intensity={0.9} color="#3b82f6" />
      <Float
        speed={compact ? 0.8 : 1.2}
        rotationIntensity={compact ? 0.15 : 0.25}
        floatIntensity={compact ? 0.2 : 0.4}
      >
        <EchoCore compact={compact} />
      </Float>
      {!compact && <Sparkles count={50} scale={8} size={2} speed={0.25} color="#e2b84a" />}
      {!compact && (
        <ContactShadows position={[0, -2.1, 0]} opacity={0.4} blur={2.4} far={5} color="#020617" />
      )}
      {!compact && (
        <OrbitControls
          enablePan={false}
          minDistance={3.5}
          maxDistance={8}
          autoRotate
          autoRotateSpeed={0.6}
        />
      )}
    </Canvas>
  );
}
