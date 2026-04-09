import React, { useState } from 'react';
import { AlertTriangle, Search, Filter } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export interface AtRiskStudent {
    id: string;
    name: string;
    avatarUrl: string;
    overallGrade: number;
    missingAssignmentsCount: number;
    courseName?: string;
}

interface AtRiskPanelProps {
    students: AtRiskStudent[];
}

const AtRiskPanel: React.FC<AtRiskPanelProps> = ({ students }) => {
    const { language, t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'MISSING' | 'GRADE'>('ALL');

    // Filter to only at-risk logic
    const atRiskStudents = students.filter(s => s.overallGrade < 50 || s.missingAssignmentsCount >= 2);

    const filteredAndSearched = atRiskStudents.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'ALL' 
            ? true 
            : filterType === 'MISSING' 
                ? s.missingAssignmentsCount >= 2 
                : s.overallGrade < 50;
        return matchesSearch && matchesFilter;
    });

    const getReason = (s: AtRiskStudent) => {
        const reasons = [];
        if (s.missingAssignmentsCount >= 2) {
            reasons.push(language === 'th' ? `ค้างส่ง ${s.missingAssignmentsCount} งาน` : `Missing ${s.missingAssignmentsCount} work`);
        }
        if (s.overallGrade < 50) {
            reasons.push(language === 'th' ? `คะแนนเฉลี่ย ${s.overallGrade}%` : `Low avg ${s.overallGrade}%`);
        }
        return reasons.join(' และ ');
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-red-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-red-100 text-red-600 rounded-lg">
                        <AlertTriangle size={20} />
                    </div>
                    <h3 className="font-bold text-gray-800 tracking-tight">{language === 'th' ? 'นักเรียนกลุ่มเสี่ยง (At-Risk)' : 'At-Risk Students'}</h3>
                </div>
            </div>

            <div className="p-3 border-b border-gray-100 bg-gray-50 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder={language === 'th' ? 'ค้นหาชื่อนักเรียน...' : 'Search student name...'}
                        className="w-full text-sm pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="text-sm bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                >
                    <option value="ALL">{language === 'th' ? 'สาเหตุทั้งหมด' : 'All Reasons'}</option>
                    <option value="MISSING">{language === 'th' ? 'ค้างส่งงานเยอะ' : 'High Missing Work'}</option>
                    <option value="GRADE">{language === 'th' ? 'คะแนนต่ำ' : 'Low Grades'}</option>
                </select>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {filteredAndSearched.length > 0 ? (
                    <div className="space-y-2">
                        {filteredAndSearched.map(s => (
                            <div key={s.id} className="flex items-center gap-3 p-3 bg-white border border-red-100 rounded-lg shadow-sm">
                                <img src={s.avatarUrl} alt={s.name} className="w-10 h-10 rounded-full bg-gray-100 ring-2 ring-red-50" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-800 text-sm truncate">{s.name}</h4>
                                    <p className="text-xs text-red-600 font-medium mt-0.5 bg-red-50 inline-block px-1.5 py-0.5 rounded">
                                        {getReason(s)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                        <CheckCircleIcon />
                        <p className="mt-2 text-sm text-green-600 font-medium">
                            {language === 'th' ? 'ยอดเยี่ยม! ไม่มีนักเรียนกลุ่มเสี่ยง' : 'Great! No at-risk students found.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const CheckCircleIcon = () => (
    <svg className="w-12 h-12 text-green-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default AtRiskPanel;
