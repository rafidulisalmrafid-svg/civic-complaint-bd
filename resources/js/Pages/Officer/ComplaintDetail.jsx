import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import StatusBadge from '@/Components/StatusBadge';
import PriorityBadge from '@/Components/PriorityBadge';
import ComplaintTimeline from '@/Components/ComplaintTimeline';
import { 
    ArrowLeft, 
    Lock, 
    ShieldAlert, 
    Send, 
    Forward, 
    FileCheck, 
    MessageSquare, 
    FileText, 
    Check, 
    AlertCircle, 
    MapPin, 
    Building2, 
    Clock, 
    Upload,
    X
} from 'lucide-react';

export default function OfficerComplaintDetail({ complaint, offices, officers }) {
    const [activeModal, setActiveModal] = useState(null); // 'status', 'note', 'forward', 'resolve'

    // Form 1: Status Change
    const statusForm = useForm({
        status: complaint.current_status,
        remarks_bn: '',
        is_public_to_citizen: true,
    });

    // Form 2: Internal Note
    const noteForm = useForm({
        note: '',
    });

    // Form 3: Forward / Reassign
    const forwardForm = useForm({
        target_office_id: complaint.office_id || '',
        target_officer_id: '',
        instruction: '',
    });

    // Form 4: Submit Official Resolution
    const resolveForm = useForm({
        action_type: 'inspection_and_repair',
        description: '',
        proof_file: null,
    });

    const handleStatusSubmit = (e) => {
        e.preventDefault();
        statusForm.post(`/officer/complaint/${complaint.id}/status`, {
            onSuccess: () => setActiveModal(null),
        });
    };

    const handleNoteSubmit = (e) => {
        e.preventDefault();
        noteForm.post(`/officer/complaint/${complaint.id}/internal-note`, {
            onSuccess: () => {
                noteForm.reset();
                setActiveModal(null);
            },
        });
    };

    const handleForwardSubmit = (e) => {
        e.preventDefault();
        forwardForm.post(`/officer/complaint/${complaint.id}/forward`, {
            onSuccess: () => setActiveModal(null),
        });
    };

    const handleResolveSubmit = (e) => {
        e.preventDefault();
        resolveForm.post(`/officer/complaint/${complaint.id}/resolve`, {
            forceFormData: true,
            onSuccess: () => setActiveModal(null),
        });
    };

    return (
        <PublicLayout>
            <Head title={`ব্যবস্থা গ্রহণ: ${complaint.tracking_id}`} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Back to Officer Queue */}
                <Link
                    href="/officer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700"
                >
                    <ArrowLeft className="w-4 h-4" />
                    কর্মকর্তা কিউতে ফিরে যান
                </Link>

                {/* Top Action Bar */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-3 py-0.5 rounded border">
                                {complaint.tracking_id}
                            </span>
                            <StatusBadge status={complaint.current_status} />
                            <PriorityBadge priority={complaint.priority} />
                            {complaint.is_sensitive && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                                    <ShieldAlert className="w-3 h-3" /> সংবেদনশীল
                                </span>
                            )}
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 leading-snug">{complaint.title}</h1>
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => setActiveModal('status')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors shadow-xs"
                        >
                            অবস্থা পরিবর্তন
                        </button>
                        <button
                            onClick={() => setActiveModal('note')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors shadow-xs"
                        >
                            <Lock className="w-3.5 h-3.5 text-amber-700" />
                            অভ্যন্তরীণ নোট
                        </button>
                        <button
                            onClick={() => setActiveModal('forward')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-semibold transition-colors shadow-xs"
                        >
                            <Forward className="w-3.5 h-3.5 text-blue-700" />
                            ফরওয়ার্ড / বদলি
                        </button>
                        <button
                            onClick={() => setActiveModal('resolve')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
                        >
                            <FileCheck className="w-4 h-4" />
                            নিষ্পত্তি দাখিল
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Details & Timeline */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Complaint Full Details */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                অভিযোগের বিবরণ ও তথ্য
                            </h3>
                            <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-800 leading-relaxed border border-slate-100">
                                {complaint.description}
                            </div>

                            {/* Conflict of Interest Rule Guard Banner */}
                            {complaint.conflict_of_interest_detected && (
                                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs text-amber-950 flex items-start gap-3 shadow-xs">
                                    <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-extrabold text-sm text-amber-900">স্বার্থের সংঘাত রোধের সুরক্ষা রুল সক্রিয় (Conflict-of-Interest Guard)</p>
                                        <p className="mt-1 leading-relaxed">{complaint.conflict_resolution_note || 'অভিযোগটি নির্দিষ্ট কর্মকর্তার বিরুদ্ধে আনীত হওয়ায় তাঁকে দায়িত্ব থেকে বাদ দিয়ে নিরপেক্ষ অনুসন্ধান কর্তৃপক্ষ নির্ধারণ করা হয়েছে।'}</p>
                                    </div>
                                </div>
                            )}

                            {/* Specific Targeted Officer Warning */}
                            {complaint.specific_officer && (
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold">অভিযোগে উল্লিখিত সংশ্লিষ্ট ব্যক্তি বা কর্মকর্তা:</p>
                                        <p>{complaint.specific_officer.name_bn} ({complaint.specific_officer.designation_bn})</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">নিরপেক্ষ প্রশাসনিক বিধিমোতাবেক তদন্ত সম্পন্ন করুন।</p>
                                    </div>
                                </div>
                            )}

                            {/* Attached Evidence & AI Document Verification Reports */}
                            {complaint.attachments && complaint.attachments.length > 0 && (
                                <div className="pt-3 border-t border-slate-100 space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                                        <span>সংযুক্ত প্রমাণাদি ও AI ডকুমেন্ট ভেরিফিকেশন রিপোর্ট</span>
                                        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                                            {complaint.attachments.length} টি নথি
                                        </span>
                                    </h4>

                                    <div className="space-y-2">
                                        {complaint.attachments.map((att) => (
                                            <div
                                                key={att.id}
                                                className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-slate-500" />
                                                        <span className="font-bold text-slate-900">{att.original_filename}</span>
                                                        <span className="text-[10px] text-slate-400">({(att.file_size / 1024).toFixed(1)} KB)</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {att.verification_status && (
                                                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                                                att.verification_status === 'verified' || att.verification_status === 'likely_authentic'
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : att.verification_status === 'needs_manual_review'
                                                                    ? 'bg-amber-100 text-amber-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                AI স্ট্যাটাস: {att.verification_status} ({att.confidence_score}%)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* OCR & Entity Snippet */}
                                                {att.ocr_extracted_text && (
                                                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600 font-mono line-clamp-2">
                                                        <span className="text-slate-400 select-none block font-sans text-[10px] uppercase font-bold">OCR পাঠোদ্ধার:</span>
                                                        {att.ocr_extracted_text}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Custom Form Fields Data */}
                            {complaint.custom_fields_data && Object.keys(complaint.custom_fields_data).length > 0 && (
                                <div className="pt-3 border-t border-slate-100 space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">অতিরিক্ত তথ্য</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                        {Object.entries(complaint.custom_fields_data).map(([k, v]) => (
                                            <div key={k} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                                <span className="text-slate-400 block font-mono text-[10px]">{k}</span>
                                                <span className="font-semibold text-slate-800">{v || '—'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Internal Confidential Notes */}
                        <div className="bg-white rounded-2xl p-6 border border-amber-200/80 shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-amber-600" />
                                    অভ্যন্তরীণ নোট ও তদন্ত নথি (নাগরিকদের থেকে সম্পূর্ণ গোপন)
                                </h3>
                                <button
                                    onClick={() => setActiveModal('note')}
                                    className="text-xs text-amber-800 hover:underline font-semibold"
                                >
                                    + নতুন নোট লিখুন
                                </button>
                            </div>

                            {complaint.internal_notes?.length > 0 ? (
                                <div className="space-y-2">
                                    {complaint.internal_notes.map((n) => (
                                        <div key={n.id} className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-xs space-y-1">
                                            <p className="text-slate-800 leading-relaxed">{n.note}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">
                                                লেখক: {n.author?.name} • {new Date(n.created_at).toLocaleString('bn-BD')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-4">এখনো কোনো অভ্যন্তরীণ নোট যোগ করা হয়নি।</p>
                            )}
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-700" />
                                পূর্ণাঙ্গ অগ্রগতি টাইমলাইন
                            </h3>
                            <ComplaintTimeline timeline={complaint.status_histories} />
                        </div>
                    </div>

                    {/* Right 1 Col: Metadata Card */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 text-xs">
                            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b pb-2">
                                অভিযোগকারীর তথ্য
                            </h3>
                            <div>
                                <span className="text-slate-400 block">নাম</span>
                                <span className="font-semibold text-slate-800">{complaint.complainant_name}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block">মোবাইল নম্বর</span>
                                <span className="font-semibold text-slate-800 font-mono">{complaint.complainant_phone}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block">দাখিলের তারিখ</span>
                                <span className="font-semibold text-slate-800 font-mono">
                                    {new Date(complaint.created_at).toLocaleDateString('bn-BD')}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 block">এসএলএ সময়সীমা</span>
                                <span className="font-semibold text-slate-800 font-mono">
                                    {complaint.due_at ? new Date(complaint.due_at).toLocaleDateString('bn-BD') : 'প্রযোজ্য নয়'}
                                </span>
                            </div>

                            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b pt-4 pb-2">
                                ভৌগোলিক তথ্য
                            </h3>
                            <p><strong>বিভাগ:</strong> {complaint.division?.name_bn}</p>
                            <p><strong>জেলা:</strong> {complaint.district?.name_bn}</p>
                            <p><strong>উপজেলা:</strong> {complaint.upazila?.name_bn}</p>
                            <p><strong>ওয়ার্ড:</strong> {complaint.ward?.name_bn || '—'}</p>
                            <p><strong>নির্দিষ্ট স্থান:</strong> {complaint.specific_location_details || '—'}</p>
                        </div>
                    </div>
                </div>

                {/* MODAL 1: STATUS CHANGE */}
                {activeModal === 'status' && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="font-bold text-slate-900 text-sm">অভিযোগের অবস্থা পরিবর্তন</h3>
                                <button onClick={() => setActiveModal(null)}><X className="w-4 h-4 text-slate-400" /></button>
                            </div>
                            <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">নতুন অবস্থা</label>
                                    <select
                                        value={statusForm.data.status}
                                        onChange={(e) => statusForm.setData('status', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                    >
                                        <option value="under_review">পর্যালোচনাধীন (Under Review)</option>
                                        <option value="investigation_started">তদন্ত চলমান (Investigation Started)</option>
                                        <option value="action_taken">ব্যবস্থা নেওয়া হয়েছে (Action Taken)</option>
                                        <option value="rejected">বাতিল (Rejected)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">পদক্ষেপ বা পর্যালোচনার বিবরণ <span className="text-red-500">*</span></label>
                                    <textarea
                                        rows={3}
                                        value={statusForm.data.remarks_bn}
                                        onChange={(e) => statusForm.setData('remarks_bn', e.target.value)}
                                        placeholder="নাগরিকের কাছে টাইমলাইনে প্রদর্শিত হওয়ার মতো কারণ ও অগ্রগতি লিখুন..."
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                        required
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border rounded-xl">বাতিল</button>
                                    <button type="submit" disabled={statusForm.processing} className="px-5 py-2 bg-slate-800 text-white rounded-xl font-semibold">সংরক্ষণ করুন</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 2: INTERNAL NOTE */}
                {activeModal === 'note' && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                    <Lock className="w-4 h-4 text-amber-600" />
                                    গোপনীয় অভ্যন্তরীণ নোট যুক্ত করুন
                                </h3>
                                <button onClick={() => setActiveModal(null)}><X className="w-4 h-4 text-slate-400" /></button>
                            </div>
                            <form onSubmit={handleNoteSubmit} className="space-y-4 text-xs">
                                <div>
                                    <textarea
                                        rows={4}
                                        value={noteForm.data.note}
                                        onChange={(e) => noteForm.setData('note', e.target.value)}
                                        placeholder="তদন্তের অগ্রগতি, প্রত্যক্ষদর্শীর বক্তব্য বা সহকর্মীদের জন্য গোপনীয় নির্দেশনা লিখুন..."
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                        required
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border rounded-xl">বাতিল</button>
                                    <button type="submit" disabled={noteForm.processing} className="px-5 py-2 bg-amber-700 text-white rounded-xl font-semibold">নোট সংরক্ষণ</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 3: FORWARD */}
                {activeModal === 'forward' && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="font-bold text-slate-900 text-sm">অন্য দপ্তরে ফরওয়ার্ড / বদলি</h3>
                                <button onClick={() => setActiveModal(null)}><X className="w-4 h-4 text-slate-400" /></button>
                            </div>
                            <form onSubmit={handleForwardSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">লক্ষ্য কার্যালয় / অফিস</label>
                                    <select
                                        value={forwardForm.data.target_office_id}
                                        onChange={(e) => forwardForm.setData('target_office_id', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                        required
                                    >
                                        <option value="">অফিস নির্বাচন করুন</option>
                                        {offices.map(off => (
                                            <option key={off.id} value={off.id}>{off.name_bn}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">ফরওয়ার্ড নির্দেশনা <span className="text-red-500">*</span></label>
                                    <textarea
                                        rows={3}
                                        value={forwardForm.data.instruction}
                                        onChange={(e) => forwardForm.setData('instruction', e.target.value)}
                                        placeholder="যথাযথ ব্যবস্থা গ্রহণের জন্য প্রেরিত হলো..."
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                        required
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border rounded-xl">বাতিল</button>
                                    <button type="submit" disabled={forwardForm.processing} className="px-5 py-2 bg-blue-700 text-white rounded-xl font-semibold">ফরওয়ার্ড করুন</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 4: RESOLUTION PROOF */}
                {activeModal === 'resolve' && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="font-bold text-slate-900 text-sm">চূড়ান্ত সমাধান ও নিষ্পত্তি দাখিল</h3>
                                <button onClick={() => setActiveModal(null)}><X className="w-4 h-4 text-slate-400" /></button>
                            </div>
                            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">গৃহীত পদক্ষেপের ধরন</label>
                                    <select
                                        value={resolveForm.data.action_type}
                                        onChange={(e) => resolveForm.setData('action_type', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                    >
                                        <option value="inspection_and_repair">সরেজমিনে পরিদর্শন ও মেরামত সম্পন্ন</option>
                                        <option value="official_warning">কৈফিয়ত তলব ও সতর্কীকরণ নোটিশ জারি</option>
                                        <option value="fine_imposed">আইনানুগ জরিমানা ও দণ্ড প্রদান</option>
                                        <option value="service_delivered">বকেয়া নাগরিক সেবা প্রদান সম্পন্ন</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">সমাধানের স্পষ্ট বিবরণ <span className="text-red-500">*</span></label>
                                    <textarea
                                        rows={4}
                                        value={resolveForm.data.description}
                                        onChange={(e) => resolveForm.setData('description', e.target.value)}
                                        placeholder="গৃহীত ব্যবস্থার বিস্তারিত বিবরণ লিখুন (এটি নাগরিক দেখতে পাবেন)..."
                                        className="w-full rounded-xl border-slate-300 text-xs p-2.5"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">সমাধানের প্রমাণপত্র বা ছবি (ঐচ্ছিক)</label>
                                    <input
                                        type="file"
                                        onChange={(e) => resolveForm.setData('proof_file', e.target.files[0])}
                                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border rounded-xl">বাতিল</button>
                                    <button type="submit" disabled={resolveForm.processing} className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-semibold">নিষ্পত্তি নিশ্চিত করুন</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
