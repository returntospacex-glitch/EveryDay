'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar as CalendarIcon, Flame, Trophy, Clock, ChevronLeft, ChevronRight, Check, Star } from 'lucide-react';
import { Routine, Habit } from '@/types/routine';

export default function CalendarPage() {
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const savedRoutines = localStorage.getItem('routine-keeper-data');
        if (savedRoutines) setRoutines(JSON.parse(savedRoutines));

        const savedHabits = localStorage.getItem('routine-keeper-habits');
        if (savedHabits) setHabits(JSON.parse(savedHabits));
    }, []);

    // --- Logic: Data Processing ---

    // 1. Calculate Daily Completion Rate for History
    const getCompletionMap = () => {
        const map: { [key: string]: number } = {};
        const dateSet = new Set<string>();

        // Habits: Add all dates from completedDates
        habits.forEach(h => {
            h.completedDates.forEach(d => dateSet.add(d));
        });

        // Routines: Add dates of all routines
        routines.forEach(r => {
            if (r.date) dateSet.add(r.date);
        });

        // For every date where at least one thing was done OR planned
        dateSet.forEach(dateStr => {
            // Count total routines/habits for that day
            let totalForDay = 0;
            let completedForDay = 0;

            // Check Habits
            habits.forEach(h => {
                // Simplified: Assume habits are active every day for history visualization
                // In reality, should check frequency.
                // For now, if it appears in completedDates, it counts.
                // If not, we might miss it if filtering strictly. 
                // Let's just track "Habits" if they have completion on that day OR if they assume daily.
                // To match the previous logic:
                if (h.frequency.type === 'daily') {
                    totalForDay++;
                    if (h.completedDates.includes(dateStr)) completedForDay++;
                } else if (h.frequency.type === 'weekly' || h.frequency.type === 'interval') {
                    // Only count if it was relevant? 
                    // Simplified: If completed, +1/+1. If not, maybe ignored or +0/+1?
                    // Let's go soft: If it's a habit day, count it.
                    const start = new Date(h.startDate);
                    const target = new Date(dateStr);
                    if (target >= start) {
                        // Check interval/frequency logic here if needed, but for "Contribution Graph", 
                        // usually just "did I do what I needed?"
                        // Let's rely on completion.
                        if (h.completedDates.includes(dateStr)) {
                            totalForDay++;
                            completedForDay++;
                        }
                    }
                }
            });

            // Check Routines
            routines.filter(r => r.date === dateStr).forEach(r => {
                totalForDay++;
                if (r.isCompleted) completedForDay++;
            });

            map[dateStr] = totalForDay > 0 ? (completedForDay / totalForDay) : 0;
        });

        return map;
    };

    const completionMap = getCompletionMap();

    // --- Logic: Heatmap (Last 365 Days) ---
    const getHeatmapDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 364; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const rate = completionMap[dateStr] || 0;
            days.push({ date: d, rate, dateStr });
        }
        return days;
    };

    // --- Logic: Monthly Calendar ---
    const getDaysInMonth = (year: number, month: number) => {
        const date = new Date(year, month, 1);
        const days = [];

        // Fill previous month padding
        const firstDayDow = date.getDay(); // 0(Sun) - 6(Sat)
        for (let i = 0; i < firstDayDow; i++) {
            days.push(null);
        }

        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    };

    const monthDays = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };
    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // --- Logic: Upcoming Tasks (One-time, Future) ---
    const getUpcomingTasks = () => {
        const today = new Date().toISOString().split('T')[0];
        return routines
            .filter(r => r.date && r.date > today)
            .sort((a, b) => (a.date! > b.date! ? 1 : -1));
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-purple-500/30">
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto p-6 md:p-12 relative z-10">
                <header className="flex items-center mb-10">
                    <Link href="/" className="mr-6 p-3 hover:bg-white/5 rounded-2xl transition-colors border border-transparent hover:border-white/10 group">
                        <ArrowLeft size={24} className="text-gray-400 group-hover:text-white" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Consistency</h1>
                        <p className="text-gray-500 text-sm mt-1">성실함의 기록</p>
                    </div>
                </header>

                {/* 1. Streak Heatmap Section */}
                <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 mb-8 shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                        <Flame className="text-orange-500 mr-2" fill="currentColor" />
                        365 Days Streak
                    </h2>

                    {/* Heatmap Grid - Responsive (Scrollable on small screens) */}
                    <div className="overflow-x-auto pb-4 custom-scrollbar">
                        <div className="flex gap-1" style={{ minWidth: 'max-content' }}>
                            {Array.from({ length: 53 }).map((_, weekIndex) => (
                                <div key={weekIndex} className="grid grid-rows-7 gap-1">
                                    {getHeatmapDays().slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                                        <div
                                            key={day.dateStr}
                                            title={`${day.dateStr}: ${Math.round(day.rate * 100)}%`}
                                            className={`w-3 h-3 rounded-sm transition-all hover:scale-125 hover:border-white/50 border border-transparent
                                                ${day.rate === 0 ? 'bg-[#27272a]' : ''}
                                                ${day.rate > 0 && day.rate <= 0.3 ? 'bg-green-900/40' : ''}
                                                ${day.rate > 0.3 && day.rate <= 0.6 ? 'bg-green-600/60' : ''}
                                                ${day.rate > 0.6 && day.rate <= 0.9 ? 'bg-green-500' : ''}
                                                ${day.rate > 0.9 ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : ''}
                                            `}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end items-center mt-4 text-xs text-gray-500 gap-2">
                        <span>Less</span>
                        <div className="w-3 h-3 bg-[#27272a] rounded-sm" />
                        <div className="w-3 h-3 bg-green-900/40 rounded-sm" />
                        <div className="w-3 h-3 bg-green-500 rounded-sm" />
                        <div className="w-3 h-3 bg-green-400 rounded-sm" />
                        <span>More</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* 2. Monthly Stamp Calendar (8 Cols) */}
                    <div className="lg:col-span-8 bg-[#121214]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <Trophy className="text-yellow-500 mr-2" />
                                월간 달성 현황
                            </h2>
                            <div className="flex items-center gap-4">
                                <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={20} /></button>
                                <span className="text-lg font-mono font-bold text-gray-200">
                                    {currentDate.getFullYear()}.{String(currentDate.getMonth() + 1).padStart(2, '0')}
                                </span>
                                <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight size={20} /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-gray-500 text-sm font-semibold">
                            <div className="text-red-400">일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div className="text-blue-400">토</div>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {monthDays.map((date, idx) => {
                                if (!date) return <div key={`empty-${idx}`} className="aspect-square" />;

                                const dateStr = date.toISOString().split('T')[0];
                                const rate = completionMap[dateStr] || 0;
                                const isPerfect = rate === 1.0;
                                const isToday = dateStr === new Date().toISOString().split('T')[0];

                                return (
                                    <div
                                        key={idx}
                                        className={`
                                            aspect-square rounded-2xl flex flex-col items-center justify-start pt-2 relative border transition-all group
                                            ${isToday ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 bg-[#18181b] hover:border-white/20'}
                                        `}
                                    >
                                        <span className={`text-sm ${date.getDay() === 0 ? 'text-red-400' : (date.getDay() === 6 ? 'text-blue-400' : 'text-gray-400')}`}>
                                            {date.getDate()}
                                        </span>

                                        {/* Stamp Logic */}
                                        {rate > 0 && (
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                {isPerfect ? (
                                                    <div className="relative">
                                                        <Star size={32} className="text-yellow-500 fill-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                                                        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] text-black font-bold">ALL</span>
                                                    </div>
                                                ) : (
                                                    // Partial circle
                                                    <div className="w-8 h-8 rounded-full border-4 border-gray-700 flex items-center justify-center">
                                                        <div className="w-full h-full rounded-full border-4 border-green-500 opacity-50" style={{ clipPath: `inset(${100 - (rate * 100)}% 0 0 0)` }} />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Upcoming Tasks (4 Cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl h-full">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                                <Clock className="text-blue-500 mr-2" />
                                다가오는 일정
                            </h2>

                            <div className="space-y-4">
                                {getUpcomingTasks().length > 0 ? (
                                    getUpcomingTasks().map(task => (
                                        <div key={task.id} className="group bg-[#1c1c1f] hover:bg-[#252529] p-4 rounded-2xl border border-white/5 transition-all">
                                            <div className="text-xs text-blue-400 font-bold mb-1 flex items-center">
                                                <CalendarIcon size={12} className="mr-1" />
                                                {task.date}
                                            </div>
                                            <div className="font-medium text-gray-200 group-hover:text-white">
                                                {task.title}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-2 flex gap-2">
                                                <span className="px-2 py-0.5 bg-white/5 rounded-md">
                                                    {task.category}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-gray-500">
                                        <p>예정된 일정이 없습니다.</p>
                                        <p className="text-xs mt-2">새로운 할 일을 미리 등록해보세요!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
