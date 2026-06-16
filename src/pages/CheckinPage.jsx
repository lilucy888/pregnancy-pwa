import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { calcGestation, getSupplementPlan } from '../utils/gestation';
import Card from '../components/Card';

export default function CheckinPage() {
  const { user } = useUser();
  const { dailyTasks, saveDailyTask, getDailyTaskByDate } = useData();
  const [week, setWeek]               = useState(0);
  const [supps, setSupps]             = useState([]);
  const [dateOverride, setDateOverride] = useState('');
  const [saving, setSaving]           = useState(false);

  const labelMap = { folic_acid: '叶酸', iron: '铁剂', calcium: '钙片', dha: 'DHA' };
  const todayStr = dateOverride || new Date().toISOString().slice(0, 10);

  // 当孕周/日期/dailyTasks 变化时重新加载打卡状态
  useEffect(() => {
    if (!user?.lmp) return;
    const g = calcGestation(user.lmp);
    setWeek(g.week);
    const plan   = getSupplementPlan(g.week);
    const record = getDailyTaskByDate(todayStr) || {};
    setSupps(plan.map(k => ({ key: k, label: labelMap[k], done: !!record[k] })));
  }, [user, todayStr, dailyTasks]); // dailyTasks 变化（另一台手机打卡）也会触发

  function toggle(key) {
    setSupps(prev => prev.map(s => s.key === key ? { ...s, done: !s.done } : s));
  }

  async function save() {
    setSaving(true);
    try {
      const record = { date: todayStr };
      supps.forEach(s => { record[s.key] = s.done; });
      await saveDailyTask(record);
      alert('✅ 打卡保存成功！');
    } finally {
      setSaving(false);
    }
  }

  // 历史记录（直接用 context 里的 dailyTasks，实时同步）
  const history = [...dailyTasks].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);

  return (
    <div>
      <Card title="每日营养补充">
        <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 13, color: '#F8B4B4', background: '#FFF5F5', borderRadius: 20, padding: '6px 16px', display: 'inline-block' }}>
          孕{week}周 · {todayStr}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {supps.map(s => (
            <div key={s.key} onClick={() => toggle(s.key)}
              style={{ padding: 18, borderRadius: 14, textAlign: 'center', cursor: 'pointer',
                       border: s.done ? '2px solid #C8E8C8' : '2px solid #FFE0E0',
                       background: s.done ? '#F0FFF0' : '#FFFBFB', transition: 'all 0.2s' }}>
              <div style={{ fontSize: 32 }}>{s.done ? '✅' : '○'}</div>
              <div style={{ fontSize: 15, fontWeight: 500, marginTop: 6 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: s.done ? '#7ECB7E' : '#CCC', marginTop: 4 }}>
                {s.done ? '已完成' : '点击打卡'}
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? '保存中…' : '保存打卡'}
        </button>
      </Card>

      <Card title="补打卡">
        <input type="date" value={dateOverride} onChange={e => setDateOverride(e.target.value)}
          max={new Date().toISOString().slice(0, 10)} style={{ marginBottom: 8 }} />
      </Card>

      <Card title="历史记录">
        {history.length === 0
          ? <div className="empty">暂无记录</div>
          : history.map(h => (
            <div key={h.date} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #FFF0F0', fontSize: 14 }}>
              <span>{h.date}</span>
              <span style={{ color: '#F8B4B4' }}>
                {['folic_acid','iron','calcium','dha'].filter(k => h[k]).map(k => labelMap[k]).join(' · ') || '未打卡'}
              </span>
            </div>
          ))
        }
      </Card>
      <div className="safe-bottom" />
    </div>
  );
}
