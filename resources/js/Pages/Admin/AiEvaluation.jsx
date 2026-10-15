import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    BrainCircuit,
    Cpu,
    ShieldAlert,
    CheckCircle2,
    TrendingUp,
    Zap,
    Scale,
    Shield,
    Users,
    FileCheck,
    Database,
    Clock,
    Sparkles,
    AlertCircle
} from 'lucide-react';

export default function AiEvaluation({ metrics }) {
    return (
        <AdminLayout>
            <Head title="AI পারফরম্যান্স ও ইভ্যালুয়েশন ড্যাশবোর্ড" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-violet-50 text-violet-700 rounded-2xl">
                            <BrainCircuit className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">AI মডেল পারফরম্যান্স ও মূল্যায়ন</h1>
                            <p className="text-sm text-slate-500">
                                Human-Supervised Feedback System & Conflict-of-Interest Guard Telemetry
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            মডেল স্ট্যাটাস: প্রোডাকশন রেডি (Active)
                        </span>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-500 uppercase">ক্যাটাগরি শনাক্তকরণ নির্ভুলতা</span>
                            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="w-4 h-4" /></span>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-900">{metrics.accuracy_rate}%</div>
                        <div className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" /> +2.4% বিগত মাসের তুলনায়
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-500 uppercase">রাউটিং প্রিসিশন (Routing)</span>
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Zap className="w-4 h-4" /></span>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-900">{metrics.routing_precision}%</div>
                        <div className="text-xs text-slate-500 mt-2 font-medium">
                            যাচাইকৃত প্রতিষ্ঠান ডিরেক্টরি অনুযায়ী
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-500 uppercase">স্বার্থের সংঘাত রোধ (Conflict Guard)</span>
                            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Scale className="w-4 h-4" /></span>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-900">{metrics.conflicts_prevented} টি</div>
                        <div className="text-xs text-amber-600 mt-2 font-medium">
                            অভিযুক্ত কর্মকর্তাকে তদন্তভার থেকে স্বয়ংক্রিয় অব্যাহতি
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-500 uppercase">গড় খসড়া প্রস্তুতি সময়</span>
                            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Clock className="w-4 h-4" /></span>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-900">{metrics.avg_drafting_seconds} সেকেন্ড</div>
                        <div className="text-xs text-slate-500 mt-2 font-medium">
                            রিয়েলটাইম এনএলপি সিন্থেসিস
                        </div>
                    </div>
                </div>

                {/* Architecture & Guardrails Spec */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-indigo-600" />
                            সিস্টেম ও প্রম্পট কনফিগারেশন
                        </h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500">এনএলপি ইঞ্জিন:</span>
                                <span className="font-semibold text-slate-800">{metrics.model_name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500">সক্রিয় প্রম্পট ভার্সন:</span>
                                <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
                                    {metrics.prompt_version}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500">ভাষা সমর্থন:</span>
                                <span className="font-semibold text-slate-800">বাংলা, Banglish, English</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500">মানবিক তত্ত্বাবধানে ফিডব্যাক:</span>
                                <span className="font-semibold text-slate-800">{metrics.human_supervised_feedback_count} টি কেস পর্যালোচিত</span>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-2 border border-slate-200">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                <Shield className="w-4 h-4 text-emerald-600" />
                                সংবেদনশীল ডেটা সুরক্ষা নীতি:
                            </div>
                            <p>
                                প্রশিক্ষণের জন্য নাগরিকের এনআইডি বা ব্যক্তিগত যোগাযোগ তথ্য সরাসরি ব্যবহৃত হয় না। 
                                সিস্টেম সম্পূর্ণ De-identified অ্যানালিটিক্স ব্যবহার করে।
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Scale className="w-5 h-5 text-amber-600" />
                            কনফ্লিক্ট-অব-ইন্টারেস্ট ও রাউটিং গাইডলাইন
                        </h2>

                        <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
                                <h3 className="font-bold text-amber-900 mb-1">১. অভিযুক্ত কর্মকর্তা ব্লকার রুল:</h3>
                                <p>
                                    নাগরিক যদি সুনির্দিষ্ট কোনো কর্মকর্তার নাম উল্লেখ করেন, সিস্টেম সেই কর্মকর্তাকে স্বয়ংক্রিয়ভাবে বাদ দিয়ে 
                                    তাঁর দপ্তর প্রধান বা জেলা অভিযোগ কর্মকর্তার কাছে তদন্তের নথি রাউট করে।
                                </p>
                            </div>

                            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                                <h3 className="font-bold text-blue-900 mb-1">২. অনুমানমুক্ত রাউটিং নীতি:</h3>
                                <p>
                                    AI কোনো দপ্তর বা কর্মকর্তার নাম অনুমান (hallucinate) করে না। ডাটাবেজে ভেরিফাইড প্রতিষ্ঠান ডিরেক্টরি 
                                    অনুযায়ী সর্বোচ্চ প্রাসঙ্গিক অফিস নির্ধারণ করে।
                                </p>
                            </div>

                            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                                <h3 className="font-bold text-emerald-900 mb-1">৩. খসড়া অনুমোদন নীতি:</h3>
                                <p>
                                    AI কেবল প্রাথমিক খসড়া তৈরি করে। নাগরিকের সুস্পষ্ট সম্মতি ও চূড়ান্ত অনুমোদন ছাড়া 
                                    কোনো অভিযোগ প্রাতিষ্ঠানিক সিস্টেমে দাখিল হয় না।
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
