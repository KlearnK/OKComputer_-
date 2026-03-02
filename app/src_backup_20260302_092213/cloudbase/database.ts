import { db, anonymousAuth, debugLog } from './config';
import type { 
  TeamMember, 
  TeamMemberAnnualGoal, 
  TeamMemberMonthlyGoal, 
  TeamMemberWeeklyGoal 
} from '@/types/team';

// 生成唯一ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// 集合名称（使用固定前缀 + 团队码，避免特殊字符问题）
const getCollectionName = (teamCode: string, collection: string) => {
  // 清理团队码，只保留字母数字
  const cleanCode = teamCode.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `team_${cleanCode}_${collection}`;
};

/**
 * 确保匿名登录
 */
const ensureAuth = async (): Promise<boolean> => {
  return await anonymousAuth();
};

/**
 * 团队成员相关操作
 */
export const memberDB = {
  // 获取所有成员
  async getAll(teamCode: string): Promise<TeamMember[]> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) {
        debugLog('未登录，返回空数据');
        return [];
      }
      
      const collectionName = getCollectionName(teamCode, 'members');
      debugLog(`获取成员数据，集合: ${collectionName}`);
      
      const result = await db.collection(collectionName).get();
      debugLog('获取成员结果:', result);
      
      return (result.data || []) as TeamMember[];
    } catch (error) {
      debugLog('获取成员失败:', error);
      return [];
    }
  },

  // 实时监听成员变化
  onSnapshot(teamCode: string, callback: (members: TeamMember[]) => void) {
    const collectionName = getCollectionName(teamCode, 'members');
    debugLog(`开始监听成员变化，集合: ${collectionName}`);
    
    try {
      const listener = db.collection(collectionName).watch({
        onChange: (snapshot) => {
          debugLog('收到成员数据更新:', snapshot);
          callback((snapshot.docs || []) as TeamMember[]);
        },
        onError: (err) => {
          debugLog('成员监听错误:', err);
        },
      });
      return listener;
    } catch (error) {
      debugLog('启动成员监听失败:', error);
      // 返回一个空的监听器
      return { close: () => {} };
    }
  },

  // 创建成员
  async create(teamCode: string, member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMember | null> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) {
        debugLog('未登录，无法创建成员');
        return null;
      }
      
      const collectionName = getCollectionName(teamCode, 'members');
      const newMember: TeamMember = {
        ...member,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      debugLog(`创建成员，集合: ${collectionName}`, newMember);
      const result = await db.collection(collectionName).add(newMember);
      debugLog('创建成员结果:', result);
      
      return newMember;
    } catch (error) {
      debugLog('创建成员失败:', error);
      return null;
    }
  },

  // 更新成员
  async update(teamCode: string, id: string, updates: Partial<TeamMember>): Promise<boolean> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) return false;
      
      const collectionName = getCollectionName(teamCode, 'members');
      debugLog(`更新成员 ${id}，集合: ${collectionName}`, updates);
      
      await db.collection(collectionName).doc(id).update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      
      debugLog('更新成员成功');
      return true;
    } catch (error) {
      debugLog('更新成员失败:', error);
      return false;
    }
  },

  // 删除成员
  async delete(teamCode: string, id: string): Promise<boolean> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) return false;
      
      const collectionName = getCollectionName(teamCode, 'members');
      debugLog(`删除成员 ${id}，集合: ${collectionName}`);
      
      await db.collection(collectionName).doc(id).remove();
      debugLog('删除成员成功');
      return true;
    } catch (error) {
      debugLog('删除成员失败:', error);
      return false;
    }
  },
};

/**
 * 年度目标相关操作
 */
