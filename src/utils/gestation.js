/** 孕周计算工具 */

const GESTATION_DAYS = 280;

/** 根据末次月经算预产期 */
export function calcDueDate(lmp) {
  const d = new Date(lmp);
  d.setDate(d.getDate() + GESTATION_DAYS);
  return d;
}

/** 计算当前孕周信息 */
export function calcGestation(lmp) {
  const now = new Date();
  const lmpDate = new Date(lmp);
  const diffMs = now - lmpDate;
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays < 0) return { week: 0, day: 0, remainingDays: 280, trimester: 1, weekLabel: '尚未怀孕' };
  if (diffDays > GESTATION_DAYS) return { week: 40, day: 0, remainingDays: 0, trimester: 3, weekLabel: '已足月' };

  const week = Math.floor(diffDays / 7);
  const day = diffDays % 7;
  let trimester = 1;
  if (week >= 28) trimester = 3;
  else if (week >= 14) trimester = 2;

  return {
    week, day,
    totalDays: diffDays,
    remainingDays: GESTATION_DAYS - diffDays,
    trimester,
    weekLabel: `孕${week}周+${day}天`,
    dueDate: calcDueDate(lmp)
  };
}

/** 按孕周推荐营养品 */
export function getSupplementPlan(week) {
  const plan = ['folic_acid'];
  if (week >= 13) { plan.push('iron'); plan.push('calcium'); }
  if (week >= 20) plan.push('dha');
  return plan;
}

/** 胎动异常判定 */
export function checkFetalAbnormal(durationMinutes) {
  if (durationMinutes > 120) return 'danger';
  if (durationMinutes > 60) return 'warning';
  if (durationMinutes < 10) return 'warning';
  return 'normal';
}

/** 每周对应的宝宝大小（水果类比） */
const BABY_SIZE = [
  [4, '芝麻'], [5, '苹果籽'], [6, '小扁豆'], [7, '蓝莓'], [8, '覆盆子'],
  [9, '樱桃'], [10, '草莓'], [11, '无花果'], [12, '李子'], [13, '柠檬'],
  [14, '橙子'], [15, '苹果'], [16, '牛油果'], [17, '梨'], [18, '红薯'],
  [19, '芒果'], [20, '香蕉'], [21, '胡萝卜'], [22, '小南瓜'], [23, '大茄子'],
  [24, '玉米'], [25, '花菜'], [26, '卷心菜'], [27, '大白菜'], [28, '椰子'],
  [29, '小哈密瓜'], [30, '大哈密瓜'], [31, '菠萝'], [32, '大菠萝'], [33, '芹菜'],
  [34, '小西瓜'], [35, '蜂蜜瓜'], [36, '大西瓜'], [37, '冬瓜'], [38, '南瓜'],
  [39, '大南瓜'], [40, '小冬瓜']
];

export function getBabySize(week) {
  for (let i = BABY_SIZE.length - 1; i >= 0; i--) {
    if (week >= BABY_SIZE[i][0]) return BABY_SIZE[i][1];
  }
  return '小种子';
}

/** 体重增长推荐范围 */
export function getWeightRange(preBMI, week) {
  let base;
  if (preBMI < 18.5) base = { min: 12.5, max: 18 };
  else if (preBMI < 25) base = { min: 11.5, max: 16 };
  else if (preBMI < 30) base = { min: 7, max: 11.5 };
  else base = { min: 5, max: 9 };
  const ratio = Math.min(week / 40, 1);
  return { min: +(base.min * ratio).toFixed(1), max: +(base.max * ratio).toFixed(1) };
}
