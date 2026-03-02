import { db, anonymousAuth } from './config';
import type { 
  TeamMember, 
  TeamMemberAnnualGoal, 
  TeamMemberMonthlyGoal, 
  TeamMemberWeeklyGoal 
} from '@/types/team';

// 生成唯一ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// 集合名称（按团队码分表）
const getCollectionName = (teamCode: string, collection: string) => `${teamCode}_${collection}`;

/**
 * 确保匿名登录
 */
const ensureAuth = async (): Promise<void> => {
  await anonymousAuth();
};

/**
 * 团队成员相关操作
 */
export const memberDB = {
  // 获取所有成员
  async getAll(teamCode: string): Promise<TeamMember[]> {
    await ensureAuth();
    const collectionName = getCollectionName(teamCode, 'members');
    const { data } = await db.collection(collectionName).get();
    return (data || []) as TeamMember[];
  },

  // 实时监听成员变化
  onSnapshot(teamCode: string, callback: (members: TeamMember[]) => void) {
    const collectionName = getCollectionName(teamCode, 'members');
    const listener = db.collection(collectionName).watch({
      onChange: (snapshot) => {
        callback((snapshot.docs || []) as TeamMember[]);
      },
      onError: (err) => {
        console.error('成员监听错误:', err);
      },
    });
    return listener;
  },

  // 创建成员
  async create(teamCode: string, member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMember> {
    await ensureAuth();
    const collectionName = getCollectionName(teamCode, 'members');
    const newMember: TeamMember = {
      ...member,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.collection(collectionName).add(newMember);
    return newMember;
  },

  // 更新成员
  async update(teamCode: string, id: string, updates: Partial<TeamMember>): Promise<void> {
    await ensureAuth();
    const collectionName = getCollectionName(teamCode, 'members');
    await db.collection(collectionName).doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  // 删除成员
  async delete(teamCode: string, id: string): Promise<void> {
    await ensureAuth();
    const collectionName = getCollectionName(teamCode, 'members');
    await db.collection(collectionName).doc(id).remove();
  },
};

/**
 * 年度目标相关操作
 */
export const annualGoalDB = {
  // 获取所有年度目标
  async getAll(teamCode: string): Promise<TeamMemberAnnualGoal[]> {
    await ensureAuth();
    const collectionName = getCollectionName(teamCode, 'annual_goals');
    const { data } = await db.collection(collectionName).get();
    return (data || []) as TeamMemberAnnualGoal[];
  },

  // 实时监听年度目标变化
  onSnapshot(teamCode: string, callback: (goals: TeamMemberAnnualGoal[]) => void) {
    const collectionName = getCollectionName(teamCode, 'annual_goals');
    const listener = db.collection(collectionName).watch({
      onChange: (snapshot) => {
        callback((snapshot.docs || []) as TeamMemberAnnualGoal[]);
      },
      onError: (err) => {
        console.error('年度目标监听错误:', err);
      },
    });
    return listener;
  },

  // 创建年度目标
  async create(teamCode: string, goal: Omit<TeamMemberAnnualGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMemberAnnualGoal> {
    await ensureAuth();
    const collectionName = getCollectionName(teamCode, 'annual_goals');
    const newGoal: TeamMemberAnnualGoal = {
      ...goal,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.collection(collectionName).add(newGoal);
    return newGoal;
  },

  // 更新年度目标
  async update(teamCode: string, id: string, updates: Partial<TeamMemberAnnualGoal>): Promise<void> {
    await ensureAuth();
    const collectionName = getCollectionName(teamCode, 'annual_goals');
    await db.collection(collectionName).doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  // 更新年度目标实际完成
  async updateActual(
    teamCode: string, 
    id: string, 
    actualBreakdown: Partial<TeamMemberAnnualGoal['breakdownGoals']>, 
    actualExecution: Partial<TeamMemberAnnualGoal['executionGoals']>
  ): Promise<void> {
    await ensureAuth();
    const collectionName = getCollectionName(teamCode, 'annual_goals');
    const doc = await db.collection(collectionName).doc(id).get();
    const data = doc.data as unknown as TeamMemberAnnualGoal;
    await db.collection(collectionName).doc(id).update({
      actualBreakdown: { ...data.actualBreakdown, ...actualBreakdown },
      actualExecution: { ...data.actualExecution, ...actualExecution },
      updatedAt: new Date().toISOString(),
    });
  },

  // 删除年度目标
  async delete(teamCode: string, id: string): Promise<void> {
    await ensureAuth();
    const collectionName = getCollectionName(teamCode, 'annual_goals');
    await db.collection(collectionName).doc(id).remove();
  },
};

/**
 * 月度目标相关操作
 */
export const monthlyGoalDB = {
  // 获取所有月度目标
  async getAll(teamCode: string): Promise<TeamMemberMonthlyGoal[]> {
    await ensureAuth();
    const collectionName = getCollectionName(teamCode, 'monthly_goals');
    const { data } = await db.collection(collectionName).get();
    return (data || []) as TeamMemberMonthlyGoal[];
  },

  // 实时监听月度目标变化
  onSnapshot(teamCode: string, callback: (goals: TeamMemberMonthlyGoal[]) => void) {
    const collectionName = getCollectionName(teamCode, 'monthly_goals');
    const listener = db.collection(collectionName).watch({
      onChange: (snapshot) => {
        callback((snapshot.docs || []) as TeamMemberMonthlyGoal[]);
      },
      onError: (err) => {
        console.error('月度目标监听错误:', err);
      },
    });
    return listener;
  },

  // 创建月度目标
  async create(teamCode: string, goal: Omit<TeamMemberMonthlyGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMemberMonthlyGoal> {
    await ensureAuth();
    const collectionName = getCollectionName(teamCode, 'monthly_goals');
    const newGoal: TeamMemberMonthlyGoal = {
      ...goal,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.collection(collectionName).add(newGoal);
    return newGoal;
  },

  // 更新月度目标
  async update(teamCode: string, id: string, updates: Partial<TeamMemberMonthlyGoal>): Promise<void> {
    await ensureAuth();
    const collectionName = getCollectionName(teamCode, 'monthly_goals');
    await db.collection(collectionName).doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  // 更新月度目标实际完成
  async updateActual(
    teamCode: string, 
    id: string, 
    actualBreakdown: Partial<TeamMemberMonthlyGoal['breakdownGoals']>, 
    actualExecution: Partial<TeamMemberMonthlyGoal['executionGoals']>
  ): Promise<void> {
    await ensureAuth();
    const collectionName = getCollectionName(teamCode, 'monthly_goals');
    const doc = await db.collection(collectionName).doc(id).get();
    const data = doc.data as unknown as TeamMemberMonthlyGoal;
    await db.collection(collectionName).doc(id).update({
      actualBreakdown: { ...data.actualBreakdown, ...actualBreakdown },
      actualExecution: { ...data.actualExecution, ...actualExecution },
      updatedAt: new Date().toISOString(),
    });
  },

  // 删除月度目标
  async delete(teamCode: string, id: string): Promise<void> {
    await ensureAuth();
    const collectionName = getCollectionName(teamCode, 'monthly_goals');
    await db.collection(collectionName).doc(id).remove();
  },
};

/**
 * 周目标相关操作
 */
export const weeklyGoalDB = {
  // 获取所有周目标
  async getAll(teamCode: string): Promise<TeamMemberWeeklyGoal[]> {
    await ensureAuth();
    const collectionName = getCollectionName(teamCode, 'weekly_goals');
    const { data } = await db.collection(collectionName).get();
    return (data || []) as TeamMemberWeeklyGoal[];
  },

  // 实时监听周目标变化
  onSnapshot(teamCode: string, callback: (goals: TeamMemberWeeklyGoal[]) => void) {
    const collectionName = getCollectionName(teamCode, 'weekly_goals');
    const listener = db.collection(collectionName).watch({
      onChange: (snapshot) => {
        callback((snapshot.docs || []) as TeamMemberWeeklyGoal[]);
      },
      onError: (err) => {
        console.error('周目标监听错误:', err);
      },
    });
    return listener;
  },

  // 创建周目标
  async create(teamCode: string, goal: Omit<TeamMemberWeeklyGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMemberWeeklyGoal> {
    await ensureAuth();
    const collectionName = getCollectionName(teamCode, 'weekly_goals');
    const newGoal: TeamMemberWeeklyGoal = {
      ...goal,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.collection(collectionName).add(newGoal);
    return newGoal;
  },

  // 更新周目标
  async update(teamCode: string, id: string, updates: Partial<TeamMemberWeeklyGoal>): Promise<void> {
    await ensureAuth();
    const collectionName = getCollectionName(teamCode, 'weekly_goals');
    await db.collection(collectionName).doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  // 更新周目标实际完成
  async updateActual(
    teamCode: string, 
    id: string, 
    actualBreakdown: Partial<TeamMemberWeeklyGoal['breakdownGoals']>, 
    actualExecution: Partial<TeamMemberWeeklyGoal['executionGoals']>
  ): Promise<void> {
    await ensureAuth();
    const collectionName = getCollectionName(teamCode, 'weekly_goals');
    const doc = await db.collection(collectionName).doc(id).get();
    const data = doc.data as unknown as TeamMemberWeeklyGoal;
    await db.collection(collectionName).doc(id).update({
      actualBreakdown: { ...data.actualBreakdown, ...actualBreakdown },
      actualExecution: { ...data.actualExecution, ...actualExecution },
      updatedAt: new Date().toISOString(),
    });
  },

  // 删除周目标
  async delete(teamCode: string, id: string): Promise<void> {
    await ensureAuth();
    const collectionName = getCollectionName(teamCode, 'weekly_goals');
    await db.collection(collectionName).doc(id).remove();
  },
};

/**
 * 初始化团队数据（创建必要的集合）
 */
export const initTeamData = async (teamCode: string): Promise<void> => {
  await ensureAuth();
  
  // CloudBase 数据库集合是自动创建的，不需要手动创建
  // 这里可以添加一些初始化数据
  console.log('团队数据初始化完成:', teamCode);
};

export default {
  memberDB,
  annualGoalDB,
  monthlyGoalDB,
  weeklyGoalDB,
  initTeamData,
};
