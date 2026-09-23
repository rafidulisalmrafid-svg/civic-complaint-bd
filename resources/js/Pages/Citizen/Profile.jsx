import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { User, Phone, Mail, MapPin, Shield, ArrowLeft, Save } from 'lucide-react';

export default function Profile({ user }) {
    const { data, setData, post, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        nid_number: user.citizen_profile?.nid_number || '',
        address: user.citizen_profile?.address || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/citizen/profile');
    };

    return (
        <PublicLayout>
            <Head title="নাগরিক প্রোফাইল — নাগরিক সেবা পোর্টাল" />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
                <Link
                    href="/citizen"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700"
                >
                    <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান
                </Link>

                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">নাগরিক প্রোফাইল তথ্য</h1>
                            <p className="text-xs text-slate-500">আপনার মোবাইল নম্বর: <strong className="font-mono">{user.phone}</strong></p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                আপনার পূর্ণ নাম
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-xl border-slate-300 text-sm p-3 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                ইমেইল ঠিকানা (ঐচ্ছিক)
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-xl border-slate-300 text-sm p-3 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                জাতীয় পরিচয়পত্র (NID) নম্বর (ঐচ্ছিক)
                            </label>
                            <input
                                type="text"
                                value={data.nid_number}
                                onChange={(e) => setData('nid_number', e.target.value)}
                                placeholder="১০/১৩/১৭ সংখ্যার এনআইডি"
                                className="w-full rounded-xl border-slate-300 text-sm p-3 font-mono focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                বর্তমান ঠিকানা
                            </label>
                            <textarea
                                rows={3}
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                className="w-full rounded-xl border-slate-300 text-sm p-3 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                <span>{processing ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PublicLayout>
    );
}
