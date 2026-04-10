import React, { useMemo } from 'react';
import { AlertCircle, Clock, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import type { Assignment, Submission } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface SmartCompanionProps {
    assignments: Assignment[];
    submissions: Submission[];
}

const SmartCompanion: React.FC<SmartCompanionProps> = ({ assignments, submissions }) => {
    const { language } = useLanguage();

    const advice = useMemo(() => {
        const now = new Date();
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        let missingTasks: any[] = [];
        let upcomingTasks: any[] = [];

        assignments.forEach(a => {
            const sub = submissions.find(s => s.courseWorkId === a.id);
            const isTurnedIn = sub?.state === 'TURNED_IN' || sub?.state === 'RETURNED';
            
            if (isTurnedIn) return;

            let dueDateObj: Date | null = null;
            if (a.dueDate) {
                const hr = a.dueTime?.hours || 23;
                const min = a.dueTime?.minutes || 59;
                
                // Construct Date in local timezone assuming Google Classroom dueDate is local conceptually
                // BUT if it's strict UTC we should do Date.UTC. Let's do Date.UTC like UnifiedTodo.
                dueDateObj = new Date(Date.UTC(a.dueDate.year, a.dueDate.month - 1, a.dueDate.day, hr, min));
                
                if (dueDateObj.getTime() < now.getTime()) {
                    missingTasks.push({ ...a, dueDateObj });
                } else {
                    const dueMidnight = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate()).getTime();
                    const daysUntilDue = Math.round((dueMidnight - todayMidnight) / (1000 * 3600 * 24));
                    if (daysUntilDue <= 3) {
                        upcomingTasks.push({ ...a, dueDateObj, daysUntilDue });
                    }
                }
            }
        });

        // 1. Missing Tasks (Critical)
        if (missingTasks.length > 0) {
            missingTasks.sort((a, b) => a.dueDateObj.getTime() - b.dueDateObj.getTime());
            return {
                type: 'critical',
                title: language === 'th' ? 'มีงานค้างต้องรีบเคลียร์!' : 'Action Required: Missing Work!',
                message: language === 'th' 
                    ? `หยิบ "${missingTasks[0].title}" ขึ้นมาทำก่อนเลย งานนี้เลยกำหนดมาแล้ว!`
                    : `Focus on "${missingTasks[0].title}" first. It's past due!`,
                actionLink: missingTasks[0].alternateLink,
                icon: AlertCircle,
                colors: 'bg-red-50 border-red-200 text-red-800',
                iconColors: 'text-red-500 bg-red-100',
                btnColors: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20'
            };
        }

        // 2. Upcoming Tasks (Urgent)
        if (upcomingTasks.length > 0) {
            upcomingTasks.sort((a, b) => a.dueDateObj.getTime() - b.dueDateObj.getTime());
            const target = upcomingTasks[0];
            return {
                type: 'urgent',
                title: language === 'th' ? 'เตรียมตัวสำหรับงานถัดไป' : 'Upcoming Deadline',
                message: language === 'th'
                    ? `อย่าลืมเคลียร์ "${target.title}" ที่กำลังจะมาถึงในอีก ${target.daysUntilDue === 0 ? 'วันนี้' : target.daysUntilDue + ' วัน'}`
                    : `Keep an eye on "${target.title}" due in ${target.daysUntilDue === 0 ? 'today' : target.daysUntilDue + ' days'}.`,
                actionLink: target.alternateLink,
                icon: Clock,
                colors: 'bg-orange-50 border-orange-200 text-orange-900',
                iconColors: 'text-orange-500 bg-orange-100',
                btnColors: 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
            };
        }

        // 3. Clear (Chill)
        return {
            type: 'clear',
            title: language === 'th' ? 'ยอดเยี่ยมมาก พักผ่อนได้!' : 'Awesome work! You are clear.',
            message: language === 'th'
                ? 'คุณจัดการตามงานได้ครบถ้วน ไม่มีงานค้างและไม่มีงานด่วนในช่วง 3 วันนี้'
                : 'You have caught up with all your tasks. No urgent deadlines approaching.',
            actionLink: null,
            icon: Sparkles,
            colors: 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-900',
            iconColors: 'text-emerald-500 bg-emerald-100',
            btnColors: ''
        };

    }, [assignments, submissions, language]);

    const Icon = advice.icon;

    return (
        <div className={`w-full rounded-xl border shadow-sm p-4 relative overflow-hidden transition-all duration-300 ${advice.colors}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-row items-center gap-4 z-10 w-full sm:w-auto">
                    <div className={`p-3 rounded-full shrink-0 ${advice.iconColors}`}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm sm:text-base tracking-tight mb-0.5">{advice.title}</h3>
                        <p className="text-xs sm:text-sm opacity-90 leading-snug max-w-xl">{advice.message}</p>
                    </div>
                </div>
                
                {advice.actionLink && (
                    <a 
                        href={advice.actionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg hover:-translate-y-0.5 active:scale-95 z-10 ${advice.btnColors}`}
                    >
                        {language === 'th' ? 'ทำเดี๋ยวนี้เลย' : 'Do It Now'}
                        <ExternalLink size={16} />
                    </a>
                )}
            </div>
            
            {/* Background design artifact */}
            <div className="absolute -right-8 -top-8 text-black/5 opacity-10 pointer-events-none transform -rotate-12 scale-[3]">
                <Icon size={120} />
            </div>
        </div>
    );
};

export default SmartCompanion;