export const annualGoalDB = {
  // 获取所有年度目标
  async getAll(teamCode: string): Promise<TeamMemberAnnualGoal[]> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) return [];
      
      const collectionName = getCollectionName(teamCode, 'annual_goals');
      debugLog(`获取年度目标，集合: ${collectionName}`);
      
      const result = await db.collection(collectionName).get();
      return (result.data || []) as TeamMemberAnnualGoal[];
    } catch (error) {
      debugLog('获取年度目标失败:', error);
      return [];
    }
  },

  // 实时监听年度目标变化
  onSnapshot(teamCode: string, callback: (goals: TeamMemberAnnualGoal[]) => void) {
    const collectionName = getCollectionName(teamCode, 'annual_goals');
    debugLog(`开始监听年度目标变化，集合: ${collectionName}`);
    
    try {
      const listener = db.collection(collectionName).watch({
        onChange: (snapshot) => {
          debugLog('收到年度目标数据更新');
          callback((snapshot.docs || []) as TeamMemberAnnualGoal[]);
        },
        onError: (err) => {
          debugLog('年度目标监听错误:', err);
        },
      });
      return listener;
    } catch (error) {
      debugLog('启动年度目标监听失败:', error);
      return { close: () => {} };
    }
  },

  // 创建年度目标
  async create(teamCode: string, goal: Omit<TeamMemberAnnualGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMemberAnnualGoal | null> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) return null;
      
      const collectionName = getCollectionName(teamCode, 'annual_goals');
      const newGoal: TeamMemberAnnualGoal = {
        ...goal,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      debugLog(`创建年度目标，集合: ${collectionName}`, newGoal);
      await db.collection(collectionName).add(newGoal);
      return newGoal;
    } catch (error) {
      debugLog('创建年度目标失败:', error);
      return null;
    }
  },

  // 更新年度目标
  async update(teamCode: string, id: string, updates: Partial<TeamMemberAnnualGoal>): Promise<boolean> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) return false;
      
      const collectionName = getCollectionName(teamCode, 'annual_goals');
      await db.collection(collectionName).doc(id).update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      debugLog('更新年度目标失败:', error);
      return false;
    }
  },

  // 更新年度目标实际完成
  async updateActual(
    teamCode: string, 
    id: string, 
    actualBreakdown: Partial<TeamMemberAnnualGoal['breakdownGoals']>, 
    actualExecution: Partial<TeamMemberAnnualGoal['executionGoals']>
  ): Promise<boolean> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) return false;
      
      const collectionName = getCollectionName(teamCode, 'annual_goals');
      const doc = await db.collection(collectionName).doc(id).get();
      const data = doc.data as unknown as TeamMemberAnnualGoal;
      
      await db.collection(collectionName).doc(id).update({
        actualBreakdown: { ...data.actualBreakdown, ...actualBreakdown },
        actualExecution: { ...data.actualExecution, ...actualExecution },
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      debugLog('更新年度目标实际完成失败:', error);
      return false;
    }
  },

  // 删除年度目标
  async delete(teamCode: string, id: string): Promise<boolean> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) return false;
      
      const collectionName = getCollectionName(teamCode, 'annual_goals');
      await db.collection(collectionName).doc(id).remove();
      return true;
    } catch (error) {
      debugLog('删除年度目标失败:', error);
      return false;
    }
  },
};

/**
 * 月度目标相关操作
 */
export const monthlyGoalDB = {
  // 获取所有月度目标
  async getAll(teamCode: string): Promise<TeamMemberMonthlyGoal[]> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) return [];
      
      const collectionName = getCollectionName(teamCode, 'monthly_goals');
      const result = await db.collection(collectionName).get();
      return (result.data || []) as TeamMemberMonthlyGoal[];
    } catch (error) {
      debugLog('获取月度目标失败:', error);
      return [];
    }
  },

  // 实时监听月度目标变化
  onSnapshot(teamCode: string, callback: (goals: TeamMemberMonthlyGoal[]) => void) {
    const collectionName = getCollectionName(teamCode, 'monthly_goals');
    try {
      const listener = db.collection(collectionName).watch({
        onChange: (snapshot) => {
          callback((snapshot.docs || []) as TeamMemberMonthlyGoal[]);
        },
        onError: (err) => {
          debugLog('月度目标监听错误:', err);
        },
      });
      return listener;
    } catch (error) {
      debugLog('启动月度目标监听失败:', error);
      return { close: () => {} };
    }
  },

  // 创建月度目标
  async create(teamCode: string, goal: Omit<TeamMemberMonthlyGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMemberMonthlyGoal | null> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) return null;
      
      const collectionName = getCollectionName(teamCode, 'monthly_goals');
      const newGoal: TeamMemberMonthlyGoal = {
        ...goal,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await db.collection(collectionName).add(newGoal);
      return newGoal;
    } catch (error) {
      debugLog('创建月度目标失败:', error);
      return null;
    }
  },

  // 更新月度目标
  async update(teamCode: string, id: string, updates: Partial<TeamMemberMonthlyGoal>): Promise<boolean> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) return false;
      
      const collectionName = getCollectionName(teamCode, 'monthly_goals');
      await db.collection(collectionName).doc(id).update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      debugLog('更新月度目标失败:', error);
      return false;
    }
  },

  // 更新月度目标实际完成
  async updateActual(
    teamCode: string, 
    id: string, 
    actualBreakdown: Partial<TeamMemberMonthlyGoal['breakdownGoals']>, 
    actualExecution: Partial<TeamMemberMonthlyGoal['executionGoals']>
  ): Promise<boolean> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) return false;
      
      const collectionName = getCollectionName(teamCode, 'monthly_goals');
      const doc = await db.collection(collectionName).doc(id).get();
      const data = doc.data as unknown as TeamMemberMonthlyGoal;
      
      await db.collection(collectionName).doc(id).update({
        actualBreakdown: { ...data.actualBreakdown, ...actualBreakdown },
        actualExecution: { ...data.actualExecution, ...actualExecution },
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      debugLog('更新月度目标实际完成失败:', error);
      return false;
    }
  },

  // 删除月度目标
  async delete(teamCode: string, id: string): Promise<boolean> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) return false;
      
      const collectionName = getCollectionName(teamCode, 'monthly_goals');
      await db.collection(collectionName).doc(id).remove();
      return true;
    } catch (error) {
      debugLog('删除月度目标失败:', error);
      return false;
    }
  },
};

