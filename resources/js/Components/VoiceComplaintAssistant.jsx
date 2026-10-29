import React, { useState, useEffect, useRef } from 'react';
import { 
    Mic, 
    MicOff, 
    Volume2, 
    VolumeX, 
    RotateCcw, 
    Send, 
    Sparkles, 
    CheckCircle2, 
    AlertCircle, 
    ArrowRight, 
    ArrowLeft, 
    Copy, 
    Check, 
    FileText, 
    ExternalLink, 
    Printer, 
    Edit3,
    HelpCircle,
    User,
    Phone,
    MapPin,
    Building2,
    Calendar,
    Clock,
    ShieldCheck,
    Radio,
    Flame,
    LandPlot,
    Zap,
    Trash2,
    Stethoscope,
    Car,
    Scale,
    ShieldAlert,
    HelpCircle as OtherIcon,
    RefreshCw,
    UploadCloud,
    Paperclip,
    Image as ImageIcon,
    Video,
    Music,
    X,
    Eye
} from 'lucide-react';

export default function VoiceComplaintAssistant({
    dbData,
    complaintData,
    setComplaintData,
    evidenceItems = [],
    onSwitchToWizard,
    onClose
}) {
    // Current Step: 0 to 10
    // 0: হ্যালো ও আন্তরিক কুশলবিনিময় (Greeting & Welcome)
    // 1: ক্যাটাগরি বা বিষয় নির্বাচন (Category Selection with numbers & names)
    // 2: বিভাগ নির্বাচন (Division Selection 1-8)
    // 3: জেলা ও উপজেলা নির্বাচন (District & Upazila Selection)
    // 4: দপ্তর, শাখা বা দায়িত্বপ্রাপ্ত কর্মকর্তা (Office, Branch & Official)
    // 5: ঘটনার মূল বিবরণ ও ভোগান্তি (Problem Description & Impact - CONTINUOUS MODE)
    // 6: প্রমাণক ও নথিপত্র সংযুক্তকরণ (Evidence Upload: Photo, Video up to 40MB, Doc - OPTIONAL)
    // 7: প্রত্যাশিত প্রতিকার (Requested Remedy)
    // 8: মোবাইল নম্বর ও গোপনীয়তা (Complainant Phone & Privacy - MANDATORY)
    // 9: আনুষ্ঠানিক আবেদনপত্র প্রিভিউ ও চূড়ান্ত সম্মতি (Formal Petition & Consent)
    // 10: সফল দাখিল ও ডিজিটাল রসিদ (Tracking Code & Receipt)
    const [voiceStep, setVoiceStep] = useState(0);

    // Audio & Speech States
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [audioError, setAudioError] = useState(null);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [editingField, setEditingField] = useState(false);
    const [tempInputValue, setTempInputValue] = useState('');
    const [repeatRequestCount, setRepeatRequestCount] = useState(0);

    // Evidence files state (photo, video up to 40MB+, pdf, audio)
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [fileUploadError, setFileUploadError] = useState(null);
    const fileInputRef = useRef(null);

    // Voice Engine preference: 'natural' (Browser Web Speech Neural with calm cadence) or 'stream' (Backend Streaming TTS)
    const [voiceEngine, setVoiceEngine] = useState('natural');

    // Submission states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionReceipt, setSubmissionReceipt] = useState(null);
    const [copiedReceipt, setCopiedReceipt] = useState(false);

    // Speech Recognition & Audio Player Refs
    const recognitionRef = useRef(null);
    const audioPlayerRef = useRef(new Audio());
    const restartListeningTimeoutRef = useRef(null);
    const isListeningRef = useRef(false);
    const accumulatedTextRef = useRef('');

    // Keep isListeningRef in sync
    useEffect(() => {
        isListeningRef.current = isListening;
    }, [isListening]);

    // Categories with assigned numbers (১ থেকে ৮)
    const CATEGORY_OPTIONS = [
        { num: 1, numBn: '১', id: 2, name: 'ভূমি সেবা ও বিরোধ', icon: LandPlot, desc: 'নামজারি, পর্চা, খতিয়ান বা জমি সংক্রান্ত সমস্যা' },
        { num: 2, numBn: '২', id: 4, name: 'বিদ্যুৎ ও জ্বালানি', icon: Zap, desc: 'লোডশেডিং, মিটার, ট্রান্সফরমার বা বিদ্যুৎ বিল' },
        { num: 3, numBn: '৩', id: 3, name: 'পৌরসেবা ও পরিচ্ছন্নতা', icon: Trash2, desc: 'ড্রেনেজ, বর্জ্য, রাস্তাঘাট, বাতি বা জলাবদ্ধতা' },
        { num: 4, numBn: '৪', id: 1, name: 'স্বাস্থ্য ও চিকিৎসা সেবা', icon: Stethoscope, desc: 'হাসপাতাল, ডাক্তার, নার্স, ওষুধ বা ক্লিনিকে হয়রানি' },
        { num: 5, numBn: '৫', id: 8, name: 'সড়ক, সেতু ও পরিবহন', icon: Car, desc: 'রাস্তা ভাঙা, কালভার্ট, বাস ভাড়া বা পরিবহন সমস্যা' },
        { num: 6, numBn: '৬', id: 6, name: 'দুর্নীতি, ঘুষ ও অনিয়ম', icon: Scale, desc: 'টাকা দাবি, ঘুষ গ্রহণ, ক্ষমতার অপব্যবহার বা অনিয়ম' },
        { num: 7, numBn: '৭', id: 10, name: 'আইনশৃঙ্খলা ও পুলিশ', icon: ShieldAlert, desc: 'থানা, জিডি নিতে অনীহা, চাঁদাবাজি বা নিরাপত্তা' },
        { num: 8, numBn: '৮', id: 9, name: 'অন্যান্য নাগরিক সেবা', icon: OtherIcon, desc: 'পাসপোর্ট, ভাতা, শিক্ষা বা অন্যান্য সরকারি সেবা' },
    ];

    // Divisions with assigned numbers (১ থেকে ৮)
    const DIVISION_OPTIONS = [
        { num: 1, numBn: '১', id: 1, name: 'ঢাকা', en: 'Dhaka' },
        { num: 2, numBn: '২', id: 2, name: 'চট্টগ্রাম', en: 'Chattogram' },
        { num: 3, numBn: '৩', id: 3, name: 'রাজশাহী', en: 'Rajshahi' },
        { num: 4, numBn: '৪', id: 4, name: 'খুলনা', en: 'Khulna' },
        { num: 5, numBn: '৫', id: 5, name: 'বরিশাল', en: 'Barishal' },
        { num: 6, numBn: '৬', id: 6, name: 'সিলেট', en: 'Sylhet' },
        { num: 7, numBn: '৭', id: 7, name: 'রংপুর', en: 'Rangpur' },
        { num: 8, numBn: '৮', id: 8, name: 'ময়মনসিংহ', en: 'Mymensingh' },
    ];

    // Common Step Configuration
    const STEPS_CONFIG = [
        {
            step: 0,
            title: 'আন্তরিক কুশলবিনিময়',
            spokenText: 'আসসালামু আলাইকুম! হ্যালো স্যার, কেমন আছেন? আজকের দিনটি কেমন কাটল আপনার? আপনি কি কোনো নাগরিক সমস্যার অভিযোগ জানাতে চান বা কোনো বিষয়ে পরামর্শ চান?',
            shortPrompt: 'মুখে বলুন: "হ্যাঁ", "জি" অথবা "অভিযোগ জানাতে চাই"',
            hint: 'আপনার কথা শুনে এআই স্বয়ংক্রিয়ভাবে পরবর্তী ধাপে নিয়ে যাবে।'
        },
        {
            step: 1,
            title: 'অভিযোগের ক্যাটাগরি বা বিষয়',
            spokenText: 'অবশ্যই স্যার, আমি আপনাকে সম্পূর্ণ সাহায্য করছি। আপনি কোন বিষয়ে অভিযোগ জানাতে চান? যেমন— ভূমি সেবার জন্য এক বলুন, বিদ্যুৎ সমস্যার জন্য দুই বলুন, পৌরসেবার জন্য তিন বলুন, স্বাস্থ্য সেবার জন্য চার বলুন, সড়কের জন্য পাঁচ বলুন, অথবা সরাসরি বিষয়ের নাম বলুন।',
            shortPrompt: 'ক্যাটাগরির নম্বর (যেমন: ১, ২, ৩) অথবা বিষয়টির নাম মুখে বলুন',
            hint: 'উদাহরণ: "১", "বিদ্যুৎ", "৩", "পৌরসভা", বা "হাসপাতাল"'
        },
        {
            step: 2,
            title: 'ঘটনার বিভাগ নির্বাচন',
            spokenText: 'ধন্যবাদ স্যার। এই ঘটনাটি কোন বিভাগে ঘটেছে? আপনি বিভাগের নাম—যেমন ঢাকা, চট্টগ্রাম, রাজশাহী, খুলনা, বরিশাল, সিলেট, রংপুর বা ময়মনসিংহ বলতে পারেন অথবা নম্বর বলতে পারেন।',
            shortPrompt: 'বিভাগের নাম বা নম্বর মুখে বলুন (যেমন: চট্টগ্রাম বা ২)',
            hint: 'উদাহরণ: "চট্টগ্রাম", "বরিশাল", "ঢাকা", বা "২"'
        },
        {
            step: 3,
            title: 'জেলা ও উপজেলা নির্ধারণ',
            spokenText: 'নির্বাচিত বিভাগের কোন জেলা এবং উপজেলায় সমস্যাটি ঘটেছে? অনুগ্রহ করে আপনার জেলা ও উপজেলার নাম মুখে বলুন।',
            shortPrompt: 'আপনার জেলা ও উপজেলার নাম বলুন',
            hint: 'উদাহরণ: "কুমিল্লা সদর", "বরিশাল সদর", বা "পটুয়াখালী বাউফল"'
        },
        {
            step: 4,
            title: 'সংশ্লিষ্ট দপ্তর বা কর্মকর্তা',
            spokenText: 'এই অভিযোগটি কোন নির্দিষ্ট সরকারি দপ্তর বা অফিসের বিরুদ্ধে? যেমন পল্লী বিদ্যুৎ, হাসপাতাল, পৌরসভা বা ভূমি অফিস? এবং কোনো শাখা বা কর্মকর্তার নাম জানা থাকলে বলুন। জানা না থাকলে "জানা নেই" বললেই হবে।',
            shortPrompt: 'দপ্তরের নাম অথবা কর্মকর্তার পদবি বলুন',
            hint: 'উদাহরণ: "পল্লী বিদ্যুৎ সমিতি" বা "উপজেলা স্বাস্থ্য কমপ্লেক্স" বা "জানা নেই"'
        },
        {
            step: 5,
            title: 'ঘটনার মূল বিবরণ ও ভোগান্তি (ধারাবাহিক কণ্ঠস্বর)',
            spokenText: 'এবার ঘটনাটি আসলে কী ঘটেছে এবং কবে থেকে এই সমস্যা চলছে? দয়া করে শান্তভাবে পুরো ঘটনাটি বিস্তারিত বলুন। আপনার যত সময় ইচ্ছা নিয়ে কথা বলুন, কথা শেষ হলে নিচে পরবর্তী ধাপ বাটনে চাপুন।',
            shortPrompt: 'কথা বলতে থাকুন... আপনার প্রতিটি বাক্য স্বয়ংক্রিয়ভাবে লেখা হচ্ছে',
            hint: 'মাঝপথে থামলেও মাইক বন্ধ হবে না। পুরো বর্ণনা শেষ করে "পরবর্তী ধাপ" বাটনে চাপুন।'
        },
        {
            step: 6,
            title: 'প্রমাণক ও নথিপত্র সংযুক্তকরণ (ছবি, ভিডিও বা ডকুমেন্ট)',
            spokenText: 'স্যার, আপনার অভিযোগের পক্ষে কি কোনো প্রমাণ আছে—যেমন ঘটনার ছবি, ভিডিও ক্লিপ (৪০ মেগাবাইট পর্যন্ত), কোনো কাগজের ছবি বা অডিও রেকর্ড? থাকলে অনুগ্রহ করে এখানে যুক্ত করুন। আর কোনো প্রমাণ না থাকলেও অসুবিধা নেই, "প্রমাণ নেই" বলুন বা পরবর্তী ধাপে যান।',
            shortPrompt: 'ছবি, ভিডিও (৪০ MB পর্যন্ত) যুক্ত করুন অথবা প্রমাণ ছাড়া এগিয়ে যান',
            hint: 'প্রমাণ থাকলে যুক্ত করুন, না থাকলে সরাসরি "পরবর্তী ধাপে যান" বাটনে চাপুন।'
        },
        {
            step: 7,
            title: 'প্রত্যাশিত প্রতিকার',
            spokenText: 'এই সমস্যার সমাধানে আপনি কর্তৃপক্ষের কাছে কী ধরনের প্রতিকার চান? যেমন: সংযোগ মেরামত, ক্ষতিপূরণ, অনিয়মের তদন্ত, নাকি কোনো প্রশাসনিক ব্যবস্থা?',
            shortPrompt: 'আপনার প্রত্যাশিত প্রতিকার মুখে বলুন বা নির্বাচন করুন',
            hint: 'উদাহরণ: "দ্রুত বিদ্যুৎ লাইন মেরামত চাই" বা "ঘুষ দাবি করার সুষ্ঠু তদন্ত ও ব্যবস্থা চাই"'
        },
        {
            step: 8,
            title: 'মোবাইল নম্বর ও গোপনীয়তা (বাধ্যতামূলক)',
            spokenText: 'অভিযোগের অগ্রগতি এবং সমাধানের ফলাফল এসএমএসের মাধ্যমে পেতে আপনার মোবাইল নম্বরটি বলুন। আর আপনি কি আপনার নাম-পরিচয় সম্পূর্ণ গোপন রাখতে চান?',
            shortPrompt: 'আপনার ১১ ডিজিটের মোবাইল নম্বর বলুন (বা "গোপন" বলুন)',
            hint: 'উদাহরণ: "০১৭xxxxxxxx" অথবা "পরিচয় গোপন রাখতে চাই"'
        },
        {
            step: 9,
            title: 'আবেদনপত্র প্রিভিউ ও চূড়ান্ত সম্মতি',
            spokenText: 'স্যার, আপনার দেওয়া সমস্ত তথ্য সুন্দরভাবে সাজিয়ে একটি পূর্ণাঙ্গ সরকারি আবেদনপত্র প্রস্তুত করেছি। আপনি সম্মতি দিলে আমি এখনই এটি সংশ্লিষ্ট দপ্তরে দাখিল করব। আমি কি আবেদনটি জমা দেব?',
            shortPrompt: 'জমা দিতে মুখে বলুন: "হ্যাঁ", "জমা দাও" অথবা বাটনে চাপুন',
            hint: 'আবেদনপত্রটি দেখে নিশ্চিত করুন এবং সাবমিট করুন।'
        },
        {
            step: 10,
            title: 'সফল দাখিল ও ডিজিটাল রসিদ',
            spokenText: 'অভিনন্দন স্যার! আপনার অভিযোগটি সফলভাবে দাখিল হয়েছে। আপনার ডিজিটাল ট্র্যাকিং কোড প্রস্তুত হয়েছে। ধন্যবাদ!',
            shortPrompt: 'অভিযোগ সফলভাবে নিবন্ধিত হয়েছে',
            hint: 'ট্র্যাকিং কোড সংরক্ষণ করুন।'
        }
    ];

    const currentConfig = STEPS_CONFIG[voiceStep] || STEPS_CONFIG[0];

    // =========================================================================
    // 1. Realistic Natural Speech Synthesis (কণ্ঠস্বর উন্নয়ন)
    // =========================================================================
    const speakTextWithRealisticVoice = (textToSpeak, onComplete = null) => {
        if (isMuted || !textToSpeak) {
            if (onComplete) onComplete();
            return;
        }

        // Clean & smooth text for realistic pauses
        let smoothedText = textToSpeak
            .replace(/\s+/g, ' ')
            .replace(/\.\s*/g, '... ')
            .replace(/([১-৮])\.\s*/g, '$1, ');

        stopSpeaking();
        setIsAiSpeaking(true);

        if (voiceEngine === 'natural' && 'speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(smoothedText);
                utterance.lang = 'bn-BD';

                const voices = window.speechSynthesis.getVoices();
                const banglaVoice = voices.find(v => 
                    (v.lang.includes('bn') || v.lang.includes('ben')) && 
                    (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Google'))
                ) || voices.find(v => v.lang.includes('bn') || v.lang.includes('ben'));

                if (banglaVoice) {
                    utterance.voice = banglaVoice;
                }

                // Calm, polite human cadence (0.92 gives respectful, non-robotic timing)
                utterance.rate = 0.92;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;

                utterance.onend = () => {
                    setIsAiSpeaking(false);
                    if (onComplete) onComplete();
                };

                utterance.onerror = (e) => {
                    console.warn('SpeechSynthesis error, falling back to backend TTS:', e);
                    fallbackBackendAudio(textToSpeak, onComplete);
                };

                window.speechSynthesis.speak(utterance);
                return;
            } catch (err) {
                console.warn('SpeechSynthesis init error:', err);
            }
        }

        fallbackBackendAudio(textToSpeak, onComplete);
    };

    const fallbackBackendAudio = (textToSpeak, onComplete = null) => {
        try {
            audioPlayerRef.current.pause();
            audioPlayerRef.current.currentTime = 0;

            const ttsUrl = `/api/ai/tts?text=${encodeURIComponent(textToSpeak.trim())}`;
            audioPlayerRef.current.src = ttsUrl;

            audioPlayerRef.current.onended = () => {
                setIsAiSpeaking(false);
                if (onComplete) onComplete();
            };

            audioPlayerRef.current.onerror = () => {
                setIsAiSpeaking(false);
                if (onComplete) onComplete();
            };

            const playPromise = audioPlayerRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch((err) => {
                    console.warn('Backend audio play restricted:', err);
                    setIsAiSpeaking(false);
                    if (onComplete) onComplete();
                });
            }
        } catch (e) {
            setIsAiSpeaking(false);
            if (onComplete) onComplete();
        }
    };

    const stopSpeaking = () => {
        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
            audioPlayerRef.current.currentTime = 0;
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsAiSpeaking(false);
    };

    // =========================================================================
    // 2. Speech-to-Text (STT) Engine with CONTINUOUS MODE (মাঝপথে কেটে যাবে না)
    // =========================================================================
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setAudioError('আপনার ব্রাউজারে সরাসরি ভয়েস ইনপুট সমর্থিত নয়। দয়া করে গুগল ক্রোম বা মাইক্রোসফট এজ ব্যবহার করুন অথবা নিচে টাইপ করুন।');
            return;
        }

        stopSpeaking();
        setAudioError(null);
        isListeningRef.current = true;

        try {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) {}
            }

            const recognition = new SpeechRecognition();
            recognition.lang = 'bn-BD';
            // CRITICAL: continuous = true ensures citizen can pause, breathe, and describe fully without premature cut-off!
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                let interimTranscript = '';
                let newFinals = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        newFinals += event.results[i][0].transcript + ' ';
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (newFinals) {
                    accumulatedTextRef.current = (accumulatedTextRef.current + ' ' + newFinals).replace(/\s+/g, ' ').trim();
                    setCurrentTranscript(accumulatedTextRef.current);
                    setTempInputValue(accumulatedTextRef.current);
                } else if (interimTranscript) {
                    const fullPreview = (accumulatedTextRef.current + ' ' + interimTranscript).replace(/\s+/g, ' ').trim();
                    setCurrentTranscript(fullPreview);
                    setTempInputValue(fullPreview);
                }
            };

            recognition.onerror = (event) => {
                console.warn('Speech recognition status:', event.error);
                if (event.error === 'not-allowed') {
                    setAudioError('মোবাইলে মাইক্রোফোন পারমিশন বন্ধ আছে। অনুগ্রহ করে ব্রাউজারের অ্যাড্রেস বারের সাইট সেটিংসে গিয়ে Microphone Allow করুন অথবা নিচে টাইপ করুন।');
                } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    setAudioError(`ভয়েস রিকগনিশন অবস্থা: ${event.error}`);
                }
            };

            recognition.onend = () => {
                // If the user hasn't explicitly stopped listening, keep listening (especially in Step 5 description)
                if (isListeningRef.current) {
                    try {
                        recognition.start();
                    } catch (e) {
                        setIsListening(false);
                    }
                } else {
                    setIsListening(false);
                }
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (err) {
            console.error('Failed to start speech recognition:', err);
            setIsListening(false);
        }
    };

    const stopListening = () => {
        isListeningRef.current = false;
        if (restartListeningTimeoutRef.current) {
            clearTimeout(restartListeningTimeoutRef.current);
        }
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) {}
        }
        setIsListening(false);
    };

    // Auto-ask question whenever step changes
    useEffect(() => {
        if (voiceStep <= 9) {
            setCurrentTranscript('');
            setTempInputValue('');
            accumulatedTextRef.current = '';
            setAudioError(null);

            speakTextWithRealisticVoice(currentConfig.spokenText, () => {
                // Auto-start listening after AI finishes speaking for hands-free natural talk
                restartListeningTimeoutRef.current = setTimeout(() => {
                    startListening();
                }, 500);
            });
        }

        return () => {
            stopSpeaking();
            stopListening();
        };
    }, [voiceStep]);

    // =========================================================================
    // 3. Fallback Helper: Ask citizen to repeat politely if inaudible
    // =========================================================================
    const askCitizenToRepeat = (customMessage = null) => {
        stopListening();
        setRepeatRequestCount((prev) => prev + 1);

        const repeatText = customMessage || (
            repeatRequestCount === 0
                ? 'দুঃখিত স্যার, আপনার কথাটি পুরোপুরি পরিষ্কার বুঝতে পারিনি। অনুগ্রহ করে আরেকবার বলবেন কি?'
                : 'আমি দুঃখিত স্যার, এবারও কথাটি স্পষ্ট শোনা যায়নি। অনুগ্রহ করে আরেকবার পরিষ্কারভাবে বলুন অথবা নিচের অপশনে চাপুন।'
        );

        speakTextWithRealisticVoice(repeatText, () => {
            restartListeningTimeoutRef.current = setTimeout(() => {
                startListening();
            }, 400);
        });
    };

    // =========================================================================
    // 4. File Upload Handler (40 MB Video, Photo, PDF, Audio)
    // =========================================================================
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setFileUploadError(null);
        const maxSizeBytes = 100 * 1024 * 1024; // 100MB limit (effortlessly supports 40MB)
        const validFiles = [];

        for (const file of files) {
            if (file.size > maxSizeBytes) {
                setFileUploadError(`"${file.name}" ফাইলটির আকার অতিরিক্ত বড় (সর্বোচ্চ ১০০ মেগাবাইট অনুমোদিত)।`);
                continue;
            }

            validFiles.push({
                file,
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(1),
                type: file.type.startsWith('video/') ? 'video' 
                    : file.type.startsWith('image/') ? 'image'
                    : file.type.startsWith('audio/') ? 'audio' : 'doc'
            });
        }

        setUploadedFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // =========================================================================
    // 5. Conversational Response Parser & Human-like Interview Workflow
    // =========================================================================
    const handleConfirmAnswer = async (answerText) => {
        const text = (answerText || tempInputValue || currentTranscript || accumulatedTextRef.current).trim();

        // Step 6 (Evidence upload) is optional — citizen can proceed without text
        if (voiceStep !== 6 && !text) {
            askCitizenToRepeat('স্যার, আপনার কণ্ঠস্বর শোনা যায়নি। অনুগ্রহ করে কিছু বলুন।');
            return;
        }

        stopListening();
        stopSpeaking();
        setIsProcessing(true);

        try {
            // -------------------------------------------------------------
            // Step 0: কুশলবিনিময় (Greeting & Welcome)
            // -------------------------------------------------------------
            if (voiceStep === 0) {
                const lower = text.toLowerCase();
                const isAffirmative = lower.includes('হ্যাঁ') || lower.includes('হ্যা') || lower.includes('জি') || 
                                     lower.includes('অভিযোগ') || lower.includes('জানাতে') || lower.includes('চাই') || 
                                     lower.includes('সমস্যা') || lower.includes('সাহায্য') || lower.includes('yes') ||
                                     lower.includes('হ্যালো') || lower.includes('ওয়ালাইকুম') || lower.includes('ভালো');

                if (isAffirmative || text.length > 1) {
                    setVoiceStep(1);
                } else {
                    askCitizenToRepeat('জি স্যার, আমি শুনছি। আপনি কি কোনো নাগরিক সমস্যার অভিযোগ জানাতে চান? দয়া করে "হ্যাঁ" বলুন।');
                }
            }

            // -------------------------------------------------------------
            // Step 1: ক্যাটাগরি বা বিষয় নির্বাচন (Category Selection 1-8)
            // -------------------------------------------------------------
            else if (voiceStep === 1) {
                let matchedCategory = null;

                // Match by number word or digit
                if (text.includes('১') || text.includes('এক') || text.includes('1') || text.includes('one')) {
                    matchedCategory = CATEGORY_OPTIONS.find(c => c.num === 1);
                } else if (text.includes('২') || text.includes('দুই') || text.includes('2') || text.includes('two')) {
                    matchedCategory = CATEGORY_OPTIONS.find(c => c.num === 2);
                } else if (text.includes('৩') || text.includes('তিন') || text.includes('3') || text.includes('three')) {
                    matchedCategory = CATEGORY_OPTIONS.find(c => c.num === 3);
                } else if (text.includes('৪') || text.includes('চার') || text.includes('4') || text.includes('four')) {
                    matchedCategory = CATEGORY_OPTIONS.find(c => c.num === 4);
                } else if (text.includes('৫') || text.includes('পাঁচ') || text.includes('5') || text.includes('five')) {
                    matchedCategory = CATEGORY_OPTIONS.find(c => c.num === 5);
                } else if (text.includes('৬') || text.includes('ছয়') || text.includes('ছয়') || text.includes('6') || text.includes('six')) {
                    matchedCategory = CATEGORY_OPTIONS.find(c => c.num === 6);
                } else if (text.includes('৭') || text.includes('সাত') || text.includes('7') || text.includes('seven')) {
                    matchedCategory = CATEGORY_OPTIONS.find(c => c.num === 7);
                } else if (text.includes('৮') || text.includes('আট') || text.includes('8') || text.includes('eight')) {
                    matchedCategory = CATEGORY_OPTIONS.find(c => c.num === 8);
                }

                // Match by keywords
                if (!matchedCategory) {
                    if (text.includes('জমি') || text.includes('ভূমি') || text.includes('নামজারি') || text.includes('পর্চা') || text.includes('খতিয়ান')) {
                        matchedCategory = CATEGORY_OPTIONS.find(c => c.num === 1);
                    } else if (text.includes('বিদ্যুৎ') || text.includes('কারেন্ট') || text.includes('মিটার') || text.includes('লোডশেডিং') || text.includes('ট্রান্সফরমার')) {
                        matchedCategory = CATEGORY_OPTIONS.find(c => c.num === 2);
                    } else if (text.includes('পৌরসভা') || text.includes('ড্রেন') || text.includes('ময়লা') || text.includes('আবর্জনা') || text.includes('পানি জমে')) {
                        matchedCategory = CATEGORY_OPTIONS.find(c => c.num === 3);
                    } else if (text.includes('হাসপাতাল') || text.includes('ডাক্তার') || text.includes('চিকিৎসা') || text.includes('ওষুধ') || text.includes('নার্স')) {
                        matchedCategory = CATEGORY_OPTIONS.find(c => c.num === 4);
                    } else if (text.includes('রাস্তা') || text.includes('সড়ক') || text.includes('সেতু') || text.includes('কালভার্ট') || text.includes('পরিবহন')) {
                        matchedCategory = CATEGORY_OPTIONS.find(c => c.num === 5);
                    } else if (text.includes('ঘুষ') || text.includes('দুর্নীতি') || text.includes('টাকা চায়') || text.includes('অনিয়ম')) {
                        matchedCategory = CATEGORY_OPTIONS.find(c => c.num === 6);
                    } else if (text.includes('পুলিশ') || text.includes('থানা') || text.includes('জিডি') || text.includes('চাঁদাবাজি')) {
                        matchedCategory = CATEGORY_OPTIONS.find(c => c.num === 7);
                    }
                }

                if (matchedCategory) {
                    setComplaintData((prev) => ({
                        ...prev,
                        categoryId: matchedCategory.id,
                        categoryName: matchedCategory.name,
                    }));

                    setVoiceStep(2);
                } else {
                    askCitizenToRepeat('দুঃখিত স্যার, ক্যাটাগরি নম্বরটি বা নাম বুঝতে পারিনি। অনুগ্রহ করে যেমন "২" অথবা "বিদ্যুৎ" বলুন।');
                }
            }

            // -------------------------------------------------------------
            // Step 2: বিভাগ নির্বাচন (Division Selection 1-8)
            // -------------------------------------------------------------
            else if (voiceStep === 2) {
                let matchedDiv = null;

                if (text.includes('১') || text.includes('এক') || text === '1') matchedDiv = DIVISION_OPTIONS[0]; // ঢাকা
                else if (text.includes('২') || text.includes('দুই') || text === '2') matchedDiv = DIVISION_OPTIONS[1]; // চট্টগ্রাম
                else if (text.includes('৩') || text.includes('তিন') || text === '3') matchedDiv = DIVISION_OPTIONS[2]; // রাজশাহী
                else if (text.includes('৪') || text.includes('চার') || text === '4') matchedDiv = DIVISION_OPTIONS[3]; // খুলনা
                else if (text.includes('৫') || text.includes('পাঁচ') || text === '5') matchedDiv = DIVISION_OPTIONS[4]; // বরিশাল
                else if (text.includes('৬') || text.includes('ছয়') || text.includes('ছয়') || text === '6') matchedDiv = DIVISION_OPTIONS[5]; // সিলেট
                else if (text.includes('৭') || text.includes('সাত') || text === '7') matchedDiv = DIVISION_OPTIONS[6]; // রংপুর
                else if (text.includes('৮') || text.includes('আট') || text === '8') matchedDiv = DIVISION_OPTIONS[7]; // ময়মনসিংহ

                if (!matchedDiv) {
                    for (const div of DIVISION_OPTIONS) {
                        if (text.includes(div.name) || text.toLowerCase().includes(div.en.toLowerCase())) {
                            matchedDiv = div;
                            break;
                        }
                    }
                }

                if (matchedDiv) {
                    setComplaintData((prev) => ({
                        ...prev,
                        divisionId: matchedDiv.id,
                        divisionName: matchedDiv.name,
                    }));

                    setVoiceStep(3);
                } else {
                    askCitizenToRepeat('দুঃখিত স্যার, বিভাগের নামটি স্পষ্টভাবে ধরতে পারিনি। অনুগ্রহ করে ঢাকা, চট্টগ্রাম, বরিশাল বা আপনার বিভাগের নামটি বলুন।');
                }
            }

            // -------------------------------------------------------------
            // Step 3: জেলা ও উপজেলা নির্বাচন (District & Upazila)
            // -------------------------------------------------------------
            else if (voiceStep === 3) {
                const districts = dbData.districts || [];
                const upazilas = dbData.upazilas || [];

                let matchedDistrict = null;
                for (const d of districts) {
                    if (text.includes(d.name_bn) || text.toLowerCase().includes((d.name_en || '').toLowerCase())) {
                        matchedDistrict = d;
                        break;
                    }
                }

                let matchedUpazila = null;
                for (const u of upazilas) {
                    if (text.includes(u.name_bn) || text.toLowerCase().includes((u.name_en || '').toLowerCase())) {
                        matchedUpazila = u;
                        break;
                    }
                }

                if (matchedDistrict || text.length >= 2) {
                    setComplaintData((prev) => ({
                        ...prev,
                        districtId: matchedDistrict ? matchedDistrict.id : prev.districtId,
                        districtName: matchedDistrict ? matchedDistrict.name_bn : text,
                        upazilaId: matchedUpazila ? matchedUpazila.id : prev.upazilaId,
                        upazilaName: matchedUpazila ? matchedUpazila.name_bn : (text.includes('সদর') ? 'সদর' : ''),
                        incidentLocation: text,
                    }));

                    setVoiceStep(4);
                } else {
                    askCitizenToRepeat('দুঃখিত স্যার, আপনার জেলা ও উপজেলার নামটি স্পষ্টভাবে বুঝতে পারিনি। অনুগ্রহ করে আরেকবার বলবেন কি?');
                }
            }

            // -------------------------------------------------------------
            // Step 4: সংশ্লিষ্ট দপ্তর বা কর্মকর্তা (Office & Officer)
            // -------------------------------------------------------------
            else if (voiceStep === 4) {
                const isUnknown = text.includes('জানি না') || text.includes('অজ্ঞাত') || text.includes('নির্দিষ্ট না') || text.includes('জানা নেই');

                setComplaintData((prev) => ({
                    ...prev,
                    officeName: isUnknown ? 'সংশ্লিষ্ট দায়িত্বপ্রাপ্ত দপ্তর' : text,
                    officerName: isUnknown ? 'নির্দিষ্ট কর্মকর্তা অজ্ঞাত (দপ্তরের বিরুদ্ধে)' : text,
                    officerDesignation: isUnknown ? 'দপ্তর প্রধান / তদন্তকারী কর্মকর্তা' : 'সংশ্লিষ্ট দায়িত্বপ্রাপ্ত কর্মকর্তা',
                    isPersonUnknown: isUnknown,
                }));

                setVoiceStep(5);
            }

            // -------------------------------------------------------------
            // Step 5: ঘটনার মূল বিবরণ ও কী ঘটেছে (Problem Description - CONTINUOUS MODE)
            // -------------------------------------------------------------
            else if (voiceStep === 5) {
                if (text.length < 8 || text.includes('কিছু না')) {
                    askCitizenToRepeat('স্যার, অভিযোগ তদন্ত ও সমাধানের জন্য ঘটনার বিবরণটি জানানো আবশ্যক। অনুগ্রহ করে শান্তভাবে বলুন কী ঘটেছে এবং সাধারণ মানুষের কী সমস্যা হচ্ছে।');
                    return;
                }

                try {
                    const res = await fetch('/api/ai/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({ text, lang: 'bn' })
                    });
                    const data = await res.json();

                    setComplaintData((prev) => ({
                        ...prev,
                        title: data.suggested_title || `নাগরিক অভিযোগ: ${text.substring(0, 45)}`,
                        synthesizedDescription: text,
                        incidentTime: 'সাম্প্রতিক সময়ে',
                        remedyRequested: (data.suggested_remedies && data.suggested_remedies[0]) || prev.remedyRequested,
                    }));
                } catch (e) {
                    setComplaintData((prev) => ({
                        ...prev,
                        title: `নাগরিক অভিযোগ: ${text.substring(0, 45)}`,
                        synthesizedDescription: text,
                    }));
                }

                // Advance to Step 6 (Evidence Upload Step)
                setVoiceStep(6);
            }

            // -------------------------------------------------------------
            // Step 6: প্রমাণক ও নথিপত্র সংযুক্তকরণ (Evidence & Documents Upload - OPTIONAL)
            // -------------------------------------------------------------
            else if (voiceStep === 6) {
                // If citizen speaks "পরবর্তী ধাপ", "প্রমাণ নেই", "স্কিপ", "না", "নেই" -> advances cleanly
                setVoiceStep(7);
            }

            // -------------------------------------------------------------
            // Step 7: প্রত্যাশিত প্রতিকার (Requested Remedy)
            // -------------------------------------------------------------
            else if (voiceStep === 7) {
                setComplaintData((prev) => ({
                    ...prev,
                    remedyRequested: text || 'সরেজমিন পরিদর্শন ও দ্রুত আইনানুগ প্রতিকার',
                }));

                setVoiceStep(8);
            }

            // -------------------------------------------------------------
            // Step 8: মোবাইল নম্বর ও গোপনীয়তা (Phone & Privacy - MANDATORY)
            // -------------------------------------------------------------
            else if (voiceStep === 8) {
                const isAnon = text.includes('গোপন') || text.includes('বেনামী') || text.includes('প্রকাশ করতে চাই না') || text.includes('চাই না');
                
                const phoneMatch = text.match(/01[3-9]\d{8}/);

                if (!isAnon && !phoneMatch) {
                    askCitizenToRepeat('স্যার, সরকারি নিয়মে ট্র্যাকিং কোড ও এসএমএস আপডেট পেতে একটি সচল ১১ ডিজিটের মোবাইল নম্বর দেওয়া বাধ্যতামূলক। অনুগ্রহ করে আপনার নম্বরটি বলুন, অথবা নাম প্রকাশ করতে না চাইলে "গোপন" বলুন।');
                    return;
                }

                const extractedPhone = phoneMatch ? phoneMatch[0] : '01700000000';
                let extractedName = text.replace(extractedPhone, '').replace(/(আমার|নাম|মোবাইল|নম্বর|হলো|হল|ফোন|গোপন)/g, '').trim();

                const updatedData = {
                    ...complaintData,
                    isAnonymous: isAnon,
                    complainantName: isAnon ? 'গোপন নাগরিক' : (extractedName || 'সচেতন নাগরিক'),
                    complainantPhone: isAnon ? '01700000000' : extractedPhone,
                };

                setComplaintData(updatedData);

                // Auto-generate formal petition draft with evidence summary
                await generateFormalLetterDraft(updatedData);

                setVoiceStep(9);
            }

            // -------------------------------------------------------------
            // Step 9: চূড়ান্ত সম্মতি ও দাখিল (Final Consent)
            // -------------------------------------------------------------
            else if (voiceStep === 9) {
                const isAffirmative = text.includes('হ্যাঁ') || text.includes('হ্যা') || text.includes('জমা') || 
                                     text.includes('সাবমিট') || text.includes('yes') || text.includes('করুন') ||
                                     text.includes('দিন') || text.includes('ঠিক আছে');

                if (isAffirmative) {
                    handleFinalSubmit();
                } else if (text.includes('না') || text.includes('পরিবর্তন') || text.includes('ভুল')) {
                    speakTextWithRealisticVoice('কোন তথ্যটি পরিবর্তন করতে চান? আপনি যে ধাপটি পরিবর্তন করতে চান সেটিতে চাপুন।');
                } else {
                    askCitizenToRepeat('স্যার, আপনি কি আবেদনটি চূড়ান্তভাবে দাখিল করতে চান? দয়া করে "হ্যাঁ" বলুন অথবা স্ক্রিনের সবুজ বাটনে চাপুন।');
                }
            }
        } catch (err) {
            console.error('Error in voice answer handler:', err);
            askCitizenToRepeat('সার্ভার প্রসেসিংয়ে সমস্যা হয়েছে। অনুগ্রহ করে আবার বলুন।');
        } finally {
            setIsProcessing(false);
            setEditingField(false);
        }
    };

    // Helper: Generate Formal Administrative Letter
    const generateFormalLetterDraft = async (dataToUse) => {
        try {
            const evidenceCount = uploadedFiles.length + evidenceItems.length;
            const evidenceNote = evidenceCount > 0 
                ? `${evidenceCount}টি অকাট্য প্রমাণপত্র (ছবি/ভিডিও/নথি) সংযুক্ত করা হয়েছে` 
                : 'মৌখিক বিবরণ ও সরেজমিন তদন্ত সাপেক্ষ';

            const res = await fetch('/api/ai/generate-formal-letter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    category_id: dataToUse.categoryId,
                    office_name: dataToUse.officeName || 'সংশ্লিষ্ট কর্তৃপক্ষ',
                    officer_name: dataToUse.officerName || 'দায়িত্বপ্রাপ্ত কর্মকর্তা',
                    officer_designation: dataToUse.officerDesignation || 'দপ্তর প্রধান',
                    is_person_unknown: dataToUse.isPersonUnknown,
                    incident_location: dataToUse.incidentLocation || dataToUse.districtName,
                    incident_time: dataToUse.incidentTime || 'সাম্প্রতিক সময়ে',
                    description: dataToUse.synthesizedDescription || dataToUse.title,
                    remedy_requested: dataToUse.remedyRequested,
                    evidence_statement: evidenceNote,
                    complainant_name: dataToUse.isAnonymous ? 'গোপন নাগরিক (পরিচয় গোপন রাখা হয়েছে)' : dataToUse.complainantName,
                    complainant_phone: dataToUse.isAnonymous ? '০১৭XXXXXXXX' : dataToUse.complainantPhone,
                })
            });

            const result = await res.json();
            if (result.success && result.formal_letter) {
                setComplaintData((prev) => ({
                    ...prev,
                    formalLetter: result.formal_letter,
                    title: result.title || prev.title,
                }));
            }
        } catch (err) {
            console.error('Error generating formal letter:', err);
        }
    };

    // =========================================================================
    // 6. Final Submission Pipeline
    // =========================================================================
    const handleFinalSubmit = async () => {
        stopListening();
        stopSpeaking();
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('category_id', complaintData.categoryId || 1);
            formData.append('division_id', complaintData.divisionId || 5);
            formData.append('district_id', complaintData.districtId || 43);
            formData.append('upazila_id', complaintData.upazilaId || '');
            formData.append('office_id', complaintData.officeId || '');
            formData.append('title', complaintData.title || 'নাগরিক ভয়েস অভিযোগ');
            formData.append('description', complaintData.synthesizedDescription || complaintData.title || 'নাগরিক অভিযোগ');
            formData.append('priority', 'high');
            formData.append('is_anonymous', complaintData.isAnonymous ? '1' : '0');
            formData.append('complainant_name', complaintData.complainantName || 'সচেতন নাগরিক');
            formData.append('complainant_phone', complaintData.complainantPhone || '01700000000');
            formData.append('formal_letter', complaintData.formalLetter || '');
            formData.append('remedy_requested', complaintData.remedyRequested || 'সরেজমিন পরিদর্শন ও যথাযথ প্রতিকার');
            formData.append('user_consent', '1');

            // Attach all uploaded evidence files (photos, videos up to 40MB+, etc.)
            uploadedFiles.forEach(item => {
                if (item.file) {
                    formData.append('attachments[]', item.file);
                }
            });

            // Any items from props
            evidenceItems
                .filter((it) => it.type === 'file' && it.file)
                .forEach((it) => formData.append('attachments[]', it.file));

            const res = await fetch('/api/ai/submit-complaint', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData
            });

            const result = await res.json();

            if (result.success) {
                setSubmissionReceipt(result.receipt);
                setVoiceStep(10);

                const victorySpeech = `অভিনন্দন স্যার! আপনার অভিযোগটি সফলভাবে দাখিল হয়েছে। আপনার ডিজিটাল ট্র্যাকিং কোড হলো ${result.tracking_id}। এই কোডটি দিয়ে আপনি ট্র্যাকিং পেজে অগ্রগতি দেখতে পারবেন। ধন্যবাদ!`;
                speakTextWithRealisticVoice(victorySpeech);
            } else {
                alert(result.message || 'অভিযোগ দাখিলে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
            }
        } catch (err) {
            console.error('Submission error:', err);
            alert('সার্ভার সংযোগ ত্রুটি। পুনরায় চেষ্টা করুন।');
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedReceipt(true);
        setTimeout(() => setCopiedReceipt(false), 2500);
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none overflow-hidden">
            
            {/* Top Interactive Audio Control Bar */}
            <div className="bg-slate-950/80 backdrop-blur-md px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className={`w-3.5 h-3.5 rounded-full ${isAiSpeaking ? 'bg-emerald-500 animate-ping' : isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`} />
                        <div className={`absolute inset-0 w-3.5 h-3.5 rounded-full ${isAiSpeaking ? 'bg-emerald-500' : isListening ? 'bg-red-500' : 'bg-blue-500'}`} />
                    </div>
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                            {isAiSpeaking ? 'এআই কথা বলছে...' : isListening ? 'আপনার কথা শুনছে...' : 'স্মার্ট ভয়েস সহকারী প্রস্তুত'}
                        </span>
                        <div className="text-[11px] text-slate-400">
                            ধাপ {voiceStep + 1} / ১১ — {currentConfig.title}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Natural Voice Engine Toggle */}
                    <button
                        type="button"
                        onClick={() => setVoiceEngine(prev => prev === 'natural' ? 'stream' : 'natural')}
                        title="কণ্ঠস্বর মোড পরিবর্তন করুন"
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                            voiceEngine === 'natural' 
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        }`}
                    >
                        <Radio className="w-3 h-3" />
                        <span>{voiceEngine === 'natural' ? 'ন্যাচারাল কণ্ঠস্বর' : 'স্ট্রিমিং অডিও'}</span>
                    </button>

                    {/* Replay Question */}
                    <button
                        type="button"
                        onClick={() => speakTextWithRealisticVoice(currentConfig.spokenText)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="প্রশ্নটি আবার শুনুন"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Mute/Unmute */}
                    <button
                        type="button"
                        onClick={() => {
                            if (!isMuted) stopSpeaking();
                            setIsMuted(!isMuted);
                        }}
                        className={`p-1.5 rounded-lg transition ${isMuted ? 'text-red-400 bg-red-950/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        title={isMuted ? 'আনমিউট করুন' : 'মিউট করুন'}
                    >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    {/* Switch to Form Mode */}
                    <button
                        type="button"
                        onClick={() => {
                            stopSpeaking();
                            stopListening();
                            onSwitchToWizard();
                        }}
                        className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 border border-slate-700"
                    >
                        <Edit3 className="w-3 h-3" />
                        <span>লিখিত ফর্ম</span>
                    </button>
                </div>
            </div>

            {/* Main Interactive Stage */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                
                {/* Visual Mascot & Spoken Prompt Banner */}
                <div className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                            {isAiSpeaking ? (
                                <Volume2 className="w-6 h-6 text-white animate-pulse" />
                            ) : isListening ? (
                                <Mic className="w-6 h-6 text-white animate-bounce" />
                            ) : (
                                <Sparkles className="w-6 h-6 text-white" />
                            )}
                        </div>

                        <div className="flex-1 space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                                    নাগরিক হেল্পডেস্ক সহকারী
                                </span>
                                {isAiSpeaking && (
                                    <span className="flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                        কথা বলছেন...
                                    </span>
                                )}
                            </div>
                            <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
                                {currentConfig.spokenText}
                            </p>
                            <p className="text-xs text-slate-400 italic pt-1">
                                {currentConfig.hint}
                            </p>
                        </div>
                    </div>
                </div>

                {/* DYNAMIC STEP CONTENT & VISUAL INTERACTIVE CARDS */}

                {/* STEP 0: কুশলবিনিময় (Greeting) */}
                {voiceStep === 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => handleConfirmAnswer('হ্যাঁ, অভিযোগ জানাতে চাই')}
                            className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 p-4 rounded-xl text-left transition group shadow-lg cursor-pointer"
                        >
                            <div className="text-emerald-400 font-semibold text-sm mb-1">জি, অভিযোগ জানাতে চাই</div>
                            <div className="text-xs text-slate-300">নাগরিক সেবা বা অনিয়ম নিয়ে নতুন অভিযোগ দাখিল শুরু করুন।</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleConfirmAnswer('হ্যালো, কেমন আছেন')}
                            className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 p-4 rounded-xl text-left transition group shadow cursor-pointer"
                        >
                            <div className="text-slate-200 font-semibold text-sm mb-1">হ্যালো / কেমন আছেন?</div>
                            <div className="text-xs text-slate-400">এআই সহকারীর সাথে সালাম ও স্বাভাবিক কুশলবিনিময় করুন।</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleConfirmAnswer('পরামর্শ বা তথ্য চাই')}
                            className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 p-4 rounded-xl text-left transition group shadow cursor-pointer"
                        >
                            <div className="text-slate-200 font-semibold text-sm mb-1">পরামর্শ বা তথ্য প্রয়োজন</div>
                            <div className="text-xs text-slate-400">সরকারি নিয়ম, ক্ষতিপূরণ বা নাগরিক অধিকার নিয়ে জানুন।</div>
                        </button>
                    </div>
                )}

                {/* STEP 1: ক্যাটাগরি কার্ডসমূহ (Numbered 1-8) */}
                {voiceStep === 1 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                            <span>মুখে নম্বর বলুন (যেমন: "১" বা "২") অথবা ক্লিক করুন:</span>
                            <span className="text-emerald-400 font-medium">৮টি বিভাগীয় ক্যাটাগরি</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {CATEGORY_OPTIONS.map((cat) => {
                                const IconComponent = cat.icon;
                                const isSelected = complaintData.categoryId === cat.id;
                                return (
                                    <button
                                        key={cat.num}
                                        type="button"
                                        onClick={() => handleConfirmAnswer(cat.name)}
                                        className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between group relative overflow-hidden cursor-pointer ${
                                            isSelected 
                                                ? 'bg-emerald-600/30 border-emerald-500 shadow-lg shadow-emerald-500/20' 
                                                : 'bg-slate-800/60 hover:bg-slate-700/60 border-slate-700/80'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between w-full mb-2">
                                            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center">
                                                {cat.numBn}
                                            </span>
                                            <IconComponent className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition">
                                                {cat.name}
                                            </div>
                                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                                {cat.desc}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* STEP 2: বিভাগ নির্বাচন কার্ডসমূহ (1-8) */}
                {voiceStep === 2 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                            <span>মুখে বলুন (যেমন: "চট্টগ্রাম", "বরিশাল" বা "২"):</span>
                            <span className="text-emerald-400 font-medium">বাংলাদেশ ৮টি বিভাগ</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {DIVISION_OPTIONS.map((div) => {
                                const isSelected = complaintData.divisionId === div.id;
                                return (
                                    <button
                                        key={div.num}
                                        type="button"
                                        onClick={() => handleConfirmAnswer(div.name)}
                                        className={`p-3 rounded-xl border text-center transition group cursor-pointer ${
                                            isSelected 
                                                ? 'bg-emerald-600/30 border-emerald-500 shadow-md shadow-emerald-500/20' 
                                                : 'bg-slate-800/60 hover:bg-slate-700/60 border-slate-700/80'
                                        }`}
                                    >
                                        <div className="w-6 h-6 mx-auto rounded-full bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center mb-1 group-hover:bg-emerald-500 group-hover:text-white transition">
                                            {div.numBn}
                                        </div>
                                        <div className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition">
                                            {div.name}
                                        </div>
                                        <div className="text-[10px] text-slate-400">{div.en}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* STEP 3: জেলা ও উপজেলা চিপস */}
                {voiceStep === 3 && (
                    <div className="space-y-3">
                        <div className="text-xs text-slate-400">
                            নির্বাচিত বিভাগ: <span className="text-emerald-400 font-semibold">{complaintData.divisionName || 'বিভাগ'}</span>
                        </div>
                        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-2">
                            <div className="text-xs font-medium text-slate-300">প্রস্তাবিত জেলা ও উপজেলা (মুখে বলুন বা চাপুন):</div>
                            <div className="flex flex-wrap gap-2">
                                {['বরিশাল সদর', 'কুমিল্লা আদর্শ সদর', 'ঢাকা উত্তর', 'ঢাকা দক্ষিণ', 'চট্টগ্রাম সদর', 'বগুড়া সদর', 'খুলনা সদর', 'সিলেট সদর', 'উজিরপুর', 'চান্দিনা', 'রূপাতলী'].map((loc) => (
                                    <button
                                        key={loc}
                                        type="button"
                                        onClick={() => handleConfirmAnswer(loc)}
                                        className="text-xs px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-emerald-600/30 hover:border-emerald-500/50 border border-slate-600 text-slate-200 transition cursor-pointer"
                                    >
                                        📍 {loc}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: দপ্তর ও কর্মকর্তা চিপস */}
                {voiceStep === 4 && (
                    <div className="space-y-3">
                        <div className="text-xs text-slate-400">
                            অভিযোগের বিষয়: <span className="text-emerald-400 font-semibold">{complaintData.categoryName}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <button
                                type="button"
                                onClick={() => handleConfirmAnswer('পল্লী বিদ্যুৎ সমিতি / বিদ্যুৎ অফিস')}
                                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left transition cursor-pointer"
                            >
                                <div className="text-xs font-semibold text-slate-200">পল্লী বিদ্যুৎ সমিতি / বিদ্যুৎ উন্নয়ন বোর্ড</div>
                                <div className="text-[11px] text-slate-400">বিদ্যুৎ সংক্রান্ত সমস্যার সংশ্লিষ্ট অফিস</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleConfirmAnswer('উপজেলা ভূমি অফিস / এসি ল্যান্ড')}
                                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left transition cursor-pointer"
                            >
                                <div className="text-xs font-semibold text-slate-200">উপজেলা ভূমি অফিস / এসি ল্যান্ড</div>
                                <div className="text-[11px] text-slate-400">নামজারি, পর্চা বা ভূমি বিরোধ</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleConfirmAnswer('নির্দিষ্ট নাম জানা নেই (দপ্তরের বিরুদ্ধে)')}
                                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left transition cursor-pointer"
                            >
                                <div className="text-xs font-semibold text-slate-200">নির্দিষ্ট নাম জানা নেই</div>
                                <div className="text-[11px] text-slate-400">দপ্তর প্রধান বা সংশ্লিষ্ট শাখা প্রধানের বরাবরে</div>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 5: ঘটনার মূল বিবরণ ও ভোগান্তি (ধারাবাহিক মোড - পর্যাপ্ত সময়) */}
                {voiceStep === 5 && (
                    <div className="space-y-4">
                        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5 flex items-start gap-2.5">
                            <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-emerald-200 leading-relaxed">
                                <span className="font-semibold text-emerald-300">পর্যাপ্ত সময় দেওয়া হয়েছে:</span> আপনি শান্তভাবে যত সময় ইচ্ছা কথা বলুন। কথা বলার মাঝে বিরতি নিলেও রেকর্ড বন্ধ হবে না। পুরো বর্ণনা শেষ হলে নিচে <strong>"পরবর্তী ধাপ"</strong> বাটনে চাপ দিন।
                            </div>
                        </div>

                        {/* Live Accumulating Text Area */}
                        <div className="bg-slate-950/80 border border-slate-700 rounded-2xl p-4 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                                <span>লাইভ বিবরণ (রেকর্ড হচ্ছে):</span>
                                <span className="text-emerald-400 font-mono text-[11px]">
                                    {accumulatedTextRef.current.length || currentTranscript.length} অক্ষর
                                </span>
                            </div>
                            <textarea
                                rows={4}
                                value={tempInputValue || currentTranscript || accumulatedTextRef.current}
                                onChange={(e) => {
                                    setTempInputValue(e.target.value);
                                    accumulatedTextRef.current = e.target.value;
                                }}
                                placeholder="আপনার বিবরণটি এখানে রিয়েল-টাইমে লেখা হবে... অথবা হাত দিয়ে টাইপও করতে পারেন..."
                                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 outline-none leading-relaxed"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => handleConfirmAnswer(tempInputValue || currentTranscript || accumulatedTextRef.current)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                            >
                                <span>বিবরণ সম্পন্ন (পরবর্তী ধাপে যান)</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 6: প্রমাণক ও নথিপত্র সংযুক্তকরণ (ছবি, ভিডিও সর্বোচ্চ ৪০ MB, ডকুমেন্ট) */}
                {voiceStep === 6 && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
                            <UploadCloud className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                            <div className="space-y-1 text-xs">
                                <div className="font-semibold text-blue-200">প্রমাণাদি আপলোড (ঐচ্ছিক কিন্তু শক্তিশালী):</div>
                                <p className="text-slate-300 leading-relaxed">
                                    ঘটনার ছবি, কোনো কাগজের ছবি, অডিও রেকর্ড অথবা <strong>ভিডিও ক্লিপ (সর্বোচ্চ ৪০ মেগাবাইট)</strong> আপলোড করতে পারেন। প্রমাণ না থাকলে সরাসরি এগিয়ে যেতে পারেন।
                                </p>
                            </div>
                        </div>

                        {/* Hidden File Input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,video/*,audio/*,application/pdf,.doc,.docx"
                            className="hidden"
                            onChange={handleFileSelect}
                        />

                        {/* Drag and Drop / Click Area */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-950/60 hover:bg-slate-900/60 rounded-2xl p-6 text-center transition cursor-pointer group space-y-2"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                                <UploadCloud className="w-6 h-6" />
                            </div>
                            <div className="text-sm font-semibold text-slate-200 group-hover:text-emerald-300 transition">
                                ফাইল নির্বাচন করুন বা এখানে টেনে এনে ছাড়ুন
                            </div>
                            <div className="text-xs text-slate-400">
                                ছবি (JPG, PNG) • <strong>ভিডিও (MP4, WebM — সর্বোচ্চ ৪০ MB)</strong> • পিডিএফ বা অডিও
                            </div>
                        </div>

                        {fileUploadError && (
                            <div className="text-xs text-red-300 bg-red-950/40 border border-red-500/30 p-2 rounded-lg">
                                {fileUploadError}
                            </div>
                        )}

                        {/* Uploaded Files List */}
                        {uploadedFiles.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-xs font-semibold text-slate-300">
                                    সংযুক্ত প্রমাণাদি ({uploadedFiles.length}টি):
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {uploadedFiles.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs"
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                {item.type === 'video' ? <Video className="w-4 h-4 text-purple-400 shrink-0" />
                                                : item.type === 'image' ? <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                                                : item.type === 'audio' ? <Music className="w-4 h-4 text-yellow-400 shrink-0" />
                                                : <FileText className="w-4 h-4 text-blue-400 shrink-0" />}
                                                <div className="truncate">
                                                    <div className="text-slate-200 font-medium truncate">{item.name}</div>
                                                    <div className="text-[10px] text-slate-400">
                                                        {item.size} MB • {item.type === 'video' ? 'ভিডিও ক্লিপ' : item.type === 'image' ? 'ছবি' : 'নথি'}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition"
                                                title="মুছে ফেলুন"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-slate-400 italic">
                                {uploadedFiles.length > 0 ? `${uploadedFiles.length}টি প্রমাণপত্র সংযুক্ত হয়েছে` : 'প্রমাণ না থাকলেও অভিযোগ দায়ের করা যাবে'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setVoiceStep(7)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                            >
                                <span>{uploadedFiles.length > 0 ? 'প্রমাণসহ পরবর্তী ধাপে যান' : 'প্রমাণ ছাড়া এগিয়ে যান'}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 7: প্রত্যাশিত প্রতিকার */}
                {voiceStep === 7 && (
                    <div className="space-y-3">
                        <div className="text-xs text-slate-400">কমন প্রতিকারসমূহ (মুখে বলুন বা সিলেক্ট করুন):</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                                'দ্রুত সংযোগ মেরামত ও স্বাভাবিক বিদ্যুৎ সরবরাহ চাই',
                                'ঘুষ দাবি ও হয়রানির নিরপেক্ষ তদন্ত এবং প্রশাসনিক ব্যবস্থা চাই',
                                'সড়ক মেরামত ও অবিলম্বে খানাখন্দ সংস্কার চাই',
                                'অবৈধ দখল উচ্ছেদ ও খতিয়ান অনুযায়ী সীমানা নির্ধারণ চাই'
                            ].map((rem) => (
                                <button
                                    key={rem}
                                    type="button"
                                    onClick={() => handleConfirmAnswer(rem)}
                                    className="p-3 rounded-xl bg-slate-800/80 hover:bg-emerald-600/20 hover:border-emerald-500/50 border border-slate-700 text-left text-xs text-slate-200 transition cursor-pointer"
                                >
                                    ⚖️ {rem}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 8: মোবাইল নম্বর ও গোপনীয়তা (বাধ্যতামূলক) */}
                {voiceStep === 8 && (
                    <div className="space-y-3">
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3.5 flex items-start gap-2.5">
                            <Phone className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-blue-200 leading-relaxed">
                                <span className="font-semibold">এসএমএস ট্র্যাকিং ও আপডেট:</span> সরকারি তদন্ত কর্মকর্তা আপনার সাথে যোগাযোগ এবং অগ্রগতির এসএমএস পাঠাতে একটি ১১ ডিজিটের মোবাইল নম্বর প্রয়োজন।
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleConfirmAnswer('পরিচয় গোপন রাখতে চাই')}
                                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left transition cursor-pointer"
                            >
                                <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs mb-1">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span>পরিচয় সম্পূর্ণ গোপন রাখুন</span>
                                </div>
                                <div className="text-[11px] text-slate-400">আপনার নাম ও নম্বর প্রকাশ করা হবে না (বেনামী অভিযোগ)।</div>
                            </button>
                            
                            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                                <div className="text-xs font-semibold text-slate-200 mb-1">সরাসরি নম্বর টাইপ করুন:</div>
                                <div className="flex gap-2">
                                    <input
                                        type="tel"
                                        placeholder="017xxxxxxxx"
                                        value={complaintData.complainantPhone || ''}
                                        onChange={(e) => setComplaintData(prev => ({ ...prev, complainantPhone: e.target.value }))}
                                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 flex-1 focus:border-emerald-500 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleConfirmAnswer(complaintData.complainantPhone)}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                                    >
                                        নিশ্চিত
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 9: আনুষ্ঠানিক আবেদনপত্র প্রিভিউ ও চূড়ান্ত সম্মতি */}
                {voiceStep === 9 && (
                    <div className="space-y-4">
                        <div className="bg-slate-950 border border-slate-700 rounded-2xl p-5 shadow-2xl text-slate-200 text-xs font-mono space-y-3 leading-relaxed max-h-72 overflow-y-auto">
                            <div className="text-center border-b border-slate-800 pb-2">
                                <div className="font-bold text-sm text-emerald-400">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
                                <div className="text-[11px] text-slate-400">ডিজিটাল নাগরিক অভিযোগ ও প্রতিকার ব্যবস্থা</div>
                            </div>
                            <div className="space-y-1">
                                <div><strong>বিষয়:</strong> {complaintData.title || 'নাগরিক সেবা সংক্রান্ত অভিযোগ'}</div>
                                <div><strong>বরাবর:</strong> {complaintData.officeName || 'সংশ্লিষ্ট দপ্তর প্রধান'}</div>
                                <div><strong>এলাকা:</strong> {complaintData.incidentLocation || `${complaintData.districtName}, ${complaintData.divisionName}`}</div>
                                <div><strong>অভিযোগকারী:</strong> {complaintData.isAnonymous ? 'গোপন নাগরিক (পরিচয় সংরক্ষিত)' : complaintData.complainantName}</div>
                                <div><strong>সংযুক্ত প্রমাণ:</strong> {uploadedFiles.length > 0 ? `${uploadedFiles.length}টি প্রমাণপত্র সংযুক্ত` : 'মৌখিক বিবরণ সাপেক্ষ'}</div>
                            </div>
                            <div className="border-t border-slate-800 pt-2 whitespace-pre-wrap text-slate-300">
                                {complaintData.formalLetter || complaintData.synthesizedDescription || 'আবেদনপত্রের খসড়া প্রস্তুত হচ্ছে...'}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setVoiceStep(5)}
                                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>তথ্য সংশোধন করতে চাই</span>
                            </button>

                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleFinalSubmit}
                                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>দাখিল হচ্ছে...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>হ্যাঁ, এখনই আবেদন দাখিল করুন</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 10: সফল দাখিল ও ডিজিটাল রসিদ */}
                {voiceStep === 10 && submissionReceipt && (
                    <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
                        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-500/40">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">অভিযোগ সফলভাবে দাখিল হয়েছে!</h3>
                            <p className="text-xs text-emerald-300">আপনার ডিজিটাল অভিযোগপত্র সরকারি নথিতে তালিকাভুক্ত করা হয়েছে।</p>
                        </div>

                        <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 inline-flex items-center gap-3">
                            <span className="text-xs text-slate-400">ট্র্যাকিং কোড:</span>
                            <span className="text-lg font-mono font-bold text-emerald-400">{submissionReceipt.tracking_id}</span>
                            <button
                                type="button"
                                onClick={() => copyToClipboard(submissionReceipt.tracking_id)}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                                title="কপি করুন"
                            >
                                {copiedReceipt ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="flex justify-center gap-3 pt-2">
                            <a
                                href={`/track?id=${submissionReceipt.tracking_id}`}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg font-medium transition flex items-center gap-1.5"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>ট্র্যাকিং পেজে যান</span>
                            </a>
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-lg transition cursor-pointer"
                            >
                                বন্ধ করুন
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* Bottom Real-time Spoken Transcript & Mic Action Bar */}
            {voiceStep < 10 && (
                <div className="bg-slate-950 px-5 py-4 border-t border-slate-800 flex flex-col gap-3">
                    
                    {/* Live Capturing Bubble */}
                    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${isListening ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`} />
                        <div className="flex-1 overflow-hidden">
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                                {isListening ? 'আপনার কথা ধারাবাহিকভাবে রেকর্ড হচ্ছে:' : 'আপনার ইনপুট:'}
                            </div>
                            <div className="text-xs text-slate-200 truncate font-medium">
                                {tempInputValue || currentTranscript || accumulatedTextRef.current || currentConfig.shortPrompt}
                            </div>
                        </div>

                        {/* Text input fallback for noisy room */}
                        {editingField ? (
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="text"
                                    value={tempInputValue}
                                    onChange={(e) => setTempInputValue(e.target.value)}
                                    placeholder="টাইপ করুন..."
                                    className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none w-36"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleConfirmAnswer(tempInputValue);
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleConfirmAnswer(tempInputValue)}
                                    className="p-1 rounded bg-emerald-600 text-white cursor-pointer"
                                >
                                    <Send className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setEditingField(true)}
                                className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                            >
                                টাইপ করুন
                            </button>
                        )}
                    </div>

                    {/* Mic Button & Step Navigation */}
                    <div className="flex items-center justify-between gap-3">
                        {voiceStep > 0 ? (
                            <button
                                type="button"
                                onClick={() => setVoiceStep(prev => Math.max(0, prev - 1))}
                                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>পূর্ববর্তী ধাপ</span>
                            </button>
                        ) : <div />}

                        {/* Giant Central Voice Listening Button */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    if (isListening) {
                                        stopListening();
                                        if (accumulatedTextRef.current || currentTranscript || tempInputValue) {
                                            handleConfirmAnswer(accumulatedTextRef.current || currentTranscript || tempInputValue);
                                        }
                                    } else {
                                        startListening();
                                    }
                                }}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-xl cursor-pointer ${
                                    isListening 
                                        ? 'bg-red-500 hover:bg-red-600 text-white ring-4 ring-red-500/30 animate-pulse' 
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                                }`}
                                title={isListening ? 'কথা বলা শেষ (নিশ্চিত করুন)' : 'কথা বলতে চাপুন'}
                            >
                                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                            </button>
                        </div>

                        {/* Forward / Confirm button */}
                        <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleConfirmAnswer(tempInputValue || currentTranscript || accumulatedTextRef.current)}
                            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 hover:border-emerald-500 transition cursor-pointer"
                        >
                            <span>পরবর্তী ধাপ</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {audioError && (
                        <div className="text-[11px] text-amber-300 text-center bg-amber-950/40 border border-amber-500/30 py-1 px-2 rounded">
                            {audioError}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
