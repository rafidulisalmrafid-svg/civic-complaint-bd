import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { 
    Bot, 
    Send, 
    Sparkles, 
    CheckCircle2, 
    X, 
    ShieldCheck, 
    FileText, 
    Check, 
    Copy, 
    ArrowRight, 
    ArrowLeft,
    ChevronRight, 
    User, 
    Phone, 
    MapPin, 
    Building2, 
    Calendar, 
    AlertCircle, 
    Edit3, 
    HeartHandshake, 
    Stethoscope, 
    LandPlot, 
    Trash2, 
    Zap, 
    Scale, 
    ShieldAlert, 
    Trees, 
    Car, 
    FileCheck2, 
    HelpCircle,
    Camera,
    UploadCloud,
    Paperclip,
    Link2,
    Clock,
    Mic,
    Video,
    RotateCcw,
    Folder,
    ExternalLink,
    Plus,
    Eye,
    RefreshCw,
    Upload,
    Music,
    Film,
    Image as ImageIcon
} from 'lucide-react';
import VoiceComplaintAssistant from '@/Components/VoiceComplaintAssistant';

export default function AiComplaintAssistantModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    // Interaction Mode: 'voice' (ভয়েস ভিত্তিক প্রশ্নোত্তর সহকারী) or 'wizard' (লিখিত উইজার্ড ফর্ম)
    const [interactionMode, setInteractionMode] = useState('voice');

    // Multilingual State: 'bn' (বাংলা) or 'en' (English)
    const [lang, setLang] = useState('bn');

    // Mascot Expression: 'welcoming' | 'asking' | 'thinking' | 'drafting' | 'success'
    const [mascotState, setMascotState] = useState('welcoming');

    // Active Wizard Step:
    // 1: প্রাথমিক বিষয় বা স্বাভাবিক ভাষায় সমস্যা শুরু
    // 2: ১. সংশ্লিষ্ট ব্যক্তি বা কর্মকর্তা শনাক্তকরণ (Suggested Officers & Posts)
    // 3: ২. ঘটনার স্থান ও সময় নির্ধারণ (Conversational guided chips & inputs)
    // 4: ৩. কী ঘটেছে এবং কীভাবে সমস্যার সৃষ্টি হয়েছে? (Root cause scenarios -> AI auto-synthesizes narrative)
    // 5: ৪. প্রত্যাশিত প্রতিকার ও প্রমাণ সংগ্রহ (Remedy + Evidence upload/declaration + missing evidence transparency)
    // 6: চূড়ান্ত আনুষ্ঠানিক অভিযোগপত্র প্রিভিউ ও সম্মতি (Formal Letter & Consent)
    // 7: সফল নিবন্ধন ও ডিজিটাল রসিদ (Tracking ID & Receipt)
    const [currentStep, setCurrentStep] = useState(1);

    // Initial Database Data
    const [dbData, setDbData] = useState({
        categories: [],
        offices: [],
        officers: [],
        posts: [],
        districts: [],
        divisions: []
    });
    const [isLoadingDb, setIsLoadingDb] = useState(true);

    // Conversational Chat Messages
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    const toggleVoiceListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('আপনার ব্রাউজারে ভয়েস ইনপুট সমর্থিত নয়। অনুগ্রহ করে গুগল ক্রোম বা মাইক্রোসফট এজ ব্যবহার করুন।');
            return;
        }

        if (isListening) {
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsListening(false);
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setUserInput((prev) => (prev ? prev + ' ' + transcript : transcript));
            };
            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);

            recognitionRef.current = recognition;
            recognition.start();
        } catch (e) {
            console.error('Speech recognition error:', e);
            setIsListening(false);
        }
    };

    // AI suggestions retrieved dynamically from NLP analyze
    const [aiSuggestions, setAiSuggestions] = useState({
        candidateOfficers: [],
        suggestedPlaces: [],
        suggestedTimeChips: [],
        suggestedScenarios: [],
        suggestedRemedies: []
    });

    // Complaint Structured State
    const [complaintData, setComplaintData] = useState({
        categoryId: 1,
        categoryName: 'স্বাস্থ্য ও চিকিৎসা সেবা',
        categoryCode: 'HEALTH',
        divisionId: 5, // Default Barishal
        districtId: 43, // Default Barishal
        districtName: 'বরিশাল',
        officeId: null,
        officeName: 'সিভিল সার্জন কার্যালয়, বরিশাল',
        // ১. সংশ্লিষ্ট ব্যক্তি বা কর্মকর্তা
        officerId: null,
        officerName: '',
        officerDesignation: '',
        isPersonUnknown: false,
        customOfficerInput: '',
        // ২. ঘটনার স্থান ও সময়
        incidentLocation: 'বরিশাল সদর রোড',
        incidentSpotDetails: '',
        incidentTime: 'গত ২-৩ দিন যাবৎ',
        customIncidentDate: '',
        // ৩. কী ঘটেছে ও কীভাবে সমস্যার সৃষ্টি হয়েছে
        selectedScenarios: [],
        customScenarioNote: '',
        synthesizedDescription: '',
        // ৪. প্রত্যাশিত প্রতিকার ও প্রমাণ
        remedyRequested: 'সরেজমিন পরিদর্শনপূর্বক ঘটনার সুষ্ঠু তদন্ত এবং অবহেলাকারী চিকিৎসকের বিরুদ্ধে বিভাগীয় ব্যবস্থা গ্রহণ',
        evidenceType: 'none', // 'photo' | 'audio' | 'video' | 'doc' | 'link' | 'none'
        evidenceFiles: [],
        evidenceWebLink: '',
        evidenceDescription: '',
        isAnonymous: false,
        complainantName: '',
        complainantPhone: '',
        // চূড়ান্ত পত্র ও সম্মতি
        formalLetter: '',
        title: 'নাগরিক সেবা প্রাপ্তিতে ভোগান্তি নিরসনে প্রতিকার প্রার্থনা',
        userConsent: true,
    });

    const [submissionReceipt, setSubmissionReceipt] = useState(null);
    const [copiedReceipt, setCopiedReceipt] = useState(false);
    const [previewTab, setPreviewTab] = useState('letter'); // 'letter' or 'details'
    const chatEndRef = useRef(null);

    // =========================================================================
    // AI-চালিত প্রমাণ সংগ্রহ ও ডকুমেন্ট আপলোড সিস্টেম State & Helpers
    // =========================================================================
    // নির্বাচিত অপশন: 'photo' | 'video' | 'audio' | 'doc' | 'link' | 'other'
    const [activeEvidenceTab, setActiveEvidenceTab] = useState('photo');
    // আপলোডকৃত প্রমাণের তালিকা: { id, type, file, name, category, categoryLabel, emoji, size, sizeBytes, previewUrl, url, title, uploadedAt }
    const [evidenceItems, setEvidenceItems] = useState([]);
    const [linkUrlInput, setLinkUrlInput] = useState('');
    const [linkTitleInput, setLinkTitleInput] = useState('');
    const [replacingItemId, setReplacingItemId] = useState(null);
    const fileInputRef = useRef(null);
    const replaceInputRef = useRef(null);

    // প্রমাণের ক্যাটাগরি কনফিগ
    const EVIDENCE_CATEGORIES = [
        { id: 'photo', nameBn: 'ছবি (Photo)', emoji: '📷', accept: 'image/*', hint: 'JPG, PNG, WebP সমর্থিত', color: 'rose' },
        { id: 'video', nameBn: 'ভিডিও (Video)', emoji: '🎥', accept: 'video/*', hint: 'MP4, MOV, MKV সমর্থিত', color: 'indigo' },
        { id: 'audio', nameBn: 'অডিও রেকর্ডিং (Audio)', emoji: '🎙️', accept: 'audio/*', hint: 'MP3, WAV, M4A, OGG সমর্থিত', color: 'amber' },
        { id: 'doc', nameBn: 'ডকুমেন্ট (PDF, Word ও অন্যান্য)', emoji: '📄', accept: '.pdf,.doc,.docx,.txt,.xls,.xlsx', hint: 'PDF, DOC, DOCX, TXT সমর্থিত', color: 'blue' },
        { id: 'link', nameBn: 'লিংক (URL)', emoji: '🔗', accept: null, hint: 'সংবাদ, সোশ্যাল বা ক্লাউড ড্রাইভ লিংক', color: 'teal' },
        { id: 'other', nameBn: 'অন্যান্য প্রমাণ (Other Files)', emoji: '📁', accept: '*/*', hint: 'যেকোনো প্রাসঙ্গিক ফাইল বা আর্কাইভ', color: 'slate' },
    ];

    // AI স্বয়ংক্রিয় ফাইল ক্যাটাগরি ও টাইপ সনাক্তকরণ (Automatic Detection)
    const detectFileCategory = (file) => {
        const mime = (file.type || '').toLowerCase();
        const name = (file.name || '').toLowerCase();

        if (mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(name)) {
            return { category: 'photo', label: 'ছবি (Photo)', emoji: '📷', isImage: true };
        }
        if (mime.startsWith('video/') || /\.(mp4|mov|mkv|avi|webm|3gp|wmv)$/i.test(name)) {
            return { category: 'video', label: 'ভিডিও (Video)', emoji: '🎥', isVideo: true };
        }
        if (mime.startsWith('audio/') || /\.(mp3|wav|m4a|ogg|aac|flac|wma)$/i.test(name)) {
            return { category: 'audio', label: 'অডিও রেকর্ডিং (Audio)', emoji: '🎙️', isAudio: true };
        }
        if (mime.includes('pdf') || mime.includes('word') || mime.includes('document') || mime.includes('text') || mime.includes('sheet') || mime.includes('excel') || /\.(pdf|doc|docx|txt|xls|xlsx|ppt|pptx)$/i.test(name)) {
            return { category: 'doc', label: 'ডকুমেন্ট (Document)', emoji: '📄', isDoc: true };
        }
        return { category: 'other', label: 'অন্যান্য প্রমাণ (Other Files)', emoji: '📁', isOther: true };
    };

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '০ KB';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFilesSelected = (fileList) => {
        if (!fileList || fileList.length === 0) return;
        
        const newItems = Array.from(fileList).map((file) => {
            const detection = detectFileCategory(file);
            let previewUrl = null;
            if (detection.isImage) {
                try {
                    previewUrl = URL.createObjectURL(file);
                } catch (e) {
                    previewUrl = null;
                }
            }

            return {
                id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                type: 'file',
                file,
                name: file.name,
                category: detection.category,
                categoryLabel: detection.label,
                emoji: detection.emoji,
                size: formatFileSize(file.size),
                sizeBytes: file.size,
                previewUrl,
                uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                verification: null,
            };
        });

        setEvidenceItems((prev) => [...prev, ...newItems]);

        // Asynchronously run AI Document Verification Pipeline
        Array.from(fileList).forEach((file) => {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('complainant_name', complaintData.complainantName || '');
            formData.append('office_name', complaintData.officeName || '');

            fetch('/api/ai/verify-document', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.report) {
                    setEvidenceItems((prev) =>
                        prev.map((it) => it.file === file ? { ...it, verification: data.report } : it)
                    );
                }
            })
            .catch(err => console.error('Doc verification check error:', err));
        });
    };

    const handleAddLink = (e) => {
        if (e) e.preventDefault();
        const url = linkUrlInput.trim();
        if (!url) return;

        let formattedUrl = url;
        if (!/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = 'https://' + formattedUrl;
        }

        const title = linkTitleInput.trim() || 'অনলাইন ওয়েব লিংক';
        const newItem = {
            id: 'link_' + Date.now(),
            type: 'link',
            name: title,
            url: formattedUrl,
            category: 'link',
            categoryLabel: 'লিংক (URL)',
            emoji: '🔗',
            size: 'অনলাইন রিসোর্স',
            sizeBytes: formattedUrl.length,
            uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setEvidenceItems((prev) => [...prev, newItem]);
        setLinkUrlInput('');
        setLinkTitleInput('');
    };

    const handleRemoveEvidenceItem = (id) => {
        setEvidenceItems((prev) => {
            const item = prev.find((it) => it.id === id);
            if (item && item.previewUrl) {
                try { URL.revokeObjectURL(item.previewUrl); } catch (e) {}
            }
            return prev.filter((it) => it.id !== id);
        });
    };

    const handleTriggerReplace = (item) => {
        setReplacingItemId(item.id);
        if (item.type === 'link') {
            setActiveEvidenceTab('link');
            setLinkUrlInput(item.url || '');
            setLinkTitleInput(item.name || '');
            handleRemoveEvidenceItem(item.id);
        } else {
            replaceInputRef.current?.click();
        }
    };

    const handleReplaceFileSelected = (e) => {
        const file = e.target.files?.[0];
        if (!file || !replacingItemId) return;

        const detection = detectFileCategory(file);
        let previewUrl = null;
        if (detection.isImage) {
            try { previewUrl = URL.createObjectURL(file); } catch (err) {}
        }

        setEvidenceItems((prev) =>
            prev.map((item) => {
                if (item.id === replacingItemId) {
                    if (item.previewUrl) {
                        try { URL.revokeObjectURL(item.previewUrl); } catch (err) {}
                    }
                    return {
                        ...item,
                        file,
                        name: file.name,
                        category: detection.category,
                        categoryLabel: detection.label,
                        emoji: detection.emoji,
                        size: formatFileSize(file.size),
                        sizeBytes: file.size,
                        previewUrl,
                        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                }
                return item;
            })
        );

        setReplacingItemId(null);
        e.target.value = '';
    };

    // Load Live Admin Controlled Data from Server
    useEffect(() => {
        setIsLoadingDb(true);
        fetch('/api/ai/initial-data')
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setDbData(data);
                }
            })
            .catch((err) => console.error('Error loading AI database data:', err))
            .finally(() => setIsLoadingDb(false));
    }, []);

    // Initial Greeting when modal opens
    useEffect(() => {
        const welcomeText = lang === 'bn' 
            ? 'সালাম ও শুভেচ্ছা! আমি আপনার AI অভিযোগ সহকারী "নাগরিক বন্ধু"।\n\nআপনাকে কোনো দীর্ঘ বা জটিল দরখাস্ত লিখতে হবে না। আপনি শুধু আপনার সমস্যাটি নিচের বাটনে চাপ দিয়ে বা সংক্ষেপে লিখুন। আমি কথোপকথনের মাধ্যমে সংশ্লিষ্ট কর্মকর্তা শনাক্তকরণ, স্থান-সময় নির্ধারণ, ঘটনার বিবরণ সাজানো ও আনুষ্ঠানিক অভিযোগপত্র তৈরি করে দেব।'
            : 'Greetings! I am your AI Civic Assistant. You don\'t need to write long petitions. Simply describe your issue or select a sector. I will conversationally identify responsible officials, incident details, and draft an official complaint letter.';

        setMessages([
            {
                id: 1,
                sender: 'ai',
                text: welcomeText,
                step: 1,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
        setMascotState('welcoming');
    }, [lang]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isAnalyzing, currentStep]);

    // Icon mapping for categories
    const getCategoryIcon = (id) => {
        switch (id) {
            case 1: return <Stethoscope className="w-4 h-4 text-rose-600" />;
            case 2: return <LandPlot className="w-4 h-4 text-amber-600" />;
            case 3: return <Building2 className="w-4 h-4 text-emerald-600" />;
            case 4: return <Zap className="w-4 h-4 text-yellow-600" />;
            case 5: return <ShieldAlert className="w-4 h-4 text-purple-600" />;
            case 6: return <Scale className="w-4 h-4 text-red-600" />;
            case 7: return <Trees className="w-4 h-4 text-teal-600" />;
            case 8: return <Car className="w-4 h-4 text-blue-600" />;
            default: return <FileText className="w-4 h-4 text-slate-600" />;
        }
    };

    // Helper: Analyze freeform text or selected category
    const runAnalysis = async (queryText, fallbackCat = null) => {
        setIsAnalyzing(true);
        setMascotState('thinking');

        try {
            const response = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ 
                    text: queryText || fallbackCat?.name_bn || 'নাগরিক সেবা অভিযোগ', 
                    lang 
                })
            });

            const data = await response.json();

            if (data.success) {
                setAiSuggestions({
                    candidateOfficers: data.candidate_officers || [],
                    suggestedPlaces: data.suggested_places || [],
                    suggestedTimeChips: data.suggested_time_chips || [],
                    suggestedScenarios: data.suggested_scenarios || [],
                    suggestedRemedies: data.suggested_remedies || []
                });

                setComplaintData((prev) => ({
                    ...prev,
                    categoryId: data.category_id,
                    categoryName: data.category_name_bn,
                    divisionId: data.division_id,
                    districtId: data.district_id,
                    districtName: data.district_name_bn || prev.districtName,
                    officeId: data.office_id,
                    officeName: data.office_name_bn,
                    title: data.suggested_title,
                    incidentLocation: (data.suggested_places && data.suggested_places[0]) || prev.incidentLocation,
                    remedyRequested: (data.suggested_remedies && data.suggested_remedies[0]) || prev.remedyRequested,
                }));

                // Transition to Step 2: সংশ্লিষ্ট ব্যক্তি বা কর্মকর্তা শনাক্তকরণ
                setCurrentStep(2);
                setMascotState('asking');

                const replyText = lang === 'bn'
                    ? `আমি আপনার সমস্যাটি "${data.category_name_bn}" সংক্রান্ত হিসেবে চিহ্নিত করেছি এবং দায়িত্বশীল দপ্তর হিসেবে "${data.office_name_bn}" নির্ধারণ করেছি।\n\n📌 ধাপ ১: সংশ্লিষ্ট ব্যক্তি বা কর্মকর্তা শনাক্তকরণ:\nAI বিশ্লেষণের ভিত্তিতে সম্ভাব্য দায়িত্বপ্রাপ্ত কর্মকর্তা ও পদবির তালিকা তৈরি করা হয়েছে। অনুগ্রহ করে অভিযুক্ত বা সংশ্লিষ্ট ব্যক্তিকে নির্বাচন করুন:`
                    : `Understood! Your complaint is mapped to "${data.category_name_en}" under "${data.office_name_bn}".\n\nStep 1: Identification of Responsible Official:\nPlease select the specific official or designation:`;

                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now(),
                        sender: 'ai',
                        text: replyText,
                        step: 2,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                ]);
            }
        } catch (err) {
            console.error('Error analyzing input:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Step 1: Select Category Card
    const handleSelectCategory = (cat) => {
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                sender: 'user',
                text: `বিষয়: ${cat.name_bn}`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
        runAnalysis(cat.name_bn, cat);
    };

    // Step 2: Select Officer or Unknown (১. সংশ্লিষ্ট ব্যক্তি বা কর্মকর্তা শনাক্তকরণ)
    const handleSelectOfficer = (candidate) => {
        let isUnknown = false;
        let offName = '';
        let offDesig = '';
        let offId = null;

        if (candidate.type === 'unknown') {
            isUnknown = true;
            offName = 'নির্দিষ্ট ব্যক্তির নাম অজ্ঞাত';
            offDesig = 'দপ্তর প্রধান / তদন্ত কর্মকর্তা';
        } else {
            offId = candidate.type === 'verified_officer' ? candidate.id : null;
            offName = candidate.name_bn;
            offDesig = candidate.designation_bn;
        }

        setComplaintData((prev) => ({
            ...prev,
            officerId: offId,
            officerName: offName,
            officerDesignation: offDesig,
            isPersonUnknown: isUnknown,
        }));

        setCurrentStep(3);
        setMascotState('asking');

        const selectedText = isUnknown ? 'নির্দিষ্ট ব্যক্তি অজ্ঞাত (প্রতিষ্ঠানের বিরুদ্ধে)' : `${offName} (${offDesig})`;

        const promptText = lang === 'bn'
            ? `সংশ্লিষ্ট কর্মকর্তা হিসেবে সংরক্ষিত: "${selectedText}"।\n\n📍 ধাপ ২: ঘটনার স্থান ও সময় নির্ধারণ:\nআপনাকে বিস্তারিত লিখতে হবে না। নিচের সহজ অপশনগুলো থেকে ঘটনাটি কোথায় এবং কখন ঘটেছে তা বেছে নিন:`
            : `Officer identified: "${selectedText}".\n\nStep 2: Location & Incident Time:\nSelect where and when the incident took place:`;

        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                sender: 'user',
                text: `নির্বাচিত কর্মকর্তা/ব্যক্তি: ${selectedText}`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            {
                id: Date.now() + 1,
                sender: 'ai',
                text: promptText,
                step: 3,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
    };

    // Custom Officer Submit
    const handleCustomOfficerSubmit = (customText) => {
        if (!customText.trim()) return;

        setComplaintData((prev) => ({
            ...prev,
            officerId: null,
            officerName: customText.trim(),
            officerDesignation: 'উল্লেখিত কর্মকর্তা/কর্মচারী',
            isPersonUnknown: false,
        }));

        setCurrentStep(3);
        setMascotState('asking');

        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                sender: 'user',
                text: `সংশ্লিষ্ট কর্মকর্তা: ${customText.trim()}`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            {
                id: Date.now() + 1,
                sender: 'ai',
                text: `ধন্যবাদ! সংশ্লিষ্ট ব্যক্তি হিসেবে "${customText.trim()}" সংরক্ষিত হয়েছে। এবার ঘটনার স্থান ও সময় নির্বাচন করুন:`,
                step: 3,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
    };

    // Step 3 Submit: Location & Time Confirmation (২. ঘটনার বিবরণ ও স্থান নির্ধারণ)
    const handleLocationTimeSubmit = () => {
        const fullLocation = complaintData.incidentSpotDetails 
            ? `${complaintData.districtName}, ${complaintData.incidentLocation} (${complaintData.incidentSpotDetails})`
            : `${complaintData.districtName}, ${complaintData.incidentLocation}`;
        
        const fullTime = complaintData.customIncidentDate || complaintData.incidentTime;

        setCurrentStep(4);
        setMascotState('asking');

        const promptText = lang === 'bn'
            ? `স্থান: "${fullLocation}" এবং সময়: "${fullTime}" লিপিবদ্ধ হয়েছে।\n\n🔍 ধাপ ৩: কী ঘটেছে এবং কীভাবে সমস্যার সৃষ্টি হয়েছে?\nআপনাকে দীর্ঘ বিবরণ লিখতে হবে না। AI আপনার জন্য সম্ভাব্য সমস্যার বিবরণ সাজেস্ট করেছে। নিচের এক বা একাধিক মূল কারণ নির্বাচন করুন:`
            : `Recorded location: "${fullLocation}" and time: "${fullTime}".\n\nStep 3: What happened & root causes:\nSelect the key problem scenarios below:`;

        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                sender: 'user',
                text: `স্থান: ${fullLocation} | সময়: ${fullTime}`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            {
                id: Date.now() + 1,
                sender: 'ai',
                text: promptText,
                step: 4,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
    };

    // Step 4 Toggle Scenario
    const handleToggleScenario = (scenario) => {
        setComplaintData((prev) => {
            const exists = prev.selectedScenarios.includes(scenario);
            const updated = exists 
                ? prev.selectedScenarios.filter((s) => s !== scenario)
                : [...prev.selectedScenarios, scenario];
            return { ...prev, selectedScenarios: updated };
        });
    };

    // Step 4 Submit: AI Synthesizes Narrative (৩. কী ঘটেছে ও কীভাবে সমস্যার সৃষ্টি হয়েছে)
    const handleSynthesizeNarrative = () => {
        const scenarios = complaintData.selectedScenarios;
        const customNote = complaintData.customScenarioNote.trim();

        if (scenarios.length === 0 && !customNote) {
            alert('অনুগ্রহ করে অন্তত একটি সমস্যা নির্বাচন করুন অথবা সংক্ষেপে লিখুন।');
            return;
        }

        // AI Synthesizes a formal, coherent, legally sound Bengali narrative
        const scenarioText = scenarios.join('। এছাড়াও ');
        const officerSubject = complaintData.isPersonUnknown 
            ? 'সংশ্লিষ্ট দপ্তরের দায়িত্বপ্রাপ্ত কর্মকর্তা ও কর্মচারীদের'
            : `${complaintData.officerName} (${complaintData.officerDesignation})-এর`;

        let narrative = `গত ${complaintData.customIncidentDate || complaintData.incidentTime} হতে ${complaintData.districtName} জেলার ${complaintData.incidentLocation}-এ ${complaintData.officeName}-এর অধিক্ষেত্রে গুরুতর সমস্যা সৃষ্টি হয়েছে।\n`;
        
        if (scenarios.length > 0) {
            narrative += `সরেজমিনে প্রত্যক্ষ করা যায় যে, ${scenarioText}। `;
        }
        
        if (customNote) {
            narrative += `ভুক্তভোগী নাগরিকের সুনির্দিষ্ট বক্তব্য অনুযায়ী: "${customNote}"। `;
        }

        narrative += `উক্ত বিষয়ে ${officerSubject} চরম অবহেলা, দায়িত্বহীনতা ও অসৌজন্যমূলক আচরণের কারণে নিয়মিত সেবা ব্যাহত হচ্ছে এবং সাধারণ সেবাপ্রার্থীরা সীমাহীন হয়রানি ও ভোগান্তির শিকার হচ্ছেন।`;

        setComplaintData((prev) => ({
            ...prev,
            synthesizedDescription: narrative,
        }));

        setCurrentStep(5);
        setMascotState('asking');

        const promptText = lang === 'bn'
            ? `চমৎকার! আপনার নির্বাচিত তথ্যের ভিত্তিতে AI একটি পূর্ণাঙ্গ ও আনুষ্ঠানিক অভিযোগ বিবরণ সাজিয়েছে।\n\n⚖️ ধাপ ৪: প্রত্যাশিত প্রতিকার ও প্রমাণ সংগ্রহ:\n“আপনার অভিযোগের সমর্থনে কোনো প্রমাণ, ডকুমেন্ট বা লিংক আছে কি? থাকলে অনুগ্রহ করে আপলোড বা সংযুক্ত করুন।”\n\n(উল্লেখ্য: প্রমাণ আপলোড করা বাধ্যতামূলক নয়। কোনো প্রমাণ না থাকলেও আপনি অভিযোগ জমা দিতে পারবেন)`
            : `Great! The AI has synthesized a formal narrative from your selections.\n\nStep 4: Expected Remedy & Evidence Collection:\n"Do you have any supporting evidence, documents, or links? Please upload or attach if available."\n\n(Note: Evidence upload is optional. You can submit without any evidence.)`;

        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                sender: 'user',
                text: `চিহ্নিত সমস্যা: ${scenarios.length}টি ক্ষেত্র নির্বাচিত`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            {
                id: Date.now() + 1,
                sender: 'ai',
                text: promptText,
                step: 5,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
    };

    // Step 5 Submit: Remedy & Evidence Gathering (৪. প্রত্যাশিত প্রতিকার ও প্রমাণ সংগ্রহ)
    const handleRemedyAndEvidenceSubmit = async () => {
        setIsAnalyzing(true);
        setMascotState('thinking');

        // Compile Evidence Statement strictly from evidenceItems without hallucinating
        let evidenceListStr = '';
        if (evidenceItems.length === 0) {
            evidenceListStr = 'কোনো দালিলিক প্রমাণ বা ফুটেজ এই মুহূর্তে সংযুক্ত নেই (সরেজমিন পরিদর্শন, কর্মকর্তা অনুসন্ধান ও ভুক্তভোগীর প্রত্যক্ষ সাক্ষ্য সাপেক্ষ)';
        } else {
            evidenceListStr = evidenceItems.map((item, idx) => {
                if (item.type === 'link') {
                    return `(${idx + 1}) [${item.emoji} ${item.categoryLabel}] ${item.name}: ${item.url}`;
                }
                return `(${idx + 1}) [${item.emoji} ${item.categoryLabel}] ${item.name} (${item.size})`;
            }).join(', ');
        }

        try {
            // Call API to format standard Bangladeshi Government Formal Complaint Letter
            const response = await fetch('/api/ai/generate-formal-letter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    office_name: complaintData.officeName,
                    officer_name: complaintData.isPersonUnknown ? '' : complaintData.officerName,
                    officer_designation: complaintData.isPersonUnknown ? '' : complaintData.officerDesignation,
                    is_person_unknown: complaintData.isPersonUnknown,
                    location: `${complaintData.districtName}, ${complaintData.incidentLocation}`,
                    incident_date: complaintData.customIncidentDate || complaintData.incidentTime,
                    title: `${complaintData.officeName} — নাগরিক ভোগান্তি ও সেবা বিঘ্ন নিরসন আবেদন`,
                    description: complaintData.synthesizedDescription,
                    remedy_requested: complaintData.remedyRequested,
                    evidence_list: evidenceListStr,
                    is_anonymous: complaintData.isAnonymous,
                    complainant_name: complaintData.complainantName,
                    complainant_phone: complaintData.complainantPhone,
                })
            });

            const data = await response.json();

            if (data.success) {
                setComplaintData((prev) => ({
                    ...prev,
                    formalLetter: data.formal_letter,
                    title: data.title,
                }));

                setCurrentStep(6);
                setMascotState('drafting');

                const evidenceSummaryText = evidenceItems.length > 0
                    ? `সংযুক্ত প্রমাণাদি: মোট ${evidenceItems.length}টি প্রমাণ (AI যাচাইকৃত) সংরক্ষিত হয়েছে।`
                    : 'প্রমাণাদি স্ট্যাটাস: কোনো প্রমাণ সংযুক্ত নেই (সরেজমিন পরিদর্শন সাপেক্ষ)।';

                const promptText = lang === 'bn'
                    ? `অসাধারণ! আপনার দেওয়া সকল তথ্য ও প্রমাণাদির ভিত্তিতে AI একটি যথাযথ, প্রশাসনিক ও দালিলিক "আনুষ্ঠানিক অভিযোগপত্র" তৈরি করেছে।\n\nচিঠিটি প্রিভিউ করে দেখুন। আপনার চূড়ান্ত সম্মতি পেলেই এটি সরাসরি সংশ্লিষ্ট কর্তৃপক্ষের টেবিলে দাখিল হবে:`
                    : `Done! AI has assembled the formal official complaint petition.\n\nPlease review below. Once you provide your consent, it will be submitted:`;

                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now(),
                        sender: 'user',
                        text: `প্রত্যাশিত প্রতিকার ও ${evidenceSummaryText}`,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    },
                    {
                        id: Date.now() + 1,
                        sender: 'ai',
                        text: promptText,
                        step: 6,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                ]);
            }
        } catch (err) {
            console.error('Error generating letter:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Step 6: Final Submit with Explicit User Consent (FormData with file attachments & links)
    const handleFinalOfficialSubmit = async () => {
        if (!complaintData.userConsent) {
            alert('অভিযোগ দাখিলের জন্য সম্মতির চেকবক্সে টিক দিন।');
            return;
        }

        setIsSubmitting(true);
        setMascotState('thinking');

        try {
            const formData = new FormData();
            formData.append('category_id', complaintData.categoryId || 1);
            formData.append('division_id', complaintData.divisionId || 5);
            formData.append('district_id', complaintData.districtId || 43);
            if (complaintData.officeId) formData.append('office_id', complaintData.officeId);
            if (complaintData.officerId) formData.append('specific_officer_id', complaintData.officerId);
            formData.append('title', complaintData.title || 'নাগরিক সেবা সংক্রান্ত আবেদন');
            formData.append('description', complaintData.synthesizedDescription);
            formData.append('priority', 'high');
            formData.append('is_anonymous', complaintData.isAnonymous ? '1' : '0');
            if (!complaintData.isAnonymous) {
                formData.append('complainant_name', complaintData.complainantName);
                formData.append('complainant_phone', complaintData.complainantPhone);
            }
            formData.append('formal_letter', complaintData.formalLetter);
            formData.append('remedy_requested', complaintData.remedyRequested);
            formData.append('user_consent', '1');

            // Attach all physical files
            evidenceItems
                .filter((item) => item.type === 'file' && item.file)
                .forEach((item) => {
                    formData.append('attachments[]', item.file);
                });

            // Attach links as structured JSON
            const linkItems = evidenceItems
                .filter((item) => item.type === 'link')
                .map((item) => ({
                    url: item.url,
                    title: item.name
                }));
            if (linkItems.length > 0) {
                formData.append('evidence_links', JSON.stringify(linkItems));
            }

            const response = await fetch('/api/ai/submit-complaint', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                setSubmissionReceipt(result.receipt);
                setCurrentStep(7);
                setMascotState('success');

                const successReply = lang === 'bn'
                    ? `অভিনন্দন! আপনার আনুষ্ঠানিক অভিযোগপত্রটি সফলভাবে সিস্টেমে নিবন্ধিত হয়েছে।\n\nআপনার ডিজিটাল ট্র্যাকিং আইডি: ${result.tracking_id}। এটি সংশ্লিষ্ট দপ্তর (${result.office_name})-এর অ্যাকশন কিউতে পাঠানো হয়েছে।`
                    : `Congratulations! Your formal complaint has been registered. Your official Tracking ID is ${result.tracking_id}.`;

                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        sender: 'ai',
                        text: successReply,
                        step: 7,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                ]);
            } else {
                alert(result.message || 'সাবমিশনে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
                setMascotState('drafting');
            }
        } catch (err) {
            console.error('Submission error:', err);
            alert('নেটওয়ার্ক সংযোগ ত্রুটি। আবার চেষ্টা করুন।');
            setMascotState('drafting');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Chat query submit (Natural language from bottom input)
    const handleChatQuerySubmit = (e) => {
        e.preventDefault();
        const text = userInput.trim();
        if (!text) return;

        setUserInput('');
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                sender: 'user',
                text: text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);

        // Intercept complaint tracking inquiries (e.g. CGR-2026-000123 এর অবস্থা কী?)
        const trackingMatch = text.match(/(CGR|COM|CT)[A-Z0-9\-_]+/i);
        const isTrackingQuery = trackingMatch || text.includes('অবস্থা') || text.includes('ট্র্যাক') || text.includes('স্ট্যাটাস');

        if (isTrackingQuery && (trackingMatch || currentStep === 1)) {
            setIsAnalyzing(true);
            setMascotState('thinking');
            fetch('/api/ai/track-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ query: text, tracking_id: trackingMatch ? trackingMatch[0] : text })
            })
            .then(res => res.json())
            .then(data => {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        sender: 'ai',
                        text: data.reply || data.message || 'অভিযোগের তথ্য পাওয়া যায়নি।',
                        step: currentStep,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                ]);
                setMascotState('welcoming');
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => setIsAnalyzing(false));
            return;
        }

        if (currentStep === 1) {
            runAnalysis(text);
        } else if (currentStep === 2) {
            handleCustomOfficerSubmit(text);
        } else if (currentStep === 3) {
            setComplaintData((p) => ({ ...p, incidentLocation: text }));
            handleLocationTimeSubmit();
        } else if (currentStep === 4) {
            setComplaintData((p) => ({ ...p, customScenarioNote: text }));
            handleSynthesizeNarrative();
        } else if (currentStep === 5) {
            setComplaintData((p) => ({ ...p, remedyRequested: text }));
            handleRemedyAndEvidenceSubmit();
        }
    };

    const copyTrackingId = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedReceipt(true);
        setTimeout(() => setCopiedReceipt(false), 2000);
    };

    // Restart process
    const handleRestart = () => {
        setCurrentStep(1);
        setMascotState('welcoming');
        setComplaintData({
            categoryId: 1,
            categoryName: 'স্বাস্থ্য ও চিকিৎসা সেবা',
            categoryCode: 'HEALTH',
            divisionId: 5,
            districtId: 43,
            districtName: 'বরিশাল',
            officeId: null,
            officeName: 'সিভিল সার্জন কার্যালয়, বরিশাল',
            officerId: null,
            officerName: '',
            officerDesignation: '',
            isPersonUnknown: false,
            customOfficerInput: '',
            incidentLocation: 'বরিশাল সদর রোড',
            incidentSpotDetails: '',
            incidentTime: 'গত ২-৩ দিন যাবৎ',
            customIncidentDate: '',
            selectedScenarios: [],
            customScenarioNote: '',
            synthesizedDescription: '',
            remedyRequested: 'সরেজমিন পরিদর্শনপূর্বক ঘটনার সুষ্ঠু তদন্ত এবং অবহেলাকারী চিকিৎসকের বিরুদ্ধে বিভাগীয় ব্যবস্থা গ্রহণ',
            evidenceType: 'none',
            evidenceFiles: [],
            evidenceWebLink: '',
            evidenceDescription: '',
            isAnonymous: false,
            complainantName: '',
            complainantPhone: '',
            formalLetter: '',
            title: 'নাগরিক সেবা প্রাপ্তিতে ভোগান্তি নিরসনে প্রতিকার প্রার্থনা',
            userConsent: true,
        });
        setSubmissionReceipt(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md animate-speech-pop">
            <div className="relative w-full max-w-5xl h-[95vh] sm:h-[90vh] bg-white rounded-3xl shadow-2xl border border-emerald-200/90 flex flex-col overflow-hidden">
                {interactionMode === 'voice' ? (
                    <VoiceComplaintAssistant
                        dbData={dbData}
                        complaintData={complaintData}
                        setComplaintData={setComplaintData}
                        evidenceItems={evidenceItems}
                        onSwitchToWizard={() => setInteractionMode('wizard')}
                        onClose={onClose}
                    />
                ) : (
                    <>
                        {/* 1. Top Bar */}
                        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between gap-3 border-b border-emerald-700/50 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
                                    <Bot className="w-5 h-5 text-emerald-300 animate-pulse" />
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping"></span>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
                                            {lang === 'bn' ? 'AI স্মার্ট অভিযোগ সহকারী' : 'AI Smart Complaint Assistant'}
                                        </h3>
                                        <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                                            নাগরিক বন্ধু • স্মার্ট নির্দেশিকা
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-emerald-200/80 hidden sm:block">
                                        {lang === 'bn' ? 'স্বাভাবিক কথোপকথন থেকে স্বয়ংক্রিয় কর্মকর্তা শনাক্তকরণ ও অভিযোগপত্র তৈরি' : 'Conversational official identification & automated complaint drafting'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Switch to Voice Mode */}
                                <button
                                    type="button"
                                    onClick={() => setInteractionMode('voice')}
                                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition"
                                    title="ভয়েস সহকারীর সাথে কথা বলুন"
                                >
                                    <Mic className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
                                    <span>ভয়েস মোড</span>
                                </button>

                                {/* Step Navigation Indicator */}
                                <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-xs font-mono">
                                    <span className="text-emerald-300 font-bold">ধাপ {currentStep}/৭</span>
                                </div>

                        {/* Multilingual Toggle */}
                        <div className="flex items-center bg-white/15 backdrop-blur-md rounded-xl p-0.5 border border-white/20 text-xs font-bold">
                            <button
                                type="button"
                                onClick={() => setLang('bn')}
                                className={`px-2.5 py-1 rounded-lg transition-all ${lang === 'bn' ? 'bg-white text-emerald-950 shadow-sm' : 'text-emerald-100 hover:text-white'}`}
                            >
                                বাং
                            </button>
                            <button
                                type="button"
                                onClick={() => setLang('en')}
                                className={`px-2.5 py-1 rounded-lg transition-all ${lang === 'en' ? 'bg-white text-emerald-950 shadow-sm' : 'text-emerald-100 hover:text-white'}`}
                            >
                                ENG
                            </button>
                        </div>

                        {/* Close Modal */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-xl hover:bg-white/20 text-emerald-100 hover:text-white transition-all ml-1"
                            title="বন্ধ করুন"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* 2. Step Progress Indicator */}
                <div className="bg-slate-50 border-b border-slate-200/90 px-4 py-2 hidden sm:flex items-center justify-between text-[11px] font-bold text-slate-500 overflow-x-auto gap-2">
                    <div className="flex items-center gap-1 shrink-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>১</span>
                        <span className={currentStep === 1 ? 'text-emerald-800 font-extrabold' : ''}>শুরু</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <div className="flex items-center gap-1 shrink-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>২</span>
                        <span className={currentStep === 2 ? 'text-emerald-800 font-extrabold' : ''}>কর্মকর্তা শনাক্তকরণ</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <div className="flex items-center gap-1 shrink-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>৩</span>
                        <span className={currentStep === 3 ? 'text-emerald-800 font-extrabold' : ''}>স্থান ও সময়</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <div className="flex items-center gap-1 shrink-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>৪</span>
                        <span className={currentStep === 4 ? 'text-emerald-800 font-extrabold' : ''}>কী ঘটেছে</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <div className="flex items-center gap-1 shrink-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 5 ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>৫</span>
                        <span className={currentStep === 5 ? 'text-emerald-800 font-extrabold' : ''}>প্রতিকার ও প্রমাণ</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <div className="flex items-center gap-1 shrink-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 6 ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>৬</span>
                        <span className={currentStep === 6 ? 'text-emerald-800 font-extrabold' : ''}>প্রিভিউ ও সম্মতি</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <div className="flex items-center gap-1 shrink-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 7 ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>৭</span>
                        <span className={currentStep === 7 ? 'text-emerald-800 font-extrabold' : ''}>রসিদ</span>
                    </div>
                </div>

                {/* 3. Main Split View: Left Animated Mascot Guide (35%), Right Dynamic Interactive Stage (65%) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden min-h-0">
                    
                    {/* Left Column: Animated Mascot with Emotional Context */}
                    <div className="hidden lg:flex lg:col-span-4 bg-gradient-to-b from-emerald-50/70 via-teal-50/50 to-white p-5 border-r border-emerald-100 flex-col items-center justify-between text-center select-none overflow-y-auto">
                        
                        {/* Live Mascot Status Card */}
                        <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-200 shadow-2xs">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                                </span>
                                <span className="text-xs font-extrabold text-slate-900">
                                    {mascotState === 'welcoming' && 'সহকারী প্রস্তুত'}
                                    {mascotState === 'asking' && 'প্রশ্নোত্তর ও তথ্য গ্রহণ'}
                                    {mascotState === 'thinking' && 'AI বিশ্লেষণ ও বিন্যাস'}
                                    {mascotState === 'drafting' && 'আনুষ্ঠানিক পত্র প্রস্তুত'}
                                    {mascotState === 'success' && 'দাখিল সম্পন্ন!'}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-tight">
                                {currentStep === 2 && 'কর্মকর্তা ও দায়িত্বশীল ব্যক্তির ডাটাবেস শনাক্তকরণ'}
                                {currentStep === 3 && 'স্থান ও সময় বিন্যাস — নিজে বিস্তারিত লিখতে হবে না'}
                                {currentStep === 4 && 'সমস্যার মূল কারণ থেকে AI স্বয়ংক্রিয় বিবরণ তৈরি করবে'}
                                {currentStep === 5 && 'প্রতিকার নির্ধারণ ও প্রমাণের স্বচ্ছ যাচাই'}
                                {currentStep >= 6 && 'আইনি ও সরকারি স্ট্যান্ডার্ডে প্রস্তুতকৃত অভিযোগপত্র'}
                            </p>
                        </div>

                        {/* Interactive Vector SVG Mascot */}
                        <div className="my-auto py-2">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none"></div>

                                <svg
                                    viewBox="0 0 240 240"
                                    className={`w-40 h-40 drop-shadow-xl mx-auto transition-transform duration-300 ${mascotState === 'success' ? 'animate-bounce' : 'animate-mascot-bob'}`}
                                    fill="none"
                                >
                                    <defs>
                                        <linearGradient id="aiMascotSkin" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#fed7aa" />
                                            <stop offset="100%" stopColor="#fbcfe8" />
                                        </linearGradient>
                                        <linearGradient id="aiMascotVest" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#047857" />
                                            <stop offset="100%" stopColor="#064e3b" />
                                        </linearGradient>
                                    </defs>

                                    {/* Base Shadow */}
                                    <ellipse cx="120" cy="225" rx="55" ry="10" fill="#064e3b" opacity="0.12" />

                                    {/* Torso & Shirt */}
                                    <path d="M90 155 L150 155 L160 215 L80 215 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                                    {/* Green Waistcoat */}
                                    <path d="M80 160 C80 160, 98 155, 110 168 L110 215 L74 215 Z" fill="url(#aiMascotVest)" />
                                    <path d="M160 160 C160 160, 142 155, 130 168 L130 215 L166 215 Z" fill="url(#aiMascotVest)" />
                                    {/* Gold Star Badge on Chest */}
                                    <circle cx="95" cy="180" r="7" fill="#fbbf24" stroke="#fef08a" strokeWidth="1" />

                                    {/* Neck */}
                                    <rect x="108" y="140" width="24" height="18" rx="4" fill="url(#aiMascotSkin)" />

                                    {/* Left Hand Holding Digital Dossier */}
                                    <g className={mascotState === 'drafting' ? 'animate-bounce' : 'animate-mascot-tablet'}>
                                        <path d="M150 162 C168 172, 176 182, 172 200" stroke="#047857" strokeWidth="14" strokeLinecap="round" />
                                        <rect x="156" y="172" width="48" height="56" rx="6" fill="#1e293b" />
                                        <rect x="160" y="176" width="40" height="48" rx="4" fill="#ecfdf5" />
                                        <rect x="164" y="182" width="22" height="3" rx="1.5" fill="#059669" />
                                        <rect x="164" y="188" width="32" height="2.5" rx="1" fill="#64748b" />
                                        <rect x="164" y="193" width="26" height="2.5" rx="1" fill="#94a3b8" />
                                        <rect x="164" y="198" width="20" height="2.5" rx="1" fill="#94a3b8" />
                                        <circle cx="188" cy="212" r="6" fill="#10b981" />
                                        <path d="M185 212 L187.5 214.5 L191 210" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </g>

                                    {/* Right Hand Waving */}
                                    <g className="animate-mascot-wave">
                                        <path d="M82 165 C66 155, 52 130, 58 110" stroke="#047857" strokeWidth="14" strokeLinecap="round" />
                                        <path d="M58 110 L54 90" stroke="#047857" strokeWidth="12" strokeLinecap="round" />
                                        <circle cx="44" cy="74" r="11" fill="url(#aiMascotSkin)" />
                                    </g>

                                    {/* Head & Face */}
                                    <ellipse cx="120" cy="105" rx="42" ry="44" fill="url(#aiMascotSkin)" />
                                    <circle cx="78" cy="106" r="8" fill="url(#aiMascotSkin)" />
                                    <circle cx="162" cy="106" r="8" fill="url(#aiMascotSkin)" />

                                    {/* Hair */}
                                    <path d="M78 100 C74 72, 94 48, 120 48 C146 48, 166 72, 162 100 C152 88, 144 88, 134 92 C124 85, 106 84, 98 92 C88 88, 82 92, 78 100 Z" fill="#0f172a" />

                                    {/* Blinking Eyes */}
                                    <g className="animate-mascot-blink">
                                        <ellipse cx="104" cy="102" rx="6.5" ry="8" fill="#0f172a" />
                                        <circle cx="102" cy="99" r="2.5" fill="#ffffff" />
                                        <ellipse cx="136" cy="102" rx="6.5" ry="8" fill="#0f172a" />
                                        <circle cx="134" cy="99" r="2.5" fill="#ffffff" />
                                    </g>

                                    {/* Cheeks */}
                                    <circle cx="95" cy="112" r="5.5" fill="#f43f5e" opacity="0.3" />
                                    <circle cx="145" cy="112" r="5.5" fill="#f43f5e" opacity="0.3" />

                                    {/* Smiling Mouth */}
                                    <path d="M112 118 Q120 128 128 118" stroke="#881337" strokeWidth="2.2" strokeLinecap="round" fill="#881337" />

                                    {/* Headset & Mic */}
                                    <path d="M78 102 C76 65, 164 65, 162 102" stroke="#334155" strokeWidth="4" strokeLinecap="round" fill="none" />
                                    <path d="M164 108 Q160 128 136 125" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                                    <circle cx="135" cy="125" r="3" fill="#0891b2" />
                                </svg>
                            </div>
                        </div>

                        {/* Transparency Policy Disclaimer */}
                        <div className="w-full bg-emerald-100/60 rounded-2xl p-3 border border-emerald-300/60 text-[11px] text-emerald-900 font-medium">
                            <div className="flex items-center justify-center gap-1.5 font-bold mb-1">
                                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                                <span>স্বচ্ছতা ও তথ্য সুরক্ষার অঙ্গীকার</span>
                            </div>
                            <p className="text-[10px] text-emerald-800/80">
                                AI মনগড়া কোনো প্রমাণ বা তথ্য বানায় না। প্রমাণ অনুপস্থিত থাকলে তা চিঠিতে স্পষ্টভাবে উল্লেখ করা হয়।
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Dynamic Conversational Stream & Interactive Step Cards */}
                    <div className="col-span-1 lg:col-span-8 flex flex-col h-full bg-slate-50/50 overflow-hidden">
                        
                        {/* Messages / Interaction Container */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                            
                            {/* Dialogue Messages Stream */}
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-start gap-2.5 max-w-[95%] sm:max-w-[90%]">
                                        {msg.sender === 'ai' && (
                                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                                                <Bot className="w-4 h-4" />
                                            </div>
                                        )}

                                        <div>
                                            <div className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs whitespace-pre-line ${
                                                msg.sender === 'user'
                                                    ? 'bg-emerald-800 text-white rounded-tr-xs font-medium'
                                                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                                            }`}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[10px] text-slate-400 mt-1 block">
                                                {msg.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* ======================================================== */}
                            {/* STEP 1: শুরুর বিষয় নির্বাচন বা এক ক্লিকে টপিক পছন্দ */}
                            {/* ======================================================== */}
                            {currentStep === 1 && (
                                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 animate-speech-pop">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                        <span className="text-xs font-bold text-slate-700">
                                            {lang === 'bn' ? 'অভিযোগের সেবা খাত পছন্দ করুন (অথবা নিচে সরাসরি লিখুন):' : 'Select Sector:'}
                                        </span>
                                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                            AI স্মার্ট গাইড
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {dbData.categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => handleSelectCategory(cat)}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all group active:scale-95"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-emerald-300">
                                                    {getCategoryIcon(cat.id)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 truncate">
                                                        {cat.name_bn}
                                                    </h5>
                                                    <span className="text-[10px] text-slate-400 truncate block">
                                                        {cat.problem_types?.length || 5}টি সুনির্দিষ্ট ক্ষেত্র
                                                    </span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 shrink-0" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ======================================================== */}
                            {/* STEP 2: ১. সংশ্লিষ্ট ব্যক্তি বা কর্মকর্তা শনাক্তকরণ */}
                            {/* ======================================================== */}
                            {currentStep === 2 && (
                                <div className="bg-white rounded-2xl p-4 border-2 border-emerald-300 shadow-md space-y-3 animate-speech-pop">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                        <div className="flex items-center gap-1.5">
                                            <User className="w-4 h-4 text-emerald-700" />
                                            <span className="text-xs font-extrabold text-slate-900">
                                                ১. সংশ্লিষ্ট ব্যক্তি বা কর্মকর্তা নির্বাচন করুন:
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(1)}
                                            className="text-[11px] text-slate-500 hover:text-emerald-800 font-bold flex items-center gap-1"
                                        >
                                            <ArrowLeft className="w-3 h-3" />
                                            পূর্বে ফিরুন
                                        </button>
                                    </div>

                                    <p className="text-[11px] text-slate-600 leading-snug">
                                        AI বিশ্লেষণের ভিত্তিতে <strong>{complaintData.officeName}</strong>-এর সংশ্লিষ্ট কর্মকর্তা ও দায়িত্বপ্রাপ্ত পদবির তালিকা নিচে সাজেস্ট করা হলো। সঠিক ব্যক্তি বা পদবি নির্বাচন করুন:
                                    </p>

                                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                                        {aiSuggestions.candidateOfficers.map((candidate, idx) => (
                                            <button
                                                key={candidate.id || idx}
                                                type="button"
                                                onClick={() => handleSelectOfficer(candidate)}
                                                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all active:scale-95 group ${
                                                    candidate.type === 'unknown'
                                                        ? 'bg-slate-50 hover:bg-amber-50 border-slate-200 hover:border-amber-300'
                                                        : 'bg-slate-50 hover:bg-emerald-50 border-slate-200 hover:border-emerald-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                        candidate.type === 'unknown' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                                    }`}>
                                                        {candidate.type === 'unknown' ? <HelpCircle className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <h5 className="text-xs font-bold text-slate-900 group-hover:text-emerald-950">
                                                            {candidate.name_bn}
                                                        </h5>
                                                        <span className="text-[10px] text-slate-500 block">
                                                            পদবি: {candidate.designation_bn}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                                    candidate.type === 'verified_officer'
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                        : candidate.type === 'unknown'
                                                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                        : 'bg-teal-100 text-teal-800 border border-teal-200'
                                                }`}>
                                                    {candidate.badge}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom Officer Name Input Option */}
                                    <div className="pt-2 border-t border-slate-100">
                                        <span className="text-[11px] font-bold text-slate-500 block mb-1">
                                            তালিকায় কাঙ্ক্ষিত নাম নেই? নিজে কর্মকর্তার নাম বা পদবি লিখুন:
                                        </span>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                id="custom_officer_field"
                                                placeholder="যেমন: ডা. কামাল হোসেন (মেডিকেল অফিসার) / নায়েব মোজাম্মেল..."
                                                className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const val = document.getElementById('custom_officer_field').value;
                                                    handleCustomOfficerSubmit(val);
                                                }}
                                                className="px-4 py-2 bg-slate-900 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shrink-0"
                                            >
                                                নিশ্চিত করুন
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ======================================================== */}
                            {/* STEP 3: ২. ঘটনার বিবরণ ও স্থান নির্ধারণ (কথোপকথনের মাধ্যমে) */}
                            {/* ======================================================== */}
                            {currentStep === 3 && (
                                <div className="bg-white rounded-2xl p-4 border-2 border-emerald-300 shadow-md space-y-4 animate-speech-pop">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-emerald-700" />
                                            <span className="text-xs font-extrabold text-slate-900">
                                                ২. ঘটনার স্থান ও সময় নির্ধারণ:
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(2)}
                                            className="text-[11px] text-slate-500 hover:text-emerald-800 font-bold flex items-center gap-1"
                                        >
                                            <ArrowLeft className="w-3 h-3" />
                                            পূর্বে ফিরুন
                                        </button>
                                    </div>

                                    {/* Location prompt */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                                            <span>ঘটনাটি কোথায় ঘটেছে? (এক ক্লিকে নির্বাচন করুন অথবা লিখুন):</span>
                                        </label>
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {aiSuggestions.suggestedPlaces.map((place, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setComplaintData({ ...complaintData, incidentLocation: place })}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                                        complaintData.incidentLocation === place
                                                            ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                                                    }`}
                                                >
                                                    📍 {place}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="সুনির্দিষ্ট স্থান/ওয়ার্ড/রুম নম্বর (যেমন: ৩য় তলা ওয়ার্ড নং ৪, সদর রোড মোড়)..."
                                            value={complaintData.incidentSpotDetails}
                                            onChange={(e) => setComplaintData({ ...complaintData, incidentSpotDetails: e.target.value })}
                                            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>

                                    {/* Incident Time prompt */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                                            <Clock className="w-3.5 h-3.5 text-emerald-700" />
                                            <span>ঘটনাটি কখন ঘটেছে বা কতদিন ধরে সমস্যাটি চলছে?</span>
                                        </label>
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {aiSuggestions.suggestedTimeChips.map((timeChip, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setComplaintData({ ...complaintData, incidentTime: timeChip, customIncidentDate: '' })}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                                        complaintData.incidentTime === timeChip && !complaintData.customIncidentDate
                                                            ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                                                    }`}
                                                >
                                                    🕒 {timeChip}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="বা নির্দিষ্ট তারিখ উল্লেখ করুন (যেমন: ১০ অক্টোবর ২০২৬)..."
                                            value={complaintData.customIncidentDate}
                                            onChange={(e) => setComplaintData({ ...complaintData, customIncidentDate: e.target.value })}
                                            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleLocationTimeSubmit}
                                        className="w-full py-3 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <span>পরবর্তী ধাপ: কী ঘটেছে ও সমস্যার উৎপত্তি →</span>
                                    </button>
                                </div>
                            )}

                            {/* ======================================================== */}
                            {/* STEP 4: ৩. কী ঘটেছে এবং কীভাবে সমস্যার সৃষ্টি হয়েছে? */}
                            {/* ======================================================== */}
                            {currentStep === 4 && (
                                <div className="bg-white rounded-2xl p-4 border-2 border-emerald-300 shadow-md space-y-4 animate-speech-pop">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                        <div className="flex items-center gap-1.5">
                                            <AlertCircle className="w-4 h-4 text-emerald-700" />
                                            <span className="text-xs font-extrabold text-slate-900">
                                                ৩. কী ঘটেছে এবং কীভাবে সমস্যার সৃষ্টি হয়েছে?
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(3)}
                                            className="text-[11px] text-slate-500 hover:text-emerald-800 font-bold flex items-center gap-1"
                                        >
                                            <ArrowLeft className="w-3 h-3" />
                                            পূর্বে ফিরুন
                                        </button>
                                    </div>

                                    <p className="text-[11px] text-slate-600 leading-snug">
                                        AI সম্ভাব্য কারণসমূহ চিহ্নিত করেছে। আপনি শুধু প্রয়োজনীয় অপশনগুলোতে টিক দিন অথবা নিচে সংক্ষেপে দুই-এক কথা লিখুন। <strong>AI স্বয়ংক্রিয়ভাবে একটি পূর্ণাঙ্গ ও আনুষ্ঠানিক অভিযোগ বিবরণ তৈরি করবে:</strong>
                                    </p>

                                    <div className="space-y-2">
                                        {aiSuggestions.suggestedScenarios.map((scen, idx) => {
                                            const isSelected = complaintData.selectedScenarios.includes(scen);
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => handleToggleScenario(scen)}
                                                    className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all active:scale-95 ${
                                                        isSelected
                                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs'
                                                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                                                        isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                                                    }`}>
                                                        {isSelected && <Check className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <span className="text-xs font-semibold leading-relaxed">
                                                        {scen}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Brief note in user's own colloquial words */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                            নিজের ভাষায় সংক্ষেপে কিছু যোগ করতে চান? (ঐচ্ছিক):
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="যেমন: ৩ দিন ধরে ঘুরেও ডাক্তার পেলাম না, লাইনে রোগী অজ্ঞান হয়ে যায়..."
                                            value={complaintData.customScenarioNote}
                                            onChange={(e) => setComplaintData({ ...complaintData, customScenarioNote: e.target.value })}
                                            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSynthesizeNarrative}
                                        className="w-full py-3 bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 hover:from-emerald-800 hover:to-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4 text-amber-300" />
                                        <span>AI দ্বারা আনুষ্ঠানিক বিবরণ তৈরি করুন →</span>
                                    </button>
                                </div>
                            )}

                            {/* ======================================================== */}
                            {/* STEP 5: ৪. প্রত্যাশিত প্রতিকার ও প্রমাণ সংগ্রহ */}
                            {/* ======================================================== */}
                            {currentStep === 5 && (
                                <div className="bg-white rounded-2xl p-4 border-2 border-emerald-300 shadow-md space-y-4 animate-speech-pop">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                        <div className="flex items-center gap-1.5">
                                            <Scale className="w-4 h-4 text-emerald-700" />
                                            <span className="text-xs font-extrabold text-slate-900">
                                                ৪. প্রত্যাশিত প্রতিকার ও প্রমাণ সংগ্রহ:
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(4)}
                                            className="text-[11px] text-slate-500 hover:text-emerald-800 font-bold flex items-center gap-1"
                                        >
                                            <ArrowLeft className="w-3 h-3" />
                                            পূর্বে ফিরুন
                                        </button>
                                    </div>

                                    {/* 1. Remedy Selection */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-800 block mb-1.5">
                                            আপনি কী ধরনের প্রতিকার বা সমাধান প্রত্যাশা করছেন?
                                        </label>
                                        <div className="space-y-1.5 mb-2">
                                            {aiSuggestions.suggestedRemedies.map((rem, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setComplaintData({ ...complaintData, remedyRequested: rem })}
                                                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left text-xs transition-all ${
                                                        complaintData.remedyRequested === rem
                                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                                                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                                        complaintData.remedyRequested === rem ? 'border-emerald-600 bg-emerald-600' : 'border-slate-400'
                                                    }`}>
                                                        {complaintData.remedyRequested === rem && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                                                    </span>
                                                    <span>{rem}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="বা নিজের ভাষায় নির্দিষ্ট প্রতিকার লিখুন..."
                                            value={complaintData.remedyRequested}
                                            onChange={(e) => setComplaintData({ ...complaintData, remedyRequested: e.target.value })}
                                            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>

                                    {/* 2. AI-চালিত প্রমাণ সংগ্রহ ও ডকুমেন্ট আপলোড সিস্টেম */}
                                    <div className="p-4 bg-slate-50/90 rounded-2xl border-2 border-emerald-200/80 space-y-4">
                                        {/* Hidden File Inputs */}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept={EVIDENCE_CATEGORIES.find((c) => c.id === activeEvidenceTab)?.accept || '*/*'}
                                            multiple
                                            onChange={(e) => {
                                                handleFilesSelected(e.target.files);
                                                e.target.value = '';
                                            }}
                                        />
                                        <input
                                            type="file"
                                            ref={replaceInputRef}
                                            className="hidden"
                                            accept="*/*"
                                            onChange={handleReplaceFileSelected}
                                        />

                                        {/* AI Speech Header */}
                                        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                                                <Sparkles className="w-4 h-4 text-emerald-700" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1 mb-1">
                                                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                                                        AI প্রমাণ সংগ্রহ গাইড
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                                                        প্রমাণ আপলোড ঐচ্ছিক
                                                    </span>
                                                </div>
                                                <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                                                    “আপনার অভিযোগের সমর্থনে কোনো প্রমাণ, ডকুমেন্ট বা লিংক আছে কি? থাকলে অনুগ্রহ করে আপলোড বা সংযুক্ত করুন।”
                                                </p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    (গুরুত্বপূর্ণ: প্রমাণ আপলোড করা বাধ্যতামূলক নয়। কোনো প্রমাণ না থাকলেও আপনি অভিযোগ জমা দিতে পারবেন)
                                                </p>
                                            </div>
                                        </div>

                                        {/* Category Selection: 6 Distinct Options */}
                                        <div>
                                            <span className="text-xs font-bold text-slate-800 block mb-2">
                                                প্রমাণের ধরন নির্বাচন করুন:
                                            </span>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {EVIDENCE_CATEGORIES.map((cat) => {
                                                    const isSelected = activeEvidenceTab === cat.id;
                                                    const catItemsCount = evidenceItems.filter((it) => it.category === cat.id).length;

                                                    return (
                                                        <button
                                                            key={cat.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setActiveEvidenceTab(cat.id);
                                                                if (cat.id !== 'link') {
                                                                    setTimeout(() => fileInputRef.current?.click(), 100);
                                                                }
                                                            }}
                                                            className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                                                                isSelected
                                                                    ? 'bg-emerald-50/90 border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                                                                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <span className="text-lg">{cat.emoji}</span>
                                                                {catItemsCount > 0 ? (
                                                                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                                                                        {catItemsCount}টি যুক্ত
                                                                    </span>
                                                                ) : (
                                                                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h6 className={`text-xs font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                                                                    {cat.nameBn}
                                                                </h6>
                                                                <span className="text-[9.5px] text-slate-500 block truncate">
                                                                    {cat.hint}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Active Upload Control Box */}
                                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                                            {activeEvidenceTab === 'link' ? (
                                                <div className="space-y-2.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                                            <Link2 className="w-4 h-4 text-emerald-700" />
                                                            <span>🔗 ওয়েব লিংক বা অনলাইন রিসোর্স যুক্ত করুন:</span>
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">URL ইনপুট</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        <input
                                                            type="url"
                                                            placeholder="ওয়েব লিংক (https://...)"
                                                            value={linkUrlInput}
                                                            onChange={(e) => setLinkUrlInput(e.target.value)}
                                                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-500 font-mono"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="বিবরণ (যেমন: ফেসবুক লাইভ ফুটেজ, সংবাদ প্রতিবেদন)..."
                                                            value={linkTitleInput}
                                                            onChange={(e) => setLinkTitleInput(e.target.value)}
                                                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={handleAddLink}
                                                            disabled={!linkUrlInput.trim()}
                                                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                            <span>লিংক যুক্ত করুন</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 text-center sm:text-left">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 text-xl">
                                                            {EVIDENCE_CATEGORIES.find((c) => c.id === activeEvidenceTab)?.emoji || '📁'}
                                                        </div>
                                                        <div>
                                                            <h6 className="text-xs font-bold text-slate-900">
                                                                {EVIDENCE_CATEGORIES.find((c) => c.id === activeEvidenceTab)?.nameBn} আপলোড করুন
                                                            </h6>
                                                            <p className="text-[11px] text-slate-500">
                                                                {EVIDENCE_CATEGORIES.find((c) => c.id === activeEvidenceTab)?.hint} (একাধিক ফাইল নির্বাচন সম্ভব)
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="px-4 py-2.5 bg-slate-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 shrink-0 active:scale-95"
                                                    >
                                                        <Upload className="w-3.5 h-3.5" />
                                                        <span>ফাইল ব্রাউজ করুন</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* AI-Classified Attached Evidence List */}
                                        {evidenceItems.length > 0 ? (
                                            <div className="space-y-2 pt-1">
                                                <div className="flex items-center justify-between pb-1">
                                                    <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                        <span>সংযুক্ত প্রমাণাদির তালিকা (AI দ্বারা বিন্যস্ত):</span>
                                                    </span>
                                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                                        {evidenceItems.length}টি প্রমাণ প্রস্তুত
                                                    </span>
                                                </div>

                                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                                    {evidenceItems.map((item, index) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 transition-all shadow-2xs group"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                {/* Thumbnail Preview */}
                                                                {item.type === 'file' && item.previewUrl ? (
                                                                    <img
                                                                        src={item.previewUrl}
                                                                        alt={item.name}
                                                                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                                                                    />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shrink-0">
                                                                        {item.emoji}
                                                                    </div>
                                                                )}

                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <h6 className="text-xs font-bold text-slate-900 truncate">
                                                                            {item.name}
                                                                        </h6>
                                                                        <span className="text-[9.5px] px-1.5 py-0.2 rounded-md font-bold bg-slate-100 text-slate-700 shrink-0 border border-slate-200">
                                                                            {item.categoryLabel}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                                                        <span>{item.size}</span>
                                                                        <span>•</span>
                                                                        {item.verification ? (
                                                                            <span className={`px-1.5 py-0.2 rounded font-bold text-[9.5px] ${
                                                                                item.verification.confidence_score >= 70
                                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                                            }`}>
                                                                                ✓ AI যাচাই: {item.verification.verification_status === 'likely_authentic' ? 'সামঞ্জস্যপূর্ণ' : 'পর্যালোচনাধীন'} ({item.verification.confidence_score}%)
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-emerald-700 font-semibold">✓ AI যাচাইকৃত</span>
                                                                        )}
                                                                        {item.type === 'link' && item.url && (
                                                                            <a
                                                                                href={item.url}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="text-blue-600 hover:underline flex items-center gap-0.5 truncate max-w-[150px]"
                                                                            >
                                                                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                                                                <span className="truncate">{item.url}</span>
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Actions: Replace / Delete */}
                                                            <div className="flex items-center gap-1 shrink-0 ml-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleTriggerReplace(item)}
                                                                    title="ফাইল বা লিংক পরিবর্তন করুন"
                                                                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                                                                >
                                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveEvidenceItem(item.id)}
                                                                    title="প্রমাণ মুছে ফেলুন"
                                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            /* Reassuring zero-evidence state note */
                                            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 leading-snug flex items-start gap-2">
                                                <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                                                <div>
                                                    <strong>কোনো প্রমাণ নেই? চিন্তার কারণ নেই:</strong> প্রমাণ সংযুক্ত করা বাধ্যতামূলক নয়। কোনো প্রমাণ না থাকলেও আপনি নির্দ্বিধায় অভিযোগ জমা দিতে পারবেন। চিঠিতে স্বচ্ছতার সাথে উল্লেখ থাকবে: <em>"কোনো দালিলিক প্রমাণ সংযুক্ত নেই (সরেজমিন পরিদর্শন ও কর্মকর্তা অনুসন্ধান সাপেক্ষ)"</em>।
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Complainant Identity Preference */}
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-800">
                                                পরিচয় গোপন রেখে বেনামী অভিযোগ জমা দিতে চান?
                                            </span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={complaintData.isAnonymous}
                                                    onChange={(e) => setComplaintData({ ...complaintData, isAnonymous: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </label>
                                        </div>

                                        {!complaintData.isAnonymous && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 animate-speech-pop">
                                                <input
                                                    type="text"
                                                    placeholder="আপনার নাম"
                                                    value={complaintData.complainantName}
                                                    onChange={(e) => setComplaintData({ ...complaintData, complainantName: e.target.value })}
                                                    className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="মোবাইল নম্বর (SMS ট্র্যাকিংয়ের জন্য)"
                                                    value={complaintData.complainantPhone}
                                                    onChange={(e) => setComplaintData({ ...complaintData, complainantPhone: e.target.value })}
                                                    className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 font-mono"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleRemedyAndEvidenceSubmit}
                                        className="w-full py-3 bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <FileCheck2 className="w-4 h-4 text-emerald-300" />
                                        <span>চূড়ান্ত আনুষ্ঠানিক অভিযোগপত্র তৈরি করুন →</span>
                                    </button>
                                </div>
                            )}

                            {/* ======================================================== */}
                            {/* STEP 6: চূড়ান্ত আনুষ্ঠানিক অভিযোগপত্র প্রিভিউ ও সম্মতি */}
                            {/* ======================================================== */}
                            {currentStep === 6 && (
                                <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-400 shadow-xl space-y-4 animate-speech-pop">
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                                        <div className="flex items-center gap-2">
                                            <FileCheck2 className="w-5 h-5 text-emerald-700" />
                                            <div>
                                                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                                                    AI প্রস্তুতকৃত আনুষ্ঠানিক অভিযোগপত্র (প্রিভিউ)
                                                </h4>
                                                <span className="text-[10px] text-emerald-800 font-medium">
                                                    বাংলাদেশ সরকারের প্রশাসনিক স্ট্যান্ডার্ড ফরমেটে সংকলিত
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
                                            <button
                                                type="button"
                                                onClick={() => setPreviewTab('letter')}
                                                className={`px-3 py-1 rounded-md transition-all ${previewTab === 'letter' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'}`}
                                            >
                                                চিঠি প্রিভিউ
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPreviewTab('details')}
                                                className={`px-3 py-1 rounded-md transition-all ${previewTab === 'details' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'}`}
                                            >
                                                সারসংক্ষেপ
                                            </button>
                                        </div>
                                    </div>

                                    {/* Preview View A: Official Letter Document View */}
                                    {previewTab === 'letter' && (
                                        <div className="relative bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono leading-relaxed text-slate-800 whitespace-pre-wrap max-h-72 overflow-y-auto shadow-inner">
                                            {complaintData.formalLetter}
                                        </div>
                                    )}

                                    {/* Preview View B: Structured Fields Summary */}
                                    {previewTab === 'details' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                                <span className="text-[10px] text-slate-400 block font-medium">১. সংশ্লিষ্ট কর্মকর্তা / ব্যক্তি:</span>
                                                <span className="font-bold text-slate-900">
                                                    {complaintData.isPersonUnknown ? 'নির্দিষ্ট ব্যক্তি অজ্ঞাত (প্রতিষ্ঠানের বিরুদ্ধে)' : `${complaintData.officerName} (${complaintData.officerDesignation})`}
                                                </span>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                                <span className="text-[10px] text-slate-400 block font-medium">২. ঘটনার স্থান ও সময়:</span>
                                                <span className="font-bold text-slate-900">{complaintData.districtName}, {complaintData.incidentLocation} ({complaintData.customIncidentDate || complaintData.incidentTime})</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                                <span className="text-[10px] text-slate-400 block font-medium">৩. প্রাতিষ্ঠানিক দপ্তর:</span>
                                                <span className="font-bold text-slate-900">{complaintData.officeName}</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 col-span-1 sm:col-span-2">
                                                <span className="text-[10px] text-slate-400 block font-medium">৪. সংযুক্ত প্রমাণাদি (AI সংগৃহীত):</span>
                                                {evidenceItems.length > 0 ? (
                                                    <div className="mt-1 space-y-1">
                                                        <span className="font-bold text-emerald-800 text-xs">
                                                            মোট {evidenceItems.length}টি প্রমাণপত্র/লিংক সংযুক্ত আছে
                                                        </span>
                                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                                            {evidenceItems.map((item) => (
                                                                <span
                                                                    key={item.id}
                                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-800 font-medium"
                                                                >
                                                                    <span>{item.emoji}</span>
                                                                    <span className="truncate max-w-[120px]">{item.name}</span>
                                                                    <span className="text-slate-400">({item.size})</span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="font-bold text-amber-800 text-xs block mt-0.5">
                                                        কোনো প্রমাণ সংযুক্ত নেই (সরেজমিন পরিদর্শন ও নিরপেক্ষ অনুসন্ধান সাপেক্ষ)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Edit Option */}
                                    <div className="flex items-center justify-between text-xs pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(4)}
                                            className="text-slate-500 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                            <span>বিবরণ বা তথ্যে সংশোধন আনুন</span>
                                        </button>
                                        <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                                            ✓ কোনো তথ্য মনগড়া নয় (ভেরিফাইড)
                                        </span>
                                    </div>

                                    {/* Explicit User Consent Confirmation Checkbox */}
                                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/90 flex items-start gap-2.5">
                                        <input
                                            type="checkbox"
                                            id="final_user_consent_checkbox"
                                            checked={complaintData.userConsent}
                                            onChange={(e) => setComplaintData({ ...complaintData, userConsent: e.target.checked })}
                                            className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                        />
                                        <label htmlFor="final_user_consent_checkbox" className="text-xs text-slate-800 leading-snug cursor-pointer">
                                            <strong>চূড়ান্ত সম্মতি:</strong> আমার অভিযোগপত্রটি সম্পূর্ণ যাচাই করেছি। আমি নিশ্চিত করছি যে প্রদত্ত সকল তথ্য সত্য এবং এটি সংশ্লিষ্ট কর্তৃপক্ষের কাছে চূড়ান্তভাবে দাখিলের সম্মতি প্রদান করছি।
                                        </label>
                                    </div>

                                    {/* Final Submit Button */}
                                    <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleFinalOfficialSubmit}
                                            disabled={isSubmitting || !complaintData.userConsent}
                                            className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 hover:from-emerald-800 hover:to-slate-900 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                                                    দাখিল করা হচ্ছে...
                                                </span>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                                    <span>✓ সম্মতি প্রদান করে অভিযোগ দাখিল করুন</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ======================================================== */}
                            {/* STEP 7: সফল দাখিল ও ডিজিটাল রসিদ */}
                            {/* ======================================================== */}
                            {currentStep === 7 && submissionReceipt && (
                                <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-300 shadow-xl space-y-4 animate-speech-pop">
                                    <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                                <Check className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-extrabold text-slate-900">
                                                    অভিযোগ দাখিল সফল ও নিবন্ধিত!
                                                </h4>
                                                <span className="text-[10px] text-emerald-800 font-bold">
                                                    ডিজিটাল জমা রসিদ (Official Receipt)
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                                            সক্রিয় ট্র্যাকিং
                                        </span>
                                    </div>

                                    {/* Official Tracking Receipt Card */}
                                    <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-3 shadow-xs">
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                            <div>
                                                <span className="text-[10px] text-slate-400 block font-mono">ইউনিক ট্র্যাকিং আইডি (Complaint ID):</span>
                                                <span className="text-lg sm:text-xl font-mono font-black text-slate-900 tracking-wider">
                                                    {submissionReceipt.tracking_id}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => copyTrackingId(submissionReceipt.tracking_id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs transition-all active:scale-95"
                                            >
                                                {copiedReceipt ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-emerald-700" />}
                                                <span>{copiedReceipt ? 'কপি হয়েছে' : 'আইডি কপি করুন'}</span>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-[10px] text-slate-400 block">দাখিলের তারিখ ও সময়:</span>
                                                <span className="font-semibold text-slate-800 font-mono">{submissionReceipt.submitted_at}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 block">এসএলএ নিষ্পত্তির সময়সীমা:</span>
                                                <span className="font-semibold text-emerald-800 font-mono">{submissionReceipt.due_at}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 block">দায়িত্বশীল দপ্তর:</span>
                                                <span className="font-semibold text-slate-800 truncate block">{submissionReceipt.office_name}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 block">বর্তমান অবস্থা:</span>
                                                <span className="font-bold text-emerald-700">{submissionReceipt.status}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                router.get(`/track?id=${submissionReceipt.tracking_id}`);
                                            }}
                                            className="w-full sm:flex-1 py-3 px-4 bg-slate-900 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <span>অভিযোগের লাইভ অবস্থা ট্র্যাক করুন</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleRestart}
                                            className="w-full sm:w-auto py-3 px-4 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                                            <span>নতুন অভিযোগ দাখিল করুন</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Thinking Skeleton */}
                            {isAnalyzing && (
                                <div className="flex items-start gap-2.5 animate-pulse">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4 animate-spin" />
                                    </div>
                                    <div className="bg-white border border-emerald-200 rounded-2xl p-3 text-xs text-slate-600 shadow-2xs flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                                        <span>AI সহকারী বিশ্লেষণ ও প্রশাসনিক পত্র বিন্যাস করছে...</span>
                                    </div>
                                </div>
                            )}

                            <div ref={chatEndRef} />
                        </div>

                        {/* 4. Bottom Natural Language Chat Input Bar */}
                        <div className="p-3 sm:p-4 bg-white border-t border-slate-200/90 shrink-0">
                            <form onSubmit={handleChatQuerySubmit} className="relative flex items-center rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all p-1.5">
                                <input
                                    type="text"
                                    placeholder={currentStep >= 6 
                                        ? "অভিযোগটি চূড়ান্তভাবে প্রস্তুত হয়েছে..." 
                                        : "আপনার সমস্যা স্বাভাবিক ভাষায় এখানে লিখুন (যেমন: 'বরিশাল হাসপাতালে ডাক্তার আসেন না' বা 'ড্রেন উপচে রাস্তায় ময়লা')..."}
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    disabled={currentStep >= 6 || isAnalyzing}
                                    className="w-full bg-transparent border-0 focus:ring-0 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 px-3 py-2"
                                />

                                <button
                                    type="button"
                                    onClick={toggleVoiceListening}
                                    disabled={currentStep >= 6 || isAnalyzing}
                                    title={isListening ? "ভয়েস রেকর্ডিং চলছে (বন্ধ করতে চাপ দিন)" : "ভয়েস টাইপিং শুরু করুন (মাইক্রোফোন)"}
                                    className={`p-2.5 rounded-xl transition-all flex items-center justify-center mr-1 shrink-0 ${
                                        isListening 
                                            ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-200' 
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    }`}
                                >
                                    <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce' : ''}`} />
                                </button>

                                <button
                                    type="submit"
                                    disabled={!userInput.trim() || isAnalyzing || currentStep >= 6}
                                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-40 active:scale-95 shrink-0"
                                >
                                    <span>পাঠান</span>
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </form>

                            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
                                <span>স্বাভাবিক কথ্য বাংলায় যেকোনো সমস্যা লিখলে AI নিজে থেকে সবকিছু গুছিয়ে নেবে</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        router.get('/submit');
                                    }}
                                    className="text-emerald-700 hover:underline font-bold"
                                >
                                    বা সাধারণ ফর্ম খুলুন →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                    </>
                )}
            </div>
        </div>
    );
}
