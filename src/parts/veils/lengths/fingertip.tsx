import type { VeilLengthDef } from '../types';
import { veilBackPath, veilFrontPath, VeilShape } from './veilShape';

const BOTTOM_Y = 480;

export const fingertip: VeilLengthDef = {
  type: 'fingertip',
  label: '핑거팁',
  render({ edge, layers, color, headTopY, chinY, shoulderLX, shoulderRX, idPrefix }) {
    const backPath = veilBackPath(headTopY, shoulderLX, shoulderRX, BOTTOM_Y);
    const back = (
      <VeilShape
        outlinePath={backPath}
        color={color}
        edge={edge}
        idPrefix={`${idPrefix}fingertip-back-`}
        dataLayer="back"
      />
    );
    const front = layers === 2 ? (
      <VeilShape
        outlinePath={veilFrontPath(headTopY, chinY, shoulderLX, shoulderRX)}
        color={color}
        edge={edge}
        idPrefix={`${idPrefix}fingertip-front-`}
        opacity={0.5}
        dataLayer="front"
      />
    ) : null;
    return { back, front };
  },
};
