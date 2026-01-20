'use client';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user && pathname !== '/login') {
                router.push('/login');
            } else if (user && pathname === '/login') {
                router.push('/');
            }
        }
    }, [user, loading, pathname, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-400 text-sm">EveryDay 로딩중...</p>
                </div>
            </div>
        );
    }

    // If on login page, verify we are not logged in (handled by useEffect), then show content without sidebar
    if (pathname === '/login') {
        return <main className="min-h-screen bg-[#09090b]">{children}</main>;
    }

    // If not logged in and not on login page, return null (useEffect will redirect)
    if (!user) return null;

    // Authenticated Layout
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[#09090b]">
            <Sidebar />
            <main className="flex-1 relative min-h-screen">
                {children}
            </main>
        </div>
    );
}
