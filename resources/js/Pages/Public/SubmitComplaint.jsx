import React, { useState, useEffect } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
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
    EyeOff,
    UploadCloud,
    Image as ImageIcon,
    Video,
    FileCheck,
    Edit3,
    RotateCcw,
    AlertTriangle,
    GitBranch,
    ShieldCheck
} from 'lucide-react';

export default function SubmitComplaint({ categories = [], divisions = [], currentUser }) {
    // Current Wizard Step (1 to 9)
    const [step, setStep] = useState(1);
    const [editOriginStep, setEditOriginStep] = useState(null); // When jumped from Review step
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

    // Custom "Other" Problem toggle
    const [hasOtherProblem, setHasOtherProblem] = useState(false);

    // Explicit confirmation on Step 9 to prevent accidental or auto-submit
    const [reviewConfirmed, setReviewConfirmed] = useState(false);

    // Form data
    const { data, setData, post, processing, progress, errors } = useForm({
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
        accused_person_name: '',

        // Step 6: Smart Selected Problems & Custom Other Problem
        selected_problems: [],
        other_problem_description: '',

        // Step 7: Optional Description
        title: '',
        description: '',

        // Step 8: Evidence (Live Camera + Gallery/File Uploads)
        camera_photos: [], // Base64 data URLs from device camera
        attachments: [],   // Array of File objects from gallery/file selector

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
            // Fetch predefined problem types for this category
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

    // Read preselected category or division from URL query params
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const initialCat = urlParams.get('category');
            const initialDiv = urlParams.get('division');
            if (initialCat || initialDiv) {
                setData(prev => ({
                    ...prev,
                    ...(initialCat ? { category_id: String(initialCat) } : {}),
                    ...(initialDiv ? { division_id: String(initialDiv) } : {})
                }));
            }
        }
    }, []);

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

    // Gallery / File attachments handlers
    const [uploadError, setUploadError] = useState(null);

    const handleFileUpload = (e) => {
        setUploadError(null);
        const files = Array.from(e.target.files || []);
        const validFiles = [];
        const oversizedFiles = [];

        files.forEach(f => {
            if (f.size > 100 * 1024 * 1024) {
                oversizedFiles.push(f.name);
            } else {
                validFiles.push(f);
            }
        });

        if (oversizedFiles.length > 0) {
            setUploadError(`ফাইলের আকার সর্বোচ্চ ১০০ মেগাবাইট হতে পারবে। (${oversizedFiles.join(', ')}) ফাইলটি ১০০ মেগাবাইটের চেয়ে বড়।`);
        }

        if (validFiles.length > 0) {
            setData(prev => ({
                ...prev,
                attachments: [...prev.attachments, ...validFiles],
            }));
        }
        e.target.value = '';
    };

    const removeAttachment = (indexToRemove) => {
        setData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, idx) => idx !== indexToRemove),
        }));
    };

    // Step validation checks before proceeding
    const canProceed = () => {
        if (step === 1) return data.division_id && data.district_id;
        if (step === 2) return data.category_id;
        if (step === 3) return data.office_id;
        if (step === 4) return true; // Branch selection optional
        if (step === 5) return data.is_person_unknown || data.specific_officer_id || data.accused_person_name || officers.length === 0;
        if (step === 6) return data.selected_problems.length > 0 || (data.other_problem_description && data.other_problem_description.trim().length > 3) || (data.description && data.description.trim().length > 5);
        if (step === 7) return true; // Optional description
        if (step === 8) return true; // Photos/evidence optional but encouraged
        return true;
    };

    // Jump from review to any step
    const jumpToStep = (targetStep) => {
        setEditOriginStep(9);
        setStep(targetStep);
    };

    const returnBackToReview = () => {
        setStep(9);
        setEditOriginStep(null);
    };

    // Submit handler with strict step & confirmation guards
    const handleSubmit = (e) => {
        e.preventDefault();
        // Strict guard: NEVER allow submit unless explicitly on Step 9 and confirmed
        if (step !== 9) {
            console.warn('Form submission prevented: user is on step', step);
            return false;
        }
        if (!reviewConfirmed) {
            console.warn('Form submission prevented: review confirmation required');
            return false;
        }
        post('/submit', {
            preserveScroll: true,
        });
    };

    // Prevent accidental form submission when pressing Enter in inputs
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
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
        { num: 4, label: 'শাখা' },
        { num: 5, label: 'ব্যক্তি' },
        { num: 6, label: 'সমস্যা' },
        { num: 7, label: 'বিবরণ' },
        { num: 8, label: 'প্রমাণ' },
        { num: 9, label: 'রিভিউ' },
    ];

    return (
        <PublicLayout>
            <Head title="অভিযোগ দাখিল — ই-অভিযোগ বাক্স" />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Review Mode Banner when user is editing a previous step */}
                {editOriginStep === 9 && step !== 9 && (
                    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border-2 border-emerald-500/30 flex items-center justify-between gap-4 animate-fade-in shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                ✏️
                            </div>
                            <div>
                                <span className="font-extrabold text-xs sm:text-sm text-slate-900 block">
                                    রিভিউ মোড: আপনি {wizardSteps[step - 1]?.label} সংক্রান্ত তথ্য পরিবর্তন করছেন
                                </span>
                                <span className="text-[11px] text-slate-500">
                                    প্রয়োজনীয় সংশোধন শেষে সরাসরি রিভিউ পেজে ফিরে যান
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={returnBackToReview}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
                        >
                            <span>✓ রিভিউতে ফিরে যান</span>
                        </button>
                    </div>
                )}

                {/* Stepper Header */}
                <div className="mb-8">
                    <div className="text-center mb-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            ধাপভিত্তিক সহজ অভিযোগ প্রক্রিয়া
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            সহজে অভিযোগ দাখিল করুন
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            সঠিক অপশনগুলো নির্বাচন করুন, সিস্টেম স্বয়ংক্রিয়ভাবে সংশ্লিষ্ট কর্মকর্তার টেবিলে পৌঁছে দেবে
                        </p>
                    </div>

                    {/* Responsive Progress Bar & Indicators */}
                    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/90">
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
                                    <button
                                        type="button"
                                        key={s.num}
                                        onClick={() => {
                                            // Allow jumping back to earlier completed steps
                                            if (s.num <= step || editOriginStep === 9) setStep(s.num);
                                        }}
                                        className={`flex flex-col items-center flex-1 text-center transition-all ${
                                            s.num <= step ? 'cursor-pointer' : 'cursor-default'
                                        }`}
                                    >
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
                                    </button>
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
                <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
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
                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        জেলা নির্বাচন করুন <span className="text-rose-500">*</span>
                                    </label>
                                    {loadingDistricts ? (
                                        <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl animate-pulse">
                                            জেলা লোড হচ্ছে...
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {districts.map((dist) => {
                                                const isSelected = String(data.district_id) === String(dist.id);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={dist.id}
                                                        onClick={() => setData(prev => ({ ...prev, district_id: dist.id }))}
                                                        className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                                                            isSelected
                                                                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                                                : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
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

                            {/* Upazila Selector (Optional) */}
                            {data.district_id && upazilas.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        উপজেলা বা থানা (ঐচ্ছিক)
                                    </label>
                                    {loadingUpazilas ? (
                                        <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl animate-pulse">
                                            উপজেলা লোড হচ্ছে...
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                                    নিচের তালিকা থেকে সংশ্লিষ্ট সরকারি সেবা বা দপ্তরটি নির্বাচন করুন। এডমিন ড্যাশবোর্ড থেকে অনুমোদিত সক্রিয় খাতসমূহ এখানে প্রদর্শিত হচ্ছে।
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
                                    আপনার নির্বাচিত অবস্থান ({selectedDistrict?.name_bn}) ও সেবা ({selectedCategory?.name_bn}) অনুযায়ী প্রাপ্ত সরকারি অফিসসমূহ।
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
                                        নির্বাচিত জেলায় উক্ত সেবার নির্দিষ্ট দপ্তর ডাটাবেজে কনফিগার করা হয়নি। জেলা অভিযোগ কর্মকর্তা বিষয়টি সরাসরি দেখভাল করবেন।
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {offices
                                        .filter(o => !officeSearch || o.name_bn.includes(officeSearch) || o.name_en?.toLowerCase().includes(officeSearch.toLowerCase()))
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
                    {/* STEP 4: BRANCH / DEPARTMENT (অফিসের শাখা / ডিপার্টমেন্ট)   */}
                    {/* ========================================================= */}
                    {step === 4 && (
                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6 animate-fade-in">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <GitBranch className="w-5 h-5 text-emerald-600" />
                                    ধাপ ৪: অফিসের কোন শাখা বা ডিপার্টমেন্টে ঘটনাটি ঘটেছে?
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    {selectedOffice?.name_bn}-এর অভ্যন্তরীণ শাখাসমূহ। জানা না থাকলে নিচের সাধারণ দপ্তর নির্বাচন করতে পারেন বা পরবর্তী ধাপে যেতে পারেন।
                                </p>
                            </div>

                            {/* Option 0: General Office / Unknown Branch */}
                            <button
                                type="button"
                                onClick={() => setData(prev => ({ ...prev, office_branch_id: '' }))}
                                className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                                    !data.office_branch_id
                                        ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${!data.office_branch_id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="text-xs sm:text-sm font-bold block">সাধারণ দপ্তর / শাখা নির্দিষ্ট নেই</span>
                                        <span className="text-[11px] text-slate-500 font-normal">সমগ্র অফিসের মূল দায়িত্বপ্রাপ্ত কর্মকর্তার দৃষ্টিগোচর হবে</span>
                                    </div>
                                </div>
                                {!data.office_branch_id && <Check className="w-4 h-4 text-emerald-700" />}
                            </button>

                            {loadingBranches ? (
                                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl animate-pulse">
                                    শাখাসমূহ লোড হচ্ছে...
                                </div>
                            ) : branches.length === 0 ? (
                                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-xs">
                                    এই অফিসের অধীনে আলাদা কোনো উপ-শাখা কনফিগার করা নেই। সম্পূর্ণ অফিস হিসেবেই অভিযোগ গণ্য হবে।
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                        উপলব্ধ শাখাসমূহ ({branches.length} টি):
                                    </span>
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
                                    ব্যক্তির পুরো নাম জানা না থাকলেও সমস্যা নেই। ডাকনাম বা পরিচিত পদবি লিখে দিতে পারেন অথবা "আমি ব্যক্তির নাম জানি না" নির্বাচন করতে পারেন।
                                </p>
                            </div>

                            {/* 1. Prominent Unknown Person Card */}
                            <button
                                type="button"
                                onClick={() => setData(prev => ({ 
                                    ...prev, 
                                    is_person_unknown: true, 
                                    specific_officer_id: '',
                                    accused_person_name: '' 
                                }))}
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
                                            দপ্তর বা শাখার প্রধান কর্মকর্তা স্বয়ংক্রিয়ভাবে অভিযোগটি খতিয়ে দেখবেন
                                        </p>
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                    data.is_person_unknown ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'
                                }`}>
                                    {data.is_person_unknown && <Check className="w-3 h-3" />}
                                </div>
                            </button>

                            {/* 2. Custom Accused Person Input (Nickname / Informal Name / Known Post) */}
                            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <User className="w-4 h-4 text-emerald-600" />
                                    <span>কর্মকর্তা বা কর্মচারীর পরিচিত নাম / ডাকনাম / পদবি (ঐচ্ছিক)</span>
                                </label>
                                <p className="text-[11px] text-slate-500">
                                    যেমন: "রফিক সাহেব", "ক্যাশ কাউন্টারের সহকারী", "ডিউটি ট্রাফিক সার্জেন্ট"। পুরো নাম জানা না থাকলে বা ডাকনামে চিনলে এখানে লিখে দিতে পারেন।
                                </p>
                                <input
                                    type="text"
                                    placeholder="যেমন: রফিক সাহেব, ক্যাশ কাউন্টার সহকারী"
                                    value={data.accused_person_name || ''}
                                    onChange={(e) => setData(prev => ({ 
                                        ...prev, 
                                        accused_person_name: e.target.value,
                                        ...(e.target.value ? { is_person_unknown: false } : {})
                                    }))}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                                />
                            </div>

                            {/* 3. Listed Officers Selector */}
                            <div className="relative flex py-1 items-center">
                                <div className="grow border-t border-slate-200"></div>
                                <span className="shrink mx-4 text-[11px] text-slate-400 font-semibold uppercase">
                                    অথবা তালিকা থেকে নির্দিষ্ট কর্মকর্তা বেছে নিন
                                </span>
                                <div className="grow border-t border-slate-200"></div>
                            </div>

                            {loadingOfficers ? (
                                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl animate-pulse">
                                    কর্মকর্তাদের তালিকা লোড হচ্ছে...
                                </div>
                            ) : officers.length === 0 ? (
                                <div className="p-4 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
                                    এই শাখায় কোনো পূর্বনির্ধারিত কর্মকর্তার প্রোফাইল পাওয়া যায়নি। আপনি ওপরের ইনপুট বক্সে নাম লিখতে পারেন অথবা "আমি ব্যক্তির নাম জানি না" নির্বাচন করতে পারেন।
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {officers.map((off) => {
                                        const isSelected = !data.is_person_unknown && String(data.specific_officer_id) === String(off.id);
                                        return (
                                            <button
                                                type="button"
                                                key={off.id}
                                                onClick={() => setData(prev => ({ 
                                                    ...prev, 
                                                    specific_officer_id: off.id, 
                                                    is_person_unknown: false,
                                                    accused_person_name: off.name_bn 
                                                }))}
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
                                    প্রযোজ্য সমস্যাগুলোর ওপর টিক চিহ্ন দিন। <strong>একসাথে দুই-তিনটি সমস্যাও নির্বাচন করা যাবে।</strong> তালিকায় না থাকলে "অন্যান্য" অপশনে নিজের সমস্যা লিখতে পারেন।
                                </p>
                            </div>

                            {loadingProblems ? (
                                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl animate-pulse">
                                    সমস্যার তালিকা লোড হচ্ছে...
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

                                    {/* Other Custom Problem Option */}
                                    <div className="pt-3 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setHasOtherProblem(!hasOtherProblem)}
                                            className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                                                hasOtherProblem || data.other_problem_description
                                                    ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-950 shadow-xs'
                                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-700'
                                            }`}
                                        >
                                            <div className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center shrink-0 transition-colors ${
                                                hasOtherProblem || data.other_problem_description ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300 bg-white'
                                            }`}>
                                                {(hasOtherProblem || data.other_problem_description) && <Check className="w-3 h-3" />}
                                            </div>
                                            <div>
                                                <span className="text-xs sm:text-sm font-bold block">
                                                    অন্যান্য (তালিকায় নেই এমন সমস্যা)
                                                </span>
                                                <span className="text-[11px] text-slate-500">
                                                    আপনার সুনির্দিষ্ট সমস্যাটি তালিকার বাইরে থাকলে এখানে টিক দিয়ে নিজের ভাষায় লিখুন
                                                </span>
                                            </div>
                                        </button>

                                        {(hasOtherProblem || data.other_problem_description) && (
                                            <div className="mt-3 space-y-1.5 animate-fade-in">
                                                <textarea
                                                    rows={3}
                                                    placeholder="আপনার সমস্যাটি সংক্ষেপে লিখুন (যেমন: নির্ধারিত ফি ছাড়া অতিরিক্ত অর্থ দাবি করা হচ্ছে, বিনা কারণে ফাইল আটকে রাখা হয়েছে ইত্যাদি)..."
                                                    value={data.other_problem_description}
                                                    onChange={(e) => setData('other_problem_description', e.target.value)}
                                                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed shadow-2xs"
                                                />
                                            </div>
                                        )}
                                    </div>
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
                                    এটি সম্পূর্ণ ঐচ্ছিক। আপনি কিছু না লিখলেও পূর্ববর্তী ধাপে নির্বাচিত সমস্যার ভিত্তিতে অভিযোগ নিবন্ধিত হবে।
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
                    {/* STEP 8: CAMERA & MEDIA EVIDENCE (ছবি, ভিডিও ও প্রমাণাদি) */}
                    {/* ========================================================= */}
                    {step === 8 && (
                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6 animate-fade-in">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-emerald-600" />
                                    ধাপ ৮: প্রমাণ থাকলে ছবি, ভিডিও বা ডকুমেন্ট যুক্ত করুন
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    রসিদ, প্রেসক্রিপশন, স্লিপ বা ঘটনাস্থলের ছবি লাইভ ক্যামেরা দিয়ে তুলুন অথবা গ্যালারি থেকে আপলোড করুন। একাধিক ফাইল যুক্ত করা যাবে।
                                </p>
                            </div>

                            {/* Two Options: Instant Live Camera vs Gallery/File Upload */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Option A: Instant Live Camera */}
                                <div className="p-6 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 flex flex-col items-center justify-between text-center space-y-4">
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-2xs">
                                            ⭐ মাঠ পর্যায় থেকে সরাসরি লাইভ (উচ্চ অগ্রাধিকার)
                                        </div>
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                                            <Camera className="w-7 h-7" />
                                        </div>
                                        <h3 className="font-bold text-sm text-slate-900">ডিভাইস ক্যামেরা দিয়ে লাইভ তুলুন</h3>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                            ঘটনাস্থল থেকে সরাসরি ক্যামেরা দিয়ে তোলা ছবি সিস্টেমে সর্বোচ্চ অগ্রাধিকার ও বিশ্বাসযোগ্যতা পায়
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setIsCameraModalOpen(true)}
                                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all transform active:scale-95"
                                    >
                                        <Camera className="w-4 h-4" />
                                        <span>ক্যামেরা চালু করুন</span>
                                    </button>
                                </div>

                                 {/* Option B: Gallery / Document / Video Upload */}
                                <div className="p-6 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/40 flex flex-col items-center justify-between text-center space-y-4">
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                            ফটো, ভিডিও (৪০ MB পর্যন্ত সমর্থিত) বা PDF
                                        </div>
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-sm">
                                            <UploadCloud className="w-7 h-7" />
                                        </div>
                                        <h3 className="font-bold text-sm text-slate-900">গ্যালারি বা ভিডিও ফাইল আপলোড</h3>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                            পূর্বে তোলা ছবি, ৪০ মেগাবাইট পর্যন্ত যেকোনো দীর্ঘ ভিডিও ক্লিপ (MP4, WebM, MOV) বা ডকুমেন্ট যুক্ত করুন
                                        </p>
                                    </div>

                                    <label className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer transform active:scale-95">
                                        <UploadCloud className="w-4 h-4" />
                                        <span>ফাইল বা ৪০ MB ভিডিও নির্বাচন করুন</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,video/*,.pdf,.doc,.docx,.mp4,.webm,.mov,.avi,.mkv,.3gp,.3gpp,.m4v,.wmv"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Upload Size / Format Error */}
                            {uploadError && (
                                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                    <span>{uploadError}</span>
                                </div>
                            )}

                            {(errors.attachments || Object.keys(errors).some(k => k.startsWith('attachments.'))) && (
                                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                    <span>
                                        {errors.attachments || Object.entries(errors).find(([k]) => k.startsWith('attachments.'))?.[1] || 'ফাইল আপলোডে ত্রুটি দেখা দিয়েছে।'}
                                    </span>
                                </div>
                            )}

                            {/* Captured Live Photos Preview */}
                            {data.camera_photos.length > 0 && (
                                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                            লাইভ ক্যামেরা প্রমাণ ({data.camera_photos.length} টি) — <span className="text-emerald-700 font-semibold">উচ্চ অগ্রাধিকার ট্যাগ</span>
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {data.camera_photos.map((photo, index) => (
                                            <div key={index} className="relative group rounded-xl overflow-hidden border border-emerald-300 aspect-square bg-slate-100 shadow-2xs">
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
                                                <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[9px] rounded-md bg-emerald-950/80 text-emerald-200 font-bold">
                                                    📷 লাইভ #{index + 1}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Uploaded Gallery Files Preview */}
                            {data.attachments.length > 0 && (
                                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                                            গ্যালারি ও ডকুমেন্ট ফাইল ({data.attachments.length} টি)
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {data.attachments.map((file, idx) => {
                                            const isImage = file.type.startsWith('image/');
                                            const isVid = file.type.startsWith('video/');
                                            return (
                                                <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                                                            {isImage ? <ImageIcon className="w-4 h-4" /> : isVid ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="text-xs font-bold text-slate-800 truncate block">{file.name}</span>
                                                            <span className="text-[10px] text-slate-500 font-mono font-semibold">
                                                                {file.size >= 1024 * 1024
                                                                    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                                                                    : `${(file.size / 1024).toFixed(1)} KB`
                                                                } • {isImage ? 'ছবি' : isVid ? 'ভিডিও ক্লিপ' : 'ডকুমেন্ট'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttachment(idx)}
                                                        className="p-1 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                                                        title="মুছুন"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Intelligent Verification & Privacy Note */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
                                <div className="flex items-center gap-2 text-slate-700 font-bold">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>স্মার্ট প্রমাণ ও এআই সুরক্ষা বিশ্লেষণ</span>
                                </div>
                                <p className="leading-relaxed">
                                    আপনার সরবরাহকৃত সকল নথি ও ছবি সুরক্ষিত সরকারি সার্ভারে সংরক্ষিত থাকবে। গ্যালারি থেকে আপলোডকৃত ফাইলসমূহ এআই বা কৃত্রিম কারচুপির অধীন কি না তা স্বয়ংক্রিয়ভাবে খতিয়ে দেখা হবে যাতে স্বচ্ছ ও সঠিক তথ্যের ভিত্তিতে প্রতিকার নিশ্চিত হয়।
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* STEP 9: REVIEW & SUBMIT (পর্যালোচনা ও ইন-প্লেস এডিট)     */}
                    {/* ========================================================= */}
                    {step === 9 && (
                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6 animate-fade-in">
                            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                        ধাপ ৯: অভিযোগ পর্যালোচনা ও নিশ্চিতকরণ
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-1">
                                        দাখিল করার পূর্বে তথ্যগুলো সঠিক আছে কি না মিলিয়ে নিন। যেকোনো সেকশন পরিবর্তন করতে সরাসরি <strong>"পরিবর্তন করুন"</strong> বাটনে ক্লিক করতে পারেন।
                                    </p>
                                </div>
                            </div>

                            {/* Summary Cards with In-Place Edit Buttons */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                {/* 1. Location & Category */}
                                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-emerald-600" /> স্থান ও অবস্থান
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => jumpToStep(1)}
                                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs hover:border-emerald-300"
                                        >
                                            <Edit3 className="w-3 h-3" /> পরিবর্তন
                                        </button>
                                    </div>
                                    <p className="font-bold text-slate-900 text-sm">
                                        {selectedDivision?.name_bn} বিভাগ → {selectedDistrict?.name_bn} জেলা
                                    </p>
                                    <p className="text-slate-500">
                                        উপজেলা: {selectedUpazila ? selectedUpazila.name_bn : 'সদর / নির্ধারিত নেই'}
                                    </p>
                                </div>

                                {/* 2. Service / Category */}
                                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                            <Building2 className="w-3.5 h-3.5 text-emerald-600" /> সেবা বা দপ্তর
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => jumpToStep(2)}
                                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs hover:border-emerald-300"
                                        >
                                            <Edit3 className="w-3 h-3" /> পরিবর্তন
                                        </button>
                                    </div>
                                    <p className="font-bold text-slate-900 text-sm">{selectedCategory?.name_bn}</p>
                                    <p className="text-slate-500 font-mono text-[11px]">{selectedCategory?.name_en}</p>
                                </div>

                                {/* 3. Office & Branch */}
                                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                            <Landmark className="w-3.5 h-3.5 text-emerald-600" /> অফিস ও শাখা
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => jumpToStep(3)}
                                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs hover:border-emerald-300"
                                        >
                                            <Edit3 className="w-3 h-3" /> পরিবর্তন
                                        </button>
                                    </div>
                                    <p className="font-bold text-slate-900 text-sm">{selectedOffice?.name_bn}</p>
                                    <p className="text-slate-600 flex items-center gap-1">
                                        <GitBranch className="w-3 h-3 text-indigo-600" />
                                        শাখা: {selectedBranch ? `${selectedBranch.name_bn} (রুম: ${selectedBranch.room_number || '—'})` : 'সাধারণ দপ্তর / শাখা নির্দিষ্ট নেই'}
                                    </p>
                                </div>

                                {/* 4. Person / Accused */}
                                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> অভিযোগকৃত ব্যক্তি
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => jumpToStep(5)}
                                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs hover:border-emerald-300"
                                        >
                                            <Edit3 className="w-3 h-3" /> পরিবর্তন
                                        </button>
                                    </div>
                                    {data.is_person_unknown ? (
                                        <p className="font-bold text-amber-700">ব্যক্তির নাম অজ্ঞাত (দপ্তর প্রধানের দৃষ্টিগোচর হবে)</p>
                                    ) : data.accused_person_name ? (
                                        <div>
                                            <p className="font-bold text-slate-900">{data.accused_person_name}</p>
                                            <p className="text-slate-500">পরিচিত নাম / ডাকনাম</p>
                                        </div>
                                    ) : selectedOfficer ? (
                                        <div>
                                            <p className="font-bold text-slate-900">{selectedOfficer.name_bn}</p>
                                            <p className="text-slate-500">{selectedOfficer.designation_bn}</p>
                                        </div>
                                    ) : (
                                        <p className="text-slate-500">নির্দিষ্ট কোনো ব্যক্তি চিহ্নিত করা হয়নি</p>
                                    )}
                                </div>

                                {/* 5. Selected Problems (Full Width) */}
                                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 sm:col-span-2 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5 text-emerald-600" /> চিহ্নিত সমস্যা ও দাবিসমূহ
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => jumpToStep(6)}
                                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs hover:border-emerald-300"
                                        >
                                            <Edit3 className="w-3 h-3" /> পরিবর্তন
                                        </button>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {data.selected_problems.map((probId) => {
                                            // Find problem title
                                            let title = `সমস্যা #${probId}`;
                                            Object.values(problemTypesGrouped).forEach(list => {
                                                if (Array.isArray(list)) {
                                                    const found = list.find(p => p.id === probId);
                                                    if (found) title = found.title_bn;
                                                }
                                            });
                                            return (
                                                <span key={probId} className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white text-slate-800 font-bold border border-slate-200 shadow-2xs text-xs">
                                                    <Check className="w-3 h-3 text-emerald-600" />
                                                    {title}
                                                </span>
                                            );
                                        })}
                                        {data.other_problem_description && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-950 font-bold border border-emerald-300 shadow-2xs text-xs">
                                                <Check className="w-3 h-3 text-emerald-600" />
                                                অন্যান্য: {data.other_problem_description}
                                            </span>
                                        )}
                                        {data.selected_problems.length === 0 && !data.other_problem_description && (
                                            <span className="text-slate-400">কোনো নির্দিষ্ট সমস্যা টিক দেওয়া হয়নি</span>
                                        )}
                                    </div>
                                </div>

                                {/* 6. Photos & Evidence Preview Card (Full Width) */}
                                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 sm:col-span-2 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                            <Camera className="w-3.5 h-3.5 text-emerald-600" /> সংযুক্ত প্রমাণাদি ({data.camera_photos.length + data.attachments.length} টি)
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => jumpToStep(8)}
                                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs hover:border-emerald-300"
                                        >
                                            <Edit3 className="w-3 h-3" /> প্রমাণ যোগ/মুছুন
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 pt-1">
                                        {data.camera_photos.length > 0 && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                                                <Camera className="w-3.5 h-3.5" /> {data.camera_photos.length} টি লাইভ ক্যামেরা ছবি (অগ্রাধিকারপ্রাপ্ত)
                                            </span>
                                        )}
                                        {data.attachments.length > 0 && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs">
                                                <UploadCloud className="w-3.5 h-3.5" /> {data.attachments.length} টি গ্যালারি ফাইল/ভিডিও
                                            </span>
                                        )}
                                        {data.camera_photos.length === 0 && data.attachments.length === 0 && (
                                            <span className="text-slate-400 text-xs">কোনো ছবি বা প্রমাণ সংযুক্ত করা হয়নি (ঐচ্ছিক)</span>
                                        )}
                                    </div>
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
                                        সুরক্ষিত ও নিরাপদ
                                    </span>
                                </div>

                                <p className="text-xs text-emerald-900/80 leading-relaxed">
                                    আপনার নাম ও মোবাইল নম্বর সাধারণের নিকট সম্পূর্ণ গোপন থাকবে। কেবল অভিযোগের অগ্রগতি সম্পর্কে আপনাকে এসএমএস বা নোটিফিকেশন পাঠাতে এটি প্রয়োজন।
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
                                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400 font-medium"
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
                                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400 font-medium"
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
                                        সম্পূর্ণ বেনামে অভিযোগ করতে চাই (বেনামী অভিযোগে আপনার নাম প্রকাশ পাবে না)
                                    </span>
                                </label>

                                {/* Final Review Confirmation Guard */}
                                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 shadow-2xs">
                                    <label className="flex items-start gap-3 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={reviewConfirmed}
                                            onChange={(e) => setReviewConfirmed(e.target.checked)}
                                            className="mt-0.5 w-5 h-5 rounded border-emerald-400 text-emerald-700 focus:ring-emerald-500 cursor-pointer"
                                        />
                                        <div>
                                            <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                                                আমি নিশ্চিত করছি যে উপরের সকল বিবরণ ও প্রমাণাদি যাচাই করেছি এবং তা সঠিক
                                            </span>
                                            <span className="text-[11px] text-slate-600 block mt-0.5">
                                                রিভিউ শেষ করে চূড়ান্তভাবে অভিযোগ দাখিল করতে টিক দিন (অনিচ্ছাকৃত সাবমিট প্রতিরোধে এটি বাধ্যতামূলক)
                                            </span>
                                        </div>
                                    </label>
                                </div>

                                {/* Validation Errors Feedback */}
                                {Object.keys(errors).length > 0 && (
                                    <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs space-y-2 animate-shake">
                                        <div className="font-bold flex items-center gap-2 text-rose-900 text-sm">
                                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                            <span>দাখিলের সময় ত্রুটি পরিলক্ষিত হয়েছে:</span>
                                        </div>
                                        <ul className="list-disc list-inside space-y-1 font-medium text-rose-700">
                                            {Object.entries(errors).map(([field, msg]) => (
                                                <li key={field}>{msg}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
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

                        {editOriginStep === 9 && step !== 9 ? (
                            <button
                                type="button"
                                onClick={returnBackToReview}
                                className="inline-flex items-center gap-1.5 px-6 sm:px-8 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                            >
                                <span>✓ পরিবর্তন শেষ — রিভিউতে ফিরে যান</span>
                            </button>
                        ) : step < 9 ? (
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
                            <div className="flex flex-col items-end gap-1.5">
                                {progress && (
                                    <div className="w-48 sm:w-56 bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300 shadow-2xs">
                                        <div 
                                            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={processing || !reviewConfirmed || (!data.is_anonymous && (!data.complainant_name?.trim() || !data.complainant_phone?.trim()))}
                                    className={`inline-flex items-center gap-2 px-8 sm:px-10 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 ${
                                        reviewConfirmed && (data.is_anonymous || (data.complainant_name?.trim() && data.complainant_phone?.trim()))
                                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white ring-2 ring-emerald-500/20'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    {processing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>
                                                {progress ? `আপলোড হচ্ছে (${progress.percentage}%)...` : 'জমা হচ্ছে...'}
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            <span>অভিযোগ দাখিল করুন</span>
                                            <Check className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
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