/**
 * 周目标相关操作
 */
export const weeklyGoalDB = {
  // 获取所有周目标
  async getAll(teamCode: string): Promise<TeamMemberWeeklyGoal[]> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) return [];
      
      const collectionName = getCollectionName(teamCode, 'weekly_goals');
      const result = await db.collection(collectionName).get();
      return (result.data || []) as TeamMemberWeeklyGoal[];
    } catch (error) {
      debugLog('获取周目标失败:', error);
      return [];
    }
  },

  // 实时监听周目标变化
  onSnapshot(teamCode: string, callback: (goals: TeamMemberWeeklyGoal[]) => void) {
    const collectionName = getCollectionName(teamCode, 'weekly_goals');
    try {
      const listener = db.collection(collectionName).watch({
        onChange: (snapshot) => {
          callback((snapshot.docs || []) as TeamMemberWeeklyGoal[]);
        },
        onError: (err) => {
          debugLog('周目标监听错误:', err);
        },
      });
      return listener;
    } catch (error) {
      debugLog('启动周目标监听失败:', error);
      return { close: () => {} };
    }
  },

  // 创建周目标
  async create(teamCode: string, goal: Omit<TeamMemberWeeklyGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMemberWeeklyGoal | null> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) return null;
      
      const collectionName = getCollectionName(teamCode, 'weekly_goals');
      const newGoal: TeamMemberWeeklyGoal = {
        ...goal,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await db.collection(collectionName).add(newGoal);
      return newGoal;
    } catch (error) {
      debugLog('创建周目标失败:', error);
      return null;
    }
  },

  // 更新周目标
  async update(teamCode: string, id: string, updates: Partial<TeamMemberWeeklyGoal>): Promise<boolean> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) return false;
      
      const collectionName = getCollectionName(teamCode, 'weekly_goals');
      await db.collection(collectionName).doc(id).update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      debugLog('更新周目标失败:', error);
      return false;
    }
  },

  // 更新周目标实际完成
  async updateActual(
    teamCode: string, 
    id: string, 
    actualBreakdown: Partial<TeamMemberWeeklyGoal['breakdownGoals']>, 
    actualExecution: Partial<TeamMemberWeeklyGoal['executionGoals']>
  ): Promise<boolean> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) return false;
      
      const collectionName = getCollectionName(teamCode, 'weekly_goals');
      const doc = await db.collection(collectionName).doc(id).get();
      const data = doc.data as unknown as TeamMemberWeeklyGoal;
      
      await db.collection(collectionName).doc(id).update({
        actualBreakdown: { ...data.actualBreakdown, ...actualBreakdown },
        actualExecution: { ...data.actualExecution, ...actualExecution },
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      debugLog('更新周目标实际完成失败:', error);
      return false;
    }
  },

  // 删除周目标
  async delete(teamCode: string, id: string): Promise<boolean> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) return false;
      
      const collectionName = getCollectionName(teamCode, 'weekly_goals');
      await db.collection(collectionName).doc(id).remove();
      return true;
    } catch (error) {
      debugLog('删除周目标失败:', error);
      return false;
    }
  },
};

export default {
  memberDB,
  annualGoalDB,
  monthlyGoalDB,
  weeklyGoalDB,
};
