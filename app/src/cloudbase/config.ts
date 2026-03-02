import cloudbase from '@cloudbase/js-sdk';

const config = {
  env: 'teamgoals2026-6gsfpijvc28bca0a',
  // 移除 region 参数，让 SDK 自动检测
  // 或尝试改为 'ap-shanghai' 或 'ap-beijing'
};

const app = cloudbase.init(config);
const db = app.database();

// 调试日志
const debugLog = (message: string, data?: any) => {
  console.log(`[CloudBase] ${message}`, data || '');
};

// 匿名登录
export const anonymousAuth = async (): Promise<boolean> => {
  try {
    const auth = app.auth();
    debugLog('检查登录状态...');
    
    let loginState = await auth.getLoginState();
    debugLog('当前登录状态:', loginState);
    
    if (!loginState) {
      debugLog('执行匿名登录...');
      try {
        await auth.signInAnonymously();
        debugLog('匿名登录执行完成');
        
        loginState = await auth.getLoginState();
        debugLog('登录后状态:', loginState);
      } catch (loginErr) {
        debugLog('匿名登录失败:', loginErr);
        return false;
      }
    }
    
    const isLoggedIn = !!loginState;
    debugLog('最终登录状态:', isLoggedIn);
    return isLoggedIn;
    
  } catch (error) {
    debugLog('登录过程出错:', error);
    return false;
  }
};

export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const auth = app.auth();
    const user = auth.currentUser;
    return user?.uid || null;
  } catch (error) {
    debugLog('获取用户ID失败:', error);
    return null;
  }
};

export { app, db, debugLog };
export default app;