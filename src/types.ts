/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MealNutrition {
  proteinG: number;
  carbG: number;
  fatG: number;
  proteinPct?: number; // Recommended Daily Allowance fulfillment percentage
}

export interface MealInfo {
  id: string;
  schoolName: string; // Must keep as "씨마스고등학교"
  date: string; // ISO String (UTC) or KST formatted Date string (just date part, e.g., "2026-05-15")
  dateKey: string; // YYYYMMDD string format
  dayOfWeek: string; // "월" | "화" | "수" | "목" | "금" | "토" | "일"
  mealType: "중식" | "석식";
  title: string;
  dishes: string[];
  totalCalories: number;
  nutrition: MealNutrition;
  allergens: string[];
}

export interface SelectedNutrients {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ProfileSettings {
  studentName: string;
  gradeClass: string;
  photoUrl: string;
  allergyAlert: boolean;
  selectedAllergens: string[];
  dailyMenuAlert: boolean;
  alertTime: string;
}
