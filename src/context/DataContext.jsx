/**
 * DataContext — 核心数据层（Supabase 版）
 * 用 Supabase 替代 Firebase，国内可直接访问，两台手机实时共享数据
 * 对外接口保持不变：其他页面组件无需修改
 */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { CHECKUP_SCHEDULE, HOSPITAL_BAG } from '../utils/constants';
import { calcDueDate } from '../utils/gestation';

const DataContext = createContext(null);
const FAMILY_CODE_KEY = 'pregnancy_family_code';

const TABLES = ['checkups', 'daily_tasks', 'weight_records', 'fetal_movements', 'hospital_bag'];

export function DataProvider({ children }) {
  const [familyCode, setFamilyCodeState] = useState(
    () => localStorage.getItem(FAMILY_CODE_KEY) || ''
  );
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState(null);
  const [checkups, setCheckups] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [weightRecords, setWeightRecords] = useState([]);
  const [fetalMovements, setFetalMovements] = useState([]);
  const [hospitalBagItems, setHospitalBagItems] = useState([]);
  const [appSettings, setAppSettings] = useState({});

  const setterMap = useRef({
    checkups: setCheckups,
    daily_tasks: setDailyTasks,
    weight_records: setWeightRecords,
    fetal_movements: setFetalMovements,
    hospital_bag: setHospitalBagItems,
  });

  const setFamilyCode = useCallback((code) => {
    const safe = code.trim().toLowerCase().replace(/\s+/g, '_');
    localStorage.setItem(FAMILY_CODE_KEY, safe);
    setFamilyCodeState(safe);
  }, []);

  // ── 加载 + 订阅实时变化 ──
  useEffect(() => {
    if (!familyCode) { setIsReady(false); return; }

    let active = true;
    setIsReady(false);
    setUser(null); setCheckups([]); setDailyTasks([]);
    setWeightRecords([]); setFetalMovements([]);
    setHospitalBagItems([]); setAppSettings({});

    async function refetchTable(table) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('family_code', familyCode);
      if (!active) return;
      if (error) { console.error(`fetch ${table} failed`, error); return; }
      setterMap.current[table](data || []);
    }

    async function loadAll() {
      // 确保 family 行存在
      const { data: famRow } = await supabase
        .from('families')
        .select('*')
        .eq('family_code', familyCode)
        .maybeSingle();

      if (!famRow) {
        await supabase.from('families').insert({ family_code: familyCode, user_data: {}, settings: {} });
      } else if (active) {
        setUser(famRow.user_data || null);
        setAppSettings(famRow.settings || {});
      }

      await Promise.all(TABLES.map(refetchTable));
      if (active) setIsReady(true);
    }

    loadAll();

    // 实时订阅：任意一台手机改动后，自动刷新对应表
    const channel = supabase
      .channel(`family-${familyCode}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'families', filter: `family_code=eq.${familyCode}` },
        (payload) => {
          if (payload.new) {
            setUser(payload.new.user_data || null);
            setAppSettings(payload.new.settings || {});
          }
        }
      );

    TABLES.forEach(table => {
      channel.on('postgres_changes',
        { event: '*', schema: 'public', table, filter: `family_code=eq.${familyCode}` },
        () => refetchTable(table)
      );
    });

    channel.subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, [familyCode]);

  // ── 用户信息 ──
  const updateUser = useCallback(async (updates) => {
    if (!familyCode) return;
    const next = { ...user, ...updates };
    if (updates.lmp) {
      const due = calcDueDate(updates.lmp);
      next.dueDate = [
        due.getFullYear(),
        String(due.getMonth() + 1).padStart(2, '0'),
        String(due.getDate()).padStart(2, '0'),
      ].join('-');
    }
    setUser(next);
    await supabase.from('families').update({ user_data: next }).eq('family_code', familyCode);
  }, [user, familyCode]);

  // ── 产检 ──
  const initCheckups = useCallback(async () => {
    if (!familyCode || checkups.length > 0) return;
    const rows = CHECKUP_SCHEDULE.map(s => ({
      family_code: familyCode,
      title: s.title,
      week: s.week,
      status: 'pending',
      weight: '',
      bloodPressure: '',
      notes: '',
      nextDate: '',
      actualDate: '',
    }));
    await supabase.from('checkups').insert(rows);
  }, [familyCode, checkups.length]);

  const updateCheckup = useCallback(async (id, updates) => {
    if (!familyCode) return;
    await supabase.from('checkups').update(updates).eq('id', id);
  }, [familyCode]);

  // ── 每日打卡 ──
  const saveDailyTask = useCallback(async (task) => {
    if (!familyCode) return;
    await supabase
      .from('daily_tasks')
      .upsert({ family_code: familyCode, ...task }, { onConflict: 'family_code,date' });
  }, [familyCode]);

  const getDailyTaskByDate = useCallback((date) => {
    return dailyTasks.find(t => t.date === date) || null;
  }, [dailyTasks]);

  // ── 体重记录 ──
  const addWeightRecord = useCallback(async (record) => {
    if (!familyCode) return;
    await supabase.from('weight_records').insert({ family_code: familyCode, ...record });
  }, [familyCode]);

  // ── 胎动 ──
  const addFetalMovement = useCallback(async (record) => {
    if (!familyCode) return;
    await supabase.from('fetal_movements').insert({ family_code: familyCode, ...record });
  }, [familyCode]);

  // ── 待产包 ──
  const initHospitalBag = useCallback(async () => {
    if (!familyCode || hospitalBagItems.length > 0) return;
    const rows = [];
    HOSPITAL_BAG.forEach(cat => {
      cat.items.forEach(name => {
        rows.push({ family_code: familyCode, category: cat.category, name, checked: false });
      });
    });
    await supabase.from('hospital_bag').insert(rows);
  }, [familyCode, hospitalBagItems.length]);

  const updateHospitalBagItem = useCallback(async (id, updates) => {
    if (!familyCode) return;
    await supabase.from('hospital_bag').update(updates).eq('id', id);
  }, [familyCode]);

  // ── 应用设置 ──
  const saveAppSettings = useCallback(async (settings) => {
    if (!familyCode) return;
    setAppSettings(settings);
    await supabase.from('families').update({ settings }).eq('family_code', familyCode);
  }, [familyCode]);

  const value = {
    familyCode, setFamilyCode, isReady,
    user, updateUser,
    checkups, dailyTasks, weightRecords, fetalMovements, hospitalBagItems, appSettings,
    initCheckups, updateCheckup,
    saveDailyTask, getDailyTaskByDate,
    addWeightRecord,
    addFetalMovement,
    initHospitalBag, updateHospitalBagItem,
    saveAppSettings,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}
