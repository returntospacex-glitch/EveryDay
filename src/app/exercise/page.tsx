'use client';

import { useState, useEffect } from 'react';
import { Dumbbell, Activity, Calendar as CalendarIcon, Save, History, TrendingUp, Zap, ArrowLeft, Trophy, MoreHorizontal, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis } from 'recharts';

type ExerciseType = 'GYM' | 'RUNNING' | 'SPORT' | 'OTHER';

interface BaseExerciseRecord {
    id: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    type: ExerciseType;
    createdAt: number;
}

interface GymRecord extends BaseExerciseRecord {
    type: 'GYM';
    duration: number; // minutes
    bodyPart: string;
}

interface RunningRecord extends BaseExerciseRecord {
    type: 'RUNNING';
    duration: number; // minutes
    speed: number; // km/h
}

interface OtherRecord extends BaseExerciseRecord {
    type: 'SPORT' | 'OTHER';
    notes: string;
}

type ExerciseRecord = GymRecord | RunningRecord | OtherRecord;

export default function ExercisePage() {
    const [records, setRecords] = useState<ExerciseRecord[]>([]);

    // Form State
    const [type, setType] = useState<ExerciseType>('GYM');
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState('');
    const [bodyPart, setBodyPart] = useState('');
    const [speed, setSpeed] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        // Initialize time to current time
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        setTime(`${hours}:${minutes}`);

        const saved = localStorage.getItem('routine-keeper-exercise-v2');
        if (saved) {
            setRecords(JSON.parse(saved));
        }
    }, []);

    const handleSave = () => {
        if (!time) return;

        const baseRecord = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0], // Local date logic might need improvement if strictly needed, but reusing existing pattern
            time,
            createdAt: Date.now()
        };

        let newRecord: ExerciseRecord;

        if (type === 'GYM') {
            if (!duration || !bodyPart) return;
            newRecord = { ...baseRecord, type: 'GYM', duration: Number(duration), bodyPart };
        } else if (type === 'RUNNING') {
            if (!duration || !speed) return;
            newRecord = { ...baseRecord, type: 'RUNNING', duration: Number(duration), speed: Number(speed) };
        } else {
            if (!notes) return;
            newRecord = { ...baseRecord, type: type as 'SPORT' | 'OTHER', notes };
        }

        const updated = [newRecord, ...records];
        setRecords(updated);
        localStorage.setItem('routine-keeper-exercise-v2', JSON.stringify(updated));

        // Reset specific fields
        setDuration('');
        setBodyPart('');
        setSpeed('');
        setNotes('');
    };

    const handleDelete = (id: string) => {
        const updated = records.filter(r => r.id !== id);
        setRecords(updated);
        localStorage.setItem('routine-keeper-exercise-v2', JSON.stringify(updated));
    };

    // Stats Calculation
    const today = new Date().toISOString().split('T')[0];
    const todaysRecords = records.filter(r => r.date === today);
    const totalTimeToday = todaysRecords.reduce((acc, r) => {
        if (r.type === 'GYM' || r.type === 'RUNNING') {
            return acc + (r as any).duration; // Casting for simplicity
        }
        return acc;
    }, 0);

    // Chart Data (Last 7 Days Duration for Gym/Running)
    const getChartData = () => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayLabel = d.toLocaleDateString('ko-KR', { weekday: 'short' });

            const daysRecords = records.filter(r => r.date === dateStr);
            const duration = daysRecords.reduce((acc, r) => {
                if (r.type === 'GYM' || r.type === 'RUNNING') return acc + r.duration;
                return acc; // Sport/Other doesn't have duration currently
            }, 0);

            data.push({ name: dayLabel, value: duration });
        }
        return data;
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-emerald-500/30">
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto p-6 md:p-12 relative z-10">
                <header className="flex items-center mb-10">
                    <Link href="/" className="mr-6 p-3 hover:bg-white/5 rounded-2xl transition-colors border border-transparent hover:border-white/10 group">
                        <ArrowLeft size={24} className="text-gray-400 group-hover:text-white" />
                    </Link>
                    <div className="p-3 bg-emerald-500/10 rounded-2xl mr-4 border border-emerald-500/20">
                        <Dumbbell size={32} className="text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-400">운동 기록</h1>
                        <p className="text-gray-500 text-sm mt-1">오늘도 더 강해져 볼까요?</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Input Form (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />

                            <h2 className="text-lg font-bold mb-6 flex items-center text-gray-200 relative z-10">
                                <Activity className="mr-2 text-emerald-500" size={20} /> 활동 추가
                            </h2>

                            <div className="space-y-5 relative z-10">
                                {/* Type Selection */}
                                <div className="grid grid-cols-2 gap-2">
                                    {(['GYM', 'RUNNING', 'SPORT', 'OTHER'] as ExerciseType[]).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setType(t)}
                                            className={`py-3 rounded-xl text-sm font-bold border transition-all ${type === t
                                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/40'
                                                : 'bg-[#09090b] text-gray-500 border-white/5 hover:bg-white/5 hover:text-gray-300'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>

                                {/* Common Fields */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">시간</label>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all font-mono"
                                    />
                                </div>

                                {/* Dynamic Fields */}
                                {type === 'GYM' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">운동 부위</label>
                                            <input
                                                type="text"
                                                value={bodyPart}
                                                onChange={(e) => setBodyPart(e.target.value)}
                                                placeholder="예: 가슴, 등, 하체"
                                                className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-gray-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">운동 시간 (분)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={duration}
                                                    onChange={(e) => setDuration(e.target.value)}
                                                    placeholder="0"
                                                    className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                                <span className="absolute right-4 top-3.5 text-gray-500 text-sm">min</span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {type === 'RUNNING' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">달리기 시간 (분)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={duration}
                                                    onChange={(e) => setDuration(e.target.value)}
                                                    placeholder="0"
                                                    className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                                <span className="absolute right-4 top-3.5 text-gray-500 text-sm">min</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">평균 속도</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={speed}
                                                    onChange={(e) => setSpeed(e.target.value)}
                                                    placeholder="0"
                                                    className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all font-mono"
                                                />
                                                <span className="absolute right-4 top-3.5 text-gray-500 text-sm">km/h</span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {(type === 'SPORT' || type === 'OTHER') && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">내용 기록</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="어떤 활동을 하셨나요?"
                                            className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-gray-700 min-h-[120px] resize-none"
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={handleSave}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 flex items-center justify-center mt-4"
                                >
                                    <Save className="mr-2" size={20} />
                                    기록 저장
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Charts & History (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Stats Card */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <TrendingUp size={48} className="text-white" />
                                </div>
                                <h3 className="text-gray-400 font-medium mb-2">오늘 운동 시간</h3>
                                <p className="text-4xl font-bold text-white font-mono">{totalTimeToday}<span className="text-lg text-gray-500 ml-1">분</span></p>
                            </div>

                            <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                                <h3 className="text-gray-400 font-medium mb-4">주간 운동량 (GYM/RUN)</h3>
                                <div className="h-24">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={getChartData()}>
                                            <XAxis dataKey="name" hide />
                                            <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                                                {getChartData().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#10b981' : '#27272a'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Recent History */}
                        <div className="bg-[#121214] border border-white/5 rounded-3xl p-8 min-h-[400px]">
                            <h2 className="text-xl font-bold mb-6 flex items-center">
                                <History className="mr-2 text-emerald-500" size={24} /> 최근 기록
                            </h2>

                            <div className="space-y-4">
                                {records.length === 0 ? (
                                    <div className="text-center py-20 text-gray-500">
                                        <p>아직 기록된 운동이 없습니다.</p>
                                    </div>
                                ) : (
                                    records.map((record) => (
                                        <div key={record.id} className="flex items-center justify-between p-4 bg-[#09090b] rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold
                                                    ${record.type === 'GYM' ? 'bg-orange-500/10 text-orange-500' :
                                                        record.type === 'RUNNING' ? 'bg-cyan-500/10 text-cyan-500' :
                                                            record.type === 'SPORT' ? 'bg-purple-500/10 text-purple-500' :
                                                                'bg-gray-500/10 text-gray-400'
                                                    }`}
                                                >
                                                    {record.type === 'GYM' && <Dumbbell size={20} />}
                                                    {record.type === 'RUNNING' && <Zap size={20} />}
                                                    {record.type === 'SPORT' && <Trophy size={20} />}
                                                    {record.type === 'OTHER' && <MoreHorizontal size={20} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-bold text-gray-200">{record.type}</span>
                                                        <span className="text-xs text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded-md">{record.time}</span>
                                                        <span className="text-xs text-gray-600">{record.date}</span>
                                                    </div>

                                                    {/* Details based on type */}
                                                    <div className="mt-1 text-sm text-gray-400">
                                                        {record.type === 'GYM' && (
                                                            <span className="flex items-center">
                                                                <span className="text-orange-400 font-medium mr-2">{record.bodyPart}</span>
                                                                {record.duration}분
                                                            </span>
                                                        )}
                                                        {record.type === 'RUNNING' && (
                                                            <span className="flex items-center">
                                                                <span className="bg-cyan-900/30 text-cyan-400 px-1.5 rounded mr-2 text-xs font-mono">{record.speed}km/h</span>
                                                                {record.duration}분
                                                            </span>
                                                        )}
                                                        {(record.type === 'SPORT' || record.type === 'OTHER') && (
                                                            <span className="text-gray-400 line-clamp-1">{record.notes}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(record.id)}
                                                className="p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
