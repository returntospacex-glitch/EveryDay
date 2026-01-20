'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, YAxis, CartesianGrid } from 'recharts';
import { ArrowLeft, CheckCircle2, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import FeedbackCard from '@/components/FeedbackCard';
import { Routine } from '@/types/routine';

export default function StatisticsPage() {
    const [weeklyData, setWeeklyData] = useState<{ day: string; rate: number }[]>([]);
    const [categoryData, setCategoryData] = useState<{ name: string; value: number; color: string }[]>([]);
    const [totalTasks, setTotalTasks] = useState(0);
    const [completionRate, setCompletionRate] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem('routine-keeper-data');
        if (saved) {
            try {
                const routines: Routine[] = JSON.parse(saved);
                processData(routines);
            } catch (e) {
                console.error("Failed to parse routines", e);
            }
        } else {
            // Mock data or empty state processing
            setWeeklyData([
                { day: 'Mon', rate: 0 }, { day: 'Tue', rate: 0 }, { day: 'Wed', rate: 0 },
                { day: 'Thu', rate: 0 }, { day: 'Fri', rate: 0 }, { day: 'Sat', rate: 0 }, { day: 'Sun', rate: 0 }
            ]);
        }
    }, []);

    const processData = (routines: Routine[]) => {
        // 1. Calculate Weekly Progress (Last 7 Days)
        const today = new Date();
        const weekStats = [];
        let weekCompleted = 0;
        let weekTotal = 0;

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue...

            const dayRoutines = routines.filter(r => r.date === dateStr);
            const total = dayRoutines.length;
            const completed = dayRoutines.filter(r => r.isCompleted).length;
            const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

            weekStats.push({ day: dayLabel, rate });

            // For overall feedback card (based on today or recent)
            if (i === 0) { // Today's stats for feedback
                // Actually feedback card might be better as "Recent Average" or "Today". Let's use Today.
            }
        }
        setWeeklyData(weekStats);

        // Calculate Today's Completion Rate for FeedbackCard
        const todayStr = today.toISOString().split('T')[0];
        const todayRoutines = routines.filter(r => r.date === todayStr);
        const todayRate = todayRoutines.length > 0
            ? Math.round((todayRoutines.filter(r => r.isCompleted).length / todayRoutines.length) * 100)
            : 0;
        setCompletionRate(todayRate);


        // 2. Calculate Category Distribution (All Time)
        const categories: Record<string, number> = {};
        routines.forEach(r => {
            const cat = r.category;
            categories[cat] = (categories[cat] || 0) + 1;
        });

        const catColors: Record<string, string> = {
            '운동': '#3b82f6', // blue-500
            '공부': '#10b981', // emerald-500
            '수면': '#8b5cf6', // violet-500
            '루틴': '#f59e0b', // amber-500
            '기타': '#6b7280', // gray-500
        };

        const catStats = Object.keys(categories).map(cat => ({
            name: cat,
            value: categories[cat],
            color: catColors[cat] || '#6b7280'
        }));

        setCategoryData(catStats);
        setTotalTasks(routines.length);
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-blue-500/30">
            {/* Background Gradients */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto p-6 md:p-12 relative z-10">
                <header className="flex items-center mb-10">
                    <Link href="/" className="mr-6 p-3 hover:bg-white/5 rounded-2xl transition-colors border border-transparent hover:border-white/10 group">
                        <ArrowLeft size={24} className="text-gray-400 group-hover:text-white" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">통계 대시보드</h1>
                        <p className="text-gray-500 text-sm mt-1">나의 루틴 성과를 분석해보세요</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Feedback Section (Full Width) */}
                    <div className="md:col-span-12">
                        <FeedbackCard rate={completionRate} />
                    </div>

                    {/* Weekly Progress Chart (8 cols) */}
                    <div className="md:col-span-8 bg-[#121214]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold flex items-center">
                                <BarChart2 className="mr-3 text-blue-500" size={24} /> 주간 달성률
                            </h2>
                            <div className="flex space-x-2">
                                <button className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-300 hover:bg-white/10 transition-colors">최근 7일</button>
                            </div>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                                    <XAxis
                                        dataKey="day"
                                        stroke="#71717a"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#71717a"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="rate" radius={[8, 8, 8, 8]}>
                                        {weeklyData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.rate >= 80 ? 'url(#colorBlue)' : '#3f3f46'}
                                            />
                                        ))}
                                    </Bar>
                                    <defs>
                                        <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.8} />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category Distribution (4 cols) */}
                    <div className="md:col-span-4 bg-[#121214]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col">
                        <h2 className="text-xl font-bold mb-8 flex items-center">
                            <CheckCircle2 className="mr-3 text-emerald-500" size={24} /> 집중 영역
                        </h2>
                        <div className="flex-1 min-h-[250px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        cornerRadius={8}
                                        stroke="none"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-4xl font-bold text-white">{totalTasks}</span>
                                <span className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Tasks</span>
                            </div>
                        </div>
                        <div className="mt-8 space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {categoryData.map(cat => (
                                <div key={cat.name} className="flex items-center justify-between text-sm group cursor-default">
                                    <div className="flex items-center text-gray-300 group-hover:text-white transition-colors">
                                        <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: cat.color, boxShadow: `0 0 10px ${cat.color}80` }} />
                                        {cat.name}
                                    </div>
                                    <span className="font-bold text-gray-500 group-hover:text-gray-300">
                                        {Math.round(cat.value / totalTasks * 100)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
