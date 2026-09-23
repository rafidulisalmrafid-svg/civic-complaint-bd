import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Users, Plus, Search, Filter, Shield, Building2, MapPin,
    Phone, Mail, CheckCircle2, XCircle, ArrowRightLeft, UserCheck, Eye,
    Briefcase, Calendar, AlertCircle, FileText, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function OfficersIndex({
    officers = { data: [] },
    organizations = [],
    offices = [],
    districts = [],
    upazilas = [],
    filters = {}
}) {
    // Safely unwrap data whether officers is paginated or array
    const officerList = Array.isArray(officers) ? officers : (officers?.data || []);

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedOffice, setSelectedOffice] = useState(filters.office_id || '');
    const [selectedOrg, setSelectedOrg] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAccountModal, setShowAccountModal] = useState(null);
    const [showTransferModal, setShowTransferModal] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(null);

    // Create Officer Form matching OfficerController@store validation
    const createForm = useForm({
        name_bn: '',
        name_en: '',
        designation_bn: '',
        designation_en: '',
        employee_id: '',
        official_phone: '',
        official_email: '',
        organization_id: '',
        office_id: '',
        district_id: '',
        upazila_id: '',
        joining_date: new Date().toISOString().split('T')[0],
        create_login_account: false,
        password: 'password123',
    });

    // Create Account Form matching OfficerController@createLogin validation
    const accountForm = useForm({
        phone: '',
        email: '',
        password: 'password123',
        role: 'officer',
    });

    // Transfer Form matching OfficerController@transfer validation
    const transferForm = useForm({
        new_office_id: '',
        new_designation: '',
        transfer_order_no: '',
        effective_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    // Filtered officers on client side for instant feel
    const filteredOfficers = officerList.filter(officer => {
        const nameBn = officer.name_bn || '';
        const nameEn = officer.name_en || '';
        const desBn = officer.designation_bn || '';
        const empId = officer.employee_id || '';
        const term = searchTerm.toLowerCase();

        const matchesSearch = !searchTerm ||
            nameBn.toLowerCase().includes(term) ||
            nameEn.toLowerCase().includes(term) ||
            desBn.toLowerCase().includes(term) ||
            empId.toLowerCase().includes(term);

        const matchesOrg = !selectedOrg || officer.organization_id == selectedOrg;
        const matchesOffice = !selectedOffice || officer.office_id == selectedOffice;
        const matchesStatus = !selectedStatus || officer.status === selectedStatus;

        return matchesSearch && matchesOrg && matchesOffice && matchesStatus;
    });

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get('/admin/officers', {
            search: searchTerm || undefined,
            office_id: selectedOffice || undefined
        }, { preserveState: true, replace: true });
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/admin/officers', {
            preserveScroll: true,
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            }
        });
    };

    const handleCreateAccountSubmit = (e) => {
        e.preventDefault();
        if (!showAccountModal) return;
        accountForm.post(`/admin/officers/${showAccountModal.id}/create-login`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAccountModal(null);
                accountForm.reset();
            }
        });
    };

    const handleTransferSubmit = (e) => {
        e.preventDefault();
        if (!showTransferModal) return;
        transferForm.post(`/admin/officers/${showTransferModal.id}/transfer`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowTransferModal(null);
                transferForm.reset();
            }
        });
    };

    return (
        <AdminLayout title="কর্মকর্তা ডিরেক্টরি">
            <Head title="কর্মকর্তা ডিরেক্টরি ও পদায়ন - নাগরিক অভিযোগ" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                            <Users className="w-7 h-7 text-emerald-600" />
                            কর্মকর্তা ডিরেক্টরি ও পদায়ন ব্যবস্থাপনা
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            সরকারি দপ্তরসমূহের দায়িত্বপ্রাপ্ত কর্মকর্তাদের প্রোফাইল, অভিযোগ নিষ্পত্তির এখতিয়ার, পদায়ন ও পোর্টাল এক্সেস
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
                    >
                        <Plus className="w-4 h-4" />
                        নতুন কর্মকর্তা যুক্ত করুন
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-[240px]">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="কর্মকর্তার নাম, পদবী বা আইডি দিয়ে খুঁজুন..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <select
                            value={selectedOrg}
                            onChange={(e) => setSelectedOrg(e.target.value)}
                            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">সকল অধিদপ্তর / কর্তৃপক্ষ</option>
                            {organizations.map(org => (
                                <option key={org.id} value={org.id}>{org.name_bn || org.name}</option>
                            ))}
                        </select>

                        <select
                            value={selectedOffice}
                            onChange={(e) => setSelectedOffice(e.target.value)}
                            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">সকল কার্যালয় (অফিস)</option>
                            {offices
                                .filter(o => !selectedOrg || o.organization_id == selectedOrg)
                                .map(office => (
                                    <option key={office.id} value={office.id}>{office.name_bn || office.name}</option>
                                ))}
                        </select>

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">সকল স্ট্যাটাস</option>
                            <option value="active">সক্রিয় (Active)</option>
                            <option value="transferred">স্থানান্তরিত (Transferred)</option>
                            <option value="retired">অবসরপ্রাপ্ত (Retired)</option>
                        </select>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition"
                        >
                            সার্চ
                        </button>
                    </form>
                </div>

                {/* Officers Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">কর্মকর্তার নাম ও পদবী</th>
                                    <th className="px-6 py-4">দপ্তর ও নির্দিষ্ট কার্যালয়</th>
                                    <th className="px-6 py-4">যোগাযোগের তথ্য</th>
                                    <th className="px-6 py-4 text-center">অর্পিত অভিযোগ</th>
                                    <th className="px-6 py-4">পোর্টাল লগইন অবস্থা</th>
                                    <th className="px-6 py-4">স্ট্যাটাস</th>
                                    <th className="px-6 py-4 text-right">পদক্ষেপ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredOfficers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                                            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                            <p className="font-semibold text-slate-600">কোন কর্মকর্তা পাওয়া যায়নি</p>
                                            <p className="text-xs text-slate-400 mt-1">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন বা নতুন কর্মকর্তা যুক্ত করুন</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOfficers.map((officer) => (
                                        <tr key={officer.id} className="hover:bg-slate-50/70 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 text-sm">{officer.name_bn}</div>
                                                <div className="text-xs text-slate-500 font-medium">{officer.name_en}</div>
                                                <div className="text-xs text-emerald-800 font-medium mt-0.5">{officer.designation_bn}</div>
                                                {officer.employee_id && (
                                                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">আইডি: {officer.employee_id}</div>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="text-slate-800 font-semibold text-xs">
                                                    {officer.organization?.name_bn || 'দপ্তর নির্ধারিত নেই'}
                                                </div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>{officer.office?.name_bn || 'নির্দিষ্ট অফিস নেই'}</span>
                                                </div>
                                                {(officer.district || officer.upazila) && (
                                                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span>{officer.upazila?.name_bn ? `${officer.upazila.name_bn}, ` : ''}{officer.district?.name_bn}</span>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-xs space-y-1">
                                                {officer.official_phone && (
                                                    <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                        {officer.official_phone}
                                                    </div>
                                                )}
                                                {officer.official_email && (
                                                    <div className="flex items-center gap-1.5 text-slate-600">
                                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                        {officer.official_email}
                                                    </div>
                                                )}
                                                {!officer.official_phone && !officer.official_email && (
                                                    <span className="text-slate-400 italic">যোগাযোগ নেই</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                                                    (officer.assigned_complaints_count || 0) > 0
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {officer.assigned_complaints_count || 0} টি
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                {officer.user ? (
                                                    <div>
                                                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                                                            <UserCheck className="w-4 h-4 text-emerald-600" />
                                                            লগইন সক্রিয়
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 font-mono capitalize mt-0.5">
                                                            রোল: {officer.user.role}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setShowAccountModal(officer);
                                                            accountForm.setData({
                                                                phone: officer.official_phone || '',
                                                                email: officer.official_email || '',
                                                                password: 'password123',
                                                                role: 'officer',
                                                            });
                                                        }}
                                                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold underline bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition"
                                                    >
                                                        + লগইন তৈরি করুন
                                                    </button>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    officer.status === 'active'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : officer.status === 'transferred'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {officer.status === 'active' ? 'কর্মরত' : officer.status === 'transferred' ? 'স্থানান্তরিত' : officer.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => setShowDetailsModal(officer)}
                                                        title="বিস্তারিত তথ্য"
                                                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setShowTransferModal(officer);
                                                            transferForm.setData({
                                                                new_office_id: '',
                                                                new_designation: officer.designation_bn || '',
                                                                transfer_order_no: '',
                                                                effective_date: new Date().toISOString().split('T')[0],
                                                                notes: '',
                                                            });
                                                        }}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition border border-slate-200"
                                                    >
                                                        <ArrowRightLeft className="w-3.5 h-3.5" />
                                                        বদলি
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {officers.links && officers.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="text-xs text-slate-500">
                                মোট {officers.total || officerList.length} জন কর্মকর্তার মধ্যে {officers.from || 1}-{officers.to || officerList.length} দেখানো হচ্ছে
                            </div>
                            <div className="flex gap-1">
                                {officers.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        disabled={!link.url}
                                        className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                                            link.active
                                                ? 'bg-emerald-600 text-white font-bold'
                                                : link.url
                                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                : 'text-slate-300 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Create Officer Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-emerald-600" />
                                    নতুন কর্মকর্তা প্রোফাইল যুক্ত করুন
                                </h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-slate-400 hover:text-slate-600 p-1"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">কর্মকর্তার নাম (বাংলা) *</label>
                                        <input
                                            type="text"
                                            required
                                            value={createForm.data.name_bn}
                                            onChange={(e) => createForm.setData('name_bn', e.target.value)}
                                            placeholder="উদাঃ ড. মোহাম্মদ আশরাফুল আলম"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        />
                                        {createForm.errors.name_bn && (
                                            <p className="text-red-500 text-xs mt-0.5">{createForm.errors.name_bn}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Name (English) *</label>
                                        <input
                                            type="text"
                                            required
                                            value={createForm.data.name_en}
                                            onChange={(e) => createForm.setData('name_en', e.target.value)}
                                            placeholder="Dr. Mohammad Ashraful Alam"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        />
                                        {createForm.errors.name_en && (
                                            <p className="text-red-500 text-xs mt-0.5">{createForm.errors.name_en}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">পদবী (বাংলা) *</label>
                                        <input
                                            type="text"
                                            required
                                            value={createForm.data.designation_bn}
                                            onChange={(e) => createForm.setData('designation_bn', e.target.value)}
                                            placeholder="উদাঃ নির্বাহী প্রকৌশলী"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        />
                                        {createForm.errors.designation_bn && (
                                            <p className="text-red-500 text-xs mt-0.5">{createForm.errors.designation_bn}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Designation (English)</label>
                                        <input
                                            type="text"
                                            value={createForm.data.designation_en}
                                            onChange={(e) => createForm.setData('designation_en', e.target.value)}
                                            placeholder="Executive Engineer"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">দপ্তর / সংস্থা *</label>
                                        <select
                                            required
                                            value={createForm.data.organization_id}
                                            onChange={(e) => createForm.setData('organization_id', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        >
                                            <option value="">দপ্তর নির্বাচন করুন</option>
                                            {organizations.map(org => (
                                                <option key={org.id} value={org.id}>{org.name_bn || org.name}</option>
                                            ))}
                                        </select>
                                        {createForm.errors.organization_id && (
                                            <p className="text-red-500 text-xs mt-0.5">{createForm.errors.organization_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">নির্দিষ্ট কার্যালয় (অফিস) *</label>
                                        <select
                                            required
                                            value={createForm.data.office_id}
                                            onChange={(e) => createForm.setData('office_id', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        >
                                            <option value="">কার্যালয় নির্বাচন করুন</option>
                                            {offices
                                                .filter(o => !createForm.data.organization_id || o.organization_id == createForm.data.organization_id)
                                                .map(office => (
                                                    <option key={office.id} value={office.id}>{office.name_bn || office.name}</option>
                                                ))}
                                        </select>
                                        {createForm.errors.office_id && (
                                            <p className="text-red-500 text-xs mt-0.5">{createForm.errors.office_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">অফিসিয়াল ফোন</label>
                                        <input
                                            type="text"
                                            value={createForm.data.official_phone}
                                            onChange={(e) => createForm.setData('official_phone', e.target.value)}
                                            placeholder="017xxxxxxxx"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">অফিসিয়াল ইমেইল</label>
                                        <input
                                            type="email"
                                            value={createForm.data.official_email}
                                            onChange={(e) => createForm.setData('official_email', e.target.value)}
                                            placeholder="officer@domain.gov.bd"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">পরিচিতি নম্বর (Gov ID)</label>
                                        <input
                                            type="text"
                                            value={createForm.data.employee_id}
                                            onChange={(e) => createForm.setData('employee_id', e.target.value)}
                                            placeholder="BCS-31-0192"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">যোগদানের তারিখ</label>
                                        <input
                                            type="date"
                                            value={createForm.data.joining_date}
                                            onChange={(e) => createForm.setData('joining_date', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Option to Create Login Account */}
                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-emerald-950">
                                        <input
                                            type="checkbox"
                                            checked={createForm.data.create_login_account}
                                            onChange={(e) => createForm.setData('create_login_account', e.target.checked)}
                                            className="w-4 h-4 text-emerald-600 rounded"
                                        />
                                        একই সাথে পোর্টালে অফিসার লগইন একাউন্ট সক্রিয় করুন
                                    </label>

                                    {createForm.data.create_login_account && (
                                        <div className="mt-3">
                                            <label className="block text-xs font-bold text-emerald-900 mb-1">প্রাথমিক পাসওয়ার্ড *</label>
                                            <input
                                                type="text"
                                                value={createForm.data.password}
                                                onChange={(e) => createForm.setData('password', e.target.value)}
                                                placeholder="পাসওয়ার্ড লিখুন"
                                                className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-mono"
                                            />
                                            <p className="text-[11px] text-emerald-700 mt-1">
                                                কর্মকর্তার ফোন নম্বর ব্যবহার করে লগইন করবেন। প্রাথমিক পাসওয়ার্ড উপরে উল্লেখ করুন।
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl transition"
                                    >
                                        বাতিল
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createForm.processing}
                                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                                    >
                                        সংরক্ষণ করুন
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Create Login Account Modal */}
                {showAccountModal && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-emerald-600" />
                                পোর্টাল লগইন সক্রিয়করণ
                            </h3>
                            <p className="text-xs text-slate-600 mb-4">
                                কর্মকর্তা: <span className="font-bold text-slate-900">{showAccountModal.name_bn}</span> ({showAccountModal.designation_bn})
                            </p>

                            <form onSubmit={handleCreateAccountSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">লগইন মোবাইল নম্বর *</label>
                                    <input
                                        type="text"
                                        required
                                        value={accountForm.data.phone}
                                        onChange={(e) => accountForm.setData('phone', e.target.value)}
                                        placeholder="017xxxxxxxx"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                                    />
                                    {accountForm.errors.phone && (
                                        <p className="text-red-500 text-xs mt-0.5">{accountForm.errors.phone}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">অফিসিয়াল ইমেইল (ঐচ্ছিক)</label>
                                    <input
                                        type="email"
                                        value={accountForm.data.email}
                                        onChange={(e) => accountForm.setData('email', e.target.value)}
                                        placeholder="officer@gov.bd"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                    {accountForm.errors.email && (
                                        <p className="text-red-500 text-xs mt-0.5">{accountForm.errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">অ্যাক্সেস রোল *</label>
                                    <select
                                        value={accountForm.data.role}
                                        onChange={(e) => accountForm.setData('role', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                                    >
                                        <option value="officer">Officer (অভিযোগ নিষ্পত্তিকারী কর্মকর্তা)</option>
                                        <option value="area_officer">Area Officer (এলাকা কর্মকর্তা)</option>
                                        <option value="dept_admin">Department Admin (দপ্তর নিয়ন্ত্রক)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">প্রাথমিক পাসওয়ার্ড *</label>
                                    <input
                                        type="text"
                                        required
                                        value={accountForm.data.password}
                                        onChange={(e) => accountForm.setData('password', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowAccountModal(null)}
                                        className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl transition"
                                    >
                                        বাতিল
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={accountForm.processing}
                                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                                    >
                                        একাউন্ট তৈরি করুন
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Transfer Modal */}
                {showTransferModal && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
                                কর্মকর্তা বদলি ও নতুন পদায়ন
                            </h3>
                            <p className="text-xs text-slate-600 mb-4">
                                কর্মকর্তা: <span className="font-bold text-slate-900">{showTransferModal.name_bn}</span> | বর্তমান কার্যালয়: <span className="font-medium text-emerald-700">{showTransferModal.office?.name_bn}</span>
                            </p>

                            <form onSubmit={handleTransferSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">নতুন পদায়ন কার্যালয় (New Office) *</label>
                                    <select
                                        required
                                        value={transferForm.data.new_office_id}
                                        onChange={(e) => transferForm.setData('new_office_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    >
                                        <option value="">কার্যালয় নির্বাচন করুন</option>
                                        {offices
                                            .filter(o => o.id !== showTransferModal.office_id)
                                            .map(o => (
                                                <option key={o.id} value={o.id}>{o.name_bn || o.name}</option>
                                            ))}
                                    </select>
                                    {transferForm.errors.new_office_id && (
                                        <p className="text-red-500 text-xs mt-0.5">{transferForm.errors.new_office_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">নতুন পদবী (পরিবর্তন হলে)</label>
                                    <input
                                        type="text"
                                        value={transferForm.data.new_designation}
                                        onChange={(e) => transferForm.setData('new_designation', e.target.value)}
                                        placeholder={showTransferModal.designation_bn}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">বদলি আদেশ / স্মারক নং</label>
                                        <input
                                            type="text"
                                            placeholder="স্মারক নং-০৫.০০.০০০"
                                            value={transferForm.data.transfer_order_no}
                                            onChange={(e) => transferForm.setData('transfer_order_no', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">কার্যকরী তারিখ *</label>
                                        <input
                                            type="date"
                                            required
                                            value={transferForm.data.effective_date}
                                            onChange={(e) => transferForm.setData('effective_date', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">মন্তব্য ও দাপ্তরিক নোট</label>
                                    <input
                                        type="text"
                                        placeholder="উদাঃ জনস্বার্থে তাৎক্ষণিক কার্যকর হবে"
                                        value={transferForm.data.notes}
                                        onChange={(e) => transferForm.setData('notes', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowTransferModal(null)}
                                        className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl transition"
                                    >
                                        বাতিল
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={transferForm.processing}
                                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                                    >
                                        বদলি কার্যকর করুন
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Details Modal */}
                {showDetailsModal && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Briefcase className="w-5 h-5 text-emerald-600" />
                                কর্মকর্তা প্রোফাইল বিবরণ
                            </h3>

                            <div className="space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                                    <div>
                                        <span className="text-xs text-slate-400 block">নাম (বাংলা)</span>
                                        <span className="font-bold text-slate-900">{showDetailsModal.name_bn}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 block">Name (EN)</span>
                                        <span className="font-medium text-slate-800">{showDetailsModal.name_en}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-xs text-slate-400 block">পদবী</span>
                                        <span className="font-semibold text-slate-800">{showDetailsModal.designation_bn}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 block">আইডি নম্বর</span>
                                        <span className="font-mono text-slate-700">{showDetailsModal.employee_id || 'প্রযোজ্য নয়'}</span>
                                    </div>
                                </div>

                                <div className="p-3 border border-slate-100 rounded-xl space-y-1">
                                    <div className="text-xs text-slate-400">বর্তমান দপ্তর ও কার্যালয়</div>
                                    <div className="font-bold text-slate-900">{showDetailsModal.organization?.name_bn}</div>
                                    <div className="text-xs text-slate-600 flex items-center gap-1">
                                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                        {showDetailsModal.office?.name_bn}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-xs text-slate-400 block">ফোন নম্বর</span>
                                        <span className="font-mono text-slate-800">{showDetailsModal.official_phone || 'নেই'}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 block">ইমেইল</span>
                                        <span className="text-slate-800">{showDetailsModal.official_email || 'নেই'}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-xs text-slate-400 block">অর্পিত অভিযোগ</span>
                                        <span className="font-bold text-emerald-700">{showDetailsModal.assigned_complaints_count || 0} টি</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 block">স্ট্যাটাস</span>
                                        <span className="capitalize font-semibold text-slate-800">{showDetailsModal.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 mt-4 border-t border-slate-100">
                                <button
                                    onClick={() => setShowDetailsModal(null)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                                >
                                    বন্ধ করুন
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
