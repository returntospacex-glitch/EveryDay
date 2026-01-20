'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
    const { user, signInWithGoogle } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white">
            <div className="text-center space-y-6 max-w-sm w-full p-8 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-xl">
                <h1 className="text-3xl font-bold">EveryDay</h1>
                <p className="text-gray-400">당신의 하루를 기록하세요.</p>

                <button
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center space-x-3 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                    <span>Google로 로그인</span>
                </button>
            </div>
        </div>
    );
}
