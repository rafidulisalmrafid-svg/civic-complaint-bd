import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Send, FileSearch, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
    return (
        <PublicLayout>
            <Head title="কীভাবে কাজ করে — ই-অভিযোগ বাক্স" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        সেবা প্রক্রিয়া
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                        ই-অভিযোগ বাক্স কীভাবে কাজ করে?
                    </h1>
                    <p className="text-sm sm:text-base text-emerald-800 font-bold mt-2 max-w-lg mx-auto">
                        আপনার সমস্যা, ডিজিটাল সমাধান।
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
                        নাগরিকের কণ্ঠস্বর সরাসরি দায়িত্বশীল কর্তৃপক্ষের কাছে পৌঁছে দেওয়ার ডিজিটাল রূপরেখা
                    </p>
                </div>

                <div className="space-y-8">
                    {[
                        {
                            num: '০১',
                            title: 'অভিযোগ দাখিল ও স্বয়ংক্রিয় ট্র্যাকিং আইডি প্রদান',
                            desc: 'নাগরিক ওয়েবসাইটের মাধ্যমে নির্ধারিত ৬টি ধাপে অভিযোগের খাত, স্থান ও বিস্তারিত বর্ণনা দিয়ে ছবি বা প্রমাণপত্রসহ আবেদন জমা দেন। সাথে সাথেই একটি অনন্য সার্ভার-জেনারেটেড ট্র্যাকিং আইডি (যেমন: CT-BAR-2026-000101) তৈরি হয়।',
                            icon: Send,
                        },
                        {
                            num: '০২',
                            title: 'বুদ্ধিমান ডাটাবেজ-ভিত্তিক রাউটিং',
                            desc: 'অভিযোগের ধরন এবং ভৌগোলিক অবস্থানের ভিত্তিতে সিস্টেম স্বয়ংক্রিয়ভাবে সংশ্লিষ্ট জেলা বা উপজেলার উপযুক্ত দপ্তর ও কর্মকর্তার তালিকায় অভিযোগটি সংযুক্ত করে। কোনো ব্যক্তি বিশেষের হাতে রাউটিং আটকে থাকে না।',
                            icon: FileSearch,
                        },
                        {
                            num: '০৩',
                            title: 'তদন্ত ও কার্যকর ব্যবস্থা গ্রহণ',
                            desc: 'দপ্তরের দায়িত্বপ্রাপ্ত কর্মকর্তা অভিযোগটি গ্রহণ করেন এবং তদন্ত শুরু করেন। প্রয়োজনীয় ক্ষেত্রে ঘটনাস্থল পরিদর্শন, কারণ দর্শানোর নোটিশ জারি বা মেরামতের উদ্যোগ গ্রহণ করা হয়। তদন্ত কর্মকর্তা সিস্টেমে অভ্যন্তরীণ নোট ও কাজের অগ্রগতি রেকর্ড করেন।',
                            icon: ShieldCheck,
                        },
                        {
                            num: '০৪',
                            title: 'সমাধান প্রস্তাব ও নাগরিক সন্তুষ্টি ফিডব্যাক',
                            desc: 'কার্যকর ব্যবস্থা গ্রহণের পর কর্মকর্তা সমাধানের লিখিত প্রতিবেদন ও ছবি আপলোড করেন। নাগরিক তার ফোনে বা ট্র্যাকিং পেজে সমাধান দেখতে পান এবং সমস্যার সুষ্ঠু সমাধান হয়েছে কি না তা ১ থেকে ৫ স্টার রেটিং দিয়ে নিশ্চিত করেন।',
                            icon: CheckCircle2,
                        },
                    ].map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <div key={idx} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xl font-mono shrink-0">
                                    {step.num}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-800 text-white text-center space-y-4 shadow-lg">
                    <h3 className="text-xl font-bold">আপনার কোনো সমস্যা বা অভিযোগ রয়েছে?</h3>
                    <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto">
                        সময় নষ্ট না করে এখনই অনলাইনে আপনার অভিযোগটি জমা দিন। সংশ্লিষ্ট কর্তৃপক্ষ অবিলম্বে পদক্ষেপ গ্রহণ করবে।
                    </p>
                    <Link
                        href="/submit"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-900 font-bold text-sm hover:bg-emerald-50 transition-colors shadow-xs"
                    >
                        অভিযোগ দাখিল করুন <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </PublicLayout>
    );
}
