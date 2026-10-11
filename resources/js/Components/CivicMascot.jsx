import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { 
    Send, 
    Search, 
    Sparkles, 
    CheckCircle2, 
    ShieldCheck, 
    ChevronRight, 
    Volume2, 
    HeartHandshake,
    MessageCircleQuestion,
    Bot
} from 'lucide-react';

export default function CivicMascot({ className = '', onOpenAiAssistant }) {
    const [dialogueIndex, setDialogueIndex] = useState(0);
    const [isHappy, setIsHappy] = useState(false);
    const [clickCount, setClickCount] = useState(0);

    const dialogues = [
        {
            tag: 'স্বাগতম',
            title: 'আমি আপনার "নাগরিক বন্ধু"',
            text: 'এলাকায় ড্রেনেজ, ভাঙা রাস্তা, বাতি বা হাসপাতালে ভোগান্তি? আমাকে জানান, দ্রুত সমাধান নিন!',
            badge: 'নাগরিক সহায়ক'
        },
        {
            tag: 'সহজ প্রক্রিয়া',
            title: '৩ মিনিটেই অভিযোগ দাখিল',
            text: 'কোনো অফিসে ঘোরাঘুরি লাগবে না—মোবাইল থেকেই ছবিসহ সরাসরি অভিযোগ জমা দিন।',
            badge: '১০০% অনলাইন'
        },
        {
            tag: 'লাইভ নজরদারি',
            title: 'প্রতি মুহূর্তের লাইভ ট্র্যাকিং',
            text: 'অভিযোগ জমা দিলেই পাবেন ট্র্যাকিং আইডি। কর্মকর্তা কী ব্যবস্থা নিচ্ছেন নিজেই দেখুন!',
            badge: 'স্বচ্ছ জবাবদিহিতা'
        },
        {
            tag: 'দায়িত্বশীল কর্মকর্তা',
            title: 'সরাসরি অফিসারের টেবিলে',
            text: 'কোনো দালাল বা ফি ছাড়া আপনার বক্তব্য পৌঁছাবে সংশ্লিষ্ট নির্বাহী কর্মকর্তার কাছে।',
            badge: 'সুরক্ষিত তথ্য'
        },
        {
            tag: 'আপনার অধিকার',
            title: 'সমাধান শেষে রেটিং দিন',
            text: 'কাজ সম্পন্ন হলে আপনি সন্তুষ্ট কিনা রেটিং দিয়ে সুশাসন প্রতিষ্ঠায় অংশীদার হোন।',
            badge: 'নাগরিক সন্তুষ্টি'
        }
    ];

    // Automatic speech bubble rotation every 3.8 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setDialogueIndex((prev) => (prev + 1) % dialogues.length);
        }, 3800);

        return () => clearInterval(timer);
    }, [dialogues.length]);

    const handleMascotClick = () => {
        setIsHappy(true);
        setClickCount((prev) => prev + 1);
        setDialogueIndex((prev) => (prev + 1) % dialogues.length);

        setTimeout(() => {
            setIsHappy(false);
        }, 1200);
    };

    const currentDialogue = dialogues[dialogueIndex];

    return (
        <div className={`relative bg-gradient-to-b from-white/95 via-emerald-50/50 to-teal-50/70 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-emerald-200/80 shadow-2xl shadow-emerald-950/10 overflow-hidden ${className}`}>
            {/* Ambient Background Aura */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-teal-400/20 rounded-full blur-2xl pointer-events-none"></div>

            {/* Top Helper Badge */}
            <div className="flex items-center justify-between gap-2 mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300/80 text-xs font-bold shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>নাগরিক বন্ধু (ভার্চুয়াল গাইড)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>সক্রিয় সহায়ক</span>
                </div>
            </div>

            {/* Dynamic Animated Speech Bubble */}
            <div className="relative mb-5 z-20">
                <div 
                    key={dialogueIndex}
                    className="relative bg-white/95 border-2 border-emerald-300/90 rounded-2xl p-3.5 sm:p-4 shadow-lg shadow-emerald-900/5 animate-speech-pop"
                >
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                            <Volume2 className="w-3 h-3 text-emerald-600 animate-pulse" />
                            {currentDialogue.tag}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                            {dialogueIndex + 1}/{dialogues.length}
                        </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span>{currentDialogue.title}</span>
                        {isHappy && <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />}
                    </h4>

                    <p className="text-xs sm:text-xs text-slate-600 leading-relaxed font-normal mt-1">
                        {currentDialogue.text}
                    </p>

                    {/* Speech Bubble Arrow pointing to Mascot */}
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-emerald-300/90 rotate-45"></div>
                </div>
            </div>

            {/* The Animated Cartoon Character Stage */}
            <div 
                onClick={handleMascotClick}
                className="relative flex items-center justify-center cursor-pointer group py-2 select-none"
                title="নাগরিক বন্ধুকে ট্যাপ করুন!"
            >
                {/* Floating Orbiting Badges */}
                <div className="absolute left-0 top-6 hidden sm:flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-emerald-200 shadow-md text-[10px] font-bold text-slate-800 animate-float-gentle z-10 pointer-events-none">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>দ্রুত সমাধান</span>
                </div>

                <div className="absolute right-0 bottom-8 hidden sm:flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-teal-200 shadow-md text-[10px] font-bold text-slate-800 animate-float-reverse z-10 pointer-events-none">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>বিনামূল্যে সেবা</span>
                </div>

                {/* SVG Mascot Character */}
                <div className={`relative transition-transform duration-300 ${isHappy ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <svg
                        viewBox="0 0 280 280"
                        className="w-52 h-52 sm:w-64 sm:h-64 drop-shadow-xl animate-mascot-bob"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            {/* Gradients for rich textures */}
                            <linearGradient id="bodySkin" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fed7aa" />
                                <stop offset="100%" stopColor="#fbcfe8" />
                            </linearGradient>
                            <linearGradient id="govGreenVest" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#047857" />
                                <stop offset="50%" stopColor="#065f46" />
                                <stop offset="100%" stopColor="#064e3b" />
                            </linearGradient>
                            <linearGradient id="hairDark" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#1e293b" />
                                <stop offset="100%" stopColor="#0f172a" />
                            </linearGradient>
                            <linearGradient id="tabletScreen" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#ecfdf5" />
                                <stop offset="100%" stopColor="#d1fae5" />
                            </linearGradient>
                            <linearGradient id="goldBadge" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fbbf24" />
                                <stop offset="100%" stopColor="#d97706" />
                            </linearGradient>
                            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* Shadow underneath */}
                        <ellipse cx="140" cy="265" rx="65" ry="12" fill="#064e3b" opacity="0.12" />

                        {/* Torso / Clothes */}
                        {/* White inner shirt */}
                        <path d="M105 180 L175 180 L185 240 L95 240 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                        <polygon points="140,195 125,180 155,180" fill="#f1f5f9" />
                        {/* Red emblem tie or gold emblem button */}
                        <circle cx="140" cy="190" r="4" fill="#ef4444" />

                        {/* Government Green Waistcoat (মুজিব ভেস্ট / স্মার্ট সিভিক ভেস্ট) */}
                        <path 
                            d="M95 185 C95 185, 115 180, 128 195 L128 245 L88 245 C86 220, 88 200, 95 185 Z" 
                            fill="url(#govGreenVest)" 
                            stroke="#047857" 
                            strokeWidth="1.5" 
                        />
                        <path 
                            d="M185 185 C185 185, 165 180, 152 195 L152 245 L192 245 C194 220, 192 200, 185 185 Z" 
                            fill="url(#govGreenVest)" 
                            stroke="#047857" 
                            strokeWidth="1.5" 
                        />

                        {/* Official Golden Service Badge on Chest */}
                        <g className="animate-badge-pulse" style={{ transformOrigin: '112px 208px' }}>
                            <circle cx="112" cy="208" r="9" fill="url(#goldBadge)" stroke="#fef08a" strokeWidth="1.5" />
                            <circle cx="112" cy="208" r="5" fill="#047857" />
                            {/* Star symbol inside badge */}
                            <path d="M112 205 L113.2 207.2 L115.5 207.4 L113.8 209 L114.2 211.2 L112 210.1 L109.8 211.2 L110.2 209 L108.5 207.4 L110.8 207.2 Z" fill="#fef08a" />
                        </g>

                        {/* Neck */}
                        <rect x="127" y="162" width="26" height="22" rx="4" fill="url(#bodySkin)" />

                        {/* Left Arm & Digital Complaint Tablet / Clipboard */}
                        <g className="animate-mascot-tablet">
                            {/* Left upper arm */}
                            <path d="M178 188 C195 198, 205 210, 202 228" stroke="#047857" strokeWidth="16" strokeLinecap="round" />
                            {/* Tablet device */}
                            <g transform="rotate(-8 190 220)">
                                <rect x="180" y="195" width="56" height="66" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                                <rect x="184" y="200" width="48" height="56" rx="5" fill="url(#tabletScreen)" />
                                {/* Header bar on tablet */}
                                <rect x="188" y="204" width="40" height="5" rx="2" fill="#059669" />
                                {/* Complaint Lines on tablet screen */}
                                <rect x="188" y="213" width="28" height="3" rx="1.5" fill="#64748b" />
                                <rect x="188" y="219" width="34" height="3" rx="1.5" fill="#94a3b8" />
                                <rect x="188" y="225" width="22" height="3" rx="1.5" fill="#94a3b8" />
                                {/* Big Green Verified Tick Mark */}
                                <circle cx="216" cy="242" r="7" fill="#10b981" />
                                <path d="M213 242 L215.5 244.5 L220 239.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            {/* Left Hand holding tablet */}
                            <circle cx="188" cy="226" r="8" fill="url(#bodySkin)" />
                        </g>

                        {/* Right Arm: Waving Merrily (Hand Wave Animation) */}
                        <g className="animate-mascot-wave">
                            {/* Arm going up */}
                            <path d="M96 190 C78 178, 62 152, 68 128" stroke="#047857" strokeWidth="16" strokeLinecap="round" />
                            {/* Forearm */}
                            <path d="M68 128 L64 105" stroke="#047857" strokeWidth="14" strokeLinecap="round" />
                            {/* Waving Palm */}
                            <g transform="translate(48, 80)">
                                {/* Friendly Palm */}
                                <circle cx="16" cy="18" r="13" fill="url(#bodySkin)" />
                                {/* Fingers */}
                                <rect x="8" y="4" width="5" height="12" rx="2.5" fill="url(#bodySkin)" />
                                <rect x="14" y="1" width="5" height="15" rx="2.5" fill="url(#bodySkin)" />
                                <rect x="20" y="3" width="5" height="13" rx="2.5" fill="url(#bodySkin)" />
                                <rect x="25" y="8" width="5" height="10" rx="2.5" fill="url(#bodySkin)" />
                                {/* Thumb */}
                                <rect x="4" y="14" width="7" height="5" rx="2.5" fill="url(#bodySkin)" transform="rotate(-25 4 14)" />
                                {/* Motion wind wave lines */}
                                <path d="M-6 8 C-3 2, -2 -2, 2 -5" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
                                <path d="M32 0 C36 4, 38 9, 36 15" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
                            </g>
                        </g>

                        {/* Head */}
                        <g>
                            {/* Face Base */}
                            <ellipse cx="140" cy="120" rx="46" ry="48" fill="url(#bodySkin)" />
                            {/* Ears */}
                            <circle cx="94" cy="122" r="9" fill="url(#bodySkin)" />
                            <circle cx="186" cy="122" r="9" fill="url(#bodySkin)" />

                            {/* Hair */}
                            <path 
                                d="M93 115 C90 85, 110 60, 140 60 C170 60, 190 85, 187 115 C176 102, 168 102, 155 106 C145 98, 125 96, 115 106 C105 102, 98 106, 93 115 Z" 
                                fill="url(#hairDark)" 
                            />
                            {/* Hair Tufts / Quiff */}
                            <path d="M135 60 C140 48, 152 46, 156 52 C150 56, 145 58, 135 60 Z" fill="#334155" />

                            {/* Friendly Eyes with Blinking Animation */}
                            <g className="animate-mascot-blink">
                                {/* Left Eye */}
                                <ellipse cx="123" cy="118" rx="7.5" ry="9" fill="#0f172a" />
                                <circle cx="121" cy="115" r="2.8" fill="#ffffff" />
                                <circle cx="125" cy="120" r="1.4" fill="#ffffff" />

                                {/* Right Eye */}
                                <ellipse cx="157" cy="118" rx="7.5" ry="9" fill="#0f172a" />
                                <circle cx="155" cy="115" r="2.8" fill="#ffffff" />
                                <circle cx="159" cy="120" r="1.4" fill="#ffffff" />
                            </g>

                            {/* Eyebrows (expressive, friendly) */}
                            <path d="M116 104 Q123 100 130 103" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M150 103 Q157 100 164 104" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />

                            {/* Cute Rosy Cheeks */}
                            <circle cx="112" cy="128" r="6.5" fill="#f43f5e" opacity="0.25" />
                            <circle cx="168" cy="128" r="6.5" fill="#f43f5e" opacity="0.25" />

                            {/* Nose */}
                            <ellipse cx="140" cy="124" rx="2.5" ry="2" fill="#f97316" opacity="0.4" />

                            {/* Smiling Mouth */}
                            <path 
                                d="M131 133 Q140 144 149 133" 
                                fill="#881337" 
                                stroke="#881337" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                            />
                            {/* Tongue */}
                            <path d="M136 138 Q140 142 144 138" fill="#fb7185" />

                            {/* Modern Support Headset with glowing cyan LED mic */}
                            <path 
                                d="M94 116 C92 78, 188 78, 186 116" 
                                stroke="#334155" 
                                strokeWidth="4.5" 
                                strokeLinecap="round" 
                                fill="none" 
                            />
                            {/* Left earphone pad */}
                            <rect x="88" y="112" width="7" height="15" rx="3.5" fill="#0f172a" stroke="#059669" strokeWidth="1" />
                            {/* Right earphone pad */}
                            <rect x="185" y="112" width="7" height="15" rx="3.5" fill="#0f172a" stroke="#059669" strokeWidth="1" />
                            {/* Headset Mic boom curving towards mouth */}
                            <path d="M188 123 Q184 144 158 141" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                            {/* Cyan LED on mic tip */}
                            <circle cx="156" cy="141" r="3" fill="#06b6d4" className="animate-ping" opacity="0.75" />
                            <circle cx="156" cy="141" r="3" fill="#0891b2" />
                        </g>
                    </svg>

                    {/* Interactive Click Sparkle Banner */}
                    {isHappy && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 font-extrabold text-xs px-3 py-1 rounded-full shadow-lg animate-bounce whitespace-nowrap">
                            ধন্যবাদ! আমি সব সময় পাশে আছি ✨
                        </div>
                    )}
                </div>
            </div>

            {/* Primary AI Complaint Assistant Button */}
            <div className="mt-3">
                <button
                    type="button"
                    onClick={onOpenAiAssistant}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 hover:from-emerald-900 hover:to-slate-950 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-950/20 border border-emerald-400/40 hover:scale-[1.02] active:scale-95 transition-all animate-shimmer"
                >
                    <Bot className="w-4 h-4 text-emerald-300 animate-pulse" />
                    <span>AI সহকারীর সাথে অভিযোগ করুন</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </button>
            </div>

            {/* Quick Interactive Prompt Under Mascot */}
            <div className="text-center mt-2.5">
                <button
                    type="button"
                    onClick={handleMascotClick}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 hover:text-emerald-900 bg-white/80 hover:bg-white px-3 py-1 rounded-full border border-emerald-200 shadow-2xs transition-all active:scale-95"
                >
                    <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                    <span>কথা বলুন বা পরবর্তী টিপস দেখুন</span>
                    <ChevronRight className="w-3 h-3 text-emerald-600" />
                </button>
            </div>

            {/* Secondary Dual Action Buttons */}
            <div className="mt-3 pt-3 border-t border-emerald-200/70 grid grid-cols-2 gap-2 sm:gap-2.5">
                <Link
                    href="/submit"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 font-bold text-xs border border-slate-200/90 shadow-2xs transition-all active:scale-95 text-center"
                >
                    <Send className="w-3.5 h-3.5 text-emerald-700" />
                    <span>সম্পূর্ণ ফর্ম</span>
                </Link>

                <Link
                    href="/track"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 font-bold text-xs border border-slate-200/90 shadow-2xs transition-all active:scale-95 text-center"
                >
                    <Search className="w-3.5 h-3.5 text-emerald-700" />
                    <span>অগ্রগতি দেখুন</span>
                </Link>
            </div>
        </div>
    );
}
