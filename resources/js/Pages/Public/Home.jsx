import React, { useState, useEffect } from 'react';
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
    AlertCircle,
    Shield,
    Users,
    ChevronRight,
    TrendingUp,
    FileCheck,
    Radio,
    Bot
} from 'lucide-react';
import CivicMascot from '@/Components/CivicMascot';
import AiComplaintAssistantModal from '@/Components/AiComplaintAssistantModal';

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

export default function Home({ stats = {}, categories = [], pilotDistricts = [], recentResolved = [] }) {
    const [trackingCode, setTrackingCode] = useState('');
    const [taglineIndex, setTaglineIndex] = useState(0);
    const [tickerIndex, setTickerIndex] = useState(0);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);

    const animatedTaglines = [
        'দ্রুত ও নিশ্চিত প্রতিকার',
        'স্বচ্ছ ও দায়বদ্ধ সুশাসন',
        'নাগরিকের কণ্ঠস্বর ও অধিকার',
        'ডিজিটাল জনসেবার নতুন মান'
    ];

    const liveTickerItems = [
        { location: 'বরিশাল সিটি', text: 'সদর রোড ড্রেনেজ সংস্কার সম্পন্ন ও পানিপ্রবাহ স্বাভাবিক', time: '১০ মিনিট আগে', status: 'নিষ্পত্তি' },
        { location: 'কুমিল্লা সিটি', text: 'কান্দিরপাড় জলাবদ্ধতা নিরসনে ইঞ্জিনিয়ারিং টিম ফিল্ডে', time: '২৫ মিনিট আগে', status: 'তদন্তাধীন' },
        { location: 'বরিশাল সদর', text: 'ব্যান্ড রোড স্ট্রিট লাইট সংযোগ ত্রুটি মেরামত রেকর্ডভুক্ত', time: '৪৫ মিনিট আগে', status: 'নিষ্পত্তি' },
        { location: 'কুমিল্লা আদর্শ সদর', text: 'ভিক্টোরিয়া কলেজ সংলগ্ন বর্জ্য ব্যবস্থাপনা পরিচ্ছন্নতা কার্যক্রম সমাপ্ত', time: '১ ঘণ্টা আগে', status: 'নিষ্পত্তি' }
    ];

    // Automatic tagline rotation
    useEffect(() => {
        const taglineTimer = setInterval(() => {
            setTaglineIndex((prev) => (prev + 1) % animatedTaglines.length);
        }, 3200);

        const tickerTimer = setInterval(() => {
            setTickerIndex((prev) => (prev + 1) % liveTickerItems.length);
        }, 4000);

        return () => {
            clearInterval(taglineTimer);
            clearInterval(tickerTimer);
        };
    }, []);

    const handleTrackSubmit = (e) => {
        e.preventDefault();
        if (trackingCode.trim()) {
            router.get(`/track?id=${encodeURIComponent(trackingCode.trim())}`);
        }
    };

    return (
        <PublicLayout>
            <Head title="ই-অভিযোগ বাক্স — আপনার সমস্যা, ডিজিটাল সমাধান।" />

            {/* 1. Hero Section with Automatic Subtle Motion */}
            <section className="relative hero-mesh-bg pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 border-b border-slate-200/80 overflow-hidden">
                {/* Ambient Soft Glow Elements with breathing animation */}
                <div className="absolute top-0 right-1/4 w-80 h-80 sm:w-96 sm:h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
                <div className="absolute bottom-0 left-10 w-72 h-72 sm:w-96 sm:h-96 bg-teal-300/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '3s' }}></div>

                {/* Floating Micro-Card 1: Top-Right (Desktop) */}
                <div className="hidden xl:flex absolute right-8 top-20 items-center gap-3 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-100/90 shadow-xl shadow-emerald-900/5 animate-float-gentle max-w-xs z-10 pointer-events-none">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">সফল নিষ্পত্তি</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">✓ ভেরিফাইড</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate max-w-[170px]">ব্যান্ড রোড সড়ক বাতি মেরামত</p>
                        <p className="text-[10px] text-emerald-700 font-bold mt-0.5">★ ৫.০ নাগরিক সন্তুষ্টি</p>
                    </div>
                </div>

                {/* Floating Micro-Card 2: Bottom-Left (Desktop) */}
                <div className="hidden xl:flex absolute left-8 bottom-16 items-center gap-3 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-teal-100/90 shadow-xl shadow-teal-900/5 animate-float-reverse max-w-xs z-10 pointer-events-none">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">গড় সমাধান গতি</span>
                            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
                        </div>
                        <p className="text-xs text-teal-800 font-mono font-extrabold mt-0.5">৩.২ কার্যদিবস</p>
                        <p className="text-[10px] text-slate-400">স্বয়ংক্রিয় পদমর্যাদা রাউটিং</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                        {/* Left Column: Headlines & Actions (7 Cols on desktop) */}
                        <div className="lg:col-span-7 text-center lg:text-left space-y-5 sm:space-y-6">
                            {/* Pilot Badge with Live Pulsing Dot */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-300/60 text-emerald-900 text-xs font-bold shadow-2xs">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                                </span>
                                <span>পাইলট সংস্করণ: বরিশাল ও কুমিল্লা বিভাগীয় অঞ্চল</span>
                                <span className="hidden xs:inline text-emerald-700/60 font-light">•</span>
                                <span className="hidden xs:inline text-emerald-800 text-[11px] font-semibold">লাইভ সক্রিয়</span>
                            </div>

                            {/* Hero Title with Site Name & Official Tagline */}
                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.2] sm:leading-[1.15] flex flex-col items-center lg:items-start justify-center">
                                <span>ই-অভিযোগ বাক্স</span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-700 text-2xl sm:text-3xl lg:text-4xl mt-2 font-extrabold tracking-normal">
                                    আপনার সমস্যা, ডিজিটাল সমাধান।
                                </span>
                            </h1>

                            <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto lg:mx-0">
                                সরকারি দপ্তর বা জনসেবা প্রাপ্তিতে কোনো অনিয়ম, ভোগান্তি কিংবা বিলম্ব হলে সহজে অনলাইনে অভিযোগ জানান। আপনার অভিযোগ পৌঁছাবে সরাসরি দায়িত্বশীল কর্মকর্তার টেবিলে।
                            </p>

                            {/* Core Action CTAs with AI Assistant */}
                            <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => setIsAiModalOpen(true)}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 hover:from-emerald-900 hover:to-slate-950 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-950/20 hover:shadow-xl hover:shadow-emerald-950/30 transition-all active:scale-95 animate-shimmer border border-emerald-400/40"
                                >
                                    <Bot className="w-5 h-5 text-emerald-300 animate-pulse" />
                                    <span>AI সহকারীর সাথে অভিযোগ দাখিল</span>
                                    <Sparkles className="w-4 h-4 text-amber-300" />
                                </button>

                                <Link
                                    href="/submit"
                                    prefetch
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300/90 shadow-2xs hover:shadow-md transition-all active:scale-95"
                                >
                                    <Send className="w-4 h-4 text-emerald-700" />
                                    <span>সাধারণ ফর্ম</span>
                                </Link>

                                <Link
                                    href="/track"
                                    prefetch
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300/90 shadow-2xs hover:shadow-md transition-all active:scale-95"
                                >
                                    <Search className="w-4 h-4 text-emerald-700" />
                                    <span>ট্র্যাক করুন</span>
                                </Link>
                            </div>

                            {/* Direct Interactive Tracking Box */}
                            <div className="pt-3 sm:pt-4 max-w-xl mx-auto lg:mx-0">
                                <form onSubmit={handleTrackSubmit} className="relative flex items-center shadow-lg shadow-slate-200/50 rounded-2xl bg-white p-1.5 border border-slate-200/90 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-600 transition-all">
                                    <Search className="w-5 h-5 text-emerald-700 ml-3 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="আপনার ট্র্যাকিং আইডি লিখুন..."
                                        value={trackingCode}
                                        onChange={(e) => setTrackingCode(e.target.value)}
                                        className="w-full border-0 focus:ring-0 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 px-3 py-2.5 bg-transparent font-mono"
                                    />
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-emerald-800 hover:to-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 active:scale-95"
                                    >
                                        ট্র্যাক করুন
                                    </button>
                                </form>

                                {/* Auto-Cycling Live Civic Activity Pill */}
                                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-[11px] border border-slate-800 shadow-sm max-w-full overflow-hidden">
                                    <span className="flex items-center gap-1 text-emerald-400 font-bold shrink-0">
                                        <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                                        <span>লাইভ আপডেট:</span>
                                    </span>
                                    <div key={tickerIndex} className="animate-text-reveal flex items-center gap-2 truncate">
                                        <span className="text-emerald-300 font-semibold shrink-0">[{liveTickerItems[tickerIndex].location}]</span>
                                        <span className="text-slate-200 truncate">{liveTickerItems[tickerIndex].text}</span>
                                        <span className="text-[10px] text-slate-400 font-mono shrink-0 hidden sm:inline">• {liveTickerItems[tickerIndex].time}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Animated Mascot Assistant (5 Cols on desktop, centered on mobile) */}
                        <div className="lg:col-span-5 flex justify-center mt-4 lg:mt-0">
                            <CivicMascot 
                                className="w-full max-w-md" 
                                onOpenAiAssistant={() => setIsAiModalOpen(true)}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Real Database-Driven Statistics Bar */}
            <section className="bg-white py-8 sm:py-12 border-b border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {/* Metric 1 */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 card-hover-lift text-left">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">মোট দাখিল</span>
                                <div className="w-8 h-8 rounded-xl bg-slate-200/70 text-slate-700 flex items-center justify-center">
                                    <FileCheck className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{stats.total}</p>
                            <p className="text-[11px] text-slate-500 mt-1">কেন্দ্রীয় ডাটাবেজে নথিবদ্ধ</p>
                        </div>

                        {/* Metric 2 */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 card-hover-lift text-left">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">সফল নিষ্পত্তি</span>
                                <div className="w-8 h-8 rounded-xl bg-emerald-200/60 text-emerald-800 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 font-mono">{stats.resolved}</p>
                            <p className="text-[11px] text-emerald-700 mt-1">যাচাইকৃত সমাধান নিশ্চিত</p>
                        </div>

                        {/* Metric 3 */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 card-hover-lift text-left">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">তদন্ত ও ব্যবস্থা</span>
                                <div className="w-8 h-8 rounded-xl bg-amber-200/60 text-amber-800 flex items-center justify-center">
                                    <Activity className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-extrabold text-amber-800 font-mono">{stats.investigating}</p>
                            <p className="text-[11px] text-amber-700 mt-1">কর্মকর্তা পর্যায়ে সক্রিয়</p>
                        </div>

                        {/* Metric 4 */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/70 border border-teal-200/80 card-hover-lift text-left">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">নিষ্পত্তি হার</span>
                                <div className="w-8 h-8 rounded-xl bg-teal-200/60 text-teal-800 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-extrabold text-teal-800 font-mono">{stats.resolutionRate}%</p>
                            <p className="text-[11px] text-teal-700 mt-1">পাইলট অঞ্চলসমূহের গড়</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. The 4-Step Visual Workflow Flow */}
            <section className="py-14 sm:py-20 bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            সহজ ও স্বচ্ছ ডিজিটাল রূপরেখা
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                            অভিযোগ দাখিল থেকে সমাধান পর্যন্ত চারটি ধাপ
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 mt-2">
                            কোনো মধ্যস্থতাকারী ছাড়া সরাসরি সরকার ও নাগরিকের দ্বিমুখী জবাবদিহিতা
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                        {/* Step 1 */}
                        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs card-hover-lift flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-lg flex items-center justify-center mb-5 font-mono shadow-xs ring-4 ring-emerald-50">
                                    ০১
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 mb-2">অনলাইনে অভিযোগ দাখিল</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    খাত, এলাকা ও দপ্তরের নাম উল্লেখ করে তথ্য, ছবি বা প্রমাণপত্রসহ সহজে আবেদন জমা দিন। সাথে সাথেই পাবেন অনন্য ট্র্যাকিং আইডি।
                                </p>
                            </div>
                            <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] font-semibold text-emerald-700">
                                সময় লাগবে: ২-৩ মিনিট
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs card-hover-lift flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-lg flex items-center justify-center mb-5 font-mono shadow-xs ring-4 ring-emerald-50">
                                    ০২
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 mb-2">স্বয়ংক্রিয় বুদ্ধিমান রাউটিং</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    সিস্টেম নির্ভুলভাবে ভৌগোলিক সীমানা ও দপ্তরের পদমর্যাদা বিশ্লেষণ করে দায়িত্বশীল সংশ্লিষ্ট কর্মকর্তার ড্যাশবোর্ডে পাঠায়।
                                </p>
                            </div>
                            <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] font-semibold text-emerald-700">
                                স্বয়ংক্রিয় স্থানান্তর
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs card-hover-lift flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-lg flex items-center justify-center mb-5 font-mono shadow-xs ring-4 ring-emerald-50">
                                    ০৩
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 mb-2">তদন্ত ও কার্যকর ব্যবস্থা</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    দায়িত্বপ্রাপ্ত কর্মকর্তা সরেজমিনে তদন্ত করে আইনানুগ ব্যবস্থা গ্রহণ করেন এবং অগ্রগতির বিবরণ ডিজিটাল নথিতে সংরক্ষণ করেন।
                                </p>
                            </div>
                            <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] font-semibold text-emerald-700">
                                এসএলএ টাইমলাইনে সীমাবদ্ধ
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs card-hover-lift flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-extrabold text-lg flex items-center justify-center mb-5 font-mono shadow-xs ring-4 ring-emerald-100">
                                    ০৪
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 mb-2">সমাধান ও নাগরিক মতামত</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    সমাধানের প্রমাণপত্র আপলোড হয় এবং নাগরিক তার সন্তুষ্টি প্রকাশ করতে পারেন অথবা প্রয়োজনে পুনর্বিবেচনার আবেদন জানাতে পারেন।
                                </p>
                            </div>
                            <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] font-semibold text-emerald-700">
                                নাগরিকের চূড়ান্ত রেটিং
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Dynamic Categories Grid */}
            <section className="py-14 sm:py-20 bg-white border-y border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                                নাগরিক সমস্যার খাতসমূহ
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                                যেসকল নাগরিক খাতে অভিযোগ জানাতে পারেন
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 mt-1">
                                যেকোনো ক্যাটাগরিতে ক্লিক করে সরাসরি অভিযোগ দাখিল শুরু করুন
                            </p>
                        </div>
                        <Link 
                            href="/submit" 
                            prefetch
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-xs sm:text-sm font-bold text-slate-800 hover:text-emerald-800 transition-all active:scale-95 shrink-0"
                        >
                            <span>সব ক্যাটাগরি দেখুন</span>
                            <ArrowRight className="w-4 h-4 text-emerald-700" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                        {categories.map((cat) => {
                            const IconComponent = iconMap[cat.icon] || Building2;
                            return (
                                <Link
                                    key={cat.id}
                                    href={`/submit?category=${cat.id}`}
                                    prefetch
                                    className="p-5 rounded-2xl border border-slate-200/90 hover:border-emerald-500/80 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-emerald-900/5 transition-all group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-emerald-700 group-hover:text-white transition-all shadow-2xs">
                                            <IconComponent className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-800 transition-colors mb-1.5">
                                            {cat.name_bn}
                                        </h3>
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                            {cat.description}
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                                        <span className="font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                                            এসএলএ: {cat.default_sla_days} দিন
                                        </span>
                                        <span className="text-emerald-700 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                                            অভিযোগ দিন <ChevronRight className="w-3.5 h-3.5" />
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 5. Pilot Focus Showcase: Barishal & Cumilla */}
            <section className="py-14 sm:py-20 bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="hero-mesh-dark text-white rounded-3xl p-6 sm:p-10 lg:p-14 shadow-xl relative overflow-hidden">
                        <div className="relative z-10 max-w-2xl space-y-4 sm:space-y-5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/80 text-emerald-200 text-xs font-bold border border-emerald-500/40 shadow-xs">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                                বিশেষ পাইলট বাস্তবায়ন কার্যক্রম
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                                বরিশাল ও কুমিল্লায় সরাসরি ডিজিটাল জবাবদিহিতা
                            </h2>
                            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
                                পাইলট প্রকল্পের আওতায় বরিশাল ও কুমিল্লা জেলার সকল উপজেলা এবং সিটি কর্পোরেশনের সংশ্লিষ্ট দপ্তর ও কর্মকর্তাদের প্ল্যাটফর্মে সরাসরি অন্তর্ভুক্ত করা হয়েছে। যেকোনো নাগরিক অভিযোগ দাখিল হওয়ামাত্রই সংশ্লিষ্ট কর্মকর্তার ড্যাশবোর্ডে পৌঁছে যায়।
                            </p>
                            <div className="pt-2 flex flex-wrap gap-3">
                                <Link
                                    href="/submit"
                                    prefetch
                                    className="px-6 py-3 rounded-xl bg-white text-emerald-900 font-bold text-sm hover:bg-emerald-50 transition-all shadow-md active:scale-95"
                                >
                                    পাইলট অঞ্চলে অভিযোগ দাখিল
                                </Link>
                                <Link
                                    href="/about"
                                    prefetch
                                    className="px-6 py-3 rounded-xl bg-emerald-900/60 border border-emerald-400/40 text-white font-bold text-sm hover:bg-emerald-900/90 transition-all active:scale-95"
                                >
                                    পাইলট বিস্তার সম্পর্কে জানুন
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Recent Public Resolutions */}
            {recentResolved?.length > 0 && (
                <section className="py-14 sm:py-20 bg-white border-t border-slate-200/80">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-xl mx-auto mb-10">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                                সততা ও স্বচ্ছতা
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                সম্প্রতি নিষ্পত্তি হওয়া অভিযোগসমূহ
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                নাগরিকের দাবির প্রেক্ষিতে কর্মকর্তাদের নেওয়া বাস্তব সমাধান
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recentResolved.map((item, idx) => (
                                <Link 
                                    key={idx} 
                                    href={`/track?id=${encodeURIComponent(item.tracking_id)}`}
                                    prefetch
                                    className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-emerald-400 hover:shadow-md transition-all flex items-start justify-between gap-4 group"
                                >
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-slate-800 group-hover:text-emerald-800">{item.tracking_id}</span>
                                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                                                ✓ {item.status_label}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 line-clamp-1">{item.title}</h3>
                                        <p className="text-xs text-slate-600 flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{item.upazila_name}, {item.district_name} • {item.category_name}</span>
                                        </p>
                                    </div>
                                    <span className="text-xs text-slate-500 shrink-0 font-mono mt-1">{item.resolved_time}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Floating AI Assistant Trigger Button (Bottom-Right, Elevated above mobile dock) */}
            <div className="fixed right-4 bottom-20 sm:bottom-6 z-40">
                <button
                    type="button"
                    onClick={() => setIsAiModalOpen(true)}
                    className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white shadow-xl shadow-emerald-950/25 border border-emerald-400/40 hover:scale-105 active:scale-95 transition-all"
                    title="AI অভিযোগ সহকারীর সাথে কথা বলুন"
                >
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <Bot className="w-5 h-5 text-emerald-300 animate-pulse" />
                    <span className="text-xs sm:text-sm font-extrabold tracking-wide">AI নাগরিক সহকারী</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                </button>
            </div>

            {/* AI-Powered Animated Complaint Assistant Modal */}
            <AiComplaintAssistantModal 
                isOpen={isAiModalOpen} 
                onClose={() => setIsAiModalOpen(false)} 
            />
        </PublicLayout>
    );
}

