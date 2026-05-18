import type { SleeveType } from '../../types';
import type { SleeveDef } from './types';
export type { SleeveDef, SleeveSidePaths } from './types';

import { sleeveless }   from './sleeveless';
import { cap }          from './cap';
import { short }        from './short';
import { threeQuarter } from './threeQuarter';
import { long }         from './long';
import { bishop }       from './bishop';
import { puff }         from './puff';
import { bell }         from './bell';
import { legOfMutton }  from './legOfMutton';
import { illusion }     from './illusion';

export const SLEEVES: Record<SleeveType, SleeveDef> = {
  sleeveless,
  cap,
  short,
  threeQuarter,
  long,
  bishop,
  puff,
  bell,
  legOfMutton,
  illusion,
};
