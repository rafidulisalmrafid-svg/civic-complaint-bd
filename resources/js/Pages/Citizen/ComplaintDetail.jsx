import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import StatusBadge from '@/Components/StatusBadge';
import PriorityBadge from '@/Components/PriorityBadge';
import ComplaintTimeline from '@/Components/ComplaintTimeline';
import { ArrowLeft, MapPin, Building2, Calendar, Clock, FileText, CheckCircle2 } from 'lucide-react';

export default function ComplaintDetail({ complaint }) {
    return (
        <PublicLayout>
            <Head title={`অভিযোগ ${complaint.tracking_id} — বিস্তারিত`} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                {/* Back Button */}
                <Link
                    href="/citizen"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    ড্যাশবোর্ডে ফিরে যান
                </Link>

                {/* Main Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold px-3 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
                                {complaint.tracking_id}
                            </span>
                            <StatusBadge status={complaint.current_status} />
                            <PriorityBadge priority={complaint.priority} />
                        </div>
                        <span className="text-xs text-slate-500 font-mono">
                            দাখিলের সময়: {new Date(complaint.created_at).toLocaleString('bn-BD')}
                        </span>
                    </div>

                    <div>
                        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
                            {complaint.category?.name_bn} {complaint.subcategory ? `• ${complaint.subcategory.name_bn}` : ''}
                        </span>
                        <h1 className="text-2xl font-bold text-slate-900 leading-snug">
                            {complaint.title}
                        </h1>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed">
                        {complaint.description}
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 pt-3 border-t border-slate-100">
                        <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-slate-800">ঘটনাস্থল</p>
                                <p className="mt-0.5">
                                    {[complaint.ward?.name_bn, complaint.upazila?.name_bn, complaint.district?.name_bn].filter(Boolean).join(', ')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Building2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-slate-800">সংশ্লিষ্ট কার্যালয়</p>
                                <p className="mt-0.5">{complaint.office?.name_bn || complaint.organization?.name_bn || 'প্রক্রিয়াধীন'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-slate-800">এসএলএ সময়সীমা</p>
                                <p className="mt-0.5 font-mono">{complaint.due_at ? new Date(complaint.due_at).toLocaleDateString('bn-BD') : 'প্রযোজ্য নয়'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attachments */}
                {complaint.attachments?.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-700" />
                            সংযুক্ত প্রমাণ ও ফাইলসমূহ
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {complaint.attachments.map((file) => (
                                <div key={file.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                                    <span className="truncate max-w-xs text-slate-700 font-medium">{file.original_filename}</span>
                                    <a
                                        href={`/storage/${file.file_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-700 hover:underline font-semibold"
                                    >
                                        দেখুন
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Timeline */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-700" />
                        অগ্রগতি টাইমলাইন
                    </h3>
                    <ComplaintTimeline timeline={complaint.status_histories} />
                </div>
            </div>
        </PublicLayout>
    );
}
