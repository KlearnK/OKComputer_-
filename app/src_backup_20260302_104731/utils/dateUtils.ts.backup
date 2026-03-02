import { format, parseISO, getISOWeek, getYear, startOfWeek, endOfWeek, eachMonthOfInterval, startOfYear, endOfYear } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 获取当前ISO8601年份和周数
export const getCurrentISOWeek = () => {
  const now = new Date();
  const year = getYear(now);
  const week = getISOWeek(now);
  return {
    year,
    week,
    weekISO: `${year}-W${week.toString().padStart(2, '0')}`,
  };
};

// 获取当前ISO8601月份
export const getCurrentISOMonth = () => {
  const now = new Date();
  return format(now, 'yyyy-MM');
};

// 获取指定年份的所有月份（ISO8601格式）
export const getYearMonths = (year: number) => {
  const start = startOfYear(new Date(year, 0, 1));
  const end = endOfYear(new Date(year, 0, 1));
  const months = eachMonthOfInterval({ start, end });
  return months.map(month => ({
    date: month,
    monthISO: format(month, 'yyyy-MM'),
    monthName: format(month, 'MMMM', { locale: zhCN }),
    monthNum: month.getMonth() + 1,
  }));
};

// 获取指定年月的周信息（ISO8601格式）
export const getMonthWeeks = (year: number, month: number) => {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  const weeks = [];
  
  let currentDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // 周一为每周第一天
  
  while (currentDate <= monthEnd) {
    const weekNum = getISOWeek(currentDate);
    const weekYear = getYear(currentDate);
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    
    weeks.push({
      weekISO: `${weekYear}-W${weekNum.toString().padStart(2, '0')}`,
      weekNum,
      year: weekYear,
      startDate: format(weekStart, 'yyyy-MM-dd'),
      endDate: format(weekEnd, 'yyyy-MM-dd'),
      startDateDisplay: format(weekStart, 'MM/dd'),
      endDateDisplay: format(weekEnd, 'MM/dd'),
    });
    
    // 移动到下一周
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 7);
    
    // 如果已经超出月份范围，停止
    if (currentDate > monthEnd && weeks.length > 0) {
      const lastWeekStart = startOfWeek(monthEnd, { weekStartsOn: 1 });
      if (lastWeekStart > new Date(weeks[weeks.length - 1].startDate)) {
        const lastWeekNum = getISOWeek(monthEnd);
        const lastWeekYear = getYear(monthEnd);
        const lastWeekEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
        
        weeks.push({
          weekISO: `${lastWeekYear}-W${lastWeekNum.toString().padStart(2, '0')}`,
          weekNum: lastWeekNum,
          year: lastWeekYear,
          startDate: format(lastWeekStart, 'yyyy-MM-dd'),
          endDate: format(lastWeekEnd, 'yyyy-MM-dd'),
          startDateDisplay: format(lastWeekStart, 'MM/dd'),
          endDateDisplay: format(lastWeekEnd, 'MM/dd'),
        });
      }
      break;
    }
  }
  
  return weeks;
};

// 解析ISO8601周格式
export const parseISOWeek = (weekISO: string) => {
  const match = weekISO.match(/^(\d{4})-W(\d{2})$/);
  if (!match) throw new Error('Invalid ISO week format');
  
  const year = parseInt(match[1]);
  const week = parseInt(match[2]);
  
  // 计算该周的起始日期（ISO8601周一为每周第一天）
  const janFirst = new Date(year, 0, 1);
  const days = (week - 1) * 7;
  
  // 调整到该周的起始
  const weekStart = new Date(janFirst);
  weekStart.setDate(janFirst.getDate() + days);
  
  // 调整到周一
  const monday = startOfWeek(weekStart, { weekStartsOn: 1 });
  const sunday = endOfWeek(weekStart, { weekStartsOn: 1 });
  
  return {
    year,
    week,
    startDate: format(monday, 'yyyy-MM-dd'),
    endDate: format(sunday, 'yyyy-MM-dd'),
  };
};

// 格式化日期显示
export const formatDateDisplay = (dateStr: string) => {
  try {
    const date = parseISO(dateStr);
    return format(date, 'yyyy年M月d日', { locale: zhCN });
  } catch {
    return dateStr;
  }
};

// 获取周显示名称
export const getWeekDisplayName = (weekISO: string) => {
  try {
    const parsed = parseISOWeek(weekISO);
    const startDate = parseISO(parsed.startDate);
    const endDate = parseISO(parsed.endDate);
    
    return `${format(startDate, 'M/d', { locale: zhCN })} - ${format(endDate, 'M/d', { locale: zhCN })}`;
  } catch {
    return weekISO;
  }
};

// 获取月份显示名称
export const getMonthDisplayName = (monthISO: string) => {
  try {
    const date = parseISO(monthISO + '-01');
    return format(date, 'yyyy年M月', { locale: zhCN });
  } catch {
    return monthISO;
  }
};
