import React from 'react';
import { Link } from '@inertiajs/react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { MapPin, Building2, Clock, ChevronRight, AlertTriangle } from 'lucide-react';

export default function ComplaintCard({ complaint, linkHref }) {
    const isOverdue = complaint.is_overdue || (complaint.due_at && new Date(complaint.due_at) < new Date() && !['resolved', 'closed'].includes(complaint.current_status));

    return (
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                        {complaint.tracking_id}
                    </span>
                    <StatusBadge status={complaint.current_status} />
                    <PriorityBadge priority={complaint.priority} />
                    {isOverdue && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                            <AlertTriangle className="w-3 h-3" />
                            ওভারডিউ
                        </span>
                    )}
                </div>
                <span className="text-xs text-slate-600 shrink-0 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(complaint.created_at).toLocaleDateString('bn-BD')}
                </span>
            </div>

            <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-2">
                {complaint.title}
            </h4>

            <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                {complaint.description}
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 gap-2">
                <div className="flex items-center gap-4 flex-wrap">
                    {(complaint.district || complaint.upazila) && (
                        <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {complaint.upazila?.name_bn || complaint.district?.name_bn}
                        </span>
                    )}
                    {(complaint.office || complaint.organization) && (
                        <span className="inline-flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {complaint.office?.name_bn || complaint.organization?.name_bn}
                        </span>
                    )}
                </div>

                <Link
                    href={linkHref || `/track?id=${complaint.tracking_id}`}
                    className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:text-emerald-800 hover:underline shrink-0"
                >
                    বিস্তারিত
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
