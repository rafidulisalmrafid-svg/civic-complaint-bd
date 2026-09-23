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
    ExternalLink
} from 'lucide-react';

export default function PublicLayout({ children, title }) {
    const { auth, flash, emergencyNumbers } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [quickTrackingId, setQuickTrackingId] = useState('');

    const handleQuickTrack = (e) => {
        e.preventDefault();
        if (quickTrackingId.trim()) {
            router.get(`/track?id=${encodeURIComponent(quickTrackingId.trim())}`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans">
            {/* 1. Emergency Hotline Bar */}
            <div className="bg-[#064E3B] text-emerald-100 text-xs py-1.5 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3 overflow-x-auto">
                        <span className="font-semibold text-emerald-300 shrink-0 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> জরুরি সেবা হটলাইন:
                        </span>
                        {(emergencyNumbers || []).map((hotline, idx) => (
                            <a 
                                key={idx} 
                                href={`tel:${hotline.number}`} 
                                className="inline-flex items-center gap-1 hover:text-white transition-colors bg-emerald-900/60 px-2 py-0.5 rounded text-[11px]"
                            >
                                <span className="font-bold text-white font-mono">{hotline.number}</span>
                                <span className="text-emerald-300">({hotline.name})</span>
                            </a>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-emerald-300">
                        <span>পাইলট সংস্করণ: বরিশাল ও কুমিল্লা</span>
                        <span className="hidden md:inline">|</span>
                        <span className="hidden md:inline">টোল ফ্রি অভিযোগ হেল্পলাইন: ৩৩৩</span>
                    </div>
                </div>
            </div>

            {/* 2. Main Navigation Header */}
            <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-18">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-11 h-11 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-xs ring-2 ring-emerald-600/20 group-hover:scale-105 transition-transform">
                                <span className="text-red-500 font-serif">★</span>
                            </div>
                            <div>
                                <span className="text-lg font-bold tracking-tight text-slate-900 block leading-snug group-hover:text-emerald-700 transition-colors">
                                    নাগরিক সেবা ও অভিযোগ প্রতিকার
                                </span>
                                <span className="text-[11px] text-slate-500 block">
                                    গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                                </span>
                            </div>
                        </Link>

                        {/* Quick Track Input in Navbar (Desktop) */}
                        <form onSubmit={handleQuickTrack} className="hidden lg:flex items-center relative max-w-xs w-full mx-6">
                            <input
                                type="text"
                                placeholder="অভিযোগ ট্র্যাকিং আইডি লিখুন..."
                                value={quickTrackingId}
                                onChange={(e) => setQuickTrackingId(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-4 pr-10 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                            />
                            <button
                                type="submit"
                                aria-label="ট্র্যাক করুন"
                                className="absolute right-1 top-1 bottom-1 w-8 rounded-full bg-emerald-700 text-white flex items-center justify-center hover:bg-emerald-800 transition-colors"
                            >
                                <Search className="w-3.5 h-3.5" />
                            </button>
                        </form>

                        {/* Desktop Nav Links */}
                        <nav className="hidden md:flex items-center gap-6">
                            <Link 
                                href="/" 
                                className="text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors"
                            >
                                হোম
                            </Link>
                            <Link 
                                href="/track" 
                                className="text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors"
                            >
                                অভিযোগ ট্র্যাক
                            </Link>
                            <Link 
                                href="/how-it-works" 
                                className="text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors"
                            >
                                সেবা নির্দেশিকা
                            </Link>
                            <Link 
                                href="/faq" 
                                className="text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors"
                            >
                                প্রশ্নোত্তর
                            </Link>
                        </nav>

                        {/* Auth / Action CTA */}
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                href="/submit"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all active:scale-95"
                            >
                                অভিযোগ দাখিল করুন
                            </Link>

                            {auth.user ? (
                                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                                    <Link
                                        href={
                                            auth.user.role === 'main_admin' ? '/admin' :
                                            ['officer', 'area_officer', 'dept_admin'].includes(auth.user.role) ? '/officer' :
                                            '/citizen'
                                        }
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>ড্যাশবোর্ড</span>
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg"
                                        title="লগআউট"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </Link>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
                                >
                                    লগইন
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Mobile Navigation Drawer */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-slate-200 space-y-3">
                            <form onSubmit={handleQuickTrack} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="ট্র্যাকিং আইডি লিখুন..."
                                    value={quickTrackingId}
                                    onChange={(e) => setQuickTrackingId(e.target.value)}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm"
                                />
                                <button
                                    type="submit"
                                    className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                                >
                                    খুঁজুন
                                </button>
                            </form>

                            <div className="flex flex-col gap-2 pt-2">
                                <Link href="/" className="px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">হোম</Link>
                                <Link href="/submit" className="px-3 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-lg">অভিযোগ দাখিল করুন</Link>
                                <Link href="/track" className="px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">অভিযোগ ট্র্যাক করুন</Link>
                                <Link href="/how-it-works" className="px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">সেবা নির্দেশিকা</Link>
                                <Link href="/faq" className="px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">প্রশ্নোত্তর</Link>
                                
                                {auth.user ? (
                                    <div className="pt-2 border-t border-slate-200 space-y-1">
                                        <Link 
                                            href={auth.user.role === 'main_admin' ? '/admin' : ['officer', 'area_officer', 'dept_admin'].includes(auth.user.role) ? '/officer' : '/citizen'} 
                                            className="block px-3 py-2 text-sm font-semibold text-slate-800"
                                        >
                                            আমার ড্যাশবোর্ড ({auth.user.name})
                                        </Link>
                                        <Link href="/logout" method="post" as="button" className="w-full text-left px-3 py-2 text-sm text-rose-600">
                                            লগআউট
                                        </Link>
                                    </div>
                                ) : (
                                    <Link href="/login" className="block text-center px-4 py-2 rounded-lg border border-slate-200 font-medium text-sm text-slate-700">
                                        লগইন করুন
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Flash Messages */}
            {flash?.success && (
                <div className="bg-emerald-50 border-b border-emerald-200 py-3 px-4 text-center text-sm font-medium text-emerald-800 flex items-center justify-center gap-2 animate-fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>{flash.success}</span>
                </div>
            )}
            {flash?.error && (
                <div className="bg-rose-50 border-b border-rose-200 py-3 px-4 text-center text-sm font-medium text-rose-800 flex items-center justify-center gap-2 animate-fade-in">
                    <Shield className="w-4 h-4 text-rose-600" />
                    <span>{flash.error}</span>
                </div>
            )}

            {/* Main Page Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* 3. Official Civic Footer */}
            <footer className="bg-[#0F172A] text-slate-400 text-sm border-t border-slate-800 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Col 1: Govt Info */}
                        <div className="md:col-span-1 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                                    ★
                                </div>
                                <span className="font-bold text-white text-base">নাগরিক সেবা পোর্টাল</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                নাগরিকের যেকোনো সেবা সংক্রান্ত অভিযোগ সরাসরি দায়িত্বশীল কর্তৃপক্ষের কাছে পৌঁছানো এবং দ্রুত সমাধানের কেন্দ্রীয় প্ল্যাটফর্ম।
                            </p>
                            <p className="text-xs text-emerald-400 font-medium">
                                "নাগরিকের অভিযোগ → দায়িত্বশীল কর্তৃপক্ষ → কার্যকর ব্যবস্থা → সমাধান"
                            </p>
                        </div>

                        {/* Col 2: Useful Links */}
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-3">জরুরি সেবা লিংক</h4>
                            <ul className="space-y-2 text-xs">
                                <li><Link href="/submit" className="hover:text-emerald-400 transition-colors">অভিযোগ দাখিল করুন</Link></li>
                                <li><Link href="/track" className="hover:text-emerald-400 transition-colors">অভিযোগের অবস্থা ট্র্যাক করুন</Link></li>
                                <li><Link href="/how-it-works" className="hover:text-emerald-400 transition-colors">কীভাবে প্রতিকার পাবেন</Link></li>
                                <li><Link href="/faq" className="hover:text-emerald-400 transition-colors">সাধারণ জিজ্ঞাসা ও উত্তর</Link></li>
                            </ul>
                        </div>

                        {/* Col 3: Pilot Jurisdictions */}
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-3">পাইলট বাস্তবায়ন অঞ্চল</h4>
                            <p className="text-xs text-slate-400 mb-2">
                                প্রথম ধাপে বরিশাল ও কুমিল্লা জেলায় পাইলট আকারে পরিচালিত হচ্ছে।
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 text-xs border border-slate-700">বরিশাল সিটি কর্পোরেশন</span>
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 text-xs border border-slate-700">কুমিল্লা সিটি কর্পোরেশন</span>
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 text-xs border border-slate-700">বরিশাল ও কুমিল্লা সব উপজেলা</span>
                            </div>
                        </div>

                        {/* Col 4: Hotlines & Security */}
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-3">সহায়তা ও নিরাপত্তা</h4>
                            <div className="space-y-2 text-xs">
                                <p className="text-slate-300 flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                    জাতীয় তথ্য বাতায়ন: <strong className="text-white">৩৩৩</strong>
                                </p>
                                <p className="text-slate-300 flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                    জরুরি পুলিশ/ফায়ার: <strong className="text-white">৯৯৯</strong>
                                </p>
                                <p className="text-slate-300 flex items-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                                    নারী ও শিশু হেল্পলাইন: <strong className="text-white">১০৯</strong>
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
                                সংবেদনশীল অভিযোগের ক্ষেত্রে অভিযোগকারীর তথ্য সম্পূর্ণ সুরক্ষিত ও গোপন রাখা হয়।
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
                        <p>© ২০২৬ গণপ্রজাতন্ত্রী বাংলাদেশ সরকার। সর্বস্বত্ব সংরক্ষিত।</p>
                        <div className="flex items-center gap-4">
                            <Link href="/about" className="hover:text-slate-400">পরিচিতি</Link>
                            <span>•</span>
                            <Link href="/faq" className="hover:text-slate-400">গোপনীয়তা নীতি</Link>
                            <span>•</span>
                            <Link href="/faq" className="hover:text-slate-400">ব্যবহারের শর্তাবলী</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
