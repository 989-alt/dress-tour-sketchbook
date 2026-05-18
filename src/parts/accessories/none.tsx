import type { AccessoryDef } from './types';

export const none: AccessoryDef = {
  type: 'none',
  label: '없음',
  render() {
    return null;
  },
};
