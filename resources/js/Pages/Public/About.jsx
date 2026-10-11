import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Shield, Target, Users, MapPin, Building2, CheckCircle2 } from 'lucide-react';

export default function About() {
    return (
        <PublicLayout>
            <Head title="প্ল্যাটফর্ম পরিচিতি — ই-অভিযোগ বাক্স" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                <div className="text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        আমাদের লক্ষ্য ও দর্শন
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                        ই-অভিযোগ বাক্স
                    </h1>
                    <p className="text-sm sm:text-base text-emerald-800 font-bold mt-2 max-w-xl mx-auto">
                        আপনার সমস্যা, ডিজিটাল সমাধান।
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">
                        একটি জবাবদিহিতামূলক, গতিশীল ও জনবান্ধব আধুনিক প্রশাসনিক সেবামুখী রূপরেখা
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-4 text-slate-700 text-sm leading-relaxed">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                        মূল দর্শন
                    </h2>
                    <p>
                        গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের নাগরিক সেবা সহজীকরণ এবং সরকারি সেবাদানকারী প্রতিষ্ঠানগুলোর জবাবদিহিতা নিশ্চিত করার উদ্দেশ্যে এই প্ল্যাটফর্মটি তৈরি করা হয়েছে। পুরাতন ধাঁচের জটিল আমলাতান্ত্রিক প্রক্রিয়ার বদলে নাগরিকের কাছে সরাসরি আধুনিক ওয়েব ও মোবাইলবান্ধব সেবাব্যবস্থা পৌঁছে দেওয়াই এর মূল লক্ষ্য।
                    </p>
                    <p>
                        প্ল্যাটফর্মটির কেন্দ্রীয় মূলমন্ত্র:
                    </p>
                    <blockquote className="p-4 rounded-xl bg-emerald-50 border-l-4 border-emerald-600 font-bold text-emerald-900 text-base">
                        "নাগরিকের অভিযোগ → দায়িত্বশীল কর্তৃপক্ষ → কার্যকর ব্যবস্থা → সমাধান"
                    </blockquote>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                            <Target className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-base text-slate-900">স্বচ্ছতা ও জবাবদিহিতা</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            প্রতিটি অভিযোগের রিয়েল-টাইম ট্র্যাকিং এবং টাইমলাইন জনসাধারণের জন্য উন্মুক্ত।
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-base text-slate-900">নিরাপত্তা ও গোপনীয়তা</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            বেনামী অভিযোগের পূর্ণ সুবিধা ও সংবেদনশীল অভিযোগের জন্য কঠোর অভ্যন্তরীণ নিরাপত্তা স্তর।
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-base text-slate-900">বরিশাল ও কুমিল্লা পাইলট</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            প্রথমে দুটি নির্বাচিত গুরুত্বপূর্ণ বিভাগীয় জেলায় পাইলট রূপায়নের পর এটি পুরো বাংলাদেশে বিস্তৃত হবে।
                        </p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
