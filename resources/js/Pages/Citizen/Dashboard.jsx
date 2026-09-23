import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import ComplaintCard from '@/Components/ComplaintCard';
import StatsCard from '@/Components/StatsCard';
import { Plus, Send, CheckCircle2, Clock, Activity, Inbox, User, Bell } from 'lucide-react';

export default function CitizenDashboard({ complaints, stats, currentFilter }) {
    const handleFilterChange = (filter) => {
        router.get('/citizen', { status: filter }, { preserveState: true });
    };

    return (
        <PublicLayout>
            <Head title="আমার অভিযোগসমূহ — নাগরিক ড্যাশবোর্ড" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                            নাগরিক ড্যাশবোর্ড
                        </span>
                        <h1 className="text-2xl font-bold text-slate-900 mt-1">আমার দাখিলকৃত অভিযোগসমূহ</h1>
                        <p className="text-xs text-slate-500 mt-0.5">আপনার সকল অভিযোগের অগ্রগতি ও নিষ্পত্তির খবরাখবর এক নজরে দেখুন</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/citizen/profile"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                        >
                            <User className="w-3.5 h-3.5" />
                            প্রোফাইল
                        </Link>
                        <Link
                            href="/submit"
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            নতুন অভিযোগ
                        </Link>
                    </div>
                </div>

                {/* Stats Counters */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard title="মোট দাখিলকৃত অভিযোগ" value={stats.total} icon={Inbox} color="blue" />
                    <StatsCard title="বর্তমানে চলমান" value={stats.active} icon={Clock} color="amber" />
                    <StatsCard title="তদন্তাধীন অভিযোগ" value={stats.under_investigation} icon={Activity} color="purple" />
                    <StatsCard title="সফল সমাধান" value={stats.resolved} icon={CheckCircle2} color="emerald" />
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
                    {[
                        { key: 'all', label: 'সকল অভিযোগ' },
                        { key: 'active', label: 'চলমান অভিযোগ' },
                        { key: 'investigation_started', label: 'তদন্তাধীন' },
                        { key: 'resolved', label: 'সমাধান সম্পন্ন' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleFilterChange(tab.key)}
                            className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
                                currentFilter === tab.key
                                    ? 'bg-emerald-800 text-white shadow-xs'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Complaints List */}
                {complaints.data?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {complaints.data.map((c) => (
                            <ComplaintCard key={c.id} complaint={c} linkHref={`/citizen/complaint/${c.tracking_id}`} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                        <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-800">কোনো অভিযোগ পাওয়া যায়নি</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-6">
                            আপনার কোনো সক্রিয় বা অতীতের অভিযোগ এই তালিকায় নেই।
                        </p>
                        <Link
                            href="/submit"
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold"
                        >
                            <Plus className="w-4 h-4" />
                            নতুন অভিযোগ দাখিল করুন
                        </Link>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
