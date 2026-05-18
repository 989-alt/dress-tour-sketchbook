import type { ReactElement } from 'react';
import type { BackType } from '../../types';

export interface BackDef {
  type: BackType;
  label: string;
  render(args: {
    topY: number;
    waistY: number;
    openDepth: number;
    idPrefix: string;
  }): ReactElement | null;
}
