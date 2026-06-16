import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import Card from '../components/Card';

export default function SettingsPage() {
  const { user, updateUser } = useUser();
  const { familyCode, setFamilyCode, appSettings, saveAppSettings } = useData();

  const [codeInput, setCodeInput]           = useState('');
  const [lmp, setLmp]                       = useState('');
  const [baseWeight, setBaseWeight]         = useState('');
  const [childCount, setChildCount]         = useState('2');
  const [reminderOn, setReminderOn]         = useState(false);
  const [checkupReminder, setCheckupReminder] = useState(false);
  const [checkupAdvance, setCheckupAdvance] = useState('1');
  const [saving, setSaving]                 = useState(false);

  useEffect(() => {
    if (user) {
      setLmp(user.lmp || '');
      setBaseWeight(user.baseWeight || '');
      setChildCount(String(user.childCount || 2));
    }
    setReminderOn(appSettings.reminderOn || false);
    setCheckupReminder(appSettings.checkupReminder || false);
    setCheckupAdvance(appSettings.checkupAdvance || '1');
  }, [user, appSettings]);

  // ── 家庭码确认 ──
  function confirmCode() {
    if (codeInput.trim().length < 2) {
      alert('家庭码至少 2 个字符，比如「宝宝2026」');
      return;
    }
    setFamilyCode(codeInput.trim());
  }

  // ── 保存设置 ──
  async function save() {
    if (!lmp) { alert('请选择末次月经日期'); return; }
    setSaving(true);
    try {
      await updateUser({ lmp, baseWeight: parseFloat(baseWeight) || 0, childCount: parseInt(childCount) });
      await saveAppSettings({ reminderOn, checkupReminder, checkupAdvance });
      if (reminderOn && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      alert('✅ 保存成功！');
    } finally {
      setSaving(false);
    }
  }

  // ── 未绑定家庭码：引导输入 ──
  if (!familyCode) {
    return (
      <div>
        <div style={{ textAlign: 'center', padding: '40px 0 20px' }}>
          <div style={{ fontSize: 56 }}>👨‍👩‍👧</div>
          <div style={{ fontSize: 20, fontWeight: 600, marginTop: 12 }}>设置家庭码</div>
          <div style={{ fontSize: 14, color: '#999', marginTop: 8, lineHeight: 1.7, padding: '0 24px' }}>
            家庭码让你和老婆共享同一份数据<br />
            两台手机输入<b style={{ color: '#F8B4B4' }}>相同的家庭码</b>即可同步
          </div>
        </div>
        <Card>
          <div className="form-group">
            <label className="form-label">家庭码（随便起一个，记住就行）</label>
            <input
              placeholder="例如：宝宝2026 / baby2026 / 我家小猪"
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmCode()}
            />
          </div>
          <button className="btn btn-primary" onClick={confirmCode}>确认并开始使用</button>
          <div style={{ marginTop: 12, fontSize: 13, color: '#BBB', textAlign: 'center' }}>
            ⚠️ 老婆手机也输入这个码，就能共享所有数据
          </div>
        </Card>
      </div>
    );
  }

  // ── 已绑定：显示完整设置 ──
  return (
    <div>
      <div style={{ textAlign: 'center', padding: '30px 0 10px' }}>
        <div style={{ fontSize: 48 }}>🤰</div>
        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}>二胎孕妈助手</div>
      </div>

      {/* 家庭码状态 */}
      <Card title="家庭同步">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: '#999' }}>当前家庭码</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#F8B4B4', marginTop: 4 }}>
              {familyCode}
            </div>
          </div>
          <div style={{ fontSize: 24 }}>🔗</div>
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: '#AAA', background: '#FFF5F5', borderRadius: 8, padding: '8px 12px' }}>
          老婆手机在此页面输入同样的家庭码 <b>「{familyCode}」</b>，数据即可共享
        </div>
        <button
          className="btn btn-outline"
          style={{ marginTop: 10, fontSize: 13 }}
          onClick={() => {
            if (confirm('更换家庭码后本设备会重新连接，确定吗？')) {
              localStorage.removeItem('pregnancy_family_code');
              window.location.reload();
            }
          }}>
          更换家庭码
        </button>
      </Card>

      <Card title="预产期设置">
        <div className="form-group">
          <label className="form-label">末次月经日期</label>
          <input type="date" value={lmp} onChange={e => setLmp(e.target.value)} />
        </div>
        {user?.dueDate && (
          <div className="form-group">
            <label className="form-label">预产期（自动计算）</label>
            <div style={{ background: '#FFF5F5', padding: 12, borderRadius: 10, fontSize: 18, fontWeight: 600, color: '#F8B4B4', textAlign: 'center' }}>
              {user.dueDate}
            </div>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">孕前体重（kg）</label>
          <input type="number" value={baseWeight} onChange={e => setBaseWeight(e.target.value)}
            placeholder="用于体重增长参考" step="0.1" />
        </div>
        <div className="form-group">
          <label className="form-label">这是第几个宝宝</label>
          <select value={childCount} onChange={e => setChildCount(e.target.value)}>
            <option value="1">一胎</option>
            <option value="2">二胎</option>
            <option value="3">三胎</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? '保存中…' : '保存设置'}
        </button>
      </Card>

      <Card title="通知提醒">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
          <span style={{ fontSize: 15 }}>每日服药提醒 (9:00)</span>
          <input type="checkbox" checked={reminderOn} onChange={e => setReminderOn(e.target.checked)}
            style={{ width: 20, height: 20, accentColor: '#F8B4B4' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
          <span style={{ fontSize: 15 }}>产检提醒</span>
          <input type="checkbox" checked={checkupReminder} onChange={e => setCheckupReminder(e.target.checked)}
            style={{ width: 20, height: 20, accentColor: '#F8B4B4' }} />
        </div>
        {checkupReminder && (
          <div className="form-group" style={{ marginTop: 8 }}>
            <label className="form-label">提前几天提醒</label>
            <select value={checkupAdvance} onChange={e => setCheckupAdvance(e.target.value)}>
              <option value="1">提前1天</option>
              <option value="3">提前3天</option>
            </select>
          </div>
        )}
      </Card>

      <Card>
        <div style={{ fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 1.8 }}>
          版本 2.0.0 · Firebase 云同步版<br />
          数据实时同步到云端，换手机也不丢<br />
          添加到桌面即可像 App 一样使用
        </div>
      </Card>
      <div className="safe-bottom" />
    </div>
  );
}
