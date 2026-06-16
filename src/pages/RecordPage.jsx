import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { calcGestation, getWeightRange } from '../utils/gestation';
import Card from '../components/Card';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function RecordPage({ navigate }) {
  const { user } = useUser();
  const { weightRecords, fetalMovements, addWeightRecord } = useData();

  const [week, setWeek]         = useState(0);
  const [inputW, setInputW]     = useState('');
  const [rangeText, setRangeText] = useState('');
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (user?.lmp) setWeek(calcGestation(user.lmp).week);
  }, [user]);

  function checkRange(w) {
    if (!user?.lmp) return;
    const g     = calcGestation(user.lmp);
    const range = getWeightRange(22, g.week);
    const base  = user.baseWeight || 50;
    const gain  = w - base;
    if (gain > range.max)       setRangeText(`⚠️ 超出推荐上限 ${range.max}kg (增长${gain.toFixed(1)}kg)`);
    else if (gain < range.min)  setRangeText(`⚠️ 低于推荐下限 ${range.min}kg (增长${gain.toFixed(1)}kg)`);
    else                        setRangeText(`✅ 在推荐范围内 (${range.min}-${range.max}kg)`);
  }

  async function saveWeight() {
    const w = parseFloat(inputW);
    if (!w || w <= 0) { alert('请输入有效体重'); return; }
    setSaving(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await addWeightRecord({ date: today, weight: w, week });
      setInputW('');
      checkRange(w);
    } finally {
      setSaving(false);
    }
  }

  // 按日期排序
  const sortedRecords = [...weightRecords].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const sortedFetal   = [...fetalMovements].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const chartData = {
    labels: sortedRecords.map(r => `孕${r.week}周`),
    datasets: [{
      label: '体重(kg)', data: sortedRecords.map(r => r.weight),
      borderColor: '#F8B4B4', backgroundColor: 'rgba(248,180,180,0.1)',
      fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#F8B4B4'
    }]
  };
  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { min: Math.min(...sortedRecords.map(r => r.weight), 40) - 5 } }
  };

  return (
    <div>
      <Card title="录入体重">
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" placeholder="体重(kg)" value={inputW}
            onChange={e => { setInputW(e.target.value); checkRange(parseFloat(e.target.value)); }}
            style={{ flex: 1 }} step="0.1" />
          <button className="btn btn-primary" style={{ width: 80 }} onClick={saveWeight} disabled={saving}>
            {saving ? '…' : '记录'}
          </button>
        </div>
        {rangeText && (
          <div style={{ marginTop: 10, fontSize: 13, color: rangeText.startsWith('⚠️') ? '#D4A030' : '#7ECB7E' }}>
            {rangeText}
          </div>
        )}
      </Card>

      <Card title="体重增长曲线">
        {sortedRecords.length < 2
          ? <div className="empty">录入两次体重后显示曲线</div>
          : <div style={{ height: 280 }}><Line data={chartData} options={chartOptions} /></div>
        }
        {sortedRecords.length > 0 && (
          <div style={{ marginTop: 12, maxHeight: 200, overflowY: 'auto' }}>
            {[...sortedRecords].reverse().map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid #FFF0F0' }}>
                <span style={{ color: '#999' }}>{r.date}</span>
                <span style={{ color: '#F8B4B4' }}>孕{r.week}周</span>
                <span style={{ fontWeight: 500 }}>{r.weight} kg</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div onClick={() => navigate('fetal', { title: '胎动计数' })}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>💓 胎动计数</div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
              {week < 28 ? '28周后解锁' : '记录10次胎动时长'}
            </div>
          </div>
          <div style={{ color: '#CCC', fontSize: 20 }}>→</div>
        </div>
        {sortedFetal.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {sortedFetal.slice(0, 5).map((r, i) => (
              <div key={i} style={{ fontSize: 13, padding: '4px 0', color: r.abnormal ? '#E88080' : '#999' }}>
                {r.date} — {r.duration}分钟 {r.abnormal ? '⚠️' : '✓'}
              </div>
            ))}
          </div>
        )}
      </Card>
      <div className="safe-bottom" />
    </div>
  );
}
