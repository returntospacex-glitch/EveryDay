'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Routine, Category, Habit, FrequencyType } from '@/types/routine';
import { CheckCircle2, Circle, Plus, Moon, Dumbbell, User as UserIcon, LayoutDashboard, Calendar as CalendarIcon, Settings, TrendingUp, ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import AddRoutineModal from '@/components/AddRoutineModal';
import CategoryManagerModal from '@/components/CategoryManagerModal';
import FeedbackCard from '@/components/FeedbackCard';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';

export default function RoutinePage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | '전체'>('전체');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [editingData, setEditingData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [weekDates, setWeekDates] = useState<{ date: string; day: string; label: string }[]>([]);

  // Navigation State
  const [anchorDate, setAnchorDate] = useState(new Date());

  // Initialize Dates based on Anchor Date
  useEffect(() => {
    // Determine the start of the week (e.g., Today if default, or shifted by anchor)
    // Actually, user wants "Previous Week / Next Week". 
    // Let's assume the view always shows 7 days starting from 'anchorDate' (or maybe anchorDate is the first day?)
    // Let's make 'anchorDate' be the *start* of the 7-day window.

    // If it's the initial load, we might want 'Today' to be present. 
    // Let's stick to: anchorDate is the first day of the visible week. 
    // Wait, initially we want Today to be visible. Let's make anchorDate = Today - (Today.getDay() maybe? to start on Sunday/Monday?)
    // The previous code started from Today. Let's stick to "7 Days starting from Anchor".

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(anchorDate);
      d.setDate(anchorDate.getDate() + i);

      const offset = d.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(d.getTime() - offset)).toISOString().split('T')[0];

      dates.push({
        date: localISOTime,
        day: d.getDate().toString(),
        label: d.toLocaleDateString('ko-KR', { weekday: 'short' }),
      });
    }
    setWeekDates(dates);

    // Ensure selectedDate is visible or strictly valid? 
    // Usually good to keep selectedDate if it's within range, otherwise select the first day?
    // Let's select the first day of the new week if the current selectedDate is out of view.
    const isSelectedInView = dates.some(d => d.date === selectedDate);
    if (!isSelectedInView && dates.length > 0) {
      // If selectedDate isn't set yet (initial load), or we jumped far away
      if (!selectedDate || !isSelectedInView) {
        setSelectedDate(dates[0].date);
      }
    }

  }, [anchorDate]);

  // Initial Selected Date Set (only once)
  useEffect(() => {
    const offset = new Date().getTimezoneOffset() * 60000;
    const todayStr = (new Date(new Date().getTime() - offset)).toISOString().split('T')[0];
    setSelectedDate(todayStr);
  }, []);


  // Load Data
  useEffect(() => {
    const savedRoutines = localStorage.getItem('routine-keeper-data');
    if (savedRoutines) {
      try { setRoutines(JSON.parse(savedRoutines)); } catch (e) { console.error(e); }
    }

    const savedHabits = localStorage.getItem('routine-keeper-habits');
    if (savedHabits) {
      try { setHabits(JSON.parse(savedHabits)); } catch (e) { console.error(e); }
    } else {
      const initialHabits: Habit[] = [
        {
          id: 'h1', title: '아침 스트레칭', category: '운동', frequency: { type: 'daily', value: 1 },
          startDate: '2025-01-01', completedDates: []
        },
        {
          id: 'h2', title: '독서 30분', category: '공부', frequency: { type: 'daily', value: 1 },
          startDate: '2025-01-01', completedDates: [], value: 30, unit: '분'
        },
        {
          id: 'h3', title: '주 3회 런닝', category: '운동', frequency: { type: 'weekly', value: 3 },
          startDate: '2025-01-01', completedDates: [], value: 5, unit: 'km'
        }
      ];
      setHabits(initialHabits);
      localStorage.setItem('routine-keeper-habits', JSON.stringify(initialHabits));
    }

    const savedCats = localStorage.getItem('routine-keeper-categories');
    if (savedCats) setCategories(JSON.parse(savedCats));
    else setCategories(['루틴', '운동', '공부', '수면', '기타']);

  }, []);

  const handleUpdateCategories = (newCategories: string[]) => {
    setCategories(newCategories);
    localStorage.setItem('routine-keeper-categories', JSON.stringify(newCategories));
  };

  const toggleRoutine = (id: string, isHabit: boolean) => {
    if (isHabit) {
      const updatedHabits = habits.map(h => {
        if (h.id === id) {
          const isDone = h.completedDates.includes(selectedDate);
          let newDates;
          if (isDone) {
            newDates = h.completedDates.filter(d => d !== selectedDate);
          } else {
            newDates = [...h.completedDates, selectedDate];
          }
          return { ...h, completedDates: newDates };
        }
        return h;
      });
      setHabits(updatedHabits);
      localStorage.setItem('routine-keeper-habits', JSON.stringify(updatedHabits));
    } else {
      const updated = routines.map(r =>
        r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
      );
      setRoutines(updated);
      localStorage.setItem('routine-keeper-data', JSON.stringify(updated));
    }
  };

  const handleAddRoutine = (data: { title: string; category: Category; value?: number; unit?: string; date: string; frequency?: { type: FrequencyType; value: number } }) => {
    if (data.frequency) {
      const newHabit: Habit = {
        id: Date.now().toString(),
        title: data.title,
        category: data.category,
        frequency: data.frequency,
        startDate: data.date,
        completedDates: [],
        value: data.value,
        unit: data.unit
      };
      const updated = [...habits, newHabit];
      setHabits(updated);
      localStorage.setItem('routine-keeper-habits', JSON.stringify(updated));
    } else {
      const routine: Routine = {
        id: Date.now().toString(),
        title: data.title,
        category: data.category,
        isCompleted: false,
        date: data.date,
        value: data.value,
        unit: data.unit
      };
      const updated = [...routines, routine];
      setRoutines(updated);
      localStorage.setItem('routine-keeper-data', JSON.stringify(updated));
    }
  };


  const openAddModal = () => { setEditingData(null); setIsModalOpen(true); };
  const openEditModal = (data: any) => { setEditingData(data); setIsModalOpen(true); };

  const handleUpdateRoutine = (id: string, data: any) => {
    const isHabit = habits.some(h => h.id === id);
    if (isHabit) {
      if (data.frequency) {
        const updatedHabits = habits.map(h =>
          h.id === id ? {
            ...h,
            title: data.title,
            category: data.category,
            frequency: data.frequency,
            value: data.value,
            unit: data.unit
          } : h
        );
        setHabits(updatedHabits);
        localStorage.setItem('routine-keeper-habits', JSON.stringify(updatedHabits));
      } else {
        const habitToConvert = habits.find(h => h.id === id);
        if (habitToConvert) {
          const newRoutine: Routine = {
            id: habitToConvert.id,
            title: data.title,
            category: data.category,
            isCompleted: false,
            value: data.value,
            unit: data.unit,
            date: data.date
          };
          const newHabits = habits.filter(h => h.id !== id);
          setHabits(newHabits);
          localStorage.setItem('routine-keeper-habits', JSON.stringify(newHabits));

          const newRoutines = [...routines, newRoutine];
          setRoutines(newRoutines);
          localStorage.setItem('routine-keeper-data', JSON.stringify(newRoutines));
        }
      }
    } else {
      if (data.frequency) {
        const routineToConvert = routines.find(r => r.id === id);
        if (routineToConvert) {
          const newHabit: Habit = {
            id: routineToConvert.id,
            title: data.title,
            category: data.category,
            frequency: data.frequency,
            startDate: data.date,
            completedDates: [],
            value: data.value,
            unit: data.unit
          };
          const newRoutines = routines.filter(r => r.id !== id);
          setRoutines(newRoutines);
          localStorage.setItem('routine-keeper-data', JSON.stringify(newRoutines));
          const newHabits = [...habits, newHabit];
          setHabits(newHabits);
          localStorage.setItem('routine-keeper-habits', JSON.stringify(newHabits));
        }
      } else {
        const updatedRoutines = routines.map(r =>
          r.id === id ? { ...r, title: data.title, category: data.category, value: data.value, unit: data.unit, date: data.date } : r
        );
        setRoutines(updatedRoutines);
        localStorage.setItem('routine-keeper-data', JSON.stringify(updatedRoutines));
      }
    }
    setIsModalOpen(false);
    setEditingData(null);
  };

  const handleDeleteRoutine = (id: string) => {
    const newHabits = habits.filter(h => h.id !== id);
    if (newHabits.length !== habits.length) {
      setHabits(newHabits);
      localStorage.setItem('routine-keeper-habits', JSON.stringify(newHabits));
    } else {
      const newRoutines = routines.filter(r => r.id !== id);
      setRoutines(newRoutines);
      localStorage.setItem('routine-keeper-data', JSON.stringify(newRoutines));
    }
    setIsModalOpen(false);
    setEditingData(null);
  };

  const getDisplayRoutines = () => {
    const list: any[] = [];
    habits.forEach(h => {
      let shouldShow = false;
      const targetDate = new Date(selectedDate);
      const start = new Date(h.startDate);

      if (targetDate < start) return;

      if (h.frequency.type === 'daily') shouldShow = true;
      else if (h.frequency.type === 'interval') {
        const diffTime = Math.abs(targetDate.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays % h.frequency.value === 0) shouldShow = true;
      } else if (h.frequency.type === 'weekly') shouldShow = true;

      if (shouldShow) {
        const isCompleted = h.completedDates.includes(selectedDate);
        let weeklyProgress = null;
        let isQuotaMet = false;
        if (h.frequency.type === 'weekly') {
          const curr = new Date(selectedDate);
          const day = curr.getDay();
          const diffToMon = day === 0 ? 6 : day - 1;
          const mondayDate = new Date(curr);
          mondayDate.setDate(curr.getDate() - diffToMon);
          const sundayDate = new Date(mondayDate);
          sundayDate.setDate(mondayDate.getDate() + 6);
          const monStr = mondayDate.toISOString().split('T')[0];
          const sunStr = sundayDate.toISOString().split('T')[0];
          const completedInWeek = h.completedDates.filter(date => date >= monStr && date <= sunStr).length;
          weeklyProgress = { current: completedInWeek, target: h.frequency.value };
          if (completedInWeek >= h.frequency.value) isQuotaMet = true;
        }

        list.push({
          id: h.id, title: h.title, category: h.category, isCompleted, value: h.value, unit: h.unit,
          isHabit: true, habitData: h, weeklyProgress, isQuotaMet, frequency: h.frequency
        });
      }
    });

    routines.filter(r => r.date === selectedDate).forEach(r => {
      list.push({
        id: r.id, title: r.title, category: r.category, isCompleted: r.isCompleted, value: r.value, unit: r.unit,
        isHabit: false, isQuotaMet: false
      });
    });

    return list.sort((a, b) => {
      const aDone = a.isCompleted || a.isQuotaMet;
      const bDone = b.isCompleted || b.isQuotaMet;
      if (aDone === bDone) return 0;
      return aDone ? 1 : -1;
    });
  };

  const displayItems = getDisplayRoutines();
  const completionRate = displayItems.length > 0
    ? Math.round((displayItems.filter(r => r.isCompleted).length / displayItems.length) * 100)
    : 0;

  const weeklyData = [
    { day: 'M', rate: 40 }, { day: 'T', rate: 70 }, { day: 'W', rate: 50 },
    { day: 'T', rate: 90 }, { day: 'F', rate: 60 }, { day: 'S', rate: 30 }, { day: 'S', rate: 80 },
  ];

  return (
    <>
      <AddRoutineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddRoutine}
        onUpdate={handleUpdateRoutine}
        onDelete={handleDeleteRoutine}
        existingCategories={categories}
        initialData={editingData}
        selectedDate={selectedDate}
      />
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        onUpdate={handleUpdateCategories}
      />

      <main className="relative">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/20 via-[#09090b] to-[#09090b] pointer-events-none" />

        <div className="max-w-7xl mx-auto p-6 md:p-12 relative z-10">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
              <p className="text-blue-500 font-bold tracking-widest text-xs mb-1 uppercase bg-blue-500/10 px-2 py-1 rounded w-fit border border-blue-500/20">
                정민혁
              </p>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400">
                하루하루는 성실하게
              </h1>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                인생 전체는 되는대로
              </h1>
            </div>

            {/* Weekly Date Picker with Navigation */}
            <div className="flex-1 w-full md:w-auto flex flex-col items-center justify-center">
              <span className="text-blue-500/80 font-bold uppercase tracking-[0.2em] text-sm mb-3">
                {anchorDate.toLocaleString('en-US', { month: 'long' })}
              </span>

              <div className="flex items-center space-x-2">
                {/* PREV WEEK BUTTON */}
                <button
                  onClick={() => {
                    const newDate = new Date(anchorDate);
                    newDate.setDate(newDate.getDate() - 7);
                    setAnchorDate(newDate);
                  }}
                  className="p-3 bg-[#121214] border border-white/5 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex space-x-3 bg-black/20 p-2 rounded-full backdrop-blur-sm border border-white/5 overflow-x-auto no-scrollbar">
                  {weekDates.map((d) => (
                    <button
                      key={d.date}
                      onClick={() => setSelectedDate(d.date)}
                      className={`flex flex-col items-center justify-center w-12 h-14 rounded-full transition-all border ${selectedDate === d.date
                        ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/40 scale-105'
                        : 'bg-transparent text-gray-500 border-transparent hover:bg-white/5 hover:text-gray-300'
                        }`}
                    >
                      <span className="text-[10px] uppercase font-bold tracking-wider">{d.label}</span>
                      <span className="text-lg font-bold leading-none mt-1">{d.day}</span>
                    </button>
                  ))}
                </div>

                {/* NEXT WEEK BUTTON */}
                <button
                  onClick={() => {
                    const newDate = new Date(anchorDate);
                    newDate.setDate(newDate.getDate() + 7);
                    setAnchorDate(newDate);
                  }}
                  className="p-3 bg-[#121214] border border-white/5 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <button
              onClick={openAddModal}
              className="hidden md:flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/30 hover:scale-105 active:scale-95"
            >
              <Plus size={24} /> <span className="text-xl">할 일</span>
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                  onClick={() => setActiveCategory('전체')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all backdrop-blur-md border ${activeCategory === '전체'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20'
                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-gray-200'
                    }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all backdrop-blur-md border ${activeCategory === cat
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20'
                      : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-gray-200'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
                <button onClick={() => setIsCategoryManagerOpen(true)} className="px-3 py-2.5 rounded-xl text-gray-400 bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white transition-all">
                  <Settings size={18} />
                </button>
              </div>

              <div className="space-y-3">
                {displayItems
                  .filter(r => activeCategory === '전체' || r.category === activeCategory)
                  .map(routine => (
                    <div
                      key={routine.id}
                      onClick={() => openEditModal(routine)}
                      className={`flex items-center p-5 bg-[#121214] border border-white/5 rounded-2xl cursor-pointer hover:border-blue-500/50 hover:bg-[#161618] transition-all group shadow-sm ${routine.isQuotaMet && !routine.isCompleted ? 'opacity-40 order-last' : ''}`}
                    >
                      <div className="mr-5" onClick={(e) => { e.stopPropagation(); toggleRoutine(routine.id, !!routine.isHabit); }}>
                        {routine.isCompleted ? (
                          <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                            <CheckCircle2 className="text-white" size={18} />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full border-2 border-gray-600 group-hover:border-gray-500 transition-colors" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-lg font-medium transition-colors ${routine.isCompleted ? 'text-gray-500 line-through decoration-gray-600' : 'text-gray-200'}`}>
                          {routine.title}
                        </p>
                        <div className="flex items-center space-x-3 mt-1.5">
                          {routine.value && (
                            <p className="text-sm text-blue-400 flex items-center font-medium">
                              {routine.category === '수면' ? <Moon size={12} className="mr-1.5" /> : <Dumbbell size={12} className="mr-1.5" />}
                              {routine.value}{routine.unit}
                            </p>
                          )}
                          {routine.isHabit && (
                            <p className="text-xs text-purple-400 flex items-center font-medium bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                              <Repeat size={10} className="mr-1" />
                              {routine.habitData?.frequency.type === 'daily' && '매일'}
                              {routine.habitData?.frequency.type === 'weekly' && '주간'}
                              {routine.habitData?.frequency.type === 'interval' && `${routine.habitData.frequency.value}일 간격`}
                            </p>
                          )}
                        </div>
                        {routine.isQuotaMet && !routine.isCompleted && (
                          <p className="text-xs text-blue-400 mt-2 font-bold ml-1">
                            (주간 할당량 성공!)
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-gray-500 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                        {routine.category}
                      </span>
                    </div>
                  ))}

                {displayItems.length === 0 && (
                  <div className="py-20 text-center text-gray-500 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p>{selectedDate}에 할 일이 없습니다.</p>
                    <button onClick={openAddModal} className="text-blue-400 hover:underline mt-2">할 일 추가하기</button>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <FeedbackCard rate={completionRate} />
              <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-200">주간 활동</h3>
                  <a href="/statistics" className="text-xs text-blue-400 hover:text-blue-300">모두 보기</a>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <Bar dataKey="rate" radius={[4, 4, 4, 4]}>
                        {weeklyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.rate >= 80 ? '#3b82f6' : '#27272a'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-3xl p-6">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-blue-200 font-bold text-lg">일일 목표</h3>
                    <p className="text-blue-300/60 text-sm">기세 몰아서 쭉 가보죠!</p>
                  </div>
                  <span className="text-3xl font-bold text-white">{completionRate}%</span>
                </div>
                <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]" style={{ width: `${completionRate}%` }} />
                </div>
                <p className="text-right text-xs text-blue-400 mt-2 font-medium">
                  {displayItems.filter(r => !r.isCompleted).length}개의 할 일 남음
                </p>
              </div>
            </div>
          </div>
          <button onClick={openAddModal} className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-900/50 z-50 active:scale-90 transition-transform">
            <Plus size={28} />
          </button>
        </div>
      </main>
    </>
  );
}
