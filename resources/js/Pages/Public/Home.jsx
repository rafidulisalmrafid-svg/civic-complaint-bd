import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
    Send, 
    Search, 
    CheckCircle2, 
    Clock, 
    ShieldCheck, 
    Activity, 
    MapPin, 
    Building2, 
    Zap, 
    Leaf, 
    HeartHandshake, 
    Scale, 
    Truck, 
    HelpCircle,
    ArrowRight,
    Sparkles,
    AlertCircle,
    Shield,
    Users,
    ChevronRight,
    TrendingUp,
    FileCheck,
    Radio,
    Bot,
    Compass,
    Landmark,
    Trees,
    Waves,
    Mountain,
    Sun,
    Flower2,
    Eye,
    Award,
    Navigation,
    Layers,
    MessageCircle,
    X,
    Volume2
} from 'lucide-react';
import CivicMascot from '@/Components/CivicMascot';
import AiComplaintAssistantModal from '@/Components/AiComplaintAssistantModal';

const iconMap = {
    activity: Activity,
    'map-pin': MapPin,
    building: Building2,
    zap: Zap,
    leaf: Leaf,
    'heart-handshake': HeartHandshake,
    scale: Scale,
    truck: Truck,
    'help-circle': HelpCircle,
};

// Comprehensive data for Bangladesh's 8 Administrative Divisions with balanced distinct accents
const DIVISIONS_DATA = [
    {
        id: 1,
        code: 'DHAKA',
        name_bn: 'ঢাকা বিভাগ',
        name_en: 'Dhaka',
        districts_count: 13,
        tagline: 'ঐতিহাসিক রাজধানী ও প্রশাসনিক প্রাণকেন্দ্র',
        overview: 'বুড়িগঙ্গার তীরে শত শত বছরের সমৃদ্ধ ইতিহাস, স্বাধীন বাংলাদেশের রাজধানী এবং জাতীয় গৌরবের স্মৃতিচিহ্ন নিয়ে দেশের প্রধান কেন্দ্র।',
        landmarks: [
            { name: 'জাতীয় স্মৃতিসৌধ (সাভার)', category: 'জাতীয় স্মারক', desc: 'মুক্তিযুদ্ধের বীর শহীদদের স্মরণে নির্মিত অমর স্থাপত্য' },
            { name: 'আহসান মঞ্জিল ও লালবাগ কেল্লা', category: 'মুঘল ও ঔপনিবেশিক ঐতিহ্য', desc: 'পুরান ঢাকার বুড়িগঙ্গা তীরের ঐতিহ্যবাহী নবাবী প্রাসাদ ও ঐতিহাসিক দুর্গ' },
            { name: 'জাতীয় সংসদ ভবন', category: 'আধুনিক স্থাপত্য', desc: 'লুই আই কানের নকশাকৃত বিশ্বখ্যাত স্থাপত্যশিল্প' },
            { name: 'কেন্দ্রীয় শহীদ মিনার', category: 'ভাষা স্মারক', desc: '১৯৫২ সালের ভাষা আন্দোলনের অমর স্মারক' }
        ],
        districts_list: ['ঢাকা', 'গাজীপুর', 'নারায়ণগঞ্জ', 'মুন্সীগঞ্জ', 'মানিকগঞ্জ', 'নরসিংদী', 'ফরিদপুর', 'মাদারীপুর', 'গোপালগঞ্জ', 'শরীয়তপুর', 'রাজবাড়ী', 'কিশোরগঞ্জ', 'টাঙ্গাইল'],
        specialties: ['ঐতিহ্যবাহী জামদানি শাড়ি', 'পুরান ঢাকার ঐতিহ্যবাহী বাকরখানি ও বিরিয়ানি', 'বুড়িগঙ্গা ও শীতলক্ষ্যা নদী'],
        badge: 'কেন্দ্রীয় প্রশাসনিক অঞ্চল',
        themeBorder: 'hover:border-slate-800',
        activeBg: 'from-slate-900 to-slate-800',
        badgeBg: 'bg-slate-100 text-slate-800'
    },
    {
        id: 2,
        code: 'CHATTOGRAM',
        name_bn: 'চট্টগ্রাম বিভাগ',
        name_en: 'Chattogram',
        districts_count: 11,
        tagline: 'সমুদ্রের গর্জন, পাহাড়ের মায়া ও প্রধান সমুদ্রবন্দর',
        overview: 'বঙ্গোপসাগরের নীল জলরাশি, বিশ্বের দীর্ঘতম বালুকাময় সমুদ্রসৈকত কক্সবাজার, প্রবাল দ্বীপ সেন্টমার্টিন এবং সবুজ পাহাড়ঘেরা অনন্য সৌন্দর্যের লীলাভূমি।',
        landmarks: [
            { name: 'কক্সবাজার সমুদ্রসৈকত', category: 'বিশ্বের দীর্ঘতম সৈকত', desc: '১২০ কিলোমিটার দীর্ঘ নিরবচ্ছিন্ন প্রাকৃতিক বালুকাময় সমুদ্রসৈকত' },
            { name: 'সেন্টমার্টিন প্রবাল দ্বীপ', category: 'সামুদ্রিক বিস্ময়', desc: 'বাংলাদেশের একমাত্র প্রবালসমৃদ্ধ নীল জলরাশির দ্বীপ' },
            { name: 'সাজেক ভ্যালি ও বান্দরবানের পাহাড়', category: 'মেঘের রাজ্য', desc: 'পাহাড়ে মেঘের ছোঁয়া ও সবুজ উপত্যকা' },
            { name: 'শালবন বিহার ও লালমাই পাহাড় (কুমিল্লা)', category: 'প্রাচীন প্রত্নতত্ত্ব', desc: 'পাইলট সক্রিয় অঞ্চলের প্রাচীন বৌদ্ধ সভ্যতার অনন্য নিদর্শন' }
        ],
        districts_list: ['চট্টগ্রাম', 'কক্সবাজার', 'কুমিল্লা', 'ব্রাহ্মণবাড়িয়া', 'চাঁদপুর', 'ফেনী', 'নোয়াখালী', 'লক্ষ্মীপুর', 'রাঙ্গামাটি', 'খাগড়াছড়ি', 'বান্দরবান'],
        specialties: ['চট্টগ্রাম সমুদ্রবন্দর', 'মেজবানি ঐতিহ্য', 'খাদি কাপড় (কুমিল্লা)', 'ময়নামতি রসমালাই'],
        badge: 'পাইলট সক্রিয় (কুমিল্লা)',
        themeBorder: 'hover:border-blue-600',
        activeBg: 'from-blue-900 to-slate-900',
        badgeBg: 'bg-blue-50 text-blue-800'
    },
    {
        id: 3,
        code: 'RAJSHAHI',
        name_bn: 'রাজশাহী বিভাগ',
        name_en: 'Rajshahi',
        districts_count: 8,
        tagline: 'প্রাচীন প্রত্নতত্ত্ব, রেশমের শহর ও সুমিষ্ট আম',
        overview: 'ইউনেস্কো বিশ্ব ঐতিহ্য পাহাড়পুর বৌদ্ধ বিহার, পদ্মা নদীর সুশীতল বাতাস এবং বাংলাদেশের রেশম শিল্প ও মিষ্টি আমের অবিসংবাদিত ঠিকানা।',
        landmarks: [
            { name: 'পাহাড়পুর সোমপুর মহাবিহার', category: 'ইউনেস্কো বিশ্ব ঐতিহ্য', desc: 'অষ্টম শতকের ভারতীয় উপমহাদেশের অন্যতম বৃহত্তম প্রাচীন বৌদ্ধ বিহার' },
            { name: 'বরেন্দ্র গবেষণা জাদুঘর', category: 'ঐতিহাসিক সংগ্রহ', desc: 'দক্ষিণ এশিয়ার প্রাচীনতম ও সমৃদ্ধ প্রত্নতাত্ত্বিক জাদুঘর' },
            { name: 'পুঠিয়া রাজবাড়ি ও শিব মন্দির', category: 'টেরাকোটা স্থাপত্য', desc: 'বাংলার অনন্য পোড়ামাটির টেরাকোটা অলঙ্করণে সমৃদ্ধ মন্দির কমপ্লেক্স' },
            { name: 'বাঘা ঐতিহাসিক মসজিদ', category: 'মুঘল স্থাপত্য', desc: 'পোড়ামাটির অনুপম নকশায় সুসজ্জিত দশ গম্বুজবিশিষ্ট প্রাচীন মসজিদ' }
        ],
        districts_list: ['রাজশাহী', 'বগুড়া', 'নওগাঁ', 'নাটোর', 'পাবনা', 'সিরাজগঞ্জ', 'চাঁপাইনবাবগঞ্জ', 'জয়পুরহাট'],
        specialties: ['রাজশাহীর খাঁটি রেশম সিল্ক', 'ফজলি ও ল্যাংড়া আম', 'বগুড়ার বিখ্যাত দই', 'নাটোরের কাঁচাগোল্লা'],
        badge: 'প্রত্নতাত্ত্বিক ঐতিহ্য',
        themeBorder: 'hover:border-amber-600',
        activeBg: 'from-amber-900 to-slate-900',
        badgeBg: 'bg-amber-50 text-amber-800'
    },
    {
        id: 4,
        code: 'KHULNA',
        name_bn: 'খুলনা বিভাগ',
        name_en: 'Khulna',
        districts_count: 10,
        tagline: 'ম্যানগ্রোভ সুন্দরবন ও প্রাচীন ষাট গম্বুজ মসজিদ',
        overview: 'বিশ্বের বৃহত্তম ম্যানগ্রোভ বন সুন্দরবন এবং রয়েল বেঙ্গল টাইগারের আবাসস্থল, ইউনেস্কো স্বীকৃত ঐতিহাসিক ষাট গম্বুজ মসজিদ এবং রূপসা নদীর নদীমাতৃক কোল।',
        landmarks: [
            { name: 'সুন্দরবন ম্যানগ্রোভ বন', category: 'ইউনেস্কো বিশ্ব ঐতিহ্য', desc: 'বিশ্বের সর্ববৃহৎ শ্বাসমূলীয় লবণাক্ত বনাঞ্চল ও রয়েল বেঙ্গল টাইগারের বিচরণভূমি' },
            { name: 'বাগেরহাটের ষাট গম্বুজ মসজিদ', category: 'ইউনেস্কো বিশ্ব ঐতিহ্য', desc: 'পঞ্চদশ শতাব্দীর খাঁন জাহান আলীর অনন্য পোড়ামাটি ও পাথরের স্থাপত্য' },
            { name: 'শিলাইদহ রবীন্দ্র কুঠিবাড়ি', category: 'সাহিত্য ও সংস্কৃতি', desc: 'বিশ্বকবি রবীন্দ্রনাথ ঠাকুরের স্মৃতিবিজড়িত পদ্মাতীরের ঐতিহাসিক নিবাস' },
            { name: 'মুজীবনগর স্মৃতিসৌধ', category: 'স্বাধীনতার সূতিকাগার', desc: 'স্বাধীন বাংলাদেশের প্রথম অস্থায়ী সরকারের ঐতিহাসিক শপথস্থল' }
        ],
        districts_list: ['খুলনা', 'বাগেরহাট', 'যশোর', 'সাতক্ষীরা', 'কুষ্টিয়া', 'ঝিনাইদহ', 'চুয়াডাঙ্গা', 'মেহেরপুর', 'মাগুরা', 'নড়াইল'],
        specialties: ['রয়েল বেঙ্গল টাইগার', 'সুন্দরবনের প্রাকৃতিক খাঁটি মধু', 'সাতক্ষীরার গলদা ও বাগদা চিংড়ি', 'যশোরের নলেন গুড় ও খেজুরের পাটালি'],
        badge: 'বিশ্ব ঐতিহ্য ও জীববৈচিত্র্য',
        themeBorder: 'hover:border-emerald-600',
        activeBg: 'from-emerald-950 to-slate-900',
        badgeBg: 'bg-emerald-50 text-emerald-800'
    },
    {
        id: 5,
        code: 'BARISHAL',
        name_bn: 'বরিশাল বিভাগ',
        name_en: 'Barishal',
        districts_count: 6,
        tagline: 'ধান-নদী-খালের দেশ ও কুয়াকাটা সাগরকন্যা',
        overview: 'কীর্তনখোলা, সন্ধ্যা ও পায়রা নদীর শান্ত কলতান, একই সৈকতে সূর্যোদয় ও সূর্যাস্তের কুয়াকাটা এবং সবুজে ঘেরা ঐতিহ্যবাহী ভাসমান পেয়ারা বাজারের রূপসী বাংলা।',
        landmarks: [
            { name: 'কুয়াকাটা সমুদ্রসৈকত', category: 'সাগরকন্যা', desc: 'একই স্থান থেকে সমুদ্রের বুকে সূর্যোদয় ও সূর্যাস্ত অবলোকনের বিরল সৈকত' },
            { name: 'ভিমরুলির ভাসমান পেয়ারা বাজার', category: 'নদীমাতৃক ঐতিহ্য', desc: 'শত বছরের ঐতিহ্যবাহী খালের উপর নৌকায় বসে কৃষিপণ্য ও পেয়ারা বেচাকেনা' },
            { name: 'দুর্গাসাগর দীঘি ও মাধবপাশা', category: 'ঐতিহাসিক জলাশয়', desc: 'দক্ষিণাঞ্চলের বৃহত্তম মনোরম ঐতিহাসিক মানবসৃষ্ট দীঘি' },
            { name: 'কীর্তনখোলা ও পায়রা নদী তীর', category: 'নদীমাতৃক জনপদ', desc: 'দক্ষিণবঙ্গের প্রাণপ্রবাহ নদী ও লঞ্চ যোগাযোগের মূল কেন্দ্র' }
        ],
        districts_list: ['বরিশাল', 'পটুয়াখালী', 'ভোলা', 'পিরোজপুর', 'বরগুনা', 'ঝালকাঠি'],
        specialties: ['পদ্মা-মেঘনার রূপালি ইলিশ', 'ভিমরুলির সুমিষ্ট পেয়ারা', 'বালাম চাল', 'ঐতিহ্যবাহী নারিকেল ও মিষ্টি সুপারি'],
        badge: 'পাইলট সক্রিয় (সম্পূর্ণ সক্রিয়)',
        themeBorder: 'hover:border-teal-600',
        activeBg: 'from-teal-950 to-slate-900',
        badgeBg: 'bg-teal-50 text-teal-800'
    },
    {
        id: 6,
        code: 'SYLHET',
        name_bn: 'সিলেট বিভাগ',
        name_en: 'Sylhet',
        districts_count: 4,
        tagline: 'দুটি পাতা একটি কুঁড়ি, স্বচ্ছ জলরাশি ও চা-বাগান',
        overview: 'দিগন্তবিস্তৃত সবুজের গালিচা মোড়ানো চা-বাগান, পাহাড়ি নদী জাফলংয়ের স্বচ্ছ পাথুরে জল, রাতারগুল সোয়াম্প ফরেস্ট এবং আধ্যাত্মিক সুফি ঐতিহ্য।',
        landmarks: [
            { name: 'শ্রীমঙ্গলের পাহাড়ি চা বাগান', category: 'চা-রাজ্য', desc: 'সবুজ পাহাড়ের ঢালে ঢালে চা পাতার সতেজ সমারোহ' },
            { name: 'রাতারগুল সোয়াম্প ফরেস্ট', category: 'জলাভূমি অরণ্য', desc: 'বাংলাদেশের একমাত্র প্রাকৃতিক মিঠাপানির স্বাদুজলের সোয়াম্প ফরেস্ট' },
            { name: 'জাফলং ও বিছনাকান্দি', category: 'স্বচ্ছ পাথুরে নদী', desc: 'ভারতের মেঘালয় পাহাড়ের পাদদেশে পিয়াইন নদীর স্ফটিক স্বচ্ছ জল ও পাথর' },
            { name: 'হযরত শাহজালাল ও শাহপরান (র.) মাজার', category: 'আধ্যাত্মিক কেন্দ্র', desc: 'শত শত বছরের আধ্যাত্মিক সুফি ও সম্প্রীতির পুণ্যভূমি' }
        ],
        districts_list: ['সিলেট', 'মৌলভীবাজার', 'হবিগঞ্জ', 'সুনামগঞ্জ'],
        specialties: ['সিলেটের প্রিমিয়াম চা পাতা', 'সাতরঙা চা', 'হাওরের তাজা মাছ', 'সাতকড়া ও আগর আতর'],
        badge: 'প্রাকৃতিক ও আধ্যাত্মিক স্বর্গ',
        themeBorder: 'hover:border-emerald-600',
        activeBg: 'from-emerald-900 to-slate-900',
        badgeBg: 'bg-emerald-50 text-emerald-800'
    },
    {
        id: 7,
        code: 'RANGPUR',
        name_bn: 'রংপুর বিভাগ',
        name_en: 'Rangpur',
        districts_count: 8,
        tagline: 'উত্তরবঙ্গের শস্যভাণ্ডার, কান্তজিউ ও তাজহাট প্রাসাদ',
        overview: 'তিস্তা ও ধরলা নদীর অববাহিকা, পোড়ামাটির অনন্য স্থাপত্য কান্তজিউ মন্দির, রাজকীয় তাজহাট জমিদার বাড়ি এবং মহীয়সী বেগম রোকেয়ার স্মৃতিধন্য পুণ্যভূমি।',
        landmarks: [
            { name: 'তাজহাট জমিদার বাড়ি', category: 'রাজকীয় স্থাপত্য', desc: 'রোমান ও মুঘল স্থাপত্যের মিশ্রণে তৈরি কারুকার্যময় শতাব্দীপ্রাচীন প্রাসাদ' },
            { name: 'কান্তজিউ মন্দির (দিনাজপুর)', category: 'টেরাকোটা শিল্প', desc: 'রামায়ণের কাহিনি চিত্রিত অনন্য সুন্দর পোড়ামাটির ফলক অলঙ্করণ' },
            { name: 'তিস্তা ব্যারেজ ও নদীর চর', category: 'নদী অববাহিকা', desc: 'বাংলাদেশের বৃহত্তম সেচ প্রকল্প ও উত্তরবঙ্গের প্রাণপ্রবাহ' },
            { name: 'পায়রাবন্দ (মিঠাপুকুর)', category: 'সাহিত্য ও নারীজাগরণ', desc: 'নারী জাগরণের অগ্রদূত বেগম রোকেয়ার স্মৃতিবিজড়িত জন্মস্থান' }
        ],
        districts_list: ['রংপুর', 'দিনাজপুর', 'কুড়িগ্রাম', 'গাইবান্ধা', 'নীলফামারী', 'লালমনিরহাট', 'ঠাকুরগাঁও', 'পঞ্চগড়'],
        specialties: ['রংপুরের হাঁড়িভাঙা আম', 'দিনাজপুরের কাটারিভোগ সুগন্ধি চাল ও লিচু', 'শতরঞ্জি হস্তশিল্প', 'তেঁতুলিয়া চা বাগান'],
        badge: 'কৃষি ও লোকশিল্পের শস্যভাণ্ডার',
        themeBorder: 'hover:border-rose-600',
        activeBg: 'from-rose-950 to-slate-900',
        badgeBg: 'bg-rose-50 text-rose-800'
    },
    {
        id: 8,
        code: 'MYMENSINGH',
        name_bn: 'ময়মনসিংহ বিভাগ',
        name_en: 'Mymensingh',
        districts_count: 4,
        tagline: 'ময়মনসিংহ গীতিকার সুর, গারো পাহাড় ও চিনা মাটির হ্রদ',
        overview: 'ব্রহ্মপুত্র নদের শান্ত প্রবাহ, সুসং দুর্গাপুরের নীল জলের বিরিশিরি চিনা মাটির পাহাড়, গারো পাহাড়ের সবুজ উপত্যকা ও অমর লোকগাথা ময়মনসিংহ গীতিকা।',
        landmarks: [
            { name: 'বিরিশিরি চিনা মাটির পাহাড় ও নীল হ্রদ', category: 'প্রাকৃতিক বিস্ময়', desc: 'নেত্রকোণার সুসং দুর্গাপুরে সাদা চিনা মাটির পাহাড় ও ফিরোজা নীল জলের হ্রদ' },
            { name: 'শশীলজ ও মুক্তাগাছার রাজবাড়ি', category: 'ঐতিহাসিক রাজপ্রাসাদ', desc: 'জমিদার মহারাজ শশীকান্তের অনন্য কারুকার্যময় প্রাসাদ' },
            { name: 'গারো পাহাড়ের সবুজ উপত্যকা', category: 'পাহাড় ও আদিবাসী সংস্কৃতি', desc: 'সীমান্তবর্তী গারো পাহাড়ের নিবিড় সৌন্দর্য ও সমৃদ্ধ লোকসংস্কৃতি' },
            { name: 'ব্রহ্মপুত্র নদের ঐতিহ্যবাহী ঘাট', category: 'নদীমাতৃক নিসর্গ', desc: 'ঐতিহাসিক ব্রহ্মপুত্র নদ ও শিল্পাচার্য জয়নুল আবেদিন সংগ্রহশালা' }
        ],
        districts_list: ['ময়মনসিংহ', 'জামালপুর', 'নেত্রকোণা', 'শেরপুর'],
        specialties: ['মুক্তাগাছার বিখ্যাত রাজকীয় মণ্ডা', 'নকশিকাঁথা (জামালপুর)', 'ময়মনসিংহ গীতিকা', 'কৃষি বিশ্ববিদ্যালয়ের সবুজ ক্যাম্পাস'],
        badge: 'লোকসংস্কৃতি ও গীতিকার ভূমি',
        themeBorder: 'hover:border-indigo-600',
        activeBg: 'from-indigo-950 to-slate-900',
        badgeBg: 'bg-indigo-50 text-indigo-800'
    }
];

