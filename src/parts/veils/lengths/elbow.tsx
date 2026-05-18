import type { VeilLengthDef } from '../types';
import { veilBackPath, veilFrontPath } from './veilShape.helpers';
import { VeilShape } from './veilShape';

const BOTTOM_Y = 250;

export const elbow: VeilLengthDef = {
  type: 'elbow',
  label: '엘보우',
  render({ edge, layers, color, headTopY, chinY, shoulderLX, shoulderRX, idPrefix }) {
    const backPath = veilBackPath(headTopY, shoulderLX, shoulderRX, BOTTOM_Y);
    const back = (
      <VeilShape
        outlinePath={backPath}
        color={color}
        edge={edge}
        idPrefix={`${idPrefix}elbow-back-`}
        dataLayer="back"
      />
    );
    const front = layers === 2 ? (
      <VeilShape
        outlinePath={veilFrontPath(headTopY, chinY, shoulderLX, shoulderRX)}
        color={color}
        edge={edge}
        idPrefix={`${idPrefix}elbow-front-`}
        opacity={0.5}
        dataLayer="front"
      />
    ) : null;
    return { back, front };
  },
};
