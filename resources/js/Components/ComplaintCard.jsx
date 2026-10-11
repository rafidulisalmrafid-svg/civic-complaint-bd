import React from 'react';
import { Link } from '@inertiajs/react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { MapPin, Building2, Clock, ChevronRight, AlertTriangle } from 'lucide-react';

export default function ComplaintCard({ complaint, linkHref }) {
    const isOverdue = complaint.is_overdue || (complaint.due_at && new Date(complaint.due_at) < new Date() && !['resolved', 'closed'].includes(complaint.current_status));

    return (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm card-hover-lift group">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
                        {complaint.tracking_id}
                    </span>
                    <StatusBadge status={complaint.current_status} />
                    <PriorityBadge priority={complaint.priority} />
                    {isOverdue && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            ওভারডিউ
                        </span>
                    )}
                </div>
                <span className="text-[11px] text-slate-500 shrink-0 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(complaint.created_at).toLocaleDateString('bn-BD')}
                </span>
            </div>

            <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1 mb-2">
                {complaint.title}
            </h4>

            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                {complaint.description}
            </p>

            <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                    {(complaint.district || complaint.upazila) && (
                        <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                            {complaint.upazila?.name_bn || complaint.district?.name_bn}
                        </span>
                    )}
                    {(complaint.office || complaint.organization) && (
                        <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                            {complaint.office?.name_bn || complaint.organization?.name_bn}
                        </span>
                    )}
                </div>

                <Link
                    href={linkHref || `/track?id=${complaint.tracking_id}`}
                    className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 shrink-0 group-hover:translate-x-0.5 transition-transform"
                >
                    <span>বিস্তারিত</span>
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
