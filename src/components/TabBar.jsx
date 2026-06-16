const tabs = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'checkin', label: '打卡', icon: '✅' },
  { key: 'record', label: '记录', icon: '📊' },
  { key: 'knowledge', label: '知识', icon: '📚' },
  { key: 'settings', label: '我的', icon: '👤' }
];

export default function TabBar({ active, onChange }) {
  return (
    <div style={{
      display: 'flex', background: '#FFF', borderTop: '1px solid #FFE0E0',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      flexShrink: 0
    }}>
      {tabs.map(t => (
        <div key={t.key} onClick={() => onChange(t.key)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '8px 0', cursor: 'pointer',
            color: active === t.key ? '#F8B4B4' : '#BBBBBB',
            fontSize: '12px', fontWeight: active === t.key ? 600 : 400,
            transition: 'color 0.2s'
          }}>
          <span style={{ fontSize: '24px', marginBottom: '2px' }}>{t.icon}</span>
          {t.label}
        </div>
      ))}
    </div>
  );
}
