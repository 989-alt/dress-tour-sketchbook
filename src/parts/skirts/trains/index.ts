export type TrainKey = 'none' | 'sweep' | 'court' | 'chapel' | 'cathedral';

const TRAIN_DIMS: Record<Exclude<TrainKey, 'none'>, { h: number; w: number }> = {
  sweep:     { h:  30, w:  80 },
  court:     { h:  80, w: 120 },
  chapel:    { h: 150, w: 150 },
  cathedral: { h: 250, w: 200 },
};

export function trainPath(train: TrainKey, hemCenterX: number, hemCenterY: number): string {
  if (train === 'none') return '';
  const { h, w } = TRAIN_DIMS[train];
  const hw = w / 2;
  return (
    `M ${hemCenterX} ${hemCenterY} ` +
    `C ${hemCenterX - hw} ${hemCenterY + h * 0.4} ${hemCenterX - hw * 0.6} ${hemCenterY + h} ${hemCenterX} ${hemCenterY + h} ` +
    `C ${hemCenterX + hw * 0.6} ${hemCenterY + h} ${hemCenterX + hw} ${hemCenterY + h * 0.4} ${hemCenterX} ${hemCenterY} Z`
  );
}
