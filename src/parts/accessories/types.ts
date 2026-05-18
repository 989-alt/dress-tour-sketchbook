import type { ReactElement } from 'react';
import type { AccessoryType } from '../../types';

export interface AccessoryDef {
  type: AccessoryType;
  label: string;
  render(args: {
    headTopX: number;
    headTopY: number;
    color: string;
    idPrefix: string;
  }): ReactElement | null;
}
