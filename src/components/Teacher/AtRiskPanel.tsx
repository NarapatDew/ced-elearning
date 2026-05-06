import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AlertTriangle, 
    ChevronDown, 
    ChevronUp, 
    FileText, 
    CheckCircle2,
    Clock,
    Zap,
    Copy,
    Check
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Student {
    id: string;
    name: string;
    avatarUrl: string;
    missingAssignmentsCount: number;
    completedAssignmentsCount?: number;
}

interface Assignment {
    id: string;
    title: string;
    dueDate?: string;
}

interface Submission {
    studentId: string;
    assignmentId: string;
    status: 'TURNED_IN' | 'MISSING' | 'LATE' | 'ASSIGNED';
}

interface AtRiskPanelProps {
    students: Student[];
    assignments: Assignment[];
    submissions: Submission[];
    courseName?: string;
}

const StudentAvatar: React.FC<{ url: string; name: string; className?: string }> = ({ url, name, className }) => {
    const [hasError, setHasError] = React.useState(false);
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Student')}&background=random&color=fff&size=128`;

    return (
        <img
            src={hasError || !url ? fallbackUrl : url}
            alt={name}
            className={className}
            onError={() => setHasError(true)}
        />
    );
};

const AtRiskPanel: React.FC<AtRiskPanelProps> = ({ students, assignments, submissions, courseName = 'Classroom' }) => {
    const { language, t } = useLanguage();
    const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Filter students who have 2 or more missing assignments
    const atRiskStudents = students.filter(s => s.missingAssignmentsCount >= 2)
        .sort((a, b) => b.missingAssignmentsCount - a.missingAssignmentsCount);

    const handleCopyMessage = (student: Student, missingWork: Assignment[]) => {
        const workList = missingWork.map(w => `"${w.title}"`).join(', ');
        const messageTemplate = t('teacher.template.missing');
        
        const message = messageTemplate
            .replace('{studentName}', student.name)
            .replace('{courseName}', courseName)
            .replace('{count}', student.missingAssignmentsCount.toString())
            .replace('{workList}', workList);

        navigator.clipboard.writeText(message);
        setCopiedId(student.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (atRiskStudents.length === 0) {
        return (
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 text-center shadow-sm relative overflow-hidden group h-full flex flex-col items-center justify-center">
                <div className="absolute -bottom-10 -right-10 text-emerald-500/5 group-hover:scale-110 transition-transform duration-1000">
                    <CheckCircle2 size={180} />
                </div>
                <div className="relative z-10 flex flex-col items-center px-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-emerald-50 text-emerald-500 mb-4 shadow-emerald-100 shadow-xl border border-emerald-100">
                        <CheckCircle2 size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 tracking-tight leading-tight">
                        {language === 'th' ? 'ไม่มีนักเรียนค้างงาน' : 'On Track'}
                    </h3>
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest leading-relaxed">
                        {language === 'th' 
                            ? 'ทุกคนส่งงานตามกำหนด' 
                            : 'All systems stable'}
                    </p>
                </div>
            </div>
        );
    }

    const toggleStudent = (id: string) => {
        setExpandedStudentId(expandedStudentId === id ? null : id);
    };

    return (
        <div className="space-y-4 flex flex-col h-full">
            <div className="px-2">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 tracking-tight">
                    <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg shadow-sm">
                        <AlertTriangle size={16} />
                    </div>
                    {language === 'th' ? 'ต้องติดตามเป็นพิเศษ' : 'Priority Attention'}
                    <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-rose-600 text-white rounded-full shadow-md shadow-rose-200 leading-none">
                        {atRiskStudents.length}
                    </span>
                </h2>
            </div>

            <div className="grid gap-3 flex-1">
                {atRiskStudents.map((student) => {
                    const isExpanded = expandedStudentId === student.id;
                    
                    const missingWorkIds = submissions
                        .filter(sub => sub.studentId === student.id && sub.status === 'MISSING')
                        .map(sub => sub.assignmentId);
                    
                    const missingAssignments = assignments.filter(a => missingWorkIds.includes(a.id));

                    return (
                        <div 
                            key={student.id}
                            className={`bg-white border transition-all duration-300 overflow-hidden group ${
                                isExpanded ? 'rounded-2xl border-rose-300 shadow-xl shadow-rose-500/5 ring-1 ring-rose-100' : 'rounded-3xl border-slate-100 shadow-sm hover:shadow-lg hover:border-rose-100'
                            }`}
                        >
                            <button
                                onClick={() => toggleStudent(student.id)}
                                className="w-full flex items-center justify-between p-4 text-left group/btn relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none group-hover:scale-125 transition-transform">
                                    <Zap size={50} className="text-rose-200" />
                                </div>

                                <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">
                                    <div className="relative shrink-0">
                                        <StudentAvatar 
                                            url={student.avatarUrl} 
                                            name={student.name} 
                                            className="w-10 h-10 rounded-xl border border-white shadow-sm object-cover group-hover:rotate-3 transition-transform" 
                                        />
                                        <div className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg">
                                            {student.missingAssignmentsCount}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 text-sm tracking-tight group-hover:text-rose-600 transition-colors truncate">
                                            {student.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-bold uppercase tracking-widest text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">
                                                {student.missingAssignmentsCount} {language === 'th' ? 'ชิ้น' : 'Left'}
                                            </span>
                                            <span className="text-xs font-bold text-slate-300 uppercase truncate">
                                                {student.completedAssignmentsCount || 0} {language === 'th' ? 'ส่งแล้ว' : 'Done'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={`relative z-10 p-1.5 rounded-lg transition-all ${isExpanded ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-300 group-hover/btn:bg-rose-50 group-hover/btn:text-rose-500'}`}>
                                    {isExpanded ? <ChevronUp size={14} className="stroke-[3]" /> : <ChevronDown size={14} className="stroke-[3]" />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                                    >
                                        <div className="px-4 pb-4 pt-0">
                                            <div className="h-px bg-slate-50 mb-4" />
                                            
                                            <div className="bg-rose-50/20 rounded-xl p-3 border border-rose-100/30">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h5 className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                                                        <FileText size={10} />
                                                        {language === 'th' ? 'รายการค้างส่ง' : 'To-do List'}
                                                    </h5>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCopyMessage(student, missingAssignments);
                                                        }}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                                            copiedId === student.id 
                                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' 
                                                                : 'bg-white text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white shadow-sm'
                                                        }`}
                                                    >
                                                        {copiedId === student.id ? <Check size={10} /> : <Copy size={10} />}
                                                        {copiedId === student.id ? t('teacher.copied') : t('teacher.copyMessage')}
                                                    </button>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    {missingAssignments.length > 0 ? (
                                                        missingAssignments.map((a) => (
                                                            <div key={a.id} className="flex flex-col gap-1 text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-50 shadow-sm">
                                                                <div className="font-bold text-slate-800 leading-tight line-clamp-2">{a.title}</div>
                                                                {a.dueDate && (
                                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                                                                        <Clock size={10} />
                                                                        {a.dueDate}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs font-bold text-slate-300 italic text-center py-2 uppercase">No details</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AtRiskPanel;
