import React, { useState, useEffect } from 'react';
import { 
    Send, 
    Search, 
    Sparkles, 
    CheckCircle2, 
    ChevronRight, 
    Volume2, 
    Bot, 
    Compass, 
    HelpCircle, 
    ArrowRight, 
    FileText, 
    Scroll, 
    Radio, 
    Cpu, 
    Zap,
    Mail
} from 'lucide-react';

export default function HumanoidAiAssistant({ className = '', onOpenAiAssistant }) {
    const [selectedGuide, setSelectedGuide] = useState('welcome');
    const [isTalking, setIsTalking] = useState(false);

    const guides = {
        welcome: {
            title: 'আসসালামু আলাইকুম! আমি "বার্তাবাহক"',
            subtitle: 'প্রাচীন ঐতিহ্যবাহী ডাক-রানার ধারণায় নির্মিত ডিজিটাল বার্তাবাহক রোবট',
            message: 'ঐতিহাসিক বার্তাবাহকরা যেমন দ্রুত খবর পৌঁছে দিতেন, তেমনি আমি আপনার নাগরিক অভিযোগ ও দাবির বার্তা নিরাপদে পৌঁছে দিই সরাসরি দায়িত্বশীল কর্মকর্তার ড্যাশবোর্ডে। কোনো মধ্যস্থতাকারী ছাড়া নির্ভয়ে বলুন!',
            actionText: 'AI সহকারীর সাথে বার্তা প্রস্তুত করুন',
            actionType: 'open_ai',
            badge: 'ডিজিটাল বার্তাবাহক'
        },
        submit_guide: {
            title: 'অভিযোগ বার্তা প্রেরণের ৩টি সহজ ধাপ',
            subtitle: 'ঝামেলামুক্ত দ্রুত ডিজিটাল ডিসপ্যাচ',
            message: '১. আপনার এলাকা ও সমস্যা বাছুন ➔ ২. ছবি বা প্রমাণপত্রসহ বিবরণ দিন ➔ ৩. সাবমিট করলেই অনন্য ট্র্যাকিং কোড প্রস্তুত। মুহূর্তের মধ্যেই সংশ্লিষ্ট কর্মকর্তার টেবিলে বার্তা পৌঁছে যাবে।',
            actionText: 'আবেদন ফর্ম পূরণ করুন',
            actionType: 'link_submit',
            badge: 'বার্তা প্রেরণ ধাপ'
        },
        track_guide: {
            title: 'আপনার বার্তার লাইভ নজরদারি',
            subtitle: 'স্বচ্ছ জবাবদিহিতা ও রিয়েল-টাইম তথ্য',
            message: 'আপনার ট্র্যাকিং আইডি প্রবেশ করিয়ে জেনে নিন কর্মকর্তা বর্তমানে কী পদক্ষেপ নিচ্ছেন। কাজ শেষ হলে আপনার মতামত ও সন্তুষ্টির রেটিং দিন।',
            actionText: 'লাইভ ট্র্যাকিং পেজে যান',
            actionType: 'link_track',
            badge: 'অগ্রগতি ট্র্যাকিং'
        },
        divisions_guide: {
            title: '৮টি বিভাগ ও ৬৪ জেলার ডিজিটাল ডাক নেটওয়ার্ক',
            subtitle: 'সমগ্র বাংলাদেশে সরাসরি কর্মকর্তা সংযোগ',
            message: 'পদ্মা-মেঘনা-যমুনার অববাহিকা থেকে শুরু করে চট্টগ্রাম, খুলনা, রাজশাহী, বরিশাল, সিলেট, রংপুর ও ময়মনসিংহ—দেশের যেকোনো প্রান্ত থেকেই সংশ্লিষ্ট কর্মকর্তার টেবিলে বার্তা পৌঁছাবে।',
            actionText: 'বিভাগীয় তালিকা দেখুন',
            actionType: 'scroll_divisions',
            badge: 'আঞ্চলিক নেটওয়ার্ক'
        }
    };

    const current = guides[selectedGuide] || guides.welcome;

    const handleActionClick = () => {
        if (current.actionType === 'open_ai') {
            if (onOpenAiAssistant) onOpenAiAssistant();
        } else if (current.actionType === 'link_submit') {
            window.location.href = '/submit';
        } else if (current.actionType === 'link_track') {
            window.location.href = '/track';
        } else if (current.actionType === 'scroll_divisions') {
            const el = document.getElementById('divisions');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const speakMessage = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(current.message);
            utterance.lang = 'bn-BD';
            utterance.rate = 0.95;
            utterance.onstart = () => setIsTalking(true);
            utterance.onend = () => setIsTalking(false);
            utterance.onerror = () => setIsTalking(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className={`relative bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-2xl shadow-slate-900/10 overflow-hidden ${className}`}>
            {/* Subtle Futuristic Tech Ambient Glows */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-100/50 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

            {/* Header: Cyber Status Bar */}
            <div className="flex items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                    </span>
                    <span className="text-xs font-black text-slate-800 tracking-wide flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-cyan-600" />
                        <span>ডিজিটাল বার্তাবাহক রোবট</span>
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full border border-slate-200 font-mono">
                        v2.4 লাইভ
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={speakMessage}
                        className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                            isTalking 
                                ? 'bg-cyan-50 text-cyan-800 border-cyan-300 animate-pulse'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                        title="বার্তাটি বাংলায় শুনুন"
                    >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] hidden xs:inline">শুনুন</span>
                    </button>
                </div>
            </div>

            {/* Character Presentation & Speech Bubble Section */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center mb-5">
                
                {/* Left: 3D Animated Futuristic Messenger Robot (5 Cols) */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center text-center">
                    <div className="relative group cursor-pointer animate-robot-hover" onClick={speakMessage}>
                        {/* Soft Hologram Glow around the Robot */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/30 via-emerald-400/20 to-teal-400/30 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-slate-200/90 shadow-xl bg-gradient-to-b from-slate-100 to-slate-200">
                            <img 
                                src="/images/robotic_barta_bahak.jpg" 
                                alt="ডিজিটাল বার্তাবাহক রোবো — প্রাচীন ডাক-রানার ভাবনায় আধুনিক রোবট" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>

                        {/* Floating Cyber Badge */}
                        <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md border border-cyan-400/60 flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5 text-cyan-300 animate-pulse" />
                            ডাক-রানার
                        </span>
                    </div>

                    <h4 className="mt-3 font-black text-slate-900 text-sm flex items-center justify-center gap-1">
                        <span>বার্তাবাহক রোবো</span>
                        <span className="text-cyan-600 text-xs">⚡</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">স্বয়ংক্রিয় নাগরিক দূত</p>
                </div>

                {/* Right: Dynamic Speech Bubble & Message (7 Cols) */}
                <div className="sm:col-span-7">
                    <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 shadow-sm relative">
                        {/* Speech Bubble Arrow Indicator (Desktop) */}
                        <div className="hidden sm:block absolute -left-2 top-8 w-3 h-3 bg-slate-50 border-l border-t border-slate-200/90 transform -rotate-45" />

                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-cyan-900 bg-cyan-100/70 border border-cyan-200/80 px-2 py-0.5 rounded-md inline-block font-sans">
                                {current.subtitle}
                            </span>
                            <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                {current.title}
                            </h5>
                            <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                {current.message}
                            </p>
                        </div>

                        {/* Primary Quick CTA */}
                        <div className="mt-3.5 pt-3 border-t border-slate-200/70 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleActionClick}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 border border-slate-700"
                            >
                                <span>{current.actionText}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-cyan-300" />
                            </button>

                            <span className="text-[10px] text-slate-400 font-mono">
                                ক্লিক করে জানুন
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Quick Interactive Guided Topics */}
            <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-slate-400" />
                    <span>কোন বিষয়ে দিকনির্দেশনা চান? ট্যাপ করুন:</span>
                </p>

                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <button
                        type="button"
                        onClick={() => setSelectedGuide('submit_guide')}
                        className={`p-2 rounded-xl text-left text-xs font-bold transition-all border flex items-center gap-1.5 ${
                            selectedGuide === 'submit_guide'
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                        <span className="truncate">অভিযোগের ৩ ধাপ</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedGuide('track_guide')}
                        className={`p-2 rounded-xl text-left text-xs font-bold transition-all border flex items-center gap-1.5 ${
                            selectedGuide === 'track_guide'
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                    >
                        <Search className="w-3.5 h-3.5 shrink-0 text-cyan-500" />
                        <span className="truncate">অগ্রগতি অনুসন্ধান</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedGuide('divisions_guide')}
                        className={`p-2 rounded-xl text-left text-xs font-bold transition-all border flex items-center gap-1.5 ${
                            selectedGuide === 'divisions_guide'
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                    >
                        <Compass className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                        <span className="truncate">বিভাগীয় নেটওয়ার্ক</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setSelectedGuide('welcome');
                            if (onOpenAiAssistant) onOpenAiAssistant();
                        }}
                        className={`p-2 rounded-xl text-left text-xs font-bold transition-all border flex items-center gap-1.5 ${
                            selectedGuide === 'welcome'
                                ? 'bg-gradient-to-r from-cyan-700 to-slate-900 text-white border-cyan-600 shadow-sm'
                                : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-950 border-cyan-200'
                        }`}
                    >
                        <Bot className="w-3.5 h-3.5 shrink-0 text-cyan-600" />
                        <span className="truncate">AI কথা বলুন</span>
                    </button>
                </div>
            </div>

        </div>
    );
}
