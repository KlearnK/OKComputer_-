import { 
  Bug, 
  X, 
  RefreshCw, 
  Trash2, 
  Wifi, 
  WifiOff, 
  Cloud,
  CloudOff,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DebugLog {
  id: string;
  time: string;
  message: string;
  data?: any;
}

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
  debugLogs: DebugLog[];
  isOnline: boolean;
  isCloudConnected: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  teamCode: string | null;
  membersCount: number;
  annualGoalsCount: number;
  monthlyGoalsCount: number;
  weeklyGoalsCount: number;
  onRefresh: () => void;
  onClearLogs: () => void;
  onCheckConnection: () => void;
}

export function DebugPanel({
  isOpen,
  onClose,
  debugLogs,
  isOnline,
  isCloudConnected,
  syncStatus,
  teamCode,
  membersCount,
  annualGoalsCount,
  monthlyGoalsCount,
  weeklyGoalsCount,
  onRefresh,
  onClearLogs,
  onCheckConnection,
}: DebugPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-lg">调试面板</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* 状态概览 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <div>
                <p className="text-xs text-slate-500">网络状态</p>
                <p className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {isOnline ? '在线' : '离线'}
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-2">
              {isCloudConnected ? (
                <Cloud className="w-4 h-4 text-green-500" />
              ) : (
                <CloudOff className="w-4 h-4 text-red-500" />
              )}
              <div>
                <p className="text-xs text-slate-500">云端连接</p>
                <p className={`text-sm font-medium ${isCloudConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isCloudConnected ? '已连接' : '未连接'}
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-2">
              {syncStatus === 'synced' ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : syncStatus === 'syncing' ? (
                <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
              ) : syncStatus === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-slate-300" />
              )}
              <div>
                <p className="text-xs text-slate-500">同步状态</p>
                <p className={`text-sm font-medium ${
                  syncStatus === 'synced' ? 'text-green-600' :
                  syncStatus === 'syncing' ? 'text-blue-600' :
                  syncStatus === 'error' ? 'text-red-600' :
                  'text-slate-600'
                }`}>
                  {syncStatus === 'synced' ? '已同步' :
                   syncStatus === 'syncing' ? '同步中' :
                   syncStatus === 'error' ? '错误' :
                   '空闲'}
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500">团队码</p>
              <p className="text-sm font-medium font-mono">{teamCode || '-'}</p>
            </div>
          </div>
          
          {/* 数据统计 */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-indigo-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-indigo-600">{membersCount}</p>
              <p className="text-xs text-indigo-500">成员</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-blue-600">{annualGoalsCount}</p>
              <p className="text-xs text-blue-500">年度目标</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-purple-600">{monthlyGoalsCount}</p>
              <p className="text-xs text-purple-500">月度目标</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-amber-600">{weeklyGoalsCount}</p>
              <p className="text-xs text-amber-500">周目标</p>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh} className="flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" />
              刷新数据
            </Button>
            <Button variant="outline" size="sm" onClick={onCheckConnection} className="flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5" />
              检查连接
            </Button>
            <Button variant="outline" size="sm" onClick={onClearLogs} className="flex items-center gap-1 ml-auto">
              <Trash2 className="w-3.5 h-3.5" />
              清空日志
            </Button>
          </div>
          
          {/* 调试日志 */}
          <div className="flex-1 border rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3 py-2 border-b flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">调试日志</span>
              <Badge variant="secondary" className="text-xs">{debugLogs.length} 条</Badge>
            </div>
            <ScrollArea className="h-64">
              <div className="p-2 space-y-1">
                {debugLogs.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">暂无日志</p>
                ) : (
                  debugLogs.map((log) => (
                    <div key={log.id} className="text-xs font-mono bg-slate-50 rounded p-2">
                      <span className="text-slate-400">[{log.time}]</span>{' '}
                      <span className="text-slate-700">{log.message}</span>
                      {log.data && (
                        <pre className="mt-1 text-slate-500 text-[10px] overflow-x-auto">
                          {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : String(log.data)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
