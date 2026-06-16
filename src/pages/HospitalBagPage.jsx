import { useEffect } from 'react';
import { useData } from '../context/DataContext';
import { HOSPITAL_BAG } from '../utils/constants';
import Card from '../components/Card';

export default function HospitalBagPage() {
  const { hospitalBagItems, initHospitalBag, updateHospitalBagItem, isReady } = useData();

  useEffect(() => {
    if (isReady) initHospitalBag();
  }, [isReady]);

  async function toggle(item) {
    await updateHospitalBagItem(item.id, { checked: !item.checked });
  }

  const groups = HOSPITAL_BAG.map(cat => ({
    category: cat.category,
    its: hospitalBagItems.filter(i => i.category === cat.category),
  }));

  const checked = hospitalBagItems.filter(i => i.checked).length;
  const total   = hospitalBagItems.length;
  const pct     = total > 0 ? Math.round(checked / total * 100) : 0;

  return (
    <div>
      {groups.map(g => (
        <Card key={g.category} title={`${g.category}（${g.its.filter(i => i.checked).length}/${g.its.length}）`}>
          {g.its.map(item => (
            <div key={item.id} onClick={() => toggle(item)}
              style={{ display: 'flex', alignItems: 'center', padding: '10px 0', cursor: 'pointer', borderBottom: '1px solid #FFF5F5' }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6, border: '2px solid #FFD0D0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginRight: 12, flexShrink: 0,
                background: item.checked ? '#F8B4B4' : '#FFF',
                color: item.checked ? '#FFF' : 'transparent',
                transition: 'all 0.2s'
              }}>{item.checked ? '✓' : ''}</div>
              <span style={{ fontSize: 14, color: item.checked ? '#CCC' : '#333', textDecoration: item.checked ? 'line-through' : 'none' }}>
                {item.name}
              </span>
            </div>
          ))}
        </Card>
      ))}

      <Card>
        <div style={{ textAlign: 'center', fontSize: 14, color: '#999', marginBottom: 8 }}>
          准备进度：{checked}/{total} 项
        </div>
        <div style={{ height: 10, background: '#FFE8E8', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #F8B4B4, #F0A0A0)', borderRadius: 5, transition: 'width 0.3s' }} />
        </div>
      </Card>
      <div className="safe-bottom" />
    </div>
  );
}
