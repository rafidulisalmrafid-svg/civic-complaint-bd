import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    Phone, 
    Search, 
    Menu, 
    X, 
    User as UserIcon, 
    LogOut, 
    Shield, 
    FileText, 
    HelpCircle, 
    CheckCircle, 
    ChevronDown,
    Building2,
    ExternalLink,
    Home,
    Send,
    Activity,
    Sparkles,
    MapPin,
    AlertCircle,
    Info
} from 'lucide-react';

export default function PublicLayout({ children, title }) {
    const { auth, flash, emergencyNumbers } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [quickTrackingId, setQuickTrackingId] = useState('');

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const handleQuickTrack = (e) => {
        e.preventDefault();
        if (quickTrackingId.trim()) {
            router.get(`/track?id=${encodeURIComponent(quickTrackingId.trim())}`);
            setMobileMenuOpen(false);
        }
    };

    const dashboardLink = auth?.user 
        ? (auth.user.role === 'main_admin' ? '/admin' :
           ['officer', 'area_officer', 'dept_admin'].includes(auth.user.role) ? '/officer' :
           '/citizen')
        : '/login';

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans pb-20 md:pb-0 selection:bg-emerald-600 selection:text-white">
            {/* 1. Top Emergency Hotline & Official Status Bar */}
            <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 text-emerald-100 text-xs py-1.5 px-3 sm:px-6 border-b border-emerald-900/60 shadow-xs relative z-30">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                    {/* Left: Live Emergency Hotline Badges */}
                    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap">
                        <span className="font-extrabold text-emerald-200 shrink-0 flex items-center gap-1.5 text-[10px] sm:text-xs">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                            </span>
                            <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" /> 
                            <span>জরুরি সেবা:</span>
                        </span>
                        {(emergencyNumbers || [
                            { number: '৩৩৩', name: 'জাতীয় বাতায়ন' },
                            { number: '৯৯৯', name: 'জরুরি সেবা' },
                            { number: '১০৯', name: 'নারী ও শিশু' },
                            { number: '১০৬', name: 'দুদক' }
                        ]).map((hotline, idx) => (
                            <a 
                                key={idx} 
                                href={`tel:${hotline.number}`} 
                                className="inline-flex items-center gap-1 hover:text-white transition-all bg-emerald-900/50 hover:bg-emerald-800/80 border border-emerald-500/30 hover:border-emerald-400/60 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] shrink-0 shadow-2xs group"
                            >
                                <span className="font-black text-white font-mono group-hover:text-emerald-200">{hotline.number}</span>
                                <span className="text-emerald-300/90 font-medium hidden xs:inline">({hotline.name})</span>
                            </a>
                        ))}
                    </div>

                    {/* Right: Government Official Status Note */}
                    <div className="hidden md:flex items-center gap-3 text-[11px] text-emerald-200/90 shrink-0 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-900/50 border border-emerald-500/20 text-emerald-300 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            পাইলট সংস্করণ: বরিশাল ও কুমিল্লা বিভাগ
                        </span>
                        <span className="text-emerald-700 font-light">•</span>
                        <span className="font-semibold text-emerald-200">টোল ফ্রি হেল্পলাইন: ৩৩৩</span>
                    </div>
                </div>
            </div>

            {/* 2. Main Navigation Header */}
            <header className="backdrop-blur-md bg-white/95 border-b border-emerald-100/90 sticky top-0 z-40 transition-all shadow-xs">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
                        
                        {/* Logo & National Insignia Brand */}
                        <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 group select-none shrink-0 pr-2">
                            <div className="relative shrink-0">
                                {/* Majestic Official Seal Insignia */}
                                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 text-white flex items-center justify-center font-bold text-lg shadow-md ring-2 ring-emerald-500/30 group-hover:scale-105 group-hover:shadow-emerald-900/25 group-hover:ring-emerald-400 transition-all duration-300">
                                    {/* Red Sun Circle with Golden Star */}
                                    <div className="w-6 h-6 sm:w-7.5 sm:h-7.5 rounded-full bg-gradient-to-tr from-rose-600 to-red-600 flex items-center justify-center shadow-inner border border-amber-300/40">
                                        <span className="text-amber-300 text-xs sm:text-base font-serif filter drop-shadow">★</span>
                                    </div>
                                </div>
                                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-[8px] sm:text-[9px] text-white font-bold shadow-xs">✓</span>
                            </div>

                            <div className="shrink-0">
                                <span className="text-xs xs:text-sm sm:text-base md:text-xl font-black tracking-tight text-slate-900 block leading-tight whitespace-nowrap group-hover:text-emerald-800 transition-colors">
                                    ই-অভিযোগ বাক্স
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] sm:text-xs font-bold text-emerald-800/90 flex items-center gap-1 whitespace-nowrap">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                                        আপনার সমস্যা, ডিজিটাল সমাধান।
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Quick Track Input in Navbar (Wide Desktop 2xl+) */}
                        <form onSubmit={handleQuickTrack} className="hidden 2xl:flex items-center relative w-56 mx-3">
                            <input
                                type="text"
                                placeholder="CT-... ট্র্যাকিং কোড"
                                value={quickTrackingId}
                                onChange={(e) => setQuickTrackingId(e.target.value)}
                                className="w-full bg-slate-100/90 hover:bg-slate-50 border border-slate-200/90 rounded-full py-1.5 pl-3.5 pr-9 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all placeholder:text-slate-400 font-mono shadow-2xs"
                            />
                            <button
                                type="submit"
                                aria-label="ট্র্যাক করুন"
                                className="absolute right-1 top-1 bottom-1 w-6 h-6 rounded-full bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-center hover:from-emerald-800 hover:to-teal-900 active:scale-95 transition-all shadow-xs"
                                title="অভিযোগের অবস্থা জানুন"
                            >
                                <Search className="w-3 h-3" />
                            </button>
                        </form>

                        {/* Desktop Nav Links */}
                        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 shrink-0">
                            <Link 
                                href="/" 
                                prefetch
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                    currentPath === '/' 
                                        ? 'text-emerald-900 bg-emerald-100/70 border border-emerald-300/70 shadow-2xs' 
                                        : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-100/70'
                                }`}
                            >
                                <Home className="w-4 h-4 text-emerald-700" />
                                <span>হোম</span>
                            </Link>

                            <Link 
                                href="/track" 
                                prefetch
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                    currentPath.startsWith('/track') 
                                        ? 'text-emerald-900 bg-emerald-100/70 border border-emerald-300/70 shadow-2xs' 
                                        : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-100/70'
                                }`}
                            >
                                <Search className="w-4 h-4 text-emerald-700" />
                                <span>অভিযোগ ট্র্যাক</span>
                            </Link>

                            <Link 
                                href="/how-it-works" 
                                prefetch
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                    currentPath.startsWith('/how-it-works') 
                                        ? 'text-emerald-900 bg-emerald-100/70 border border-emerald-300/70 shadow-2xs' 
                                        : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-100/70'
                                }`}
                            >
                                <FileText className="w-4 h-4 text-emerald-700" />
                                <span>নির্দেশিকা</span>
                            </Link>

                            <Link 
                                href="/faq" 
                                prefetch
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                    currentPath.startsWith('/faq') 
                                        ? 'text-emerald-900 bg-emerald-100/70 border border-emerald-300/70 shadow-2xs' 
                                        : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-100/70'
                                }`}
                            >
                                <HelpCircle className="w-4 h-4 text-emerald-700" />
                                <span>প্রশ্নোত্তর</span>
                            </Link>
                        </nav>

                        {/* Action CTA Buttons (Desktop) */}
                        <div className="hidden md:flex items-center gap-2.5 shrink-0">
                            <Link
                                href="/submit"
                                prefetch
                                className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-800 hover:to-teal-900 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-950/15 hover:shadow-lg hover:shadow-emerald-950/25 active:scale-95 transition-all animate-shimmer"
                            >
                                <Send className="w-4 h-4" />
                                <span>অভিযোগ দাখিল</span>
                            </Link>

                            {auth?.user ? (
                                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                                    <Link
                                        href={dashboardLink}
                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-800 hover:text-emerald-800 transition-all shadow-2xs"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[11px] font-black">
                                            {auth.user.name?.charAt(0) || 'U'}
                                        </div>
                                        <span>ড্যাশবোর্ড</span>
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-xl"
                                        title="লগআউট"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </Link>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300/90 hover:border-emerald-600 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 text-xs sm:text-sm font-bold transition-all shadow-2xs"
                                >
                                    <UserIcon className="w-4 h-4 text-emerald-700" />
                                    <span>লগইন</span>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Controls (Narrow Viewport & Phone) */}
                        <div className="flex items-center gap-1.5 md:hidden shrink-0">
                            {/* Fast Submit Pill on mobile */}
                            <Link
                                href="/submit"
                                className="hidden xs:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>দাখিল</span>
                            </Link>

                            <Link
                                href="/track"
                                aria-label="ট্র্যাক করুন"
                                className="p-2 rounded-xl text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 active:scale-95 transition-all"
                                title="অভিযোগের অবস্থা ট্র্যাক করুন"
                            >
                                <Search className="w-5 h-5 text-emerald-800" />
                            </Link>
                            
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label="মেনু খুলুন"
                                className="p-2 rounded-xl text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 active:scale-95 transition-all"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6 text-slate-900" /> : <Menu className="w-6 h-6 text-slate-900" />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* 3. Elevated Mobile Slide-Over Drawer with Backdrop (Clean & Modalized) */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex justify-end">
                    {/* Dark Blurred Backdrop */}
                    <div 
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fadeIn"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Elevated Slide-Over Sheet */}
                    <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-slideInRight border-l border-slate-200">
                        {/* Drawer Header */}
                        <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white flex items-center justify-between border-b border-emerald-800/50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                                    <div className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center">
                                        <span className="text-amber-300 text-xs font-serif">★</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-sm text-white leading-tight">নাগরিক সেবা পোর্টাল</h4>
                                    <p className="text-[10px] text-emerald-300">বাংলাদেশ সরকার</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
                                aria-label="বন্ধ করুন"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Quick Track Input in Drawer */}
                        <div className="p-3.5 border-b border-slate-100 bg-slate-50/70">
                            <form onSubmit={(e) => { handleQuickTrack(e); setMobileMenuOpen(false); }} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="ট্র্যাকিং কোড (CT-...)"
                                    value={quickTrackingId}
                                    onChange={(e) => setQuickTrackingId(e.target.value)}
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                />
                                <button
                                    type="submit"
                                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs flex items-center gap-1"
                                >
                                    <Search className="w-3.5 h-3.5" />
                                    <span>ট্র্যাক</span>
                                </button>
                            </form>
                        </div>

                        {/* Drawer Navigation Links */}
                        <div className="p-3 flex-1 overflow-y-auto space-y-1">
                            <Link 
                                href="/" 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    currentPath === '/' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <Home className="w-4 h-4 text-emerald-700" />
                                <span>হোম পেজ</span>
                            </Link>

                            <Link 
                                href="/submit" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-xs"
                            >
                                <Send className="w-4 h-4" />
                                <span>নতুন অভিযোগ দাখিল করুন</span>
                            </Link>

                            <Link 
                                href="/track" 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    currentPath.startsWith('/track') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <Activity className="w-4 h-4 text-emerald-700" />
                                <span>অভিযোগ ট্র্যাক করুন</span>
                            </Link>

                            <Link 
                                href="/how-it-works" 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    currentPath.startsWith('/how-it-works') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <HelpCircle className="w-4 h-4 text-emerald-700" />
                                <span>সেবা ও প্রতিকার নির্দেশিকা</span>
                            </Link>

                            <Link 
                                href="/faq" 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    currentPath.startsWith('/faq') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <Info className="w-4 h-4 text-emerald-700" />
                                <span>সাধারণ প্রশ্নোত্তর (FAQ)</span>
                            </Link>

                            {/* Emergency hotlines section inside mobile menu */}
                            <div className="pt-3 mt-3 border-t border-slate-100">
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3.5 mb-2">জরুরি হটলাইন সেবা</p>
                                <div className="grid grid-cols-2 gap-1.5 px-1">
                                    {(emergencyNumbers || [
                                        { number: '৩৩৩', name: 'জাতীয় বাতায়ন' },
                                        { number: '৯৯৯', name: 'জরুরি সেবা' },
                                        { number: '১০৯', name: 'নারী ও শিশু' },
                                        { number: '১০৬', name: 'দুদক' }
                                    ]).map((h, idx) => (
                                        <a 
                                            key={idx} 
                                            href={`tel:${h.number}`} 
                                            className="flex items-center gap-2 p-2 bg-emerald-50/70 hover:bg-emerald-100 rounded-xl border border-emerald-200/50 text-[11px] font-bold text-emerald-950"
                                        >
                                            <Phone className="w-3 h-3 text-emerald-600" />
                                            <div>
                                                <span className="font-mono text-emerald-800 block">{h.number}</span>
                                                <span className="text-[10px] text-slate-500 block font-normal">{h.name}</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer Auth Controls */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/80">
                            {auth?.user ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                                                {auth.user.name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="truncate max-w-[130px]">
                                                <p className="text-xs font-bold text-slate-900 truncate">{auth.user.name}</p>
                                                <p className="text-[10px] text-emerald-700 font-semibold">{auth.user.role}</p>
                                            </div>
                                        </div>
                                        <Link
                                            href={dashboardLink}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                                        >
                                            ড্যাশবোর্ড
                                        </Link>
                                    </div>
                                    <Link 
                                        href="/logout" 
                                        method="post" 
                                        as="button" 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-rose-600 rounded-xl hover:bg-rose-50 border border-rose-200/60"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        <span>লগআউট করুন</span>
                                    </Link>
                                </div>
                            ) : (
                                <Link 
                                    href="/login" 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-950 text-white font-bold text-xs shadow-xs"
                                >
                                    <UserIcon className="w-4 h-4 text-emerald-400" />
                                    <span>লগইন করুন (নাগরিক / কর্মকর্তা)</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Flash Messages */}
            {flash?.success && (
                <div className="bg-emerald-500 text-white py-3 px-4 text-center text-sm font-semibold shadow-xs flex items-center justify-center gap-2 animate-fadeIn">
                    <CheckCircle className="w-4.5 h-4.5" />
                    <span>{flash.success}</span>
                </div>
            )}
            {flash?.error && (
                <div className="bg-rose-600 text-white py-3 px-4 text-center text-sm font-semibold shadow-xs flex items-center justify-center gap-2 animate-fadeIn">
                    <AlertCircle className="w-4.5 h-4.5" />
                    <span>{flash.error}</span>
                </div>
            )}

            {/* Main Page Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* 3. Official Civic Footer */}
            <footer className="bg-[#0B132B] text-slate-300 text-sm border-t border-slate-800 mt-16 sm:mt-24 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-10">
                        {/* Col 1: Govt Info */}
                        <div className="md:col-span-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm ring-2 ring-emerald-400/30">
                                    ★
                                </div>
                                <div>
                                    <span className="font-extrabold text-white text-base block">ই-অভিযোগ বাক্স</span>
                                    <span className="text-[11px] text-emerald-400 block font-medium">আপনার সমস্যা, ডিজিটাল সমাধান।</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                যেকোনো সরকারি দপ্তর বা জনসেবা সংক্রান্ত অভিযোগ সরাসরি দায়িত্বশীল কর্মকর্তার টেবিলে পৌঁছানো এবং স্বচ্ছভাবে দ্রুত প্রতিকারের কেন্দ্রীয় নাগরিক প্ল্যাটফর্ম।
                            </p>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-[11px] text-emerald-400 font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                পাইলট জোন: বরিশাল ও কুমিল্লা
                            </div>
                        </div>

                        {/* Col 2: Useful Links */}
                        <div className="space-y-3">
                            <h4 className="text-white font-bold text-sm tracking-wide border-b border-slate-800 pb-2">সেবা ও লিংক</h4>
                            <ul className="space-y-2.5 text-xs text-slate-400">
                                <li>
                                    <Link href="/submit" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                                        <span className="text-emerald-500">›</span> অভিযোগ দাখিল করুন
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/track" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                                        <span className="text-emerald-500">›</span> বর্তমান অবস্থা ট্র্যাক করুন
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/how-it-works" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                                        <span className="text-emerald-500">›</span> সমাধান প্রক্রিয়া নির্দেশিকা
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/faq" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                                        <span className="text-emerald-500">›</span> সাধারণ জিজ্ঞাসা ও উত্তর
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 3: Pilot Jurisdictions */}
                        <div className="space-y-3">
                            <h4 className="text-white font-bold text-sm tracking-wide border-b border-slate-800 pb-2">পাইলট অঞ্চলসমূহ</h4>
                            <p className="text-xs text-slate-400 leading-relaxed mb-3">
                                প্রাথমিক পাইলট পর্যায়ে দুটি বিভাগীয় ও সিটি কর্পোরেশন এলাকা অন্তর্ভুক্ত:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-emerald-300 text-xs border border-slate-700/70 font-medium">বরিশাল সিটি কর্পোরেশন</span>
                                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-emerald-300 text-xs border border-slate-700/70 font-medium">কুমিল্লা সিটি কর্পোরেশন</span>
                                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-emerald-300 text-xs border border-slate-700/70 font-medium">বরিশাল সদর ও উপজেলাসমূহ</span>
                                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-emerald-300 text-xs border border-slate-700/70 font-medium">কুমিল্লা আদর্শ সদর ও উপজেলাসমূহ</span>
                            </div>
                        </div>

                        {/* Col 4: Hotlines & Security */}
                        <div className="space-y-3">
                            <h4 className="text-white font-bold text-sm tracking-wide border-b border-slate-800 pb-2">জরুরি হটলাইন ও নিরাপত্তা</h4>
                            <div className="space-y-2 text-xs">
                                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                                    <span className="text-slate-400 flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-emerald-400" /> জাতীয় তথ্য বাতায়ন
                                    </span>
                                    <span className="font-mono font-bold text-white text-sm">৩৩৩</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                                    <span className="text-slate-400 flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-emerald-400" /> জরুরি সেবা (পুলিশ/ফায়ার)
                                    </span>
                                    <span className="font-mono font-bold text-white text-sm">৯৯৯</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                                    <span className="text-slate-400 flex items-center gap-2">
                                        <Shield className="w-3.5 h-3.5 text-emerald-400" /> দুর্নীতি দমন হেল্পলাইন
                                    </span>
                                    <span className="font-mono font-bold text-white text-sm">১০৬</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
                        <p>© ২০২৬ গণপ্রজাতন্ত্রী বাংলাদেশ সরকার। সর্বস্বত্ব সংরক্ষিত।</p>
                        <div className="flex items-center gap-4">
                            <Link href="/about" className="hover:text-slate-300 transition-colors">পরিচিতি</Link>
                            <span>•</span>
                            <Link href="/faq" className="hover:text-slate-300 transition-colors">গোপনীয়তা নীতি</Link>
                            <span>•</span>
                            <Link href="/how-it-works" className="hover:text-slate-300 transition-colors">ব্যবহারের শর্তাবলী</Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* 4. Native Mobile Bottom Navigation Dock (App-Like Bar) */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-dock border-t border-slate-200/90 px-3 py-1.5 flex items-center justify-around safe-bottom">
                {/* Home */}
                <Link
                    href="/"
                    prefetch
                    className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-center transition-all ${
                        currentPath === '/' ? 'text-emerald-800 font-bold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Home className={`w-5 h-5 mb-0.5 ${currentPath === '/' ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
                    <span className="text-[10px] leading-none">হোম</span>
                </Link>

                {/* Track */}
                <Link
                    href="/track"
                    prefetch
                    className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-center transition-all ${
                        currentPath.startsWith('/track') ? 'text-emerald-800 font-bold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Activity className={`w-5 h-5 mb-0.5 ${currentPath.startsWith('/track') ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
                    <span className="text-[10px] leading-none">ট্র্যাক</span>
                </Link>

                {/* Submit Complaint - Elevated Floating Center Button */}
                <Link
                    href="/submit"
                    prefetch
                    className="flex flex-col items-center justify-center -mt-5 group"
                >
                    <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-800 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-900/30 ring-4 ring-white group-active:scale-95 transition-all">
                        <Send className="w-5 h-5 -mr-0.5 -mt-0.5" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-900 mt-1">অভিযোগ দিন</span>
                </Link>

                {/* Guide */}
                <Link
                    href="/how-it-works"
                    prefetch
                    className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-center transition-all ${
                        currentPath.startsWith('/how-it-works') ? 'text-emerald-800 font-bold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <HelpCircle className={`w-5 h-5 mb-0.5 ${currentPath.startsWith('/how-it-works') ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
                    <span className="text-[10px] leading-none">নির্দেশিকা</span>
                </Link>

                {/* Account / Login */}
                <Link
                    href={dashboardLink}
                    prefetch
                    className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-center transition-all ${
                        currentPath.startsWith('/citizen') || currentPath.startsWith('/officer') || currentPath.startsWith('/admin') || currentPath.startsWith('/login')
                            ? 'text-emerald-800 font-bold' 
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <UserIcon className={`w-5 h-5 mb-0.5 ${
                        currentPath.startsWith('/citizen') || currentPath.startsWith('/officer') || currentPath.startsWith('/admin')
                            ? 'text-emerald-700 stroke-[2.5]' 
                            : ''
                    }`} />
                    <span className="text-[10px] leading-none">{auth?.user ? 'ড্যাশবোর্ড' : 'লগইন'}</span>
                </Link>
            </nav>
        </div>
    );
}

