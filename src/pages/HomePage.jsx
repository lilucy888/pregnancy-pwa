import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { calcGestation, getSupplementPlan, getBabySize } from '../utils/gestation';
import { getWeeklyDietTip } from '../utils/constants';
import Card from '../components/Card';

export default function HomePage({ navigate }) {
  const { user } = useUser();
  const { checkups, getDailyTaskByDate } = useData();

  if (!user || !user.lmp) {
    return (
      <Card style={{ marginTop: 60, textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🤰</div>
        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>欢迎来到二胎孕妈助手</div>
        <div style={{ color: '#888', marginBottom: 24 }}>
          请先在<b>「我的」</b>页面设置末次月经日期，开启孕期旅程
        </div>
      </Card>
    );
  }

  // 直接计算，不再依赖 useEffect + state，避免渲染时拿到空值
  const gest = calcGestation(user.lmp);

  const progress   = Math.min(gest.week / 40 * 100, 100);
  const today      = new Date();
  const todayStr   = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const babySize   = getBabySize(gest.week);
  const dietTip    = getWeeklyDietTip(gest.week);

  const plan       = getSupplementPlan(gest.week);
  const labelMap   = { folic_acid: '叶酸', iron: '铁剂', calcium: '钙片', dha: 'DHA' };
  const doneMap    = getDailyTaskByDate(todayStr) || {};

  const pending    = checkups.filter(c => c.status === 'pending').sort((a, b) => a.week - b.week);
  const nextCheckup = pending[0];

  return (
    <div>
      {/* 孕周仪表盘 */}
      <Card style={{ background: 'linear-gradient(135deg, #FFF5F5, #FFF0F0)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#F8B4B4', marginBottom: 4 }}>
            {gest.weekLabel}
          </div>
          <div style={{ fontSize: 13, color: '#999', marginBottom: 16 }}>预产期 {user.dueDate}</div>
          <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto 12px' }}>
            <svg viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="100" cy="100" r="90" fill="none" stroke="#FFE0E0" strokeWidth="14" />
              <circle cx="100" cy="100" r="90" fill="none" stroke="#F8B4B4" strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 44, fontWeight: 700, color: '#F8B4B4' }}>{gest.week}</div>
              <div style={{ fontSize: 14, color: '#999' }}>周</div>
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 600, color: '#F8B4B4' }}>
            {gest.remainingDays > 0 ? `距预产期 ${gest.remainingDays} 天` : '👶 已足月！'}
          </div>
          <div style={{ marginTop: 8, fontSize: 14, color: '#999' }}>
            宝宝现在像一颗 <b style={{ color: '#F8B4B4' }}>{babySize}</b> 的大小
          </div>
        </div>
      </Card>

      {/* 今日待办 */}
      <Card title="今日待办">
        {plan.map(key => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #FFF0F0' }}>
            <span style={{ fontSize: 15 }}>{labelMap[key] || key}</span>
            <span style={{ fontSize: 13, color: doneMap[key] ? '#7ECB7E' : '#F5C96A' }}>
              {doneMap[key] ? '✅ 已打卡' : '⏳ 未打卡'}
            </span>
          </div>
        ))}
        {nextCheckup && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #FFF0F0' }}>
            <span style={{ fontSize: 15 }}>下次产检：{nextCheckup.title}</span>
            <span style={{ fontSize: 13, color: '#F8B4B4' }}>孕{nextCheckup.week}周</span>
          </div>
        )}
        {plan.length === 0 && !nextCheckup && <div className="empty">今天暂无待办，放松一下吧</div>}
      </Card>

      {/* 饮食建议 */}
      <Card title="本周饮食建议">
        <div style={{ background: '#FFF8F0', borderRadius: 12, padding: 16, fontSize: 15, color: '#555', lineHeight: 1.7 }}>
          {dietTip}
        </div>
      </Card>

      {/* 快捷入口 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '0 16px' }}>
        {[
          { label: '每日打卡', emoji: '💊', tab: 'checkin' },
          { label: '产检管理', emoji: '🏥', page: 'checkupList', title: '产检管理' },
          { label: '饮食忌口', emoji: '🍽️', page: 'diet', title: '饮食忌口速查' },
          { label: '胎动计数', emoji: '💓', page: 'fetal', title: '胎动计数' },
          { label: '待产包',   emoji: '🎒', page: 'hospitalBag', title: '待产包清单' },
          { label: '体重曲线', emoji: '📈', tab: 'record' },
        ].map(item => (
          <div key={item.label}
            onClick={() => { if (item.tab) window.__setTab?.(item.tab); else navigate(item.page, { title: item.title }); }}
            style={{ background: '#FFF', borderRadius: 16, padding: '16px 8px', textAlign: 'center',
                     boxShadow: '0 2px 8px rgba(248,180,180,0.1)', cursor: 'pointer', transition: 'transform 0.1s' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{item.emoji}</div>
            <div style={{ fontSize: 13, color: '#555' }}>{item.label}</div>
          </div>
        ))}
      </div>
      <div className="safe-bottom" />
    </div>
  );
}
