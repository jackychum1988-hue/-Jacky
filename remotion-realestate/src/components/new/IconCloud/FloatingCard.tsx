import '@react-three/fiber';
import React from 'react';
import type { Texture } from 'three';

interface FloatingCardProps {
  texture: Texture | null;
  position: [number, number, number];
  rotationY: number;
  rotationX?: number;
  width: number;
  height: number;
  opacity: number;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  texture,
  position,
  rotationY,
  rotationX = 0,
  width,
  height,
  opacity,
}) => {
  if (!texture) return null;

  return (
    <mesh
      position={position}
      rotation={[rotationX, rotationY, 0]}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        opacity={opacity}
        side={2}
        depthWrite={false}
        depthTest={true}
      />
    </mesh>
  );
};
