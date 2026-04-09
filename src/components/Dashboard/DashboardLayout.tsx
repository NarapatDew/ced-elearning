import React, { useState } from 'react';
import type { UserProfile, Course, Assignment, Submission } from '../../types';
import StatCard from './StatCard';
import ProgressRing from './ProgressRing';
import AssignmentTimeline from './AssignmentTimeline';
import UnifiedTodo from './UnifiedTodo';
import CourseTrendDashboard from './CourseTrendDashboard';
import { Folder, Award } from 'lucide-react';
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
    // Calculate Global Completion
    const totalAssignments = assignments.length;
    const completedAssignments = submissions.filter(s => s.state === 'TURNED_IN' || s.state === 'RETURNED').length;
    const globalCompletion = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

    // Calculate Real Achievements
    const perfectScores = submissions.filter(s => s.assignedGrade === 100).length;
    const milestones = Math.floor(completedAssignments / 5); // 1 Achievement for every 5 assignments
    const activeStudent = completedAssignments > 0 ? 1 : 0; // 1 Achievement for starting
    const achievementsCount = activeStudent + milestones + perfectScores;

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
                <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
                    <div className="flex items-center gap-3 border-r border-orange-200 pr-6 mr-2">
                        <img src="/logos/kmutnb_logo.png" alt="Partner logo 1" className="h-12 w-auto hover:scale-105 transition-transform" />
                        <img src="/logos/fte_logo.png" alt="Partner logo 2" className="h-12 w-auto hover:scale-105 transition-transform" />
                        <img src="/logos/dce_logo.png" alt="Partner logo 3" className="h-14 w-auto drop-shadow-sm hover:scale-105 transition-transform" />
                    </div>
                    <div className="hidden lg:flex flex-col justify-center">
                        <h1 className="text-lg font-bold text-gray-800 leading-none">Classroom Companion</h1>
                        <h2 className="text-sm font-semibold text-orange-600">{t('brand.tagline')}</h2>
                        <p className="text-[10px] text-muted font-medium uppercase tracking-wide">{t('dashboard.studentWorkspace')}</p>
                    </div>
                    {/* Mobile/Tablet Compact View */}
                    <div className="lg:hidden flex flex-col">
                        <span className="text-lg font-bold text-gray-800">Companion</span>
                        <span className="text-xs text-orange-600 font-medium">{language === 'th' ? 'มุมมองนักศึกษา' : 'Student View'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-2 md:mt-0 w-full md:w-auto justify-end">
                    <LanguageToggle />
                    <button
                        onClick={onLogout}
                        className="text-sm font-medium text-muted hover:text-red-600 px-3 py-1.5 rounded hover:bg-red-50 transition-colors mr-2"
                    >
                        {t('dashboard.signOut')}
                    </button>

                    <img src={user.photoUrl} alt="Profile" className="w-8 h-8 rounded-full border border-border cursor-pointer hover:ring-2 hover:ring-gray-200" />
                </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6 xl:p-5 max-w-6xl 2xl:max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 xl:gap-4">

                    {/* Left Column: Stats & Courses */}
                    <div className="md:col-span-9 space-y-6">
                        {/* Metrics Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatCard
                                title={t('dashboard.completedAssignments')}
                                value={completedAssignments}
                                icon={Award}
                            />
                            <StatCard
                                title={t('dashboard.activeCourses')}
                                value={activeCourses.length}
                                icon={Folder}
                            />
                            <StatCard
                                title={t('dashboard.achievements')}
                                value={achievementsCount}
                                icon={Award}
                            />
                        </div>

                        {/* Active Courses Grid */}
                        <div>
                            <h2 className="text-lg font-medium text-text mb-4">{t('dashboard.activeCourses')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-4 mb-10">
                                {activeCourses.length === 0 ? (
                                    <div className="col-span-full h-32 flex items-center justify-center bg-white border border-border border-dashed rounded-lg text-muted">
                                        {language === 'th' ? 'ไม่พบรายวิชาที่เปิดใช้งาน' : 'No active courses found.'}
                                    </div>
                                ) : (
                                    activeCourses.map(course => (
                                        <div key={course.id} className="bg-white border border-border rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-shadow cursor-pointer flex flex-col h-[280px]">
                                            {/* Banner */}
                                            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 p-4 relative">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-white font-medium text-xl hover:underline truncate w-[90%] pointer-events-none">
                                                        <a href={course.alternateLink} target="_blank" rel="noopener noreferrer" className="pointer-events-auto hover:underline">
                                                            {course.name}
                                                        </a>
                                                    </h3>
                                                </div>
                                                <p className="text-white/90 text-sm mt-1">{course.section}</p>

                                                <div className="absolute -bottom-8 right-4 w-16 h-16 bg-white rounded-full p-1 shadow-sm">
                                                    <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold text-xl">
                                                        {course.name.charAt(0)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Body */}
                                            <div className="p-4 pt-10 flex-1 flex flex-col">
                                                <div className="flex-1">
                                                    <p className="text-xs text-muted font-medium uppercase mt-2">
                                                        {language === 'th' ? 'งานที่ต้องส่ง' : 'Assignments Due'}
                                                    </p>
                                                    <div className="mt-2 space-y-2">
                                                        {assignments.filter(a => a.courseId === course.id).slice(0, 2).map(a => (
                                                            <a key={a.id} href={a.alternateLink} target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-primary truncate flex items-center gap-2 block">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-muted"></span>
                                                                {a.title}
                                                            </a>
                                                        ))}
                                                        {assignments.filter(a => a.courseId === course.id).length === 0 && (
                                                            <span className="text-sm text-muted italic">{language === 'th' ? 'ยอดเยี่ยม! ไม่มีงานที่ต้องส่ง' : 'Woohoo, no work due!'}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="border-t border-border pt-3 flex justify-end gap-2">
                                                    <a href={course.alternateLink} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                                                        {language === 'th' ? 'เปิดใน Classroom' : 'Open in Classroom'}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Course Trend Analytics */}
                            {activeCourses.length > 0 && submissions.length > 0 && (
                                <div className="mb-10">
                                    <CourseTrendDashboard courses={courses} assignments={assignments} submissions={submissions} />
                                </div>
                            )}

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
                                                <div key={course.id} className="bg-gray-50 border border-border rounded-lg overflow-hidden flex flex-col h-[200px]">
                                                    {/* Banner */}
                                                    <div className="h-16 bg-gray-500 p-4 relative grayscale">
                                                        <h3 className="text-white font-medium text-lg truncate w-[90%] pointer-events-none">
                                                            {course.name}
                                                        </h3>

                                                        <div className="absolute -bottom-6 right-4 w-12 h-12 bg-white rounded-full p-1 shadow-sm">
                                                            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                                                                {course.name.charAt(0)}
                                                            </div>
                                                        </div>
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
                    <div className="md:col-span-3 space-y-6">

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
