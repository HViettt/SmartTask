
const moment = require('moment-timezone');

/**
 * Chuẩn hóa text (lowercase, trim, GIỮ dấu tiếng Việt)
 * Ví dụ: "Thứ Hai" -> "thứ hai"
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
};

/**
 * Parse Vietnamese time expression
 * Input: "09:00", "9 sáng", "3 chiều", "11:59 tối"
 * Output: "HH:mm" format
 */
const parseVietnameseTime = (timeText) => {
  if (!timeText || timeText.trim().length === 0) {
    return '23:59';
  }

  const normalized = normalizeText(timeText);
  let hour, minute = 0;

  // Pattern 1: HH:mm or H:mm format
  const timeMatch = normalized.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    hour = parseInt(timeMatch[1], 10);
    minute = parseInt(timeMatch[2], 10);
  } else {
    // Pattern 2: "số giờ sáng/trưa/chiều/tối"
    const hourMatch = normalized.match(/(\d{1,2})\s*(sáng|chiều|tối|đêm)/);
    if (hourMatch) {
      hour = parseInt(hourMatch[1], 10);
      const period = hourMatch[2];

      // Adjust hour based on period
      if (period === 'sáng') {
        if (hour === 12) hour = 0;
      } else if (period === 'chiều') {
        if (hour !== 12) hour += 12;
      } else if (period === 'tối' || period === 'đêm') {
        if (hour === 12) hour = 0;
        else hour += 12;
      }
    } else {
      return '23:59';
    }
  }

  // Validate hour and minute
  if (isNaN(hour) || hour < 0 || hour > 23) {
    return '23:59';
  }
  if (isNaN(minute) || minute < 0 || minute > 59) {
    minute = 0;
  }

  const result = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  return result;
};

/**
 * Parse Vietnamese date expression
 * Input: "hôm nay", "ngày mai", "tuần này", "tuần sau", "Thứ 2", etc.
 * Output: moment object (will be converted to ISO date later)
 * 
 * Vietnamese day names:
 * - Thứ 2 (Monday) = 1, Thứ 3 (Tuesday) = 2, ..., Thứ 7 (Saturday) = 6, Chủ nhật (Sunday) = 0 or 7
 * 
 * ⚠️ IMPORTANT: ISO week starts on Monday (1) in moment.js with .isoWeekday()
 */
const parseVietnameseDate = (dateText) => {
  if (!dateText || dateText.trim().length === 0) {
    return moment.tz('Asia/Ho_Chi_Minh').startOf('day');
  }

  const normalized = normalizeText(dateText);
  const today = moment.tz('Asia/Ho_Chi_Minh').startOf('day');

  // ⚠️ Check for temporal adverb "trước" (before) - MUST process FIRST
  const hasBefore = normalized.includes('trước');

  // Map Vietnamese day names to ISO weekday (Monday = 1, Sunday = 7)
  const dayMap = {
    'thứ 2': 1,
    'thứ ba': 2,
    'thứ 3': 2,
    'thứ tư': 3,
    'thứ 4': 3,
    'thứ năm': 4,
    'thứ 5': 4,
    'thứ sáu': 5,
    'thứ 6': 5,
    'thứ bảy': 6,
    'thứ 7': 6,
    'chủ nhật': 7,
    'cn': 7
  };

  // Case 1: "hôm nay" (today)
  if (normalized.includes('hôm nay')) {
    return today;
  }

  // Case 2: "ngày mai" (tomorrow)
  if (normalized.includes('ngày mai') || normalized.includes('mai')) {
    const tomorrow = today.clone().add(1, 'day');
    return tomorrow;
  }

  // Case 3: Day names with "tuần sau" or "tuần này"
  // Examples: "Thứ 2 tuần sau", "thứ 5 tuần này"
  const hasNextWeek = normalized.includes('tuần sau');
  const hasThisWeek = normalized.includes('tuần này');

  let targetIsoWeekday = null;
  for (const [vietnameseName, isoDay] of Object.entries(dayMap)) {
    if (normalized.includes(vietnameseName)) {
      targetIsoWeekday = isoDay;
      break;
    }
  }

  if (targetIsoWeekday !== null) {
    let result;
    
    if (hasNextWeek) {
      // Next ISO week: 
      // 1. Go to Monday of next week
      // 2. Then set the target day
      // ISO week starts on Monday (isoWeekday 1 = Monday)
      const nextIsoWeekMonday = today.clone().add(1, 'isoWeek').startOf('isoWeek');
      result = nextIsoWeekMonday.clone().isoWeekday(targetIsoWeekday);
      
      if (hasBefore) {
        result.subtract(1, 'day');
      }
      return result;
    } else if (hasThisWeek) {
      let result = today.clone().isoWeekday(targetIsoWeekday);
      
      if (hasBefore) {
        result.subtract(1, 'day');
      }
      return result;
    } else {
      let result = today.clone().isoWeekday(targetIsoWeekday);
      
      if (result.isBefore(today, 'day')) {
        result.add(1, 'week');
      }
      
      if (hasBefore) {
        result.subtract(1, 'day');
      }
      return result;
    }
  }

  // Case 4: Standalone "tuần này" or "tuần sau" (without day name)
  if (hasNextWeek) {
    const nextMonday = today.clone().isoWeekday(1).add(1, 'week');
    return nextMonday;
  }

  if (hasThisWeek) {
    const thisMonday = today.clone().isoWeekday(1);
    return thisMonday;
  }

  // Fallback: use today
  return today;
};

/**
 * ============================================================================
 * MAIN FUNCTION: resolveVietnameseDate
 * ============================================================================
 * 
 * Input:
 *   dateText: string (e.g. "Thứ 2 tuần sau", "ngày mai")
 *   timeText: string (e.g. "09:00", "9 sáng")
 * 
 * Output:
 *   ISO 8601 datetime string (e.g. "2026-01-12T09:00:00+07:00")
 * 
 * Usage:
 *   const deadline = resolveVietnameseDate("Thứ 2 tuần sau", "09:00");
 *   // → "2026-01-12T09:00:00+07:00"
 */
const resolveVietnameseDate = (dateText, timeText) => {
  const parsedDate = parseVietnameseDate(dateText);

  // Parse time (returns "HH:mm" string)
  const parsedTime = parseVietnameseTime(timeText);

  // Combine: set time on the parsed date
  parsedDate.set({
    hour: parseInt(parsedTime.split(':')[0], 10),
    minute: parseInt(parsedTime.split(':')[1], 10),
    second: 0,
    millisecond: 0
  });

  // Convert to ISO 8601 with timezone info
  const isoDateTime = parsedDate.toISOString();
  
  return isoDateTime;
};

/**
 * Export functions
 */
module.exports = {
  resolveVietnameseDate,
  parseVietnameseDate,
  parseVietnameseTime,
  normalizeText
};
