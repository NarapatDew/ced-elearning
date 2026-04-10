import React, { useState } from 'react';
import type { UserProfile, Course, Assignment, Submission } from '../../types';
import StatCard from './StatCard';
import ProgressRing from './ProgressRing';
import UnifiedTodo from './UnifiedTodo';
import SmartCompanion from './SmartCompanion';

import { Folder, AlertTriangle, ExternalLink, ChevronRight } from 'lucide-react';
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
    const [showArchivedCourses, setShowArchivedCourses] = useState(false);
    const [showActiveCourses, setShowActiveCourses] = useState(true);
    // Calculate Global Completion
    const totalAssignments = assignments.length;
    const completedAssignments = submissions.filter(s => s.state === 'TURNED_IN' || s.state === 'RETURNED').length;
    const globalCompletion = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

    // Calculate Missing Tasks
    const missingTasks = assignments.filter(a => {
        const sub = submissions.find(s => s.courseWorkId === a.id);
        const isTurnedIn = sub?.state === 'TURNED_IN' || sub?.state === 'RETURNED';
        if (isTurnedIn) return false;
        
        let isPastDue = false;
        if (a.dueDate) {
            const hr = a.dueTime?.hours || 23;
            const min = a.dueTime?.minutes || 59;
            const dueDateObj = new Date(Date.UTC(a.dueDate.year, a.dueDate.month - 1, a.dueDate.day, hr, min));
            isPastDue = dueDateObj.getTime() - new Date().getTime() < 0;
        }
        return isPastDue;
    }).length;

    // Separate Active and Archived Courses
    const activeCourses = courses.filter(c => c.courseState === 'ACTIVE' || !c.courseState); // Default to active if undefined
    const archivedCourses = courses.filter(c => c.courseState === 'ARCHIVED');

    // Filter assignments: Only show assignments from Active Courses in the 'Upcoming' feed
    const activeCourseIds = new Set(activeCourses.map(c => c.id));
    const activeAssignments = assignments.filter(a => activeCourseIds.has(a.courseId));

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
            {/* Department Header */}
            <header className="bg-white border-b border-border py-3 px-4 md:px-6 xl:px-4 sticky top-0 z-50 shadow-sm bg-gradient-to-r from-white via-orange-50/30 to-white">
                <div className="w-full max-w-6xl 2xl:max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
                    {/* Branding */}
                    <div className="flex items-center gap-3 w-full md:w-auto mb-4 md:mb-0">
                        <img src="/logos/dce_logo.png" alt="Classroom Companion" className="h-10 w-auto hover:opacity-90 transition-opacity" />
                        <div className="min-w-0 flex flex-col justify-center">
                            <h1 className="text-xl font-black text-gray-800 tracking-tight leading-none">
                                {t('brand.name')}
                            </h1>
                            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-0.5">{language === 'th' ? 'พื้นที่ของนักเรียน' : 'Student Workspace'}</p>
                        </div>
                    </div>
                    {/* User Profile */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <LanguageToggle />
                        <div className="h-8 w-px bg-gray-200 mx-1"></div>
                        <button 
                            onClick={onLogout}
                            className="text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                        >
                            {t('dashboard.signOut')}
                        </button>
                        <div className="flex items-center gap-2 pl-2">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-bold text-gray-800">{user.name}</p>
                            </div>
                            <img src={user.photoUrl} alt="Profile" className="w-9 h-9 rounded-full ring-2 ring-orange-100 shadow-sm object-cover" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6 xl:p-5 max-w-6xl 2xl:max-w-7xl mx-auto w-full flex flex-col space-y-6">
                
                {/* Top Row: Metrics (Always on top) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <StatCard
                                title={language === 'th' ? 'งานค้างส่ง' : 'Missing Tasks'}
                                value={missingTasks}
                                icon={AlertTriangle}
                            />
                            <StatCard
                                title={t('dashboard.activeCourses')}
                                value={activeCourses.length}
                                icon={Folder}
                            />
                        </div>

                        {/* Proactive Smart Companion Assistant */}
                        <div className="w-full">
                            <SmartCompanion assignments={activeAssignments} submissions={submissions} />
                        </div>

                        {/* Dashboard Grid Container: Mobile reverse, Desktop grid */}
                        <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-6 xl:gap-4">

                            {/* Left Column: Courses & Analytics (Bottom on Mobile) */}
                            <div className="lg:col-span-8 xl:col-span-9 space-y-6">

                                {/* Active Courses Grid */}
                                <div>
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <h2 className="text-lg font-medium text-text">{t('dashboard.activeCourses')}</h2>
                                        <button
                                            onClick={() => setShowActiveCourses(prev => !prev)}
                                            className="text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                                        >
                                            {showActiveCourses
                                                ? (language === 'th' ? 'ซ่อน' : 'Hide')
                                                : (language === 'th' ? `แสดง (${activeCourses.length})` : `Show (${activeCourses.length})`)}
                                        </button>
                                    </div>
                                    
                                    <div className={`transition-all duration-300 ${!showActiveCourses ? 'hidden' : ''}`}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-4 mb-10">
                                            {activeCourses.length === 0 ? (
                                    <div className="col-span-full h-32 flex items-center justify-center bg-white border border-border border-dashed rounded-lg text-muted">
                                        {language === 'th' ? 'ไม่พบรายวิชาที่เปิดใช้งาน' : 'No active courses found.'}
                                    </div>
                                ) : (
                                    activeCourses.map(course => (
                                        <div key={course.id} className="group bg-white border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-300 hover:ring-1 hover:ring-blue-300 transition-all duration-300 cursor-pointer flex flex-col h-full min-h-[280px] hover:-translate-y-1 relative">
                                            {/* Invisible clickable overlay for the whole card */}
                                            <a href={course.alternateLink} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-0 text-transparent" aria-hidden="true" tabIndex={-1}>&nbsp;</a>
                                            
                                            {/* Banner */}
                                            <div 
                                                className="min-h-[6.5rem] h-auto p-4 pb-10 relative overflow-hidden bg-cover bg-center"
                                                style={{
                                                    backgroundImage: ((course as any).courseGroupTheme?.info?.headerImageUrl || (course as any).headerImageUrl)
                                                        ? `url(${((course as any).courseGroupTheme?.info?.headerImageUrl || (course as any).headerImageUrl)})`
                                                        : undefined,
                                                    background: !((course as any).courseGroupTheme?.info?.headerImageUrl || (course as any).headerImageUrl) 
                                                        ? ((course as any).courseGroupTheme?.themeColor || `linear-gradient(135deg, hsl(${(course.name.charCodeAt(0)*137)%360}, 70%, 60%), hsl(${(course.name.charCodeAt(0)*137)%360}, 80%, 40%))`)
                                                        : undefined
                                                }}
                                            >
                                                {/* Dark overlay for readability if image exists */}
                                                {((course as any).courseGroupTheme?.info?.headerImageUrl || (course as any).headerImageUrl) && (
                                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"></div>
                                                )}
                                                
                                                <div className="flex justify-between items-start relative z-10">
                                                    <h3 className="text-white font-medium text-xl w-[85%] pointer-events-none text-balance line-clamp-2 leading-snug drop-shadow-md" title={course.name}>
                                                        <a href={course.alternateLink} target="_blank" rel="noopener noreferrer" className="pointer-events-auto hover:underline">
                                                            {course.name}
                                                        </a>
                                                    </h3>
                                                </div>
                                                <p className="text-white/95 font-medium text-sm mt-1 line-clamp-2 relative z-10 drop-shadow-md" title={course.section}>{course.section}</p>
                                            </div>

                                            {/* Body */}
                                            <div className="p-4 pt-10 flex-1 flex flex-col">
                                                <div className="flex-1">
                                                    <p className="text-xs text-muted font-medium uppercase mt-2">
                                                        {language === 'th' ? 'งานที่ต้องส่ง' : 'Assignments Due'}
                                                    </p>
                                                    <div className="mt-2 space-y-2">
                                                        {assignments.filter(a => a.courseId === course.id).slice(0, 2).map(a => (
                                                            <a key={a.id} href={a.alternateLink} target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-primary truncate flex items-center gap-2 block relative z-10 group/item">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-muted group-hover/item:bg-primary transition-colors"></span>
                                                                <span className="group-hover/item:underline">{a.title}</span>
                                                            </a>
                                                        ))}
                                                        {assignments.filter(a => a.courseId === course.id).length === 0 && (
                                                            <span className="text-sm text-muted italic">{language === 'th' ? 'ยอดเยี่ยม! ไม่มีงานที่ต้องส่ง' : 'Woohoo, no work due!'}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="border-t border-border pt-4 mt-2 flex justify-between items-center relative z-10">
                                                    {/* Hint text that fades in on hover */}
                                                    <span className="text-[10px] sm:text-xs text-orange-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 -translate-x-2 group-hover:translate-x-0 pointer-events-none">
                                                        <ChevronRight size={14} /> 
                                                        {language === 'th' ? 'ไปที่ห้องเรียน' : 'Go to Class'}
                                                    </span>

                                                    {/* Styled Button */}
                                                    <a href={course.alternateLink} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary bg-blue-50 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-md transition-colors duration-300 flex items-center gap-1.5 shadow-sm group-hover:shadow min-w-max">
                                                        {language === 'th' ? 'เปิดใน Classroom' : 'Open in Classroom'}
                                                        <ExternalLink size={12} className="opacity-70" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                        </div>
                                    </div>



                            {/* Archived Courses */}
                            {archivedCourses.length > 0 && (
                                <>
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <h2 className="text-lg font-medium text-muted flex items-center gap-2">
                                            <Folder className="w-5 h-5" /> {language === 'th' ? 'วิชาที่เก็บถาวร' : 'Archived Courses'}
                                        </h2>
                                        <button
                                            onClick={() => setShowArchivedCourses(prev => !prev)}
                                            className="text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                                        >
                                            {showArchivedCourses
                                                ? (language === 'th' ? 'ซ่อนรายการ' : 'Hide')
                                                : (language === 'th' ? `ดูรายการ (${archivedCourses.length})` : `Show (${archivedCourses.length})`)}
                                        </button>
                                    </div>
                                    {showArchivedCourses && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-4 opacity-80 hover:opacity-100 transition-opacity">
                                            {archivedCourses.map(course => (
                                                <div key={course.id} className="bg-gray-50 border border-border rounded-lg overflow-hidden flex flex-col h-full min-h-[200px]">
                                                    {/* Banner */}
                                                    <div 
                                                        className="min-h-[4rem] h-auto p-4 pb-6 relative grayscale overflow-hidden bg-cover bg-center"
                                                        style={{
                                                            backgroundImage: ((course as any).courseGroupTheme?.info?.headerImageUrl || (course as any).headerImageUrl)
                                                                ? `url(${((course as any).courseGroupTheme?.info?.headerImageUrl || (course as any).headerImageUrl)})`
                                                                : undefined,
                                                            backgroundColor: (course as any).courseGroupTheme?.themeColor || '#6b7280'
                                                        }}
                                                    >
                                                        {/* Dark overlay for readability if image exists */}
                                                        {((course as any).courseGroupTheme?.info?.headerImageUrl || (course as any).headerImageUrl) && (
                                                            <div className="absolute inset-0 bg-black/40"></div>
                                                        )}
                                                        <h3 className="text-white font-medium text-lg text-balance line-clamp-2 w-[85%] relative z-10 pointer-events-none leading-snug" title={course.name}>
                                                            {course.name}
                                                        </h3>
                                                    </div>

                                                    {/* Body */}
                                                    <div className="p-4 pt-8 flex-1 flex flex-col justify-end">
                                                        <div className="border-t border-border pt-3 flex justify-between items-center">
                                                            <span className="text-xs text-muted italic">{language === 'th' ? 'เก็บถาวร' : 'Archived'}</span>
                                                            <a href={course.alternateLink} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-muted hover:underline flex items-center gap-1">
                                                                {language === 'th' ? 'ดูชั้นเรียน' : 'View Class'}
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Progress & Feed */}
                    <div className="md:col-span-12 lg:col-span-4 xl:col-span-3 space-y-6">

                        {/* Global Progress */}
                        <div className="bg-white border border-border rounded-lg p-6 shadow-card flex flex-col items-center">
                            <h3 className="text-muted text-xs font-medium uppercase tracking-wider mb-4">{t('dashboard.overallProgress')}</h3>
                            <ProgressRing percentage={globalCompletion} color="#188038" size={140} strokeWidth={8} />
                            <p className="mt-4 text-center text-sm text-text">
                                {language === 'th' ? 'ทำได้ดีมาก รักษาความต่อเนื่องไว้!' : "You're doing great! Keep keeping up."}
                            </p>
                        </div>

                        {/* Unified Todo List */}
                        <div className="h-[500px]">
                            <UnifiedTodo courses={activeCourses} assignments={activeAssignments} submissions={submissions} />
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
