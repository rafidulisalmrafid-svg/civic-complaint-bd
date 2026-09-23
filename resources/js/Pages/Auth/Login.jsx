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
                // Fallback for local testing
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

            <div className="max-w-md mx-auto px-4 py-12">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                    {/* Header */}
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xl flex items-center justify-center mx-auto mb-3">
                            ★
                        </div>
                        <h1 className="text-xl font-bold text-slate-900">লগইন পোর্টাল</h1>
                        <p className="text-xs text-slate-500 mt-1">
                            নাগরিক বা দায়িত্বপ্রাপ্ত কর্মকর্তা হিসেবে আপনার অ্যাকাউন্টে প্রবেশ করুন
                        </p>
                    </div>

                    {/* Tab Selector */}
                    <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setLoginTab('citizen')}
                            className={`py-2 rounded-lg transition-all ${
                                loginTab === 'citizen'
                                    ? 'bg-white text-emerald-800 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            সাধারণ নাগরিক (OTP)
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginTab('officer')}
                            className={`py-2 rounded-lg transition-all ${
                                loginTab === 'officer'
                                    ? 'bg-white text-emerald-800 shadow-xs'
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
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            মোবাইল নম্বর
                                        </label>
                                        <div className="relative">
                                            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                            <input
                                                type="text"
                                                value={citizenForm.data.phone}
                                                onChange={(e) => citizenForm.setData('phone', e.target.value)}
                                                placeholder="017xxxxxxxx"
                                                className="w-full rounded-xl border-slate-300 text-sm pl-9 p-2.5 font-mono focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                        {citizenForm.errors.phone && <p className="text-xs text-red-600 mt-1">{citizenForm.errors.phone}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={otpSending}
                                        className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
                                    >
                                        {otpSending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        <span>{otpSending ? 'ওটিপি পাঠানো হচ্ছে...' : 'ওটিপি (OTP) পাঠান'}</span>
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                                        <p className="font-semibold">{citizenForm.data.phone} নম্বরে ওটিপি কোড পাঠানো হয়েছে।</p>
                                        {demoOtpHint && (
                                            <p className="text-emerald-700 mt-1 font-mono font-bold">
                                                ডেমো ওটিপি কোড: {demoOtpHint}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            ৬ সংখ্যার ওটিপি কোড দিন
                                        </label>
                                        <input
                                            type="text"
                                            value={citizenForm.data.otp}
                                            onChange={(e) => citizenForm.setData('otp', e.target.value)}
                                            placeholder="123456"
                                            maxLength={6}
                                            className="w-full text-center tracking-widest font-mono text-xl font-bold rounded-xl border-slate-300 p-2.5 focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                        {citizenForm.errors.otp && <p className="text-xs text-red-600 mt-1">{citizenForm.errors.otp}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={citizenForm.processing}
                                        className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-xs transition-colors"
                                    >
                                        যাচাই করুন ও প্রবেশ করুন
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setOtpSent(false)}
                                        className="w-full text-center text-xs text-slate-500 hover:text-slate-800"
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
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    অফিসিয়াল ইমেইল অথবা মোবাইল নম্বর
                                </label>
                                <input
                                    type="text"
                                    value={officerForm.data.login}
                                    onChange={(e) => officerForm.setData('login', e.target.value)}
                                    placeholder="admin@nagorik.gov.bd"
                                    className="w-full rounded-xl border-slate-300 text-sm p-2.5 focus:border-emerald-500 focus:ring-emerald-500 font-mono"
                                />
                                {officerForm.errors.login && <p className="text-xs text-red-600 mt-1">{officerForm.errors.login}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    গোপন পাসওয়ার্ড
                                </label>
                                <input
                                    type="password"
                                    value={officerForm.data.password}
                                    onChange={(e) => officerForm.setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border-slate-300 text-sm p-2.5 focus:border-emerald-500 focus:ring-emerald-500"
                                />
                                {officerForm.errors.password && <p className="text-xs text-red-600 mt-1">{officerForm.errors.password}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={officerForm.processing}
                                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-emerald-800 text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
                            >
                                <span>লগইন করুন</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            {/* Demo Quick Fill Buttons */}
                            <div className="pt-4 border-t border-slate-100 space-y-2">
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
                                    পরীক্ষামূলক ডেমো লগইন:
                                </p>
                                <div className="grid grid-cols-1 gap-1.5 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => applyDemo('admin@nagorik.gov.bd', 'password123')}
                                        className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-left border border-slate-200 text-slate-700 flex items-center justify-between"
                                    >
                                        <span>সুপার অ্যাডমিন</span>
                                        <span className="text-[10px] text-emerald-700 font-mono font-semibold">অটো-ফিল</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyDemo('officer@barishal.gov.bd', 'password123')}
                                        className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-left border border-slate-200 text-slate-700 flex items-center justify-between"
                                    >
                                        <span>সিভিল সার্জন (বরিশাল)</span>
                                        <span className="text-[10px] text-emerald-700 font-mono font-semibold">অটো-ফিল</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyDemo('officer@cumilla.gov.bd', 'password123')}
                                        className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-left border border-slate-200 text-slate-700 flex items-center justify-between"
                                    >
                                        <span>নির্বাহী প্রকৌশলী (কুমিল্লা কুসিক)</span>
                                        <span className="text-[10px] text-emerald-700 font-mono font-semibold">অটো-ফিল</span>
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
