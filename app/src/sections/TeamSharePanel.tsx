import { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Users, 
  Link2, 
  QrCode,
  RefreshCw,
  AlertCircle,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { createNewTeam } from '@/cloudbase/teamCode';

interface TeamSharePanelProps {
  teamCode: string | null;
  shareLink: string;
  isOnline: boolean;
}

export function TeamSharePanel({ teamCode, shareLink, isOnline }: TeamSharePanelProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // 复制分享链接
  const handleCopyLink = async () => {
    if (!shareLink) return;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.error('复制链接失败:', error);
    }
  };

  // 复制团队码
  const handleCopyCode = async () => {
    if (!teamCode) return;
    
    try {
      await navigator.clipboard.writeText(teamCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      console.error('复制团队码失败:', error);
    }
  };

  // 创建新团队
  const handleCreateNewTeam = () => {
    if (confirm('创建新团队后，当前团队数据将不再显示。确定要创建新团队吗？')) {
      createNewTeam();
      window.location.reload();
    }
  };

  // 生成二维码数据（使用 Google Chart API）
  const qrCodeUrl = shareLink 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareLink)}`
    : '';

  return (
    <Card className="shadow-md border-indigo-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Share2 className="w-5 h-5 text-indigo-600" />
            团队协作
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                离线模式
              </Badge>
            )}
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
              <Users className="w-3 h-3 mr-1" />
              实时同步
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 团队码显示 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-1">
            团队码
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>团队成员可通过此团队码加入，或通过下方链接直接访问</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={teamCode || ''}
                readOnly
                className="font-mono text-lg tracking-wider bg-slate-50 border-slate-200 pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Badge variant="outline" className="text-xs">
                  8位
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyCode}
              className="shrink-0"
            >
              {copiedCode ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* 分享链接 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">分享链接</Label>
          <div className="flex gap-2">
            <Input
              value={shareLink}
              readOnly
              className="flex-1 bg-slate-50 border-slate-200 text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              className="shrink-0"
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4" />
                二维码
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>团队分享二维码</DialogTitle>
                <DialogDescription>
                  扫描二维码即可加入团队，实时同步团队目标数据
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center py-6">
                {qrCodeUrl ? (
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <img 
                      src={qrCodeUrl} 
                      alt="团队分享二维码" 
                      className="w-48 h-48"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-slate-400">加载中...</span>
                  </div>
                )}
                <p className="mt-4 text-sm text-slate-500 text-center">
                  团队码: <span className="font-mono font-semibold text-slate-700">{teamCode}</span>
                </p>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1.5"
            onClick={handleCreateNewTeam}
          >
            <RefreshCw className="w-4 h-4" />
            新建团队
          </Button>
        </div>

        {/* 说明文字 */}
        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
          <p className="flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-500" />
            <span>
              <strong>使用说明：</strong>将团队码或分享链接发送给团队成员，
              他们可以通过链接直接访问，数据会自动实时同步给所有在线成员。
              离线时也可操作，联网后会自动合并数据。
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
