/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MealInfo } from "./types";
import { getWeekDates, formatDateKey, getKoreanDayOfWeek } from "./utils";

export interface DishSelectable {
  id: string;
  name: string;
  category: "밥류" | "국/찌개" | "반찬" | "디저트";
  kcal: number;
  nutrition: {
    protein: number;
    carbs: number;
    fat: number;
  };
  imageUrl: string;
  isSelected?: boolean;
}

// Fixed Premium Hotlinks from Design Guidance
export const IMAGE_HERO_DONKASU = "https://lh3.googleusercontent.com/aida-public/AB6AXuCbWmJJJX5Tx5WwuNwA6ulfGLgSxoLUqK8W-YqsX37pQZ_GwytdFOmSRDq8Syg1oFphg2uw76DKnkt9VWNBcI73RLATXCkRrcboIsIn6KDpopRT_NljB-0ouBRFefAWOY_OgCVBBp3EdSkQGyRFnN91I7P51uY49piGlcPirTKLfSyFKgKo2MD4z2hvRXUmmYxzkvdyKCABvxmXVrkf0aAlDlilUcOqm-3RDYhR4PIMOs65ayJTYDv8ICyrVBHDrLvTX7Hgw4wPpwDz";
export const IMAGE_BANNER_RECIPE = "https://lh3.googleusercontent.com/aida-public/AB6AXuAc1vYiEICVZJgCEP_oWbmDqf0UkAWVdf8XV4gKzCFPscUpKk4MItXx3uYVV3uxK8oL40N4s1cbbpIhbLtuyiRFMZMvxZV8CpTMUWlzV-trSwEkl-Ov6ZuURfzBpW5Y9rHRkyLqHl4K1Xzi0xXSJh7Qk9LrwaPrcU8JvUkoey73n2P78tv08Uf_Km_WiKKrFyUxal_c0myx6XDnDpIe_mCRKKEU0pPGPgcT7tUJWjH08A0U3KC82MiNKTF8LnYJ0fwccGRwCRX0KIxa";
export const IMAGE_DISH_RICE = "https://lh3.googleusercontent.com/aida-public/AB6AXuBL1_l-pzSzEC-G8dvL5pWB-McggO8Zdk_FELLDUsSlyV-qiGI9fQPg9ZAzkO9v9y7Hue6RxbiNWDrd2WpzgrBWoL_YhoERKlxtLXOmO2F82ozbwieH6DtIU8PzeFSWKF-1MqLyompwdlh54sVSOkd3oLuErhWkLJTxkdgMD5HcYsZVarew_OVPIB4AgBWKx5NQi9sTFwj2bRr5o3XEJ0OjfZLLl1r8JiW4VdROpMbp6RW-jbVoZLZZq6qAxWMRSIP2pFstlaWZ9OvE";
export const IMAGE_DISH_STEW = "https://lh3.googleusercontent.com/aida-public/AB6AXuC5EuK3v5p6DIVbmzz0Y5fut3xQNxq-mrr-PCUpabswWLX5_nOU-UBSN2rPWkeGbZyFKc1FMUR1NYGa6xwr-p2Zyz7mHNuTfGSEtZhm1KAanWTxGzDRwahbWT43veOwRZwyQCEhgmpBYYe6dEDwEVnjPDO3lPGkZXOlCXDSsn8kdbVCvFkTGzKkZjlwfj876kYzafq5TR71AEpSH3tqx3n93jifYUwcbFoVvULiullh4UBOTf0J_ZZ0mUt_6SB0J4Ifk8asjSnjOpBQ";
export const IMAGE_DISH_SPINACH = "https://lh3.googleusercontent.com/aida-public/AB6AXuB_UnHbIkgoXF1tVOGluwCWcSS6ASN-Ua8vpOpo5L2tvTaigqv8K0CTM89Dms522MBuDoRIyFpqhj0LoYwS8utMpLDTH35VeNZsKyKVi-SNV0D145juFW8KJNKXHOpMfmHMq7ecq3keSumy0JPhkb4bZGWD5g-WnQm1ut99mCuMs2qYzjMFwFp5zUM33FGBZ7KOSozl4Wn9O_LkgF_WPBelAtNLJuALQs2nLLNErpgukZUP5cdxJEahKwQoZq1ho3Jf7zStnFfjAYUj";
export const IMAGE_DISH_MACKEREL = "https://lh3.googleusercontent.com/aida-public/AB6AXuANcbbZcoyGhlRyUVIgf-0T1enqpLRcKeDGtPaYDFazd0nQfLTr4me08KMKXCqIM7l02kEc1azd7M7BySPg1mcLgwIiTfZTYOknzMjo6EMZwdvy9OgTSf1nBTMcg6nsjufsBrAgrxDGHsxgAYE_ziw05PwPcPLtDsuVJqHPrQy9uh15y7aT1m4JNDaQ9r4ESfc-YYXXyzOgRTpTggQuboWrLoXNan-vnGE7xxjXuqJf77_Gj6J4H1AOdXrVxWn3iTU277U0-ilpdRmw";
export const IMAGE_STUDENT = "https://lh3.googleusercontent.com/aida-public/AB6AXuBeLrRzuEQXgMSlzf5y3s1IhXXfUu9GxhBJsJmMgFp2yGpjCXec0Mi5KZqKBK5BdInhyYH5rotn7dV96IU5CRQwQMcdFOp1NwxNyK_snLXieb7PQTDXGy_5QLYJDgydRKXZPGlB_aIaPJq1V_rnmLhIp2MZ8sFsRwgLoWXZZmEZcHThHYewBkUIjBA0Q7ysJMBX1NVf76e_Bri2hjL37e6Rd1FHsSTB5Nf4dk9unOxE1b-aUItQ3_7N-vLrfaCFgbnmwydwNHaFk3ki";

