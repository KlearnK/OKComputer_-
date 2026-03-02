import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface ProgressData {
  label: string;
  breakdownProgress: number;
  executionProgress: number;
}

interface ProgressChartProps {
  data: ProgressData[];
  title: string;
  type: 'bar' | 'line';
}

export interface ProgressChartRef {
  exportImage: (filename: string) => void;
}

export const ProgressChart = forwardRef<ProgressChartRef, ProgressChartProps>(
  ({ data, title, type }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      exportImage: (filename: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 设置画布尺寸 - 使用固定尺寸避免缩放问题
      const width = 800;
      const height = 320;
      canvas.width = width;
      canvas.height = height;

      const padding = { top: 50, right: 30, bottom: 80, left: 60 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // 清空画布
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // 绘制标题
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#334155';
      ctx.textAlign = 'center';
      ctx.fillText(title, width / 2, 30);

      if (data.length === 0) {
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('暂无数据', width / 2, height / 2);
        return;
      }

      // 绘制坐标轴
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;

      // Y轴
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top);
      ctx.lineTo(padding.left, height - padding.bottom);
      ctx.stroke();

      // X轴
      ctx.beginPath();
      ctx.moveTo(padding.left, height - padding.bottom);
      ctx.lineTo(width - padding.right, height - padding.bottom);
      ctx.stroke();

      // Y轴刻度和标签
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'right';
      for (let i = 0; i <= 5; i++) {
        const y = height - padding.bottom - (i * chartHeight / 5);
        const value = i * 20;
        
        ctx.beginPath();
        ctx.moveTo(padding.left - 5, y);
        ctx.lineTo(padding.left, y);
        ctx.stroke();
        
        ctx.fillText(`${value}%`, padding.left - 10, y + 4);
      }

      // 绘制数据
      const barWidth = chartWidth / data.length * 0.35;
      const barSpacing = chartWidth / data.length;

      data.forEach((item, index) => {
        const x = padding.left + (index * barSpacing) + barSpacing * 0.1;
        
        if (type === 'bar') {
          // 拆解进度条
          const breakdownHeight = (item.breakdownProgress / 100) * chartHeight;
          ctx.fillStyle = '#6366f1';
          ctx.fillRect(x, height - padding.bottom - breakdownHeight, barWidth, breakdownHeight);

          // 执行进度条
          const executionHeight = (item.executionProgress / 100) * chartHeight;
          ctx.fillStyle = '#10b981';
          ctx.fillRect(x + barWidth + 4, height - padding.bottom - executionHeight, barWidth, executionHeight);
        }

        // X轴标签
        ctx.save();
        ctx.translate(x + barWidth, height - padding.bottom + 20);
        ctx.rotate(-Math.PI / 4);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'right';
        ctx.fillText(item.label, 0, 0);
        ctx.restore();

        // 在柱子顶部显示数值
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        
        // 拆解进度数值
        const breakdownHeight = (item.breakdownProgress / 100) * chartHeight;
        ctx.fillStyle = '#6366f1';
        ctx.fillText(`${item.breakdownProgress.toFixed(0)}%`, x + barWidth / 2, height - padding.bottom - breakdownHeight - 5);
        
        // 执行进度数值
        const executionHeight = (item.executionProgress / 100) * chartHeight;
        ctx.fillStyle = '#10b981';
        ctx.fillText(`${item.executionProgress.toFixed(0)}%`, x + barWidth + 4 + barWidth / 2, height - padding.bottom - executionHeight - 5);
      });

      // 绘制图例
      const legendY = height - 25;
      
      // 拆解进度图例
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(width / 2 - 100, legendY, 15, 15);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#334155';
      ctx.textAlign = 'left';
      ctx.fillText('拆解进度', width / 2 - 80, legendY + 12);

      // 执行进度图例
      ctx.fillStyle = '#10b981';
      ctx.fillRect(width / 2 + 10, legendY, 15, 15);
      ctx.fillStyle = '#334155';
      ctx.fillText('执行进度', width / 2 + 30, legendY + 12);

    }, [data, title, type]);

    return (
      <div className="w-full overflow-x-auto">
        <canvas
          ref={canvasRef}
          className="mx-auto"
          style={{ width: '100%', maxWidth: '800px', height: '320px' }}
        />
      </div>
    );
  }
);

ProgressChart.displayName = 'ProgressChart';

// 导出图表为图片
export const exportChartAsImage = (canvas: HTMLCanvasElement, filename: string) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
};
