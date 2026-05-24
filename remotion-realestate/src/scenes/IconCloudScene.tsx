// remotion-realestate/src/scenes/IconCloudScene.tsx
import React, { useEffect, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { continueRender, delayRender } from 'remotion';
import { CloudSystem } from '../components/new/IconCloud/CloudSystem';
import { createBadgeTexture } from '../components/new/IconCloud/CardTexture';
import { PROJECTS } from '../components/new/IconCloud/projectData';
import type { Texture } from 'three';

export const IconCloudScene: React.FC = () => {
  const [textures, setTextures] = useState<Map<number, Texture> | null>(null);
  const [handle] = useState(() => delayRender('Loading badge textures'));

  useEffect(() => {
    const map = new Map<number, Texture>();
    for (const project of PROJECTS) {
      const tex = createBadgeTexture({
        name: project.name,
        district: project.district,
      });
      map.set(project.id, tex);
    }
    setTextures(map);
    continueRender(handle);
  }, [handle]);

  if (!textures) {
    return null;
  }

  return (
    <ThreeCanvas
      width={2048}
      height={2048}
      gl={{
        alpha: true,
        premultipliedAlpha: true,
        antialias: true,
      }}
      camera={{
        fov: 50,
        position: [0, 0.6, 7.5],
        near: 0.1,
        far: 50,
      }}
      style={{
        background: 'transparent',
      }}
    >
      <ambientLight intensity={0.8} color="#ffffff" />
      <directionalLight position={[5, 5, 5]} intensity={0.25} color="#ffffff" />
      <directionalLight position={[-3, -2, -3]} intensity={0.12} color="#c8ddf0" />

      <CloudSystem textures={textures} />

      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[3.0, 3.0]} />
        <meshBasicMaterial
          color="#e8f0f8"
          transparent={true}
          opacity={0.04}
          side={2}
          depthWrite={false}
        />
      </mesh>
    </ThreeCanvas>
  );
};
