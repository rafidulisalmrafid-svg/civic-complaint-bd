import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, Headphones } from 'lucide-react';

export default function Contact() {
    const [submitted, setSubmitted] = useState(false);

    return (
        <PublicLayout>
            <Head title="যোগাযোগ ও নাগরিক সহায়তা — নাগরিক অভিযোগ পোর্টাল" />

            <div className="bg-slate-50 min-h-screen py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                                    <Headphones className="w-3.5 h-3.5" />
                                    ২৪/৭ নাগরিক সেবা ও অভিযোগ হেল্পলাইন
                                </span>
                                <h1 className="text-3xl font-extrabold text-slate-900">যোগাযোগ ও নাগরিক সহায়তা কেন্দ্র</h1>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    প্ল্যাটফর্ম সংক্রান্ত যেকোনো প্রযুক্তিগত জিজ্ঞাসা, সহায়তা বা অভিযোগ নিষ্পত্তির তথ্যের জন্য আমাদের সঙ্গে যোগাযোগ করুন।
                                </p>
                            </div>

                            <div className="space-y-4 text-sm text-slate-600">
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 block">সরকারি জরুরি হেল্পলাইন</span>
                                        <span className="font-bold text-slate-900 text-base">৩৩৩ (টোল ফ্রি) অথবা ১৬১২৩</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 block">ইমেইল সহায়তা</span>
                                        <span className="font-bold text-slate-900 text-base">support@grievance.gov.bd</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 block">কেন্দ্রীয় কার্যালয়</span>
                                        <span className="font-medium text-slate-800">মন্ত্রিপরিষদ বিভাগ ও আইসিটি টাওয়ার, আগারগাঁও, ঢাকা-১২০৭</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 space-y-4">
                            <h2 className="text-lg font-bold text-slate-900">সরাসরি বার্তা পাঠান</h2>
                            {submitted ? (
                                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                                    <h3 className="font-bold text-emerald-900">আপনার বার্তা গৃহীত হয়েছে</h3>
                                    <p className="text-xs text-emerald-700">আমাদের সহায়তা প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করবেন।</p>
                                </div>
                            ) : (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        setSubmitted(true);
                                    }}
                                    className="space-y-4 text-xs"
                                >
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">আপনার নাম</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                            placeholder="নাম লিখুন"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর</label>
                                        <input
                                            type="tel"
                                            required
                                            className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                            placeholder="০১৭১XXXXXXXX"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">বার্তা বা জিজ্ঞাসা</label>
                                        <textarea
                                            rows={4}
                                            required
                                            className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                            placeholder="আপনার প্রশ্ন বা মতামত বিস্তারিত লিখুন..."
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        বার্তা পাঠান
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
