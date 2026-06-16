/**
 * DataContext - 核心数据层
 * 用 Firestore 替代 localStorage，两台手机实时共享同一份数据
 * 家庭码（familyCode）存储在设备 localStorage，作为 Firestore 路径前缀
 */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { firestoreDb } from '../firebase';
import {
  collection, doc, onSnapshot,
  setDoc, addDoc, updateDoc, writeBatch
} from 'firebase/firestore';
import { CHECKUP_SCHEDULE, HOSPITAL_BAG } from '../utils/constants';
import { calcDueDate } from '../utils/gestation';

const DataContext = createContext(null);
const FAMILY_CODE_KEY = 'pregnancy_family_code';

export function DataProvider({ children }) {
  const [familyCode, setFamilyCodeState] = useState(
    () => localStorage.getItem(FAMILY_CODE_KEY) || ''
  );
  const [isReady, setIsReady]           = useState(false);
  const [user, setUser]                 = useState(null);
  const [checkups, setCheckups]         = useState([]);
  const [dailyTasks, setDailyTasks]     = useState([]);
  const [weightRecords, setWeightRecords]     = useState([]);
  const [fetalMovements, setFetalMovements]   = useState([]);
  const [hospitalBagItems, setHospitalBagItems] = useState([]);
  const [appSettings, setAppSettings]   = useState({});

  // 保存家庭码到 localStorage 并更新 state
  const setFamilyCode = useCallback((code) => {
    const safe = code.trim().toLowerCase().replace(/\s+/g, '_');
    localStorage.setItem(FAMILY_CODE_KEY, safe);
    setFamilyCodeState(safe);
  }, []);

  // ── 订阅 Firestore，familyCode 变化时重新订阅 ──
  useEffect(() => {
    if (!familyCode) { setIsReady(false); return; }

    setIsReady(false);
    // 重置所有数据，避免旧数据残留
    setUser(null); setCheckups([]); setDailyTasks([]);
    setWeightRecords([]); setFetalMovements([]);
    setHospitalBagItems([]); setAppSettings({});

    const famDoc = doc(firestoreDb, 'families', familyCode);
    const col    = (name) => collection(firestoreDb, 'families', familyCode, name);

    // 用闭包跟踪首次加载
    const loaded = { checkups: false, daily_tasks: false, weight_records: false,
                     fetal_movements: false, hospital_bag: false, family_doc: false };
    const markLoaded = (key) => {
      loaded[key] = true;
      if (Object.values(loaded).every(Boolean)) setIsReady(true);
    };

    const unsubs = [
      onSnapshot(col('checkups'), snap => {
        setCheckups(snap.docs.map(d => ({ ...d.data(), _id: d.id })));
        markLoaded('checkups');
      }),
      onSnapshot(col('daily_tasks'), snap => {
        setDailyTasks(snap.docs.map(d => ({ ...d.data(), _id: d.id })));
        markLoaded('daily_tasks');
      }),
      onSnapshot(col('weight_records'), snap => {
        setWeightRecords(snap.docs.map(d => ({ ...d.data(), _id: d.id })));
        markLoaded('weight_records');
      }),
      onSnapshot(col('fetal_movements'), snap => {
        setFetalMovements(snap.docs.map(d => ({ ...d.data(), _id: d.id })));
        markLoaded('fetal_movements');
      }),
      onSnapshot(col('hospital_bag'), snap => {
        setHospitalBagItems(snap.docs.map(d => ({ ...d.data(), _id: d.id })));
        markLoaded('hospital_bag');
      }),
      onSnapshot(famDoc, snap => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.user)     setUser(data.user);
          if (data.settings) setAppSettings(data.settings);
        }
        markLoaded('family_doc');
      }),
    ];

    return () => unsubs.forEach(u => u());
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
    await setDoc(doc(firestoreDb, 'families', familyCode), { user: next }, { merge: true });
  }, [user, familyCode]);

  // ── 产检 ──
  const initCheckups = useCallback(async () => {
    if (!familyCode || checkups.length > 0) return;
    const batch = writeBatch(firestoreDb);
    CHECKUP_SCHEDULE.forEach(s => {
      const ref = doc(collection(firestoreDb, 'families', familyCode, 'checkups'));
      batch.set(ref, {
        ...s, status: 'pending',
        weight: '', bloodPressure: '', notes: '', nextDate: '', actualDate: ''
      });
    });
    await batch.commit();
  }, [familyCode, checkups.length]);

  const updateCheckup = useCallback(async (docId, updates) => {
    if (!familyCode) return;
    await updateDoc(doc(firestoreDb, 'families', familyCode, 'checkups', docId), updates);
  }, [familyCode]);

  // ── 每日打卡 ──
  const saveDailyTask = useCallback(async (task) => {
    if (!familyCode) return;
    const existing = dailyTasks.find(t => t.date === task.date);
    if (existing) {
      await updateDoc(
        doc(firestoreDb, 'families', familyCode, 'daily_tasks', existing._id),
        task
      );
    } else {
      await addDoc(collection(firestoreDb, 'families', familyCode, 'daily_tasks'), task);
    }
  }, [familyCode, dailyTasks]);

  const getDailyTaskByDate = useCallback((date) => {
    return dailyTasks.find(t => t.date === date) || null;
  }, [dailyTasks]);

  // ── 体重记录 ──
  const addWeightRecord = useCallback(async (record) => {
    if (!familyCode) return;
    await addDoc(collection(firestoreDb, 'families', familyCode, 'weight_records'), record);
  }, [familyCode]);

  // ── 胎动 ──
  const addFetalMovement = useCallback(async (record) => {
    if (!familyCode) return;
    await addDoc(collection(firestoreDb, 'families', familyCode, 'fetal_movements'), record);
  }, [familyCode]);

  // ── 待产包 ──
  const initHospitalBag = useCallback(async () => {
    if (!familyCode || hospitalBagItems.length > 0) return;
    const batch = writeBatch(firestoreDb);
    HOSPITAL_BAG.forEach(cat => {
      cat.items.forEach(name => {
        const ref = doc(collection(firestoreDb, 'families', familyCode, 'hospital_bag'));
        batch.set(ref, { category: cat.category, name, checked: false });
      });
    });
    await batch.commit();
  }, [familyCode, hospitalBagItems.length]);

  const updateHospitalBagItem = useCallback(async (docId, updates) => {
    if (!familyCode) return;
    await updateDoc(
      doc(firestoreDb, 'families', familyCode, 'hospital_bag', docId),
      updates
    );
  }, [familyCode]);

  // ── 应用设置 ──
  const saveAppSettings = useCallback(async (settings) => {
    if (!familyCode) return;
    setAppSettings(settings);
    await setDoc(doc(firestoreDb, 'families', familyCode), { settings }, { merge: true });
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
