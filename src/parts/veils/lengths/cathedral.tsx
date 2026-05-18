import type { VeilLengthDef } from '../types';
import { veilBackPath, veilFrontPath } from './veilShape.helpers';
import { VeilShape } from './veilShape';

const BOTTOM_Y = 850;

export const cathedral: VeilLengthDef = {
  type: 'cathedral',
  label: '캐서드럴',
  render({ edge, layers, color, headTopY, chinY, shoulderLX, shoulderRX, idPrefix }) {
    const backPath = veilBackPath(headTopY, shoulderLX, shoulderRX, BOTTOM_Y);
    const back = (
      <VeilShape
        outlinePath={backPath}
        color={color}
        edge={edge}
        idPrefix={`${idPrefix}cathedral-back-`}
        dataLayer="back"
      />
    );
    const front = layers === 2 ? (
      <VeilShape
        outlinePath={veilFrontPath(headTopY, chinY, shoulderLX, shoulderRX)}
        color={color}
        edge={edge}
        idPrefix={`${idPrefix}cathedral-front-`}
        opacity={0.5}
        dataLayer="front"
      />
    ) : null;
    return { back, front };
  },
};
