import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { calcGestation, checkFetalAbnormal } from '../utils/gestation';
import Card from '../components/Card';

export default function FetalPage() {
  const { user }   = useUser();
  const { fetalMovements, addFetalMovement } = useData();
  const [week, setWeek]           = useState(0);
  const [running, setRunning]     = useState(false);
  const [count, setCount]         = useState(0);
  const [elapsed, setElapsed]     = useState(0);
  const [abnormalMsg, setAbnormalMsg] = useState('');
  const startRef  = useRef(null);
  const timerRef  = useRef(null);

  useEffect(() => {
    if (user?.lmp) setWeek(calcGestation(user.lmp).week);
  }, [user]);

  function start() {
    setRunning(true); setCount(0); setElapsed(0); setAbnormalMsg('');
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const e = Math.floor((Date.now() - startRef.current) / 1000);
      setElapsed(e);
      if (e > 3600) setAbnormalMsg('⚠️ 超过1小时，如仍未感到10次胎动，请联系医生');
      if (e > 7200) setAbnormalMsg('⚠️ 超过2小时，请立即就医！');
    }, 1000);
  }

  function tap() {
    if (!running) return;
    const c = count + 1;
    setCount(c);
    if (c >= 10) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  async function finish() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setRunning(false);
    if (count < 10) return;
    const duration = Math.round((Date.now() - startRef.current) / 60000);
    const status   = checkFetalAbnormal(duration);
    const abnormal = status !== 'normal';
    const today    = new Date().toISOString().slice(0, 10);
    await addFetalMovement({
      date: today,
      startTime: new Date(startRef.current).toISOString(),
      endTime: new Date().toISOString(),
      duration, count: 10, abnormal,
    });
    if (abnormal) setAbnormalMsg(`⚠️ 10次胎动耗时${duration}分钟，${status === 'danger' ? '请尽快就医！' : '请注意观察'}`);
    else          setAbnormalMsg(`✅ 完成：10次胎动耗时${duration}分钟，正常范围`);
  }

  const fmtElapsed = () => {
    const m = Math.floor(elapsed / 60), s = elapsed % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const records = [...fetalMovements].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  if (week < 28) {
    return (
      <Card style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 64 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 16 }}>胎动计数功能将于28周后解锁</div>
        <div style={{ color: '#888', marginTop: 8, fontSize: 14 }}>一般从孕28周开始规律监测胎动</div>
      </Card>
    );
  }

  return (
    <div>
      <Card title="胎动计时器">
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ fontSize: 60, fontWeight: 700, color: '#F8B4B4' }}>{count}/10</div>
          <div style={{ fontSize: 14, color: '#999' }}>记录10次胎动</div>
          {running && <div style={{ fontSize: 28, fontWeight: 600, margin: '8px 0', color: '#666' }}>{fmtElapsed()}</div>}
        </div>
        {!running
          ? <button className="btn btn-primary" onClick={start} style={{ background: '#FFE0E0', color: '#F8B4B4', fontSize: 20 }}>开始计时</button>
          : count < 10
            ? <button className="btn btn-primary" onClick={tap} style={{ fontSize: 18 }}>记录一次胎动</button>
            : <button className="btn btn-primary" onClick={finish} style={{ background: '#E88080' }}>完成记录</button>
        }
        {abnormalMsg && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 10, textAlign: 'center', fontSize: 14,
                        background: abnormalMsg.startsWith('✅') ? '#F0FFF0' : '#FFF0F0',
                        color: abnormalMsg.startsWith('✅') ? '#5AAA5A' : '#E88080' }}>
            {abnormalMsg}
          </div>
        )}
      </Card>

      <Card title="历史记录">
        {records.length === 0
          ? <div className="empty">暂无记录</div>
          : records.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #FFF0F0', fontSize: 13 }}>
              <span style={{ color: '#999' }}>{r.date}</span>
              <span>{r.duration} 分钟</span>
              <span style={{ color: r.abnormal ? '#E88080' : '#7ECB7E' }}>{r.abnormal ? '⚠ 异常' : '✓ 正常'}</span>
            </div>
          ))
        }
      </Card>
      <div className="safe-bottom" />
    </div>
  );
}
