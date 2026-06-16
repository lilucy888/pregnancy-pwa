/** 常量数据 */

export const CHECKUP_SCHEDULE = [
  { title: '早孕确认（B超）', week: 6 },
  { title: '建档 + 全面检查', week: 12 },
  { title: 'NT 检查', week: 12 },
  { title: '唐氏筛查', week: 16 },
  { title: '无创DNA（可选）', week: 16 },
  { title: '大排畸（四维）', week: 22 },
  { title: '糖耐量检查 OGTT', week: 26 },
  { title: '小排畸', week: 30 },
  { title: '胎心监护', week: 34 },
  { title: 'B族链球菌筛查', week: 36 },
  { title: '产前评估', week: 38 },
  { title: '足月待产', week: 39 }
];

const WEEKLY_DIET_TIPS = {
  '4': '本周开始补充叶酸，每天400μg',
  '8': '可能出现孕吐，少食多餐，吃苏打饼干缓解',
  '12': '可以开始补充DHA，促进宝宝大脑发育',
  '16': '多吃红肉补铁，搭配维C促进吸收',
  '20': '钙需求增加，每天喝牛奶+晒太阳',
  '24': '控制糖分摄入，为糖耐检查做准备',
  '28': '多吃高纤维食物，预防便秘',
  '32': '少量多餐，避免胃灼热',
  '36': '多喝水，注意胎动变化'
};

export function getWeeklyDietTip(week) {
  const key = String(week);
  if (WEEKLY_DIET_TIPS[key]) return WEEKLY_DIET_TIPS[key];
  if (week <= 12) return '均衡营养，确保叶酸摄入，远离烟酒生食';
  if (week <= 28) return '蛋白质+钙+铁是核心，每周吃1-2次深海鱼';
  return '控制体重增长，保持适度运动，为分娩做准备';
}

export const DIET_FORBIDDEN = [
  { category: '绝对避免', items: [
    { name: '酒精类饮品', reason: '可能导致胎儿酒精综合征，影响大脑发育', level: 'danger' },
    { name: '生鱼片/刺身', reason: '可能含寄生虫或细菌，引发感染', level: 'danger' },
    { name: '生肉/半熟肉', reason: '可能含弓形虫，导致胎儿畸形', level: 'danger' },
    { name: '未经巴氏消毒的奶制品', reason: '可能含李斯特菌，引发流产', level: 'danger' },
    { name: '生鸡蛋', reason: '可能含沙门氏菌，引发食物中毒', level: 'danger' },
    { name: '含汞高的鱼类（鲨鱼/旗鱼/方头鱼）', reason: '汞损害胎儿神经系统发育', level: 'danger' }
  ]},
  { category: '谨慎食用', items: [
    { name: '咖啡', reason: '咖啡因每日 <200mg（约1杯），过量增加流产风险', level: 'warning' },
    { name: '浓茶', reason: '含咖啡因+鞣酸，影响铁吸收', level: 'warning' },
    { name: '山楂', reason: '有兴奋子宫作用，可能诱发宫缩，孕早期慎食', level: 'warning' },
    { name: '螃蟹/甲鱼', reason: '性寒凉，可能引起宫缩不适，少量食用一般无碍', level: 'warning' },
    { name: '烧烤/油炸食品', reason: '高热量低营养，可能含致癌物，偶尔解馋即可', level: 'warning' },
    { name: '腌制食品', reason: '高盐含亚硝酸盐，增加高血压风险', level: 'warning' },
    { name: '荔枝/桂圆', reason: '糖分高+性温热，易上火，适量即可', level: 'warning' },
    { name: '薏米', reason: '有兴奋子宫作用，传统认为孕妇不宜', level: 'warning' }
  ]}
];

export const HOSPITAL_BAG = [
  { category: '妈妈用品', items: [
    '哺乳文胸（2-3件）', '产妇卫生巾（大号+中号）', '一次性内裤（10条）',
    '月子服/睡衣（2套）', '拖鞋+袜子', '洗漱用品（牙刷/毛巾/脸盆）',
    '吸奶器', '乳头霜', '水杯+吸管', '手机充电器+充电宝'
  ]},
  { category: '宝宝用品', items: [
    '新生儿衣服（3-4套）', '包被/襁褓（2条）', 'NB码纸尿裤（1包）',
    '婴儿湿巾+棉柔巾', '奶粉（小罐备用）+奶瓶', '婴儿帽子+小袜子'
  ]},
  { category: '证件类', items: [
    '夫妻双方身份证', '医保卡/社保卡', '产检档案/母子健康手册',
    '结婚证', '户口本', '银行卡/现金'
  ]}
];

export const SIBLING_TASKS = [
  '给弟弟/妹妹读一个小故事', '帮妈妈拿拖鞋', '摸摸妈妈的肚子说"你好"',
  '画一幅画送给未来的弟弟/妹妹', '帮妈妈递水杯', '和妈妈一起整理宝宝的小衣服',
  '唱一首歌给弟弟/妹妹听', '帮忙拿一片纸尿裤'
];

export const DAD_TASKS = [
  '给孕妈按按腰和腿', '陪着散散步（20-30分钟）', '准备一份水果/坚果加餐',
  '给宝宝讲个胎教故事', '帮孕妈涂妊娠纹霜', '做一顿营养餐',
  '陪孕妈去产检', '说一句暖心的话'
];
