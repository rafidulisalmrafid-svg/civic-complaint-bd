import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FileCheck2,
    AlertTriangle,
    ShieldAlert,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    FileText,
    Eye,
    ExternalLink,
    RefreshCw,
    Calendar,
    Building2,
    User,
    Hash,
    Shield,
    Clock,
    Check,
    X,
    Info,
    FileQuestion
} from 'lucide-react';

export default function DocumentQueue({ documents, stats, currentFilter }) {
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewDecision, setReviewDecision] = useState('approved');
    const [reviewNotes, setReviewNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ocrModalOpen, setOcrModalOpen] = useState(false);

    const filterTabs = [
        { id: 'all', label: 'সকল নথি', count: stats.total },
        { id: 'pending', label: 'রিভিউ অপেক্ষমাণ', count: stats.pending, highlight: true },
        { id: 'needs_manual_review', label: 'ম্যানুয়াল রিভিউ প্রয়োজন', count: stats.needs_review },
        { id: 'potentially_manipulated', label: 'সম্ভাব্য পরিবর্তন/সন্দেহজনক', count: stats.manipulated, danger: true },
        { id: 'verified', label: 'যাচাইকৃত (Verified)', count: stats.verified },
    ];

    const handleFilterChange = (filterId) => {
        router.get(route('admin.documents'), { status: filterId }, { preserveState: true });
    };

    const openReviewModal = (doc, decision) => {
        setSelectedDoc(doc);
        setReviewDecision(decision);
        setReviewNotes('');
        setReviewModalOpen(true);
    };

    const submitReview = (e) => {
        e.preventDefault();
        if (!selectedDoc) return;

        setIsSubmitting(true);
        router.post(route('admin.documents.review', selectedDoc.id), {
            admin_review_status: reviewDecision,
            admin_review_notes: reviewNotes,
        }, {
            onSuccess: () => {
                setReviewModalOpen(false);
                setIsSubmitting(false);
                setSelectedDoc(null);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'verified':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> যাচাইকৃত (Verified)
                    </span>
                );
            case 'likely_authentic':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> সামঞ্জস্যপূর্ণ (Likely Authentic)
                    </span>
                );
            case 'needs_manual_review':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3.5 h-3.5" /> ম্যানুয়াল রিভিউ আবশ্যক
                    </span>
                );
            case 'potentially_manipulated':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        <ShieldAlert className="w-3.5 h-3.5" /> সম্ভাব্য অসঙ্গতি (Flagged)
                    </span>
                );
            case 'security_rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" /> নিরাপত্তা কারণে বাতিল
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <FileQuestion className="w-3.5 h-3.5" /> পর্যালোচনাধীন (Unverifiable)
                    </span>
                );
        }
    };

    const getDocTypeLabel = (type) => {
        const map = {
            nid: 'জাতীয় পরিচয়পত্র (NID)',
            prescription: 'প্রেসক্রিপশন / মেডিকেল রিপোর্ট',
            receipt: 'ট্রেজারি চালান / রসিদ',
            land_record: 'খতিয়ান / নামজারি পর্চা',
            utility_bill: 'বিদ্যুৎ / ইউটিলিটি বিল',
            application_letter: 'আবেদনপত্র / দরখাস্ত',
            photo_evidence: 'ঘটনাস্থলের ছবি / প্রমাণ',
            web_link: 'ওয়েব রেফারেন্স লিংক',
        };
        return map[type] || 'অন্যান্য সংযুক্তি';
    };

    return (
        <AdminLayout>
            <Head title="ডকুমেন্ট যাচাই কিউ (AI Verification Queue)" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                                <FileCheck2 className="w-6 h-6" />
                            </span>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">ডকুমেন্ট যাচাই ও প্রমাণ পর্যালোচনা কিউ</h1>
                                <p className="text-sm text-slate-500">
                                    AI-Assisted Document Verification Pipeline — OCR, এনটিটি এক্সট্রাকশন ও অসঙ্গতি বিশ্লেষণ
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs text-slate-600">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <span>দ্বৈত স্তরের মানবিক যাচাইকরণ সক্রিয় (Human-in-the-loop)</span>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                    {filterTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleFilterChange(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                currentFilter === tab.id
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                    currentFilter === tab.id
                                        ? 'bg-white/20 text-white'
                                        : tab.danger
                                        ? 'bg-red-100 text-red-700'
                                        : tab.highlight
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-slate-100 text-slate-700'
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Documents Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">সংযুক্ত প্রমাণ ও ফাইল</th>
                                    <th className="px-6 py-4">অভিযোগ ও দপ্তর</th>
                                    <th className="px-6 py-4">ডকুমেন্টের ধরন ও কনফিডেন্স</th>
                                    <th className="px-6 py-4">AI যাচাই স্থিতি</th>
                                    <th className="px-6 py-4">অ্যাডমিন সিদ্ধান্ত</th>
                                    <th className="px-6 py-4 text-right">কার্যক্রম</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {documents.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                            <p className="text-base font-medium">এই ফিল্টারে কোনো ডকুমেন্ট পাওয়া যায়নি</p>
                                        </td>
                                    </tr>
                                ) : (
                                    documents.data.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900 line-clamp-1">
                                                            {doc.original_filename}
                                                        </div>
                                                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                                            <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                                                            <span>•</span>
                                                            <span>{doc.mime_type}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                {doc.complaint ? (
                                                    <div>
                                                        <a
                                                            href={route('complaint.track', { id: doc.complaint.tracking_id })}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="font-mono font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                                                        >
                                                            {doc.complaint.tracking_id}
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                        <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                                            {doc.complaint.office?.name_bn || doc.complaint.category?.name_bn}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">অসংযুক্ত</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="space-y-1.5">
                                                    <div className="font-medium text-slate-800 text-xs">
                                                        {getDocTypeLabel(doc.document_type)}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${
                                                                    doc.confidence_score >= 75
                                                                        ? 'bg-emerald-500'
                                                                        : doc.confidence_score >= 50
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-red-500'
                                                                }`}
                                                                style={{ width: `${doc.confidence_score}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600">
                                                            {doc.confidence_score}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                {getStatusBadge(doc.verification_status)}
                                                {doc.is_duplicate && (
                                                    <span className="block mt-1 text-[11px] font-semibold text-amber-600">
                                                        ⚠ ডুপ্লিকেট ফাইল শনাক্ত
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                {doc.admin_review_status === 'approved' ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                                                        <Check className="w-3.5 h-3.5" /> অনুমোদিত
                                                    </span>
                                                ) : doc.admin_review_status === 'rejected' ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                                                        <X className="w-3.5 h-3.5" /> প্রত্যাখ্যাত
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                                                        <Clock className="w-3.5 h-3.5 text-amber-500" /> অপেক্ষমাণ
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {doc.ocr_extracted_text && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedDoc(doc);
                                                                setOcrModalOpen(true);
                                                            }}
                                                            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                            title="OCR বিশ্লেষণ দেখুন"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => openReviewModal(doc, 'approved')}
                                                        className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                                                    >
                                                        অনুমোদন
                                                    </button>
                                                    <button
                                                        onClick={() => openReviewModal(doc, 'rejected')}
                                                        className="px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition"
                                                    >
                                                        বাতিল
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* OCR Extracted Text & Inspection Modal */}
            {ocrModalOpen && selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-600" />
                                    AI ডকুমেন্ট বিশ্লেষণ ও OCR রিপোর্ট
                                </h3>
                                <p className="text-xs text-slate-500">{selectedDoc.original_filename}</p>
                            </div>
                            <button
                                onClick={() => setOcrModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto space-y-4 flex-1 pr-1">
                            {/* Flags */}
                            {selectedDoc.analysis_flags && selectedDoc.analysis_flags.length > 0 && (
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                                    <h4 className="text-xs font-bold text-slate-700 uppercase">শনাক্ত করা বৈশিষ্ট্য ও অ্যালার্ট:</h4>
                                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                                        {selectedDoc.analysis_flags.map((flag, idx) => (
                                            <li key={idx}>{flag}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Extracted Entities */}
                            {selectedDoc.extracted_entities && (
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-slate-400 block">শনাক্ত ব্যক্তি:</span>
                                        <span className="font-semibold text-slate-800">{selectedDoc.extracted_entities.name || 'অজ্ঞাত'}</span>
                                    </div>
                                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-slate-400 block">স্মারক / রেফারেন্স নং:</span>
                                        <span className="font-semibold text-slate-800">{selectedDoc.extracted_entities.ref_number || 'অনুল্লিখিত'}</span>
                                    </div>
                                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-slate-400 block">তারিখ:</span>
                                        <span className="font-semibold text-slate-800">{selectedDoc.extracted_entities.date || 'অনুল্লিখিত'}</span>
                                    </div>
                                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-slate-400 block">প্রতিষ্ঠান:</span>
                                        <span className="font-semibold text-slate-800">{selectedDoc.extracted_entities.institution || 'অনুল্লিখিত'}</span>
                                    </div>
                                </div>
                            )}

                            {/* OCR Text Box */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">OCR রিড করা টেক্সট কন্টেন্ট:</label>
                                <div className="p-3.5 bg-slate-900 text-slate-100 text-xs font-mono rounded-xl max-h-48 overflow-y-auto leading-relaxed border border-slate-800">
                                    {selectedDoc.ocr_extracted_text || 'টেক্সট পাঠোদ্ধার করা সম্ভব হয়নি।'}
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setOcrModalOpen(false)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl"
                            >
                                বন্ধ করুন
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Review Action Modal */}
            {reviewModalOpen && selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <form
                        onSubmit={submitReview}
                        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
                    >
                        <h3 className="text-lg font-bold text-slate-900">ডকুমেন্ট রিভিউ সিদ্ধান্ত</h3>
                        <p className="text-xs text-slate-500">
                            ফাইল: <span className="font-medium text-slate-800">{selectedDoc.original_filename}</span>
                        </p>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase">সিদ্ধান্ত:</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setReviewDecision('approved')}
                                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                                        reviewDecision === 'approved'
                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    অনুমোদন (Valid)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReviewDecision('rejected')}
                                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                                        reviewDecision === 'rejected'
                                            ? 'bg-red-600 text-white border-red-600'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    বাতিল (Reject)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReviewDecision('escalated')}
                                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                                        reviewDecision === 'escalated'
                                            ? 'bg-amber-600 text-white border-amber-600'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    ঊর্ধ্বতন তদন্ত
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                প্রশাসনিক মন্তব্য / নোট (ঐচ্ছিক):
                            </label>
                            <textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                rows={3}
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="যাচাইকরণ পর্যবেক্ষণ লিখুন..."
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setReviewModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                            >
                                বাতিল
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-sm disabled:opacity-50"
                            >
                                {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সিদ্ধান্ত কার্যকর করুন'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AdminLayout>
    );
}
