import React, { useState } from 'react';
import { useTeam } from '@/context/TeamContext';
import { Users, Plus, LogIn, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const TeamGate: React.FC = () => {
  const [mode, setMode] = useState<'join' | 'create'>('join');
  const [inputCode, setInputCode] = useState('');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  
  // 关键：确认 useTeam 正确获取
  const { createTeam, joinTeam } = useTeam();

  // 关键：添加调试日志
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 阻止事件冒泡
    
    console.log('[TeamGate] 尝试加入团队:', inputCode);
    setError('');
    
    if (!inputCode.trim()) {
      setError('请输入团队码');
      return;
    }
    
    try {
      const ok = await joinTeam(inputCode);
      console.log('[TeamGate] 加入团队结果:', ok);
      if (!ok) setError('团队码不存在，请检查');
    } catch (err) {
      console.error('[TeamGate] 加入团队出错:', err);
      setError('操作失败，请重试');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 阻止事件冒泡
    
    console.log('[TeamGate] 尝试创建团队:', teamName);
    setError('');
    
    if (teamName.trim().length < 2) {
      setError('团队名称至少2个字');
      return;
    }
    
    try {
      const code = await createTeam(teamName.trim());
      console.log('[TeamGate] 创建团队成功:', code);
      setSuccess(`团队创建成功！团队码：${code}`);
    } catch (err) {
      console.error('[TeamGate] 创建团队出错:', err);
      setError('创建失败，请重试');
    }
  };

  const copyLink = () => {
    const match = success.match(/团队码：([A-Z0-9]{8})/);
    const code = match ? match[1] : '';
    if (code) {
      const link = `${window.location.origin}/?team=${code}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">团队目标管理系统</CardTitle>
          <p className="text-sm text-slate-500 mt-2">V23 · CloudBase 实时同步</p>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
            <Button
              type="button"
              variant={mode === 'join' ? 'default' : 'ghost'}
              onClick={() => { setMode('join'); setError(''); setSuccess(''); }}
              className={`flex-1 ${mode === 'join' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
            >
              <LogIn className="w-4 h-4 mr-2" />
              加入团队
            </Button>
            <Button
              type="button"
              variant={mode === 'create' ? 'default' : 'ghost'}
              onClick={() => { setMode('create'); setError(''); setSuccess(''); }}
              className={`flex-1 ${mode === 'create' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              创建团队
            </Button>
          </div>

          {mode === 'join' ? (
            <form onSubmit={handleJoin} className="space-y-4">
              <Input
                placeholder="输入团队码（如：WVKN1I39）"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="text-center tracking-widest uppercase text-lg font-mono"
              />
              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                加入团队
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                placeholder="输入团队名称"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                创建团队
              </Button>
            </form>
          )}

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
              <p className="text-sm font-medium text-green-700 text-center">{success}</p>
              <div className="flex items-center gap-2 p-2 bg-white rounded border">
                <code className="flex-1 text-xs font-mono text-slate-700">
                  {window.location.origin}/?team={success.match(/[A-Z0-9]{8}/)?.[0]}
                </code>
                <Button type="button" size="sm" variant="ghost" onClick={copyLink}>
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-green-600 text-center">
                复制链接分享给团队成员，或保存团队码
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};