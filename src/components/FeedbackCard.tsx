'use client';

import { Sparkles, AlertCircle, Award } from 'lucide-react';

interface FeedbackCardProps {
    rate: number;
}

export default function FeedbackCard({ rate }: FeedbackCardProps) {
    let message = '';
    let icon = <Sparkles className="text-yellow-400" size={24} />;
    let containerClass = 'bg-gray-800 border-gray-700';
    let gradientClass = 'from-gray-800 to-gray-900';

    if (rate >= 80) {
        message = "대단해요! 오늘 목표를 거의 달성하셨네요. 🔥";
        icon = <Award className="text-yellow-200" size={28} />;
        gradientClass = 'from-blue-900/40 to-indigo-900/40 border-blue-500/30';
    } else if (rate >= 50) {
        message = "좋아요! 꾸준히 잘 하고 계십니다. 화이팅! 💪";
        icon = <Sparkles className="text-blue-200" size={28} />;
        gradientClass = 'from-gray-800/80 to-gray-900/80 border-white/10';
    } else {
        message = "시작이 반입니다. 작은 것부터 하나씩 해봐요! 🌱";
        icon = <AlertCircle className="text-emerald-200" size={28} />;
        gradientClass = 'from-gray-800/80 to-gray-900/80 border-white/10';
    }

    return (
        <div className={`p-6 rounded-3xl border ${gradientClass} bg-gradient-to-r flex items-center space-x-5 mb-6 shadow-lg relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-white/10 transition-colors" />

            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md shadow-inner border border-white/10">
                {icon}
            </div>
            <div className="relative z-10">
                <h3 className="font-bold text-gray-100 text-lg mb-0.5">AI Insight</h3>
                <p className="text-gray-400 leading-relaxed font-medium">
                    {message}
                </p>
            </div>
        </div>
    );
}
