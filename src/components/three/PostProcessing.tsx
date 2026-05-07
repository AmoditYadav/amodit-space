'use client';

import {
  Bloom,
  EffectComposer,
  Vignette,
  ChromaticAberration,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';

interface PostProcessingProps {
  enabled?: boolean;
}

/**
 * Post-processing pipeline for cinematic visual polish.
 * - Selective bloom: picks up HDR sun + planet atmospheres
 * - Vignette: darkens edges for cinematic framing
 * - Chromatic aberration: very subtle color fringing
 */
export function PostProcessing({ enabled = true }: PostProcessingProps) {
  if (!enabled) return null;

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.7}
        luminanceSmoothing={0.4}
        mipmapBlur
      />
      <Vignette
        offset={0.3}
        darkness={0.6}
        blendFunction={BlendFunction.NORMAL}
      />
      <ChromaticAberration
        offset={new Vector2(0.0008, 0.0008)}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  );
}
