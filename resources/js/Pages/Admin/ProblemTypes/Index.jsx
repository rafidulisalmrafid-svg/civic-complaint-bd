import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    FileText, 
    Plus, 
    Search, 
    CheckCircle2, 
    Trash2, 
    Edit3,
    AlertTriangle,
    Tag,
    Layers
} from 'lucide-react';

export default function ProblemTypesIndex({ problemTypes = [], categories = [], selectedCategoryId }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const form = useForm({
        complaint_category_id: categories[0]?.id || '',
        issue_group: 'doctor',
        name_bn: '',
        name_en: '',
        severity_level: 'medium',
        display_order: 1,
        is_active: true,
    });

    const openCreateModal = () => {
        setEditingItem(null);
        form.reset();
        if (selectedCategoryId) {
            form.setData('complaint_category_id', selectedCategoryId);
        }
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        form.setData({
            complaint_category_id: item.complaint_category_id,
            issue_group: item.issue_group,
            name_bn: item.name_bn,
            name_en: item.name_en,
            severity_level: item.severity_level,
            display_order: item.display_order,
            is_active: !!item.is_active,
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            form.put(`/admin/problem-types/${editingItem.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    form.reset();
                }
            });
        } else {
            form.post('/admin/problem-types', {
                onSuccess: () => {
                    setShowModal(false);
                    form.reset();
                }
            });
        }
    };

    const handleDelete = (item) => {
        if (confirm(`আপনি কি "${item.name_bn}" সমস্যা ধরনটি মুছে ফেলতে নিশ্চিত?`)) {
            router.delete(`/admin/problem-types/${item.id}`);
        }
    };

    const filteredItems = problemTypes.filter((item) => {
        const matchesSearch = 
            item.name_bn.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.issue_group.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getSeverityBadge = (level) => {
        switch (level) {
            case 'critical':
                return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">জরুরি / ক্রিটিক্যাল</span>;
            case 'high':
                return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">উচ্চ অগ্রাধিকার</span>;
            case 'medium':
                return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">মধ্যম</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">সাধারণ</span>;
        }
    };

    const getIssueGroupLabel = (group) => {
        const map = {
            doctor: 'চিকিৎসক / কনসালটেন্ট',
            staff: 'নার্স ও কর্মকর্তা-কর্মচারী',
            medicine: 'ওষুধ ও টেস্ট/ল্যাব',
            bribery: 'ঘুষ ও অর্থদাবি',
            delay: 'দেরি ও অনুপস্থিতি',
            mutation: 'নামজারি / মিউটেশন',
            khatian: 'খতিয়ান ও রেকর্ড',
            case: 'মামলা / জিডি / এফআইআর',
            behavior: 'অসদাচরণ ও দুর্ব্যবহার',
            harassment: 'হয়রানি ও ক্ষমতার অপব্যবহার',
            teaching: 'পাঠদান ও শিক্ষক',
            cleaning: 'পরিচ্ছন্নতা ও বর্জ্য',
            tax: 'হোল্ডিং ট্যাক্স ও ট্রেড লাইসেন্স',
            road: 'রাস্তা ও ড্রেনেজ',
            general: 'সাধারণ বিষয়',
        };
        return map[group] || group;
    };

    return (
        <AdminLayout
            title="নির্দিষ্ট অভিযোগ সমস্যা ক্যাটালগ"
            subtitle="নাগরিকদের সহজে ক্লিকযোগ্য সমস্যা ও কারণসমূহের মাস্টার ডিরেক্টরি"
        >
            <Head title="সমস্যা ক্যাটালগ — অ্যাডমিন প্যানেল" />

            <div className="space-y-6">
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    {/* Search & Category Filter */}
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                        <div className="relative min-w-[220px]">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                placeholder="নির্দিষ্ট সমস্যা খুঁজুন..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>

                        {/* Category Selector */}
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                            <button
                                type="button"
                                onClick={() => router.get('/admin/problem-types')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                                    !selectedCategoryId
                                        ? 'bg-emerald-700 text-white font-semibold'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                            >
                                সকল ক্যাটাগরি
                            </button>
                            {categories.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => router.get('/admin/problem-types', { category_id: c.id })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                                        selectedCategoryId === c.id
                                            ? 'bg-emerald-700 text-white font-semibold'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    }`}
                                >
                                    {c.name_bn}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>নতুন সমস্যা ধরন যোগ করুন</span>
                    </button>
                </div>

                {/* Problem Types Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3">নির্দিষ্ট সমস্যা বিবরণ (বাংলা)</th>
                                    <th className="px-5 py-3">সেবা খাত / ক্যাটাগরি</th>
                                    <th className="px-5 py-3">গ্রুপ / ধরন</th>
                                    <th className="px-5 py-3">তীব্রতা / প্রায়োরিটি</th>
                                    <th className="px-5 py-3">ক্রম</th>
                                    <th className="px-5 py-3">স্ট্যাটাস</th>
                                    <th className="px-5 py-3 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-3 font-semibold text-slate-900 max-w-sm">
                                                <div className="flex items-start gap-2">
                                                    <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="leading-snug">{item.name_bn}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.name_en}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 font-medium text-slate-700">
                                                {item.category?.name_bn || '—'}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                                                    {getIssueGroupLabel(item.issue_group)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">{getSeverityBadge(item.severity_level)}</td>
                                            <td className="px-5 py-3 font-mono text-slate-500">{item.display_order}</td>
                                            <td className="px-5 py-3">
                                                {item.is_active ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                                                        <CheckCircle2 className="w-3 h-3" /> সক্রিয়
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-medium">
                                                        নিষ্ক্রিয়
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                                                        title="সম্পাদনা করুন"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                                                        title="মুছে ফেলুন"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
                                            কোনো নির্দিষ্ট সমস্যা পাওয়া যায়নি।
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900">
                                {editingItem ? 'সমস্যার বিবরণ সম্পাদনা' : 'নতুন সমস্যা ধরন যুক্ত করুন'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        মূল ক্যাটাগরি / সেবা খাত <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={form.data.complaint_category_id}
                                        onChange={(e) => form.setData('complaint_category_id', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        required
                                    >
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name_bn}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        সমস্যার গ্রুপ (Group Key) <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={form.data.issue_group}
                                        onChange={(e) => form.setData('issue_group', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        required
                                    >
                                        <option value="doctor">চিকিৎসক / কনসালটেন্ট</option>
                                        <option value="staff">নার্স ও কর্মচারী</option>
                                        <option value="medicine">ওষুধ ও পরীক্ষা</option>
                                        <option value="bribery">ঘুষ ও অতিরিক্ত অর্থ</option>
                                        <option value="delay">দেরি ও দীর্ঘসূত্রতা</option>
                                        <option value="mutation">নামজারি / মিউটেশন</option>
                                        <option value="khatian">খতিয়ান ও রেকর্ড</option>
                                        <option value="case">মামলা / জিডি</option>
                                        <option value="behavior">দুর্ব্যবহার ও অসহযোগিতা</option>
                                        <option value="teaching">শিক্ষা ও পাঠদান</option>
                                        <option value="cleaning">পরিচ্ছন্নতা ও বর্জ্য</option>
                                        <option value="road">রাস্তা ও অবকাঠামো</option>
                                        <option value="general">সাধারণ বিষয়</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                    নির্দিষ্ট সমস্যা বিবরণ (বাংলা) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.data.name_bn}
                                    onChange={(e) => form.setData('name_bn', e.target.value)}
                                    placeholder="উদাহরণ: সরকারি নির্ধারিত ফি এর বেশি অর্থ বা বকশিশ দাবি"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                    ইংরেজি নাম <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.data.name_en}
                                    onChange={(e) => form.setData('name_en', e.target.value)}
                                    placeholder="e.g. Demanding extra bribe or fee"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        তীব্রতা স্তর (Severity)
                                    </label>
                                    <select
                                        value={form.data.severity_level}
                                        onChange={(e) => form.setData('severity_level', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    >
                                        <option value="low">সাধারণ (Low)</option>
                                        <option value="medium">মধ্যম (Medium)</option>
                                        <option value="high">উচ্চ অগ্রাধিকার (High)</option>
                                        <option value="critical">জরুরি (Critical)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        প্রদর্শনের ক্রম (Display Order)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={form.data.display_order}
                                        onChange={(e) => form.setData('display_order', parseInt(e.target.value) || 1)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="item_is_active_toggle"
                                    checked={form.data.is_active}
                                    onChange={(e) => form.setData('is_active', e.target.checked)}
                                    className="rounded text-emerald-600 focus:ring-emerald-500"
                                />
                                <label htmlFor="item_is_active_toggle" className="font-semibold text-slate-700 cursor-pointer">
                                    সমস্যা ধরনটি সক্রিয় ও ফর্মে প্রদর্শনযোগ্য রাখুন
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs"
                                >
                                    {editingItem ? 'সংরক্ষণ করুন' : 'তৈরি করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
