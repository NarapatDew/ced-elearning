import React from 'react';
import { LogOut } from 'lucide-react';
import type { UserProfile, Course, Assignment, Submission } from '../../types';
import ProgressRing from './ProgressRing';
import UnifiedTodo from './UnifiedTodo';
import AIInsights from './AIInsights';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../common/LanguageToggle';

interface DashboardLayoutProps {
    user: UserProfile;
    courses: Course[];
    assignments: Assignment[];
    submissions: Submission[];
    onLogout: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, courses, assignments, submissions, onLogout }) => {
    const { language, t } = useLanguage();

    // Calculate Global Completion
    const totalAssignments = assignments.length;
    const completedAssignments = submissions.filter(s => s.state === 'TURNED_IN' || s.state === 'RETURNED').length;
    const globalCompletion = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

    const getProgressColor = (percent: number) => {
        if (percent === 100) return '#10b981'; // Green
        if (percent >= 60) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    };

    // Separate Active Courses
    const activeCourses = courses.filter(c => c.courseState === 'ACTIVE' || !c.courseState); // Default to active if undefined

    // Filter assignments: Only show assignments from Active Courses in the 'Upcoming' feed
    const activeCourseIds = new Set(activeCourses.map(c => c.id));
    const activeAssignments = assignments.filter(a => activeCourseIds.has(a.courseId));

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
            {/* Department Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 py-4 px-4 md:px-8 xl:px-6 sticky top-0 z-50 shadow-sm transition-all duration-300">
                <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Branding */}
                    <div className="flex items-center gap-4 w-full md:w-auto mb-2 md:mb-0 transform hover:scale-[1.02] transition-transform">
                        <div className="relative">
                            <img src="/logos/dce_logo.png" alt="Classroom Companion" className="h-10 w-auto hover:opacity-90 transition-opacity" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="min-w-0 flex flex-col justify-center">
                            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter leading-none">
                                {t('brand.name')}
                            </h1>
                            <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mt-1.5 antialiased">
                                {t('dashboard.studentWorkspace')}
                            </p>
                        </div>
                    </div>
                    {/* User Profile */}
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end bg-slate-50 md:bg-transparent p-2 md:p-0 rounded-2xl border border-slate-100 md:border-0">
                        <div className="flex items-center gap-3">
                            <LanguageToggle />
                        </div>
                        <div className="flex items-center gap-3 pl-3 md:pl-5 border-l border-slate-200 md:border-0">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-black text-slate-900 leading-none mb-1">{user.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 truncate max-w-[150px] uppercase tracking-wider">{user.email}</p>
                            </div>
                            <div className="relative group">
                                <img src={user.photoUrl} alt="Profile" className="w-10 h-10 rounded-2xl ring-4 ring-orange-50 shadow-md object-cover transition-transform group-hover:scale-105" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                            </div>
                            <div className="h-8 w-px bg-slate-200 hidden md:block mx-1"></div>
                            <button 
                                onClick={onLogout}
                                className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-100"
                                title={language === 'th' ? 'ออกจากระบบ' : 'Sign Out'}
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 xl:p-8 max-w-7xl 2xl:max-w-[1440px] mx-auto w-full flex flex-col space-y-8">
                
                <div className="w-full mx-auto space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 xl:gap-10 items-start">
                        {/* AI Insights (Left) */}
                        <div className="lg:col-span-1 h-[600px]">
                            <AIInsights assignments={activeAssignments} submissions={submissions} />
                        </div>

                        {/* Unified Todo List (Center) */}
                        <div className="lg:col-span-2 h-[600px]">
                            <UnifiedTodo courses={activeCourses} assignments={activeAssignments} submissions={submissions} />
                        </div>

                        {/* Global Progress (Right) */}
                        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm flex flex-col items-center justify-center h-[600px] relative overflow-hidden group">
                            {/* Background Accents (Subtle) */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.03] blur-[60px] rounded-full"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/[0.03] blur-[80px] rounded-full"></div>

                            <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-12 relative z-10">{t('dashboard.overallProgress')}</h3>
                            <div className="relative z-10 transform transition-transform duration-700 group-hover:scale-110">
                                <ProgressRing percentage={globalCompletion} color={getProgressColor(globalCompletion)} size={200} strokeWidth={12} />
                            </div>
                            
                            <div className="mt-12 relative z-10">
                                <p className="text-center text-sm text-slate-700 font-extrabold px-6 leading-relaxed mb-4">
                                    {globalCompletion === 100 
                                        ? (language === 'th' ? 'สมบูรณ์แบบ! คุณส่งงานครบทุกชิ้นแล้ว' : 'Perfect! You have completed everything.')
                                        : globalCompletion >= 60
                                            ? (language === 'th' ? 'ทำได้ดีมาก! อีกนิดเดียวจะครบแล้ว' : 'Great job! You are almost there.')
                                            : (language === 'th' ? 'พยายามเข้า! ยังมีงานที่ต้องส่งอยู่นะ' : 'Keep going! There are still tasks to submit.')
                                    }
                                </p>
                                <div className="flex justify-center gap-1.5">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className={`h-1 rounded-full transition-all duration-500 ${
                                            (globalCompletion >= 100) ? 'w-6 bg-emerald-500' :
                                            (globalCompletion >= 60 && i <= 2) ? 'w-6 bg-amber-500' :
                                            (globalCompletion < 60 && i <= 1) ? 'w-6 bg-rose-500' :
                                            'w-2 bg-slate-200'
                                        }`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
