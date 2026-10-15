import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import AiComplaintAssistantModal from '@/Components/AiComplaintAssistantModal';
import {
    Bot,
    Sparkles,
    ShieldCheck,
    MessageSquare,
    Mic,
    ArrowRight,
    CheckCircle2,
    Clock,
    FileCheck2
} from 'lucide-react';

export default function AiAssistantPage({ currentUser }) {
    const [isAssistantOpen, setIsAssistantOpen] = useState(true);

    return (
        <PublicLayout>
            <Head title="AI-এর সাহায্যে অভিযোগ করুন — নাগরিক অভিযোগ প্রতিকার পোর্টাল" />

            <div className="bg-slate-50 min-h-screen py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* Hero Introduction */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-3xl mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <Bot className="w-9 h-9" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                            AI-চালিত নাগরিক অভিযোগ সহকারী
                        </h1>
                        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            কোনো জটিল ফরম পূরণের প্রয়োজন নেই। আপনার সমস্যাটি স্বাভাবিক ভাষায় বলুন বা লিখুন। 
                            আমাদের এআই সহকারী স্বয়ংক্রিয়ভাবে তথ্য সংগ্রহ করে সঠিক সরকারি দপ্তরে আনুষ্ঠানিক অভিযোগ প্রস্তুত করে দেবে।
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <button
                                onClick={() => setIsAssistantOpen(true)}
                                className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition flex items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                AI কথোপকথন শুরু করুন
                            </button>
                            <Link
                                href={route('complaint.track')}
                                className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition flex items-center gap-2"
                            >
                                অভিযোগের স্ট্যাটাস ট্র্যাক করুন
                            </Link>
                        </div>
                    </div>

                    {/* How It Works Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">১</div>
                            <h3 className="font-bold text-slate-900">স্বাভাবিক ভাষায় বলুন</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                বাংলা, বাংলিশ বা সাধারণ ইংরেজিতে আপনার সমস্যাটি বর্ণনা করুন অথবা ভয়েস ইনপুট ব্যবহার করুন।
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">২</div>
                            <h3 className="font-bold text-slate-900">সঠিক দপ্তর ও কর্মকর্তা নির্ধারণ</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                AI ঘটনার ধরন ও ভৌগোলিক এখতিয়ার বিশ্লেষণ করে অনুমোদিত সরকারি দপ্তর ও শাখা শনাক্ত করবে।
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">৩</div>
                            <h3 className="font-bold text-slate-900">খসড়া অনুমোদন ও ট্র্যাকিং</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                চূড়ান্ত আবেদনপত্র যাচাইয়ের পর আপনার সম্মতিতে জমা হবে এবং সাথে সাথে ট্র্যাকিং আইডি প্রদান করা হবে।
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Assistant Modal Integration */}
            <AiComplaintAssistantModal
                isOpen={isAssistantOpen}
                onClose={() => setIsAssistantOpen(false)}
            />
        </PublicLayout>
    );
}
