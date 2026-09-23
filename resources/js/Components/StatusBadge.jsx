import React from 'react';

const statusConfig = {
    submitted: { label: 'অভিযোগ জমা হয়েছে', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    received: { label: 'গৃহীত হয়েছে', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
    under_review: { label: 'পর্যালোচনাধীন', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    assigned: { label: 'কর্মকর্তা নিযুক্ত', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
    forwarded: { label: 'দপ্তরে ফরওয়ার্ডকৃত', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
    investigation_started: { label: 'তদন্ত চলমান', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
    action_taken: { label: 'ব্যবস্থা নেওয়া হয়েছে', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
    resolution_submitted: { label: 'সমাধান প্রস্তাবিত', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    resolved: { label: 'সমাধান সম্পন্ন', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', dot: 'bg-emerald-600' },
    closed: { label: 'বন্ধ', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' },
    reopened: { label: 'পুনরায় খোলা হয়েছে', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
    escalated: { label: 'ঊর্ধ্বতন পর্যায়ে প্রেরিত', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
    overdue: { label: 'সময়সীমা অতিক্রান্ত', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', dot: 'bg-red-600' },
    rejected: { label: 'বাতিলকৃত', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' },
};

export default function StatusBadge({ status, className = '' }) {
    const config = statusConfig[status] || {
        label: status || 'অনির্ধারিত',
        bg: 'bg-slate-50',
        text: 'text-slate-600',
        border: 'border-slate-200',
        dot: 'bg-slate-400'
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
            {config.label}
        </span>
    );
}
