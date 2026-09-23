import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import StatusBadge from '@/Components/StatusBadge';
import PriorityBadge from '@/Components/PriorityBadge';
import ComplaintTimeline from '@/Components/ComplaintTimeline';
import { 
    Search, 
    MapPin, 
    Building2, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Star, 
    RotateCcw,
    Send,
    FileCheck
} from 'lucide-react';

export default function Track({ initialTrackingId, complaint, searched }) {
    const [trackingCode, setTrackingCode] = useState(initialTrackingId || '');
    const [reopenModalOpen, setReopenModalOpen] = useState(false);

    const feedbackForm = useForm({
        was_resolved: complaint?.feedback?.was_resolved || 'yes',
        satisfaction_rating: complaint?.feedback?.satisfaction_rating || 5,
        comment: complaint?.feedback?.comment || '',
        is_reopen_requested: false,
        reopen_reason: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        if (trackingCode.trim()) {
            router.get(`/track?id=${encodeURIComponent(trackingCode.trim())}`);
        }
    };

    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        feedbackForm.post(`/track/${complaint.tracking_id}/feedback`);
    };

    return (
        <PublicLayout>
            <Head title="অভিযোগের অবস্থা ট্র্যাক করুন — নাগরিক সেবা পোর্টাল" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Search Bar */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs mb-8">
                    <h1 className="text-xl font-bold text-slate-900 mb-1">অভিযোগ ট্র্যাক করুন</h1>
                    <p className="text-xs text-slate-500 mb-4">
                        আপনার অভিযোগ দাখিলের পর প্রাপ্ত ট্র্যাকিং নম্বরটি প্রবেশ করিয়ে বর্তমান অবস্থা জানুন
                    </p>

                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="উদাহরণ: CT-BAR-2026-000101"
                                value={trackingCode}
                                onChange={(e) => setTrackingCode(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-4 pr-10 text-sm font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0"
                        >
                            <Search className="w-4 h-4" />
                            <span>অনুসন্ধান</span>
                        </button>
                    </form>
                </div>

                {/* Complaint Details View */}
                {complaint ? (
                    <div className="space-y-8 animate-fade-in">
                        {/* Summary Header Card */}
                        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md border border-slate-200">
                                        {complaint.tracking_id}
                                    </span>
                                    <StatusBadge status={complaint.current_status} />
                                    <PriorityBadge priority={complaint.priority} />
                                </div>
                                <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                                    <Clock className="w-3.5 h-3.5" />
                                    দাখিলের সময়: {complaint.created_at}
                                </span>
                            </div>

                            <h2 className="text-xl font-bold text-slate-900 leading-snug mb-3">
                                {complaint.title}
                            </h2>

                            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                                {complaint.description}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-slate-800">ঘটনাস্থল</p>
                                        <p className="mt-0.5">{complaint.location_text || 'তথ্য অপ্রতুল'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Building2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-slate-800">দায়িত্বশীল কর্তৃপক্ষ</p>
                                        <p className="mt-0.5">{complaint.office_name || complaint.organization_name || 'নির্ধারণ প্রক্রিয়াধীন'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-slate-800">এসএলএ সময়সীমা</p>
                                        <p className="mt-0.5 font-mono">{complaint.due_at || 'প্রযোজ্য নয়'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Official Actions Taken (If any) */}
                        {complaint.actions?.length > 0 && (
                            <div className="bg-emerald-50/60 rounded-2xl p-6 border border-emerald-200/80 shadow-xs space-y-3">
                                <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                                    <FileCheck className="w-5 h-5 text-emerald-700" />
                                    কর্তৃপক্ষ কর্তৃক গৃহীত পদক্ষেপ ও সমাধান বিবরণ
                                </h3>
                                {complaint.actions.map((act, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-emerald-100 text-xs text-slate-700 space-y-1">
                                        <p className="leading-relaxed">{act.description}</p>
                                        <p className="text-[11px] text-slate-400 font-mono pt-1">{act.created_at}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Complaint Progress Timeline */}
                        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                            <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-emerald-700" />
                                অভিযোগ সমাধানের অগ্রগতি টাইমলাইন
                            </h3>

                            <ComplaintTimeline timeline={complaint.timeline} />
                        </div>

                        {/* Citizen Feedback Widget (When Resolved/Closed) */}
                        {complaint.can_give_feedback && (
                            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                                <h3 className="text-base font-bold text-slate-900 mb-2">
                                    নাগরিক সন্তুষ্টি মতামত
                                </h3>
                                <p className="text-xs text-slate-500 mb-6">
                                    আপনার সমস্যাটি সমাধান হয়েছে কি না তা আমাদের জানান। আপনার মতামত ভবিষ্যৎ সেবার মান বাড়াতে সাহায্য করে।
                                </p>

                                <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-2">
                                            আপনার সমস্যার সমাধান কি সঠিকভাবে হয়েছে? <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center gap-4 text-xs font-medium">
                                            {['yes', 'partially', 'no'].map((val) => (
                                                <label key={val} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="was_resolved"
                                                        value={val}
                                                        checked={feedbackForm.data.was_resolved === val}
                                                        onChange={(e) => feedbackForm.setData('was_resolved', e.target.value)}
                                                        className="text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                    <span>{val === 'yes' ? 'হ্যাঁ, সমাধান হয়েছে' : val === 'partially' ? 'আংশিক সমাধান' : 'না, সমাধান হয়নি'}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Star Rating */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-2">
                                            সেবার সন্তুষ্টি রেটিং (১ থেকে ৫ স্টার)
                                        </label>
                                        <div className="flex items-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => feedbackForm.setData('satisfaction_rating', star)}
                                                    className="p-1 hover:scale-110 transition-transform"
                                                >
                                                    <Star className={`w-6 h-6 ${
                                                        star <= feedbackForm.data.satisfaction_rating
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-slate-300'
                                                    }`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Optional Comment */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            আপনার মূল্যবান মন্তব্য বা পরামর্শ (ঐচ্ছিক)
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={feedbackForm.data.comment}
                                            onChange={(e) => feedbackForm.setData('comment', e.target.value)}
                                            placeholder="সেবা প্রাপ্তির অভিজ্ঞতা সংক্ষেপে লিখুন..."
                                            className="w-full rounded-xl border-slate-300 text-xs p-3 focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>

                                    {/* Reopen Trigger if Citizen selects No */}
                                    {feedbackForm.data.was_resolved === 'no' && (
                                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
                                            <label className="flex items-center gap-2 text-xs font-bold text-rose-800 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={feedbackForm.data.is_reopen_requested}
                                                    onChange={(e) => feedbackForm.setData('is_reopen_requested', e.target.checked)}
                                                    className="rounded text-rose-600 focus:ring-rose-500"
                                                />
                                                <span>পুনরায় খোলার আবেদন জানাতে চাই (Reopen Request)</span>
                                            </label>
                                            {feedbackForm.data.is_reopen_requested && (
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="কেন পুনরায় খুলতে চান তার কারণ লিখুন..."
                                                        value={feedbackForm.data.reopen_reason}
                                                        onChange={(e) => feedbackForm.setData('reopen_reason', e.target.value)}
                                                        className="w-full rounded-lg border-rose-300 text-xs p-2.5 bg-white"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={feedbackForm.processing}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        <span>মতামত দাখিল করুন</span>
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                ) : searched ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-800">কোনো অভিযোগ খুঁজে পাওয়া যায়নি</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            প্রদত্ত ট্র্যাকিং কোডটি পুনরায় যাচাই করে সঠিক নম্বর প্রবেশ করানোর জন্য অনুরোধ করা হচ্ছে।
                        </p>
                    </div>
                ) : null}
            </div>
        </PublicLayout>
    );
}