/**
 * Menu templates that are dynamically bound to dates on runtime
 */
const MEAL_TEMPLATES_LUNCH = [
  {
    title: "바싹불고기 비빔밥",
    dishes: ["바싹우언비빔밥", "팽이버섯된장국", "바싹소불고기", "약고추장무침", "백김치", "수박한조각"],
    totalCalories: 790,
    proteinG: 28,
    carbG: 112,
    fatG: 16,
    allergens: ["대두", "밀", "쇠고기"],
    proteinPct: 75
  },
  {
    title: "유니자장면 & 탕수육",
    dishes: ["유니자장면", "계란파국", "수제찹쌀탕수육", "고춧가루단무지무침", "포기김치", "요구르트"],
    totalCalories: 880,
    proteinG: 30,
    carbG: 125,
    fatG: 24,
    allergens: ["난류", "대두", "밀", "돼지고기"],
    proteinPct: 80
  },
  {
    title: "돈육고추장불고기 쌈밥",
    dishes: ["잡곡현미밥", "강청국장찌개", "돈육고추장불고기", "싱싱모듬쌈/쌈장", "부추겉절이", "아이스식혜"],
    totalCalories: 820,
    proteinG: 35,
    carbG: 95,
    fatG: 18,
    allergens: ["대두", "밀", "돼지고기"],
    proteinPct: 82
  },
  {
    // Thursday (Active defaults matching mockup)
    title: "치즈돈까스 정식",
    dishes: ["친환경현미밥", "쇠고기미역국", "치즈돈까스정식", "매콤돈육강정", "숙주미나리무침", "배추김치"],
    totalCalories: 845,
    proteinG: 32,
    carbG: 110,
    fatG: 25,
    allergens: ["대두", "밀", "쇠고기", "돼지고기", "우유"],
    proteinPct: 85
  },
  {
    // Friday
    title: "수제함박스테이크 정식",
    dishes: ["혼합잡곡밥", "돈육김치찌개", "수제함박스테이크", "숙주미나리무침", "깍두기", "콘드레싱샐러드"],
    totalCalories: 850,
    proteinG: 34,
    carbG: 115,
    fatG: 22,
    allergens: ["돼지고기", "대두", "밀", "난류", "우유"],
    proteinPct: 88
  }
];

const MEAL_TEMPLATES_DINNER = [
  {
    title: "스팸마요덮밥 정식",
    dishes: ["스팸마요덮밥", "맑은우동국물", "튀김만두/소스", "깍두기", "델몬트바나나"],
    totalCalories: 710,
    proteinG: 19,
    carbG: 108,
    fatG: 20,
    allergens: ["난류", "대두", "밀", "돼지고기"],
    proteinPct: 55
  },
  {
    title: "일식 차슈덮밥",
    dishes: ["돈육차슈덮밥", "미소장국", "새우튀김", "뿌리락교무침", "배추김치"],
    totalCalories: 750,
    proteinG: 24,
    carbG: 98,
    fatG: 22,
    allergens: ["대두", "밀", "돼지고기", "토마토", "새우"],
    proteinPct: 62
  },
  {
    title: "김치볶음밥 & 마들렌",
    dishes: ["베이컨김치볶음밥", "유부맑은국", "반숙계란후라이", "야채모듬어묵바", "초코마들렌"],
    totalCalories: 695,
    proteinG: 21,
    carbG: 102,
    fatG: 15,
    allergens: ["난류", "대두", "밀", "돼지고기", "우유"],
    proteinPct: 58
  },
  {
    // Thursday Dinner
    title: "참치마요덮밥 정식",
    dishes: ["참치마요덮밥", "유부장국", "매콤떡볶이", "깍두기", "정품요구르트"],
    totalCalories: 720,
    proteinG: 22,
    carbG: 105,
    fatG: 18,
    allergens: ["난류", "우유", "대두", "밀"],
    proteinPct: 60
  },
  {
    title: "매콤닭갈비덮밥",
    dishes: ["매콤닭갈비덮밥", "콩나물맑은국", "감자고로케/케찹", "백김치", "커스터드아이스슈"],
    totalCalories: 730,
    proteinG: 25,
    carbG: 100,
    fatG: 19,
    allergens: ["대두", "밀", "닭고기", "우유"],
    proteinPct: 65
  }
];

