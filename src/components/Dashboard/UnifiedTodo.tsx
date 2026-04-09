import React, { useState, useMemo } from 'react';
import type { Course, Assignment, Submission } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Clock, AlertTriangle, CalendarDays, ExternalLink, Calendar } from 'lucide-react';

interface UnifiedTodoProps {
    courses: Course[];
    assignments: Assignment[];
    submissions: Submission[];
}

type FilterType = 'ALL' | 'TODAY' | '3DAYS' | '7DAYS';

const UnifiedTodo: React.FC<UnifiedTodoProps> = ({ courses, assignments, submissions }) => {
    const { t } = useLanguage();
    const [filter, setFilter] = useState<FilterType>('ALL');

    // Parse and process assignments to enrich with submission and course data
    const enhancedAssignments = useMemo(() => {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
        
        return assignments.map(assignment => {
            // Find related course
            const course = courses.find(c => c.id === assignment.courseId);
            // Find related submission
            const submission = submissions.find(s => s.courseWorkId === assignment.id);
            
            const isTurnedIn = submission?.state === 'TURNED_IN' || submission?.state === 'RETURNED';

            let dueDateObj: Date | null = null;
            let daysUntilDue: number | null = null;
            let isPastDue = false;

            if (assignment.dueDate) {
                // Google api dueDate has year, month, day. Wait, months are 1-12 in GC api? Yes.
                // It also has dueTime (hours, minutes)
                const hr = assignment.dueTime?.hours || 23;
                const min = assignment.dueTime?.minutes || 59;
                
                dueDateObj = new Date(Date.UTC(
                    assignment.dueDate.year, 
                    assignment.dueDate.month - 1, 
                    assignment.dueDate.day, 
                    hr, 
                    min
                ));
                
                const timeDiff = dueDateObj.getTime() - now.getTime();
                daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));
                isPastDue = timeDiff < 0;
            }

            return {
                ...assignment,
                courseName: course?.name || 'Unknown Course',
                isTurnedIn,
                dueDateObj,
                daysUntilDue,
                isPastDue,
                courseColor: course?.name.charCodeAt(0) % 5 || 0 // deterministic pseudo-random color class index
            };
        }).filter(a => !a.isTurnedIn); // Only show ones that are NOT turned in
    }, [assignments, courses, submissions]);

    // Apply filters
    const filteredAssignments = useMemo(() => {
        let filtered = enhancedAssignments;
        
        if (filter === 'TODAY') {
            filtered = enhancedAssignments.filter(a => a.daysUntilDue !== null && a.daysUntilDue <= 1 && a.daysUntilDue >= 0);
        } else if (filter === '3DAYS') {
            filtered = enhancedAssignments.filter(a => a.daysUntilDue !== null && a.daysUntilDue <= 3 && a.daysUntilDue >= 0);
        } else if (filter === '7DAYS') {
            filtered = enhancedAssignments.filter(a => a.daysUntilDue !== null && a.daysUntilDue <= 7 && a.daysUntilDue >= 0);
        }
        
        // Include past due by default in all views unless it gets too much? 
        // We'll bring past due items to the top if they are missing
        if (filter !== 'ALL') {
            const pastDueList = enhancedAssignments.filter(a => a.isPastDue);
            filtered = [...pastDueList, ...filtered];
            // Remove duplicates (if any logic flaw)
            filtered = Array.from(new Set(filtered));
        }

        // Sort: Past due first, then closest due date, then No due date
        return filtered.sort((a, b) => {
            if (a.isPastDue && !b.isPastDue) return -1;
            if (!a.isPastDue && b.isPastDue) return 1;
            if (a.dueDateObj && b.dueDateObj) return a.dueDateObj.getTime() - b.dueDateObj.getTime();
            if (a.dueDateObj) return -1;
            if (b.dueDateObj) return 1;
            return 0;
        });
    }, [enhancedAssignments, filter]);

    const getStatusBadge = (item: any) => {
        if (item.isPastDue) {
            return (
                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 font-bold text-xs px-2 py-0.5 rounded-full">
                    <AlertTriangle size={12} /> {t('todo.missing')}
                </span>
            );
        }
        if (item.daysUntilDue !== null) {
            if (item.daysUntilDue <= 1) {
                return (
                    <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 font-bold text-xs px-2 py-0.5 rounded-full">
                        <Clock size={12} /> {t('todo.urgent')}
                    </span>
                );
            } else if (item.daysUntilDue <= 3) {
                return (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 font-bold text-xs px-2 py-0.5 rounded-full">
                        <Calendar size={12} /> {t('todo.upcoming')}
                    </span>
                );
            }
        }
        return null;
    };

    const formatDueDate = (date: Date | null) => {
        if (!date) return '-';
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const colorClasses = [
        'bg-blue-100 text-blue-700',
        'bg-green-100 text-green-700',
        'bg-purple-100 text-purple-700',
        'bg-pink-100 text-pink-700',
        'bg-indigo-100 text-indigo-700',
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full max-h-[600px] overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                        <CalendarDays size={20} />
                    </div>
                    <h3 className="font-bold text-gray-800 tracking-tight">{t('todo.title')}</h3>
                </div>
                {/* Filters */}
                <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
                    {[
                        { key: 'ALL', label: t('todo.filterAll') },
                        { key: 'TODAY', label: t('todo.filterToday') },
                        { key: '3DAYS', label: t('todo.filter3Days') },
                        { key: '7DAYS', label: t('todo.filter7Days') },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key as FilterType)}
                            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${filter === f.key ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-2 flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
                {filteredAssignments.length > 0 ? (
                    <div className="space-y-2">
                        {filteredAssignments.map((a) => (
                            <a
                                key={a.id}
                                href={a.alternateLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block bg-white border border-gray-100 p-3 rounded-lg shadow-sm hover:shadow-md hover:border-orange-200 transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="min-w-0 pr-3">
                                        <h4 className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-primary transition-colors">
                                            {a.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colorClasses[a.courseColor]}`}>
                                                {a.courseName.length > 20 ? a.courseName.substring(0,20)+'...' : a.courseName}
                                            </span>
                                            {getStatusBadge(a)}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                        <span className={`text-xs font-semibold ${a.isPastDue ? 'text-red-500' : 'text-gray-500'}`}>
                                            {formatDueDate(a.dueDateObj)}
                                        </span>
                                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                            {t('todo.open')} <ExternalLink size={10} />
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
                        <div className="bg-gray-100 p-4 rounded-full mb-3">
                            <CalendarDays size={32} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-medium">{t('todo.noAssignments')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnifiedTodo;
