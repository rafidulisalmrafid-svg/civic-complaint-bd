import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatsCard from '@/Components/StatsCard';
import { 
    Inbox, 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    ShieldAlert, 
    TrendingUp, 
    Building2, 
    MapPin, 
    Sliders, 
    Users, 
    History,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';

export default function AdminDashboard({ metrics, monthlyTrend, categoriesData, districtsData, organizationsData, recentAudits }) {
    const maxMonthly = Math.max(...monthlyTrend.map(m => Math.max(m.submitted, m.resolved, 1)));

    return (
        <AdminLayout
            title="কেন্দ্রীয় প্রশাসনিক ড্যাশবোর্ড ও বিশ্লেষণ"
            subtitle="বাংলাদেশ নাগরিক সেবা ও অভিযোগ প্রতিকার প্ল্যাটফর্মের সার্বিক চিত্র"
        >
            <Head title="অ্যাডমিন ড্যাশবোর্ড — নাগরিক সেবা" />

            <div className="space-y-8">
                {/* 1. Executive Top Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatsCard title="মোট অভিযোগ" value={metrics.total} icon={Inbox} color="blue" subtitle="সর্বমোট দাখিলকৃত" />
                    <StatsCard title="তদন্তাধীন" value={metrics.investigating} icon={Clock} color="amber" subtitle="মাঠ পর্যায়ে চলমান" />
                    <StatsCard title="ওভারডিউ" value={metrics.overdue} icon={AlertTriangle} color="red" subtitle="এসএলএ সময়সীমা পার" />
                    <StatsCard title="নিষ্পত্তি সম্পন্ন" value={metrics.resolved} icon={CheckCircle2} color="emerald" subtitle={`নিষ্পত্তি হার: ${metrics.resolutionRate}%`} />
                </div>

                {/* 2. Quick Actions Bar */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                        দ্রুত প্রশাসনিক পদক্ষেপ (Quick Actions)
                    </h3>
                    <div className="flex flex-wrap gap-2.5 text-xs font-semibold">
                        <Link href="/admin/geography?tab=wards" className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-800 transition-colors">
                            + নতুন ওয়ার্ড তৈরি
                        </Link>
                        <Link href="/admin/geography?tab=upazilas" className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-800 transition-colors">
                            + নতুন উপজেলা
                        </Link>
                        <Link href="/admin/organizations" className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-800 transition-colors">
                            + নতুন সরকারি দপ্তর/অফিস
                        </Link>
                        <Link href="/admin/officers" className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-800 transition-colors">
                            + নতুন কর্মকর্তা অন্তর্ভুক্তি
                        </Link>
                        <Link href="/admin/categories" className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-800 transition-colors">
                            + নতুন অভিযোগের খাত ও ফর্ম ফিল্ড
                        </Link>
                        <Link href="/admin/rules" className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-800 transition-colors">
                            + নতুন রাউটিং রুল
                        </Link>
                    </div>
                </div>

                {/* 3. Charts & Distributions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly Trend SVG Chart (2 Cols) */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">গত ৬ মাসের অভিযোগ ও নিষ্পত্তি ট্রেন্ড</h3>
                                <p className="text-xs text-slate-400">মাসিক দাখিল বনাম সফল সমাধানের পরিসংখ্যান</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-semibold">
                                <span className="flex items-center gap-1.5 text-slate-700">
                                    <span className="w-3 h-3 rounded-xs bg-slate-800"></span> দাখিলকৃত
                                </span>
                                <span className="flex items-center gap-1.5 text-emerald-700">
                                    <span className="w-3 h-3 rounded-xs bg-emerald-600"></span> নিষ্পন্ন
                                </span>
                            </div>
                        </div>

                        {/* Responsive SVG Bar Chart */}
                        <div className="h-56 flex items-end justify-between gap-4 pt-6 px-2">
                            {monthlyTrend.map((m, idx) => {
                                const submittedHeight = Math.round((m.submitted / maxMonthly) * 100);
                                const resolvedHeight = Math.round((m.resolved / maxMonthly) * 100);

                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                        <div className="w-full flex items-end justify-center gap-1 h-44">
                                            {/* Submitted Bar */}
                                            <div
                                                style={{ height: `${Math.max(submittedHeight, 8)}%` }}
                                                className="w-1/2 max-w-[20px] bg-slate-800 rounded-t-sm transition-all group-hover:bg-slate-900 relative"
                                                title={`দাখিল: ${m.submitted}`}
                                            >
                                                <span className="opacity-0 group-hover:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-slate-800 bg-white px-1 shadow-xs rounded">
                                                    {m.submitted}
                                                </span>
                                            </div>

                                            {/* Resolved Bar */}
                                            <div
                                                style={{ height: `${Math.max(resolvedHeight, 8)}%` }}
                                                className="w-1/2 max-w-[20px] bg-emerald-600 rounded-t-sm transition-all group-hover:bg-emerald-700 relative"
                                                title={`নিষ্পন্ন: ${m.resolved}`}
                                            >
                                                <span className="opacity-0 group-hover:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-emerald-700 bg-white px-1 shadow-xs rounded">
                                                    {m.resolved}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-[11px] text-slate-500 font-semibold">{m.month}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Category Distribution (1 Col) */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="text-base font-bold text-slate-900">খাতভিত্তিক বিভাজন</h3>
                            <Link href="/admin/categories" className="text-xs text-emerald-700 font-semibold hover:underline">
                                সব দেখুন
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {categoriesData.map((cat, idx) => (
                                <div key={idx} className="space-y-1 text-xs">
                                    <div className="flex items-center justify-between font-semibold">
                                        <span className="text-slate-800">{cat.name}</span>
                                        <span className="font-mono text-slate-500">{cat.count} টি</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            style={{ width: `${Math.min(100, Math.max(10, (cat.count / Math.max(metrics.total, 1)) * 100))}%` }}
                                            className="bg-emerald-600 h-full rounded-full"
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. Performance & District Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Organization Performance Table */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="text-base font-bold text-slate-900">দপ্তরসমূহের সমাধান দক্ষতা</h3>
                            <Link href="/admin/organizations" className="text-xs text-emerald-700 font-semibold hover:underline">
                                দপ্তর তালিকা
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="text-slate-400 font-bold border-b border-slate-100">
                                        <th className="pb-2">দপ্তর / সংস্থা</th>
                                        <th className="pb-2">মোট অভিযোগ</th>
                                        <th className="pb-2">নিষ্পন্ন</th>
                                        <th className="pb-2 text-right">দক্ষতা হার</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {organizationsData.map((org, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="py-2.5 font-semibold text-slate-800">{org.name}</td>
                                            <td className="py-2.5 font-mono text-slate-600">{org.total}</td>
                                            <td className="py-2.5 font-mono text-emerald-700 font-semibold">{org.resolved}</td>
                                            <td className="py-2.5 text-right font-mono font-bold text-emerald-800">{org.rate}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* District Focus Matrix */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="text-base font-bold text-slate-900">পাইলট জেলাভিত্তিক অবস্থা</h3>
                            <Link href="/admin/map" className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> মানচিত্রে দেখুন
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {districtsData.map((d, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-emerald-700" />
                                        <span className="font-bold text-slate-800">{d.name} জেলা</span>
                                    </div>
                                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-white text-emerald-800 border border-slate-200">
                                        {d.count} টি অভিযোগ
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 5. Recent System Audit Feed */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <History className="w-4 h-4 text-slate-600" />
                            সাম্প্রতিক প্রশাসনিক কার্যক্রম (Audit Activity Feed)
                        </h3>
                        <Link href="/admin/audit" className="text-xs text-emerald-700 font-semibold hover:underline">
                            সম্পূর্ণ অডিট লগ
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100 text-xs">
                        {recentAudits.map((log) => (
                            <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <span className="font-bold text-slate-800">{log.user_name}</span>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-slate-600 font-mono text-[11px]">{log.event_action}</span>
                                </div>
                                <span className="text-slate-400 font-mono text-[11px]">
                                    {new Date(log.created_at).toLocaleTimeString('bn-BD')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
