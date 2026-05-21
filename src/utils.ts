/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Returns today's Date object shifted to Korea Standard Time (Asia/Seoul, UTC+9).
 * The returned date object's local fields (e.g., getFullYear, getMonth, getDate, getDay)
 * will evaluate to Korea Standard Time.
 */
export function getTodayKST(): Date {
  const now = new Date();
  // Get current UTC time in milliseconds
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  // Add 9 hours for KST
  const kstOffset = 9 * 60 * 60 * 1000;
  return new Date(utc + kstOffset);
}

/**
 * Formats a Date object as "5월 15일 금요일"
 */
export function formatKoreanDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayName = getKoreanDayOfWeek(date);
  return `${month}월 ${day}일 ${dayName}요일`;
}

/**
 * Formats a Date object as "YYYYMMDD" for API integration
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Returns an array of Date objects representing Monday to Friday of the week containing of the given date.
 */
export function getWeekDates(date: Date): Date[] {
  const currentDay = date.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
  
  // Calculate difference to get Monday
  // If today is Sunday (0), Monday is 6 days ago (-6)
  // Otherwise it's 1 - currentDay (e.g. Wednesday(3) -> 1 - 3 = -2 days)
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);
  
  const weekDates: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d);
  }
  return weekDates;
}

/**
 * Returns "M월 N주차" for a given date
 */
export function getWeekOfMonth(date: Date): string {
  const targetYear = date.getFullYear();
  const targetMonth = date.getMonth(); // 0-indexed
  
  // Find the first day of the month
  const firstDayOfMonth = new Date(targetYear, targetMonth, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 1 is Monday, ...
  
  const day = date.getDate();
  
  // Standard Korean school calendar calendar-week calculation:
  // Week index starts from Monday
  const dayOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  const weekNumber = Math.ceil((day + dayOffset) / 7);
  
  return `${targetMonth + 1}월 ${weekNumber}주차`;
}

/**
 * Normalizes weekend selections for the active day in lists.
 * - If today is Monday-Friday, returns today.
 * - If Saturday, returns Friday (yesterday).
 * - If Sunday, returns Monday (tomorrow).
 */
export function getDefaultSelectedDate(today: Date): Date {
  const day = today.getDay();
  if (day >= 1 && day <= 5) {
    return today;
  }
  const result = new Date(today);
  if (day === 6) {
    // Saturday -> previous Friday
    result.setDate(today.getDate() - 1);
  } else if (day === 0) {
    // Sunday -> next Monday
    result.setDate(today.getDate() + 1);
  }
  return result;
}

/**
 * Returns "월", "화", "수", "목", "금", "토", "일"
 */
export function getKoreanDayOfWeek(date: Date): string {
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  return dayNames[date.getDay()];
}
