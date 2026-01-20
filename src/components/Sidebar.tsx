'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Dumbbell, Moon, Calendar as CalendarIcon, TrendingUp, Settings, User as UserIcon, Sparkles, Zap } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="hidden md:flex flex-col w-72 border-r border-white/5 bg-[#0c0c0e]/50 backdrop-blur-xl p-8 h-screen sticky top-0 z-20">
            <div className="flex items-center space-x-4 mb-12">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-white/20">
                    <Zap size={32} className="text-white fill-white/20" />
                </div>
                <span className="font-bold text-4xl tracking-tighter">Every<span className="text-blue-500">Day</span></span>
            </div>

            <div className="space-y-2 flex-1">
                <Link
                    href="/"
                    className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-medium transition-all text-lg ${isActive('/')
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/10'
                        : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
                        }`}
                >
                    <LayoutDashboard size={24} /> <span>대시보드</span>
                </Link>
                <Link
                    href="/exercise"
                    className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-medium transition-all text-lg ${isActive('/exercise')
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/10'
                        : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
                        }`}
                >
                    <Dumbbell size={24} /> <span>운동 기록</span>
                </Link>
                <Link
                    href="/sleep"
                    className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-medium transition-all text-lg ${isActive('/sleep')
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/10'
                        : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
                        }`}
                >
                    <Moon size={24} /> <span>수면 기록</span>
                </Link>
                <Link
                    href="/calendar"
                    className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-medium transition-all text-lg ${isActive('/calendar')
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/10'
                        : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
                        }`}
                >
                    <CalendarIcon size={24} /> <span>캘린더</span>
                </Link>
                <Link
                    href="/statistics"
                    className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-medium transition-all text-lg ${isActive('/statistics')
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/10'
                        : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
                        }`}
                >
                    <TrendingUp size={24} /> <span>통계</span>
                </Link>
                <button className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-colors text-lg">
                    <Settings size={24} /> <span>설정</span>
                </button>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-gray-900 to-black border border-white/10">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <UserIcon size={18} className="text-gray-300" />
                    </div>
                    <div>
                        <p className="font-bold text-base">사용자</p>
                        <p className="text-sm text-gray-500">Free Plan</p>
                    </div>
                </div>
            </div>
        </nav>
    );
}
