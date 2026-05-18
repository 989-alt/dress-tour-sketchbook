import type { ReactElement } from 'react';
import type { EmbellishmentType, Region, Point } from '../../types';

export interface EmbellishmentDef {
  type: EmbellishmentType;
  label: string;
  render(args: {
    intensity: 1 | 2 | 3 | 4 | 5;
    region: Region;
    polygons: Point[][];
    color: string;
    extra?: Record<string, unknown>;
    idPrefix: string;
  }): ReactElement;
}
