import type { ReactElement } from 'react';
import type { SkirtTexture } from '../../types';

export interface SkirtTextureDef {
  type: SkirtTexture;
  label: string;
  render(args: {
    topY: number;
    bottomY: number;
    leftX: number;
    rightX: number;
    layers?: number;
    color: string;
    idPrefix: string;
  }): ReactElement | null;
}
