import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Bell, CheckCircle2, Clock, AlertCircle, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

export default function CitizenNotifications({ notifications = { data: [] } }) {
    const markAsRead = (id) => {
        router.post(`/citizen/notifications/${id}/read`, {}, {
            preserveScroll: true
        });
    };

    const markAllAsRead = () => {
        router.post('/citizen/notifications/read-all', {}, {
            preserveScroll: true
        });
    };

    return (
        <PublicLayout>
            <Head title="বিজ্ঞপ্তি ও নোটিফিকেশন - নাগরিক অভিযোগ" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                            <Bell className="w-6 h-6 text-emerald-600" />
                            আপনার নোটিফিকেশন সমূহ
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            আপনার দাখিলকৃত অভিযোগের অগ্রগতি, স্ট্যাটাস পরিবর্তন এবং দাপ্তরিক আদেশের তাৎক্ষণিক নোটিফিকেশন
                        </p>
                    </div>

                    {notifications.data && notifications.data.some(n => !n.is_read) && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition"
                        >
                            সবগুলো পঠিত চিহ্নিত করুন
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                    {(!notifications.data || notifications.data.length === 0) ? (
                        <div className="p-12 text-center text-slate-400">
                            <Bell className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                            <p className="font-semibold text-slate-700">কোন নতুন নোটিফিকেশন নেই</p>
                            <p className="text-xs text-slate-400 mt-1">অভিযোগ সংক্রান্ত যেকোনো হালনাগাদ এখানে দৃশ্যমান হবে</p>
                        </div>
                    ) : (
                        notifications.data.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-5 transition flex items-start justify-between gap-4 ${
                                    notification.is_read ? 'bg-white hover:bg-slate-50/70' : 'bg-emerald-50/40 hover:bg-emerald-50/70'
                                }`}
                            >
                                <div className="flex items-start gap-3.5">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                        notification.type === 'status_update' ? 'bg-emerald-100 text-emerald-700' :
                                        notification.type === 'assignment' ? 'bg-blue-100 text-blue-700' :
                                        notification.type === 'escalation' ? 'bg-red-100 text-red-700' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                        <Bell className="w-4 h-4" />
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-900 text-sm">{notification.title}</h3>
                                            {!notification.is_read && (
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            )}
                                        </div>

                                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                            {notification.message}
                                        </p>

                                        <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            <span>
                                                {new Date(notification.created_at).toLocaleString('bn-BD', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            {notification.tracking_id && (
                                                <>
                                                    <span>•</span>
                                                    <span className="font-mono text-emerald-700 font-medium">#{notification.tracking_id}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {notification.tracking_id && (
                                        <Link
                                            href={`/track?tracking_id=${notification.tracking_id}`}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition"
                                        >
                                            ট্র্যাকিং দেখুন
                                            <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    )}

                                    {!notification.is_read && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            title="পঠিত চিহ্নিত করুন"
                                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
