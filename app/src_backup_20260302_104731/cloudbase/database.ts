import { db, anonymousAuth, debugLog } from './config';
import type { 
  TeamMember, 
  TeamMemberAnnualGoal, 
  TeamMemberMonthlyGoal, 
  TeamMemberWeeklyGoal 
} from '@/types/team';

// 生成唯一ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// 集合名称 - 使用固定的集合名称，不根据团队码变化
// 数据通过 teamCode 字段来区分
const COLLECTIONS = {
  members: 'team_members',
  annualGoals: 'team_annual_goals',
  monthlyGoals: 'team_monthly_goals',
  weeklyGoals: 'team_weekly_goals',
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
  // 获取所有成员（按团队码过滤）
  async getAll(teamCode: string): Promise<TeamMember[]> {
    try {
      const isAuthed = await ensureAuth();
      if (!isAuthed) {
        debugLog('未登录，返回空数据');
        return [];
      }
      
      debugLog(`获取成员数据，团队码: ${teamCode}`);
      
      // 使用 where 查询按 teamCode 过滤
      const result = await db.collection(COLLECTIONS.members)
        .where({ teamCode })
        .get();
      
      debugLog('获取成员结果:', { count: (result.data || []).length });
      
      return (result.data || []) as TeamMember[];
    } catch (error) {
      debugLog('获取成员失败:', error);
      return [];
    }
  },

  // 实时监听成员变化
  onSnapshot(teamCode: string, callback: (members: TeamMember[]) => void) {
    debugLog(`开始监听成员变化，团队码: ${teamCode}`);
    
    try {
      // 使用 where 查询监听特定团队码的数据
      const listener = db.collection(COLLECTIONS.members)
        .where({ teamCode })
        .watch({
          onChange: (snapshot) => {
            debugLog('收到成员数据更新:', { count: (snapshot.docs || []).length });
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
      
      const newMember: TeamMember & { teamCode: string } = {
        ...member,
        teamCode,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      debugLog(`创建成员`, newMember);
      const result = await db.collection(COLLECTIONS.members).add(newMember);
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
      
      debugLog(`更新成员 ${id}`, updates);
      
      // 先查询获取 docId
      const queryResult = await db.collection(COLLECTIONS.members)
        .where({ id, teamCode })
        .get();
      
      if (!queryResult.data || queryResult.data.length === 0) {
        debugLog('未找到要更新的成员');
        return false;
      }
      
      const docId = (queryResult.data[0] as any)._id;
      
      await db.collection(COLLECTIONS.members).doc(docId).update({
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
      
      debugLog(`删除成员 ${id}`);
      
      // 先查询获取 docId
      const queryResult = await db.collection(COLLECTIONS.members)
        .where({ id, teamCode })
        .get();
      
      if (!queryResult.data || queryResult.data.length === 0) {
        debugLog('未找到要删除的成员');
        return false;
      }
      
      const docId = (queryResult.data[0] as any)._id;
      
      await db.collection(COLLECTIONS.members).doc(docId).remove();
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
      
      debugLog(`获取年度目标，团队码: ${teamCode}`);
      
      const result = await db.collection(COLLECTIONS.annualGoals)
        .where({ teamCode })
        .get();
      
      return (result.data || []) as TeamMemberAnnualGoal[];
    } catch (error) {
      debugLog('获取年度目标失败:', error);
      return [];
    }
  },

  // 实时监听年度目标变化
  onSnapshot(teamCode: string, callback: (goals: TeamMemberAnnualGoal[]) => void) {
    debugLog(`开始监听年度目标变化，团队码: ${teamCode}`);
    
    try {
      const listener = db.collection(COLLECTIONS.annualGoals)
        .where({ teamCode })
        .watch({
          onChange: (snapshot) => {
            debugLog('收到年度目标数据更新:', { count: (snapshot.docs || []).length });
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
      
      const newGoal: TeamMemberAnnualGoal & { teamCode: string } = {
        ...goal,
        teamCode,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      debugLog(`创建年度目标`, newGoal);
      await db.collection(COLLECTIONS.annualGoals).add(newGoal);
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
      
      // 先查询获取 docId
      const queryResult = await db.collection(COLLECTIONS.annualGoals)
        .where({ id, teamCode })
        .get();
      
      if (!queryResult.data || queryResult.data.length === 0) {
        debugLog('未找到要更新的年度目标');
        return false;
      }
      
      const docId = (queryResult.data[0] as any)._id;
      
      await db.collection(COLLECTIONS.annualGoals).doc(docId).update({
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
      
      // 先查询获取 docId 和当前数据
      const queryResult = await db.collection(COLLECTIONS.annualGoals)
        .where({ id, teamCode })
        .get();
      
      if (!queryResult.data || queryResult.data.length === 0) {
        debugLog('未找到要更新的年度目标');
        return false;
      }
      
      const docId = (queryResult.data[0] as any)._id;
      const data = queryResult.data[0] as unknown as TeamMemberAnnualGoal;
      
      await db.collection(COLLECTIONS.annualGoals).doc(docId).update({
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
      
      // 先查询获取 docId
      const queryResult = await db.collection(COLLECTIONS.annualGoals)
        .where({ id, teamCode })
        .get();
      
      if (!queryResult.data || queryResult.data.length === 0) {
        debugLog('未找到要删除的年度目标');
        return false;
      }
      
      const docId = (queryResult.data[0] as any)._id;
      
      await db.collection(COLLECTIONS.annualGoals).doc(docId).remove();
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
      
      const result = await db.collection(COLLECTIONS.monthlyGoals)
        .where({ teamCode })
        .get();
      return (result.data || []) as TeamMemberMonthlyGoal[];
    } catch (error) {
      debugLog('获取月度目标失败:', error);
      return [];
    }
  },

  // 实时监听月度目标变化
  onSnapshot(teamCode: string, callback: (goals: TeamMemberMonthlyGoal[]) => void) {
    try {
      const listener = db.collection(COLLECTIONS.monthlyGoals)
        .where({ teamCode })
        .watch({
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
      
      const newGoal: TeamMemberMonthlyGoal & { teamCode: string } = {
        ...goal,
        teamCode,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await db.collection(COLLECTIONS.monthlyGoals).add(newGoal);
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
      
      // 先查询获取 docId
      const queryResult = await db.collection(COLLECTIONS.monthlyGoals)
        .where({ id, teamCode })
        .get();
      
      if (!queryResult.data || queryResult.data.length === 0) {
        debugLog('未找到要更新的月度目标');
        return false;
      }
      
      const docId = (queryResult.data[0] as any)._id;
      
      await db.collection(COLLECTIONS.monthlyGoals).doc(docId).update({
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
      
      // 先查询获取 docId 和当前数据
      const queryResult = await db.collection(COLLECTIONS.monthlyGoals)
        .where({ id, teamCode })
        .get();
      
      if (!queryResult.data || queryResult.data.length === 0) {
        debugLog('未找到要更新的月度目标');
        return false;
      }
      
      const docId = (queryResult.data[0] as any)._id;
      const data = queryResult.data[0] as unknown as TeamMemberMonthlyGoal;
      
      await db.collection(COLLECTIONS.monthlyGoals).doc(docId).update({
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
      
      // 先查询获取 docId
      const queryResult = await db.collection(COLLECTIONS.monthlyGoals)
        .where({ id, teamCode })
        .get();
      
      if (!queryResult.data || queryResult.data.length === 0) {
        debugLog('未找到要删除的月度目标');
        return false;
      }
      
      const docId = (queryResult.data[0] as any)._id;
      
      await db.collection(COLLECTIONS.monthlyGoals).doc(docId).remove();
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
      
      const result = await db.collection(COLLECTIONS.weeklyGoals)
        .where({ teamCode })
        .get();
      return (result.data || []) as TeamMemberWeeklyGoal[];
    } catch (error) {
      debugLog('获取周目标失败:', error);
      return [];
    }
  },

  // 实时监听周目标变化
  onSnapshot(teamCode: string, callback: (goals: TeamMemberWeeklyGoal[]) => void) {
    try {
      const listener = db.collection(COLLECTIONS.weeklyGoals)
        .where({ teamCode })
        .watch({
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
      
      const newGoal: TeamMemberWeeklyGoal & { teamCode: string } = {
        ...goal,
        teamCode,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await db.collection(COLLECTIONS.weeklyGoals).add(newGoal);
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
      
      // 先查询获取 docId
      const queryResult = await db.collection(COLLECTIONS.weeklyGoals)
        .where({ id, teamCode })
        .get();
      
      if (!queryResult.data || queryResult.data.length === 0) {
        debugLog('未找到要更新的周目标');
        return false;
      }
      
      const docId = (queryResult.data[0] as any)._id;
      
      await db.collection(COLLECTIONS.weeklyGoals).doc(docId).update({
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
      
      // 先查询获取 docId 和当前数据
      const queryResult = await db.collection(COLLECTIONS.weeklyGoals)
        .where({ id, teamCode })
        .get();
      
      if (!queryResult.data || queryResult.data.length === 0) {
        debugLog('未找到要更新的周目标');
        return false;
      }
      
      const docId = (queryResult.data[0] as any)._id;
      const data = queryResult.data[0] as unknown as TeamMemberWeeklyGoal;
      
      await db.collection(COLLECTIONS.weeklyGoals).doc(docId).update({
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
      
      // 先查询获取 docId
      const queryResult = await db.collection(COLLECTIONS.weeklyGoals)
        .where({ id, teamCode })
        .get();
      
      if (!queryResult.data || queryResult.data.length === 0) {
        debugLog('未找到要删除的周目标');
        return false;
      }
      
      const docId = (queryResult.data[0] as any)._id;
      
      await db.collection(COLLECTIONS.weeklyGoals).doc(docId).remove();
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
