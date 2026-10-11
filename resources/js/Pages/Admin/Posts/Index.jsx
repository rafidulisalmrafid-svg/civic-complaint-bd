import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    Shield, 
    Plus, 
    Search, 
    Users, 
    Filter, 
    CheckCircle2, 
    Trash2, 
    Edit3,
    Briefcase
} from 'lucide-react';

export default function PostsIndex({ posts = [], selectedServiceType }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

    const form = useForm({
        name_bn: '',
        name_en: '',
        service_type: 'health',
        grade_level: 9,
        description: '',
        is_active: true,
    });

    const serviceTypes = [
        { key: 'all', label: 'সকল খাত', filterVal: '' },
        { key: 'health', label: 'স্বাস্থ্য সেবা', filterVal: 'health' },
        { key: 'land', label: 'ভূমি ব্যবস্থাপনা', filterVal: 'land' },
        { key: 'police', label: 'আইন-শৃঙ্খলা ও পুলিশ', filterVal: 'police' },
        { key: 'education', label: 'শিক্ষা ব্যবস্থা', filterVal: 'education' },
        { key: 'local_gov', label: 'স্থানীয় সরকার', filterVal: 'local_gov' },
        { key: 'general', label: 'সাধারণ প্রশাসন', filterVal: 'general' },
    ];

    const openCreateModal = () => {
        setEditingPost(null);
        form.reset();
        setShowModal(true);
    };

    const openEditModal = (p) => {
        setEditingPost(p);
        form.setData({
            name_bn: p.name_bn,
            name_en: p.name_en,
            service_type: p.service_type,
            grade_level: p.grade_level || 9,
            description: p.description || '',
            is_active: !!p.is_active,
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingPost) {
            form.put(`/admin/posts/${editingPost.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    form.reset();
                }
            });
        } else {
            form.post('/admin/posts', {
                onSuccess: () => {
                    setShowModal(false);
                    form.reset();
                }
            });
        }
    };

    const handleDelete = (p) => {
        if (confirm(`আপনি কি "${p.name_bn}" পদবিটি মুছে ফেলতে নিশ্চিত?`)) {
            router.delete(`/admin/posts/${p.id}`);
        }
    };

    const filteredPosts = posts.filter((p) => {
        const matchesSearch = 
            p.name_bn.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.name_en.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getServiceTypeBadge = (st) => {
        switch (st) {
            case 'health': return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">স্বাস্থ্য</span>;
            case 'land': return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">ভূমি</span>;
            case 'police': return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">পুলিশ</span>;
            case 'education': return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">শিক্ষা</span>;
            case 'local_gov': return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">স্থানীয় সরকার</span>;
            default: return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-50 text-slate-700 border border-slate-200">সাধারণ</span>;
        }
    };

    return (
        <AdminLayout
            title="সরকারি পদবি ডিরেক্টরি"
            subtitle="বিভিন্ন সরকারি দপ্তর ও সেবার অনুমোদিত পদবি ও ডেসিগনেশন তালিকা"
        >
            <Head title="পদবি ডিরেক্টরি — অ্যাডমিন প্যানেল" />

            <div className="space-y-6">
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    {/* Search & Filters */}
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                        <div className="relative min-w-[240px]">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                placeholder="পদবির নাম খুঁজুন..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>

                        {/* Service Filter Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                            {serviceTypes.map((st) => (
                                <button
                                    key={st.key}
                                    type="button"
                                    onClick={() => router.get('/admin/posts', st.filterVal ? { service_type: st.filterVal } : {})}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                                        (!selectedServiceType && !st.filterVal) || selectedServiceType === st.filterVal
                                            ? 'bg-emerald-700 text-white font-semibold'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    }`}
                                >
                                    {st.label}
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
                        <span>নতুন পদবি যোগ করুন</span>
                    </button>
                </div>

                {/* Posts Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3">পদবির নাম (বাংলা)</th>
                                    <th className="px-5 py-3">ইংরেজি নাম</th>
                                    <th className="px-5 py-3">খাত / সেবা</th>
                                    <th className="px-5 py-3">গ্রেড</th>
                                    <th className="px-5 py-3">কর্মকর্তা সংখ্যা</th>
                                    <th className="px-5 py-3">স্ট্যাটাস</th>
                                    <th className="px-5 py-3 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPosts.length > 0 ? (
                                    filteredPosts.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-3 font-semibold text-slate-900 flex items-center gap-2">
                                                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{p.name_bn}</span>
                                            </td>
                                            <td className="px-5 py-3 font-mono text-slate-600">{p.name_en}</td>
                                            <td className="px-5 py-3">{getServiceTypeBadge(p.service_type)}</td>
                                            <td className="px-5 py-3 font-mono">গ্রেড {p.grade_level || '—'}</td>
                                            <td className="px-5 py-3">
                                                <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                                                    <Users className="w-3 h-3 text-slate-400" />
                                                    {p.officers_count || 0} জন
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                {p.is_active ? (
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
                                                        onClick={() => openEditModal(p)}
                                                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                                                        title="সম্পাদনা করুন"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(p)}
                                                        disabled={p.officers_count > 0}
                                                        className={`p-1.5 rounded-lg ${
                                                            p.officers_count > 0 
                                                                ? 'text-slate-300 cursor-not-allowed' 
                                                                : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50'
                                                        }`}
                                                        title={p.officers_count > 0 ? "কর্মকর্তা সংযুক্ত থাকায় ডিলিট সম্ভব নয়" : "মুছে ফেলুন"}
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
                                            কোনো পদবি পাওয়া যায়নি।
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
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900">
                                {editingPost ? 'পদবি সম্পাদনা করুন' : 'নতুন পদবি যুক্ত করুন'}
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
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                    পদবির নাম (বাংলা) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.data.name_bn}
                                    onChange={(e) => form.setData('name_bn', e.target.value)}
                                    placeholder="উদাহরণ: আবাসিক মেডিকেল অফিসার (RMO)"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                    পদবির নাম (ইংরেজি) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.data.name_en}
                                    onChange={(e) => form.setData('name_en', e.target.value)}
                                    placeholder="e.g. Resident Medical Officer"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        খাত / সেক্টর
                                    </label>
                                    <select
                                        value={form.data.service_type}
                                        onChange={(e) => form.setData('service_type', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    >
                                        <option value="health">স্বাস্থ্য সেবা</option>
                                        <option value="land">ভূমি ব্যবস্থাপনা</option>
                                        <option value="police">আইন-শৃঙ্খলা ও পুলিশ</option>
                                        <option value="education">শিক্ষা ব্যবস্থা</option>
                                        <option value="local_gov">স্থানীয় সরকার</option>
                                        <option value="general">সাধারণ প্রশাসন</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        জাতীয় বেতন স্কেল গ্রেড
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={form.data.grade_level}
                                        onChange={(e) => form.setData('grade_level', parseInt(e.target.value) || '')}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                    বিবরণ (ঐচ্ছিক)
                                </label>
                                <textarea
                                    rows="2"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="পদবির দায়িত্বের বিবরণ..."
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="is_active_toggle"
                                    checked={form.data.is_active}
                                    onChange={(e) => form.setData('is_active', e.target.checked)}
                                    className="rounded text-emerald-600 focus:ring-emerald-500"
                                />
                                <label htmlFor="is_active_toggle" className="font-semibold text-slate-700 cursor-pointer">
                                    পদবিটি সক্রিয় রাখুন
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
                                    {editingPost ? 'সংরক্ষণ করুন' : 'তৈরি করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
