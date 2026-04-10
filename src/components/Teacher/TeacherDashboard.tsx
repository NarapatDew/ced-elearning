import React, { useState, useMemo, useEffect } from 'react';
import {
    Users,
    AlertTriangle,
    Copy,
    CheckCircle,
    MoreVertical,
    Clock,
    LogOut,
    ChevronDown,
    Check,
    Download
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RePieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import {
    fetchCourses,
    fetchCourseStudents,
    fetchCourseWork,
    fetchTeacherSubmissions
} from '../../services/googleClassroom';
import type { Course, UserProfile } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../common/LanguageToggle';
import AtRiskPanel from './AtRiskPanel';
import MessageTemplates from './MessageTemplates';

// --- Types ---
interface TeacherDashboardProps {
    onLogout: () => void;
    accessToken?: string;
    user?: UserProfile;
}

interface Assignment {
    id: string;
    title: string;
    dueDate: string;
    totalPoints: number;
    completionRate: number;
}

interface Student {
    id: string;
    name: string;
    avatarUrl: string;
    completedAssignmentsCount?: number;
    missingAssignmentsCount: number;
}

interface Submission {
    studentId: string;
    assignmentId: string;
    status: 'TURNED_IN' | 'MISSING' | 'LATE' | 'ASSIGNED';
    score?: number;
}

const StudentAvatar: React.FC<{ url: string; name: string; className?: string }> = ({ url, name, className }) => {
    const [imgSrc, setImgSrc] = useState(url);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImgSrc(url);
        setHasError(false);
    }, [url]);

    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Student')}&background=random&color=fff&size=128`;

    return (
        <img
            src={hasError || !imgSrc ? fallbackUrl : imgSrc}
            alt={name}
            className={className}
            onError={() => setHasError(true)}
        />
    );
};

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout, accessToken, user }) => {
    const { language, t } = useLanguage();
    // --- State ---
    const [loading, setLoading] = useState(false);
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isCourseMenuOpen, setIsCourseMenuOpen] = useState(false);

    // Data State
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
    const [copied, setCopied] = useState(false);

    // Initial Fetch (Real Data)
    useEffect(() => {
        const loadRealData = async () => {
            if (!accessToken) return;
            setLoading(true);
            try {
                // 1. Fetch Courses
                const realCourses = await fetchCourses(accessToken, 'me');
                setCourses(realCourses);

                if (realCourses.length > 0) {
                    const firstCourseId = realCourses[0].id;
                    setActiveCourseId(firstCourseId);

                    // 2. Fetch Data for First Course
                    await loadCourseData(accessToken, firstCourseId);
                } else {
                    // No courses found where user is teacher
                    setAssignments([]);
                    setStudents([]);
                    setSubmissions([]);
                }
            } catch (err) {
                console.error("Failed to load real data", err);
            } finally {
                setLoading(false);
            }
        };

        loadRealData();
    }, [accessToken]);

    // Load Data for Specific Course
    const loadCourseData = async (token: string, courseId: string) => {
        setLoading(true);
        try {
            const [apiStudents, apiWork, apiSubs] = await Promise.all([
                fetchCourseStudents(token, courseId),
                fetchCourseWork(token, courseId),
                fetchTeacherSubmissions(token, courseId)
            ]);

            // Transform Students
            const realStudents: Student[] = apiStudents.map((s: any) => ({
                id: s.userId,
                name: s.profile?.name?.fullName || 'Unknown Student',
                avatarUrl: s.profile?.photoUrl
                    ? (s.profile.photoUrl.startsWith('http') ? s.profile.photoUrl : `https:${s.profile.photoUrl}`)
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(s.profile?.name?.fullName || 'Student')}&background=random&color=fff&size=128`,
                overallGrade: 0,
                missingAssignmentsCount: 0
            }));

            // Transform Assignments
            const realAssignments: Assignment[] = apiWork.map((w: any) => ({
                id: w.id,
                title: w.title,
                dueDate: w.dueDate ? `${w.dueDate.year}-${w.dueDate.month}-${w.dueDate.day}` : 'No Due Date',
                totalPoints: w.maxPoints || 100,
                completionRate: 0
            }));

            // Transform Submissions
            const realSubmissions: Submission[] = apiSubs.map(s => {
                let status: Submission['status'] = 'ASSIGNED';
                if (s.state === 'TURNED_IN' || s.state === 'RETURNED') status = 'TURNED_IN';
                else if (s.state === 'CREATED' || s.state === 'RECLAIMED_BY_STUDENT') {
                    status = 'MISSING';
                }

                return {
                    studentId: s.userId,
                    assignmentId: s.courseWorkId,
                    status: status,
                    score: s.assignedGrade
                };
            });

            // --- Calculate Derived Stats for Real Data ---
            const totalStudentsCount = realStudents.length;

            realAssignments.forEach(a => {
                const aSubs = realSubmissions.filter(s => s.assignmentId === a.id);
                const turnedInCount = aSubs.filter(s => s.status === 'TURNED_IN').length;
                a.completionRate = totalStudentsCount > 0 ? Math.round((turnedInCount / totalStudentsCount) * 100) : 0;
            });

            realStudents.forEach(s => {
                const sSubs = realSubmissions.filter(sub => sub.studentId === s.id);
                s.missingAssignmentsCount = sSubs.filter(sub => sub.status === 'MISSING').length;
                s.completedAssignmentsCount = sSubs.filter(sub => sub.status === 'TURNED_IN').length;
            });

            setStudents(realStudents);
            setAssignments(realAssignments);
            setSubmissions(realSubmissions);

            if (realAssignments.length > 0) {
                setSelectedAssignmentId(realAssignments[0].id);
            } else {
                setSelectedAssignmentId('');
            }

        } catch (error) {
            console.error("Error loading course details", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Analytics Calculations ---
    const stats = useMemo(() => {
        const totalStudents = students.length;
        if (totalStudents === 0) return { totalStudents: 0, atRiskCount: 0 };

        const atRiskCount = students.filter(s => s.missingAssignmentsCount >= 2).length;
        return { totalStudents, atRiskCount };
    }, [students]);

    const selectedAssignment = assignments.find(a => a.id === selectedAssignmentId);
    const activeCourse = courses.find(c => c.id === activeCourseId);

    const assignmentSubmissionStats = useMemo(() => {
        const relevantSubmissions = submissions.filter(s => s.assignmentId === selectedAssignmentId);
        const late = relevantSubmissions.filter(s => s.status === 'LATE').length;
        const missing = relevantSubmissions.filter(s => s.status === 'MISSING').length;
        const turnedIn = relevantSubmissions.filter(s => s.status === 'TURNED_IN').length;

        return [
            { name: 'On Time', value: turnedIn, color: '#10b981' },
            { name: 'Late', value: late, color: '#f59e0b' },
            { name: 'Missing', value: missing, color: '#ef4444' }
        ];
    }, [selectedAssignmentId, submissions]);

    const missingStudents = useMemo(() => {
        const missingIds = submissions
            .filter(s => s.assignmentId === selectedAssignmentId && s.status === 'MISSING')
            .map(s => s.studentId);
        return students.filter(s => missingIds.includes(s.id));
    }, [selectedAssignmentId, submissions, students]);

    // --- Actions ---
    const handleCopyList = () => {
        if (!selectedAssignment) return;

        const names = missingStudents.map(s => s.name).join('\n• ');
        const message = `📢 *Follow-up: ${selectedAssignment.title}* needs attention!\n\n⚠️ The following students are missing this assignment:\n• ${names}\n\n🕒 Please submit by tonight to avoid late penalties.`;

        navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCourseChange = (courseId: string) => {
        setActiveCourseId(courseId);
        setIsCourseMenuOpen(false);
        if (accessToken) {
            loadCourseData(accessToken, courseId);
        }
    };

    const handleExportCSV = () => {
        if (!activeCourse) return;
        
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        
        const headers = ['Student Name', 'Missing Tasks', ...assignments.map(a => a.title.replace(/,/g, ' '))];
        csvContent += headers.join(",") + "\n";
        
        students.forEach(student => {
            const row = [
                `"${student.name}"`, 
                student.missingAssignmentsCount,
                ...assignments.map(a => {
                    const sub = submissions.find(s => s.studentId === student.id && s.assignmentId === a.id);
                    return sub ? `"${sub.status}"` : '"ASSIGNED"';
                })
            ];
            csvContent += row.join(",") + "\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ClassroomTracker_${activeCourse.name}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-gray-200 px-4 md:px-6 xl:px-4 py-3 sticky top-0 z-50 gap-y-4 shadow-sm">
                <div className="w-full max-w-6xl 2xl:max-w-7xl mx-auto flex flex-wrap md:flex-nowrap items-center justify-between gap-y-4">

                {/* Left: Modern Prominent Course Selector */}
                <div className="w-full md:w-1/3 flex justify-start order-2 md:order-1 relative z-50">
                    {accessToken && courses.length > 0 ? (
                        <div className="relative w-full max-w-[320px]">
                            <button
                                onClick={() => setIsCourseMenuOpen(!isCourseMenuOpen)}
                                className="w-full bg-white hover:bg-gray-50 border-2 border-green-500/20 hover:border-green-500 flex items-center justify-between px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200 group focus:outline-none focus:ring-4 focus:ring-green-500/10"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="bg-green-100 text-green-700 p-1.5 rounded-lg shrink-0">
                                        <Users size={18} className="group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="flex flex-col text-left overflow-hidden">
                                        <span className="text-sm font-bold text-gray-800 truncate">
                                            {activeCourse ? activeCourse.name : 'Select a Course'}
                                        </span>
                                        {activeCourse && (activeCourse.section || activeCourse.room) ? (
                                            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate mt-0.5">
                                                {activeCourse.section && `Sec ${activeCourse.section}`}
                                                {activeCourse.section && activeCourse.room && <span className="mx-1">•</span>}
                                                {activeCourse.room && `Room ${activeCourse.room}`}
                                            </span>
                                        ) : (
                                            <span className="text-[11px] font-medium text-gray-400 mt-0.5 animate-pulse">
                                                {loading ? 'Syncing...' : 'Click to change class'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="shrink-0 bg-gray-100 p-1 rounded-md text-gray-500 group-hover:bg-green-100 group-hover:text-green-700 transition-colors ml-2">
                                    <ChevronDown
                                        size={18}
                                        className={`transition-transform duration-300 ${isCourseMenuOpen ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </button>

                            {/* Dropdown Menu Overlay */}
                            {isCourseMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40 bg-gray-900/10 backdrop-blur-[1px] md:bg-transparent"
                                        onClick={() => setIsCourseMenuOpen(false)}
                                    />
                                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-4 py-2.5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">My Classes</h3>
                                            <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{courses.length}</span>
                                        </div>
                                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-1">
                                            {courses.map(c => {
                                                const isActive = activeCourseId === c.id;
                                                return (
                                                    <button
                                                        key={c.id}
                                                        onClick={() => handleCourseChange(c.id)}
                                                        className={`w-full text-left px-3 py-3 my-1 rounded-lg transition-all duration-200 flex items-center justify-between group ${isActive ? 'bg-green-50/80 ring-1 ring-green-500/20' : 'hover:bg-gray-50'}`}
                                                    >
                                                        <div className="flex items-start gap-3 min-w-0 pr-2">
                                                            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-300 group-hover:bg-gray-400'}`} />
                                                            <div className="flex-1 min-w-0">
                                                                <div className={`font-semibold text-sm truncate leading-tight ${isActive ? 'text-green-800' : 'text-gray-700'}`}>
                                                                    {c.name}
                                                                </div>
                                                                {(c.section || c.room) && (
                                                                    <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
                                                                        {c.section && <span className="bg-gray-100 px-1.5 py-0.5 rounded">Sec {c.section}</span>}
                                                                        {c.room && <span className="bg-gray-100 px-1.5 py-0.5 rounded">Rm {c.room}</span>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {isActive && (
                                                            <div className="shrink-0 bg-green-100 text-green-600 p-1 rounded-full">
                                                                <Check size={14} strokeWidth={3} />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-400 animate-pulse bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                            {language === 'th' ? 'กำลังโหลดรายวิชา...' : 'Loading your classes...'}
                        </div>
                    )}
                </div>

                {/* Center: Branding (Now serves as a subtle header logo) */}
                <div className="flex items-center justify-center gap-3 w-full md:w-1/3 order-1 md:order-2 mb-2 md:mb-0">
                    <img src="/logos/dce_logo.png" alt="Classroom Companion" className="h-8 md:h-10 w-auto opacity-90 hover:opacity-100 transition-opacity" />
                    <div className="hidden lg:block min-w-0 overflow-hidden text-center">
                        <h1 className="text-sm font-bold text-gray-800 truncate leading-tight">
                            {t('brand.name')}
                        </h1>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{t('dashboard.instructorWorkspace')}</p>
                    </div>
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center justify-end w-full md:w-1/3 order-3 md:order-3 gap-3">
                    <LanguageToggle />
                    {loading && <span className="hidden md:inline text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md animate-pulse">{language === 'th' ? 'กำลังซิงก์...' : 'Syncing...'}</span>}
                    <div className="h-8 w-px bg-gray-200 hidden md:block mx-1"></div>
                    <button
                        onClick={onLogout}
                        className="flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                        title={t('dashboard.signOut')}
                    >
                        <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        <span className="hidden xl:inline text-sm font-semibold ml-2">{t('dashboard.signOut')}</span>
                    </button>
                    {user?.photoUrl ? (
                        <img src={user.photoUrl} alt="Profile" className="h-9 w-9 rounded-full border-2 border-gray-100 shadow-sm object-cover" />
                    ) : (
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-white font-bold shadow-sm">
                            {user?.name?.charAt(0) || 'T'}
                        </div>
                    )}
                </div>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-6 xl:p-5 max-w-6xl 2xl:max-w-7xl mx-auto w-full space-y-8">

                {/* 1. Overview Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-4">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{language === 'th' ? 'นักเรียนทั้งหมด' : 'Total Students'}</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <h3 className="text-3xl font-bold">{stats.totalStudents}</h3>
                                <span className="text-xs text-green-600 font-medium px-2 py-0.5 bg-green-50 rounded-full">{language === 'th' ? 'กำลังใช้งาน' : 'Active'}</span>
                            </div>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Users size={24} />
                        </div>
                    </div>



                    <div className={`p-6 rounded-xl border shadow-sm flex items-center justify-between ${stats.atRiskCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                        <div>
                            <p className={`text-sm font-medium uppercase tracking-wide ${stats.atRiskCount > 0 ? 'text-red-600' : 'text-gray-500'}`}>{language === 'th' ? 'ต้องติดตาม' : 'Attention Needed'}</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <h3 className={`text-3xl font-bold ${stats.atRiskCount > 0 ? 'text-red-700' : 'text-gray-800'}`}>{stats.atRiskCount}</h3>
                                <span className="text-xs text-red-600/80 font-medium">{language === 'th' ? 'นักเรียนที่เสี่ยง' : 'Students At-Risk'}</span>
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg ${stats.atRiskCount > 0 ? 'bg-red-200 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                </div>

                {/* 2. Rapid Follow-up & Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-4">

                    {/* Left: Follow-up Generator & Pie Chart (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Follow-Up Tool */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                                <Clock className="text-gray-400" size={18} />
                                <h3 className="font-semibold text-gray-700">{language === 'th' ? 'ติดตามงานด่วน' : 'Rapid Follow-up'}</h3>
                            </div>
                            <div className="p-6">
                                <label className="block text-sm font-medium text-gray-600 mb-2">{language === 'th' ? 'เลือกงานที่ต้องการติดตาม' : 'Select Assignment to Chase'}</label>
                                <div className="relative mb-6">
                                    <select
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none appearance-none cursor-pointer"
                                        value={selectedAssignmentId}
                                        onChange={(e) => setSelectedAssignmentId(e.target.value)}
                                    >
                                        {assignments.length > 0 ? assignments.map(a => (
                                            <option key={a.id} value={a.id}>{a.title}</option>
                                        )) : <option>{language === 'th' ? 'ไม่พบงาน' : 'No Assignments Found'}</option>}
                                    </select>
                                    <div className="absolute right-3 top-3 pointer-events-none text-gray-500">
                                        <MoreVertical size={16} />
                                    </div>
                                </div>

                                <div className="bg-orange-50 rounded-lg p-4 mb-6 border border-orange-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-orange-800 uppercase">
                                            {language === 'th' ? `ค้างส่ง: ${missingStudents.length} คน` : `Missing: ${missingStudents.length} Students`}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {missingStudents.length > 0 ? (
                                            missingStudents.map(s => (
                                                <span key={s.id} className="text-xs bg-white border border-orange-200 text-orange-700 px-2 py-1 rounded-md shadow-sm">
                                                    {s.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle size={14} />{language === 'th' ? 'ส่งครบทุกคนแล้ว' : 'Everyone turned in!'}</span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleCopyList}
                                    disabled={missingStudents.length === 0}
                                    className={`w-full py-3 px-4 rounded-lg font-bold shadow-md transition-all flex items-center justify-center gap-2 ${missingStudents.length === 0
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg active:scale-[0.98]'
                                        }`}
                                >
                                    {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                                    {copied
                                        ? (language === 'th' ? 'คัดลอกแล้ว' : 'Copied to Clipboard!')
                                        : (language === 'th' ? 'คัดลอกรายชื่อเพื่อส่งต่อ' : 'Copy List for Line Group')}
                                </button>
                            </div>
                        </div>

                        {/* Submission Status Pie Chart */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col items-center">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 w-full text-left">{language === 'th' ? 'สถานะการส่งงาน' : 'Submission Status'}</h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={assignmentSubmissionStats}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {assignmentSubmissionStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Right: Charts & Roster (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Performance Chart */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-gray-700">{language === 'th' ? 'ภาพรวมการส่งงานแต่ละชิ้น' : 'Assignment Completion Rates'}</h3>
                                <div className="text-xs text-gray-500">{language === 'th' ? 'อัตราส่งงาน' : '% Turned In'}</div>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={assignments}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="title"
                                            tick={{ fontSize: 10 }}
                                            tickFormatter={(val) => val.length > 15 ? `${val.substring(0, 15)}...` : val}
                                        />
                                        <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            formatter={(value) => [`${value}%`, language === 'th' ? 'ส่งแล้ว' : 'Turned In']}
                                        />
                                        <Bar dataKey="completionRate" radius={[6, 6, 0, 0]} maxBarSize={48}>
                                            {assignments.map((entry) => {
                                                // Cohesive color mapping based on completion rate
                                                let barColor = '#10b981'; // Emerald 500 for good (>= 75)
                                                if (entry.completionRate < 50) barColor = '#fb7185'; // Soft Rose 400 for Needs Attention
                                                else if (entry.completionRate < 75) barColor = '#fcd34d'; // Soft Amber 300 for Average

                                                return <Cell key={`cell-${entry.id}`} fill={barColor} className="transition-all duration-300 hover:opacity-80" />;
                                            })}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Student Roster Table */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-gray-700">{language === 'th' ? 'รายชื่อนักเรียนและการส่งงาน' : 'Student Roster & Tracking'}</h3>
                                    <div className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{students.length} {language === 'th' ? 'คน' : 'Students'}</div>
                                </div>
                                <button
                                    onClick={handleExportCSV}
                                    className="text-xs flex items-center justify-center gap-1.5 font-bold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:shadow-sm px-3 py-1.5 rounded-md transition-all active:scale-95"
                                >
                                    <Download size={14} /> {language === 'th' ? 'ส่งออกบัญชีรายชื่อ (CSV)' : 'Export Roster (CSV)'}
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3">{language === 'th' ? 'ชื่อนักเรียน' : 'Student Name'}</th>
                                            <th className="px-6 py-3 min-w-[150px]">{language === 'th' ? 'ความคืบหน้าการส่งงาน' : 'Completion Progress'}</th>
                                            <th className="px-6 py-3 text-center">{language === 'th' ? 'งานค้างส่ง' : 'Missing Work'}</th>
                                            <th className="px-6 py-3 text-center">{language === 'th' ? 'สถานะ' : 'Status'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {students.length > 0 ? (
                                            students.map((student) => {
                                                const isAtRisk = student.missingAssignmentsCount >= 3;
                                                const completionPercentage = assignments.length > 0 ? Math.round(((student.completedAssignmentsCount || 0) / assignments.length) * 100) : 0;
                                                return (
                                                    <tr key={student.id} className={`hover:bg-gray-50 transition-colors ${isAtRisk ? 'bg-red-50/30' : ''}`}>
                                                        <td className="px-6 py-4 flex items-center gap-3">
                                                            <StudentAvatar url={student.avatarUrl} name={student.name} className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                                                            <span className="font-medium text-gray-700 truncate min-w-0 max-w-[120px]">{student.name}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-full max-w-[100px] h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-500 ${completionPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                                        style={{ width: `${completionPercentage}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs font-semibold whitespace-nowrap text-gray-600 block w-8">
                                                                    {student.completedAssignmentsCount}/{assignments.length}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            {student.missingAssignmentsCount > 0 ? (
                                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 font-bold text-xs">
                                                                    {student.missingAssignmentsCount}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            {isAtRisk ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                                    <AlertTriangle size={12} /> {language === 'th' ? 'ต้องติดตาม' : 'At Risk'}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                    <AlertTriangle size={12} className="hidden" /> {language === 'th' ? 'ปกติ' : 'On Track'}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                    {language === 'th' ? 'ไม่พบนักเรียนในรายวิชานี้' : 'No students found in this course.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 3. At-Risk Panel & Message Templates Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-4 mt-8 min-h-[500px]">
                    <div className="lg:col-span-8 h-full">
                        <AtRiskPanel students={students} />
                    </div>
                    <div className="lg:col-span-4 h-full">
                        <MessageTemplates />
                    </div>
                </div>

            </main>
        </div>
    );
};

export default TeacherDashboard;
