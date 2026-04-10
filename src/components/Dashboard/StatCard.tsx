import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, className = '' }) => {
    return (
        <div className={`bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex items-center justify-between group ${className}`}>
            <div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">{title}</h3>
                <p className="text-3xl font-black text-gray-800 tracking-tight">{value}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-gray-50 text-gray-400 group-hover:scale-110 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
                <Icon size={24} strokeWidth={2} />
            </div>
        </div>
    );
};

export default StatCard;
