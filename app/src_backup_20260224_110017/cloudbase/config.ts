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

// 匿名登录（无需用户手动登录）
export const anonymousAuth = async (): Promise<void> => {
  const auth = app.auth();
  const loginState = await auth.getLoginState();
  if (!loginState) {
    await auth.signInAnonymously();
  }
};

// 获取当前登录状态
export const getLoginState = async () => {
  const auth = app.auth();
  return await auth.getLoginState();
};

export { app, db };
export default app;
