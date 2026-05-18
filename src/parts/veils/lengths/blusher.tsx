import type { VeilLengthDef } from '../types';
import { veilFrontPath } from './veilShape.helpers';
import { VeilShape } from './veilShape';

export const blusher: VeilLengthDef = {
  type: 'blusher',
  label: '블러셔',
  render({ edge, color, headTopY, chinY, shoulderLX, shoulderRX, idPrefix }) {
    const frontPath = veilFrontPath(headTopY, chinY, shoulderLX, shoulderRX);
    const front = (
      <VeilShape
        outlinePath={frontPath}
        color={color}
        edge={edge}
        idPrefix={`${idPrefix}blusher-front-`}
        opacity={0.5}
        dataLayer="front"
      />
    );
    return { back: null, front };
  },
};
