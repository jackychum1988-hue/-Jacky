// remotion-realestate/src/scenes/IconCloudScene.tsx
import React, { useEffect, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { continueRender, delayRender } from 'remotion';
import { CloudSystem } from '../components/new/IconCloud/CloudSystem';
import { createCardTexture } from '../components/new/IconCloud/CardTexture';
import { PROJECTS } from '../components/new/IconCloud/projectData';
import type { Texture } from 'three';

export const IconCloudScene: React.FC = () => {
  const [textures, setTextures] = useState<Map<number, Texture> | null>(null);
  const [handle] = useState(() => delayRender('Loading card textures for icon cloud'));

  useEffect(() => {
    const loadTextures = async () => {
      const map = new Map<number, Texture>();
      for (const project of PROJECTS) {
        try {
          const tex = await createCardTexture({
            name: project.name,
            district: project.district,
            tag: project.tag,
            imageUrl: project.imageUrl,
          });
          map.set(project.id, tex);
        } catch {
          // Even if image loading fails, create texture with fallback
          try {
            const tex = await createCardTexture({
              name: project.name,
              district: project.district,
              tag: project.tag,
              imageUrl: '',
            });
            map.set(project.id, tex);
          } catch {
            // Skip this card if even fallback fails
          }
        }
      }
      setTextures(map);
      continueRender(handle);
    };
    loadTextures();
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
        position: [0, 0.8, 8.2],
        near: 0.1,
        far: 50,
      }}
      style={{
        background: 'transparent',
      }}
    >
      {/* 柔和环境光 */}
      <ambientLight intensity={0.7} color="#ffffff" />

      {/* 主方向光（暖白） */}
      <directionalLight position={[5, 5, 5]} intensity={0.3} color="#ffffff" />

      {/* 补光（淡蓝冷调） */}
      <directionalLight position={[-3, -2, -3]} intensity={0.15} color="#c8ddf0" />

      {/* 三层卡片轨道 */}
      <CloudSystem textures={textures} />

      {/* 中心淡光晕（装饰性柔光） */}
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[3.0, 3.0]} />
        <meshBasicMaterial
          color="#e8f0f8"
          transparent={true}
          opacity={0.05}
          side={2}
          depthWrite={false}
        />
      </mesh>
    </ThreeCanvas>
  );
};
