import type { ReactElement } from 'react';
import type { FabricType, ColorEnum } from '../../types';

export interface FabricDef {
  type: FabricType;
  label: string; // Korean
  /**
   * Returns one or more SVG <defs> elements (linearGradient or pattern) for a
   * given base color. The returned ReactElement is placed inside <defs>.
   * The def id MUST be `${idPrefix}fabric-${type}-${color}`.
   */
  renderDef(args: { idPrefix: string; color: ColorEnum; colorHex: string }): ReactElement;
}
