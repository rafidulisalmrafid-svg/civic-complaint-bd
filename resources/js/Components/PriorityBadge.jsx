import React from 'react';

const priorityConfig = {
    urgent: { label: 'জরুরি', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    high: { label: 'উচ্চ অগ্রাধিকার', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    medium: { label: 'সাধারণ', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    low: { label: 'নিম্ন', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

export default function PriorityBadge({ priority = 'medium', className = '' }) {
    const config = priorityConfig[priority] || priorityConfig.medium;

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}>
            {config.label}
        </span>
    );
}
