import React, { useState, useRef, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import LocationSelector from '@/Components/LocationSelector';
import CameraCaptureModal from '@/Components/CameraCaptureModal';
import { 
    Send, 
    Camera, 
    Check, 
    ChevronRight, 
    ChevronLeft, 
    MapPin, 
    Building2, 
    Landmark,
    FileText, 
    Shield, 
    AlertCircle,
    Trash2,
    CheckCircle2,
    Image as ImageIcon
} from 'lucide-react';

export default function SubmitComplaint({ categories = [], divisions = [], currentUser }) {
    const [step, setStep] = useState(1);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

    const [specificOfficerSelected, setSpecificOfficerSelected] = useState(false);
    const [officesList, setOfficesList] = useState([]);
    const [officersList, setOfficersList] = useState([]);
    const [loadingOffices, setLoadingOffices] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        category_id: '',
        subcategory_id: '',
        priority: 'medium',
        is_sensitive: false,

        // Location (ঘটনাস্থল)
        division_id: '',
        district_id: '',
        upazila_id: '',
        local_government_id: '',
        ward_id: '',
        area_id: '',
        post_office_id: '',
        specific_location_details: '',

        // Authority (কর্তৃপক্ষ: মন্ত্রণালয় ও সংস্থা)
        ministry_id: '',
        organization_id: '',
        office_id: '',
        specific_officer_id: '',

        // Complaint Details
        title: '',
        description: '',
        custom_fields: {},

        // Attachments (ক্যামেরা দিয়ে তোলা ছবি)
        attachments: [],
        is_camera_capture: true,

        // Complainant
        is_anonymous: false,
        complainant_name: currentUser?.name || '',
        complainant_phone: currentUser?.phone || '',
    });

    const selectedCategory = categories.find(c => c.id === parseInt(data.category_id));

    // When category changes, auto-set ministry and cascade agencies
    const availableAgencies = selectedCategory?.ministry?.children || [];

    useEffect(() => {
        if (selectedCategory) {
            const minId = selectedCategory.ministry?.id || '';
            const defOrgId = selectedCategory.default_organization_id || (availableAgencies[0]?.id ? String(availableAgencies[0].id) : '');

            setData(prev => ({
                ...prev,
                ministry_id: minId,
                organization_id: defOrgId ? String(defOrgId) : prev.organization_id,
                office_id: '',
                specific_officer_id: '',
                priority: selectedCategory.default_priority || prev.priority,
                is_sensitive: selectedCategory.is_sensitive || false,
            }));

            if (defOrgId) {
                fetchOffices(defOrgId, data.district_id, data.upazila_id);
            }
        }
    }, [data.category_id]);

    // Load offices strictly belonging to the selected organization (and filtered by location)
    const fetchOffices = (orgId, distId, upzId) => {
        if (!orgId) {
            setOfficesList([]);
            return;
        }
        setLoadingOffices(true);
        const params = new URLSearchParams();
        params.append('organization_id', orgId);
        if (distId) params.append('district_id', distId);
        if (upzId) params.append('upazila_id', upzId);

        fetch(`/api/geo/offices?${params.toString()}`)
            .then(res => res.json())
            .then(resData => {
                setOfficesList(resData);
                setLoadingOffices(false);
            })
            .catch(() => setLoadingOffices(false));
    };

    const handleAgencyChange = (agencyId) => {
        setData('organization_id', agencyId);
        setData('office_id', '');
        setData('specific_officer_id', '');
        fetchOffices(agencyId, data.district_id, data.upazila_id);
    };

    const handleOfficeChange = (officeId) => {
        setData('office_id', officeId);
        setData('specific_officer_id', '');
        if (officeId) {
            fetch(`/api/geo/officers/${officeId}`)
                .then(res => res.json())
                .then(resData => setOfficersList(resData));
        } else {
            setOfficersList([]);
        }
    };

    const handleLocationChange = (field, val) => {
        setData(field, val);
        if (field === 'district_id' || field === 'upazila_id') {
            fetchOffices(
                data.organization_id, 
                field === 'district_id' ? val : data.district_id, 
                field === 'upazila_id' ? val : data.upazila_id
            );
        }
    };

    // Camera photo capture handler
    const handleCameraCapture = (file) => {
        setData(prev => ({
            ...prev,
            attachments: [...prev.attachments, file],
            is_camera_capture: true,
        }));
    };

    const handleRemoveFile = (index) => {
        setData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/submit', {
            forceFormData: true,
            onError: (errs) => {
                console.error(errs);
                // Switch to first step that has error
                if (errs.category_id) setStep(1);
                else if (errs.division_id || errs.district_id || errs.upazila_id) setStep(2);
                else if (errs.title || errs.description) setStep(4);
                else if (errs.complainant_phone || errs.complainant_name) setStep(6);
            }
        });
    };

    return (
        <PublicLayout>
            <Head title="অভিযোগ দাখিল করুন — নাগরিক সেবা পোর্টাল" />

            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-2">
                        নাগরিক প্রতিকার প্রক্রিয়া
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        নতুন অভিযোগ দাখিল ফরম
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 max-w-xl mx-auto">
                        সঠিক তথ্য প্রদান করে সরকারি সেবার জবাবদিহিতা নিশ্চিতকরণে সহায়তা করুন।
                    </p>
                </div>

                {/* Progress Stepper */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs mb-8 overflow-x-auto">
                    <div className="flex items-center justify-between min-w-[560px]">
                        {[
                            { num: 1, label: 'অভিযোগের ধরন' },
                            { num: 2, label: 'ঘটনাস্থল' },
                            { num: 3, label: 'দপ্তর ও কর্তৃপক্ষ' },
                            { num: 4, label: 'বিস্তারিত বিবরণ' },
                            { num: 5, label: 'ছবি ও প্রমাণ' },
                            { num: 6, label: 'যাচাই ও দাখিল' },
                        ].map((s) => (
                            <div key={s.num} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                                    step > s.num ? 'bg-emerald-700 text-white' :
                                    step === s.num ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' :
                                    'bg-slate-100 text-slate-400'
                                }`}>
                                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                                </div>
                                <span className={`text-xs font-semibold ${step === s.num ? 'text-emerald-800' : 'text-slate-500'}`}>
                                    {s.label}
                                </span>
                                {s.num < 6 && <div className="w-6 h-0.5 bg-slate-200 mx-1"></div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Container */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                    <form onSubmit={handleSubmit}>
                        {/* STEP 1: CATEGORY & SUBCATEGORY */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="border-b border-slate-100 pb-3">
                                    <h3 className="text-lg font-bold text-slate-900">ধাপ ১: অভিযোগের খাত বা ধরন নির্বাচন করুন</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">আপনার অভিযোগটি কোন বিষয়ে সেটি বাছাই করুন</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {categories.map((cat) => (
                                        <label
                                            key={cat.id}
                                            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                                                parseInt(data.category_id) === cat.id
                                                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="category_id"
                                                value={cat.id}
                                                checked={parseInt(data.category_id) === cat.id}
                                                onChange={(e) => {
                                                    setData('category_id', e.target.value);
                                                    setData('subcategory_id', '');
                                                }}
                                                className="mt-1 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <div>
                                                <span className="font-bold text-sm text-slate-900 block">{cat.name_bn}</span>
                                                <span className="text-xs text-slate-500 block mt-0.5 leading-relaxed">{cat.description}</span>
                                                {cat.is_sensitive && (
                                                    <span className="inline-block text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded mt-1.5 font-semibold">
                                                        গোপনীয় ও সংবেদনশীল
                                                    </span>
                                                )}
                                                {cat.ministry && (
                                                    <span className="inline-block text-[10px] text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded mt-1.5 font-medium ml-1">
                                                        {cat.ministry.name_bn}
                                                    </span>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {errors.category_id && <p className="text-xs text-red-600">{errors.category_id}</p>}

                                {/* Subcategories */}
                                {selectedCategory?.subcategories?.length > 0 && (
                                    <div className="pt-4 border-t border-slate-100">
                                        <label className="block text-sm font-semibold text-slate-800 mb-2">
                                            নির্দিষ্ট উপ-বিষয় (সাব-ক্যাটাগরি)
                                        </label>
                                        <select
                                            value={data.subcategory_id}
                                            onChange={(e) => setData('subcategory_id', e.target.value)}
                                            className="w-full rounded-xl border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500 p-3 bg-white"
                                        >
                                            <option value="">উপ-বিষয় নির্বাচন করুন (ঐচ্ছিক)</option>
                                            {selectedCategory.subcategories.map(sub => (
                                                <option key={sub.id} value={sub.id}>{sub.name_bn}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 2: LOCATION (ঘটনাস্থল নির্বাচন) */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="border-b border-slate-100 pb-3">
                                    <h3 className="text-lg font-bold text-slate-900">ধাপ ২: অভিযোগের ঘটনাস্থল নির্বাচন করুন</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">যে এলাকায় সমস্যাটি সংঘটিত হয়েছে (বিভাগ, জেলা, উপজেলা/থানা ও স্থানীয় সরকার)</p>
                                </div>

                                <LocationSelector
                                    divisions={divisions}
                                    selectedValues={data}
                                    onChange={handleLocationChange}
                                    errors={errors}
                                />
                            </div>
                        )}

                        {/* STEP 3: ORGANIZATION & OFFICE HIERARCHY (অভিযোগের ধরন → মন্ত্রণালয় → সংস্থা → স্থানীয় অফিস) */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="border-b border-slate-100 pb-3">
                                    <h3 className="text-lg font-bold text-slate-900">ধাপ ৩: সংশ্লিষ্ট দপ্তর ও কর্তৃপক্ষ</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">অভিযোগের ধরন অনুযায়ী সংশ্লিষ্ট মন্ত্রণালয়, সংস্থা ও স্থানীয় কার্যালয়</p>
                                </div>

                                {/* Designated Ministry Card */}
                                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                                        অভিযোগের ধরন অনুযায়ী নির্ধারিত মন্ত্রণালয়:
                                    </span>
                                    <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                                        <Landmark className="w-5 h-5 text-emerald-700 shrink-0" />
                                        <span>{selectedCategory?.ministry?.name_bn || 'সংশ্লিষ্ট মন্ত্রণালয় স্বয়ংক্রিয়ভাবে নির্ধারণ করা হয়েছে'}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        * আপনার নির্বাচিত "{selectedCategory?.name_bn}" খাতের অভিযোগসমূহ সরাসরি এই মন্ত্রণালয়ের দায়িত্বপ্রাপ্ত দপ্তরে প্রেরিত হবে।
                                    </p>
                                </div>

                                {/* Child Agencies strictly under this Ministry */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                                        <Building2 className="w-4 h-4 text-emerald-700" />
                                        <span>সংশ্লিষ্ট সংস্থা / অধিদপ্তর / পরিদপ্তর</span>
                                    </label>
                                    <select
                                        value={data.organization_id}
                                        onChange={(e) => handleAgencyChange(e.target.value)}
                                        className="w-full rounded-xl border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500 p-3 bg-white"
                                    >
                                        <option value="">সংস্থা নির্বাচন করুন</option>
                                        {availableAgencies.map(agency => (
                                            <option key={agency.id} value={agency.id}>{agency.name_bn}</option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        * শুধুমাত্র এই মন্ত্রণালয়ের অধীনে দায়িত্বপ্রাপ্ত সংস্থাসমূহ এখানে প্রদর্শিত হচ্ছে।
                                    </p>
                                </div>

                                {/* Local Offices strictly under this Agency */}
                                {officesList.length > 0 ? (
                                    <div className="pt-2">
                                        <label className="block text-sm font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4 text-emerald-700" />
                                                <span>নির্দিষ্ট স্থানীয় কার্যালয় / অফিস</span>
                                            </span>
                                            {loadingOffices && <span className="text-xs text-emerald-600">লোড হচ্ছে...</span>}
                                        </label>
                                        <select
                                            value={data.office_id}
                                            onChange={(e) => handleOfficeChange(e.target.value)}
                                            className="w-full rounded-xl border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500 p-3 bg-white"
                                        >
                                            <option value="">স্থানীয় কার্যালয় নির্বাচন করুন (যদি জানা থাকে)</option>
                                            {officesList.map(off => (
                                                <option key={off.id} value={off.id}>
                                                    {off.name_bn} {off.address ? `(${off.address})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-[11px] text-slate-500 mt-1">
                                            * নির্বাচিত সংস্থার অধীনস্থ স্থানীয় অফিসগুলোর তালিকা প্রদর্শিত হচ্ছে।
                                        </p>
                                    </div>
                                ) : data.organization_id ? (
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                                        এই এলাকায় এই সংস্থার কোনো নির্দিষ্ট স্থানীয় কার্যালয় তালিকাভুক্ত না থাকলেও অভিযোগটি ঊর্ধ্বতন জেলা প্রশাসন ও প্রধান কার্যালয়ের মাধ্যমে পর্যবেক্ষণ করা হবে।
                                    </div>
                                ) : null}

                                {/* Specific Officer Question */}
                                <div className="pt-4 border-t border-slate-100 space-y-3">
                                    <label className="block text-sm font-semibold text-slate-800">
                                        কোনো নির্দিষ্ট কর্মকর্তা বা কর্মচারীর বিরুদ্ধে অভিযোগ?
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="is_specific_officer"
                                                checked={specificOfficerSelected}
                                                onChange={() => setSpecificOfficerSelected(true)}
                                                className="text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span>হ্যাঁ</span>
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="is_specific_officer"
                                                checked={!specificOfficerSelected}
                                                onChange={() => {
                                                    setSpecificOfficerSelected(false);
                                                    setData('specific_officer_id', '');
                                                }}
                                                className="text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span>না / জানা নেই</span>
                                        </label>
                                    </div>

                                    {specificOfficerSelected && (
                                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                                            <p className="font-semibold flex items-center gap-1.5">
                                                <AlertCircle className="w-4 h-4 text-amber-700" />
                                                স্বার্থের সংঘাত রোধ নীতি:
                                            </p>
                                            <p>
                                                নির্দিষ্ট কর্মকর্তার নাম উল্লেখ করা হলেও অভিযোগটি তার কাছে যাবে না। এটি সরাসরি সংশ্লিষ্ট দপ্তরের ঊর্ধ্বতন কর্তৃপক্ষ ও সুপারভাইজারের কাছে পাঠানো হবে।
                                            </p>
                                            {officersList.length > 0 && (
                                                <select
                                                    value={data.specific_officer_id}
                                                    onChange={(e) => setData('specific_officer_id', e.target.value)}
                                                    className="w-full rounded-lg border-amber-300 text-xs focus:ring-amber-500 p-2 bg-white mt-2"
                                                >
                                                    <option value="">কর্মকর্তার নাম নির্বাচন করুন</option>
                                                    {officersList.map(off => (
                                                        <option key={off.id} value={off.id}>{off.name_bn} ({off.designation_bn})</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 4: DETAILS & DYNAMIC CUSTOM FIELDS */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="border-b border-slate-100 pb-3">
                                    <h3 className="text-lg font-bold text-slate-900">ধাপ ৪: অভিযোগের বিস্তারিত বিবরণ</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">সমস্যার স্পষ্ট শিরোনাম ও পূর্ণাঙ্গ বর্ণনা প্রদান করুন</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                        অভিযোগের শিরোনাম <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="সংক্ষেপে সমস্যার মূল কথা লিখুন (যেমন: জরুরি বিভাগে ডাক্তার অনুপস্থিতি বা ট্রান্সফরমার নষ্ট)"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500 p-3"
                                    />
                                    {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                        বিস্তারিত বিবরণ <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={5}
                                        placeholder="ঘটনার তারিখ, সময়, সংশ্লিষ্ট ব্যক্তি বা সমস্যাটির বিস্তারিত বর্ণনা লিখুন..."
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500 p-3 leading-relaxed"
                                    />
                                    {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
                                </div>

                                {/* Dynamic Custom Fields based on Category */}
                                {selectedCategory?.custom_fields?.length > 0 && (
                                    <div className="pt-4 border-t border-slate-100 space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                            {selectedCategory.name_bn} সম্পর্কিত অতিরিক্ত তথ্য
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {selectedCategory.custom_fields.map((field) => (
                                                <div key={field.id}>
                                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                        {field.label_bn} {field.is_required && <span className="text-red-500">*</span>}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder={field.placeholder_bn || ''}
                                                        value={data.custom_fields[field.field_name] || ''}
                                                        onChange={(e) => setData('custom_fields', {
                                                             ...data.custom_fields,
                                                            [field.field_name]: e.target.value,
                                                        })}
                                                        className="w-full rounded-lg border-slate-300 text-xs focus:ring-emerald-500 p-2.5"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 5: EVIDENCE & CAMERA CAPTURE (ক্যামেরা দিয়ে সরাসরি ছবি তোলা) */}
                        {step === 5 && (
                            <div className="space-y-6">
                                <div className="border-b border-slate-100 pb-3">
                                    <h3 className="text-lg font-bold text-slate-900">ধাপ ৫: প্রমাণ ও ছবি আপলোড</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        সরাসরি ক্যামেরা দিয়ে ঘটনাস্থল বা সংশ্লিষ্ট প্রমাণের ছবি তুলে যুক্ত করুন (গ্যালারি থেকে কোনো ছবি গ্রহণ করা হবে না)
                                    </p>
                                </div>

                                {/* Direct Camera Trigger Card */}
                                <div className="p-8 rounded-3xl border-2 border-dashed border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50/70 transition-all flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
                                        <Camera className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-base font-extrabold text-emerald-950">
                                        ক্যামেরা দিয়ে সরাসরি ছবি তুলুন
                                    </h4>
                                    <p className="text-xs text-emerald-800/80 max-w-sm mt-1 mb-5">
                                        ছবিটি সত্যতা যাচাইয়ের জন্য সরাসরি ডিভাইস ক্যামেরা দিয়ে তোলা বাধ্যতামূলক।
                                    </p>
                                    
                                    <button
                                        type="button"
                                        onClick={() => setIsCameraModalOpen(true)}
                                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all active:scale-95"
                                    >
                                        <Camera className="w-5 h-5" />
                                        <span>ক্যামেরা ওপেন করুন</span>
                                    </button>
                                </div>

                                {/* Attached Photos Display */}
                                {data.attachments.length > 0 && (
                                    <div className="space-y-3 pt-2">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                            <ImageIcon className="w-4 h-4 text-emerald-700" />
                                            <span>তোলা ছবিসমূহ ({data.attachments.length} টি)</span>
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {data.attachments.map((file, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-4/3 shadow-xs"
                                                >
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`Evidence ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90 p-2.5 flex flex-col justify-between">
                                                        <div className="flex justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveFile(idx)}
                                                                className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md transition-colors"
                                                                title="ছবি মুছে ফেলুন"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                        <div className="text-[10px] text-white font-medium truncate">
                                                            প্রমাণ #{idx + 1}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 6: REVIEW & COMPLAINANT INFO */}
                        {step === 6 && (
                            <div className="space-y-6">
                                <div className="border-b border-slate-100 pb-3">
                                    <h3 className="text-lg font-bold text-slate-900">ধাপ ৬: রিভিউ ও অভিযোগকারী তথ্য</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">দাখিল করার পূর্বে তথ্য যাচাই করুন</p>
                                </div>

                                {/* Complainant Information */}
                                <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-sm text-slate-900">অভিযোগকারীর বিবরণ</h4>
                                        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.is_anonymous}
                                                onChange={(e) => setData('is_anonymous', e.target.checked)}
                                                className="rounded text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span>পরিচয় গোপন রাখতে চাই (বেনামী)</span>
                                        </label>
                                    </div>

                                    {!data.is_anonymous && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                    আপনার পূর্ণ নাম <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.complainant_name}
                                                    onChange={(e) => setData('complainant_name', e.target.value)}
                                                    className="w-full rounded-lg border-slate-300 text-xs p-2.5 bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                    মোবাইল নম্বর <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="017xxxxxxxx"
                                                    value={data.complainant_phone}
                                                    onChange={(e) => setData('complainant_phone', e.target.value)}
                                                    className="w-full rounded-lg border-slate-300 text-xs p-2.5 bg-white font-mono"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Summary Overview */}
                                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs space-y-2">
                                    <p className="font-bold text-emerald-900">আবেদনের সংক্ষিপ্ত বিবরণ:</p>
                                    <p><strong className="text-slate-700">খাত:</strong> {selectedCategory?.name_bn}</p>
                                    <p><strong className="text-slate-700">মন্ত্রণালয়:</strong> {selectedCategory?.ministry?.name_bn || 'স্বয়ংক্রিয়'}</p>
                                    <p><strong className="text-slate-700">শিরোনাম:</strong> {data.title}</p>
                                    <p><strong className="text-slate-700">সংযুক্ত ছবি:</strong> {data.attachments.length} টি (সরাসরি ক্যামেরা দিয়ে তোলা)</p>
                                </div>

                                <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
                                    <Shield className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                                    <span>
                                        আমি ঘোষণা করছি যে প্রদত্ত তথ্যাদি ও ক্যামেরায় তোলা ছবি আমার জ্ঞানমতে সত্য ও নির্ভুল।
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" /> পূর্ববর্তী
                                </button>
                            ) : <div></div>}

                            {step < 6 ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (step === 1 && !data.category_id) {
                                            alert('অনুগ্রহ করে একটি অভিযোগের ধরন নির্বাচন করুন।');
                                            return;
                                        }
                                        if (step === 2 && (!data.division_id || !data.district_id || !data.upazila_id)) {
                                            alert('অনুগ্রহ করে বিভাগ, জেলা এবং উপজেলা/থানা নির্বাচন করুন।');
                                            return;
                                        }
                                        setStep(step + 1);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-xs transition-colors"
                                >
                                    পরবর্তী ধাপ <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>{processing ? 'জমা হচ্ছে...' : 'অভিযোগ দাখিল সম্পন্ন করুন'}</span>
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Camera Capture Modal */}
            <CameraCaptureModal
                isOpen={isCameraModalOpen}
                onClose={() => setIsCameraModalOpen(false)}
                onCapture={handleCameraCapture}
            />
        </PublicLayout>
    );
}
