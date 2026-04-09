import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingDown, Activity } from 'lucide-react';
import type { Course, Assignment, Submission } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface CourseTrendDashboardProps {
    courses: Course[];
    assignments: Assignment[];
    submissions: Submission[];
}

const CourseTrendDashboard: React.FC<CourseTrendDashboardProps> = ({ courses, assignments, submissions }) => {
    const { language, t } = useLanguage();

    const chartData = useMemo(() => {
        // Group assignments by creation month/week or just take the last 5 assignments chronologically per course
        // For simplicity, we calculate the average score of valid (graded) submissions per course
        const dataMap: any = {};
        
        const gradedSubmissions = submissions.filter(s => s.assignedGrade !== undefined);
        
        courses.forEach(c => {
            const courseSubmissions = gradedSubmissions.filter(s => s.courseId === c.id);
            if (courseSubmissions.length > 0) {
                // Determine grade trend (last 3 vs overall)
                const sorted = courseSubmissions.map(s => {
                    const assignment = assignments.find(a => a.id === s.courseWorkId);
                    return { ...s, creationTime: assignment?.creationTime || '' };
                }).sort((a, b) => new Date(a.creationTime).getTime() - new Date(b.creationTime).getTime());

                let overallSum = 0;
                sorted.forEach(s => overallSum += (s.assignedGrade || 0));
                const overallAvg = overallSum / sorted.length;

                let recentSum = 0;
                const recentWindow = Math.min(3, sorted.length);
                const recentList = sorted.slice(-recentWindow);
                recentList.forEach(s => recentSum += (s.assignedGrade || 0));
                const recentAvg = recentSum / recentWindow;

                const isDropping = recentWindow >= 2 && recentAvg < overallAvg;

                dataMap[c.id] = {
                    name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
                    avgScore: Math.round(overallAvg),
                    recentScore: Math.round(recentAvg),
                    isDropping
                };
            }
        });

        return Object.values(dataMap);
    }, [courses, assignments, submissions]);

    const droppingCourses = chartData.filter((d: any) => d.isDropping);

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Activity size={20} />
                    </div>
                    <h3 className="font-bold text-gray-800 tracking-tight">{language === 'th' ? 'แนวโน้มคะแนนรายวิชา' : 'Course Performance Trends'}</h3>
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col xl:flex-row gap-6">
                <div className="h-64 flex-1">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Line type="monotone" name={language === 'th' ? 'คะแนนเฉลี่ยรวม' : 'Overall Avg'} dataKey="avgScore" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" name={language === 'th' ? 'คะแนนช่วงหลัง (3 งานล่าสุด)' : 'Recent Avg (Last 3)'} dataKey="recentScore" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                            {language === 'th' ? 'ยังไม่มีข้อมูลคะแนนที่มากพอ' : 'Not enough grading data available.'}
                        </div>
                    )}
                </div>

                {/* Right Side: Dropping courses warning */}
                <div className="w-full xl:w-64 bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1">
                        <TrendingDown size={14} className="text-red-500" />
                        {language === 'th' ? 'วิชาที่ควรระวัง' : 'Courses to Watch'}
                    </h4>
                    
                    {droppingCourses.length > 0 ? (
                        <div className="space-y-3">
                            {droppingCourses.map((c: any, i: number) => (
                                <div key={i} className="bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                                    <div className="font-semibold text-sm text-gray-800">{c.name}</div>
                                    <div className="text-xs text-red-600 mt-1 font-medium bg-red-50 inline-block px-1.5 py-0.5 rounded">
                                        {language === 'th' ? 'คะแนนตกลงจากค่าเฉลี่ย' : 'Dropping below average'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center">
                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-500 mb-2">
                                <Activity size={24} />
                            </span>
                            <p className="text-sm font-medium text-green-700">
                                {language === 'th' ? 'ยอดเยี่ยม! ไม่มีวิชาไหนที่คะแนนตกลง' : 'Great! No dropping courses.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseTrendDashboard;
