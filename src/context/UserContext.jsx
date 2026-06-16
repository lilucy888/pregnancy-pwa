/**
 * UserContext - 保持原有接口不变，内部委托给 DataContext
 * 所有页面的 useUser() 调用无需修改
 */
import { useData } from './DataContext';

// UserProvider 已无需单独包裹，DataProvider 统一处理
export function UserProvider({ children }) {
  return <>{children}</>;
}

export function useUser() {
  const { user, updateUser } = useData();
  return { user, updateUser };
}
