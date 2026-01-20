'use client';

import { useState, useEffect } from 'react';
import { SleepRecord } from '@/types/routine';
import { Moon, Clock, ArrowLeft, TrendingUp, Calendar, BarChart2, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList } from 'recharts';

export default function SleepPage() {
    const [records, setRecords] = useState<SleepRecord[]>([]);

    // Simple Input State
    const [bedTime, setBedTime] = useState('');
    const [bedTimeAmPm, setBedTimeAmPm] = useState('PM');
    const [wakeTime, setWakeTime] = useState('');
    const [wakeTimeAmPm, setWakeTimeAmPm] = useState('AM');

    // AI Score State
    const [aiScore, setAiScore] = useState<{ score: number, grade: string, msg: string } | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('routine-keeper-sleep');
        if (saved) {
            const parsed = JSON.parse(saved);
            setRecords(parsed);
            calculateAIScore(parsed);
        } else {
            setRecords([]);
            setAiScore(null);
        }
    }, []);

    const calculateAIScore = (data: SleepRecord[]) => {
        // Filter Last 30 Days (Rolling Window)
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const recentRecords = data.filter(r => new Date(r.date) >= thirtyDaysAgo);

        if (recentRecords.length === 0) {
            setAiScore({ score: 0, grade: 'N/A', msg: '최근 30일간 데이터가 없습니다.' });
            return;
        }

        // --- ULTRA HARD SCORING ALGORITHM V3 (User Feedback Tuned) ---
        // Goal: User feeling "Not bad" should get 65-75, not 88.
        // To get 90+, you must be a machine.

        // 1. Duration Score (50pts Max)
        // >= 7.5h : +1.67 pts (Perfect) -> 30 days = 50 pts
        // 7.0 ~ 7.4h : +0.8 pts (Okay) -> 30 days = 24 pts (Drastically reduced from 1.0)
        // 6.0 ~ 6.9h : 0 pts (No point) -> 0 pts
        // < 6.0h     : -2.0 pts (Penalty) -> Fails the score rapidly

        let totalDurationPoints = 0;

        recentRecords.forEach(r => {
            if (r.duration >= 7.5) totalDurationPoints += 1.67;
            else if (r.duration >= 7.0) totalDurationPoints += 0.8;
            else if (r.duration >= 6.0) totalDurationPoints += 0; // 0 pts for 6h range
            else totalDurationPoints -= 2.0; // Severe Penalty
        });

        // Clamp 0~50
        const durationScoreRaw = (totalDurationPoints / recentRecords.length) * 30;
        const durationScore = Math.max(0, Math.min(50, durationScoreRaw));


        // 2. Consistency Score (50pts Max) 
        // StdDev <= 15 min : 50 pts (God Tier)
        // StdDev <= 30 min : 40 pts (Excellent)
        // StdDev <= 45 min : 30 pts (Good)
        // StdDev <= 60 min : 20 pts (Average)
        // > 60 min : Rapid decay (-1 pt per min)

        const bedTimeMinutes = recentRecords.map(r => {
            const [h, m] = r.bedTime.split(':').map(Number);
            let mins = h * 60 + m;
            if (h >= 18) mins -= 24 * 60;
            return mins;
        });

        const meanBedTime = bedTimeMinutes.reduce((a, b) => a + b, 0) / bedTimeMinutes.length;
        const variance = bedTimeMinutes.reduce((a, b) => a + Math.pow(b - meanBedTime, 2), 0) / bedTimeMinutes.length;
        const stdDev = Math.sqrt(variance);

        let consistencyScore = 0;
        if (stdDev <= 15) consistencyScore = 50;
        else if (stdDev <= 30) consistencyScore = 40 + (10 - (stdDev - 15) / 1.5); // 40~50 range 
        else if (stdDev <= 60) consistencyScore = 20 + (20 - (stdDev - 30) / 1.5); // 20~40 range
        else consistencyScore = Math.max(0, 20 - (stdDev - 60)); // < 20

        const totalScore = Math.min(100, Math.round(durationScore + consistencyScore));

        // Stricter Grading Text
        let grade = '';
        let msg = '';

        if (totalScore >= 90) { grade = 'S'; msg = '기계이신가요? 완벽한 수면 패턴입니다.'; }
        else if (totalScore >= 80) { grade = 'A'; msg = '상위 1% 수면 습관! 아주 훌륭합니다.'; }
        else if (totalScore >= 70) { grade = 'B'; msg = '준수합니다. 하지만 S등급은 멀었습니다.'; }
        else if (totalScore >= 60) { grade = 'C'; msg = '평범하군요. 7.5시간 수면을 놓치지 마세요.'; }
        else if (totalScore >= 40) { grade = 'D'; msg = '분발하세요. 수면 빚이 쌓이고 있습니다.'; }
        else { grade = 'F'; msg = '몸이 비명을지르고 있습니다. 잠 좀 주무세요.'; }

        setAiScore({ score: totalScore, grade, msg });
    };

    const handleSave = () => {
        if (!bedTime || !wakeTime) return;

        const formatTime = (input: string, ampm: string) => {
            let hh = parseInt(input.slice(0, input.length - 2) || '0');
            const mm = parseInt(input.slice(-2));

            if (ampm === 'PM' && hh < 12) hh += 12;
            if (ampm === 'AM' && hh === 12) hh = 0;

            return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
        };

        const startStr = formatTime(bedTime, bedTimeAmPm);
        const endStr = formatTime(wakeTime, wakeTimeAmPm);

        const start = parseInt(startStr.split(':')[0]) * 60 + parseInt(startStr.split(':')[1]);
        const end = parseInt(endStr.split(':')[0]) * 60 + parseInt(endStr.split(':')[1]);
        let diff = end - start;
        if (diff < 0) diff += 24 * 60;

        const duration = parseFloat((diff / 60).toFixed(1));

        const newRecord: SleepRecord = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            bedTime: startStr,
            wakeTime: endStr,
            duration,
            quality: 3
        };

        const updated = [...records, newRecord];
        setRecords(updated);
        calculateAIScore(updated);
        localStorage.setItem('routine-keeper-sleep', JSON.stringify(updated));

        setBedTime('');
        setWakeTime('');
    };

    // --- Statistics Logic ---

    const getAverage = (days: number) => {
        const now = new Date();
        const cutoff = new Date();
        cutoff.setDate(now.getDate() - days);
        const targetRecords = records.filter(r => new Date(r.date) >= cutoff);
        if (targetRecords.length === 0) return 0;
        const sum = targetRecords.reduce((acc, r) => acc + r.duration, 0);
        return (sum / targetRecords.length).toFixed(1);
    };

    const getDailyStats = () => {
        const stats = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayLabel = d.toLocaleDateString('ko-KR', { weekday: 'short' });

            const record = records.find(r => r.date === dateStr);
            stats.push({
                name: `${d.getMonth() + 1}/${d.getDate()} (${dayLabel})`,
                value: record ? record.duration : 0
            });
        }
        return stats;
    };

    const getWeeklyStats = () => {
        const stats: { [key: string]: { total: number, count: number } } = {};
        const numberToOrdinal = ['첫째주', '둘째주', '셋째주', '넷째주', '다섯째주', '여섯째주'];

        records.forEach(r => {
            const d = new Date(r.date);
            const month = d.getMonth() + 1;
            const date = d.getDate();
            const firstDayOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
            const dayOfWeek = firstDayOfMonth.getDay();
            const weekNum = Math.ceil((date + dayOfWeek) / 7);
            const ordinal = numberToOrdinal[weekNum - 1] || `${weekNum}주`;

            const key = `${month}월 ${ordinal}`;

            if (!stats[key]) stats[key] = { total: 0, count: 0 };
            stats[key].total += r.duration;
            stats[key].count += 1;
        });

        return Object.entries(stats).map(([name, data]) => ({
            name,
            avg: Number((data.total / data.count).toFixed(1))
        })).slice(-5);
    };

    const getMonthlyStats = () => {
        const stats: { [key: string]: { total: number, count: number } } = {};
        records.forEach(r => {
            const month = parseInt(r.date.substring(5, 7));
            const key = `${month}월`;
            if (!stats[key]) stats[key] = { total: 0, count: 0 };
            stats[key].total += r.duration;
            stats[key].count += 1;
        });
        return Object.entries(stats).map(([name, data]) => ({
            name,
            avg: Number((data.total / data.count).toFixed(1))
        })).sort((a, b) => parseInt(a.name) - parseInt(b.name)).slice(-6);
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-purple-500/30">
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto p-6 md:p-12 relative z-10">
                <header className="flex items-center mb-10">
                    <Link href="/" className="mr-6 p-3 hover:bg-white/5 rounded-2xl transition-colors border border-transparent hover:border-white/10 group">
                        <ArrowLeft size={24} className="text-gray-400 group-hover:text-white" />
                    </Link>
                    <div className="p-3 bg-purple-500/10 rounded-2xl mr-4 border border-purple-500/20">
                        <Moon size={32} className="text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-400">수면 관리</h1>
                        <p className="text-gray-500 text-sm mt-1">충분한 휴식이 더 나은 내일을 만듭니다.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Panel: Input, AI Score, Quick Stats (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* AI Score Card */}
                        <div className="bg-gradient-to-br from-[#1c1c21] to-[#121214] border border-purple-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all duration-500" />
                            <h2 className="text-sm font-bold mb-4 flex items-center text-purple-300 uppercase tracking-widest">
                                <BrainCircuit className="mr-2" size={18} /> AI 수면 분석
                            </h2>
                            <div className="relative z-10">
                                <div className="flex items-end mb-2">
                                    <span className="text-5xl font-black text-white px-1 tracking-tighter shadow-purple-500/50 drop-shadow-sm">
                                        {aiScore ? aiScore.score : '--'}
                                    </span>
                                    <span className="text-xl font-bold text-gray-500 mb-2">/ 100</span>
                                    {aiScore && (
                                        <div className={`ml-auto px-4 py-1 text-white font-bold rounded-full text-sm ${aiScore.score >= 90 ? 'bg-purple-500' :
                                            aiScore.score >= 70 ? 'bg-green-500' :
                                                aiScore.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}>
                                            Grade {aiScore.grade}
                                        </div>
                                    )}
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed mt-3 border-t border-white/10 pt-3">
                                    {aiScore ? aiScore.msg : '데이터를 분석 중입니다...'}
                                </p>
                                <p className="text-xs text-gray-600 mt-2">
                                    * 최근 30일 ({new Date(new Date().setDate(new Date().getDate() - 30)).toLocaleDateString()} ~ 현재) 정밀 분석
                                </p>
                            </div>
                        </div>

                        {/* Input Box */}
                        <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                            <h2 className="text-lg font-bold mb-6 flex items-center text-gray-200 relative z-10">
                                <Clock className="mr-2 text-purple-500" size={20} /> 수면 기록하기
                            </h2>

                            <div className="space-y-4 relative z-10">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Bed Time */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">취침 시간</label>
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={bedTime}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    if (val.length <= 4) setBedTime(val);
                                                }}
                                                placeholder="1130"
                                                className="w-full bg-[#09090b] border border-white/10 rounded-xl px-2 py-3 text-white focus:border-purple-500 outline-none transition-colors text-center font-sans tracking-tight placeholder:text-gray-700 text-lg"
                                            />
                                            <button
                                                onClick={() => setBedTimeAmPm(prev => prev === 'AM' ? 'PM' : 'AM')}
                                                className={`px-3 rounded-xl text-sm font-bold border transition-all ${bedTimeAmPm === 'PM' ? 'bg-purple-900/40 text-purple-400 border-purple-500' : 'bg-[#09090b] text-gray-500 border-white/10'}`}
                                            >
                                                {bedTimeAmPm}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Wake Time */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">기상 시간</label>
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={wakeTime}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    if (val.length <= 4) setWakeTime(val);
                                                }}
                                                placeholder="0700"
                                                className="w-full bg-[#09090b] border border-white/10 rounded-xl px-2 py-3 text-white focus:border-purple-500 outline-none transition-colors text-center font-sans tracking-tight placeholder:text-gray-700 text-lg"
                                            />
                                            <button
                                                onClick={() => setWakeTimeAmPm(prev => prev === 'AM' ? 'PM' : 'AM')}
                                                className={`px-3 rounded-xl text-sm font-bold border transition-all ${wakeTimeAmPm === 'AM' ? 'bg-orange-900/40 text-orange-400 border-orange-500' : 'bg-[#09090b] text-gray-500 border-white/10'}`}
                                            >
                                                {wakeTimeAmPm}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSave}
                                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl mt-2 shadow-lg shadow-purple-900/30 transition-all active:scale-[0.98]"
                                >
                                    저장하기
                                </button>
                            </div>
                        </div>

                        {/* Recent Averages Card */}
                        <div className="bg-[#121214] border border-white/5 rounded-3xl p-6">
                            <h3 className="text-gray-400 font-bold mb-4 flex items-center"><TrendingUp size={16} className="mr-2" /> 평균 수면 시간</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-white/5 rounded-xl p-4">
                                    <span className="text-sm text-gray-400">최근 3일</span>
                                    <span className="text-xl font-bold font-sans tracking-tight text-white">{getAverage(3)}h</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 rounded-xl p-4 border border-purple-500/20">
                                    <span className="text-sm text-purple-300">최근 7일</span>
                                    <span className="text-xl font-bold font-sans tracking-tight text-purple-400">{getAverage(7)}h</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 rounded-xl p-4">
                                    <span className="text-sm text-gray-400">최근 30일</span>
                                    <span className="text-xl font-bold font-sans tracking-tight text-white">{getAverage(30)}h</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Panel: Statistics (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Daily Stats (Last 7 Days) */}
                        <div className="bg-[#121214] border border-white/5 rounded-3xl p-8">
                            <h3 className="text-gray-200 font-bold mb-8 flex items-center">
                                <TrendingUp size={18} className="mr-2 text-green-400" /> 최근 7일 그래프
                            </h3>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={getDailyStats()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            formatter={(value) => [`${value} 시간`, '수면 시간']}
                                        />
                                        <Bar dataKey="value" fill="#34d399" radius={[6, 6, 0, 0]} barSize={40}>
                                            <LabelList
                                                dataKey="value"
                                                position="top"
                                                fill="#6ee7b7"
                                                fontSize={18}
                                                fontWeight="bold"
                                                formatter={(val: number) => val === 0 ? '' : `${val}h`}
                                            />
                                            {getDailyStats().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={'#34d399'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Weekly Breakdown */}
                        <div className="bg-[#121214] border border-white/5 rounded-3xl p-8">
                            <h3 className="text-gray-200 font-bold mb-8 flex items-center">
                                <Calendar size={18} className="mr-2 text-purple-500" /> 주별 평균 수면
                            </h3>
                            <div className="h-56 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={getWeeklyStats()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            formatter={(value) => [`${value} 시간`, '평균 수면']}
                                        />
                                        <Bar dataKey="avg" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={50}>
                                            <LabelList
                                                dataKey="avg"
                                                position="top"
                                                fill="#a78bfa"
                                                fontSize={18}
                                                fontWeight="bold"
                                                formatter={(val: number) => `${val}h`}
                                            />
                                            {getWeeklyStats().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.avg >= 7 ? '#8b5cf6' : '#ef4444'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Monthly Breakdown */}
                        <div className="bg-[#121214] border border-white/5 rounded-3xl p-8">
                            <h3 className="text-gray-200 font-bold mb-8 flex items-center">
                                <BarChart2 size={18} className="mr-2 text-blue-500" /> 월별 평균 수면
                            </h3>
                            <div className="h-56 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={getMonthlyStats()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            formatter={(value) => [`${value} 시간`, '평균 수면']}
                                        />
                                        <Bar dataKey="avg" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={50}>
                                            <LabelList
                                                dataKey="avg"
                                                position="top"
                                                fill="#60a5fa"
                                                fontSize={18}
                                                fontWeight="bold"
                                                formatter={(val: number) => `${val}h`}
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
