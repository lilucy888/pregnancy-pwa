import { useState } from 'react';
import { DIET_FORBIDDEN } from '../utils/constants';
import Card from '../components/Card';

export default function DietPage() {
  const [keyword, setKeyword] = useState('');

  const filtered = DIET_FORBIDDEN.map(cat => ({
    ...cat,
    items: cat.items.filter(f => !keyword || f.name.includes(keyword) || f.reason.includes(keyword))
  })).filter(cat => cat.items.length > 0);

  return (
    <div>
      <div style={{ padding: '12px 16px' }}>
        <input type="search" value={keyword} onChange={e => setKeyword(e.target.value)}
          placeholder="🔍  搜索食物名称..." style={{ borderRadius: 24, padding: '12px 20px' }} />
      </div>

      {filtered.map(cat => (
        <Card key={cat.category} title={cat.category}>
          {cat.items.map(food => (
            <div key={food.name} style={{ padding: '10px 0', borderBottom: '1px solid #FFF0F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 500, fontSize: 15 }}>{food.name}</span>
                <span className={`tag ${food.level === 'danger' ? 'tag-danger' : 'tag-warning'}`}>
                  {food.level === 'danger' ? '🚫 禁止' : '⚠️ 慎食'}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>{food.reason}</div>
            </div>
          ))}
        </Card>
      ))}

      {filtered.length === 0 && keyword && (
        <div className="empty">未找到「{keyword}」相关信息</div>
      )}
      <div className="safe-bottom" />
    </div>
  );
}
