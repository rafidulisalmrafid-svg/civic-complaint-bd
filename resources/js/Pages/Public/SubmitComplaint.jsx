import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import CameraCaptureModal from '@/Components/CameraCaptureModal';
import { 
    MapPin, 
    Building2, 
    Landmark,
    FileText, 
    Shield, 
    AlertCircle,
    Trash2,
    CheckCircle2,
    Camera,
    ChevronRight,
    ChevronLeft,
    Search,
    UserX,
    UserCheck,
    Check,
    Copy,
    ExternalLink,
    Stethoscope,
    GraduationCap,
    Car,
    Zap,
    Droplets,
    Trees,
    Phone,
    User,
    Sparkles,
    EyeOff
} from 'lucide-react';

export default function SubmitComplaint({ categories = [], divisions = [], currentUser }) {
    // Current Wizard Step (1 to 9)
    const [step, setStep] = useState(1);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [copiedTrackingId, setCopiedTrackingId] = useState(false);

    // Cascading options state
    const [districts, setDistricts] = useState([]);
    const [upazilas, setUpazilas] = useState([]);
    const [offices, setOffices] = useState([]);
    const [branches, setBranches] = useState([]);
    const [officers, setOfficers] = useState([]);
    const [problemTypesGrouped, setProblemTypesGrouped] = useState({});

    // Loading states
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingUpazilas, setLoadingUpazilas] = useState(false);
    const [loadingOffices, setLoadingOffices] = useState(false);
    const [loadingBranches, setLoadingBranches] = useState(false);
    const [loadingOfficers, setLoadingOfficers] = useState(false);
    const [loadingProblems, setLoadingProblems] = useState(false);

    // Filter/Search inside step 3 (Office)
    const [officeSearch, setOfficeSearch] = useState('');

    // Form data
    const { data, setData, post, processing, errors } = useForm({
        // Step 1: Location
        division_id: '',
        district_id: '',
        upazila_id: '',

        // Step 2: Service / Category
        category_id: '',

        // Step 3: Office
        office_id: '',

        // Step 4: Branch / Department
        office_branch_id: '',

        // Step 5: Person / Officer
        specific_officer_id: '',
        is_person_unknown: false,

        // Step 6: Smart Selected Problems (Array of problem_type IDs)
        selected_problems: [],

        // Step 7: Optional Description
        title: '',
        description: '',

        // Step 8: Camera Evidence
        camera_photos: [], // Array of base64 data URLs

        // Step 9: Citizen Identity & Privacy
        is_anonymous: false,
        complainant_name: currentUser?.name || '',
        complainant_phone: currentUser?.phone || '',
    });

    // Helper: Map category icons dynamically
    const getCategoryIcon = (slug, nameEn = '') => {
        const s = (slug || nameEn).toLowerCase();
        if (s.includes('health') || s.includes('চিকিৎসা')) return <Stethoscope className="w-6 h-6 text-emerald-600" />;
        if (s.includes('land') || s.includes('ভূমি')) return <Landmark className="w-6 h-6 text-amber-600" />;
        if (s.includes('edu') || s.includes('শিক্ষা')) return <GraduationCap className="w-6 h-6 text-blue-600" />;
        if (s.includes('police') || s.includes('আইন')) return <Shield className="w-6 h-6 text-indigo-600" />;
        if (s.includes('brta') || s.includes('সড়ক')) return <Car className="w-6 h-6 text-rose-600" />;
        if (s.includes('elec') || s.includes('বিদ্যুৎ')) return <Zap className="w-6 h-6 text-yellow-600" />;
        if (s.includes('water') || s.includes('পানি')) return <Droplets className="w-6 h-6 text-cyan-600" />;
        if (s.includes('agri') || s.includes('কৃষি')) return <Trees className="w-6 h-6 text-green-600" />;
        return <Building2 className="w-6 h-6 text-teal-600" />;
    };

    // ==========================================
    // CASCADING FETCH TRIGGERS
    // ==========================================

    // 1. When Division changes -> fetch Districts
    useEffect(() => {
        if (data.division_id) {
            setLoadingDistricts(true);
            fetch(`/api/geo/districts/${data.division_id}`)
                .then(res => res.json())
                .then(json => {
                    setDistricts(Array.isArray(json) ? json : []);
                    setLoadingDistricts(false);
                })
                .catch(() => {
                    setDistricts([]);
                    setLoadingDistricts(false);
                });

            // Reset downstream
            setData(prev => ({ ...prev, district_id: '', upazila_id: '', office_id: '', office_branch_id: '', specific_officer_id: '' }));
            setUpazilas([]);
            setOffices([]);
        }
    }, [data.division_id]);

    // 2. When District changes -> fetch Upazilas
    useEffect(() => {
        if (data.district_id) {
            setLoadingUpazilas(true);
            fetch(`/api/geo/upazilas/${data.district_id}`)
                .then(res => res.json())
                .then(json => {
                    setUpazilas(Array.isArray(json) ? json : []);
                    setLoadingUpazilas(false);
                })
                .catch(() => {
                    setUpazilas([]);
                    setLoadingUpazilas(false);
                });

            setData(prev => ({ ...prev, upazila_id: '', office_id: '', office_branch_id: '', specific_officer_id: '' }));
        }
    }, [data.district_id]);

    // 3. When Location (District) and Category are both selected -> fetch matching Offices
    const fetchMatchingOffices = () => {
        if (!data.category_id || !data.district_id) return;

        setLoadingOffices(true);
        const params = new URLSearchParams({
            category_id: data.category_id,
            division_id: data.division_id || '',
            district_id: data.district_id,
            upazila_id: data.upazila_id || '',
        });

        fetch(`/api/geo/offices-by-service?${params.toString()}`)
            .then(res => res.json())
            .then(json => {
                setOffices(Array.isArray(json) ? json : []);
                setLoadingOffices(false);
            })
            .catch(() => {
                setOffices([]);
                setLoadingOffices(false);
            });
    };

    useEffect(() => {
        if (data.category_id && data.district_id) {
            fetchMatchingOffices();
            // Also fetch predefined problem types for this category
            setLoadingProblems(true);
            fetch(`/api/geo/problem-types/${data.category_id}`)
                .then(res => res.json())
                .then(json => {
                    if (json && typeof json === 'object' && !json.__PHP_Incomplete_Class_Name) {
                        setProblemTypesGrouped(json);
                    } else {
                        setProblemTypesGrouped({});
                    }
                    setLoadingProblems(false);
                })
                .catch(() => {
                    setProblemTypesGrouped({});
                    setLoadingProblems(false);
                });
        }
    }, [data.category_id, data.district_id, data.upazila_id]);

    // 4. When Office changes -> fetch its Branches/Departments
    useEffect(() => {
        if (data.office_id) {
            setLoadingBranches(true);
            fetch(`/api/geo/branches/${data.office_id}`)
                .then(res => res.json())
                .then(json => {
                    setBranches(Array.isArray(json) ? json : []);
                    setLoadingBranches(false);
                })
                .catch(() => {
                    setBranches([]);
                    setLoadingBranches(false);
                });

            setData(prev => ({ ...prev, office_branch_id: '', specific_officer_id: '', is_person_unknown: false }));
        }
    }, [data.office_id]);

    // 5. When Branch or Office changes -> fetch Officers
    useEffect(() => {
        if (data.office_id) {
            setLoadingOfficers(true);
            const url = data.office_branch_id 
                ? `/api/geo/officers/${data.office_id}?branch_id=${data.office_branch_id}`
                : `/api/geo/officers/${data.office_id}`;

            fetch(url)
                .then(res => res.json())
                .then(json => {
                    setOfficers(Array.isArray(json) ? json : []);
                    setLoadingOfficers(false);
                })
                .catch(() => {
                    setOfficers([]);
                    setLoadingOfficers(false);
                });
        }
    }, [data.office_id, data.office_branch_id]);

    // Handle problem checkbox toggle
    const toggleProblem = (problemId) => {
        setData(prev => {
            const current = [...prev.selected_problems];
            const index = current.indexOf(problemId);
            if (index > -1) {
                current.splice(index, 1);
            } else {
                current.push(problemId);
            }
            return { ...prev, selected_problems: current };
        });
    };

    // Camera photo handlers
    const handleCameraCapture = (dataUrl) => {
        setData(prev => ({
            ...prev,
            camera_photos: [...prev.camera_photos, dataUrl],
        }));
    };

    const removeCameraPhoto = (idx) => {
        setData(prev => ({
            ...prev,
            camera_photos: prev.camera_photos.filter((_, i) => i !== idx),
        }));
    };

    // Step validation checks before proceeding
    const canProceed = () => {
        if (step === 1) return data.division_id && data.district_id;
        if (step === 2) return data.category_id;
        if (step === 3) return data.office_id;
        if (step === 4) return true; // Branch selection optional or if empty
        if (step === 5) return data.is_person_unknown || data.specific_officer_id || officers.length === 0;
        if (step === 6) return data.selected_problems.length > 0 || (data.description && data.description.trim().length > 5);
        if (step === 7) return true; // Optional description
        if (step === 8) return true; // Photos are optional but encouraged
        return true;
    };

    // Submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        post('/submit', {
            preserveScroll: true,
        });
    };

    // Selected object lookups for review
    const selectedDivision = Array.isArray(divisions) ? divisions.find(d => String(d.id) === String(data.division_id)) : null;
    const selectedDistrict = Array.isArray(districts) ? districts.find(d => String(d.id) === String(data.district_id)) : null;
    const selectedUpazila = Array.isArray(upazilas) ? upazilas.find(u => String(u.id) === String(data.upazila_id)) : null;
    const selectedCategory = Array.isArray(categories) ? categories.find(c => String(c.id) === String(data.category_id)) : null;
    const selectedOffice = Array.isArray(offices) ? offices.find(o => String(o.id) === String(data.office_id)) : null;
    const selectedBranch = Array.isArray(branches) ? branches.find(b => String(b.id) === String(data.office_branch_id)) : null;
    const selectedOfficer = Array.isArray(officers) ? officers.find(of => String(of.id) === String(data.specific_officer_id)) : null;

    // Steps descriptor
    const wizardSteps = [
        { num: 1, label: 'স্থান' },
        { num: 2, label: 'সেবা' },
        { num: 3, label: 'অফিস' },
        { num: 4, label: 'বিভাগ' },
        { num: 5, label: 'কর্মকর্তা' },
        { num: 6, label: 'সমস্যা' },
        { num: 7, label: 'বিবরণ' },
        { num: 8, label: 'ক্যামেরা' },
        { num: 9, label: 'রিভিউ' },
    ];

    return (
        <PublicLayout>
            <Head title="অভিযোগ দাখিল — ই-অভিযোগ বাক্স" />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Stepper Header */}
                <div className="mb-8">
                    <div className="text-center mb-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            ধাপভিত্তিক সহজ অভিযোগ প্রক্রিয়া
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            সহজে অভিযোগ দাখিল করুন
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            সঠিক অপশনগুলো নির্বাচন করুন, সিস্টেম স্বয়ংক্রিয়ভাবে দায়িত্বপ্রাপ্ত কর্মকর্তার নিকট পৌঁছে দেবে
                        </p>
                    </div>

                    {/* Responsive Progress Bar & Indicators */}
                    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/90">
                        {/* Mobile Compact Progress View */}
                        <div className="sm:hidden space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-mono text-[11px] font-bold flex items-center justify-center">
                                        {step}
                                    </span>
                                    <span>ধাপ {step} / ৯: <strong className="text-emerald-800">{wizardSteps[step - 1]?.label}</strong></span>
                                </span>
                                <span className="text-[11px] font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                                    {Math.round((step / 9) * 100)}% সম্পন্ন
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full transition-all duration-300 rounded-full"
                                    style={{ width: `${(step / 9) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Tablet & Desktop Expanded View */}
                        <div className="hidden sm:block">
                            <div className="flex items-center justify-between gap-2">
                                {wizardSteps.map((s) => (
                                    <div key={s.num} className="flex flex-col items-center flex-1 text-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                            step === s.num
                                                ? 'bg-emerald-700 text-white shadow-md ring-4 ring-emerald-100 scale-110'
                                                : step > s.num
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                                        </div>
                                        <span className={`text-[11px] mt-1.5 font-medium whitespace-nowrap ${
                                            step === s.num ? 'text-emerald-800 font-bold' : 'text-slate-500'
                                        }`}>
                                            {s.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Visual Fill Line */}
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full transition-all duration-300 rounded-full"
                                    style={{ width: `${(step / 9) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ========================================================= */}
                    {/* STEP 1: LOCATION (স্থান)                                 */}
                    {/* ========================================================= */}
                    {step === 1 && (
                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6 animate-fade-in">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-emerald-600" />
                                    ধাপ ১: আপনি কোথায় সেবা নিতে গিয়েছিলেন?
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    প্রথমে বিভাগ ও জেলা নির্বাচন করুন। জেলা সিলেক্ট করার সাথে সাথে সংশ্লিষ্ট উপজেলার তালিকা লোড হবে।
                                </p>
                            </div>

                            {/* Division Selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                                    বিভাগ নির্বাচন করুন <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    {divisions.map((div) => {
                                        const isSelected = String(data.division_id) === String(div.id);
                                        return (
                                            <button
                                                type="button"
                                                key={div.id}
                                                onClick={() => setData(prev => ({ ...prev, division_id: div.id }))}
                                                className={`p-3.5 rounded-xl border text-sm font-semibold text-center transition-all ${
                                                    isSelected
                                                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                                                        : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50 text-slate-700'
                                                }`}
                                            >
                                                {div.name_bn}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* District Selector */}
                            {data.division_id && (
                                <div className="animate-fade-in">
                                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                                        জেলা নির্বাচন করুন <span className="text-rose-500">*</span>
                                    </label>
                                    {loadingDistricts ? (
                                        <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl animate-pulse">
                                            জেলা লোড হচ্ছে...
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                            {districts.map((dist) => {
                                                const isSelected = String(data.district_id) === String(dist.id);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={dist.id}
                                                        onClick={() => setData(prev => ({ ...prev, district_id: dist.id }))}
                                                        className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                                                            isSelected
                                                                ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                                                                : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50 text-slate-700'
                                                        }`}
                                                    >
                                                        {dist.name_bn}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Upazila Selector */}
                            {data.district_id && upazilas.length > 0 && (
                                <div className="animate-fade-in">
                                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                                        উপজেলা / থানা নির্বাচন করুন (ঐচ্ছিক)
                                    </label>
                                    {loadingUpazilas ? (
                                        <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl animate-pulse">
                                            উপজেলা লোড হচ্ছে...
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                            {upazilas.map((upz) => {
                                                const isSelected = String(data.upazila_id) === String(upz.id);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={upz.id}
                                                        onClick={() => setData(prev => ({ ...prev, upazila_id: isSelected ? '' : upz.id }))}
                                                        className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                                                            isSelected
                                                                ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                                                                : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                                        }`}
                                                    >
                                                        {upz.name_bn}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* STEP 2: SERVICE / CATEGORY (সেবা বা দপ্তর)               */}
                    {/* ========================================================= */}
                    {step === 2 && (
                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6 animate-fade-in">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-emerald-600" />
                                    ধাপ ২: কোন সেবা বা দপ্তর নিয়ে অভিযোগ করতে চান?
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    নিচের তালিকা থেকে সংশ্লিষ্ট সরকারি সেবা বা দপ্তরটি নির্বাচন করুন।
                                </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                                {categories.map((cat) => {
                                    const isSelected = String(data.category_id) === String(cat.id);
                                    return (
                                        <button
                                            type="button"
                                            key={cat.id}
                                            onClick={() => setData(prev => ({ ...prev, category_id: cat.id }))}
                                            className={`p-4 rounded-2xl border text-left flex flex-col items-start gap-3 transition-all ${
                                                isSelected
                                                    ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                                                    : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="p-2.5 rounded-xl bg-white shadow-xs border border-slate-100">
                                                {getCategoryIcon(cat.slug, cat.name_en)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm text-slate-900">{cat.name_bn}</h3>
                                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{cat.name_en}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* STEP 3: OFFICE SELECTION (অফিস নির্বাচন)                  */}
                    {/* ========================================================= */}
                    {step === 3 && (
                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6 animate-fade-in">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Landmark className="w-5 h-5 text-emerald-600" />
                                    ধাপ ৩: নির্দিষ্ট অফিস নির্বাচন করুন
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    আপনার নির্বাচিত অবস্থান ({selectedDistrict?.name_bn}) ও সেবা ({selectedCategory?.name_bn}) অনুযায়ী প্রাপ্ত সরকারি অফিসসমূহের তালিকা।
                                </p>
                            </div>

                            {/* Search filter for large office lists */}
                            {offices.length > 4 && (
                                <div className="relative">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                                    <input
                                        type="text"
                                        placeholder="অফিসের নাম দিয়ে খুঁজুন..."
                                        value={officeSearch}
                                        onChange={(e) => setOfficeSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                                    />
                                </div>
                            )}

                            {loadingOffices ? (
                                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl animate-pulse">
                                    অফিসের তালিকা লোড হচ্ছে...
                                </div>
                            ) : offices.length === 0 ? (
                                <div className="p-8 text-center bg-amber-50/60 rounded-2xl border border-amber-200 text-amber-900 space-y-2">
                                    <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                                    <h3 className="font-bold text-sm">এই এলাকায় কোনো অফিস পাওয়া যায়নি</h3>
                                    <p className="text-xs text-amber-700">
                                        নির্বাচিত জেলায় উক্ত সেবার নির্দিষ্ট দপ্তর ডাটাবেজে কনফিগার করা হয়নি। জেলা অভিযোগ কর্মকর্তা বিষয়টি দেখভাল করবেন।
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {offices
                                        .filter(o => !officeSearch || o.name_bn.includes(officeSearch) || o.name_en.toLowerCase().includes(officeSearch.toLowerCase()))
                                        .map((off) => {
                                            const isSelected = String(data.office_id) === String(off.id);
                                            return (
                                                <button
                                                    type="button"
                                                    key={off.id}
                                                    onClick={() => setData(prev => ({ ...prev, office_id: off.id }))}
                                                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                                                        isSelected
                                                            ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                                                            : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                                        <Building2 className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-xs sm:text-sm text-slate-900">{off.name_bn}</h3>
                                                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{off.name_en}</p>
                                                        {off.address && (
                                                            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                                                <MapPin className="w-3 h-3 shrink-0" />
                                                                <span className="truncate">{off.address}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* STEP 4: BRANCH / DEPARTMENT (বিভাগ / শাখা)               */}
                    {/* ========================================================= */}
                    {step === 4 && (
                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6 animate-fade-in">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-emerald-600" />
                                    ধাপ ৪: অফিসের কোন শাখা বা ডিপার্টমেন্টে ঘটনাটি ঘটেছে?
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    {selectedOffice?.name_bn}-এর অভ্যন্তরীণ শাখাসমূহ। জানা না থাকলে নিচের যেকোনো একটি নির্বাচন করুন অথবা পরবর্তী ধাপে যান।
                                </p>
                            </div>

                            {loadingBranches ? (
                                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl animate-pulse">
                                    শাখাসমূহ লোড হচ্ছে...
                                </div>
                            ) : branches.length === 0 ? (
                                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-xs">
                                    এই অফিসের অধীনে আলাদা কোনো সাব-শাখা কনফিগার করা নেই। পুরো অফিস হিসেবে অভিযোগ গণ্য হবে।
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {branches.map((br) => {
                                        const isSelected = String(data.office_branch_id) === String(br.id);
                                        return (
                                            <button
                                                type="button"
                                                key={br.id}
                                                onClick={() => setData(prev => ({ ...prev, office_branch_id: br.id }))}
                                                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                                                    isSelected
                                                        ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-900 font-bold'
                                                        : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50 text-slate-700'
                                                }`}
                                            >
                                                <div className={`w-3.5 h-3.5 rounded-full mt-0.5 border shrink-0 flex items-center justify-center ${
                                                    isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                                                }`}>
                                                    {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                                </div>
                                                <div>
                                                    <span className="text-xs sm:text-sm font-semibold block">{br.name_bn}</span>
                                                    {br.room_number && (
                                                        <span className="text-[11px] text-slate-400 font-normal">রুম নং: {br.room_number}, {br.floor}</span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* STEP 5: PERSON / OFFICER (ব্যক্তি বা কর্মকর্তা)           */}
                    {/* ========================================================= */}
                    {step === 5 && (
                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6 animate-fade-in">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-emerald-600" />
                                    ধাপ ৫: কোন ব্যক্তির বিরুদ্ধে আপনার অভিযোগ?
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    ব্যক্তির নাম জানা থাকলে সিলেক্ট করুন। নাম জানা না থাকলে সরাসরি <strong>"আমি ব্যক্তির নাম জানি না"</strong> নির্বাচন করতে পারেন।
                                </p>
                            </div>

                            {/* Prominent Unknown Person Card */}
                            <button
                                type="button"
                                onClick={() => setData(prev => ({ ...prev, is_person_unknown: true, specific_officer_id: '' }))}
                                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                                    data.is_person_unknown
                                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/20 shadow-xs'
                                        : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl shrink-0 ${data.is_person_unknown ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        <UserX className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-900">আমি ব্যক্তির নাম জানি না</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            দপ্তর বা শাখার দায়িত্বপ্রাপ্ত কর্মকর্তা স্বয়ংক্রিয়ভাবে অভিযোগটি খতিয়ে দেখবেন
                                        </p>
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                    data.is_person_unknown ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'
                                }`}>
                                    {data.is_person_unknown && <Check className="w-3 h-3" />}
                                </div>
                            </button>

                            <div className="relative flex py-2 items-center">
                                <div className="grow border-t border-slate-200"></div>
                                <span className="shrink mx-4 text-xs text-slate-400 font-semibold uppercase">অথবা নির্দিষ্ট কর্মকর্তা বেছে নিন</span>
                                <div className="grow border-t border-slate-200"></div>
                            </div>

                            {loadingOfficers ? (
                                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl animate-pulse">
                                    কর্মকর্তাদের তালিকা লোড হচ্ছে...
                                </div>
                            ) : officers.length === 0 ? (
                                <div className="p-4 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
                                    এই শাখায় কোনো কর্মকর্তার প্রোফাইল যুক্ত করা নেই। আপনি ওপরের "আমি ব্যক্তির নাম জানি না" নির্বাচন করতে পারেন।
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {officers.map((off) => {
                                        const isSelected = !data.is_person_unknown && String(data.specific_officer_id) === String(off.id);
                                        return (
                                            <button
                                                type="button"
                                                key={off.id}
                                                onClick={() => setData(prev => ({ ...prev, specific_officer_id: off.id, is_person_unknown: false }))}
                                                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                                                    isSelected
                                                        ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                                                        : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                                                }`}
                                            >
                                                <div className={`p-2.5 rounded-full shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-xs sm:text-sm text-slate-900">{off.name_bn}</h3>
                                                    <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">{off.designation_bn}</p>
                                                    {off.branch && (
                                                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] rounded bg-slate-100 text-slate-600 font-medium">
                                                            {off.branch.name_bn}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* STEP 6: SMART PROBLEM SELECTION (সমস্যার ধরন)            */}
                    {/* ========================================================= */}
                    {step === 6 && (
                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6 animate-fade-in">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-emerald-600" />
                                    ধাপ ৬: আপনার কী সমস্যা হয়েছে?
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    কোনো বড় রচনা লিখতে হবে না। প্রযোজ্য সমস্যাগুলোর ওপর টিক চিহ্ন দিন (একাধিক নির্বাচন করা যাবে)।
                                </p>
                            </div>

                            {loadingProblems ? (
                                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl animate-pulse">
                                    সমস্যার তালিকা লোড হচ্ছে...
                                </div>
                            ) : Object.keys(problemTypesGrouped).length === 0 ? (
                                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-xs">
                                    এই সেবার জন্য পূর্বনির্ধারিত সমস্যার তালিকা প্রস্তুত নেই। অনুগ্রহ করে পরবর্তী ধাপে ঘটনাটি নিজের ভাষায় লিখুন।
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {Object.entries(problemTypesGrouped).map(([clusterName, clusterProblems]) => (
                                        <div key={clusterName} className="space-y-2.5">
                                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                                {clusterName}
                                            </h3>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {Array.isArray(clusterProblems) && clusterProblems.map((prob) => {
                                                    const isChecked = data.selected_problems.includes(prob.id);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={prob.id}
                                                            onClick={() => toggleProblem(prob.id)}
                                                            className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                                                                isChecked
                                                                    ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-950 shadow-xs'
                                                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-700'
                                                            }`}
                                                        >
                                                            <div className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center shrink-0 transition-colors ${
                                                                isChecked ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300 bg-white'
                                                            }`}>
                                                                {isChecked && <Check className="w-3 h-3" />}
                                                            </div>
                                                            <span className="text-xs font-semibold leading-relaxed">
                                                                {prob.title_bn}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* STEP 7: OPTIONAL DESCRIPTION (ঐচ্ছিক বিবরণ)              */}
                    {/* ========================================================= */}
                    {step === 7 && (
                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6 animate-fade-in">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-600" />
                                    ধাপ ৭: আপনি চাইলে ঘটনাটি নিজের ভাষায় লিখতে পারেন (ঐচ্ছিক)
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    এটি বাধ্যতামূলক নয়। আপনি কিছু না লিখলেও পূর্ববর্তী ধাপে নির্বাচিত সমস্যার ভিত্তিতে অভিযোগ নিবন্ধিত হবে।
                                </p>
                            </div>

                            {/* Complaint Title (Optional) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                                    অভিযোগের সংক্ষিপ্ত শিরোনাম (ঐচ্ছিক)
                                </label>
                                <input
                                    type="text"
                                    placeholder="যেমন: জরুরি বিভাগে সেবা প্রাপ্তিতে বিলম্ব ও ওষুধ না পাওয়ার অভিযোগ"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                                />
                            </div>

                            {/* Complaint Description (Optional) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                                    ঘটনার বিস্তারিত বিবরণ (ঐচ্ছিক)
                                </label>
                                <textarea
                                    rows={5}
                                    placeholder="ঘটনাটি সংক্ষেপে নিজের ভাষায় লিখুন (কী ঘটেছিল, তারিখ বা আনুমানিক সময়)..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    maxLength={5000}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
                                />
                                <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
                                    <span>কিছু না লিখলেও স্বয়ংক্রিয়ভাবে একটি সারাংশ তৈরি হবে</span>
                                    <span>{data.description?.length || 0} / ৫০০০ অক্ষর</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* STEP 8: CAMERA EVIDENCE (ক্যামেরা প্রমাণ)                 */}
                    {/* ========================================================= */}
                    {step === 8 && (
                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6 animate-fade-in">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-emerald-600" />
                                    ধাপ ৮: প্রমাণ থাকলে ছবি তুলুন
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    প্রেসক্রিপশন, স্লিপ, রসিদ বা ঘটনাস্থলের ছবি মোবাইল ক্যামেরা দিয়ে সরাসরি তুলে যুক্ত করুন।
                                </p>
                            </div>

                            {/* Camera Trigger Card */}
                            <div className="p-8 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                                    <Camera className="w-8 h-8" />
                                </div>

                                <div>
                                    <h3 className="font-bold text-base text-slate-900">ডিভাইস ক্যামেরা দিয়ে ছবি তুলুন</h3>
                                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                                        ক্যামেরা চালু করে লাইভ ছবি তুলে প্রমাণ হিসেবে সংযুক্ত করুন
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsCameraModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-xs transition-all transform active:scale-95"
                                >
                                    <Camera className="w-4 h-4" />
                                    <span>📷 ক্যামেরা চালু করুন ও ছবি তুলুন</span>
                                </button>
                            </div>

                            {/* Captured Photos Preview Grid */}
                            {data.camera_photos.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        সংযুক্ত ছবিসমূহ ({data.camera_photos.length} টি)
                                    </h3>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {data.camera_photos.map((photo, index) => (
                                            <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100 shadow-xs">
                                                <img 
                                                    src={photo} 
                                                    alt={`Evidence ${index + 1}`} 
                                                    className="w-full h-full object-cover" 
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeCameraPhoto(index)}
                                                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white shadow-sm transition-all"
                                                    title="ছবিটি মুছুন"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] rounded bg-black/60 text-white font-mono">
                                                    ছবি #{index + 1}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>আপনার সরবরাহকৃত সকল ছবি ও প্রমাণ সম্পূর্ণ গোপনীয় এবং নিরাপদ সরকারি সার্ভারে সংরক্ষিত থাকবে।</span>
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* STEP 9: REVIEW & SUBMIT (পর্যালোচনা ও দাখিল)             */}
                    {/* ========================================================= */}
                    {step === 9 && (
                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6 animate-fade-in">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    ধাপ ৯: অভিযোগ পর্যালোচনা ও নিশ্চিতকরণ
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    দাখিল করার পূর্বে তথ্যগুলো সঠিক আছে কি না মিলিয়ে নিন।
                                </p>
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">সেবা ও স্থান</span>
                                    <p className="font-bold text-slate-900 text-sm">{selectedCategory?.name_bn}</p>
                                    <p className="text-slate-600">{selectedDivision?.name_bn} বিভাগ → {selectedDistrict?.name_bn} জেলা {selectedUpazila ? `→ ${selectedUpazila.name_bn}` : ''}</p>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">অফিস ও ডিপার্টমেন্ট</span>
                                    <p className="font-bold text-slate-900 text-sm">{selectedOffice?.name_bn}</p>
                                    <p className="text-slate-600">শাখা: {selectedBranch ? selectedBranch.name_bn : 'সাধারণ শাখা'}</p>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">অভিযোগকৃত ব্যক্তি</span>
                                    {data.is_person_unknown ? (
                                        <p className="font-bold text-amber-700">ব্যক্তির নাম অজ্ঞাত (দপ্তর প্রধান দেখভাল করবেন)</p>
                                    ) : selectedOfficer ? (
                                        <div>
                                            <p className="font-bold text-slate-900">{selectedOfficer.name_bn}</p>
                                            <p className="text-slate-500">{selectedOfficer.designation_bn}</p>
                                        </div>
                                    ) : (
                                        <p className="text-slate-500">নির্দিষ্ট কোনো কর্মকর্তা চিহ্নিত করা হয়নি</p>
                                    )}
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">প্রমাণ ও ছবি</span>
                                    <p className="font-bold text-slate-900">{data.camera_photos.length} টি ছবি সংযুক্ত করা হয়েছে</p>
                                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                                        <Shield className="w-3.5 h-3.5" /> গোপনীয় নথি হিসেবে সংরক্ষিত
                                    </span>
                                </div>
                            </div>

                            {/* Citizen Identity & Privacy Box */}
                            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-emerald-700" />
                                        <h3 className="font-bold text-sm text-emerald-950">নাগরিক পরিচয় ও গোপনীয়তা রক্ষা</h3>
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                        সুরক্ষিত
                                    </span>
                                </div>

                                <p className="text-xs text-emerald-900/80">
                                    আপনার নাম ও মোবাইল নম্বর সর্বসাধারণের নিকট সম্পূর্ণ গোপন থাকবে। কেবল অভিযোগের অগ্রগতি সম্পর্কে আপনাকে নোটিফিকেশন পাঠাতে এটি প্রয়োজন।
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            আপনার নাম {!data.is_anonymous && <span className="text-rose-500">*</span>}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="আপনার পুরো নাম"
                                            value={data.complainant_name}
                                            onChange={(e) => setData('complainant_name', e.target.value)}
                                            disabled={data.is_anonymous}
                                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            মোবাইল নম্বর {!data.is_anonymous && <span className="text-rose-500">*</span>}
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="০১৭১XXXXXXXX"
                                            value={data.complainant_phone}
                                            onChange={(e) => setData('complainant_phone', e.target.value)}
                                            disabled={data.is_anonymous}
                                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_anonymous}
                                        onChange={(e) => setData('is_anonymous', e.target.checked)}
                                        className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                                    />
                                    <span className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                                        সম্পূর্ণ বেনামে অভিযোগ করতে চাই (বেনামী অভিযোগে নাম প্রকাশ পাবে না)
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* WIZARD NAVIGATION BAR (STATIONARY CONTROLS)                */}
                    {/* ========================================================= */}
                    <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center justify-between gap-4">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={() => setStep(prev => prev - 1)}
                                className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>পূর্ববর্তী ধাপ</span>
                            </button>
                        ) : (
                            <div></div>
                        )}

                        {step < 9 ? (
                            <button
                                type="button"
                                disabled={!canProceed()}
                                onClick={() => setStep(prev => prev + 1)}
                                className={`inline-flex items-center gap-1.5 px-6 sm:px-8 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all ${
                                    canProceed()
                                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white ring-2 ring-emerald-500/20 active:scale-95'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                <span>পরবর্তী ধাপ</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-8 sm:px-10 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:bg-slate-400"
                            >
                                {processing ? (
                                    <span>জমা হচ্ছে...</span>
                                ) : (
                                    <>
                                        <span>অভিযোগ দাখিল করুন</span>
                                        <Check className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Device Camera Modal */}
            <CameraCaptureModal
                isOpen={isCameraModalOpen}
                onClose={() => setIsCameraModalOpen(false)}
                onCapture={handleCameraCapture}
            />
        </PublicLayout>
    );
}
