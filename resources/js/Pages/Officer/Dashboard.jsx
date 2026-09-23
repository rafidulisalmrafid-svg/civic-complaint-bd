import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import StatusBadge from '@/Components/StatusBadge';
import PriorityBadge from '@/Components/PriorityBadge';
import StatsCard from '@/Components/StatsCard';
import { 
    Inbox, 
    Clock, 
    AlertTriangle, 
    CheckCircle2, 
    Search, 
    Filter, 
    ChevronRight, 
    Building2, 
    MapPin, 
    UserCheck, 
    FileText 
} from 'lucide-react';

export default function OfficerDashboard({ complaints, stats, currentTab, filters, officerProfile }) {
    const handleTabChange = (tab) => {
        router.get('/officer', { ...filters, tab }, { preserveState: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const search = e.target.search.value;
        router.get('/officer', { ...filters, search }, { preserveState: true });
    };

    return (
        <PublicLayout>
            <Head title="কর্মকর্তা ড্যাশবোর্ড — নাগরিক সেবা পোর্টাল" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Officer Profile Banner */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                    <div className="space-y-1">
                        <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                            দায়িত্বপ্রাপ্ত কর্মকর্তা কিউ (Queue)
                        </span>
                        <h1 className="text-xl sm:text-2xl font-bold">{officerProfile?.name_bn || 'সরকারি কর্মকর্তা'}</h1>
                        <p className="text-xs text-slate-400">
                            {officerProfile?.designation_bn} • {officerProfile?.office_name}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700">
                            পাইলট অঞ্চল: বরিশাল ও কুমিল্লা
                        </span>
                    </div>
                </div>

                {/* Queue Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <button onClick={() => handleTabChange('assigned')} className="text-left">
                        <StatsCard title="অ্যাসাইনকৃত" value={stats.assigned} icon={UserCheck} color="blue" />
                    </button>
                    <button onClick={() => handleTabChange('office')} className="text-left">
                        <StatsCard title="অফিস কিউ" value={stats.office} icon={Building2} color="purple" />
                    </button>
                    <button onClick={() => handleTabChange('investigating')} className="text-left">
                        <StatsCard title="তদন্ত চলমান" value={stats.investigating} icon={Clock} color="amber" />
                    </button>
                    <button onClick={() => handleTabChange('overdue')} className="text-left">
                        <StatsCard title="ওভারডিউ" value={stats.overdue} icon={AlertTriangle} color="red" />
                    </button>
                    <button onClick={() => handleTabChange('resolved')} className="text-left">
                        <StatsCard title="নিষ্পত্তি সম্পন্ন" value={stats.resolved} icon={CheckCircle2} color="emerald" />
                    </button>
                </div>

                {/* Filters & Queue Tabs */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    {/* Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 text-xs font-semibold">
                        {[
                            { key: 'assigned', label: 'আমার তালিকা' },
                            { key: 'office', label: 'অফিস ইনবক্স' },
                            { key: 'investigating', label: 'তদন্ত চলমান' },
                            { key: 'overdue', label: 'ওভারডিউ সতর্কতা' },
                            { key: 'resolved', label: 'নিষ্পন্ন তালিকা' },
                        ].map((t) => (
                            <button
                                key={t.key}
                                onClick={() => handleTabChange(t.key)}
                                className={`px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                                    currentTab === t.key
                                        ? 'bg-emerald-800 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                name="search"
                                defaultValue={filters.search || ''}
                                placeholder="আইডি বা শিরোনাম খুঁজুন..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:bg-white focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-3.5 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors"
                        >
                            খুঁজুন
                        </button>
                    </form>
                </div>

                {/* Complaints Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    {complaints.data?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                                    <tr>
                                        <th className="py-3.5 px-4">ট্র্যাকিং নম্বর</th>
                                        <th className="py-3.5 px-4">অভিযোগের শিরোনাম ও খাত</th>
                                        <th className="py-3.5 px-4">স্থান / এলাকা</th>
                                        <th className="py-3.5 px-4">অগ্রাধিকার</th>
                                        <th className="py-3.5 px-4">বর্তমান অবস্থা</th>
                                        <th className="py-3.5 px-4">এসএলএ সময়সীমা</th>
                                        <th className="py-3.5 px-4 text-right">পদক্ষেপ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {complaints.data.map((c) => (
                                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                                                {c.tracking_id}
                                            </td>
                                            <td className="py-3.5 px-4 max-w-xs">
                                                <p className="font-semibold text-slate-900 truncate">{c.title}</p>
                                                <p className="text-[11px] text-emerald-700">{c.category?.name_bn}</p>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <p className="text-slate-800">{c.upazila?.name_bn || c.district?.name_bn}</p>
                                                <p className="text-[11px] text-slate-400">{c.ward?.name_bn || c.local_government?.name_bn}</p>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <PriorityBadge priority={c.priority} />
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <StatusBadge status={c.current_status} />
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-[11px]">
                                                {c.due_at ? new Date(c.due_at).toLocaleDateString('bn-BD') : '—'}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <Link
                                                    href={`/officer/complaint/${c.id}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 transition-colors"
                                                >
                                                    <span>ব্যবস্থা নিন</span>
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-400 text-xs">
                            <Inbox className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                            বর্তমানে এই তালিকায় কোনো অভিযোগ নেই
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
