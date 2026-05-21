/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  getTodayKST, 
  formatKoreanDate, 
  formatDateKey, 
  getWeekDates, 
  getWeekOfMonth, 
  getDefaultSelectedDate,
  getKoreanDayOfWeek 
} from "./utils";
import { 
  generateMealsForWeek, 
  generateDishItemsForMeal, 
  DishSelectable, 
  IMAGE_HERO_DONKASU, 
  IMAGE_BANNER_RECIPE, 
  IMAGE_STUDENT 
} from "./data";
import { MealInfo, ProfileSettings } from "./types";
import { 
  UtensilsCrossed, 
  Bell, 
  Flame, 
  Heart, 
  Sun, 
  Moon, 
  ChevronRight, 
  Calendar, 
  Calculator, 
  User, 
  AlertTriangle, 
  Headphones, 
  FileText, 
  LogOut, 
  Settings, 
  Save, 
  Check, 
  Volume2, 
  Info,
  Smartphone,
  ChevronLeft,
  X,
  Share2
} from "lucide-react";

export default function App() {
  // 1. Core Date State (KST base)
  const [todayKST, setTodayKST] = useState<Date>(() => getTodayKST());
  const [meals, setMeals] = useState<MealInfo[]>(() => generateMealsForWeek(getTodayKST()));
  
  // 2. Navigation Tab: "HOME" | "MEAL_TABLE" | "NUTRITION" | "PROFILE"
  const [activeTab, setActiveTab] = useState<"HOME" | "MEAL_TABLE" | "NUTRITION" | "PROFILE">("HOME");
  
  // 3. Meal Table Selections
  const [calendarDate, setCalendarDate] = useState<Date>(() => getDefaultSelectedDate(getTodayKST()));
  
  // 4. Calculator Dynamic Item Selection
  const [calcDishes, setCalcDishes] = useState<DishSelectable[]>([]);
  const [calcFilter, setCalcFilter] = useState<"전체" | "밥류" | "국/찌개" | "반찬" | "디저트">("전체");
  
  // 5. User Profiles & Like State
  const [likedMeals, setLikedMeals] = useState<Record<string, boolean>>({});
  const [settings, setSettings] = useState<ProfileSettings>({
    studentName: "김학생",
    gradeClass: "2학년 3반 15번",
    photoUrl: IMAGE_STUDENT,
    allergyAlert: true,
    selectedAllergens: ["우유", "대두", "땅콩"],
    dailyMenuAlert: true,
    alertTime: "08:00"
  });

  // Toggle user editing overlay
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(settings.studentName);
  const [editedClass, setEditedClass] = useState(settings.gradeClass);

  // 6. Interaction Toast State
  const [toast, setToast] = useState<string | null>(null);

  // Trigger toast notification helper
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  // Helper: check if a specific date object is today in KST
  const isKSTToday = (date: Date) => {
    return formatDateKey(date) === formatDateKey(todayKST);
  };

  // Helper: check if base Date is Saturday (6) or Sunday (0)
  const isWeekendKST = todayKST.getDay() === 0 || todayKST.getDay() === 6;

  // Sync calculations setup
  useEffect(() => {
    // Calculator lists default to today's (or next Monday's if weekend) Lunch menu
    const targetDate = getDefaultSelectedDate(todayKST);
    const targetKey = formatDateKey(targetDate);
    const lunchMeal = meals.find(m => m.dateKey === targetKey && m.mealType === "중식");
    
    if (lunchMeal) {
      setCalcDishes(generateDishItemsForMeal(lunchMeal));
    }
  }, [todayKST, meals]);

  // Handle active date changes on Meal Table
  const activeMealTableDateKey = formatDateKey(calendarDate);
  const activeDayMeals = meals.filter(m => m.dateKey === activeMealTableDateKey);
  const activeLunch = activeDayMeals.find(m => m.mealType === "중식");
  const activeDinner = activeDayMeals.find(m => m.mealType === "석식");

  // Determine active Home meals (If weekend, show next Monday's with badge)
  const homeDisplayDate = isWeekendKST ? getDefaultSelectedDate(todayKST) : todayKST;
  const homeDateKey = formatDateKey(homeDisplayDate);
  const homeMeals = meals.filter(m => m.dateKey === homeDateKey);
  const homeLunch = homeMeals.find(m => m.mealType === "중식");
  const homeDinner = homeMeals.find(m => m.mealType === "석식");

  // Hero card features: Thursday Cheese pork cutlet or active recommended item
  const heroMeal = homeLunch || activeLunch;

  // Calculator Aggregation
  const selectedDishes = calcDishes.filter(d => d.isSelected);
  const totalCalcKcal = selectedDishes.reduce((sum, d) => sum + d.kcal, 0);
  const totalCalcProtein = selectedDishes.reduce((sum, d) => sum + d.nutrition.protein, 0);
  const totalCalcCarbs = selectedDishes.reduce((sum, d) => sum + d.nutrition.carbs, 0);
  const totalCalcFat = selectedDishes.reduce((sum, d) => sum + d.nutrition.fat, 0);

  // Filtered list of items for the Calculator layout
  const filteredCalcDishes = calcDishes.filter(dish => {
    if (calcFilter === "전체") return true;
    return dish.category === calcFilter;
  });

  const handleToggleDish = (dishId: string) => {
    setCalcDishes(prev => prev.map(dish => {
      if (dish.id === dishId) {
        return { ...dish, isSelected: !dish.isSelected };
      }
      return dish;
    }));
  };

  const handleSaveCalculation = () => {
    showToast(`💾 영양계산 결과 (${totalCalcKcal} kcal)가 저장되었습니다!`);
  };

  const handleSaveProfile = () => {
    setSettings(prev => ({
      ...prev,
      studentName: editedName,
      gradeClass: editedClass
    }));
    setIsEditingProfile(false);
    showToast("✏️ 프로필이 변경되었습니다.");
  };

  // Korean Week Dates representing Monday-Friday timeline
  const weekTimelineDates = getWeekDates(todayKST);

  return (
    <div className="min-h-screen bg-[#f3efe6] flex justify-center py-0 sm:py-8 font-sans">
      
      {/* Mobile Frame Container Wrapper */}
      <div id="school-meals-phone-frame" className="w-full max-w-md bg-[#fcf9f1] min-h-screen sm:min-h-[850px] sm:rounded-[36px] sm:shadow-2xl overflow-hidden flex flex-col relative border-0 sm:border-8 sm:border-primary/10">
        
        {/* Persistent Top Notification Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 16 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute top-12 left-4 right-4 z-50 bg-primary-container text-on-primary-container font-medium px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-primary/20 text-sm"
            >
              <Info className="w-5 h-5 text-[#3c5500]" />
              <p>{toast}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global sticky Header */}
        <header className="sticky top-0 z-40 bg-[#fcf9f1]/90 backdrop-blur-md px-5 h-16 flex justify-between items-center border-b border-[#e5e2db]/50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight font-gmarket text-primary flex items-center gap-1.5">
                씨마스고등학교 급식
              </h1>
              <p className="text-[10px] text-on-surface-variant font-jakarta tracking-wider font-semibold opacity-75">
                ORGANIC HEARTH SYSTEM
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* Quick Weekend Badge Indicator */}
            {isWeekendKST && (
              <span className="hidden xs:inline-flex bg-amber-500/10 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-500/20">
                주말 모드
              </span>
            )}
            <button 
              onClick={() => showToast("🔔 현재 등록된 알림이 없습니다.")}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant relative transition-colors"
            >
              <Bell className="w-[22px] h-[22px]" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#fcf9f1]" />
            </button>
          </div>
        </header>

        {/* Dynamic Display Screens */}
        <main className="flex-1 overflow-y-auto pb-28 px-5 pt-4 scroll-hide">
          <AnimatePresence mode="wait">
            
            {/* Screen 1: Home (홈) */}
            {activeTab === "HOME" && (
              <motion.div
                key="home-screen"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                
                {/* Header Welcome Bar */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xl font-bold tracking-tight text-on-surface font-gmarket">
                      안녕하세요, <span className="text-primary font-extrabold">{settings.studentName}</span> 학생!
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      오늘도 든든하고 신선한 식탁을 만나보세요.
                    </p>
                  </div>
                </div>

                {/* Weekend Notice Banner */}
                {isWeekendKST && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-amber-900 text-xs leading-relaxed">
                    <Info className="w-5 h-5 shrink-0 text-amber-700" />
                    <div>
                      <p className="font-bold">오늘은 즐거운 주말입니다!</p>
                      <p className="opacity-90">가장 가까운 다음 급식일(돌아오는 월요일)의 맛있는 영양 식단을 미리 보여드릴게요.</p>
                    </div>
                  </div>
                )}

                {/* Hero Card Container (오늘의 추천 급식) */}
                {heroMeal && (
                  <section className="relative group overflow-hidden rounded-[28px] shadow-lg shadow-primary/5 border border-[#e5e2db]/30 bg-white">
                    <div className="relative w-full h-56 overflow-hidden">
                      <img 
                        src={IMAGE_HERO_DONKASU} 
                        alt="Cheese Pork Cutlet"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                      
                      {/* Top Badges overlay */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
                        {isWeekendKST ? (
                          <span className="inline-flex items-center px-2.5 py-1 bg-amber-600 text-white rounded-full font-bold text-[10px] shadow-sm tracking-wide">
                            다음 급식일
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 bg-primary text-white rounded-full font-bold text-[10px] shadow-m tracking-wide">
                            오늘의 추천 급식
                          </span>
                        )}
                        
                        <div className="custom-glass px-3.5 py-1.5 rounded-2xl shadow-sm border border-white/20">
                          <p className="text-on-surface font-bold text-[13px] tracking-tight">
                            {formatKoreanDate(homeDisplayDate)}
                          </p>
                        </div>
                      </div>

                      {/* Display Info bottom overlay */}
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <div>
                          <h2 className="text-white font-bold text-xl tracking-tight drop-shadow">
                            {heroMeal.title}
                          </h2>
                          <p className="text-white/90 font-medium text-xs flex items-center gap-1 mt-1 font-jakarta">
                            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                            {heroMeal.totalCalories} kcal
                          </p>
                        </div>
                        
                        {/* Favorite Pulsing Switch Button */}
                        <motion.button 
                          whileTap={{ scale: 0.85 }}
                          onClick={() => {
                            const isLiked = !likedMeals[heroMeal.id];
                            setLikedMeals(prev => ({ ...prev, [heroMeal.id]: isLiked }));
                            showToast(isLiked ? "❤️ 관심 급식 목록에 추가되었습니다!" : "안심 급식 좋아요를 취소했습니다.");
                          }}
                          className={`w-11 h-11 backdrop-blur-md rounded-full flex items-center justify-center transition-all ${
                            likedMeals[heroMeal.id] 
                              ? "bg-red-500 border-red-500 text-white shadow-md" 
                              : "bg-white/20 border border-white/30 text-white hover:bg-white/30"
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${likedMeals[heroMeal.id] ? "fill-current" : ""}`} />
                        </motion.button>
                      </div>
                    </div>
                  </section>
                )}

                {/* Today's Meal Summary Detail Cards (중식 / 석식) */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-on-surface font-gmarket">
                      오식단표 요약
                    </h3>
                    <button 
                      onClick={() => setActiveTab("MEAL_TABLE")}
                      className="text-primary font-bold text-xs flex items-center gap-0.5 hover:opacity-85 transition-opacity"
                    >
                      전체보기 <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    
                    {/* Lunch Card */}
                    {homeLunch && (
                      <article className="bg-white p-5 rounded-[24px] shadow-sm border border-[#e5e2db]/50 relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary/5 rounded-full transition-transform group-hover:scale-110" />
                        
                        <div className="flex items-center justify-between mb-3.5 relative z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-[#dde8b2] flex items-center justify-center text-primary">
                              <Sun className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-base text-on-surface">중식 (Lunch)</span>
                          </div>
                          <span className="text-primary font-semibold text-sm font-jakarta bg-primary-fixed/30 px-2.5 py-0.5 rounded-lg">
                            {homeLunch.totalCalories} kcal
                          </span>
                        </div>
                        
                        <div className="bg-[#fcf9f1] border border-[#e5e2db]/30 rounded-2xl p-4 mb-4">
                          <ul className="grid grid-cols-2 gap-y-2 gap-x-1.5">
                            {homeLunch.dishes.map((dish, i) => (
                              <li key={i} className="text-xs text-on-surface-variant flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-primary/60 rounded-full shrink-0" />
                                <span className={dish.includes("정식") || dish.includes("돈까스") ? "font-bold text-primary font-gmarket" : "truncate"}>
                                  {dish}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#e5e2db]/40">
                          {homeLunch.allergens.map((allergy, i) => {
                            const isWarning = settings.allergyAlert && settings.selectedAllergens.includes(allergy);
                            return (
                              <span 
                                key={i} 
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-tight transition-colors ${
                                  isWarning 
                                    ? "bg-red-500 text-white font-bold animate-pulse" 
                                    : "bg-secondary-container/50 text-on-secondary-container"
                                }`}
                              >
                                {allergy}
                              </span>
                            );
                          })}
                        </div>
                      </article>
                    )}

                    {/* Dinner Card */}
                    {homeDinner && (
                      <article className="bg-white p-5 rounded-[24px] shadow-sm border border-[#e5e2db]/50 relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#73625a]/5 rounded-full transition-transform group-hover:scale-110" />
                        
                        <div className="flex items-center justify-between mb-3.5 relative z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
                              <Moon className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-base text-on-surface">석식 (Dinner)</span>
                          </div>
                          <span className="text-tertiary font-semibold text-sm font-jakarta bg-tertiary-fixed px-2.5 py-0.5 rounded-lg animate-pulse">
                            {homeDinner.totalCalories} kcal
                          </span>
                        </div>
                        
                        <div className="bg-[#fcf9f1] border border-[#e5e2db]/30 rounded-2xl p-4 mb-4">
                          <ul className="grid grid-cols-2 gap-y-2 gap-x-1.5">
                            {homeDinner.dishes.map((dish, i) => (
                              <li key={i} className="text-xs text-on-surface-variant flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-tertiary/40 rounded-full shrink-0" />
                                <span className={dish.includes("참치") ? "font-bold text-tertiary font-gmarket" : "truncate"}>
                                  {dish}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#e5e2db]/40">
                          {homeDinner.allergens.map((allergy, i) => {
                            const isWarning = settings.allergyAlert && settings.selectedAllergens.includes(allergy);
                            return (
                              <span 
                                key={i} 
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-tight transition-colors ${
                                  isWarning 
                                    ? "bg-red-500 text-white font-bold animate-pulse" 
                                    : "bg-tertiary-fixed-dim/40 text-on-tertiary-fixed-variant"
                                }`}
                              >
                                {allergy}
                              </span>
                            );
                          })}
                        </div>
                      </article>
                    )}

                  </div>
                </section>

                {/* Nutrition Insights progress container */}
                <section className="bg-primary p-6 rounded-[28px] text-white flex items-center justify-between shadow-lg shadow-primary/20 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 top-0 w-24 bg-white/5 skew-x-12 translate-x-4" />
                  <div className="space-y-1 relative z-10">
                    <p className="text-[10px] font-bold tracking-widest text-[#c9f17c] uppercase">
                      오늘의 영양 소식 (Insight)
                    </p>
                    <h4 className="font-bold text-base tracking-tight font-gmarket">
                      성장기에 필요한 단백질이 충분해요!
                    </h4>
                    <p className="text-[11px] text-[#c9f17c] opacity-90 max-w-[210px] leading-relaxed">
                      중식 권장 영양 중 단백질 달성도 85%를 기록하였습니다. 근육 성장에 좋은 구성입니다.
                    </p>
                  </div>
                  
                  {/* Circle SVG */}
                  <div className="w-16 h-16 shrink-0 rounded-full border-4 border-white/20 flex items-center justify-center relative bg-white/5 backdrop-blur-sm shadow z-10">
                    <span className="font-bold text-sm text-[#c9f17c]">85%</span>
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle 
                        className="text-[#c9f17c]" 
                        cx="32" 
                        cy="32" 
                        fill="transparent" 
                        r="26" 
                        stroke="currentColor" 
                        strokeWidth="4"
                        strokeDasharray="163.3" 
                        strokeDashoffset="24.5"
                      />
                    </svg>
                  </div>
                </section>

              </motion.div>
            )}

            {/* Screen 2: Meal Table (식단표) */}
            {activeTab === "MEAL_TABLE" && (
              <motion.div
                key="meal-table-screen"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Header title block */}
                <div className="flex flex-col gap-1">
                  <span className="text-primary font-bold text-xs bg-[#dde8b2] px-3 py-1 rounded-full self-start shadow-sm font-gmarket">
                    주간 식단표
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <h2 className="font-extrabold text-2xl text-on-surface font-gmarket tracking-tight">
                      {getWeekOfMonth(calendarDate)}
                    </h2>
                    <span className="text-xs font-jakarta bg-[#ebe8e0] text-on-surface-variant font-bold px-2 py-0.5 rounded">
                      WEEKLY
                    </span>
                  </div>
                </div>

                {/* 5-day Date Selector */}
                <div className="flex justify-between items-center bg-white p-2 rounded-2xl border border-[#e5e2db]/60 shadow-sm overflow-x-auto scroll-hide gap-1.5">
                  {weekTimelineDates.map((dateObj, i) => {
                    const isSelected = formatDateKey(dateObj) === activeMealTableDateKey;
                    const isToday = isKSTToday(dateObj);
                    const label = getKoreanDayOfWeek(dateObj);
                    const dayNum = dateObj.getDate();

                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setCalendarDate(dateObj);
                          showToast(`${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 급식으로 전환합니다.`);
                        }}
                        className={`flex flex-col items-center flex-1 min-w-[56px] py-2.5 rounded-xl transition-all relative ${
                          isSelected 
                            ? "bg-primary text-white shadow-md font-bold scale-102"
                            : "hover:bg-surface-container-low text-on-surface-variant"
                        }`}
                      >
                        <span className={`text-[11px] ${isSelected ? "opacity-90" : "text-outline font-medium"}`}>
                          {label}
                        </span>
                        <span className="text-base tracking-tight font-jakarta mt-1">
                          {dayNum}
                        </span>
                        {/* Little absolute Green Dot if today is this date */}
                        {isToday && (
                          <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-primary"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* List Meals view of selected day */}
                <div className="space-y-6">
                  
                  {/* Lunch Detail Card */}
                  {activeLunch ? (
                    <article className="bg-white rounded-[24px] p-5 shadow-sm border border-[#e5e2db]/50 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-6 translate-x-6" />
                      
                      <div className="flex justify-between items-start mb-3 relative z-10">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Sun className="w-5 h-5 text-primary" />
                            <h3 className="font-bold text-lg text-on-surface font-gmarket">중식</h3>
                          </div>
                          <span className="text-xs font-bold text-primary bg-primary-fixed/30 px-2 py-0.5 rounded-md font-jakarta">
                            {activeLunch.totalCalories} kcal
                          </span>
                        </div>
                        
                        {/* Favorite button toggle */}
                        <motion.button 
                          whileTap={{ scale: 0.85 }}
                          onClick={() => {
                            const isLiked = !likedMeals[activeLunch.id];
                            setLikedMeals(prev => ({ ...prev, [activeLunch.id]: isLiked }));
                            showToast(isLiked ? "❤️ 관심 급식 목록에 추가되었습니다!" : "관심 급식을 삭제했습니다.");
                          }}
                          className={`p-2 rounded-full transition-colors ${
                            likedMeals[activeLunch.id] 
                              ? "bg-red-50 text-white shadow" 
                              : "bg-surface-container-low text-on-surface-variant hover:bg-secondary-container"
                          }`}
                        >
                          <Heart className={`w-[18px] h-[18px] ${likedMeals[activeLunch.id] ? "fill-current" : ""}`} />
                        </motion.button>
                      </div>

                      {/* Ingredient list chips mapping */}
                      <div className="bg-[#fcf9f1] border border-[#e5e2db]/30 rounded-xl p-3.5 mb-4 relative z-10">
                        <ul className="flex flex-wrap gap-x-2.5 gap-y-1.5 text-xs text-on-surface-variant">
                          {activeLunch.dishes.map((dish, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <span className={dish.includes("정식") || dish.includes("돈까스") || dish.includes("함박") ? "font-bold text-primary font-gmarket" : ""}>
                                {dish}
                              </span>
                              {i < activeLunch.dishes.length - 1 && <span className="text-[#c4c9b4]">•</span>}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Secondary protein indicator gauge inside layout */}
                      <div className="relative z-10 space-y-1.5">
                        <div className="flex justify-between items-center text-[11px] text-on-surface-variant font-medium">
                          <span>일일 권장 단백질 달성률</span>
                          <span className="font-bold text-primary">{activeLunch.nutrition.proteinPct || 85}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${activeLunch.nutrition.proteinPct || 85}%` }} 
                          />
                        </div>
                      </div>

                      {/* Display warning badges */}
                      <div className="mt-3.5 pt-3.5 border-t border-[#e5e2db]/40 flex flex-wrap gap-1">
                        {activeLunch.allergens.map((alg, i) => {
                          const isWarning = settings.allergyAlert && settings.selectedAllergens.includes(alg);
                          return (
                            <span 
                              key={i} 
                              className={`text-[10px] px-2 py-0.5 rounded-full ${
                                isWarning 
                                  ? "bg-red-500 text-white font-bold animate-pulse" 
                                  : "bg-[#f1eee6] text-on-surface-variant"
                              }`}
                            >
                              {alg}
                            </span>
                          );
                        })}
                      </div>

                    </article>
                  ) : (
                    <div className="p-8 text-center text-on-surface-variant text-sm">급식 없는 날입니다.</div>
                  )}

                  {/* Dinner Detail Card */}
                  {activeDinner ? (
                    <article className="bg-white rounded-[24px] p-5 shadow-sm border border-[#e5e2db]/50 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary/5 rounded-full -translate-y-6 translate-x-6" />
                      
                      <div className="flex justify-between items-start mb-3 relative z-10">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Moon className="w-5 h-5 text-tertiary" />
                            <h3 className="font-bold text-lg text-on-surface font-gmarket">석식</h3>
                          </div>
                          <span className="text-xs font-bold text-tertiary bg-tertiary-fixed px-2 py-0.5 rounded-md font-jakarta">
                            {activeDinner.totalCalories} kcal
                          </span>
                        </div>
                        
                        {/* Favorite button toggle */}
                        <motion.button 
                          whileTap={{ scale: 0.85 }}
                          onClick={() => {
                            const isLiked = !likedMeals[activeDinner.id];
                            setLikedMeals(prev => ({ ...prev, [activeDinner.id]: isLiked }));
                            showToast(isLiked ? "❤️ 관심 급식 목록에 추가되었습니다!" : "관심 급식을 삭제했습니다.");
                          }}
                          className={`p-2 rounded-full transition-colors ${
                            likedMeals[activeDinner.id] 
                              ? "bg-red-50 text-white shadow" 
                              : "bg-surface-container-low text-on-surface-variant hover:bg-secondary-container"
                          }`}
                        >
                          <Heart className={`w-[18px] h-[18px] ${likedMeals[activeDinner.id] ? "fill-current" : ""}`} />
                        </motion.button>
                      </div>

                      {/* Ingredient list chips mapping */}
                      <div className="bg-[#fcf9f1] border border-[#e5e2db]/30 rounded-xl p-3.5 mb-4 relative z-10">
                        <ul className="flex flex-wrap gap-x-2.5 gap-y-1.5 text-xs text-on-surface-variant">
                          {activeDinner.dishes.map((dish, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <span className={dish.includes("참치") ? "font-bold text-tertiary font-gmarket" : ""}>
                                {dish}
                              </span>
                              {i < activeDinner.dishes.length - 1 && <span className="text-[#c4c9b4]">•</span>}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Secondary protein indicator gauge inside layout */}
                      <div className="relative z-10 space-y-1.5">
                        <div className="flex justify-between items-center text-[11px] text-on-surface-variant font-medium">
                          <span>일일 권장 단백질 달성률</span>
                          <span className="font-bold text-tertiary">{activeDinner.nutrition.proteinPct || 60}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-tertiary rounded-full transition-all duration-1000 ease-out animate-pulse" 
                            style={{ width: `${activeDinner.nutrition.proteinPct || 60}%` }} 
                          />
                        </div>
                      </div>

                      {/* Display warning badges */}
                      <div className="mt-3.5 pt-3.5 border-t border-[#e5e2db]/40 flex flex-wrap gap-1">
                        {activeDinner.allergens.map((alg, i) => {
                          const isWarning = settings.allergyAlert && settings.selectedAllergens.includes(alg);
                          return (
                            <span 
                              key={i} 
                              className={`text-[10px] px-2 py-0.5 rounded-full ${
                                isWarning 
                                  ? "bg-red-500 text-white font-bold animate-pulse" 
                                  : "bg-[#f1eee6] text-on-surface-variant"
                              }`}
                            >
                              {alg}
                            </span>
                          );
                        })}
                      </div>

                    </article>
                  ) : null}

                  {/* Aesthetic Recipe Banner Graphic card */}
                  <div className="rounded-[24px] overflow-hidden relative h-40 group cursor-pointer shadow-sm border border-[#e5e2db]/40 bg-white">
                    <img 
                      src={IMAGE_BANNER_RECIPE} 
                      alt="Gourmet school meal plating"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5" />
                    <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                      <p className="text-[10px] font-bold text-[#c9f17c] tracking-widest uppercase">
                        오늘의 명인 레시피
                      </p>
                      <h4 className="font-bold text-base tracking-tight text-white font-gmarket mt-0.5">
                        수제 함박스테이크 완벽 반죽의 비밀
                      </h4>
                      <p className="text-[11px] text-white/80 line-clamp-1 mt-0.5">
                        영양사와 조리 명인이 직접 만든 특제 브라운 데미글라스 소스의 팁 대공개!
                      </p>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* Screen 3: Nutrition Calculation (영양계산) */}
            {activeTab === "NUTRITION" && (
              <motion.div
                key="nutrition-screen"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                
                {/* Aggregate Nutrition Gauge panel */}
                <section className="bg-white rounded-[28px] p-5.5 shadow-[0_8px_30px_rgb(60,85,0,0.06)] border border-[#e5e2db]/50 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full translate-x-4 -translate-y-4" />
                  
                  <div className="flex items-center gap-2 mb-3.5 relative z-10">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Calculator className="w-4 h-4 fill-current" />
                    </div>
                    <h2 className="font-bold text-lg text-on-surface font-gmarket">
                      오늘의 선택 영양
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-1 relative z-10 mb-4.5">
                    <span className="text-3xl font-extrabold text-primary font-gmarket tracking-tight">
                      {totalCalcKcal}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium font-jakarta">
                      kcal 섭취 예정
                    </span>
                  </div>

                  {/* Macrogauges stack */}
                  <div className="space-y-3.5 relative z-10">
                    {/* Protein */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-on-surface-variant">단백질</span>
                        <span className="text-primary font-bold font-jakarta">{totalCalcProtein}g</span>
                      </div>
                      <div className="h-2 w-full bg-[#f1eee6] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((totalCalcProtein / 60) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Carbs */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-on-surface-variant">탄수화물</span>
                        <span className="text-primary font-bold font-jakarta">{totalCalcCarbs}g</span>
                      </div>
                      <div className="h-2 w-full bg-[#f1eee6] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#4f6f00] rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((totalCalcCarbs / 300) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Fat */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-on-surface-variant">지방</span>
                        <span className="text-primary font-bold font-jakarta">{totalCalcFat}g</span>
                      </div>
                      <div className="h-2 w-full bg-[#f1eee6] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary/80 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((totalCalcFat / 65) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Sliding Category Chips */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scroll-hide">
                  {(["전체", "밥류", "국/찌개", "반찬", "디저트"] as const).map((cat, i) => {
                    const isActive = calcFilter === cat;
                    return (
                      <button
                        key={i}
                        onClick={() => setCalcFilter(cat)}
                        className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold select-none transition-all ${
                          isActive 
                            ? "bg-primary text-white shadow-sm" 
                            : "bg-[#e5e2db]/50 text-on-surface-variant hover:bg-[#e5e2db] "
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* Selectable Ingredients cards mapping */}
                <section className="space-y-2.5">
                  {filteredCalcDishes.length > 0 ? (
                    filteredCalcDishes.map((dish, i) => {
                      return (
                        <div
                          key={dish.id}
                          onClick={() => handleToggleDish(dish.id)}
                          className={`group flex items-center justify-between p-3.5 rounded-[22px] transition-all cursor-pointer border-2 bg-white ${
                            dish.isSelected 
                              ? "border-primary" 
                              : "border-transparent shadow-sm hover:shadow"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            {/* Hotlink avatar thumb */}
                            <div className="w-13 h-13 rounded-2xl bg-[#f1eee6] overflow-hidden shrink-0 border border-[#e5e2db]/40">
                              <img 
                                src={dish.imageUrl} 
                                alt={dish.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-on-surface font-gmarket">
                                {dish.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] bg-[#e5e2db] text-on-surface-variant px-1.5 py-0.5 rounded font-bold">
                                  {dish.category}
                                </span>
                                <span className="text-xs text-primary font-bold font-jakarta">
                                  {dish.kcal} kcal
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Checked CheckCircle overlay */}
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            dish.isSelected ? "bg-primary text-white" : "border-2 border-[#c4c9b4] text-transparent"
                          }`}>
                            <Check className="w-4 h-4 text-white stroke-[3px]" />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-on-surface-variant text-sm">해당 카테고리의 구성이 없습니다.</div>
                  )}
                </section>

                {/* Call Action saving calculations */}
                <div className="pt-2">
                  <motion.button 
                    whileTap={{ scale: 0.96 }}
                    onClick={handleSaveCalculation}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-md hover:bg-opacity-95 transition-opacity flex items-center justify-center gap-1.5 font-gmarket"
                  >
                    <Save className="w-4 h-4" />
                    계산 결과 저장하기
                  </motion.button>
                </div>

              </motion.div>
            )}

            {/* Screen 4: Profile (프로필) */}
            {activeTab === "PROFILE" && (
              <motion.div
                key="profile-screen"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Header title */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-primary font-bold text-[11px] uppercase tracking-wider">My Profile</span>
                  <h2 className="font-extrabold text-xl text-on-surface font-gmarket tracking-tight">마이 프로필 및 설정</h2>
                </div>

                {/* Profile detail card */}
                <section className="bg-gradient-to-br from-[#dde8b2] to-[#c1cc98]/90 text-on-secondary-container p-6 rounded-[28px] shadow-sm flex items-center justify-between border border-[#c4c9b4]/20 relative overflow-hidden">
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="relative">
                      <img 
                        src={settings.photoUrl} 
                        alt="Student profile" 
                        className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <button 
                        onClick={() => {
                          setEditedName(settings.studentName);
                          setEditedClass(settings.gradeClass);
                          setIsEditingProfile(true);
                        }}
                        className="absolute -bottom-1 -right-1 bg-primary text-white p-2 rounded-full shadow hover:scale-105 transition-transform"
                      >
                        <User className="w-[14px] h-[14px] stroke-[2.5px]" />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-on-secondary-container font-gmarket flex items-center gap-1.5">
                        {settings.studentName}
                      </h3>
                      <p className="text-xs text-on-secondary-container/85 font-jakarta font-medium">
                        {settings.gradeClass}
                      </p>
                      
                      {/* Active status indicator */}
                      <span className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full mt-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                        식사 서비스 정상동작중
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setEditedName(settings.studentName);
                      setEditedClass(settings.gradeClass);
                      setIsEditingProfile(true);
                    }}
                    className="bg-white/30 p-2.5 rounded-xl text-on-secondary-container backdrop-blur-sm transition-colors hover:bg-white/40"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </section>

                {/* Allergy Controls settings list */}
                <section className="space-y-3">
                  <div className="flex items-center gap-1 px-1">
                    <Settings className="w-4 h-4 text-outline" />
                    <span className="text-xs font-bold text-outline uppercase tracking-wider">
                      알림 및 식생활 설정
                    </span>
                  </div>

                  <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#e5e2db]/50 space-y-5">
                    
                    {/* Allergy warning control */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 pr-1.5">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-primary" />
                          <span className="font-bold text-sm text-on-surface">알레르기 경고 알림</span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">
                          식단표 중 설정하신 성분이 포함된 메뉴 검출 시 강조 표시가 활성화됩니다.
                        </p>
                        
                        {/* Selected list of warning ingredients */}
                        {settings.allergyAlert && (
                          <div className="flex flex-wrap gap-1.5 pt-1.5">
                            {["우유", "대두", "밀", "땅콩", "쇠고기", "돼지고기"].map((alg, i) => {
                              const isSelected = settings.selectedAllergens.includes(alg);
                              return (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setSettings(prev => {
                                      const exist = prev.selectedAllergens.includes(alg);
                                      const next = exist 
                                        ? prev.selectedAllergens.filter(a => a !== alg)
                                        : [...prev.selectedAllergens, alg];
                                      return { ...prev, selectedAllergens: next };
                                    });
                                    showToast(`${alg} 알레르기 제외 설정이 변경되었습니다.`);
                                  }}
                                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition-all ${
                                    isSelected 
                                      ? "bg-[#FFE7DD] text-[#2A241A] border border-[#FFE7DD]" 
                                      : "bg-[#f1eee6] text-on-surface-variant/70 border border-transparent"
                                  }`}
                                >
                                  {alg}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Smooth slider switch */}
                      <button
                        onClick={() => {
                          setSettings(p => ({ ...p, allergyAlert: !p.allergyAlert }));
                          showToast(settings.allergyAlert ? "🔇 알레르기 경고 알림을 꺼 두었습니다." : "🔊 알레르기 경고 알림이 다시 켜졌습니다.");
                        }}
                        className={`w-11 h-6 rounded-full p-1 transition-all ${
                          settings.allergyAlert ? "bg-primary" : "bg-[#e5e2db]"
                        }`}
                      >
                        <div 
                          className={`bg-white w-4 h-4 rounded-full shadow-sm transition-all ${
                            settings.allergyAlert ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="h-px bg-[#e5e2db]/50" />

                    {/* Notification Schedule Switch */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Bell className="w-4 h-4 text-primary" />
                          <span className="font-bold text-sm text-on-surface">일일 식단 알림</span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">
                          매일 아침 8시에 중식/석식 대표 메뉴 및 알레르기를 푸시 발송합니다.
                        </p>
                        {settings.dailyMenuAlert && (
                          <span className="inline-flex bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full mt-1 text-[10px]">
                            매일 아침 {settings.alertTime} 발송예정
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setSettings(p => ({ ...p, dailyMenuAlert: !p.dailyMenuAlert }));
                          showToast(settings.dailyMenuAlert ? "🔇 일일 푸시 알림 수신을 거부했습니다." : "🔊 일일 푸시 알림을 수신합니다.");
                        }}
                        className={`w-11 h-6 rounded-full p-1 transition-all ${
                          settings.dailyMenuAlert ? "bg-primary" : "bg-[#e5e2db]"
                        }`}
                      >
                        <div 
                          className={`bg-white w-4 h-4 rounded-full shadow-sm transition-all ${
                            settings.dailyMenuAlert ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                  </div>
                </section>

                {/* Additional Utilities List */}
                <section className="space-y-2">
                  <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-[#e5e2db]/50">
                    
                    <button 
                      onClick={() => showToast("📞 고객센터 (평일 09:00 ~ 17:00 운영, 씨마스고 영양실)")}
                      className="w-full flex items-center justify-between p-4.5 hover:bg-surface-container-low transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Headphones className="w-4 h-4 text-on-surface-variant" />
                        <span className="font-medium text-sm text-on-surface">급식 영양 고객센터</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#747967]" />
                    </button>
                    
                    <div className="h-px bg-surface-container mx-4.5" />
                    
                    <button 
                      onClick={() => showToast("📄 이용약관 및 개인식생활관리 가이드라인")}
                      className="w-full flex items-center justify-between p-4.5 hover:bg-surface-container-low transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-on-surface-variant" />
                        <span className="font-medium text-sm text-on-surface">서비스 이용약관</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#747967]" />
                    </button>
                    
                    <div className="h-px bg-surface-container mx-4.5" />
                    
                    <button 
                      onClick={() => showToast("🔓 안전하게 로그아웃 되었습니다.")}
                      className="w-full flex items-center justify-between p-4.5 text-red-650 hover:bg-red-500/5 transition-colors"
                    >
                      <div className="flex items-center gap-3 text-red-600 font-semibold text-sm">
                        <LogOut className="w-4 h-4" />
                        <span>계정 세션 로그아웃</span>
                      </div>
                    </button>

                  </div>
                </section>

                {/* Corporate Footer branding */}
                <footer className="pt-4 pb-2 text-center space-y-1">
                  <p className="text-[10px] text-outline font-medium">
                    건강하고 맛있는 학교 급식 문화를 응원합니다.
                  </p>
                  <p className="text-[11px] text-[#c4c9b4] font-extrabold font-gmarket">
                    © 2026 씨마스고등학교 영양실.
                  </p>
                </footer>

              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Profile Dynamic Editor Overlay Container */}
        <AnimatePresence>
          {isEditingProfile && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center"
            >
              <motion.div 
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                exit={{ y: 300 }}
                className="w-full bg-[#fcf9f1] rounded-t-[36px] p-6 space-y-5 border-t border-white/20"
              >
                <div className="flex justify-between items-center pb-2 border-b border-surface-container">
                  <h3 className="font-bold text-lg text-on-surface font-gmarket">
                    프로필 편집하기
                  </h3>
                  <button 
                    onClick={() => setIsEditingProfile(false)}
                    className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant px-1">
                      학생 이름
                    </label>
                    <input 
                      type="text" 
                      value={editedName} 
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#c4c9b4] bg-white text-sm outline-none focus:border-primary transition-colors font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant px-1">
                      학년 반 번호
                    </label>
                    <input 
                      type="text" 
                      value={editedClass} 
                      onChange={(e) => setEditedClass(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#c4c9b4] bg-white text-sm outline-none focus:border-primary transition-colors font-semibold"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 bg-[#e5e2db] text-on-surface-variant py-3.5 rounded-xl text-xs font-bold font-gmarket"
                  >
                    취소하기
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    className="flex-1 bg-primary text-white py-3.5 rounded-xl text-xs font-bold font-gmarket"
                  >
                    저장하기
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Persistent Bottom navigation menu bar */}
        <nav className="absolute bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 pb-safe h-20 bg-white/95 backdrop-blur-md rounded-t-[24px] shadow-[0_-5px_20px_rgba(60,85,0,0.06)] border-t border-[#e5e2db]/40">
          
          {/* Tab 1: Home */}
          <button 
            onClick={() => setActiveTab("HOME")}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-3.5 rounded-2xl transition-all ${
              activeTab === "HOME" 
                ? "bg-[#dde8b2] text-primary" 
                : "text-on-surface-variant/70 hover:text-primary"
            }`}
          >
            <Sun className={`w-5 h-5 ${activeTab === "HOME" ? "fill-current" : ""}`} />
            <span className="text-[10px] font-bold tracking-tight mt-1 font-gmarket">홈</span>
          </button>

          {/* Tab 2: Meal Table */}
          <button 
            onClick={() => setActiveTab("MEAL_TABLE")}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-3.5 rounded-2xl transition-all ${
              activeTab === "MEAL_TABLE" 
                ? "bg-[#dde8b2] text-primary hover:bg-[#dde8b2]" 
                : "text-on-surface-variant/70 hover:text-primary"
            }`}
          >
            <Calendar className={`w-5 h-5 ${activeTab === "MEAL_TABLE" ? "fill-current" : ""}`} />
            <span className="text-[10px] font-bold tracking-tight mt-1 font-gmarket">식단표</span>
          </button>

          {/* Tab 3: Nutrition calculation */}
          <button 
            onClick={() => setActiveTab("NUTRITION")}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-3.5 rounded-2xl transition-all ${
              activeTab === "NUTRITION" 
                ? "bg-[#dde8b2] text-primary" 
                : "text-on-surface-variant/70 hover:text-primary"
            }`}
          >
            <Calculator className={`w-5 h-5 ${activeTab === "NUTRITION" ? "fill-current" : ""}`} />
            <span className="text-[10px] font-bold tracking-tight mt-1 font-gmarket">영양계산</span>
          </button>

          {/* Tab 4: Profile */}
          <button 
            onClick={() => setActiveTab("PROFILE")}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-3.5 rounded-2xl transition-all ${
              activeTab === "PROFILE" 
                ? "bg-[#dde8b2] text-primary" 
                : "text-on-surface-variant/70 hover:text-primary"
            }`}
          >
            <User className={`w-5 h-5 ${activeTab === "PROFILE" ? "fill-current" : ""}`} />
            <span className="text-[10px] font-bold tracking-tight mt-1 font-gmarket">프로필</span>
          </button>

        </nav>

      </div>
    </div>
  );
}

