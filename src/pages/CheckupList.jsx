import { useEffect } from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/Card';

export default function CheckupList({ navigate }) {
  const { checkups, initCheckups, isReady } = useData();

  // 首次加载完成且没有记录时，初始化默认产检计划
  useEffect(() => {
    if (isReady) initCheckups();
  }, [isReady]);

  function openDetail(item) {
    // 传 _id（Firestore 文档 ID）
    navigate('checkupDetail', { title: item.title, id: item._id });
  }

  const sorted = [...checkups].sort((a, b) => (a.week || 0) - (b.week || 0));

  return (
    <div>
      <Card title="产检时间表">
        <div style={{ position: 'relative', paddingLeft: 20 }}>
          <div style={{ position: 'absolute', left: 6, top: 0, bottom: 0, width: 2, background: '#FFE0E0' }} />
          {sorted.map(c => (
            <div key={c._id} onClick={() => openDetail(c)}
              style={{ position: 'relative', padding: '12px 0 12px 24px', cursor: 'pointer', borderBottom: '1px solid #FFF5F5' }}>
              <div style={{ position: 'absolute', left: -14, top: 16, width: 14, height: 14, borderRadius: '50%',
                            background: c.status === 'done' ? '#7ECB7E' : c.status === 'skipped' ? '#E88080' : '#F5C96A',
                            border: '2px solid #FFF' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500, fontSize: 15 }}>{c.title}</span>
                <span style={{ fontSize: 13, color: '#F8B4B4' }}>孕{c.week}周</span>
              </div>
              <div style={{ marginTop: 4 }}>
                {c.status === 'done'    && <span className="tag tag-success">已完成</span>}
                {c.status === 'pending' && <span className="tag tag-warning">待检查</span>}
                {c.status === 'skipped' && <span className="tag tag-danger">已跳过</span>}
                {c.actualDate && <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>{c.actualDate}</span>}
              </div>
            </div>
          ))}
          {sorted.length === 0 && <div className="empty">正在加载产检计划…</div>}
        </div>
      </Card>
      <div className="safe-bottom" />
    </div>
  );
}
