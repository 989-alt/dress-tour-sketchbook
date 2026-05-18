import type { VeilLengthDef } from '../types';
import { veilBackPath, veilFrontPath, VeilShape } from './veilShape';

const BOTTOM_Y = 620;

export const waltz: VeilLengthDef = {
  type: 'waltz',
  label: '왈츠',
  render({ edge, layers, color, headTopY, chinY, shoulderLX, shoulderRX, idPrefix }) {
    const backPath = veilBackPath(headTopY, shoulderLX, shoulderRX, BOTTOM_Y);
    const back = (
      <VeilShape
        outlinePath={backPath}
        color={color}
        edge={edge}
        idPrefix={`${idPrefix}waltz-back-`}
        dataLayer="back"
      />
    );
    const front = layers === 2 ? (
      <VeilShape
        outlinePath={veilFrontPath(headTopY, chinY, shoulderLX, shoulderRX)}
        color={color}
        edge={edge}
        idPrefix={`${idPrefix}waltz-front-`}
        opacity={0.5}
        dataLayer="front"
      />
    ) : null;
    return { back, front };
  },
};
