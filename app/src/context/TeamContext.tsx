import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/cloudbase/config';

interface TeamContextType {
  teamCode: string | null;
  teamName: string | null;
  isLoading: boolean;
  createTeam: (name: string) => Promise<string>;
  joinTeam: (code: string) => Promise<boolean>;
  exitTeam: () => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

const generateTeamCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teamCode, setTeamCode] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      console.log('[TeamContext] 初始化...');
      
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('team');
      const storedCode = localStorage.getItem('teamCode');
      const code = urlCode || storedCode;

      console.log('[TeamContext] 检查团队码:', code);

      if (code) {
        try {
          const result = await db.collection('teams')
            .where({ 'data.code': code.toUpperCase() })
            .get();
          
          console.log('[TeamContext] 查询结果:', result);
          
          if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
            const doc = result.data[0];
            const teamData = doc.data || doc;
            
            console.log('[TeamContext] 找到团队:', teamData);
            
            setTeamCode(code.toUpperCase());
            setTeamName(teamData.name || doc.name || '未命名团队');
            localStorage.setItem('teamCode', code.toUpperCase());
            window.history.replaceState({}, '', `/?team=${code.toUpperCase()}`);
          } else {
            console.log('[TeamContext] 团队码无效，清除存储');
            localStorage.removeItem('teamCode');
          }
        } catch (error) {
          console.error('[TeamContext] 查询团队失败:', error);
          localStorage.removeItem('teamCode');
        }
      }
      
      setIsLoading(false);
    };

    init();
  }, []);

  const createTeam = async (name: string): Promise<string> => {
    console.log('[TeamContext] 创建团队:', name);
    
    try {
      const code = generateTeamCode();
      console.log('[TeamContext] 生成团队码:', code);
      
      const teamData = {
        code: code,
        name: name.trim(),
        createdAt: new Date().toISOString(),
      };
      
      console.log('[TeamContext] 准备存储:', teamData);
      
      const result = await db.collection('teams').add({
        data: teamData
      });
      
      console.log('[TeamContext] 创建结果:', result);
      
      setTeamCode(code);
      setTeamName(name.trim());
      localStorage.setItem('teamCode', code);
      window.history.replaceState({}, '', `/?team=${code}`);
      return code;
      
    } catch (error) {
      console.error('[TeamContext] 创建团队失败:', error);
      throw error;
    }
  };

  const joinTeam = async (code: string): Promise<boolean> => {
    console.log('[TeamContext] 加入团队:', code);
    
    try {
      const upperCode = code.toUpperCase().trim();
      console.log('[TeamContext] 查询团队码:', upperCode);
      
      const result = await db.collection('teams')
        .where({ 'data.code': upperCode })
        .limit(1)
        .get();
      
      console.log('[TeamContext] 查询结果:', result);
      
      if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
        const doc = result.data[0];
        const teamData = doc.data || doc;
        
        console.log('[TeamContext] 找到团队:', teamData);
        
        setTeamCode(upperCode);
        setTeamName(teamData.name || doc.name || '未命名团队');
        localStorage.setItem('teamCode', upperCode);
        window.history.replaceState({}, '', `/?team=${upperCode}`);
        return true;
      }
      
      console.log('[TeamContext] 团队不存在');
      return false;
    } catch (error) {
      console.error('[TeamContext] 加入团队失败:', error);
      return false;
    }
  };

  const exitTeam = () => {
    setTeamCode(null);
    setTeamName(null);
    localStorage.removeItem('teamCode');
    window.history.replaceState({}, '', '/');
  };

  return (
    <TeamContext.Provider value={{ teamCode, teamName, isLoading, createTeam, joinTeam, exitTeam }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) throw new Error('useTeam must be used within TeamProvider');
  return context;
};