/**
 * Dynamically constructs the Meal database based on target baseDate's week (Monday-Friday)
 */
export function generateMealsForWeek(baseDate: Date): MealInfo[] {
  const weekDates = getWeekDates(baseDate);
  const meals: MealInfo[] = [];

  weekDates.forEach((date, index) => {
    const dateKey = formatDateKey(date);
    const dayOfWeek = getKoreanDayOfWeek(date);
    
    // Safety check fallback indexes
    const idx = index % MEAL_TEMPLATES_LUNCH.length;
    const lunchTpl = MEAL_TEMPLATES_LUNCH[idx];
    const dinnerTpl = MEAL_TEMPLATES_DINNER[idx];

    // Lunch Record
    meals.push({
      id: `${dateKey}_LUNCH`,
      schoolName: "씨마스고등학교",
      date: date.toISOString().split('T')[0],
      dateKey,
      dayOfWeek,
      mealType: "중식",
      title: lunchTpl.title,
      dishes: lunchTpl.dishes,
      totalCalories: lunchTpl.totalCalories,
      nutrition: {
        proteinG: lunchTpl.proteinG,
        carbG: lunchTpl.carbG,
        fatG: lunchTpl.fatG,
        proteinPct: lunchTpl.proteinPct
      },
      allergens: lunchTpl.allergens
    });

    // Dinner Record
    meals.push({
      id: `${dateKey}_DINNER`,
      schoolName: "씨마스고등학교",
      date: date.toISOString().split('T')[0],
      dateKey,
      dayOfWeek,
      mealType: "석식",
      title: dinnerTpl.title,
      dishes: dinnerTpl.dishes,
      totalCalories: dinnerTpl.totalCalories,
      nutrition: {
        proteinG: dinnerTpl.proteinG,
        carbG: dinnerTpl.carbG,
        fatG: dinnerTpl.fatG,
        proteinPct: dinnerTpl.proteinPct
      },
      allergens: dinnerTpl.allergens
    });
  });

  return meals;
}

/**
 * Dynamically categorizes a meal's list of ingredients into detailed nutritional selectable items
 * for the calculator.
 */
export function generateDishItemsForMeal(meal: MealInfo): DishSelectable[] {
  return meal.dishes.map((dish, i) => {
    // Determine Category
    let category: "밥류" | "국/찌개" | "반찬" | "디저트" = "반찬";
    
    if (dish.includes("밥") || dish.includes("자장면") || dish.includes("덮밥")) {
      category = "밥류";
    } else if (dish.includes("국") || dish.includes("찌개") || dish.includes("장국") || dish.includes("국물")) {
      category = "국/찌개";
    } else if (dish.includes("요구르트") || dish.includes("슈") || dish.includes("식혜") || dish.includes("바바나") || dish.includes("바나나") || dish.includes("식혜") || dish.includes("수박") || dish.includes("도넛") || dish.includes("마들렌")) {
      category = "디저트";
    }

    // Allocate standard calories and macros based on category
    let kcal = 120;
    let protein = 5;
    let carbs = 20;
    let fat = 3;
    let imageUrl = IMAGE_DISH_SPINACH;

    if (category === "밥류") {
      kcal = 300;
      protein = 6;
      carbs = 65;
      fat = 1.5;
      imageUrl = IMAGE_DISH_RICE;
    } else if (category === "국/찌개") {
      kcal = 180;
      protein = 12;
      carbs = 10;
      fat = 9;
      imageUrl = IMAGE_DISH_STEW;
    } else if (category === "디저트") {
      kcal = 80;
      protein = 1;
      carbs = 18;
      fat = 1;
      imageUrl = IMAGE_DISH_MACKEREL; // or anything else sweet
    } else {
      // Main Dish/Side
      // Check if it sounds premium like Cutlet / Bulgogi
      if (dish.includes("돈까스") || dish.includes("함박") || dish.includes("불고기") || dish.includes("탕수육") || dish.includes("닭갈비")) {
        kcal = 350;
        protein = 22;
        carbs = 15;
        fat = 18;
        imageUrl = IMAGE_HERO_DONKASU;
      } else if (dish.includes("강정") || dish.includes("튀김") || dish.includes("떡꼬치") || dish.includes("핫바")) {
        kcal = 220;
        protein = 10;
        carbs = 20;
        fat = 12;
        imageUrl = IMAGE_DISH_MACKEREL;
      } else {
        // Simple vegetable side
        kcal = 45;
        protein = 2;
        carbs = 6;
        fat = 0.5;
        imageUrl = IMAGE_DISH_SPINACH;
      }
    }

    return {
      id: `${meal.dateKey}_${meal.mealType}_DISH_${i}`,
      name: dish,
      category,
      kcal,
      nutrition: {
        protein,
        carbs,
        fat
      },
      imageUrl,
      isSelected: true // Defaulted to checked
    };
  });
}
