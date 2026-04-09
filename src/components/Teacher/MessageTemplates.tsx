import React, { useState } from 'react';
import { Copy, MessageSquare, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const templates = [
    {
        id: 'missing',
        label: { th: 'เตือนค้างส่งงาน', en: 'Missing Work Warning' },
        getContent: (lang: string) => lang === 'th' 
            ? "สวัสดีครับ/ค่ะ นิสิต\n\nจากการตรวจสอบพบว่า นิสิตยังมีงานที่ค้างส่งอยู่ รบกวนรีบดำเนินการส่งภายในสัปดาห์นี้เพื่อไม่ให้กระทบคะแนนสะสมนะครับ/คะ\n\nหากมีข้อสงสัยหรือติดปัญหาอะไร สามารถสอบถามได้เลยครับ"
            : "Hello,\n\nI noticed you have some missing assignments. Please submit them by this week to avoid any impact on your grade.\n\nLet me know if you need any help!"
    },
    {
        id: 'upcoming',
        label: { th: 'เตือนใกล้กำหนดส่ง', en: 'Upcoming Deadline' },
        getContent: (lang: string) => lang === 'th'
            ? "สวัสดีครับ/ค่ะ นิสิต\n\nขออนุญาตแจ้งเตือนงานที่กำลังจะถึงกำหนดส่งในเร็วๆ นี้นะครับ อย่าลืมเผื่อเวลาในการทำและส่งก่อนระบบปิดรับนะครับ\n\nสู้ๆ ครับ/ค่ะ"
            : "Hello,\n\nA quick reminder about the upcoming deadline. Don't forget to submit your work before it closes.\n\nKeep it up!"
    },
    {
        id: 'lowgrade',
        label: { th: 'เรียกพบ/คุยเรื่องคะแนน', en: 'Consultation Request' },
        getContent: (lang: string) => lang === 'th'
            ? "สวัสดีครับ/ค่ะ นิสิต\n\nอาจารย์อยากนัดพูดคุยเกี่ยวกับคะแนนและพัฒนาการเรียนในช่วงที่ผ่านมา รบกวนนิสิตแจ้งวันและเวลาที่สะดวกเข้ามาหาอาจารย์หน่อยนะครับ/คะ"
            : "Hello,\n\nI would like to discuss your recent grades and overall progress. Please let me know when you are available for a quick chat."
    }
];

const MessageTemplates: React.FC = () => {
    const { language, t } = useLanguage();
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (id: string, content: string) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-full">
            <div className="p-4 border-b border-gray-100 bg-blue-50/50 flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                    <MessageSquare size={20} />
                </div>
                <h3 className="font-bold text-gray-800 tracking-tight">{language === 'th' ? 'เทมเพลตข้อความทวงงาน' : 'Follow-up Templates'}</h3>
            </div>
            
            <div className="p-4 space-y-3">
                {templates.map(tmpl => (
                    <div key={tmpl.id} className="border border-gray-100 rounded-lg p-3 hover:border-blue-200 transition-colors bg-gray-50/50">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-sm text-gray-700">{tmpl.label[language]}</span>
                            <button 
                                onClick={() => handleCopy(tmpl.id, tmpl.getContent(language))}
                                className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded transition-colors ${copiedId === tmpl.id ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                            >
                                {copiedId === tmpl.id ? <CheckCircle size={12} /> : <Copy size={12} />}
                                {copiedId === tmpl.id ? (language === 'th' ? 'คัดลอกแล้ว' : 'Copied') : (language === 'th' ? 'คัดลอก' : 'Copy')}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 whitespace-pre-wrap line-clamp-3">
                            {tmpl.getContent(language)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MessageTemplates;
