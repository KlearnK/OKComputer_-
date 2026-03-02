/**
 * 团队码生成和管理工具
 * 
 * 团队码格式：8位字母数字组合（如：TEAM2024）
 * - 用于识别团队数据
 * - 通过 URL 参数或本地存储传递
 * - 无需登录即可访问
 */

const TEAM_CODE_KEY = 'team_code';
const TEAM_CODE_PARAM = 'team';

/**
 * 生成随机团队码
 * @returns 8位团队码
 */
export const generateTeamCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * 验证团队码格式
 * @param code 团队码
 * @returns 是否有效
 */
export const isValidTeamCode = (code: string): boolean => {
  return /^[A-Z0-9]{8}$/.test(code);
};

/**
 * 从 URL 参数获取团队码
 * @returns 团队码或 null
 */
export const getTeamCodeFromURL = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get(TEAM_CODE_PARAM);
  
  if (code && isValidTeamCode(code.toUpperCase())) {
    return code.toUpperCase();
  }
  return null;
};

/**
 * 从本地存储获取团队码
 * @returns 团队码或 null
 */
export const getTeamCodeFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const code = localStorage.getItem(TEAM_CODE_KEY);
  if (code && isValidTeamCode(code)) {
    return code;
  }
  return null;
};

/**
 * 保存团队码到本地存储
 * @param code 团队码
 */
export const saveTeamCodeToStorage = (code: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TEAM_CODE_KEY, code.toUpperCase());
};

/**
 * 清除本地存储的团队码
 */
export const clearTeamCodeFromStorage = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TEAM_CODE_KEY);
};

/**
 * 获取当前团队码（优先从 URL，其次从本地存储）
 * @returns 团队码或 null
 */
export const getCurrentTeamCode = (): string | null => {
  // 优先从 URL 获取
  const urlCode = getTeamCodeFromURL();
  if (urlCode) {
    // 同步到本地存储
    saveTeamCodeToStorage(urlCode);
    return urlCode;
  }
  
  // 其次从本地存储获取
  return getTeamCodeFromStorage();
};

/**
 * 设置团队码并更新 URL
 * @param code 团队码
 * @param updateURL 是否更新 URL（默认 true）
 */
export const setTeamCode = (code: string, updateURL: boolean = true): void => {
  const upperCode = code.toUpperCase();
  saveTeamCodeToStorage(upperCode);
  
  if (updateURL && typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.set(TEAM_CODE_PARAM, upperCode);
    window.history.replaceState({}, '', url.toString());
  }
};

/**
 * 生成带团队码的分享链接
 * @param code 团队码
 * @returns 完整分享链接
 */
export const generateShareLink = (code: string): string => {
  if (typeof window === 'undefined') return '';
  
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set(TEAM_CODE_PARAM, code.toUpperCase());
  return url.toString();
};

/**
 * 创建新团队（生成新团队码）
 * @returns 新团队码
 */
export const createNewTeam = (): string => {
  const code = generateTeamCode();
  setTeamCode(code);
  return code;
};
