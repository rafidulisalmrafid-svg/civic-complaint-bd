import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    MapPin,
    Building2,
    Users,
    FolderTree,
    Sliders,
    History,
    Search,
    Plus,
    LogOut,
    Bell,
    ChevronRight,
    Menu,
    X,
    Shield,
    ExternalLink,
    FileText
} from 'lucide-react';

export default function AdminLayout({ children, title, subtitle }) {
    const { auth, flash } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const currentUrl = window.location.pathname;

    const navItems = [
        { name: 'ড্যাশবোর্ড', href: '/admin', icon: LayoutDashboard },
        { name: 'মানচিত্র বিশ্লেষণ', href: '/admin/map', icon: MapPin },
        { name: 'স্থান ও কাঠামো', href: '/admin/geography', icon: FolderTree },
        { name: 'দপ্তর ও সংস্থা', href: '/admin/organizations', icon: Building2 },
        { name: 'কর্মকর্তা তালিকা', href: '/admin/officers', icon: Users },
        { name: 'অভিযোগের ধরন ও ফর্ম', href: '/admin/categories', icon: Sliders },
        { name: 'রাউটিং ও এসএলএ', href: '/admin/rules', icon: Shield },
        { name: 'অডিট ট্রেইল', href: '/admin/audit', icon: History },
    ];

    const handleSearch = (e) => {
        const q = e.target.value;
        setSearchQuery(q);
        if (q.length >= 2) {
            setIsSearching(true);
            fetch(`/admin/search?q=${encodeURIComponent(q)}`)
                .then(res => res.json())
                .then(data => {
                    setSearchResults(data);
                    setIsSearching(false);
                })
                .catch(() => setIsSearching(false));
        } else {
            setSearchResults(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex lg:flex-col w-64 bg-[#0F172A] text-slate-300 border-r border-slate-800 shrink-0 select-none">
                {/* Brand */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                        ★
                    </div>
                    <div>
                        <span className="font-bold text-white text-sm block">কেন্দ্রীয় অ্যাডমিন প্যানেল</span>
                        <span className="text-[10px] text-emerald-400 font-mono block">নাগরিক সেবা ও প্রতিকার</span>
                    </div>
                </div>

                {/* Nav Links */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        মূল ব্যবস্থাপনা
                    </div>
                    {navItems.map((item, idx) => {
                        const Icon = item.icon;
                        const isActive = currentUrl === item.href || (item.href !== '/admin' && currentUrl.startsWith(item.href));
                        return (
                            <Link
                                key={idx}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                                    isActive 
                                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' 
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}

                    <div className="pt-4 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        পোর্টাল লিঙ্ক
                    </div>
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/40"
                    >
                        <span className="flex items-center gap-2">
                            <ExternalLink className="w-3.5 h-3.5" />
                            নাগরিক পোর্টাল
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">পাবলিক</span>
                    </Link>
                </div>

                {/* Admin Profile */}
                <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/40">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            অ্যা
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-semibold text-white truncate">{auth.user?.name}</p>
                            <p className="text-[10px] text-emerald-400 truncate">সুপার অ্যাডমিনিস্ট্রেটর</p>
                        </div>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                        title="লগআউট"
                    >
                        <LogOut className="w-4 h-4" />
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Global Search with instant popup */}
                        <div className="relative max-w-md w-full hidden sm:block">
                            <input
                                type="text"
                                placeholder="অভিযোগ নম্বর, সংস্থা বা কর্মকর্তা খুঁজুন..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />

                            {searchResults && (
                                <div className="absolute left-0 right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 text-xs space-y-2">
                                    {searchResults.complaints?.length > 0 && (
                                        <div>
                                            <p className="font-bold text-slate-500 uppercase text-[10px] mb-1">অভিযোগ</p>
                                            {searchResults.complaints.map(c => (
                                                <Link key={c.id} href={`/track?id=${c.tracking_id}`} className="block p-1.5 hover:bg-slate-50 rounded">
                                                    <span className="font-mono font-bold text-emerald-700">{c.tracking_id}</span> — {c.title}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                    {searchResults.organizations?.length > 0 && (
                                        <div>
                                            <p className="font-bold text-slate-500 uppercase text-[10px] mb-1">সংস্থা / দপ্তর</p>
                                            {searchResults.organizations.map(o => (
                                                <div key={o.id} className="p-1.5 text-slate-700">{o.name_bn}</div>
                                            ))}
                                        </div>
                                    )}
                                    {searchResults.officers?.length > 0 && (
                                        <div>
                                            <p className="font-bold text-slate-500 uppercase text-[10px] mb-1">কর্মকর্তা</p>
                                            {searchResults.officers.map(off => (
                                                <div key={off.id} className="p-1.5 text-slate-700">{off.name_bn} ({off.designation_bn})</div>
                                            ))}
                                        </div>
                                    )}
                                    {searchResults.complaints?.length === 0 && searchResults.organizations?.length === 0 && (
                                        <p className="text-slate-400 text-center py-2">কোনো মিল খুঁজে পাওয়া যায়নি</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/geography"
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            নতুন কাঠামো
                        </Link>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            পাইলট: বরিশাল + কুমিল্লা
                        </span>
                    </div>
                </header>

                {/* Content Banner */}
                {(title || subtitle) && (
                    <div className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-5">
                        {title && <h1 className="text-xl font-bold text-slate-900">{title}</h1>}
                        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
                    </div>
                )}

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mx-4 sm:mx-8 mt-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
                        <span>✓</span> {flash.success}
                    </div>
                )}

                {/* Body Content */}
                <main className="p-4 sm:p-8 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
