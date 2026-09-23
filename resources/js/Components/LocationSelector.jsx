import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, Building, Landmark, Home } from 'lucide-react';

export default function LocationSelector({
    divisions = [],
    selectedValues = {},
    onChange,
    errors = {},
}) {
    const [districts, setDistricts] = useState([]);
    const [upazilas, setUpazilas] = useState([]);
    const [localGovs, setLocalGovs] = useState([]);

    const [loadingDistrict, setLoadingDistrict] = useState(false);
    const [loadingUpazila, setLoadingUpazila] = useState(false);
    const [loadingLocalGov, setLoadingLocalGov] = useState(false);
    const [filterType, setFilterType] = useState('all'); // 'all', 'city_corporation', 'pourashava', 'union_parishad'

    // Load districts on division change
    useEffect(() => {
        if (!selectedValues.division_id) {
            setDistricts([]);
            return;
        }
        setLoadingDistrict(true);
        fetch(`/api/geo/districts/${selectedValues.division_id}`)
            .then(res => res.json())
            .then(data => {
                setDistricts(data);
                setLoadingDistrict(false);
            })
            .catch(() => setLoadingDistrict(false));
    }, [selectedValues.division_id]);

    // Load upazilas & district-level local governments on district change
    useEffect(() => {
        if (!selectedValues.district_id) {
            setUpazilas([]);
            setLocalGovs([]);
            return;
        }
        setLoadingUpazila(true);
        fetch(`/api/geo/upazilas/${selectedValues.district_id}`)
            .then(res => res.json())
            .then(data => {
                setUpazilas(data);
                setLoadingUpazila(false);
            })
            .catch(() => setLoadingUpazila(false));

        // Also fetch any district-level local governments (e.g. City Corporations / Pourashavas)
        setLoadingLocalGov(true);
        fetch(`/api/geo/local-governments-by-district/${selectedValues.district_id}`)
            .then(res => res.json())
            .then(data => {
                setLocalGovs(data);
                setLoadingLocalGov(false);
            })
            .catch(() => setLoadingLocalGov(false));
    }, [selectedValues.district_id]);

    // Load Local Governments on upazila change
    useEffect(() => {
        if (!selectedValues.upazila_id) return;
        setLoadingLocalGov(true);
        fetch(`/api/geo/local-governments/${selectedValues.upazila_id}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    setLocalGovs(data);
                }
                setLoadingLocalGov(false);
            })
            .catch(() => setLoadingLocalGov(false));
    }, [selectedValues.upazila_id]);

    // Filter local governments by type if selected
    const filteredLocalGovs = localGovs.filter(lg => {
        if (filterType === 'all') return true;
        return lg.type === filterType;
    });

    const cityCorps = localGovs.filter(lg => lg.type === 'city_corporation');
    const pourashavas = localGovs.filter(lg => lg.type === 'pourashava');
    const unions = localGovs.filter(lg => lg.type === 'union_parishad');

    return (
        <div className="space-y-5">
            {/* Step Row 1: Division, District, Upazila/Thana */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Division */}
                <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        বিভাগ <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={selectedValues.division_id || ''}
                        onChange={e => {
                            onChange('division_id', e.target.value);
                            onChange('district_id', '');
                            onChange('upazila_id', '');
                            onChange('local_government_id', '');
                        }}
                        className="w-full rounded-xl border-slate-300 shadow-xs text-sm focus:border-emerald-500 focus:ring-emerald-500 py-3 px-3 bg-white"
                    >
                        <option value="">বিভাগ নির্বাচন করুন</option>
                        {divisions.map(div => (
                            <option key={div.id} value={div.id}>{div.name_bn}</option>
                        ))}
                    </select>
                    {errors.division_id && <p className="text-xs text-red-600 mt-1">{errors.division_id}</p>}
                </div>

                {/* 2. District */}
                <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
                        <span>জেলা <span className="text-red-500">*</span></span>
                        {loadingDistrict && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />}
                    </label>
                    <select
                        value={selectedValues.district_id || ''}
                        disabled={!selectedValues.division_id || loadingDistrict}
                        onChange={e => {
                            onChange('district_id', e.target.value);
                            onChange('upazila_id', '');
                            onChange('local_government_id', '');
                        }}
                        className="w-full rounded-xl border-slate-300 shadow-xs text-sm focus:border-emerald-500 focus:ring-emerald-500 py-3 px-3 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                    >
                        <option value="">জেলা নির্বাচন করুন</option>
                        {districts.map(d => (
                            <option key={d.id} value={d.id}>{d.name_bn}</option>
                        ))}
                    </select>
                    {errors.district_id && <p className="text-xs text-red-600 mt-1">{errors.district_id}</p>}
                </div>

                {/* 3. Upazila / Thana */}
                <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
                        <span>উপজেলা / থানা <span className="text-red-500">*</span></span>
                        {loadingUpazila && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />}
                    </label>
                    <select
                        value={selectedValues.upazila_id || ''}
                        disabled={!selectedValues.district_id || loadingUpazila}
                        onChange={e => {
                            onChange('upazila_id', e.target.value);
                            onChange('local_government_id', '');
                        }}
                        className="w-full rounded-xl border-slate-300 shadow-xs text-sm focus:border-emerald-500 focus:ring-emerald-500 py-3 px-3 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                    >
                        <option value="">উপজেলা / থানা নির্বাচন করুন</option>
                        {upazilas.map(u => (
                            <option key={u.id} value={u.id}>{u.name_bn}</option>
                        ))}
                    </select>
                    {errors.upazila_id && <p className="text-xs text-red-600 mt-1">{errors.upazila_id}</p>}
                </div>
            </div>

            {/* Step Row 2: Local Government (City Corporation, Pourashava, Union) */}
            <div className="pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <Landmark className="w-4 h-4 text-emerald-700" />
                        <span>সিটি কর্পোরেশন / পৌরসভা / ইউনিয়ন পরিষদ (ঐচ্ছিক)</span>
                        {loadingLocalGov && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 ml-2" />}
                    </label>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 text-xs">
                        <button
                            type="button"
                            onClick={() => setFilterType('all')}
                            className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                                filterType === 'all'
                                    ? 'bg-emerald-700 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            সকল
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterType('city_corporation')}
                            className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                                filterType === 'city_corporation'
                                    ? 'bg-emerald-700 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            সিটি কর্পোরেশন
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterType('pourashava')}
                            className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                                filterType === 'pourashava'
                                    ? 'bg-emerald-700 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            পৌরসভা
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterType('union_parishad')}
                            className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                                filterType === 'union_parishad'
                                    ? 'bg-emerald-700 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            ইউনিয়ন
                        </button>
                    </div>
                </div>

                <select
                    value={selectedValues.local_government_id || ''}
                    disabled={!selectedValues.district_id || loadingLocalGov}
                    onChange={e => onChange('local_government_id', e.target.value)}
                    className="w-full rounded-xl border-slate-300 shadow-xs text-sm focus:border-emerald-500 focus:ring-emerald-500 py-3 px-3 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                >
                    <option value="">সংশ্লিষ্ট প্রতিষ্ঠান নির্বাচন করুন (যদি থাকে)</option>
                    
                    {filterType === 'all' ? (
                        <>
                            {cityCorps.length > 0 && (
                                <optgroup label="🏢 সিটি কর্পোরেশন">
                                    {cityCorps.map(lg => (
                                        <option key={lg.id} value={lg.id}>{lg.name_bn}</option>
                                    ))}
                                </optgroup>
                            )}
                            {pourashavas.length > 0 && (
                                <optgroup label="🏛️ পৌরসভা">
                                    {pourashavas.map(lg => (
                                        <option key={lg.id} value={lg.id}>{lg.name_bn}</option>
                                    ))}
                                </optgroup>
                            )}
                            {unions.length > 0 && (
                                <optgroup label="🌾 ইউনিয়ন পরিষদ">
                                    {unions.map(lg => (
                                        <option key={lg.id} value={lg.id}>{lg.name_bn}</option>
                                    ))}
                                </optgroup>
                            )}
                        </>
                    ) : (
                        filteredLocalGovs.map(lg => (
                            <option key={lg.id} value={lg.id}>{lg.name_bn}</option>
                        ))
                    )}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                    * আপনার ঘটনাস্থল যে সিটি কর্পোরেশন, পৌরসভা বা ইউনিয়নের অধীনে, তা নির্বাচন করতে পারেন। (ওয়ার্ড নম্বর ও নির্দিষ্ট এলাকা পরবর্তীতে অ্যাডমিন ড্যাশবোর্ড থেকে নির্ধারিত হবে)
                </p>
            </div>
        </div>
    );
}
