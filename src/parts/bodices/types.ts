import type { ReactElement } from 'react';
import type { BodiceStructure, WaistAccent } from '../../types';

export interface BodiceContext {
  topY: number;
  waistY: number;
  leftX: number;
  rightX: number;
  shoulderLX: number;
  shoulderRX: number;
}

export interface BodiceStructureDef {
  type: BodiceStructure;
  label: string;
  render(ctx: BodiceContext, color: string, fabricFill: string): ReactElement | null;
}

export interface AccentContext {
  waistY: number;
  leftX: number;
  rightX: number;
  centerX: number;
  accentColor: string;
}

export interface WaistAccentDef {
  type: WaistAccent;
  label: string;
  render(ctx: AccentContext): ReactElement | null;
}
