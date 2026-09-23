import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
    Send, 
    Search, 
    CheckCircle2, 
    Clock, 
    ShieldCheck, 
    Activity, 
    MapPin, 
    Building2, 
    Zap, 
    Leaf, 
    HeartHandshake, 
    Scale, 
    Truck, 
    HelpCircle,
    ArrowRight,
    Sparkles,
    AlertCircle
} from 'lucide-react';

const iconMap = {
    activity: Activity,
    'map-pin': MapPin,
    building: Building2,
    zap: Zap,
    leaf: Leaf,
    'heart-handshake': HeartHandshake,
    scale: Scale,
    truck: Truck,
    'help-circle': HelpCircle,
};

export default function Home({ stats, categories, pilotDistricts, recentResolved }) {
    const [trackingCode, setTrackingCode] = useState('');

    const handleTrackSubmit = (e) => {
        e.preventDefault();
        if (trackingCode.trim()) {
            router.get(`/track?id=${encodeURIComponent(trackingCode.trim())}`);
        }
    };

    return (
        <PublicLayout>
            <Head title="নাগরিক সেবা ও অভিযোগ প্রতিকার প্ল্যাটফর্ম — বাংলাদেশ" />

            {/* 1. Hero Section */}
            <section className="relative bg-radial from-[#ECFDF5] via-[#F8FAFC] to-[#F1F5F9] pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        {/* Pilot Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                            পাইলট পর্যায়: বরিশাল ও কুমিল্লা বিভাগীয় অঞ্চল
                        </div>

                        {/* Hero Title */}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
                            আপনার অভিযোগ, <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy decoration-2">আমাদের দায়িত্ব</span>
                        </h1>

                        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                            সরকারি দপ্তর বা জনসেবা প্রাপ্তিতে কোনো হয়রানি বা বিলম্ব হলে সহজে অনলাইনে অভিযোগ জানান। আপনার অভিযোগ পৌঁছাবে সরাসরি দায়িত্বশীল কর্মকর্তার টেবিলে।
                        </p>

                        {/* Core Dual Action CTAs */}
                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                href="/submit"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all active:scale-95"
                            >
                                <Send className="w-5 h-5" />
                                <span>অভিযোগ দাখিল করুন</span>
                            </Link>

                            <Link
                                href="/track"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-300 shadow-xs hover:shadow-md transition-all"
                            >
                                <Search className="w-5 h-5 text-emerald-700" />
                                <span>অভিযোগ ট্র্যাক করুন</span>
                            </Link>
                        </div>

                        {/* Direct Tracking Inline Input */}
                        <div className="pt-6 max-w-lg mx-auto">
                            <form onSubmit={handleTrackSubmit} className="relative flex items-center shadow-md rounded-2xl bg-white p-1.5 border border-slate-200">
                                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="আপনার অভিযোগ ট্র্যাকিং আইডি লিখুন (যেমন: CT-BAR-2026-000101)..."
                                    value={trackingCode}
                                    onChange={(e) => setTrackingCode(e.target.value)}
                                    className="w-full border-0 focus:ring-0 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 px-3 py-2 bg-transparent"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-slate-900 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0"
                                >
                                    ট্র্যাক করুন
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Real Database-Driven Statistics Bar */}
            <section className="bg-white py-10 border-b border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-3xl font-extrabold text-slate-900 font-mono">{stats.total}</p>
                            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">মোট অভিযোগ দাখিল</p>
                        </div>
                        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                            <p className="text-3xl font-extrabold text-emerald-700 font-mono">{stats.resolved}</p>
                            <p className="text-xs font-semibold text-emerald-800 mt-1 uppercase tracking-wider">সফল সমাধান সম্পন্ন</p>
                        </div>
                        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                            <p className="text-3xl font-extrabold text-amber-700 font-mono">{stats.investigating}</p>
                            <p className="text-xs font-semibold text-amber-800 mt-1 uppercase tracking-wider">তদন্ত ও ব্যবস্থা চলমান</p>
                        </div>
                        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
                            <p className="text-3xl font-extrabold text-blue-700 font-mono">{stats.resolutionRate}%</p>
                            <p className="text-xs font-semibold text-blue-800 mt-1 uppercase tracking-wider">গড় নিষ্পত্তি হার</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. The 4-Step Visual Workflow Flow */}
            <section className="py-16 bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-700">সহজ ও স্বচ্ছ প্রক্রিয়া</h2>
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                            অভিযোগ দাখিল থেকে সমাধান পর্যন্ত চারটি ধাপ
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                        {/* Step 1 */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative">
                            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center mb-4">
                                ১
                            </span>
                            <h4 className="font-bold text-base text-slate-900 mb-2">অভিযোগ দাখিল</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                ক্যাটাগরি, এলাকা ও দপ্তরের নাম উল্লেখ করে তথ্য ও প্রমাণসহ সহজে অনলাইনে ফর্ম পূরণ করুন।
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative">
                            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center mb-4">
                                ২
                            </span>
                            <h4 className="font-bold text-base text-slate-900 mb-2">স্বয়ংক্রিয় রাউটিং</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                সিস্টেম বুদ্ধিমত্তার সাথে অভিযোগটি সংশ্লিষ্ট নির্দিষ্ট উপজেলা বা জেলা কর্মকর্তার কার্যালয়ে পাঠিয়ে দেয়।
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative">
                            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center mb-4">
                                ৩
                            </span>
                            <h4 className="font-bold text-base text-slate-900 mb-2">তদন্ত ও ব্যবস্থা</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                দায়িত্বপ্রাপ্ত কর্মকর্তা সরেজমিনে তদন্ত করে আইনানুগ ও কার্যকর পদক্ষেপ গ্রহণ করেন।
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative">
                            <span className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-sm flex items-center justify-center mb-4">
                                ৪
                            </span>
                            <h4 className="font-bold text-base text-slate-900 mb-2">সমাধান ও নাগরিক মতামত</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                সমাধানের প্রমাণপত্র আপলোড হয় এবং নাগরিক তার সন্তুষ্টি কিংবা প্রয়োজনে পুনরায় খোলার আবেদন জানাতে পারেন।
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Dynamic Categories Grid */}
            <section className="py-16 bg-white border-y border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-700">অভিযোগের খাতসমূহ</h2>
                            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                                যেসকল নাগরিক সমস্যা আপনি জানাতে পারেন
                            </h3>
                        </div>
                        <Link href="/submit" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1">
                            সব ক্যাটাগরিতে অভিযোগ করুন <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {categories.map((cat) => {
                            const IconComponent = iconMap[cat.icon] || Building2;
                            return (
                                <Link
                                    key={cat.id}
                                    href={`/submit?category=${cat.id}`}
                                    className="p-5 rounded-xl border border-slate-200/90 hover:border-emerald-500 hover:shadow-md transition-all group bg-slate-50/50 hover:bg-white flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="w-10 h-10 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <IconComponent className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-base text-slate-900 group-hover:text-emerald-800 transition-colors mb-1.5">
                                            {cat.name_bn}
                                        </h4>
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                            {cat.description}
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                                        <span>এসএলএ: {cat.default_sla_days} দিন</span>
                                        <span className="text-emerald-700 font-semibold group-hover:underline">অভিযোগ দিন →</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 5. Pilot Focus Showcase: Barishal & Cumilla */}
            <section className="py-16 bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-[#064E3B] to-[#047857] text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
                        <div className="relative z-10 max-w-2xl space-y-4">
                            <span className="px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold border border-emerald-700">
                                বিশেষ পাইলট বাস্তবায়ন অঞ্চল
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                বরিশাল ও কুমিল্লায় সরাসরি ডিজিটাল সমাধান
                            </h3>
                            <p className="text-sm text-emerald-100 leading-relaxed">
                                পাইলট প্রকল্পের আওতায় বরিশাল ও কুমিল্লা জেলার সকল উপজেলা এবং সিটি কর্পোরেশনের সংশ্লিষ্ট দপ্তর ও কর্মকর্তাদের প্ল্যাটফর্মে সরাসরি অন্তর্ভুক্ত করা হয়েছে। যেকোনো নাগরিক অভিযোগ সরাসরি তাদের ড্যাশবোর্ডে পৌঁছায়।
                            </p>
                            <div className="pt-2 flex flex-wrap gap-4">
                                <Link
                                    href="/submit"
                                    className="px-5 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-sm hover:bg-emerald-50 transition-colors shadow-xs"
                                >
                                    পাইলট অঞ্চলে অভিযোগ দাখিল
                                </Link>
                                <Link
                                    href="/about"
                                    className="px-5 py-2.5 rounded-xl bg-emerald-800/60 border border-emerald-600 text-white font-semibold text-sm hover:bg-emerald-800 transition-colors"
                                >
                                    পাইলট সম্পর্কে জানুন
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Recent Public Resolutions */}
            {recentResolved?.length > 0 && (
                <section className="py-16 bg-white border-t border-slate-200/80">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-xl mx-auto mb-10">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-700">সততা ও স্বচ্ছতা</h2>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">সম্প্রতি নিষ্পত্তি হওয়া অভিযোগসমূহ</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recentResolved.map((item, idx) => (
                                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-xs font-bold text-slate-700">{item.tracking_id}</span>
                                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                                                {item.status_label}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">{item.title}</h4>
                                        <p className="text-xs text-slate-600 mt-1">
                                            {item.upazila_name}, {item.district_name} • {item.category_name}
                                        </p>
                                    </div>
                                    <span className="text-xs text-slate-600 shrink-0 font-mono">{item.resolved_time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}
