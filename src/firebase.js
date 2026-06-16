import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// 从 .env 文件读取 Firebase 配置（去 Firebase 控制台复制）
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FB_API_KEY,
  authDomain:        import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FB_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const firestoreDb = getFirestore(app);