export default function Home({ stats = {}, categories = [], pilotDistricts = [], recentResolved = [], divisions = [] }) {
    const [trackingCode, setTrackingCode] = useState('');
    const [taglineIndex, setTaglineIndex] = useState(0);
    const [tickerIndex, setTickerIndex] = useState(0);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [activeDivisionIndex, setActiveDivisionIndex] = useState(0);

    const animatedTaglines = [
        'নাগরিকের কণ্ঠস্বর, দায়বদ্ধ প্রশাসন',
        'পদ্মা-মেঘনা-যমুনার অববাহিকায় সুশাসনের অঙ্গীকার',
        '৮টি বিভাগ ও ৬৪ জেলায় সহজ ডিজিটাল সমাধান',
        'দ্রুত ও নিশ্চিত প্রতিকার'
    ];

    const liveTickerItems = [
        { location: 'বরিশাল সিটি', text: 'সদর রোড ড্রেনেজ সংস্কার সম্পন্ন ও পানিপ্রবাহ স্বাভাবিক', time: '১০ মিনিট আগে', status: 'নিষ্পত্তি' },
        { location: 'কুমিল্লা সিটি', text: 'কান্দিরপাড় জলাবদ্ধতা নিরসনে ইঞ্জিনিয়ারিং টিম ফিল্ডে', time: '২৫ মিনিট আগে', status: 'তদন্তাধীন' },
        { location: 'বরিশাল সদর', text: 'ব্যান্ড রোড স্ট্রিট লাইট সংযোগ ত্রুটি মেরামত রেকর্ডভুক্ত', time: '৪৫ মিনিট আগে', status: 'নিষ্পত্তি' },
        { location: 'কুমিল্লা আদর্শ সদর', text: 'ভিক্টোরিয়া কলেজ সংলগ্ন বর্জ্য ব্যবস্থাপনা পরিচ্ছন্নতা কার্যক্রম সমাপ্ত', time: '১ ঘণ্টা আগে', status: 'নিষ্পত্তি' },
        { location: 'সিলেট সিটি', text: 'আম্বরখানা মোড়ে ট্রাফিক ও সড়ক সংস্কারের পরিদর্শন নথিভুক্ত', time: '১.৫ ঘণ্টা আগে', status: 'তদন্তাধীন' },
        { location: 'রাজশাহী সিটি', text: 'পদ্মা পাড় বিনোদন কেন্দ্র সংলগ্ন সড়কবাতি পুনর্স্থাপন সম্পন্ন', time: '২ ঘণ্টা আগে', status: 'নিষ্পত্তি' }
    ];

    // Automatic tagline and ticker rotation
    useEffect(() => {
        const taglineTimer = setInterval(() => {
            setTaglineIndex((prev) => (prev + 1) % animatedTaglines.length);
        }, 3400);

        const tickerTimer = setInterval(() => {
            setTickerIndex((prev) => (prev + 1) % liveTickerItems.length);
        }, 4200);

        return () => {
            clearInterval(taglineTimer);
            clearInterval(tickerTimer);
        };
    }, []);

    const handleTrackSubmit = (e) => {
        e.preventDefault();
        if (trackingCode.trim()) {
            router.get(`/track?id=${encodeURIComponent(trackingCode.trim())}`);
        }
    };

    const currentDivision = DIVISIONS_DATA[activeDivisionIndex];

    return (
        <PublicLayout>
            <Head title="ই-অভিযোগ বাক্স — আপনার সমস্যা, ডিজিটাল সমাধান | গণপ্রজাতন্ত্রী বাংলাদেশ" />

            {/* Jamdani Floral Motif Decorative Border Ribbon at Top */}
            <div className="bd-motif-border" />

            {/* ========================================================
               1. HERO SECTION: BALANCED MODERN PALETTE & HUMANOID AI ASSISTANT
               ======================================================== */}
            <section className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50/80 text-slate-900 pt-8 pb-14 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24 overflow-hidden border-b border-slate-200/80">
                {/* Subtle Refined Ambient Mesh Glows (Soft sky, amber and pearl, avoiding heavy green) */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-200/25 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />

                {/* Jamdani Decorative Subtle Pattern Layer */}
                <div className="absolute inset-0 bd-pattern-subtle opacity-30 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Top Welcoming Announcement Banner */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white/90 border border-slate-200/80 px-4 py-2 rounded-2xl shadow-xs backdrop-blur-md">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            <span className="font-bold text-slate-900">ডিজিটাল বাংলাদেশ সুশাসন বাতায়ন:</span>
                            <span>৮টি বিভাগ ও ৬৪ জেলায় সরাসরি নাগরিক সেবা নিশ্চিতকরণ</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="hidden sm:inline bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono">পাইলট অঞ্চল: বরিশাল ও কুমিল্লা</span>
                            <span className="text-emerald-700 font-bold">টোল ফ্রি হেল্পলাইন: ৩৩৩</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                        
                        {/* Left Column: Heading, Taglines, Actions & Quick Track (7 Cols) */}
                        <div className="lg:col-span-7 text-center lg:text-left space-y-4 sm:space-y-5">
                            
                            {/* National Identity Tag */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                                <span className="text-amber-600 font-serif">★</span>
                                <span>গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের ডিজিটাল নাগরিক প্ল্যাটফর্ম</span>
                            </div>

                            {/* Main Heading with Balanced Contrast */}
                            <div className="space-y-1">
                                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.18]">
                                    ই-অভিযোগ বাক্স
                                </h1>
                                <p className="text-xl sm:text-3xl lg:text-3.5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-teal-800 to-emerald-700 mt-1">
                                    আপনার সমস্যা, ডিজিটাল সমাধান।
                                </p>
                            </div>

                            {/* Rotating Tagline */}
                            <div className="h-7 flex items-center justify-center lg:justify-start">
                                <span key={taglineIndex} className="animate-text-reveal text-xs sm:text-sm font-semibold text-slate-700 inline-flex items-center gap-2 bg-slate-100/90 px-3 py-1 rounded-xl border border-slate-200">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    <span>{animatedTaglines[taglineIndex]}</span>
                                </span>
                            </div>

                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto lg:mx-0">
                                সরকারি দপ্তর বা জনসেবায় যেকোনো অনিয়ম, বিলম্ব বা দুর্ভোগের কথা সহজে অনলাইনে জানান। প্রশাসনিক শ্রেণিবিন্যাস অনুযায়ী আপনার আবেদন সরাসরি পৌঁছাবে সংশ্লিষ্ট দায়িত্বরত কর্মকর্তার টেবিলে।
                            </p>

                            {/* 3 Core Action Buttons with Balanced Styling */}
                            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => setIsAiModalOpen(true)}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 hover:from-slate-900 hover:to-indigo-900 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-slate-950/20 transition-all active:scale-95 border border-slate-700/60"
                                >
                                    <Bot className="w-5 h-5 text-emerald-400 animate-pulse" />
                                    <span>AI সহকারীর সাথে অভিযোগ দাখিল</span>
                                    <Sparkles className="w-4 h-4 text-amber-300" />
                                </button>

                                <Link
                                    href="/submit"
                                    prefetch
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm hover:shadow-md transition-all active:scale-95"
                                >
                                    <Send className="w-4 h-4 text-emerald-700" />
                                    <span>সাধারণ ফর্ম</span>
                                </Link>

                                <Link
                                    href="/track"
                                    prefetch
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm hover:shadow-md transition-all active:scale-95"
                                >
                                    <Search className="w-4 h-4 text-slate-700" />
                                    <span>ট্র্যাক করুন</span>
                                </Link>
                            </div>

                            {/* Interactive Tracking Input */}
                            <div className="pt-2 max-w-xl mx-auto lg:mx-0">
                                <form onSubmit={handleTrackSubmit} className="relative flex items-center shadow-lg rounded-2xl bg-white text-slate-900 p-1.5 border border-slate-300 focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600 transition-all">
                                    <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="আপনার ট্র্যাকিং আইডি লিখুন (যেমন: CT-2026-XXXX)..."
                                        value={trackingCode}
                                        onChange={(e) => setTrackingCode(e.target.value)}
                                        className="w-full border-0 focus:ring-0 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 px-3 py-2 bg-transparent font-mono"
                                    />
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-slate-900 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shrink-0 active:scale-95"
                                    >
                                        ট্র্যাক করুন
                                    </button>
                                </form>

                                {/* Live Activity Ticker Pill */}
                                <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-[11px] border border-slate-800 shadow-md max-w-full overflow-hidden">
                                    <span className="flex items-center gap-1 text-emerald-400 font-bold shrink-0">
                                        <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                                        <span>লাইভ আপডেট:</span>
                                    </span>
                                    <div key={tickerIndex} className="animate-text-reveal flex items-center gap-2 truncate">
                                        <span className="text-amber-300 font-semibold shrink-0">[{liveTickerItems[tickerIndex].location}]</span>
                                        <span className="text-slate-200 truncate">{liveTickerItems[tickerIndex].text}</span>
                                        <span className="text-[10px] text-slate-400 font-mono shrink-0 hidden sm:inline">• {liveTickerItems[tickerIndex].time}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Animated Civic Mascot Assistant (5 Cols) */}
                        <div className="lg:col-span-5 flex justify-center mt-4 lg:mt-0">
                            <CivicMascot 
                                className="w-full max-w-md mx-auto" 
                                onOpenAiAssistant={() => setIsAiModalOpen(true)} 
                            />
                        </div>

                    </div>
                </div>
            </section>

            {/* ========================================================
               2. EIGHT ADMINISTRATIVE DIVISIONS OF BANGLADESH SHOWCASE
               ======================================================== */}
            <section id="divisions" className="py-14 sm:py-20 bg-[#F8FAFC] border-b border-slate-200/80 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Section Header */}
                    <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs mb-2.5">
                            <Compass className="w-3.5 h-3.5 text-indigo-600" />
                            <span>আঞ্চলিক প্রতিনিধিত্ব ও ঐতিহ্যবাহী পরিচয়</span>
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                            বাংলাদেশের ৮টি বিভাগ ও দর্শনীয় ঐতিহ্যের রূপরেখা
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                            প্রতিটি বিভাগের নিজস্ব ঐতিহ্যবাহী নিদর্শন, সংস্কৃতি এবং নাগরিক সেবার আওতাভুক্ত জেলাসমূহ এক্সপ্লোর করুন। আপনার এলাকার সংশ্লিষ্ট দপ্তরে সরাসরি অভিযোগ দাখিল করুন।
                        </p>
                    </div>

                    {/* Interactive 8 Division Tabs with Balanced Colors */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5 mb-8">
                        {DIVISIONS_DATA.map((div, idx) => {
                            const isSelected = activeDivisionIndex === idx;
                            return (
                                <button
                                    key={div.id}
                                    type="button"
                                    onClick={() => setActiveDivisionIndex(idx)}
                                    className={`p-3 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-between relative group ${
                                        isSelected
                                            ? `bg-gradient-to-b ${div.activeBg} text-white border-transparent shadow-xl scale-102 ring-2 ring-slate-900/30`
                                            : `bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-2xs hover:shadow-md ${div.themeBorder}`
                                    }`}
                                >
                                    {div.badge && div.badge.includes('পাইলট') && (
                                        <span className="absolute -top-2 right-1 text-[9px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded-full shadow-xs">
                                            পাইলট
                                        </span>
                                    )}
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs mb-1.5 transition-colors ${
                                        isSelected
                                            ? 'bg-white/20 text-white'
                                            : 'bg-slate-100 text-slate-800 group-hover:bg-slate-200'
                                    }`}>
                                        {idx + 1}
                                    </div>
                                    <span className="font-bold text-xs sm:text-sm tracking-tight block">
                                        {div.name_bn}
                                    </span>
                                    <span className={`text-[10px] mt-0.5 font-mono font-medium ${
                                        isSelected ? 'text-slate-200' : 'text-slate-400'
                                    }`}>
                                        {div.districts_count}টি জেলা
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Active Division Detailed Showcase Card */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            
                            {/* Left Pane: Division Heritage, Description, Districts & CTAs (7 Cols) */}
                            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-5">
                                <div>
                                    {/* Division Header & Badges */}
                                    <div className="flex flex-wrap items-center gap-2 mb-2.5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${currentDivision.badgeBg} border-slate-200`}>
                                            {currentDivision.badge}
                                        </span>
                                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                            {currentDivision.name_en} Division • {currentDivision.districts_count} Districts
                                        </span>
                                    </div>

                                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                        {currentDivision.name_bn}
                                    </h3>
                                    <p className="text-sm font-semibold text-teal-800 mt-1">
                                        {currentDivision.tagline}
                                    </p>
                                    <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                                        {currentDivision.overview}
                                    </p>

                                    {/* Division Iconic Landmarks Grid */}
                                    <div className="mt-5">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                            <Landmark className="w-3.5 h-3.5 text-slate-600" />
                                            <span>বিখ্যাত ঐতিহ্য ও দর্শনীয় স্থানসমূহ:</span>
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {currentDivision.landmarks.map((lm, i) => (
                                                <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all">
                                                    <span className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md inline-block mb-1">
                                                        {lm.category}
                                                    </span>
                                                    <p className="font-bold text-xs sm:text-sm text-slate-900">{lm.name}</p>
                                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{lm.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Districts Pills */}
                                    <div className="mt-5">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-slate-600" />
                                            <span>আওতাভুক্ত জেলাসমূহ ({currentDivision.districts_count}টি):</span>
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {currentDivision.districts_list.map((dist, i) => (
                                                <span key={i} className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors">
                                                    {dist}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Cultural Specialties */}
                                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                                        <span className="font-bold text-slate-800">বিখ্যাত বিশেষত্ব:</span>
                                        {currentDivision.specialties.map((spec, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 text-[11px]">
                                                ✓ {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Direct Action Buttons for this Division */}
                                <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-3">
                                    <Link
                                        href={`/submit?division=${currentDivision.id}`}
                                        prefetch
                                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                                    >
                                        <Send className="w-4 h-4 text-emerald-300" />
                                        <span>{currentDivision.name_bn}য় অভিযোগ দাখিল করুন</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => setIsAiModalOpen(true)}
                                        className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 shadow-2xs transition-all active:scale-95"
                                    >
                                        <Bot className="w-4 h-4 text-slate-700" />
                                        <span>AI সহকারীর সহায়তা নিন</span>
                                    </button>
                                </div>
                            </div>

                            {/* Right Pane: Visual Cultural Montage / Photography (5 Cols) */}
                            <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
                                    <img 
                                        src="/images/heritage/eight_divisions_panoramic.jpg" 
                                        alt="বাংলাদেশের বিভাগীয় ঐতিহ্য" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="relative z-10 space-y-4">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/20">
                                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                        <span>ঐতিহ্যের বিভাগীয় মেলবন্ধন</span>
                                    </div>

                                    <h4 className="text-xl sm:text-2xl font-black text-white leading-snug">
                                        {currentDivision.name_bn}র নাগরিক জবাবদিহিতা
                                    </h4>
                                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                                        এই বিভাগের সকল উপজেলা, পৌরসভা ও জেলা প্রশাসন পর্যায়ে দায়িত্বপ্রাপ্ত কর্মকর্তাদের তালিকা এবং সিটি কর্পোরেশন ডিরেক্টরি ডিজিটাল সিস্টেমে সংযুক্ত রয়েছে।
                                    </p>

                                    {/* Live Highlights */}
                                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2 mt-3">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-300">এসএলএ নিস্পত্তির মান:</span>
                                            <span className="font-mono font-bold text-amber-300">৯৫%+ লক্ষ্যমাত্রা</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-300">জরুরি হেল্পলাইন:</span>
                                            <span className="font-mono font-bold text-white">৩৩৩ ও ৯৯৯</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-300">কর্মকর্তা রাউটিং:</span>
                                            <span className="text-emerald-400 font-bold">সরাসরি সক্রিয়</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 pt-5 mt-5 border-t border-white/15 text-[11px] text-slate-300 flex items-center justify-between">
                                    <span>ডিজিটাল বাংলাদেশ • স্মার্ট নাগরিক সেবা</span>
                                    <span className="font-mono font-bold text-amber-300">★ ১০০% নিরাপদ</span>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </section>

            {/* ========================================================
               3. ICONIC HERITAGE & PRIDE OF BANGLADESH GALLERY
               ======================================================== */}
            <section className="py-14 sm:py-20 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 mb-2 shadow-2xs">
                            <Landmark className="w-3.5 h-3.5 text-slate-700" />
                            <span>চিরন্তন ঐতিহ্য ও জাতীয় পরিচয়</span>
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                            সোনার বাংলাদেশ: আমাদের গৌরব, ঐতিহ্য ও সংস্কৃতি
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                            যে ঐতিহ্য আমাদের একতাবদ্ধ করে, সেই ভালোবাসার দেশকে আরও সুন্দর ও বাসযোগ্য গড়ে তুলতে নাগরিক দায়িত্বশীলতা ও সুশাসন অপরিহার্য।
                        </p>
                    </div>

                    {/* 4 Balanced Heritage Pillars */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        
                        {/* Pillar 1: National Memorial & Liberation War */}
                        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 card-hover-lift flex flex-col justify-between group">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                                    <Landmark className="w-6 h-6 text-emerald-400" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                    বীরত্ব ও স্বাধীনতা
                                </span>
                                <h3 className="text-base font-black text-slate-900 mt-2 mb-1.5 group-hover:text-emerald-800 transition-colors">
                                    জাতীয় স্মৃতিসৌধ ও শহীদ মিনার
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    সাভারের জাতীয় স্মৃতিসৌধের সাতটি স্তম্ভ মুক্তিযুদ্ধের সাতটি ঐতিহাসিক পর্যায়কে তুলে ধরে। অমর একুশের শহীদ মিনার আমাদের মায়ের ভাষা ও আত্মত্যাগের চিরন্তন প্রতীক।
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold text-slate-700">
                                জাতীয় অহংকার ও স্বাধীনতা
                            </div>
                        </div>

                        {/* Pillar 2: Sundarbans & Royal Bengal Tiger */}
                        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 card-hover-lift flex flex-col justify-between group">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-amber-900 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                                    <Trees className="w-6 h-6 text-amber-300" />
                                </div>
                                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider bg-white border border-amber-200 px-2 py-0.5 rounded-md">
                                    বিশ্ব ঐতিহ্য ও প্রকৃতি
                                </span>
                                <h3 className="text-base font-black text-slate-900 mt-2 mb-1.5 group-hover:text-amber-800 transition-colors">
                                    সুন্দরবন ও রয়েল বেঙ্গল টাইগার
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    বিশ্বের বৃহত্তম ম্যানগ্রোভ অরণ্য সুন্দরবন আমাদের প্রাকৃতিক প্রতিরক্ষা ঢাল। রয়েল বেঙ্গল টাইগার ও সুন্দরী গাছের শ্বাসমূলীয় বন আমাদের সমৃদ্ধ জীববৈচিত্র্যের গর্ব।
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold text-amber-700">
                                ইউনেস্কো বিশ্ব ঐতিহ্য
                            </div>
                        </div>

                        {/* Pillar 3: Riverine Beauty & Haor-Baoor */}
                        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 card-hover-lift flex flex-col justify-between group">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                                    <Waves className="w-6 h-6 text-cyan-300" />
                                </div>
                                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider bg-white border border-blue-200 px-2 py-0.5 rounded-md">
                                    নদীমাতৃক বাংলাদেশ
                                </span>
                                <h3 className="text-base font-black text-slate-900 mt-2 mb-1.5 group-hover:text-blue-800 transition-colors">
                                    পদ্মা-মেঘনা-যমুনা ও হাওর
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    হাজার নদীর পলিমাটিতে গড়া আমাদের উর্বর ভূখণ্ড। লাল শাপলা ফুল, পালতোলা ঐতিহ্যবাহী নৌকা, ভাটায় ভাটিয়ালি সুর এবং বিস্তৃত হাওরের অপার সৌন্দর্য।
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold text-blue-700">
                                নদী ও কৃষির প্রাণস্পন্দন
                            </div>
                        </div>

                        {/* Pillar 4: Folk Culture, Jamdani & Alpana */}
                        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 card-hover-lift flex flex-col justify-between group">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-rose-900 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                                    <Sparkles className="w-6 h-6 text-rose-300" />
                                </div>
                                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider bg-white border border-rose-200 px-2 py-0.5 rounded-md">
                                    কারুশিল্প ও উৎসব
                                </span>
                                <h3 className="text-base font-black text-slate-900 mt-2 mb-1.5 group-hover:text-rose-800 transition-colors">
                                    জামদানি, নকশিকাঁথা ও আলপনা
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    ইউনেস্কো স্বীকৃত জামদানি তাঁতশিল্প, সুই-সুতায় আঁকা বাংলার সুখ-দুঃখের নকশিকাঁথা এবং পহেলা বৈশাখের রঙিন মঙ্গল শোভাযাত্রা আমাদের চিরন্তন সংস্কৃতির প্রতীক।
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold text-rose-700">
                                লোকশিল্প ও উৎসবের বর্ণচ্ছটা
                            </div>
                        </div>

                    </div>

                    {/* Panoramic Cultural Banner Showcase */}
                    <div className="mt-10 rounded-3xl overflow-hidden border border-slate-200 shadow-xl relative group">
                        <div className="relative h-60 sm:h-72 lg:h-80 w-full">
                            <img 
                                src="/images/heritage/eight_divisions_panoramic.jpg" 
                                alt="বাংলাদেশের ৮টি বিভাগের ঐতিহ্য ও দৃশ্য" 
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                            
                            <div className="absolute bottom-6 left-6 sm:left-8 right-6 text-white">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-white/20 text-white text-xs font-bold mb-2 shadow-md">
                                    <Award className="w-3.5 h-3.5 text-amber-400" />
                                    <span>সোনার বাংলার ঐতিহ্যকে সমুন্নত রাখতে আমরা বদ্ধপরিকর</span>
                                </span>
                                <h3 className="text-lg sm:text-2xl font-black max-w-2xl leading-tight">
                                    পাহাড়পুর থেকে কক্সবাজার, সুন্দরবন থেকে শ্রীমঙ্গল—সুশাসনে গড়ে উঠুক সমৃদ্ধ বাংলাদেশ
                                </h3>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ========================================================
               4. REAL DATABASE STATISTICS & TRANSPARENCY
               ======================================================== */}
            <section className="bg-slate-50 py-12 sm:py-16 border-y border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-8">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-white border border-slate-200 px-3 py-1 rounded-full">
                            স্বচ্ছতা ও জবাবদিহিতা
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-2">
                            কেন্দ্রীয় অভিযোগ নিষ্পত্তির পরিসংখ্যান
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {/* Metric 1 */}
                        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm card-hover-lift text-left">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">মোট দাখিল</span>
                                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                                    <FileCheck className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{stats.total || 0}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">কেন্দ্রীয় ডাটাবেজে নথিবদ্ধ</p>
                        </div>

                        {/* Metric 2 */}
                        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm card-hover-lift text-left">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">সফল নিষ্পত্তি</span>
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">{stats.resolved || 0}</p>
                            <p className="text-[11px] text-emerald-600 mt-0.5">যাচাইকৃত সমাধান নিশ্চিত</p>
                        </div>

                        {/* Metric 3 */}
                        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm card-hover-lift text-left">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">তদন্তাধীন</span>
                                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                                    <Activity className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">{stats.investigating || 0}</p>
                            <p className="text-[11px] text-amber-600 mt-0.5">কর্মকর্তা পর্যায়ে সক্রিয়</p>
                        </div>

                        {/* Metric 4 */}
                        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm card-hover-lift text-left">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">নিষ্পত্তি হার</span>
                                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{stats.resolutionRate || 0}%</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">পাইলট অঞ্চলসমূহের গড়</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================
               5. THE 4-STEP CIVIC WORKFLOW PROCESS
               ======================================================== */}
            <section className="py-14 sm:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-slate-600" />
                            সহজ ও স্বচ্ছ ডিজিটাল রূপরেখা
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
                            অভিযোগ দাখিল থেকে সমাধান পর্যন্ত চারটি ধাপ
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
                            কোনো মধ্যস্থতাকারী ছাড়াই সরাসরি সরকার ও নাগরিকের দ্বিমুখী জবাবদিহিতা
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {/* Step 1 */}
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-sm card-hover-lift flex flex-col justify-between">
                            <div>
                                <div className="w-11 h-11 rounded-2xl bg-white text-slate-900 font-black text-base flex items-center justify-center mb-4 font-mono border border-slate-200 shadow-xs">
                                    ০১
                                </div>
                                <h3 className="font-bold text-base text-slate-900 mb-1.5">অনলাইনে অভিযোগ দাখিল</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    খাত, এলাকা ও দপ্তরের নাম উল্লেখ করে তথ্য, ছবি বা প্রমাণপত্রসহ সহজে আবেদন জমা দিন। সাথে সাথেই পাবেন অনন্য ট্র্যাকিং আইডি।
                                </p>
                            </div>
                            <div className="pt-3 mt-3 border-t border-slate-200 text-[11px] font-semibold text-slate-600">
                                সময় লাগবে: ২-৩ মিনিট
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-sm card-hover-lift flex flex-col justify-between">
                            <div>
                                <div className="w-11 h-11 rounded-2xl bg-white text-slate-900 font-black text-base flex items-center justify-center mb-4 font-mono border border-slate-200 shadow-xs">
                                    ০২
                                </div>
                                <h3 className="font-bold text-base text-slate-900 mb-1.5">স্বয়ংক্রিয় বুদ্ধিমান রাউটিং</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    সিস্টেম ভৌগোলিক সীমানা ও দপ্তরের পদমর্যাদা বিশ্লেষণ করে সংশ্লিষ্ট দায়িত্বরত কর্মকর্তার ড্যাশবোর্ডে পাঠায়।
                                </p>
                            </div>
                            <div className="pt-3 mt-3 border-t border-slate-200 text-[11px] font-semibold text-slate-600">
                                তাৎক্ষণিক নোটিফিকেশন
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-sm card-hover-lift flex flex-col justify-between">
                            <div>
                                <div className="w-11 h-11 rounded-2xl bg-white text-slate-900 font-black text-base flex items-center justify-center mb-4 font-mono border border-slate-200 shadow-xs">
                                    ০৩
                                </div>
                                <h3 className="font-bold text-base text-slate-900 mb-1.5">তদন্ত ও কার্যকর ব্যবস্থা</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    দায়িত্বপ্রাপ্ত কর্মকর্তা সরেজমিনে তদন্ত করে আইনানুগ ব্যবস্থা গ্রহণ করেন এবং অগ্রগতির বিবরণ ডিজিটাল নথিতে সংরক্ষণ করেন।
                                </p>
                            </div>
                            <div className="pt-3 mt-3 border-t border-slate-200 text-[11px] font-semibold text-slate-600">
                                এসএলএ টাইমলাইনে সীমাবদ্ধ
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-sm card-hover-lift flex flex-col justify-between">
                            <div>
                                <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white font-black text-base flex items-center justify-center mb-4 font-mono shadow-xs">
                                    ০৪
                                </div>
                                <h3 className="font-bold text-base text-slate-900 mb-1.5">সমাধান ও নাগরিক মতামত</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    সমাধানের প্রমাণপত্র আপলোড হয় এবং নাগরিক তার সন্তুষ্টি প্রকাশ করতে পারেন অথবা প্রয়োজনে পুনর্বিবেচনার আবেদন জানাতে পারেন।
                                </p>
                            </div>
                            <div className="pt-3 mt-3 border-t border-slate-200 text-[11px] font-semibold text-slate-600">
                                নাগরিকের চূড়ান্ত রেটিং
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================
               6. DYNAMIC CATEGORIES GRID
               ======================================================== */}
            <section className="py-14 sm:py-20 bg-slate-50 border-y border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-800 border border-slate-200 mb-2">
                                নাগরিক সমস্যার খাতসমূহ
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                                যেসকল নাগরিক খাতে অভিযোগ জানাতে পারেন
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 mt-1">
                                যেকোনো ক্যাটাগরিতে ক্লিক করে সরাসরি অভিযোগ দাখিল শুরু করুন
                            </p>
                        </div>
                        <Link 
                            href="/submit" 
                            prefetch
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 transition-all active:scale-95 shrink-0"
                        >
                            <span>সব ক্যাটাগরি দেখুন</span>
                            <ArrowRight className="w-4 h-4 text-slate-700" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {categories.map((cat) => {
                            const IconComponent = iconMap[cat.icon] || Building2;
                            return (
                                <Link
                                    key={cat.id}
                                    href={`/submit?category=${cat.id}`}
                                    prefetch
                                    className="p-5 rounded-3xl border border-slate-200 hover:border-slate-400 bg-white hover:shadow-lg transition-all group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center mb-3 group-hover:scale-105 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-2xs">
                                            <IconComponent className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-800 transition-colors mb-1">
                                            {cat.name_bn}
                                        </h3>
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                            {cat.description}
                                        </p>
                                    </div>
                                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                                        <span className="font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                                            এসএলএ: {cat.default_sla_days} দিন
                                        </span>
                                        <span className="text-slate-900 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5 text-xs">
                                            অভিযোগ দিন <ChevronRight className="w-3.5 h-3.5" />
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ========================================================
               7. RECENT RESOLUTIONS
               ======================================================== */}
            {recentResolved?.length > 0 && (
                <section className="py-14 sm:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-xl mx-auto mb-8">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 mb-2">
                                সততা ও স্বচ্ছতা
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                                সম্প্রতি নিষ্পত্তি হওয়া অভিযোগসমূহ
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                নাগরিকের দাবির প্রেক্ষিতে মাঠপর্যায়ে গৃহীত বাস্তব সমাধান
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recentResolved.map((item, idx) => (
                                <Link 
                                    key={idx} 
                                    href={`/track?id=${encodeURIComponent(item.tracking_id)}`}
                                    prefetch
                                    className="p-5 rounded-3xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all flex items-start justify-between gap-4 group"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-slate-800 group-hover:text-emerald-800">{item.tracking_id}</span>
                                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                                                ✓ {item.status_label}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 line-clamp-1">{item.title}</h3>
                                        <p className="text-xs text-slate-600 flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{item.upazila_name}, {item.district_name} • {item.category_name}</span>
                                        </p>
                                    </div>
                                    <span className="text-xs text-slate-500 shrink-0 font-mono mt-1">{item.resolved_time}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ========================================================
               8. CTA BANNER (BALANCED SLATE & GOLD)
               ======================================================== */}
            <section className="py-14 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="rounded-3xl p-8 sm:p-12 lg:p-14 border border-slate-700 bg-slate-800/80 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="max-w-2xl text-center lg:text-left space-y-3">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-bold border border-white/20">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>সুশাসন নিশ্চিতকরণে নাগরিক অংশীদারিত্ব</span>
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                                আপনার একটি সচেতন অভিযোগ পারে একটি অনিয়ম দূর করতে
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                                দেশের যে প্রান্তেই থাকুন না কেন, কোনো মধ্যস্থতাকারী ছাড়া সরাসরি প্রশাসনিক কর্মকর্তার টেবিলে আপনার আবেদন পৌঁছাতে আজই ই-অভিযোগ বাক্সে যুক্ত হোন।
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsAiModalOpen(true)}
                                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Bot className="w-5 h-5 text-slate-900" />
                                <span>AI সহায়তায় অভিযোগ দিন</span>
                            </button>
                            <Link
                                href="/submit"
                                prefetch
                                className="px-6 py-3.5 rounded-2xl bg-slate-700/80 hover:bg-slate-700 text-white font-bold text-sm border border-slate-600 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4 text-emerald-300" />
                                <span>সরাসরি ফর্ম পূরণ</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Floating AI Assistant Trigger Button (Bottom-Right, Elevated above mobile dock) */}
            <div className="fixed right-4 bottom-20 sm:bottom-6 z-40">
                <button
                    type="button"
                    onClick={() => setIsAiModalOpen(true)}
                    className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white shadow-xl shadow-emerald-950/25 border border-emerald-400/40 hover:scale-105 active:scale-95 transition-all"
                    title="AI অভিযোগ সহকারীর সাথে কথা বলুন"
                >
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <Bot className="w-5 h-5 text-emerald-300 animate-pulse" />
                    <span className="text-xs sm:text-sm font-extrabold tracking-wide">AI নাগরিক সহকারী</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                </button>
            </div>

            {/* AI-Powered Complaint Assistant Modal */}
            <AiComplaintAssistantModal 
                isOpen={isAiModalOpen} 
                onClose={() => setIsAiModalOpen(false)} 
            />
        </PublicLayout>
    );
}
