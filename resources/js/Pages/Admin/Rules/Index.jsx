import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    GitBranch, Plus, Clock, AlertTriangle, ArrowUpRight, ShieldCheck,
    Building2, MapPin, CheckCircle2, Sliders, Zap
} from 'lucide-react';

export default function RulesIndex({
    routingRules = [],
    slaRules = [],
    escalationRules = [],
    categories = [],
    organizations = [],
    offices = [],
    divisions = []
}) {
    const [activeTab, setActiveTab] = useState('routing');
    const [showRoutingModal, setShowRoutingModal] = useState(false);
    const [showSlaModal, setShowSlaModal] = useState(false);
    const [showEscalationModal, setShowEscalationModal] = useState(false);

    // Routing Rule Form
    const routingForm = useForm({
        name: '',
        category_id: '',
        subcategory_id: '',
        division_id: '',
        target_organization_id: '',
        target_office_id: '',
        priority_level: 50,
        is_active: true
    });

    // SLA Rule Form
    const slaForm = useForm({
        name: '',
        category_id: '',
        priority: 'medium',
        resolution_hours: 72,
        first_response_hours: 24,
        escalation_level_1_hours: 48,
        escalation_level_2_hours: 72,
        is_active: true
    });

    // Escalation Rule Form
    const escalationForm = useForm({
        name: '',
        trigger_event: 'sla_breached',
        breach_percentage: 100,
        escalate_to_role: 'department_admin',
        escalate_to_office_id: '',
        send_sms_alert: true,
        send_email_alert: true,
        is_active: true
    });

    const handleCreateRouting = (e) => {
        e.preventDefault();
        routingForm.post('/admin/rules/routing', {
            onSuccess: () => {
                setShowRoutingModal(false);
                routingForm.reset();
            }
        });
    };

    const handleCreateSla = (e) => {
        e.preventDefault();
        slaForm.post('/admin/rules/sla', {
            onSuccess: () => {
                setShowSlaModal(false);
                slaForm.reset();
            }
        });
    };

    const handleCreateEscalation = (e) => {
        e.preventDefault();
        escalationForm.post('/admin/rules/escalation', {
            onSuccess: () => {
                setShowEscalationModal(false);
                escalationForm.reset();
            }
        });
    };

    return (
        <AdminLayout title="রাউটিং ও এসএলএ (SLA) রুল ইঞ্জিন">
            <Head title="রাউটিং ও এসএলএ রুল ইঞ্জিন - নাগরিক অভিযোগ" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                            <Zap className="w-7 h-7 text-emerald-600" />
                            অটোমেটেড রাউটিং ও এসএলএ ইঞ্জিন
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            অভিযোগ দাখিলের পর স্বয়ংক্রিয়ভাবে সঠিক দপ্তর, কার্যালয় ও কর্মকর্তার কাছে প্রেরণ এবং সময়সীমা অতিক্রমের এসকেলেশন রুল
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {activeTab === 'routing' && (
                            <button
                                onClick={() => setShowRoutingModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
                            >
                                <Plus className="w-4 h-4" />
                                নতুন রাউটিং রুল
                            </button>
                        )}
                        {activeTab === 'sla' && (
                            <button
                                onClick={() => setShowSlaModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
                            >
                                <Plus className="w-4 h-4" />
                                নতুন এসএলএ কনফিগারেশন
                            </button>
                        )}
                        {activeTab === 'escalation' && (
                            <button
                                onClick={() => setShowEscalationModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
                            >
                                <Plus className="w-4 h-4" />
                                নতুন এসকেলেশন রুল
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('routing')}
                        className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
                            activeTab === 'routing'
                                ? 'border-emerald-600 text-emerald-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <GitBranch className="w-4 h-4" />
                        ডায়নামিক রাউটিং রুলস ({routingRules.length})
                    </button>

                    <button
                        onClick={() => setActiveTab('sla')}
                        className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
                            activeTab === 'sla'
                                ? 'border-emerald-600 text-emerald-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Clock className="w-4 h-4" />
                        এসএলএ (SLA) সময়সীমা কনফিগারেশন ({slaRules.length})
                    </button>

                    <button
                        onClick={() => setActiveTab('escalation')}
                        className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
                            activeTab === 'escalation'
                                ? 'border-emerald-600 text-emerald-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <AlertTriangle className="w-4 h-4" />
                        বিলম্বিত অভিযোগের এসকেলেশন রুলস ({escalationRules.length})
                    </button>
                </div>

                {/* TAB 1: Routing Rules */}
                {activeTab === 'routing' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                            <span>রাউটিং প্রায়োরিটি উচ্চতর মান (Higher priority) অনুযায়ী প্রথমে ম্যাচ করা হয়</span>
                            <span className="font-semibold text-emerald-700">ডিফল্ট ফলব্যাক: ক্যাটাগরির প্রাথমিক দপ্তর</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase">
                                    <tr>
                                        <th className="px-6 py-4">রুলের নাম</th>
                                        <th className="px-6 py-4">ক্যাটাগরি শর্ত</th>
                                        <th className="px-6 py-4">ভৌগোলিক পরিধি</th>
                                        <th className="px-6 py-4">গন্তব্য দপ্তর ও কার্যালয়</th>
                                        <th className="px-6 py-4">অগ্রাধিকার</th>
                                        <th className="px-6 py-4">স্ট্যাটাস</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {routingRules.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                                                কোন রাউটিং রুল সংজ্ঞায়িত নেই
                                            </td>
                                        </tr>
                                    ) : (
                                        routingRules.map((rule) => (
                                            <tr key={rule.id} className="hover:bg-slate-50/70">
                                                <td className="px-6 py-4 font-semibold text-slate-900">
                                                    {rule.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-xs">
                                                        {rule.category?.name_bn || 'সকল ক্যাটাগরি'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-600">
                                                    {rule.division?.name_bn || 'সারাদেশ'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-slate-800 font-medium text-xs">
                                                        {rule.target_organization?.name_bn || rule.target_organization?.name}
                                                    </div>
                                                    {rule.target_office && (
                                                        <div className="text-[11px] text-slate-500">
                                                            → {rule.target_office.name_bn || rule.target_office.name}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs font-semibold text-emerald-700">
                                                    {rule.priority_level}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        rule.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {rule.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 2: SLA Rules */}
                {activeTab === 'sla' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase">
                                    <tr>
                                        <th className="px-6 py-4">ক্যাটাগরি</th>
                                        <th className="px-6 py-4">অগ্রাধিকার স্তর</th>
                                        <th className="px-6 py-4">প্রথম প্রতিক্রিয়া (First Response)</th>
                                        <th className="px-6 py-4">সর্বোচ্চ নিষ্পত্তি সময় (Resolution SLA)</th>
                                        <th className="px-6 py-4">লেভেল-১ এসকেলেশন</th>
                                        <th className="px-6 py-4">লেভেল-২ এসকেলেশন</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {slaRules.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                                                কোন SLA রুল সংজ্ঞায়িত নেই
                                            </td>
                                        </tr>
                                    ) : (
                                        slaRules.map((rule) => (
                                            <tr key={rule.id} className="hover:bg-slate-50/70">
                                                <td className="px-6 py-4 font-semibold text-slate-900">
                                                    {rule.category?.name_bn || rule.category?.name || 'গ্লোবাল ডিফল্ট'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {rule.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">
                                                    {rule.first_response_hours} ঘণ্টা
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs font-bold text-emerald-700">
                                                    {rule.resolution_hours} ঘণ্টা ({Math.round(rule.resolution_hours / 24)} দিন)
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-amber-700">
                                                    {rule.escalation_level_1_hours} ঘণ্টা পর
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-red-700">
                                                    {rule.escalation_level_2_hours} ঘণ্টা পর
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: Escalation Rules */}
                {activeTab === 'escalation' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase">
                                    <tr>
                                        <th className="px-6 py-4">রুলের শিরোনাম</th>
                                        <th className="px-6 py-4">ট্রিগার ইভেন্ট</th>
                                        <th className="px-6 py-4">বিলম্বের মাত্রা</th>
                                        <th className="px-6 py-4">এসকেলেট প্রাপক (Escalate To)</th>
                                        <th className="px-6 py-4">বিজ্ঞপ্তি চ্যানেল</th>
                                        <th className="px-6 py-4">স্ট্যাটাস</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {escalationRules.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                                                কোন এসকেলেশন রুল সংজ্ঞায়িত নেই
                                            </td>
                                        </tr>
                                    ) : (
                                        escalationRules.map((rule) => (
                                            <tr key={rule.id} className="hover:bg-slate-50/70">
                                                <td className="px-6 py-4 font-semibold text-slate-900">
                                                    {rule.name}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-mono text-slate-700">
                                                    {rule.trigger_event}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs font-bold text-red-600">
                                                    {rule.breach_percentage}% SLA পার হলে
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-slate-800 text-xs capitalize">
                                                        {rule.escalate_to_role?.replace('_', ' ')}
                                                    </span>
                                                    {rule.escalate_to_office && (
                                                        <div className="text-[11px] text-slate-500">
                                                            {rule.escalate_to_office.name_bn}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-xs space-x-1">
                                                    {rule.send_sms_alert && (
                                                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">SMS</span>
                                                    )}
                                                    {rule.send_email_alert && (
                                                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">Email</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        rule.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {rule.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Create Routing Modal */}
                {showRoutingModal && (
                    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <GitBranch className="w-5 h-5 text-emerald-600" />
                                নতুন ডায়নামিক রাউটিং রুল
                            </h3>

                            <form onSubmit={handleCreateRouting} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">রুলের নাম / বিবরণ *</label>
                                    <input
                                        type="text"
                                        required
                                        value={routingForm.data.name}
                                        onChange={(e) => routingForm.setData('name', e.target.value)}
                                        placeholder="উদাঃ সিটি কর্পোরেশন এলাকার ময়লা অপসারণ রুল"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">অভিযোগের ক্যাটাগরি</label>
                                        <select
                                            value={routingForm.data.category_id}
                                            onChange={(e) => routingForm.setData('category_id', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        >
                                            <option value="">সকল ক্যাটাগরি</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name_bn || c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">বিভাগ (ঐচ্ছিক)</label>
                                        <select
                                            value={routingForm.data.division_id}
                                            onChange={(e) => routingForm.setData('division_id', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        >
                                            <option value="">সারাদেশ</option>
                                            {divisions.map(d => (
                                                <option key={d.id} value={d.id}>{d.name_bn || d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">প্রাপক দপ্তর (Target Organization) *</label>
                                    <select
                                        required
                                        value={routingForm.data.target_organization_id}
                                        onChange={(e) => routingForm.setData('target_organization_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    >
                                        <option value="">দপ্তর নির্বাচন করুন</option>
                                        {organizations.map(o => (
                                            <option key={o.id} value={o.id}>{o.name_bn || o.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">নির্দিষ্ট কার্যালয় (Target Office)</label>
                                    <select
                                        value={routingForm.data.target_office_id}
                                        onChange={(e) => routingForm.setData('target_office_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    >
                                        <option value="">স্বয়ংক্রিয় ভৌগোলিক ম্যাপিং (উপজেলা/সিটি অনুযায়ী)</option>
                                        {offices
                                            .filter(o => !routingForm.data.target_organization_id || o.organization_id == routingForm.data.target_organization_id)
                                            .map(office => (
                                                <option key={office.id} value={office.id}>{office.name_bn || office.name}</option>
                                            ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">অগ্রাধিকার স্কোর (Higher priority rules apply first)</label>
                                    <input
                                        type="number"
                                        value={routingForm.data.priority_level}
                                        onChange={(e) => routingForm.setData('priority_level', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowRoutingModal(false)}
                                        className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-xl transition"
                                    >
                                        বাতিল
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={routingForm.processing}
                                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
                                    >
                                        রুল সংরক্ষণ করুন
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
