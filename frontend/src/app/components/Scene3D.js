"use client";

import { useRef, useMemo, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  Environment,
  Stars,
  Points,
  PointMaterial,
} from "@react-three/drei";
import * as THREE from "three";

/* ─────────────────────────────────────
   Shield Mesh – interactive icosahedron
   ───────────────────────────────────── */
function ShieldMesh() {
  const meshRef = useRef();
  const wireRef = useRef();

  useFrame(({ pointer }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        pointer.y * 0.3,
        0.05
      );
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        pointer.x * 0.3,
        0.05
      );
    }
    if (wireRef.current) {
      wireRef.current.rotation.x = THREE.MathUtils.lerp(
        wireRef.current.rotation.x,
        pointer.y * 0.3,
        0.05
      );
      wireRef.current.rotation.y = THREE.MathUtils.lerp(
        wireRef.current.rotation.y,
        pointer.x * 0.3,
        0.05
      );
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <group>
        {/* Main solid shield */}
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1.5, 4]} />
          <MeshDistortMaterial
            color="#6366f1"
            roughness={0.15}
            metalness={0.9}
            distort={0.3}
            speed={2}
          />
        </mesh>

        {/* Wireframe overlay */}
        <mesh ref={wireRef}>
          <icosahedronGeometry args={[1.5, 4]} />
          <meshBasicMaterial
            color="#06b6d4"
            wireframe
            transparent
            opacity={0.15}
          />
        </mesh>
      </group>
    </Float>
  );
}

/* ─────────────────────────────────────
   Floating Particles – Points cloud
   ───────────────────────────────────── */
function FloatingParticles() {
  const pointsRef = useRef();
  const count = 80;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.cbrt(Math.random());
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  const colors = useMemo(() => {
    const palette = [
      new THREE.Color("#6366f1"),
      new THREE.Color("#06b6d4"),
      new THREE.Color("#10b981"),
    ];
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return col;
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.04;
      pointsRef.current.rotation.x += delta * 0.015;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.04}
        sizeAttenuation
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  );
}

/* ─────────────────────────────────────
   Glow Rings – concentric torus rings
   ───────────────────────────────────── */
function GlowRings() {
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();

  const rings = useMemo(
    () => [
      { ref: ring1Ref, radius: 2.5, color: "#6366f1", opacity: 0.3, speedX: 0.3, speedY: 0.5 },
      { ref: ring2Ref, radius: 3.2, color: "#06b6d4", opacity: 0.25, speedX: -0.2, speedY: 0.4 },
      { ref: ring3Ref, radius: 4.0, color: "#10b981", opacity: 0.2, speedX: 0.15, speedY: -0.35 },
    ],
    []
  );

  useFrame((_, delta) => {
    rings.forEach(({ ref, speedX, speedY }) => {
      if (ref.current) {
        ref.current.rotation.x += delta * speedX;
        ref.current.rotation.y += delta * speedY;
      }
    });
  });

  return (
    <group>
      {rings.map(({ ref, radius, color, opacity }, i) => (
        <mesh ref={ref} key={i}>
          <torusGeometry args={[radius, 0.008, 16, 100]} />
          <meshBasicMaterial color={color} transparent opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}

/* ─────────────────────────────────────
   Scene3D – main exported component
   ───────────────────────────────────── */
export default function Scene3D() {
  return (
    <div className="w-full h-[500px] lg:h-[600px] relative">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: "transparent" }}
        dpr={[1, 2]}
        gl={{ alpha: true }}
      >
        <Suspense fallback={null}>
          <ShieldMesh />
          <FloatingParticles />
          <GlowRings />
          <Environment preset="night" />
          <Stars
            radius={50}
            depth={80}
            count={1000}
            factor={3}
            fade
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
