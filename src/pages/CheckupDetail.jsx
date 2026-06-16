import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/Card';

export default function CheckupDetail({ id, goBack }) {
  const { checkups, updateCheckup, addWeightRecord } = useData();
  const [item, setItem] = useState(null);
  const [form, setForm] = useState({ actualDate: '', weight: '', bloodPressure: '', notes: '', nextDate: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // id 即 _id（Firestore 文档 ID）
    const found = checkups.find(c => c._id === id);
    if (found) {
      setItem(found);
      setForm({
        actualDate:    found.actualDate    || '',
        weight:        found.weight        || '',
        bloodPressure: found.bloodPressure || '',
        notes:         found.notes         || '',
        nextDate:      found.nextDate      || '',
      });
    }
  }, [id, checkups]);

  async function save() {
    if (!item) return;
    setSaving(true);
    try {
      if (form.weight && parseFloat(form.weight) > 0) {
        await addWeightRecord({
          date:   form.actualDate || new Date().toISOString().slice(0, 10),
          weight: parseFloat(form.weight),
          week:   item.week,
        });
      }
      await updateCheckup(item._id, { ...form, status: 'done' });
      alert('✅ 保存成功');
      goBack();
    } finally {
      setSaving(false);
    }
  }

  async function markSkipped() {
    if (!confirm('确定将此产检标记为已跳过？')) return;
    await updateCheckup(item._id, { status: 'skipped' });
    goBack();
  }

  if (!item) return <div className="empty">加载中…</div>;

  return (
    <div>
      <Card title={`${item.title}（孕${item.week}周）`}>
        <div className="form-group">
          <label className="form-label">检查日期</label>
          <input type="date" value={form.actualDate} onChange={e => setForm({ ...form, actualDate: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">体重（kg）</label>
          <input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} step="0.1" placeholder="输入体重（同步到体重曲线）" />
        </div>
        <div className="form-group">
          <label className="form-label">血压</label>
          <input value={form.bloodPressure} onChange={e => setForm({ ...form, bloodPressure: e.target.value })} placeholder="如 120/80" />
        </div>
        <div className="form-group">
          <label className="form-label">备注</label>
          <textarea rows="3" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="检查结果或医生建议…" />
        </div>
        <div className="form-group">
          <label className="form-label">下次产检日期</label>
          <input type="date" value={form.nextDate} onChange={e => setForm({ ...form, nextDate: e.target.value })} />
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving} style={{ marginBottom: 8 }}>
          {saving ? '保存中…' : '保存记录'}
        </button>
        {item.status === 'pending' && (
          <button className="btn btn-outline" onClick={markSkipped} style={{ color: '#E88080', borderColor: '#E88080' }}>
            标记为已跳过
          </button>
        )}
      </Card>
      <div className="safe-bottom" />
    </div>
  );
}
