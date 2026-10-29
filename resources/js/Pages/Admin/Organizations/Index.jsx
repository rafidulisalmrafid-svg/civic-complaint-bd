import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    Building2, 
    Plus, 
    X, 
    ChevronRight, 
    ChevronDown, 
    CheckCircle2, 
    AlertTriangle, 
    Users, 
    MapPin, 
    Edit3, 
    Trash2, 
    GitBranch, 
    Search,
    Layers,
    Phone,
    Mail,
    Check
} from 'lucide-react';

export default function OrganizationsIndex({ 
    organizationsTree = [], 
    offices = { data: [] }, 
    branches = [], 
    officeSelect = [], 
    organizationTypes = [], 
    parentOrganizations = [], 
    districts = [], 
    upazilas = [] 
}) {
    const [activeTab, setActiveTab] = useState('offices'); // 'offices', 'branches', 'tree'
    const [selectedOrg, setSelectedOrg] = useState(organizationsTree[0] || null);
    const [activeModal, setActiveModal] = useState(null); // 'org', 'office', 'editOffice', 'branch', 'editBranch'
    const [editingOffice, setEditingOffice] = useState(null);
    const [editingBranch, setEditingBranch] = useState(null);
    const [searchOfficeText, setSearchOfficeText] = useState('');
    const [searchBranchText, setSearchBranchText] = useState('');

    // Organization Form
    const orgForm = useForm({
        organization_type_id: organizationTypes[0]?.id || '',
        parent_id: '',
        name_bn: '',
        name_en: '',
        code: '',
        email: '',
        phone: '',
    });

    // Office Form (Create & Edit)
    const officeForm = useForm({
        organization_id: selectedOrg?.id || (parentOrganizations[0]?.id || ''),
        name_bn: '',
        name_en: '',
        district_id: districts[0]?.id || '',
        upazila_id: '',
        address: '',
        phone: '',
        email: '',
    });

    // Branch Form (Create & Edit)
    const branchForm = useForm({
        office_id: officeSelect[0]?.id || '',
        name_bn: '',
        name_en: '',
        code: '',
        room_number: '',
        floor: '',
        phone: '',
        email: '',
        description: '',
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

    const openEditOffice = (off) => {
        setEditingOffice(off);
        officeForm.setData({
            organization_id: off.organization_id,
            name_bn: off.name_bn,
            name_en: off.name_en || off.name_bn,
            district_id: off.district_id || '',
            upazila_id: off.upazila_id || '',
            address: off.address || '',
            phone: off.phone || '',
            email: off.email || '',
        });
        setActiveModal('editOffice');
    };

    const handleOfficeUpdate = (e) => {
        e.preventDefault();
        if (!editingOffice) return;
        officeForm.put(`/admin/organizations/office/${editingOffice.id}`, {
            onSuccess: () => {
                officeForm.reset();
                setEditingOffice(null);
                setActiveModal(null);
            },
        });
    };

    const handleDeleteOffice = (off) => {
        if (confirm(`আপনি কি নিশ্চিতভাবে "${off.name_bn}" অফিসটি মুছে ফেলতে চান?`)) {
            router.delete(`/admin/organizations/office/${off.id}`);
        }
    };

    const openAddBranchForOffice = (off) => {
        branchForm.setData({
            office_id: off.id,
            name_bn: '',
            name_en: '',
            code: '',
            room_number: '',
            floor: '',
            phone: '',
            email: '',
            description: '',
        });
        setActiveModal('branch');
    };

    const handleBranchSubmit = (e) => {
        e.preventDefault();
        branchForm.post('/admin/organizations/branch', {
            onSuccess: () => {
                branchForm.reset();
                setActiveModal(null);
            },
        });
    };

    const openEditBranch = (br) => {
        setEditingBranch(br);
        branchForm.setData({
            office_id: br.office_id,
            name_bn: br.name_bn,
            name_en: br.name_en || '',
            code: br.code || '',
            room_number: br.room_number || '',
            floor: br.floor || '',
            phone: br.phone || '',
            email: br.email || '',
            description: br.description || '',
        });
        setActiveModal('editBranch');
    };

    const handleBranchUpdate = (e) => {
        e.preventDefault();
        if (!editingBranch) return;
        branchForm.put(`/admin/organizations/branch/${editingBranch.id}`, {
            onSuccess: () => {
                branchForm.reset();
                setEditingBranch(null);
                setActiveModal(null);
            },
        });
    };

    const handleDeleteBranch = (br) => {
        if (confirm(`আপনি কি নিশ্চিতভাবে "${br.name_bn}" শাখাটি মুছে ফেলতে চান?`)) {
            router.delete(`/admin/organizations/branch/${br.id}`);
        }
    };

    return (
        <AdminLayout
            title="সরকারি দপ্তর, কার্যালয় ও শাখা ব্যবস্থাপনা"
            subtitle="মন্ত্রণালয়, অধিদপ্তর, মাঠপর্যায়ের অফিস ও অভ্যন্তরীণ শাখাসমূহের পূর্ণ নিয়ন্ত্রণ"
        >
            <Head title="দপ্তর, অফিস ও শাখা ব্যবস্থাপনা — অ্যাডমিন প্যানেল" />

            <div className="space-y-6">
                {/* Actions Toolbar & Tabs */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setActiveTab('offices')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                activeTab === 'offices' 
                                    ? 'bg-white text-emerald-800 shadow-xs' 
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            মাঠ পর্যায়ের অফিস ({offices.data?.length || 0})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('branches')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                activeTab === 'branches' 
                                    ? 'bg-white text-emerald-800 shadow-xs' 
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            শাখা ও ডিপার্টমেন্ট ({branches?.length || 0})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('tree')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                activeTab === 'tree' 
                                    ? 'bg-white text-emerald-800 shadow-xs' 
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            মন্ত্রণালয় ও সংস্থা গাছ (Tree)
                        </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => setActiveModal('branch')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                        >
                            <GitBranch className="w-3.5 h-3.5" />
                            + নতুন শাখা / ডিপার্টমেন্ট
                        </button>
                        <button
                            onClick={() => {
                                officeForm.reset();
                                setActiveModal('office');
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            + নতুন অফিস তৈরি
                        </button>
                        <button
                            onClick={() => setActiveModal('org')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            নতুন সংস্থা
                        </button>
                    </div>
                </div>

                {/* TAB 1: OFFICES LIST WITH CRUD */}
                {activeTab === 'offices' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">সরকারি কার্যালয় / অফিস তালিকা</h3>
                                <p className="text-[11px] text-slate-500">
                                    নাগরিকরা অভিযোগ দাখিল করার সময় এই অফিসসমূহ নির্বাচন করতে পারেন
                                </p>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    placeholder="অফিস খুঁজুন..."
                                    value={searchOfficeText}
                                    onChange={(e) => setSearchOfficeText(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b">
                                    <tr>
                                        <th className="py-3 px-4">অফিসের নাম</th>
                                        <th className="py-3 px-4">সংস্থা / দপ্তর</th>
                                        <th className="py-3 px-4">অবস্থান (জেলা/উপজেলা)</th>
                                        <th className="py-3 px-4">অভ্যন্তরীণ শাখা</th>
                                        <th className="py-3 px-4">অভিযোগ</th>
                                        <th className="py-3 px-4 text-right">অ্যাকশন</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {offices.data
                                        .filter(o => !searchOfficeText || o.name_bn.includes(searchOfficeText) || o.name_en?.toLowerCase().includes(searchOfficeText.toLowerCase()))
                                        .map((off) => (
                                            <tr key={off.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3 px-4">
                                                    <span className="font-bold text-slate-900 block">{off.name_bn}</span>
                                                    <span className="text-[11px] text-slate-400 font-mono">{off.name_en}</span>
                                                    {off.address && <p className="text-[11px] text-slate-500 mt-0.5">{off.address}</p>}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100">
                                                        {off.organization?.name_bn || 'সাধারণ'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-slate-700">
                                                    <span className="font-semibold">{off.district?.name_bn}</span>
                                                    {off.upazila && <span className="text-slate-400"> → {off.upazila.name_bn}</span>}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="inline-flex items-center gap-1 font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                                        <GitBranch className="w-3 h-3" />
                                                        {off.branches?.length || off.branches_count || 0} টি শাখা
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-mono font-bold text-slate-700">
                                                    {off.complaints_count || 0} টি
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => openAddBranchForOffice(off)}
                                                            title="এই অফিসের অধীনে নতুন শাখা যুক্ত করুন"
                                                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                                                        >
                                                            <GitBranch className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditOffice(off)}
                                                            title="অফিসের তথ্য এডিট করুন"
                                                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteOffice(off)}
                                                            title="অফিস মুছে ফেলুন"
                                                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 2: BRANCHES & DEPARTMENTS DIRECTORY */}
                {activeTab === 'branches' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">অফিসের অভ্যন্তরীণ শাখা ও ডিপার্টমেন্ট ডিরেক্টরি</h3>
                                <p className="text-[11px] text-slate-500">
                                    প্রতিটি অফিসের অধীনে শাখা (রুম নম্বর, ফ্লোর) কনফিগার করুন যা ধাপ ৪-এ নাগরিকরা দেখতে পান
                                </p>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    placeholder="শাখা খুঁজুন..."
                                    value={searchBranchText}
                                    onChange={(e) => setSearchBranchText(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b">
                                    <tr>
                                        <th className="py-3 px-4">শাখার নাম</th>
                                        <th className="py-3 px-4">মূল কার্যালয় (Office)</th>
                                        <th className="py-3 px-4">রুম নম্বর ও ফ্লোর</th>
                                        <th className="py-3 px-4">যোগাযোগ</th>
                                        <th className="py-3 px-4">স্ট্যাটাস</th>
                                        <th className="py-3 px-4 text-right">অ্যাকশন</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {branches
                                        .filter(b => !searchBranchText || b.name_bn.includes(searchBranchText) || b.office?.name_bn?.includes(searchBranchText))
                                        .map((br) => (
                                            <tr key={br.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3 px-4">
                                                    <span className="font-bold text-slate-900 block">{br.name_bn}</span>
                                                    {br.code && <span className="text-[10px] text-slate-400 font-mono">কোড: {br.code}</span>}
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-slate-800">
                                                    {br.office?.name_bn || 'সাধারণ অফিস'}
                                                </td>
                                                <td className="py-3 px-4 text-slate-600">
                                                    {br.room_number ? `রুম: ${br.room_number}` : 'রুম নির্ধারিত নেই'}
                                                    {br.floor && ` • ${br.floor}`}
                                                </td>
                                                <td className="py-3 px-4 text-slate-500">
                                                    {br.phone && <span className="block">{br.phone}</span>}
                                                    {br.email && <span className="block font-mono text-[10px]">{br.email}</span>}
                                                    {!br.phone && !br.email && '—'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                        সক্রিয়
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditBranch(br)}
                                                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                                                            title="শাখা এডিট করুন"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteBranch(br)}
                                                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                                                            title="শাখা মুছে ফেলুন"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: TREE VIEW */}
                {activeTab === 'tree' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Tree Left */}
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
                                                    {org.complaints_count || 0} টি
                                                </span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Overview Right */}
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
                        </div>
                    </div>
                )}

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
                                    <label className="block font-semibold text-slate-700 mb-1">সংক্ষিপ্ত কোড</label>
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

                {/* MODAL 2: ADD / EDIT OFFICE */}
                {(activeModal === 'office' || activeModal === 'editOffice') && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="font-bold text-slate-900 text-sm">
                                    {activeModal === 'editOffice' ? 'অফিসের তথ্য সম্পাদন (Edit)' : 'নতুন কার্যালয় / অফিস যোগ করুন'}
                                </h3>
                                <button onClick={() => { setActiveModal(null); setEditingOffice(null); }}><X className="w-4 h-4 text-slate-400" /></button>
                            </div>
                            <form onSubmit={activeModal === 'editOffice' ? handleOfficeUpdate : handleOfficeSubmit} className="space-y-3.5 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">সংস্থা / অধিদপ্তর</label>
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
                                    <label className="block font-semibold text-slate-700 mb-1">অফিসের নাম (ইংরেজি)</label>
                                    <input
                                        type="text"
                                        value={officeForm.data.name_en}
                                        onChange={(e) => officeForm.setData('name_en', e.target.value)}
                                        placeholder="Upazila Engineer Office"
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">জেলা</label>
                                        <select
                                            value={officeForm.data.district_id}
                                            onChange={(e) => officeForm.setData('district_id', e.target.value)}
                                            className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                            required
                                        >
                                            {districts.map(d => (
                                                <option key={d.id} value={d.id}>{d.name_bn}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">উপজেলা (ঐচ্ছিক)</label>
                                        <select
                                            value={officeForm.data.upazila_id}
                                            onChange={(e) => officeForm.setData('upazila_id', e.target.value)}
                                            className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                        >
                                            <option value="">সদর / প্রযোজ্য নয়</option>
                                            {upazilas
                                                .filter(u => !officeForm.data.district_id || String(u.district_id) === String(officeForm.data.district_id))
                                                .map(u => (
                                                    <option key={u.id} value={u.id}>{u.name_bn}</option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">ঠিকানা (ঐচ্ছিক)</label>
                                    <input
                                        type="text"
                                        value={officeForm.data.address}
                                        onChange={(e) => officeForm.setData('address', e.target.value)}
                                        placeholder="ঠিকানা বা অবস্থান"
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button 
                                        type="button" 
                                        onClick={() => { setActiveModal(null); setEditingOffice(null); }} 
                                        className="px-4 py-2 border rounded-xl"
                                    >
                                        বাতিল
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={officeForm.processing} 
                                        className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold"
                                    >
                                        {activeModal === 'editOffice' ? 'আপডেট করুন' : 'অফিস সংরক্ষণ'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 3: ADD / EDIT BRANCH */}
                {(activeModal === 'branch' || activeModal === 'editBranch') && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="font-bold text-slate-900 text-sm">
                                    {activeModal === 'editBranch' ? 'শাখা / ডিপার্টমেন্ট সম্পাদন' : 'নতুন শাখা / ডিপার্টমেন্ট তৈরি করুন'}
                                </h3>
                                <button onClick={() => { setActiveModal(null); setEditingBranch(null); }}><X className="w-4 h-4 text-slate-400" /></button>
                            </div>
                            <form onSubmit={activeModal === 'editBranch' ? handleBranchUpdate : handleBranchSubmit} className="space-y-3.5 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">কোন অফিসের অধীনে শাখাটি থাকবে?</label>
                                    <select
                                        value={branchForm.data.office_id}
                                        onChange={(e) => branchForm.setData('office_id', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5 font-medium"
                                        required
                                    >
                                        {officeSelect.map(o => (
                                            <option key={o.id} value={o.id}>{o.name_bn}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">শাখা বা ডিপার্টমেন্টের নাম (বাংলা)</label>
                                    <input
                                        type="text"
                                        value={branchForm.data.name_bn}
                                        onChange={(e) => branchForm.setData('name_bn', e.target.value)}
                                        placeholder="যেমন: জরুরি বিভাগ, রেকর্ড রুম, ক্যাশ শাখা"
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">রুম নম্বর (ঐচ্ছিক)</label>
                                        <input
                                            type="text"
                                            value={branchForm.data.room_number}
                                            onChange={(e) => branchForm.setData('room_number', e.target.value)}
                                            placeholder="যেমন: ১০৪"
                                            className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">ফ্লোর / তলা (ঐচ্ছিক)</label>
                                        <input
                                            type="text"
                                            value={branchForm.data.floor}
                                            onChange={(e) => branchForm.setData('floor', e.target.value)}
                                            placeholder="যেমন: ২য় তলা"
                                            className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">ফোন নম্বর</label>
                                        <input
                                            type="text"
                                            value={branchForm.data.phone}
                                            onChange={(e) => branchForm.setData('phone', e.target.value)}
                                            placeholder="০১৭..."
                                            className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">ইমেইল</label>
                                        <input
                                            type="email"
                                            value={branchForm.data.email}
                                            onChange={(e) => branchForm.setData('email', e.target.value)}
                                            placeholder="branch@gov.bd"
                                            className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button 
                                        type="button" 
                                        onClick={() => { setActiveModal(null); setEditingBranch(null); }} 
                                        className="px-4 py-2 border rounded-xl"
                                    >
                                        বাতিল
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={branchForm.processing} 
                                        className="px-5 py-2 bg-indigo-700 text-white rounded-xl font-bold"
                                    >
                                        {activeModal === 'editBranch' ? 'আপডেট করুন' : 'শাখা সংরক্ষণ'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
