import React, { useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { MapPin, Filter, Layers, Info } from 'lucide-react';

export default function AdminMap({ divisions, categories, districtAggregates, filters }) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Dynamically load leaflet or use global L
        const L = window.L;
        if (!L || !mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current).setView([23.6850, 90.3563], 7);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 18,
            }).addTo(map);

            mapInstanceRef.current = map;
        }

        const map = mapInstanceRef.current;

        // Clear existing markers if any
        map.eachLayer((layer) => {
            if (layer instanceof L.CircleMarker || layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Add district aggregate circle markers
        districtAggregates.forEach((dist) => {
            if (!dist.lat || !dist.lng) return;

            const radius = Math.min(30, Math.max(12, dist.count * 4));
            const marker = L.circleMarker([dist.lat, dist.lng], {
                radius: radius,
                fillColor: '#059669',
                color: '#064E3B',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.7,
            }).addTo(map);

            marker.bindPopup(`
                <div style="font-family: inherit; font-size: 13px; text-align: center; padding: 4px;">
                    <strong style="color: #0F172A; font-size: 14px;">${dist.name_bn} জেলা</strong><br/>
                    <span style="color: #059669; font-weight: bold; font-size: 15px;">${dist.count} টি অভিযোগ</span><br/>
                    <span style="color: #64748B; font-size: 11px;">পাইলট ভৌগোলিক অঞ্চল</span>
                </div>
            `);
        });

    }, [districtAggregates]);

    const handleFilter = (key, val) => {
        router.get('/admin/map', { ...filters, [key]: val }, { preserveState: true });
    };

    return (
        <AdminLayout
            title="ভৌগোলিক মানচিত্র বিশ্লেষণ"
            subtitle="সারা বাংলাদেশে জেলা ও অঞ্চলভিত্তিক অভিযোগের সামগ্রিক ঘনত্ব ও ক্লাস্টার ভিউ"
        >
            <Head title="মানচিত্র ড্যাশবোর্ড — অ্যাডমিন প্যানেল" />

            <div className="space-y-6">
                {/* Filter Bar */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-wrap text-xs">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5" /> ফিল্টার:
                        </span>

                        <select
                            value={filters.division_id || ''}
                            onChange={(e) => handleFilter('division_id', e.target.value)}
                            className="rounded-xl border-slate-300 text-xs p-2 bg-slate-50"
                        >
                            <option value="">সকল বিভাগ</option>
                            {divisions.map((div) => (
                                <option key={div.id} value={div.id}>{div.name_bn}</option>
                            ))}
                        </select>

                        <select
                            value={filters.category_id || ''}
                            onChange={(e) => handleFilter('category_id', e.target.value)}
                            className="rounded-xl border-slate-300 text-xs p-2 bg-slate-50"
                        >
                            <option value="">সকল অভিযোগের খাত</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name_bn}</option>
                            ))}
                        </select>

                        <select
                            value={filters.status || ''}
                            onChange={(e) => handleFilter('status', e.target.value)}
                            className="rounded-xl border-slate-300 text-xs p-2 bg-slate-50"
                        >
                            <option value="">সকল অবস্থা</option>
                            <option value="submitted">নতুন জমা</option>
                            <option value="investigation_started">তদন্ত চলমান</option>
                            <option value="overdue">ওভারডিউ</option>
                            <option value="resolved">নিষ্পন্ন</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Info className="w-4 h-4 text-emerald-600" />
                        <span>নাগরিকের ব্যক্তিগত সুরক্ষায় মানচিত্রে কেবল সমষ্টিগত ঘনত্ব প্রদর্শিত হয়</span>
                    </div>
                </div>

                {/* Leaflet Map Canvas */}
                <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs overflow-hidden">
                    <div
                        ref={mapContainerRef}
                        className="w-full h-[600px] rounded-xl z-10"
                        style={{ minHeight: '550px' }}
                    ></div>
                </div>
            </div>
        </AdminLayout>
    );
}
