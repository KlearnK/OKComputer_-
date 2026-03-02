import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { anonymousAuth } from './cloudbase/config';

const init = async () => {
  console.log('[Main] 开始初始化...');
  
  // 登录 CloudBase
  const loginResult = await anonymousAuth();
  console.log('[Main] 登录结果:', loginResult);
  
  if (!loginResult) {
    console.error('[Main] 登录失败，5秒后重试...');
    setTimeout(init, 5000);
    return;
  }
  
  console.log('[Main] 登录成功，渲染应用');
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

init();