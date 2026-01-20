'use client';

import { useState, useEffect } from 'react';
import { Routine, Category } from '@/types/routine';
import { CheckCircle2, Circle, BarChart2, Plus, Moon, Dumbbell, User as UserIcon } from 'lucide-react';

export default function RoutinePage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | '전체'>('전체');

  // 로컬 데이터 로드
  useEffect(() => {
    const saved = localStorage.getItem('routine-keeper-data');
    if (saved) {
      try {
        setRoutines(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse routines", e);
      }
    } else {
      // 초기 데이터 예시
      const initialData: Routine[] = [
        { id: '1', title: '아침 스트레칭', category: '운동', isCompleted: false, date: '2026-01-20' },
        { id: '2', title: 'React 공부하기', category: '공부', isCompleted: false, date: '2026-01-20' },
        { id: '3', title: '물 마시기', category: '루틴', isCompleted: true, date: '2026-01-20' },
      ];
      setRoutines(initialData);
    }
  }, []);

  const toggleRoutine = (id: string) => {
    const updated = routines.map(r =>
      r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
    );
    setRoutines(updated);
    localStorage.setItem('routine-keeper-data', JSON.stringify(updated));
  };

  const completionRate = routines.length > 0
    ? Math.round((routines.filter(r => r.isCompleted).length / routines.length) * 100)
    : 0;

  return (
    <main className="max-w-md mx-auto min-h-screen bg-[#121212] text-white pb-24 font-sans border-x border-gray-800">
      {/* 상단 프로필 및 날짜 */}
      <header className="p-6 pt-10">
        <div className="flex justify-between items-end mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <UserIcon size={20} className="text-gray-300" />
            </div>
            <div>
              <h2 className="text-gray-400 text-sm font-medium">2026년 1월 20일</h2>
              <h1 className="text-xl font-bold mt-0.5">오늘의 루틴</h1>
            </div>
          </div>
          <div className="text-right">
            <span className="text-blue-400 text-2xl font-bold">{completionRate}%</span>
            <p className="text-gray-500 text-[10px]">달성도</p>
          </div>
        </div>

        {/* 진행바 */}
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </header>

      {/* 카테고리 필터 (Pills) */}
      <div className="flex px-6 space-x-2 overflow-x-auto no-scrollbar mb-6 pb-2">
        {['전체', '루틴', '운동', '공부', '수면'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat as any)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 루틴 리스트 */}
      <section className="px-6 space-y-3">
        {routines
          .filter(r => activeCategory === '전체' || r.category === activeCategory)
          .map(routine => (
            <div
              key={routine.id}
              onClick={() => toggleRoutine(routine.id)}
              className="flex items-center p-4 bg-[#1e1e1e] rounded-2xl cursor-pointer hover:bg-[#252525] transition-colors group border border-transparent hover:border-gray-700"
            >
              <div className="mr-4">
                {routine.isCompleted ? (
                  <CheckCircle2 className="text-blue-500" size={26} />
                ) : (
                  <Circle className="text-gray-600 group-hover:text-gray-500" size={26} />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium transition-colors ${routine.isCompleted ? 'text-gray-600 line-through' : 'text-gray-200'}`}>
                  {routine.title}
                </p>
                {routine.value && (
                  <p className="text-xs text-blue-400 mt-0.5 flex items-center">
                    {routine.category === '수면' ? <Moon size={10} className="mr-1" /> : <Dumbbell size={10} className="mr-1" />}
                    {routine.value}{routine.unit} 기록됨
                  </p>
                )}
              </div>
              <span className="text-[10px] text-gray-500 bg-gray-900/50 px-2 py-1 rounded border border-gray-800">
                {routine.category}
              </span>
            </div>
          ))}

        {routines.filter(r => activeCategory === '전체' || r.category === activeCategory).length === 0 && (
          <div className="text-center py-10 text-gray-600 text-sm">
            할 일이 없습니다.
          </div>
        )}

        <button className="w-full py-4 mt-4 border-2 border-dashed border-gray-800 rounded-2xl text-gray-500 flex items-center justify-center hover:bg-[#1e1e1e] hover:border-gray-700 transition-all hover:text-gray-300">
          <Plus size={20} className="mr-2" /> 루틴 추가하기
        </button>
      </section>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 max-w-md w-full ml-[calc(50%-28rem/2)] bg-[#1e1e1e]/90 backdrop-blur-md border-t border-gray-800 flex justify-around py-4 z-50">
        <button className="flex flex-col items-center text-blue-500">
          <CheckCircle2 size={24} />
          <span className="text-[10px] mt-1 font-bold">할일</span>
        </button>
        <button className="flex flex-col items-center text-gray-500 hover:text-gray-300 transition-colors">
          <BarChart2 size={24} />
          <span className="text-[10px] mt-1 font-bold">통계</span>
        </button>
      </nav>
    </main>
  );
}
