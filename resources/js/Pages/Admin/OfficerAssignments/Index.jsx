import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Shield,
    Plus,
    Search,
    CheckCircle2,
    XCircle,
    Trash2,
    Edit3,
    UserCheck,
    Building2,
    MapPin,
    Layers,
    Filter,
    AlertCircle
} from 'lucide-react';

export default function OfficerAssignmentsIndex({
    assignments = { data: [] },
    categories = [],
    divisions = [],
    districts = [],
    officers = []
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
    const [selectedDivisionFilter, setSelectedDivisionFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const form = useForm({
        category_id: categories[0]?.id || '',
        division_id: '',
        district_id: '',
        officer_profile_id: officers[0]?.id || '',
        is_active: true,
        notes: '',
    });

    const openCreateModal = () => {
        setEditingItem(null);
        form.reset();
        form.setData({
            category_id: categories[0]?.id || '',
            division_id: '',
            district_id: '',
            officer_profile_id: officers[0]?.id || '',
            is_active: true,
            notes: '',
        });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        form.setData({
            category_id: item.category_id,
            division_id: item.division_id || '',
            district_id: item.district_id || '',
            officer_profile_id: item.officer_profile_id,
            is_active: !!item.is_active,
            notes: item.notes || '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            form.put(`/admin/officer-assignments/${editingItem.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    form.reset();
                }
            });
        } else {
            form.post('/admin/officer-assignments', {
                onSuccess: () => {
                    setShowModal(false);
                    form.reset();
                }
            });
        }
    };

    const handleToggle = (id) => {
        router.post(`/admin/officer-assignments/${id}/toggle`);
    };

    const handleDelete = (item) => {
        if (confirm(`আপনি কি এই দায়িত্ব বণ্টনটি মুছে ফেলতে নিশ্চিত?`)) {
            router.delete(`/admin/officer-assignments/${item.id}`);
        }
    };

    // Filter districts based on selected division in modal
    const modalDistricts = form.data.division_id 
        ? districts.filter(d => d.division_id === parseInt(form.data.division_id))
        : districts;

    // Filter list
    const filteredAssignments = (assignments.data || []).filter(item => {
        const catName = item.category?.name_bn || '';
        const officerName = item.officer_profile?.name_bn || '';
        const divName = item.division?.name_bn || '';
        const matchesSearch = 
            catName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            officerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            divName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCat = selectedCategoryFilter ? item.category_id === parseInt(selectedCategoryFilter) : true;
        const matchesDiv = selectedDivisionFilter ? item.division_id === parseInt(selectedDivisionFilter) : true;

        return matchesSearch && matchesCat && matchesDiv;
    });

    const activeCount = (assignments.data || []).filter(a => a.is_active).length;

    return (
        <AdminLayout
            title="বিভাগ ও খাতভিত্তিক দায়িত্ব কর্মকর্তা বণ্টন"
            subtitle="প্রতিটি বিভাগ বা জেলার বিভিন্ন ক্যাটাগরির জন্য দায়িত্বপ্রাপ্ত ফোকাল পয়েন্ট নির্ধারণ ও ব্যবস্থাপনা"
        >
            <Head title="দায়িত্ব কর্মকর্তা বণ্টন — অ্যাডমিন প্যানেল" />

            <div className="space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">মোট নির্ধারিত দায়িত্ব</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Shield className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">{assignments.total || assignments.data?.length || 0}</p>
                        <p className="text-[11px] text-slate-400 mt-1">বিভাগ ও খাতভিত্তিক অ্যাসাইনমেন্ট</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">সক্রিয় কর্মকর্তা দায়িত্ব</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-emerald-700 mt-2 font-mono">{activeCount}</p>
                        <p className="text-[11px] text-emerald-600 mt-1">অভিযোগ স্বয়ংক্রিয়ভাবে রাউট হচ্ছে</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">মোট সেবা খাত / ক্যাটাগরি</span>
                            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Layers className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-purple-700 mt-2 font-mono">{categories.length}</p>
                        <p className="text-[11px] text-purple-600 mt-1">স্বাস্থ্য, ভূমি, পুলিশ, শিক্ষা ইত্যাদি</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">প্রশাসনিক বিভাগ</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <MapPin className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-amber-700 mt-2 font-mono">{divisions.length}</p>
                        <p className="text-[11px] text-amber-600 mt-1">জাতীয় ৮টি প্রশাসনিক বিভাগ</p>
                    </div>
                </div>

                {/* Filter and Actions Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                        <div className="relative min-w-[200px]">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                placeholder="খাত বা কর্মকর্তার নাম খুঁজুন..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>

                        {/* Category filter */}
                        <select
                            value={selectedCategoryFilter}
                            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                            className="text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                            <option value="">সকল সেবা খাত</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name_bn}</option>
                            ))}
                        </select>

                        {/* Division filter */}
                        <select
                            value={selectedDivisionFilter}
                            onChange={(e) => setSelectedDivisionFilter(e.target.value)}
                            className="text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                            <option value="">সকল বিভাগ</option>
                            {divisions.map(d => (
                                <option key={d.id} value={d.id}>{d.name_bn}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>নতুন দায়িত্ব বণ্টন করুন</span>
                    </button>
                </div>

                {/* Assignments Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3">সেবা খাত / ক্যাটাগরি</th>
                                    <th className="px-5 py-3">প্রশাসনিক এলাকা</th>
                                    <th className="px-5 py-3">দায়িত্বপ্রাপ্ত কর্মকর্তা</th>
                                    <th className="px-5 py-3">দপ্তর ও যোগাযোগ</th>
                                    <th className="px-5 py-3">স্ট্যাটাস</th>
                                    <th className="px-5 py-3 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAssignments.length > 0 ? (
                                    filteredAssignments.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-3.5 font-semibold text-slate-900">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                        <Shield className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{item.category?.name_bn || '—'}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono">{item.category?.name_en}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-3.5">
                                                <div className="space-y-0.5">
                                                    <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                                                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                                        {item.division?.name_bn ? `${item.division.name_bn} বিভাগ` : 'সমগ্র বাংলাদেশ (জাতীয়)'}
                                                    </span>
                                                    {item.district && (
                                                        <p className="text-[11px] text-slate-500 pl-4.5">
                                                            জেলা: {item.district.name_bn}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-5 py-3.5">
                                                <div>
                                                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                                                        {item.officer_profile?.name_bn || 'নাম উল্লেখ নেই'}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 pl-5">
                                                        {item.officer_profile?.designation_bn || 'দায়িত্বপ্রাপ্ত ফোকাল পয়েন্ট'}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-5 py-3.5 text-slate-600">
                                                <p className="text-[11px] font-medium text-slate-700">{item.officer_profile?.office?.name_bn || 'সংশ্লিষ্ট কার্যালয়'}</p>
                                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                    {item.officer_profile?.user?.email || item.officer_profile?.user?.phone || '—'}
                                                </p>
                                            </td>

                                            <td className="px-5 py-3.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggle(item.id)}
                                                    className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-semibold transition-all ${
                                                        item.is_active
                                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                            : 'bg-slate-100 text-slate-500 border border-slate-300'
                                                    }`}
                                                >
                                                    {item.is_active ? (
                                                        <>
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> সক্রিয়
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3 h-3 text-slate-400" /> নিষ্ক্রিয়
                                                        </>
                                                    )}
                                                </button>
                                            </td>

                                            <td className="px-5 py-3.5 text-right">
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
                                        <td colSpan="6" className="px-5 py-8 text-center text-slate-400">
                                            কোনো কর্মকর্তা দায়িত্ব বণ্টন পাওয়া যায়নি। নতুন দায়িত্ব যোগ করতে ওপরের বাটনে ক্লিক করুন।
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    {editingItem ? 'দায়িত্ব বণ্টন তথ্য সম্পাদনা' : 'নতুন কর্মকর্তা দায়িত্ব বণ্টন'}
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    নির্দিষ্ট বিভাগ ও সেবা খাতের জন্য দায়িত্বপ্রাপ্ত কর্মকর্তা নির্ধারণ করুন
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                            {/* Category Select */}
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                    সেবা খাত / ক্যাটাগরি <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={form.data.category_id}
                                    onChange={(e) => form.setData('category_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    required
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name_bn} ({c.name_en})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Geography: Division & District */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        বিভাগ (ঐচ্ছিক)
                                    </label>
                                    <select
                                        value={form.data.division_id}
                                        onChange={(e) => {
                                            form.setData({
                                                ...form.data,
                                                division_id: e.target.value,
                                                district_id: '',
                                            });
                                        }}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    >
                                        <option value="">সমগ্র বাংলাদেশ (জাতীয়)</option>
                                        {divisions.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name_bn}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        জেলা (নির্দিষ্টকরণ)
                                    </label>
                                    <select
                                        value={form.data.district_id}
                                        onChange={(e) => form.setData('district_id', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    >
                                        <option value="">পুরো বিভাগের জন্য প্রযোজ্য</option>
                                        {modalDistricts.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name_bn}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Designated Officer Select */}
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                    দায়িত্বপ্রাপ্ত কর্মকর্তা নির্বাচন করুন <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={form.data.officer_profile_id}
                                    onChange={(e) => form.setData('officer_profile_id', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    required
                                >
                                    {officers.map((o) => (
                                        <option key={o.id} value={o.id}>
                                            {o.name_bn} — {o.designation_bn} ({o.office?.name_bn || 'দপ্তর'})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    নির্বাচিত কর্মকর্তার নিজস্ব ইউজার আইডি ও পাসওয়ার্ড থাকবে। তিনি শুধু এই খাতের অভিযোগই দেখতে পারবেন।
                                </p>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                    বিশেষ প্রশাসনিক নোট / নির্দেশনা
                                </label>
                                <textarea
                                    rows="2"
                                    value={form.data.notes}
                                    onChange={(e) => form.setData('notes', e.target.value)}
                                    placeholder="উদাহরণ: বরিশাল বিভাগের সকল সরকারি হাসপাতাল ও স্বাস্থ্য কমপ্লেক্সের অভিযোগ তদারকি করবেন।"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>

                            {/* Active status checkbox */}
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="asn_is_active_toggle"
                                    checked={form.data.is_active}
                                    onChange={(e) => form.setData('is_active', e.target.checked)}
                                    className="rounded text-emerald-600 focus:ring-emerald-500"
                                />
                                <label htmlFor="asn_is_active_toggle" className="font-semibold text-slate-700 cursor-pointer">
                                    এই দায়িত্বটি অবিলম্বে সক্রিয় ও স্বয়ংক্রিয় রাউটিংযোগ্য রাখুন
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
                                    {editingItem ? 'সংরক্ষণ করুন' : 'নির্ধারণ সম্পন্ন করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
