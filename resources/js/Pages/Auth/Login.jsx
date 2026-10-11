import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Phone, Lock, ArrowRight, Shield, CheckCircle2, User, KeyRound, Loader2 } from 'lucide-react';

export default function Login({ demoCredentials }) {
    const [loginTab, setLoginTab] = useState('citizen'); // 'citizen' or 'officer'
    const [otpSent, setOtpSent] = useState(false);
    const [otpSending, setOtpSending] = useState(false);
    const [demoOtpHint, setDemoOtpHint] = useState('');

    // Citizen OTP Form
    const citizenForm = useForm({
        phone: '01711223344',
        otp: '',
    });

    // Officer / Admin Password Form
    const officerForm = useForm({
        login: 'admin@nagorik.gov.bd',
        password: 'password123',
        remember: true,
    });

    const handleSendOtp = (e) => {
        e.preventDefault();
        setOtpSending(true);
        fetch('/auth/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ phone: citizenForm.data.phone }),
        })
            .then(res => res.json())
            .then(res => {
                setOtpSending(false);
                if (res.success) {
                    setOtpSent(true);
                    if (res.demo_code) {
                        setDemoOtpHint(res.demo_code);
                        citizenForm.setData('otp', res.demo_code);
                    }
                } else {
                    alert(res.message || 'ওটিপি পাঠাতে সমস্যা হয়েছে।');
                }
            })
            .catch(() => {
                setOtpSending(false);
                setOtpSent(true);
                setDemoOtpHint('123456');
                citizenForm.setData('otp', '123456');
            });
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        citizenForm.post('/auth/verify-otp');
    };

    const handleOfficerLogin = (e) => {
        e.preventDefault();
        officerForm.post('/login/password');
    };

    const applyDemo = (email, password) => {
        officerForm.setData({
            login: email,
            password: password,
            remember: true,
        });
    };

    return (
        <PublicLayout>
            <Head title="লগইন — নাগরিক সেবা ও কর্মকর্তা পোর্টাল" />

            <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-16">
                <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-xl shadow-slate-200/50 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-950 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md ring-4 ring-emerald-100">
                            ★
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">লগইন পোর্টাল</h1>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
                            নাগরিক হিসেবে অভিযোগ ট্র্যাকিং অথবা কর্মকর্তা হিসেবে দায়িত্ব পালনে প্রবেশ করুন
                        </p>
                    </div>

                    {/* Tab Selector */}
                    <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => setLoginTab('citizen')}
                            className={`py-2.5 rounded-xl transition-all ${
                                loginTab === 'citizen'
                                    ? 'bg-white text-emerald-800 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            সাধারণ নাগরিক (OTP)
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginTab('officer')}
                            className={`py-2.5 rounded-xl transition-all ${
                                loginTab === 'officer'
                                    ? 'bg-white text-emerald-800 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            কর্মকর্তা / অ্যাডমিন
                        </button>
                    </div>

                    {/* TAB 1: CITIZEN MOBILE OTP LOGIN */}
                    {loginTab === 'citizen' && (
                        <div className="space-y-4 animate-fade-in">
                            {!otpSent ? (
                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            মোবাইল নম্বর
                                        </label>
                                        <div className="relative">
                                            <Phone className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
                                            <input
                                                type="text"
                                                value={citizenForm.data.phone}
                                                onChange={(e) => citizenForm.setData('phone', e.target.value)}
                                                placeholder="017xxxxxxxx"
                                                className="w-full rounded-2xl border-slate-300 text-sm pl-10 py-3 font-mono focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                        {citizenForm.errors.phone && <p className="text-xs text-red-600 mt-1">{citizenForm.errors.phone}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={otpSending}
                                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        {otpSending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        <span>{otpSending ? 'ওটিপি পাঠানো হচ্ছে...' : 'ওটিপি (OTP) পাঠান'}</span>
                                    </button>

                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600">
                                        ডেমো নাগরিক নম্বর: <strong className="font-mono text-slate-900">01711223344</strong> (স্বয়ংক্রিয় ওটিপি: <strong className="font-mono text-emerald-700">123456</strong>)
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800">
                                        <p className="font-semibold">{citizenForm.data.phone} নম্বরে ৬ সংখ্যার ওটিপি পাঠানো হয়েছে।</p>
                                        {demoOtpHint && (
                                            <p className="text-emerald-800 mt-1 font-mono font-bold">
                                                ডেমো ওটিপি কোড: {demoOtpHint}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            ৬ সংখ্যার ওটিপি কোড দিন
                                        </label>
                                        <input
                                            type="text"
                                            value={citizenForm.data.otp}
                                            onChange={(e) => citizenForm.setData('otp', e.target.value)}
                                            placeholder="123456"
                                            maxLength={6}
                                            className="w-full text-center tracking-widest font-mono text-2xl font-extrabold rounded-2xl border-slate-300 py-3 focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                        {citizenForm.errors.otp && <p className="text-xs text-red-600 mt-1">{citizenForm.errors.otp}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={citizenForm.processing}
                                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
                                    >
                                        যাচাই করুন ও প্রবেশ করুন
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setOtpSent(false)}
                                        className="w-full text-center text-xs text-slate-500 hover:text-slate-800 pt-1"
                                    >
                                        ভিন্ন নম্বর ব্যবহার করুন
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* TAB 2: OFFICER / ADMIN CREDENTIAL LOGIN */}
                    {loginTab === 'officer' && (
                        <form onSubmit={handleOfficerLogin} className="space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    অফিসিয়াল ইমেইল অথবা মোবাইল নম্বর
                                </label>
                                <input
                                    type="text"
                                    value={officerForm.data.login}
                                    onChange={(e) => officerForm.setData('login', e.target.value)}
                                    placeholder="admin@nagorik.gov.bd"
                                    className="w-full rounded-2xl border-slate-300 text-sm py-3 px-4 focus:border-emerald-500 focus:ring-emerald-500 font-mono"
                                />
                                {officerForm.errors.login && <p className="text-xs text-red-600 mt-1">{officerForm.errors.login}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    গোপন পাসওয়ার্ড
                                </label>
                                <input
                                    type="password"
                                    value={officerForm.data.password}
                                    onChange={(e) => officerForm.setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-2xl border-slate-300 text-sm py-3 px-4 focus:border-emerald-500 focus:ring-emerald-500"
                                />
                                {officerForm.errors.password && <p className="text-xs text-red-600 mt-1">{officerForm.errors.password}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={officerForm.processing}
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-emerald-800 hover:to-teal-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                <span>লগইন করুন</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            {/* Demo Quick Fill Buttons */}
                            <div className="pt-4 border-t border-slate-100 space-y-2">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                                    ১-ক্লিক পরীক্ষামূলক ডেমো লগইন:
                                </p>
                                <div className="grid grid-cols-1 gap-2 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => applyDemo('admin@nagorik.gov.bd', 'password123')}
                                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-left border border-slate-200 hover:border-emerald-300 text-slate-700 flex items-center justify-between transition-all"
                                    >
                                        <div>
                                            <span className="font-bold text-slate-900 block">সুপার অ্যাডমিনিস্ট্রেটর</span>
                                            <span className="text-[11px] text-slate-500 font-mono">admin@nagorik.gov.bd</span>
                                        </div>
                                        <span className="text-[11px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md font-bold">অটো-ফিল</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyDemo('officer@barishal.gov.bd', 'password123')}
                                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-left border border-slate-200 hover:border-emerald-300 text-slate-700 flex items-center justify-between transition-all"
                                    >
                                        <div>
                                            <span className="font-bold text-slate-900 block">সিভিল সার্জন (বরিশাল)</span>
                                            <span className="text-[11px] text-slate-500 font-mono">officer@barishal.gov.bd</span>
                                        </div>
                                        <span className="text-[11px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md font-bold">অটো-ফিল</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyDemo('officer@cumilla.gov.bd', 'password123')}
                                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-left border border-slate-200 hover:border-emerald-300 text-slate-700 flex items-center justify-between transition-all"
                                    >
                                        <div>
                                            <span className="font-bold text-slate-900 block">নির্বাহী প্রকৌশলী (কুমিল্লা কুসিক)</span>
                                            <span className="text-[11px] text-slate-500 font-mono">officer@cumilla.gov.bd</span>
                                        </div>
                                        <span className="text-[11px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md font-bold">অটো-ফিল</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
