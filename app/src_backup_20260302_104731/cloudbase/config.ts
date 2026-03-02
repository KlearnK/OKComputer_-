import cloudbase from '@cloudbase/js-sdk';

// CloudBase 配置
// 环境ID: teamgoals2026-6gsfpijvc28bca0a
const cloudbaseConfig = {
  env: 'teamgoals2026-6gsfpijvc28bca0a',
};

// 初始化 CloudBase
const app = cloudbase.init(cloudbaseConfig);

// 获取数据库实例
const db = app.database();

// 调试日志
const debugLog = (message: string, data?: any) => {
  console.log(`[CloudBase Debug] ${message}`, data || '');
};

// 匿名登录（无需用户手动登录）
export const anonymousAuth = async (): Promise<boolean> => {
  try {
    const auth = app.auth();
    debugLog('检查登录状态...');
    const loginState = await auth.getLoginState();
    debugLog('当前登录状态:', loginState);
    
    if (!loginState) {
      debugLog('执行匿名登录...');
      const result = await auth.signInAnonymously();
      debugLog('匿名登录结果:', result);
      return true;
    }
    return true;
  } catch (error) {
    debugLog('匿名登录失败:', error);
    return false;
  }
};

// 获取当前登录状态
export const getLoginState = async () => {
  try {
    const auth = app.auth();
    return await auth.getLoginState();
  } catch (error) {
    debugLog('获取登录状态失败:', error);
    return null;
  }
};

// 检查 CloudBase 连接状态
export const checkConnection = async (): Promise<boolean> => {
  try {
    debugLog('检查 CloudBase 连接...');
    const auth = app.auth();
    const loginState = await auth.getLoginState();
    debugLog('连接状态:', loginState ? '已连接' : '未连接');
    return !!loginState;
  } catch (error) {
    debugLog('连接检查失败:', error);
    return false;
  }
};

export { app, db, debugLog };
export default app;
