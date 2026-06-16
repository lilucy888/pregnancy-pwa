import { useState, useEffect, useRef } from 'react';
import TabBar from './components/TabBar';
import HomePage from './pages/HomePage';
import CheckinPage from './pages/CheckinPage';
import RecordPage from './pages/RecordPage';
import KnowledgePage from './pages/KnowledgePage';
import SettingsPage from './pages/SettingsPage';
import CheckupList from './pages/CheckupList';
import CheckupDetail from './pages/CheckupDetail';
import DietPage from './pages/DietPage';
import FetalPage from './pages/FetalPage';
import HospitalBagPage from './pages/HospitalBagPage';
import { useData } from './context/DataContext';

const TABS = {
  home: HomePage,
  checkin: CheckinPage,
  record: RecordPage,
  knowledge: KnowledgePage,
  settings: SettingsPage
};

export default function App() {
  const [tab, setTab] = useState('home');
  const [subPage, setSubPage] = useState(null);
  const setTabRef = useRef(setTab);
  setTabRef.current = setTab;

  const { familyCode, isReady, appSettings, checkups } = useData();

  // 把最新数据挂在 ref 上，供 checkReminders 使用（无需 hook）
  const dataRef = useRef({ appSettings, checkups });
  useEffect(() => { dataRef.current = { appSettings, checkups }; }, [appSettings, checkups]);

  // 全局 tab 切换（供 HomePage 快捷入口使用）
  useEffect(() => {
    window.__setTab = (t) => setTabRef.current(t);
    return () => delete window.__setTab;
  }, []);

  // 定时提醒
  useEffect(() => {
    const run = () => checkReminders(dataRef.current);
    run();
    const id = setInterval(run, 60000);
    return () => clearInterval(id);
  }, []);

  // 未设置家庭码时跳到设置页
  useEffect(() => {
    if (!familyCode) setTab('settings');
  }, [familyCode]);

  const navigate = (name, params) => setSubPage({ name, params });
  const goBack   = () => setSubPage(null);

  // 加载中遮罩（首次连接 Firestore）
  if (familyCode && !isReady) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', height: '100vh', gap: 16 }}>
        <div style={{ fontSize: 48 }}>🤰</div>
        <div style={{ fontSize: 16, color: '#F8B4B4', fontWeight: 600 }}>数据同步中…</div>
        <div style={{ fontSize: 13, color: '#999' }}>正在连接家庭数据，稍等一秒</div>
      </div>
    );
  }

  // 子页面
  if (subPage) {
    const pages = {
      checkupList: CheckupList,
      checkupDetail: CheckupDetail,
      diet: DietPage,
      fetal: FetalPage,
      hospitalBag: HospitalBagPage,
    };
    const SubComp = pages[subPage.name];
    return (
      <div id="root">
        <div className="top-bar">
          <span className="back" onClick={goBack}>←</span>
          <span className="title">{subPage.params?.title || ''}</span>
        </div>
        <div className="page">
          <SubComp navigate={navigate} goBack={goBack} {...(subPage.params || {})} />
        </div>
      </div>
    );
  }

  const PageComp = TABS[tab] || HomePage;
  return (
    <div id="root">
      <div className="page">
        <PageComp navigate={navigate} />
      </div>
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}

function checkReminders({ appSettings, checkups }) {
  if (!appSettings.reminderOn && !appSettings.checkupReminder) return;
  const now = new Date();

  if (appSettings.reminderOn && now.getHours() === 9 && now.getMinutes() < 1) {
    sendNotification('💊 服药提醒', '别忘了今天的营养补充品：叶酸、铁剂、钙片、DHA');
  }

  if (appSettings.checkupReminder && checkups.length > 0) {
    const advanceDays = appSettings.checkupAdvance || 1;
    const target = new Date(now);
    target.setDate(target.getDate() + advanceDays);
    const targetStr = fmtDate(target);
    const due = checkups.filter(c => c.status === 'pending' && c.actualDate === targetStr);
    if (due.length > 0 && now.getHours() === 9 && now.getMinutes() < 1) {
      sendNotification('🏥 产检提醒', `${due[0].title} 将在 ${advanceDays} 天后，请做好准备`);
    }
  }
}

function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function sendNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icon-192.png', tag: 'pregnancy-reminder' });
  }
}
