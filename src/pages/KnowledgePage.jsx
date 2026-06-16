import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { calcGestation } from '../utils/gestation';
import { SIBLING_TASKS, DAD_TASKS } from '../utils/constants';
import Card from '../components/Card';

export default function KnowledgePage({ navigate }) {
  const { user } = useUser();
  const [sibTask, setSibTask] = useState('');
  const [dadTask, setDadTask] = useState('');
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    pickTasks();
    if (user?.lmp) {
      const g = calcGestation(user.lmp);
      setMilestones([
        { w: 4, d: '确认怀孕，小生命开始了' }, { w: 8, d: '第一次B超，看到心跳' },
        { w: 12, d: '建档+NT检查通过' }, { w: 16, d: '可能感受到第一次胎动' },
        { w: 22, d: '大排畸检查' }, { w: 28, d: '进入孕晚期，开始数胎动' },
        { w: 37, d: '足月！随时可能发动' }, { w: 40, d: '预产期，期待见面！' }
      ].map(m => ({ ...m, reached: g.week >= m.w })));
    }
  }, [user]);

  function pickTasks() {
    setSibTask(SIBLING_TASKS[Math.floor(Math.random() * SIBLING_TASKS.length)]);
    setDadTask(DAD_TASKS[Math.floor(Math.random() * DAD_TASKS.length)]);
  }

  return (
    <div>
      <Card title="👶 大宝互动任务">
        <div style={{ background: '#FFF5F5', borderRadius: 14, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>今日任务</div>
          <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 16 }}>{sibTask}</div>
          <button className="btn btn-outline btn-small" onClick={pickTasks}>换个任务</button>
        </div>
      </Card>

      <Card title="🫄 准爸爸今日关怀">
        <div style={{ background: '#F5F5FF', borderRadius: 14, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>给准爸爸</div>
          <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 16 }}>{dadTask}</div>
          <button className="btn btn-outline btn-small" onClick={pickTasks}>换个任务</button>
        </div>
      </Card>

      <Card title="孕期里程碑">
        {milestones.map(m => (
          <div key={m.w} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', fontSize: 14, color: m.reached ? '#333' : '#BBB' }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%', marginRight: 12,
              background: m.reached ? '#7ECB7E' : '#FFE0E0', flexShrink: 0
            }} />
            <span>孕{m.w}周：{m.d}</span>
            {m.reached && <span style={{ marginLeft: 'auto', color: '#7ECB7E' }}>✓</span>}
          </div>
        ))}
      </Card>

      <Card title="快捷工具">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: '饮食忌口速查', emoji: '🍽️', page: 'diet', title: '饮食忌口速查' },
            { label: '待产包清单', emoji: '🎒', page: 'hospitalBag', title: '待产包清单' }
          ].map(item => (
            <div key={item.label} onClick={() => navigate(item.page, { title: item.title })}
              style={{ background: '#FFFBFB', border: '1px solid #FFE8E8', borderRadius: 14, padding: 16, textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{item.emoji}</div>
              <div style={{ fontSize: 13, color: '#555' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </Card>
      <div className="safe-bottom" />
    </div>
  );
}
