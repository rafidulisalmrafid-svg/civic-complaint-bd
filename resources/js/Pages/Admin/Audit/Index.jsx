import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    History, Search, Filter, Shield, User, Globe, Eye, Code, Calendar, CheckCircle2
} from 'lucide-react';

export default function AuditIndex({ auditLogs = { data: [] }, users = [], filters = {} }) {
    const [selectedAction, setSelectedAction] = useState(filters.action || '');
    const [selectedEntity, setSelectedEntity] = useState(filters.auditable_type || '');
    const [selectedLog, setSelectedLog] = useState(null);

    const handleFilterChange = (e, filterType) => {
        const value = e.target.value;
        const newFilters = { ...filters, [filterType]: value };
        if (!value) delete newFilters[filterType];

        router.get('/admin/audit', newFilters, {
            preserveState: true,
            replace: true
        });
    };

    return (
        <AdminLayout title="অডিট ট্রেইল ও সিস্টেম লগ">
            <Head title="অডিট ট্রেইল ও নিরাপত্তা নিরীক্ষা - নাগরিক অভিযোগ" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                            <History className="w-7 h-7 text-emerald-600" />
                            সিস্টেম অডিট ট্রেইল ও ক্রিয়াকলাপ নিরীক্ষা
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            প্ল্যাটফর্মে যেকোনো পরিবর্তন, স্ট্যাটাস আপডেট, বদলি ও কনফিগারেশনের অপরিবর্তনীয় নিরাপত্তা লগ
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Shield className="w-3.5 h-3.5" />
                            অডিট লগ সক্রিয় (Immutable)
                        </span>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center">
                    <select
                        value={selectedAction}
                        onChange={(e) => {
                            setSelectedAction(e.target.value);
                            handleFilterChange(e, 'action');
                        }}
                        className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="">সকল অ্যাকশন (Action)</option>
                        <option value="created">Created (তৈরি)</option>
                        <option value="updated">Updated (হালনাগাদ)</option>
                        <option value="status_changed">Status Changed (স্ট্যাটাস পরিবর্তন)</option>
                        <option value="assigned">Assigned (দায়িত্ব অর্পণ)</option>
                        <option value="forwarded">Forwarded (ফরওয়ার্ড)</option>
                        <option value="transferred">Transferred (বদলি)</option>
                        <option value="resolved">Resolved (নিষ্পত্তি)</option>
                    </select>

                    <select
                        value={selectedEntity}
                        onChange={(e) => {
                            setSelectedEntity(e.target.value);
                            handleFilterChange(e, 'auditable_type');
                        }}
                        className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="">সকল রিসোর্স (Entity)</option>
                        <option value="App\Models\Complaint">অভিযোগ (Complaint)</option>
                        <option value="App\Models\OfficerProfile">কর্মকর্তা প্রোফাইল (Officer)</option>
                        <option value="App\Models\RoutingRule">রাউটিং রুল (Routing Rule)</option>
                        <option value="App\Models\SlaRule">এসএলএ রুল (SLA Rule)</option>
                    </select>
                </div>

                {/* Audit Logs Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase">
                                <tr>
                                    <th className="px-6 py-4">সময় ও তারিখ</th>
                                    <th className="px-6 py-4">ব্যবহারকারী / কর্মকর্তা</th>
                                    <th className="px-6 py-4">কার্যক্রম (Action)</th>
                                    <th className="px-6 py-4">রিসোর্স ও আইডি</th>
                                    <th className="px-6 py-4">আইপি ও ডিভাইস</th>
                                    <th className="px-6 py-4 text-right">পরিবর্তন বিবরণ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(!auditLogs.data || auditLogs.data.length === 0) ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                            কোন অডিট লগ পাওয়া যায়নি
                                        </td>
                                    </tr>
                                ) : (
                                    auditLogs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/70 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-slate-800 font-medium text-xs">
                                                    {new Date(log.created_at).toLocaleDateString('bn-BD', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-mono">
                                                    {new Date(log.created_at).toLocaleTimeString()}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                                    {log.user?.name || 'সিস্টেম অটোমেশন'}
                                                </div>
                                                <div className="text-[11px] text-slate-500">{log.user?.email}</div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    log.action === 'created' ? 'bg-emerald-100 text-emerald-800' :
                                                    log.action === 'status_changed' ? 'bg-purple-100 text-purple-800' :
                                                    log.action === 'resolved' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {log.action}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="text-xs font-mono font-semibold text-slate-800">
                                                    {log.auditable_type ? log.auditable_type.split('\\').pop() : 'System'}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-mono">ID: #{log.auditable_id}</div>
                                            </td>

                                            <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                                <div>{log.ip_address || '127.0.0.1'}</div>
                                                <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{log.user_agent}</div>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    লগ ডিটেইলস
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Audit Detail Modal */}
                {selectedLog && (
                    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <Code className="w-5 h-5 text-emerald-600" />
                                অডিট রেকর্ড নিরীক্ষা (#LOG-{selectedLog.id})
                            </h3>
                            <p className="text-xs text-slate-500 mb-4">
                                কার্যক্রম: <span className="font-semibold text-slate-800">{selectedLog.action}</span> | সময়: {new Date(selectedLog.created_at).toLocaleString()}
                            </p>

                            <div className="space-y-4">
                                {selectedLog.description && (
                                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                                        <span className="font-semibold">বিবরণ: </span>
                                        {selectedLog.description}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Old Values */}
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-700 mb-1">পূর্ববর্তী অবস্থা (Old Values)</h4>
                                        <pre className="p-3 bg-red-50/60 border border-red-100 rounded-xl text-[11px] font-mono text-red-900 overflow-x-auto max-h-48">
                                            {selectedLog.old_values ? JSON.stringify(selectedLog.old_values, null, 2) : 'None'}
                                        </pre>
                                    </div>

                                    {/* New Values */}
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-700 mb-1">নতুন অবস্থা (New Values)</h4>
                                        <pre className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-[11px] font-mono text-emerald-900 overflow-x-auto max-h-48">
                                            {selectedLog.new_values ? JSON.stringify(selectedLog.new_values, null, 2) : 'None'}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 mt-4 border-t border-slate-100">
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                                >
                                    বন্ধ করুন
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
