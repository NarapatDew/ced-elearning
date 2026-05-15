import React, { useEffect, useState } from 'react';
import DashboardLayout from './DashboardLayout';
import TeacherDashboard from '../Teacher/TeacherDashboard';
import type { UserProfile, Course, Assignment, Submission } from '../../types';
import { fetchCourses, fetchAllAssignments, fetchAllSubmissions } from '../../services/googleClassroom';
import { useLanguage } from '../../contexts/LanguageContext';
import { LayoutDashboard, GraduationCap } from 'lucide-react';

interface DashboardProps {
    user: UserProfile;
    accessToken: string;
    onLogout: () => void;
}

type UserRole = 'student' | 'teacher';

const Dashboard: React.FC<DashboardProps> = ({ user, accessToken, onLogout }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeRole, setActiveRole] = useState<UserRole>('student');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { language, t } = useLanguage();

    useEffect(() => {
        const fetchData = async () => {
            if (!accessToken) return;

            try {
                setLoading(true);
                setError(null);
                
                // Fetch all courses for student view
                const allCourses = await fetchCourses(accessToken);
                setCourses(allCourses);

                // Fetch courses where user is a teacher
                const taught = await fetchCourses(accessToken, 'me');
                setTeacherCourses(taught);

                // Auto-set role: if they have teacher courses, default to teacher, else student
                if (taught.length > 0) {
                    setActiveRole('teacher');
                } else {
                    setActiveRole('student');
                }

                if (allCourses.length > 0) {
                    const [fetchedAssignments, fetchedSubmissions] = await Promise.all([
                        fetchAllAssignments(accessToken, allCourses),
                        fetchAllSubmissions(accessToken, allCourses)
                    ]);
                    setAssignments(fetchedAssignments);
                    setSubmissions(fetchedSubmissions);
                }

            } catch (err: any) {
                console.error('Failed to fetch dashboard data', err);
                const apiMessage = err.response?.data?.error?.message || err.message;
                const apiStatus = err.response?.status;
                setError(`(${apiStatus}) ${apiMessage}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [accessToken]);

    const handleRefresh = async () => {
        if (!accessToken) return;
        setIsRefreshing(true);
        try {
            const allCourses = await fetchCourses(accessToken);
            setCourses(allCourses);
            const taught = await fetchCourses(accessToken, 'me');
            setTeacherCourses(taught);
            if (allCourses.length > 0) {
                const [fetchedAssignments, fetchedSubmissions] = await Promise.all([
                    fetchAllAssignments(accessToken, allCourses),
                    fetchAllSubmissions(accessToken, allCourses)
                ]);
                setAssignments(fetchedAssignments);
                setSubmissions(fetchedSubmissions);
            }
        } catch (err: any) {
            console.error('Failed to refresh dashboard data', err);
        } finally {
            setIsRefreshing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted font-sans font-medium text-sm">{t('dashboard.syncing')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-card border border-red-200 max-w-md w-full text-center">
                    <div className="text-red-500 font-bold mb-2">{t('dashboard.connectionError')}</div>
                    <p className="text-sm text-muted mb-4">{error}</p>
                    <button onClick={onLogout} className="text-primary hover:underline text-sm">{t('dashboard.returnToLogin')}</button>
                </div>
            </div>
        );
    }

    const hasBothRoles = courses.length > 0 && teacherCourses.length > 0;

    return (
        <div className='relative'>
            {/* Role Switcher Floating Button */}
            {hasBothRoles && (
                <div className="fixed bottom-6 right-6 z-[100]">
                    <button 
                        onClick={() => setActiveRole(activeRole === 'student' ? 'teacher' : 'student')}
                        className="flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all font-bold text-sm border border-white/10"
                    >
                        {activeRole === 'student' ? (
                            <>
                                <GraduationCap size={18} />
                                {language === 'th' ? 'สลับเป็นมุมมองครู' : 'Switch to Teacher View'}
                            </>
                        ) : (
                            <>
                                <LayoutDashboard size={18} />
                                {language === 'th' ? 'สลับเป็นมุมมองนักเรียน' : 'Switch to Student View'}
                            </>
                        )}
                    </button>
                </div>
            )}

            {activeRole === 'student' ? (
                courses.length === 0 ? (
                    <div className="bg-white border border-yellow-200 p-8 text-center mb-4 mx-6 mt-6 rounded shadow-sm">
                        <h3 className="text-lg font-medium text-text mb-2">{t('dashboard.noCourses')}</h3>
                        <p className="text-muted text-sm max-w-md mx-auto">
                            {language === 'th'
                                ? <>ไม่พบรายวิชาที่เปิดใช้งานสำหรับบัญชี <strong>{user.email}</strong></>
                                : <>We couldn't find any active courses for <strong>{user.email}</strong>.</>}
                        </p>
                        <button onClick={onLogout} className="mt-6 text-primary hover:underline text-sm">
                            {language === 'th' ? 'เข้าสู่ระบบด้วยบัญชีอื่น' : 'Sign in with a different account'}
                        </button>
                    </div>
                ) : (
                    <DashboardLayout user={user} courses={courses} assignments={assignments} submissions={submissions} onLogout={onLogout} onRefresh={handleRefresh} isRefreshing={isRefreshing} />
                )
            ) : (
                <TeacherDashboard user={user} accessToken={accessToken} onLogout={onLogout} />
            )}
        </div>
    );
};

export default Dashboard;
