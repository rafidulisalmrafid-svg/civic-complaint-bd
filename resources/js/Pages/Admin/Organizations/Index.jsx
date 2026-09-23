import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Building2, Plus, X, ChevronRight, ChevronDown, CheckCircle2, AlertTriangle, Users, MapPin } from 'lucide-react';

export default function OrganizationsIndex({ organizationsTree, offices, organizationTypes, parentOrganizations, districts, upazilas }) {
    const [selectedOrg, setSelectedOrg] = useState(organizationsTree[0] || null);
    const [activeModal, setActiveModal] = useState(null); // 'org', 'office'

    const orgForm = useForm({
        organization_type_id: organizationTypes[0]?.id || '',
        parent_id: '',
        name_bn: '',
        name_en: '',
        code: '',
        email: '',
        phone: '',
    });

    const officeForm = useForm({
        organization_id: selectedOrg?.id || '',
        name_bn: '',
        name_en: '',
        district_id: districts[0]?.id || '',
        upazila_id: '',
        address: '',
    });

    const handleOrgSubmit = (e) => {
        e.preventDefault();
        orgForm.post('/admin/organizations/org', {
            onSuccess: () => {
                orgForm.reset();
                setActiveModal(null);
            },
        });
    };

    const handleOfficeSubmit = (e) => {
        e.preventDefault();
        officeForm.post('/admin/organizations/office', {
            onSuccess: () => {
                officeForm.reset();
                setActiveModal(null);
            },
        });
    };

    return (
        <AdminLayout
            title="সরকারি দপ্তর ও কার্যালয় ব্যবস্থাপনা"
            subtitle="মন্ত্রণালয়, অধিদপ্তর এবং মাঠ পর্যায়ের অফিসসমূহের হায়ারার্কি ও পারফরম্যান্স বিশ্লেষণ"
        >
            <Head title="দপ্তর ও সংস্থা — অ্যাডমিন প্যানেল" />

            <div className="space-y-6">
                {/* Actions Toolbar */}
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <p className="text-xs text-slate-500">
                        একটি দপ্তর বা সংস্থায় ক্লিক করে তার আওতাধীন অফিস ও অভিযোগের তথ্য দেখুন
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveModal('org')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            নতুন সংস্থা / অধিদপ্তর
                        </button>
                        <button
                            onClick={() => setActiveModal('office')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            নতুন অফিস তৈরি
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Organization Hierarchy Tree */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2">
                            প্রশাসনিক কাঠামো গাছ (Tree View)
                        </h3>

                        <div className="space-y-2">
                            {organizationsTree.map((org) => {
                                const isSelected = selectedOrg?.id === org.id;
                                return (
                                    <div key={org.id} className="space-y-1">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedOrg(org)}
                                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                                                isSelected
                                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                                                    : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <Building2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                                                <span className="truncate">{org.name_bn}</span>
                                            </div>
                                            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white text-slate-600 border shrink-0">
                                                {org.complaints_count} টি
                                            </span>
                                        </button>

                                        {/* Children Departments */}
                                        {org.children?.length > 0 && (
                                            <div className="pl-6 space-y-1 border-l-2 border-slate-100 ml-3">
                                                {org.children.map((child) => (
                                                    <button
                                                        key={child.id}
                                                        type="button"
                                                        onClick={() => setSelectedOrg(child)}
                                                        className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                                                            selectedOrg?.id === child.id
                                                                ? 'bg-emerald-100/60 font-bold text-emerald-900'
                                                                : 'hover:bg-slate-50 text-slate-600'
                                                        }`}
                                                    >
                                                        <span className="truncate">↳ {child.name_bn}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right 2 Cols: Selected Organization Overview & Offices */}
                    <div className="lg:col-span-2 space-y-6">
                        {selectedOrg && (
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                                <div className="flex items-center justify-between border-b pb-3">
                                    <div>
                                        <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">
                                            {selectedOrg.type?.name_bn || 'সরকারি সংস্থা'}
                                        </span>
                                        <h2 className="text-xl font-bold text-slate-900 mt-0.5">{selectedOrg.name_bn}</h2>
                                    </div>
                                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                        {selectedOrg.code}
                                    </span>
                                </div>

                                {/* Performance metrics for selected org */}
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-xl font-bold text-slate-800 font-mono">{selectedOrg.complaints_count || 0}</p>
                                        <p className="text-[11px] text-slate-500 font-semibold uppercase">মোট অভিযোগ</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                                        <p className="text-xl font-bold text-emerald-700 font-mono">{selectedOrg.resolved_complaints_count || 0}</p>
                                        <p className="text-[11px] text-emerald-800 font-semibold uppercase">নিষ্পন্ন হয়েছে</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                                        <p className="text-xl font-bold text-red-700 font-mono">{selectedOrg.overdue_complaints_count || 0}</p>
                                        <p className="text-[11px] text-red-800 font-semibold uppercase">ওভারডিউ</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Offices Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                            <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
                                মাঠ পর্যায়ের কার্যালয় তালিকা ({offices.data?.length || 0} টি)
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b">
                                        <tr>
                                            <th className="py-3 px-4">অফিসের নাম</th>
                                            <th className="py-3 px-4">সংস্থা / মন্ত্রণালয়</th>
                                            <th className="py-3 px-4">জেলা / উপজেলা</th>
                                            <th className="py-3 px-4">কর্মকর্তা</th>
                                            <th className="py-3 px-4">অভিযোগ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {offices.data.map((off) => (
                                            <tr key={off.id} className="hover:bg-slate-50">
                                                <td className="py-3 px-4 font-bold text-slate-800">{off.name_bn}</td>
                                                <td className="py-3 px-4 text-emerald-800 font-semibold">{off.organization?.name_bn}</td>
                                                <td className="py-3 px-4 text-slate-600">{off.district?.name_bn}</td>
                                                <td className="py-3 px-4 font-mono font-bold text-slate-700">{off.officers_count} জন</td>
                                                <td className="py-3 px-4 font-mono font-bold text-emerald-700">{off.complaints_count} টি</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL 1: ADD ORGANIZATION */}
                {activeModal === 'org' && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="font-bold text-slate-900 text-sm">নতুন সংস্থা / অধিদপ্তর যুক্ত করুন</h3>
                                <button onClick={() => setActiveModal(null)}><X className="w-4 h-4 text-slate-400" /></button>
                            </div>
                            <form onSubmit={handleOrgSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">সংস্থার ধরন</label>
                                    <select
                                        value={orgForm.data.organization_type_id}
                                        onChange={(e) => orgForm.setData('organization_type_id', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                        required
                                    >
                                        {organizationTypes.map(t => (
                                            <option key={t.id} value={t.id}>{t.name_bn}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">অভিভাবক সংস্থা (Parent Org - ঐচ্ছিক)</label>
                                    <select
                                        value={orgForm.data.parent_id}
                                        onChange={(e) => orgForm.setData('parent_id', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                    >
                                        <option value="">কোনোটি নয় (মূল মন্ত্রণালয়/সংস্থা)</option>
                                        {parentOrganizations.map(p => (
                                            <option key={p.id} value={p.id}>{p.name_bn}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">সংস্থার নাম (বাংলা)</label>
                                    <input
                                        type="text"
                                        value={orgForm.data.name_bn}
                                        onChange={(e) => orgForm.setData('name_bn', e.target.value)}
                                        placeholder="যেমন: পরিবার পরিকল্পনা অধিদপ্তর"
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">সংস্থার নাম (ইংরেজি)</label>
                                    <input
                                        type="text"
                                        value={orgForm.data.name_en}
                                        onChange={(e) => orgForm.setData('name_en', e.target.value)}
                                        placeholder="Directorate of Family Planning"
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">সংক্ষিপ্ত কোড (Code)</label>
                                    <input
                                        type="text"
                                        value={orgForm.data.code}
                                        onChange={(e) => orgForm.setData('code', e.target.value)}
                                        placeholder="DGFP"
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5 font-mono uppercase"
                                        required
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border rounded-xl">বাতিল</button>
                                    <button type="submit" disabled={orgForm.processing} className="px-5 py-2 bg-slate-800 text-white rounded-xl font-semibold">সংরক্ষণ করুন</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 2: ADD OFFICE */}
                {activeModal === 'office' && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="font-bold text-slate-900 text-sm">নতুন কার্যালয় / অফিস যোগ করুন</h3>
                                <button onClick={() => setActiveModal(null)}><X className="w-4 h-4 text-slate-400" /></button>
                            </div>
                            <form onSubmit={handleOfficeSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">সংস্থা / মন্ত্রণালয়</label>
                                    <select
                                        value={officeForm.data.organization_id}
                                        onChange={(e) => officeForm.setData('organization_id', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                        required
                                    >
                                        {parentOrganizations.map(o => (
                                            <option key={o.id} value={o.id}>{o.name_bn}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">অফিসের নাম (বাংলা)</label>
                                    <input
                                        type="text"
                                        value={officeForm.data.name_bn}
                                        onChange={(e) => officeForm.setData('name_bn', e.target.value)}
                                        placeholder="যেমন: উপজেলা প্রকৌশলীর কার্যালয়, বাকেরগঞ্জ"
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">জেলা</label>
                                    <select
                                        value={officeForm.data.district_id}
                                        onChange={(e) => officeForm.setData('district_id', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                    >
                                        {districts.map(d => (
                                            <option key={d.id} value={d.id}>{d.name_bn}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border rounded-xl">বাতিল</button>
                                    <button type="submit" disabled={officeForm.processing} className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-semibold">অফিস সংরক্ষণ</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
