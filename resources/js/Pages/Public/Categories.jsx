import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import {
    LayoutGrid,
    Search,
    ChevronDown,
    ChevronRight,
    Building2,
    Clock,
    FileText,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    ShieldAlert
} from 'lucide-react';

export default function Categories({ categories }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategory, setExpandedCategory] = useState(null);

    const filteredCategories = categories.filter((cat) => {
        const matchesName = (cat.name_bn + ' ' + cat.name_en).toLowerCase().includes(searchQuery.toLowerCase());
        const matchesIssues = cat.problem_types?.some(pt => pt.title_bn.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesName || matchesIssues;
    });

    const toggleExpand = (id) => {
        setExpandedCategory(expandedCategory === id ? null : id);
    };

    return (
        <PublicLayout>
            <Head title="অভিযোগের ক্যাটাগরি ও সেবাসমূহ — নাগরিক অভিযোগ পোর্টাল" />

            <div className="bg-slate-50 min-h-screen py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* Header Banner */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="max-w-3xl space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>১০০+ নাগরিক অভিযোগের ধরন ও সমন্বিত ক্যাটালগ</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                                অভিযোগের ধরন ও দায়িত্বপ্রাপ্ত দপ্তর নির্দেশিকা
                            </h1>
                            <p className="text-base text-slate-600 leading-relaxed">
                                প্রতিটি ক্যাটাগরির অধীনে নির্দিষ্ট সমস্যা, নির্ধারিত নিষ্পত্তির সময়সীমা (SLA) এবং সংশ্লিষ্ট কর্তৃপক্ষের তালিকা জানুন।
                            </p>

                            {/* Search bar */}
                            <div className="relative pt-2">
                                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="ক্যাটাগরি বা সুনির্দিষ্ট সমস্যা খুঁজুন (যেমন: ড্রেন, নামজারি, হাসপাতাল, বিদ্যুৎ)..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Categories Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCategories.map((cat) => {
                            const isExpanded = expandedCategory === cat.id;

                            return (
                                <div
                                    key={cat.id}
                                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                                >
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-700 font-bold text-lg">
                                                {cat.icon || '🏛️'}
                                            </div>
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                                {cat.complaints_count || 0} টি দাখিলকৃত
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{cat.name_bn}</h3>
                                            <p className="text-xs text-slate-500">{cat.name_en}</p>
                                        </div>

                                        <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                <span>স্ট্যান্ডার্ড সমাধান সময়: <strong>{cat.default_sla_days || 7} দিন</strong></span>
                                            </div>
                                            {cat.default_organization && (
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-slate-400" />
                                                    <span className="line-clamp-1">সংশ্লিষ্ট প্রতিষ্ঠান: {cat.default_organization.name_bn}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Expandable Problem Types */}
                                        {cat.problem_types && cat.problem_types.length > 0 && (
                                            <div className="pt-2">
                                                <button
                                                    onClick={() => toggleExpand(cat.id)}
                                                    className="w-full flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-700 py-1"
                                                >
                                                    <span>নির্দিষ্ট সমস্যার তালিকা ({cat.problem_types.length} টি)</span>
                                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                </button>

                                                {isExpanded && (
                                                    <div className="mt-2 space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100 max-h-48 overflow-y-auto">
                                                        {cat.problem_types.map((pt) => (
                                                            <div key={pt.id} className="text-xs text-slate-700 flex items-center gap-2 py-0.5">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                                <span>{pt.title_bn}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                        <Link
                                            href={route('complaint.submit')}
                                            className="text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1"
                                        >
                                            অভিযোগ ফরম <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                        <Link
                                            href={route('ai-assistant')}
                                            className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition flex items-center gap-1 shadow-sm"
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            AI দিয়ে জানান
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
