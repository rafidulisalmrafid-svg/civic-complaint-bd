import React from 'react';
import { CheckCircle2, Clock, ArrowRight, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ComplaintTimeline({ timeline = [] }) {
    if (!timeline || timeline.length === 0) {
        return (
            <div className="py-6 text-center text-slate-500 text-sm">
                টাইমলাইনের কোনো তথ্য এখনো পাওয়া যায়নি।
            </div>
        );
    }

    return (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timeline.map((step, idx) => {
                const isResolved = step.to_status === 'resolved';
                const isReopened = step.to_status === 'reopened';
                const isFirst = idx === 0;

                return (
                    <div key={idx} className="relative group">
                        {/* Dot */}
                        <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white ${
                            isResolved ? 'border-emerald-500 text-emerald-500' :
                            isReopened ? 'border-rose-500 text-rose-500' :
                            'border-blue-500 text-blue-500'
                        }`}>
                            {isResolved ? (
                                <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500 text-white" />
                            ) : isReopened ? (
                                <RefreshCw className="w-3 h-3" />
                            ) : (
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                            )}
                        </div>

                        {/* Content Card */}
                        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all">
                            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                                <StatusBadge status={step.to_status} />
                                <span className="text-xs text-slate-600 flex items-center gap-1 font-mono">
                                    <Clock className="w-3.5 h-3.5" />
                                    {step.created_at}
                                </span>
                            </div>

                            {step.remarks_bn && (
                                <p className="text-sm text-slate-700 leading-relaxed mt-1">
                                    {step.remarks_bn}
                                </p>
                            )}

                            {step.time_ago && (
                                <span className="inline-block text-[11px] text-slate-600 mt-2">
                                    {step.time_ago}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
