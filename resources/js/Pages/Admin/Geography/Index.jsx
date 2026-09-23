import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { FolderTree, Plus, X, Check, Archive, MapPin, Search } from 'lucide-react';

export default function GeographyIndex({ currentTab, divisions, districts, upazilas, localGovernments, wards, areas, postOffices, lookups }) {
    const [activeModal, setActiveModal] = useState(null); // 'division', 'district', 'upazila', 'localGov', 'ward', 'area', 'postOffice'

    // Form handlers
    const wardForm = useForm({
        local_government_id: lookups.localGovernments[0]?.id || '',
        ward_number: '',
        name_bn: '',
        name_en: '',
    });

    const upazilaForm = useForm({
        district_id: lookups.districts[0]?.id || '',
        name_bn: '',
        name_en: '',
    });

    const areaForm = useForm({
        ward_id: lookups.wards[0]?.id || '',
        name_bn: '',
        name_en: '',
        type: 'village',
    });

    const localGovForm = useForm({
        upazila_id: lookups.upazilas[0]?.id || '',
        name_bn: '',
        name_en: '',
        type: 'union_parishad',
    });

    const handleTabSwitch = (tab) => {
        router.get('/admin/geography', { tab }, { preserveState: true });
    };

    const handleToggle = (type, id) => {
        if (confirm('আপনি কি এই কাঠামোর সক্রিয়তা অবস্থা পরিবর্তন করতে চান?')) {
            router.post(`/admin/geography/toggle/${type}/${id}`);
        }
    };

    return (
        <AdminLayout
            title="স্থান ও প্রশাসনিক কাঠামো ব্যবস্থাপনা"
            subtitle="বিভাগ, জেলা, উপজেলা, সিটি কর্পোরেশন, পৌরসভা, ইউনিয়ন ও ওয়ার্ডের সমন্বিত ডাটাবেজ"
        >
            <Head title="স্থান ও কাঠামো — অ্যাডমিন প্যানেল" />

            <div className="space-y-6">
                {/* Navigation Tabs */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold pb-2 sm:pb-0">
                        {[
                            { key: 'divisions', label: 'বিভাগ' },
                            { key: 'districts', label: 'জেলা' },
                            { key: 'upazilas', label: 'উপজেলা' },
                            { key: 'localGovs', label: 'সিটি কর্পোরেশন/পৌরসভা/ইউনিয়ন' },
                            { key: 'wards', label: 'ওয়ার্ড' },
                            { key: 'areas', label: 'এলাকা / গ্রাম' },
                            { key: 'postOffices', label: 'পোস্ট অফিস' },
                        ].map((t) => (
                            <button
                                key={t.key}
                                onClick={() => handleTabSwitch(t.key)}
                                className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
                                    currentTab === t.key
                                        ? 'bg-emerald-800 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            if (currentTab === 'wards') setActiveModal('ward');
                            else if (currentTab === 'upazilas') setActiveModal('upazila');
                            else if (currentTab === 'areas') setActiveModal('area');
                            else if (currentTab === 'localGovs') setActiveModal('localGov');
                            else setActiveModal('ward');
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>নতুন যুক্ত করুন</span>
                    </button>
                </div>

                {/* TAB 1: DIVISIONS */}
                {currentTab === 'divisions' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b">
                                <tr>
                                    <th className="py-3 px-4">বিভাগের নাম (বাংলা)</th>
                                    <th className="py-3 px-4">বিভাগের নাম (ইংরেজি)</th>
                                    <th className="py-3 px-4">কোড</th>
                                    <th className="py-3 px-4">অন্তর্ভুক্ত জেলা</th>
                                    <th className="py-3 px-4">অভিযোগ সংখ্যা</th>
                                    <th className="py-3 px-4">অবস্থা</th>
                                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {divisions.map((div) => (
                                    <tr key={div.id} className="hover:bg-slate-50">
                                        <td className="py-3 px-4 font-bold text-slate-800">{div.name_bn}</td>
                                        <td className="py-3 px-4 text-slate-600">{div.name_en}</td>
                                        <td className="py-3 px-4 font-mono font-semibold text-slate-500">{div.code}</td>
                                        <td className="py-3 px-4 font-mono">{div.districts_count} টি জেলা</td>
                                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">{div.complaints_count}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${div.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {div.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button onClick={() => handleToggle('division', div.id)} className="text-slate-400 hover:text-slate-800 font-semibold">
                                                অবস্থা পরিবর্তন
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 2: WARDS */}
                {currentTab === 'wards' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b">
                                <tr>
                                    <th className="py-3 px-4">ওয়ার্ড নম্বর</th>
                                    <th className="py-3 px-4">ওয়ার্ডের নাম</th>
                                    <th className="py-3 px-4">সিটি কর্পোরেশন / পৌরসভা / ইউনিয়ন</th>
                                    <th className="py-3 px-4">উপজেলা</th>
                                    <th className="py-3 px-4">অন্তর্ভুক্ত এলাকা</th>
                                    <th className="py-3 px-4">অবস্থা</th>
                                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {wards.data.map((w) => (
                                    <tr key={w.id} className="hover:bg-slate-50">
                                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{w.ward_number}</td>
                                        <td className="py-3 px-4 font-semibold text-slate-900">{w.name_bn}</td>
                                        <td className="py-3 px-4 text-emerald-800 font-medium">{w.local_government?.name_bn}</td>
                                        <td className="py-3 px-4 text-slate-600">{w.local_government?.upazila?.name_bn}</td>
                                        <td className="py-3 px-4 font-mono">{w.areas_count} টি</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${w.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {w.status === 'active' ? 'সক্রিয়' : 'আর্কাইভ'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button onClick={() => handleToggle('ward', w.id)} className="text-slate-400 hover:text-slate-800 font-semibold">
                                                অবস্থা পরিবর্তন
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 3: UPAZILAS */}
                {currentTab === 'upazilas' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b">
                                <tr>
                                    <th className="py-3 px-4">উপজেলার নাম (বাংলা)</th>
                                    <th className="py-3 px-4">উপজেলার নাম (ইংরেজি)</th>
                                    <th className="py-3 px-4">জেলা</th>
                                    <th className="py-3 px-4">সিটি কর্পোরেশন / পৌরসভা / ইউনিয়ন</th>
                                    <th className="py-3 px-4">অবস্থা</th>
                                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {upazilas.data.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50">
                                        <td className="py-3 px-4 font-bold text-slate-900">{u.name_bn}</td>
                                        <td className="py-3 px-4 text-slate-600">{u.name_en}</td>
                                        <td className="py-3 px-4 text-slate-700">{u.district?.name_bn} ({u.district?.division?.name_bn})</td>
                                        <td className="py-3 px-4 font-mono">{u.local_governments_count} টি</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {u.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button onClick={() => handleToggle('upazila', u.id)} className="text-slate-400 hover:text-slate-800 font-semibold">
                                                অবস্থা পরিবর্তন
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 4: LOCAL GOVERNMENTS */}
                {currentTab === 'localGovs' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b">
                                <tr>
                                    <th className="py-3 px-4">প্রতিষ্ঠানের নাম</th>
                                    <th className="py-3 px-4">ধরন</th>
                                    <th className="py-3 px-4">উপজেলা</th>
                                    <th className="py-3 px-4">ওয়ার্ড সংখ্যা</th>
                                    <th className="py-3 px-4">অবস্থা</th>
                                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {localGovernments.data.map((lg) => (
                                    <tr key={lg.id} className="hover:bg-slate-50">
                                        <td className="py-3 px-4 font-bold text-slate-900">{lg.name_bn}</td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                                                {lg.type === 'city_corporation' ? 'সিটি কর্পোরেশন' : lg.type === 'pourashava' ? 'পৌরসভা' : 'ইউনিয়ন পরিষদ'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-700">{lg.upazila?.name_bn} ({lg.upazila?.district?.name_bn})</td>
                                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">{lg.wards_count} টি</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${lg.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {lg.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button onClick={() => handleToggle('local_government', lg.id)} className="text-slate-400 hover:text-slate-800 font-semibold">
                                                অবস্থা পরিবর্তন
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* MODAL: ADD WARD */}
                {activeModal === 'ward' && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="font-bold text-slate-900 text-sm">নতুন ওয়ার্ড তৈরি করুন</h3>
                                <button onClick={() => setActiveModal(null)}><X className="w-4 h-4 text-slate-400" /></button>
                            </div>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                wardForm.post('/admin/geography/ward', {
                                    onSuccess: () => {
                                        wardForm.reset();
                                        setActiveModal(null);
                                    }
                                });
                            }} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">সিটি কর্পোরেশন / পৌরসভা / ইউনিয়ন</label>
                                    <select
                                        value={wardForm.data.local_government_id}
                                        onChange={(e) => wardForm.setData('local_government_id', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                        required
                                    >
                                        {lookups.localGovernments.map((lg) => (
                                            <option key={lg.id} value={lg.id}>{lg.name_bn}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">ওয়ার্ড নম্বর (যেমন: 01, 02)</label>
                                    <input
                                        type="text"
                                        value={wardForm.data.ward_number}
                                        onChange={(e) => wardForm.setData('ward_number', e.target.value)}
                                        placeholder="01"
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5 font-mono"
                                        required
                                    />
                                    {wardForm.errors.ward_number && <p className="text-red-500 mt-1">{wardForm.errors.ward_number}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">ওয়ার্ডের নাম (বাংলা)</label>
                                    <input
                                        type="text"
                                        value={wardForm.data.name_bn}
                                        onChange={(e) => wardForm.setData('name_bn', e.target.value)}
                                        placeholder="ওয়ার্ড নং ০১"
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                        required
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border rounded-xl">বাতিল</button>
                                    <button type="submit" disabled={wardForm.processing} className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-semibold">সংরক্ষণ করুন</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
