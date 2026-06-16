/** localStorage 包装，用于集合类数据存取 */

function getCollection(name) {
  try {
    return JSON.parse(localStorage.getItem(`pw_${name}`)) || [];
  } catch { return []; }
}

function setCollection(name, data) {
  localStorage.setItem(`pw_${name}`, JSON.stringify(data));
}

export const db = {
  checkups: {
    getAll: () => getCollection('checkups'),
    set: (data) => setCollection('checkups', data),
    init: (schedule) => {
      const existing = getCollection('checkups');
      if (existing.length > 0) return existing;
      const items = schedule.map(s => ({ id: Date.now() + Math.random(), ...s, status: 'pending', weight: '', bloodPressure: '', notes: '', nextDate: '', actualDate: '' }));
      setCollection('checkups', items);
      return items;
    }
  },
  dailyTasks: {
    getAll: () => getCollection('daily_tasks'),
    getByDate: (date) => getCollection('daily_tasks').filter(t => t.date === date),
    save: (task) => {
      const list = getCollection('daily_tasks');
      const idx = list.findIndex(t => t.date === task.date);
      if (idx >= 0) list[idx] = task;
      else list.push(task);
      setCollection('daily_tasks', list);
    }
  },
  weightRecords: {
    getAll: () => getCollection('weight_records'),
    add: (record) => {
      const list = getCollection('weight_records');
      list.push({ id: Date.now(), ...record });
      setCollection('weight_records', list);
    }
  },
  fetalMovements: {
    getAll: () => getCollection('fetal_movements'),
    add: (record) => {
      const list = getCollection('fetal_movements');
      list.push({ id: Date.now(), ...record });
      setCollection('fetal_movements', list);
    }
  },
  hospitalBag: {
    getAll: () => getCollection('hospital_bag'),
    init: (template) => {
      const existing = getCollection('hospital_bag');
      if (existing.length > 0) return existing;
      const items = [];
      template.forEach(cat => {
        cat.items.forEach(name => items.push({ category: cat.category, name, checked: false }));
      });
      setCollection('hospital_bag', items);
      return items;
    },
    set: (data) => setCollection('hospital_bag', data)
  },
  settings: {
    get: () => {
      try { return JSON.parse(localStorage.getItem('pw_settings')) || {}; } catch { return {}; }
    },
    set: (obj) => localStorage.setItem('pw_settings', JSON.stringify(obj))
  }
};
