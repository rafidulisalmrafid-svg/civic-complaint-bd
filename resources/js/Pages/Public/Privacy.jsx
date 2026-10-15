import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { ShieldCheck, Lock, EyeOff, FileText, CheckCircle2, UserCheck, Server } from 'lucide-react';

export default function Privacy() {
    return (
        <PublicLayout>
            <Head title="গোপনীয়তা ও ডেটা সুরক্ষা নীতিমালা — নাগরিক অভিযোগ পোর্টাল" />

            <div className="bg-slate-50 min-h-screen py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl">
                                <ShieldCheck className="w-8 h-8" />
                            </span>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">গোপনীয়তা ও ডেটা সুরক্ষা নীতিমালা</h1>
                                <p className="text-xs text-slate-500">সর্বশেষ হালনাগাদ: অক্টোবর ২০২৬ | গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</p>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed space-y-4">
                            <p>
                                নাগরিক অভিযোগ প্রতিকার ব্যবস্থাপনা প্ল্যাটফর্ম বাংলাদেশের নাগরিকদের তথ্যের সর্বোচ্চ গোপনীয়তা এবং সাইবার নিরাপত্তা নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ। 
                                নাগরিক সেবা প্রদানে স্বচ্ছতা এবং দায়বদ্ধতা বজায় রাখাই এই প্ল্যাটফর্মের মূল লক্ষ্য।
                            </p>

                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <EyeOff className="w-4 h-4 text-indigo-600" />
                                ১. পরিচয় গোপন রাখার অধিকার (Anonymous Complaints)
                            </h3>
                            <p>
                                সংবেদনশীল বা দুর্নীতির অভিযোগ দাখিলের ক্ষেত্রে নাগরিক চাইলে সম্পূর্ণ পরিচয় গোপন রাখতে পারেন। 
                                সেক্ষেত্রে সিস্টেমে কোনো ব্যক্তিগত নাম বা মোবাইল নম্বর প্রকাশিত হবে না।
                            </p>

                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-indigo-600" />
                                ২. এন্ড-টু-এন্ড এনক্রিপশন ও নিরাপদ ফাইল স্টোরেজ
                            </h3>
                            <p>
                                আপলোড করা সকল দলিল, প্রমাণপত্র, ছবি ও ভিডিও প্রাইভেট অবজেক্ট স্টোরেজে এনক্রিপ্ট করে সংরক্ষিত হয়। 
                                অনুমোদিত তদন্ত কর্মকর্তা ব্যতীত অন্য কারও প্রবেশাধিকার নেই।
                            </p>

                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Server className="w-4 h-4 text-indigo-600" />
                                ৩. এআই প্রসেসিং ও প্রম্পট ইনজেকশন সুরক্ষা
                            </h3>
                            <p>
                                আপলোড করা নথিপত্রকে এআই শুধুমাত্র টেক্সট বিশ্লেষণের ডেটা হিসেবে গ্রহণ করে; ডকুমেন্টের ভেতরে থাকা কোনো নির্দেশনাকে সিস্টেমের কমান্ড হিসেবে বিবেচনা করা হয় না।
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
