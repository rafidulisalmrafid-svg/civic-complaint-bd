<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\ComplaintAttachment;
use App\Models\ComplaintCategory;
use App\Models\ComplaintProblemType;
use App\Models\ComplaintSelectedIssue;
use App\Models\Division;
use App\Models\District;
use App\Models\Upazila;
use App\Models\Office;
use App\Models\OfficeBranch;
use App\Models\OfficerProfile;
use App\Models\Organization;
use App\Models\Ministry;
use App\Models\User;
use App\Models\Citizen;
use App\Models\Notification;
use App\Models\AuditLog;
use App\Services\TrackingIdGenerator;
use App\Services\ComplaintRoutingService;
use App\Services\SlaCalculationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AiAssistantController extends Controller
{
    /**
     * Get initial structured database entities for the AI Assistant
     * Used for real-time smart suggestions without hallucinating names/offices
     */
    public function initialData()
    {
        return Cache::remember('ai_assistant_initial_data_v3', 60, function () {
            $categories = ComplaintCategory::where('status', 'active')
                ->with(['problemTypes' => fn ($q) => $q->where('status', 'active')->orderBy('display_order')])
                ->orderBy('display_order')
                ->get()
                ->map(fn ($cat) => [
                    'id' => $cat->id,
                    'name_bn' => $cat->name_bn,
                    'name_en' => $cat->name_en,
                    'code' => $cat->code,
                    'icon' => $cat->icon,
                    'problem_types' => $cat->problemTypes->map(fn ($pt) => [
                        'id' => $pt->id,
                        'title_bn' => $pt->title_bn,
                        'cluster_name_bn' => $pt->cluster_name_bn,
                    ]),
                ]);

            $offices = Office::with(['organization', 'district'])
                ->get()
                ->map(fn ($off) => [
                    'id' => $off->id,
                    'name_bn' => $off->name_bn,
                    'organization_id' => $off->organization_id,
                    'organization_name' => $off->organization?->name_bn,
                    'organization_type' => $off->organization?->type,
                    'district_id' => $off->district_id,
                    'district_name' => $off->district?->name_bn,
                ]);

            $officers = OfficerProfile::with(['office'])
                ->where('status', 'active')
                ->get()
                ->map(fn ($officer) => [
                    'id' => $officer->id,
                    'name_bn' => $officer->name_bn,
                    'designation_bn' => $officer->designation_bn,
                    'office_id' => $officer->office_id,
                    'office_name' => $officer->office?->name_bn,
                ]);

            $posts = \App\Models\Post::select('id', 'name_bn', 'name_en', 'code', 'department_group')
                ->get();

            $districts = District::select('id', 'division_id', 'name_bn', 'name_en', 'code')
                ->get();

            $divisions = Division::select('id', 'name_bn', 'name_en', 'code')
                ->get();

            return response()->json([
                'success' => true,
                'categories' => $categories,
                'offices' => $offices,
                'officers' => $officers,
                'posts' => $posts,
                'districts' => $districts,
                'divisions' => $divisions,
            ]);
        });
    }

    /**
     * Smart NLP Analyzer for freeform civic complaints
     * Implements intelligent detection of:
     * 1. Category & Offices
     * 2. Candidate Officers & Official Posts (সংশ্লিষ্ট ব্যক্তি বা কর্মকর্তা শনাক্তকরণ)
     * 3. Incident Location & Timestamp Suggestions (ঘটনার স্থান ও সময়)
     * 4. Probable Root Causes & Scenarios (কী ঘটেছে ও কীভাবে সমস্যার সৃষ্টি হয়েছে)
     * 5. Contextual Remedies (প্রত্যাশিত প্রতিকার)
     */
    public function analyze(Request $request)
    {
        $text = $request->input('text') ?: ($request->json('text') ?: '');
        if (empty($text)) {
            $raw = $request->getContent();
            $decoded = json_decode($raw, true);
            if (is_array($decoded) && !empty($decoded['text'])) {
                $text = $decoded['text'];
            }
        }
        $lang = $request->input('lang', 'bn');

        if (empty(trim((string)$text))) {
            return response()->json([
                'success' => false,
                'message' => $lang === 'en' ? 'Please describe your problem.' : 'আপনার সমস্যার বিবরণ দিন।'
            ], 422);
        }

        $lowerText = mb_strtolower($text, 'UTF-8');

        // 1. Detect Category by keyword patterns
        $matchedCategoryId = 9; // Default: অন্যান্য সাধারণ নাগরিক অভিযোগ
        $priority = 'medium';

        $categoryKeywords = [
            // স্বাস্থ্য ও চিকিৎসা সেবা (Hospital / Health)
            1 => ['হাসপাতাল', 'ডাক্তার', 'চিকিৎসক', 'চিকিৎসা', 'ওষুধ', 'নার্স', 'ক্লিনিক', 'রোগী', 'স্বাস্থ্য', 'বেড', 'সিভিল সার্জন', 'প্যাথলজি', 'hospital', 'doctor', 'medicine', 'health', 'clinic', 'nurse', 'ইমার্জেন্সি', 'মেডিকেল'],
            // ভূমি সেবা ও বিরোধ
            2 => ['জমি', 'ভূমি', 'নামজারি', 'পর্চা', 'খতিয়ান', 'খারিজ', 'এসি ল্যান্ড', 'তহশিল', 'ভূমি অফিস', 'land', 'mutation', 'khatian', 'ac land', 'দলিল', 'নায়েব'],
            // পৌরসেবা / ড্রেনেজ / বর্জ্য / রাস্তা (Municipal & Local Gov)
            3 => ['ড্রেন', 'ড্রেনেজ', 'পানি জমে', 'জলাবদ্ধতা', 'বর্জ্য', 'ময়লা', 'আবর্জনা', 'পরিচ্ছন্ন', 'সিটি কর্পোরেশন', 'পৌরসভা', 'রাস্তার বাতি', 'বাতি নষ্ট', 'drain', 'waste', 'waterlogging', 'garbage', 'street light', 'municipal', 'নর্দমা', 'আলো'],
            // বিদ্যুৎ ও জ্বালানি
            4 => ['বিদ্যুৎ', 'কারেন্ট', 'লোডশেডিং', 'মিটার', 'ট্রান্সফরমার', 'বিল বেশি', 'ওজোপাডিকো', 'বিউবো', 'পল্লী বিদ্যুৎ', 'power', 'electricity', 'load shedding', 'transformer', 'electric', 'লাইনম্যান'],
            // নারী ও শিশু সুরক্ষা
            5 => ['ইভটিজিং', 'নিপীড়ন', 'নারী', 'শিশু', 'যৌতুক', 'বাল্যবিয়ে', 'সুরক্ষা', 'women', 'child', 'harassment', 'নিরাপত্তা', 'উত্ত্যক্ত'],
            // দুর্নীতি ও ঘুষ
            6 => ['ঘুষ', 'দুর্নীতি', 'হয়রানি', 'টাকা দাবি', 'অনিয়ম', 'bribery', 'corruption', 'extortion', 'বকশিশ', 'টাকা ছাড়া'],
            // পরিবেশ দূষণ
            7 => ['নদী দখল', 'পরিবেশ দূষণ', 'কারখানার ধোঁয়া', 'শব্দ দূষণ', 'গাছ কাটা', 'পুকুর ভরাট', 'pollution', 'river', 'environment', 'ধোঁয়া', 'শব্দ'],
            // সড়ক, সেতু ও পরিবহন
            8 => ['রাস্তা ভাঙা', 'খানাখন্দ', 'সড়ক', 'সেতু', 'কালভার্ট', 'ফুটপাত', 'যানজট', 'পরিবহন', 'road', 'bridge', 'pothole', 'traffic', 'পিচঢালা', 'সড়ক ও জনপথ'],
        ];

        foreach ($categoryKeywords as $catId => $keywords) {
            foreach ($keywords as $kw) {
                if (mb_strpos($lowerText, $kw) !== false) {
                    $matchedCategoryId = $catId;
                    break 2;
                }
            }
        }

        // 2. Detect Priority
        if (preg_match('/(জরুরি|বিপদ|দুর্ঘটনা|তাৎক্ষণিক|মুমূর্ষু|মারাত্মক|danger|urgent|emergency|critical|জীবন)/u', $lowerText)) {
            $priority = 'urgent';
        } elseif (preg_match('/(অনেক দিন|ভোগান্তি|অসুবিধা|নষ্ট|খারাপ|serious|high|চরম)/u', $lowerText)) {
            $priority = 'high';
        }

        // 3. Detect Division & District
        $divisionId = 5; // Default: Barishal
        $districtId = 43; // Default: Barishal
        $districtNameBn = 'বরিশাল';

        if (preg_match('/(কুমিল্লা|cumilla|comilla|ভিক্টোরিয়া|কান্দিরপাড়|চকবাজার|টমসম)/u', $lowerText)) {
            $divisionId = 2; // Chattogram
            $districtId = 16; // Cumilla
            $districtNameBn = 'কুমিল্লা';
        } elseif (preg_match('/(বরিশাল|barishal|সদর রোড|ব্যান্ড রোড|রূপাতলী|নথুল্লাবাদ|শের-ই-বাংলা|চাঁদমারী)/u', $lowerText)) {
            $divisionId = 5; // Barishal
            $districtId = 43; // Barishal
            $districtNameBn = 'বরিশাল';
        } elseif (preg_match('/(ঢাকা|dhaka|মিরপুর|গুলশান|ধানমন্ডি|মতিঝিল|উত্তরা)/u', $lowerText)) {
            $divisionId = 1; // Dhaka
            $districtId = 1; // Dhaka
            $districtNameBn = 'ঢাকা';
        }

        // 4. Resolve Matching Category & Offices
        $category = ComplaintCategory::find($matchedCategoryId);
        
        // Find best office based on category & district
        $office = Office::where('district_id', $districtId)
            ->where('organization_id', $category->default_organization_id)
            ->first();

        if (! $office) {
            $office = Office::where('district_id', $districtId)->first() ?: Office::first();
        }

        // 5. Intelligent Candidate Officers & Posts Identification (১. সংশ্লিষ্ট ব্যক্তি বা কর্মকর্তা শনাক্তকরণ)
        $candidateOfficers = [];
        
        // 5a. Matching actual profiles from database
        $actualOfficers = OfficerProfile::where('office_id', $office?->id)
            ->orWhere('district_id', $districtId)
            ->get();

        foreach ($actualOfficers as $actOff) {
            $candidateOfficers[] = [
                'id' => $actOff->id,
                'name_bn' => $actOff->name_bn,
                'designation_bn' => $actOff->designation_bn,
                'office_name' => $actOff->office?->name_bn ?: $office?->name_bn,
                'type' => 'verified_officer',
                'badge' => 'ভেরিফাইড কর্মকর্তা',
            ];
        }

        // 5b. Suggest relevant administrative posts/designations based on category
        $categoryPosts = [
            1 => [
                ['name_bn' => 'কর্তব্যরত আবাসিক মেডিকেল অফিসার (RMO)', 'designation_bn' => 'আবাসিক মেডিকেল অফিসার', 'badge' => 'দায়িত্বপ্রাপ্ত পদবি'],
                ['name_bn' => 'জরুরি বিভাগের কর্তব্যরত মেডিকেল অফিসার', 'designation_bn' => 'মেডিকেল অফিসার (ইমার্জেন্সি)', 'badge' => 'দায়িত্বপ্রাপ্ত পদবি'],
                ['name_bn' => 'হাসপাতাল তত্ত্বাবধায়ক / পরিচালক', 'designation_bn' => 'পরিচালক (হাসপাতাল)', 'badge' => 'প্রশাসনিক প্রধান'],
                ['name_bn' => 'ওয়ার্ড ইনচার্জ নার্সিং সুপারভাইজার', 'designation_bn' => 'নার্সিং সুপারভাইজার', 'badge' => 'মাঠপর্যায়'],
            ],
            2 => [
                ['name_bn' => 'সহকারী কমিশনার (ভূমি) - এসি ল্যান্ড', 'designation_bn' => 'সহকারী কমিশনার (ভূমি)', 'badge' => 'দপ্তর প্রধান'],
                ['name_bn' => 'ইউনিয়ন ভূমি উপ-সহকারী কর্মকর্তা (নায়েব)', 'designation_bn' => 'ভূমি উপ-সহকারী কর্মকর্তা', 'badge' => 'মাঠপর্যায়'],
                ['name_bn' => 'নামজারি ও রেকর্ড পেশকার / সহকারী', 'designation_bn' => 'পেশকার (মিউটেশন)', 'badge' => 'দায়িত্বপ্রাপ্ত কর্মচারী'],
                ['name_bn' => 'উপজেলা সার্ভেয়ার ও কানুনগো', 'designation_bn' => 'কানুনগো / সার্ভেয়ার', 'badge' => 'কারিগরি শাখা'],
            ],
            3 => [
                ['name_bn' => 'প্রধান বর্জ্য ব্যবস্থাপনা কর্মকর্তা / পরিদর্শক', 'designation_bn' => 'বর্জ্য ব্যবস্থাপনা পরিদর্শক', 'badge' => 'দায়িত্বপ্রাপ্ত শাখা'],
                ['name_bn' => 'নির্বাহী প্রকৌশলী (পূর্ত ও ড্রেনেজ শাখা)', 'designation_bn' => 'নির্বাহী প্রকৌশলী', 'badge' => 'প্রকৌশল বিভাগ'],
                ['name_bn' => 'প্রধান নির্বাহী কর্মকর্তা (CEO - পৌরসভা/কর্পোরেশন)', 'designation_bn' => 'প্রধান নির্বাহী কর্মকর্তা', 'badge' => 'প্রশাসনিক প্রধান'],
                ['name_bn' => 'সংশ্লিষ্ট ওয়ার্ড সচিব ও পরিচ্ছন্ন সুপারভাইজার', 'designation_bn' => 'ওয়ার্ড সুপারভাইজার', 'badge' => 'ওয়ার্ড পর্যায়'],
            ],
            4 => [
                ['name_bn' => 'উপ-বিভাগীয় প্রকৌশলী (বিদ্যুৎ সরবরাহ ও রক্ষণাবেক্ষণ)', 'designation_bn' => 'উপ-বিভাগীয় প্রকৌশলী', 'badge' => 'প্রকৌশল শাখা'],
                ['name_bn' => 'মিটার রিডার ও লাইনম্যান ইনচার্জ', 'designation_bn' => 'লাইনম্যান ইনচার্জ', 'badge' => 'মাঠপর্যায়'],
                ['name_bn' => 'সহকারী প্রকৌশলী (গ্রাহক সেবা ও বিলিং)', 'designation_bn' => 'সহকারী প্রকৌশলী (বিলিং)', 'badge' => 'বিলিং শাখা'],
            ],
            5 => [
                ['name_bn' => 'অফিসার ইনচার্জ (OC)', 'designation_bn' => 'পুলিশ পরিদর্শক (OC)', 'badge' => 'থানা প্রশাসন'],
                ['name_bn' => 'উপজেলা মহিলা বিষয়ক কর্মকর্তা', 'designation_bn' => 'মহিলা বিষয়ক কর্মকর্তা', 'badge' => 'সুরক্ষা শাখা'],
            ],
            6 => [
                ['name_bn' => 'জেলা অভিযোগ কর্মকর্তা (DCO) / অতিরিক্ত জেলা প্রশাসক', 'designation_bn' => 'জেলা অভিযোগ প্রতিকার কর্মকর্তা', 'badge' => 'তদন্ত শাখা'],
                ['name_bn' => 'দুদক সমন্বিত জেলা কার্যালয়ের উপ-পরিচালক', 'designation_bn' => 'উপ-পরিচালক (দুদক)', 'badge' => 'আইন প্রয়োগকারী'],
            ],
            7 => [
                ['name_bn' => 'পরিবেশ অধিদপ্তর জেলা কার্যালয়ের উপ-পরিচালক/পরিদর্শক', 'designation_bn' => 'পরিবেশ পরিদর্শক', 'badge' => 'পরিবেশ পরিদপ্তর'],
            ],
            8 => [
                ['name_bn' => 'নির্বাহী প্রকৌশলী (সড়ক ও জনপথ বিভাগ)', 'designation_bn' => 'নির্বাহী প্রকৌশলী (সওজ)', 'badge' => 'সওজ অধিদপ্তর'],
                ['name_bn' => 'উপজেলা প্রকৌশলী (LGED)', 'designation_bn' => 'উপজেলা প্রকৌশলী (এলজিইডি)', 'badge' => 'স্থানীয় সরকার'],
            ],
        ];

        if (isset($categoryPosts[$matchedCategoryId])) {
            foreach ($categoryPosts[$matchedCategoryId] as $idx => $p) {
                $candidateOfficers[] = [
                    'id' => "post_{$matchedCategoryId}_{$idx}",
                    'name_bn' => $p['name_bn'],
                    'designation_bn' => $p['designation_bn'],
                    'office_name' => $office?->name_bn,
                    'type' => 'official_post',
                    'badge' => $p['badge'],
                ];
            }
        }

        // Always append Option: Unknown person / Organization-wide
        $candidateOfficers[] = [
            'id' => 'unknown',
            'name_bn' => 'নির্দিষ্ট ব্যক্তির নাম অজ্ঞাত (প্রতিষ্ঠানের সামগ্রিক অব্যবস্থাপনা)',
            'designation_bn' => 'দপ্তর প্রধান / উপযুক্ত তদন্ত কর্মকর্তা',
            'office_name' => $office?->name_bn,
            'type' => 'unknown',
            'badge' => 'প্রতিষ্ঠানের বিরুদ্ধে',
        ];

        // 6. Guided Location Suggestions (২. ঘটনার স্থান ও সময় নির্ধারণ)
        $placesByDistrict = [
            43 => [ // Barishal
                'বরিশাল সদর রোড মোড়',
                'শের-ই-বাংলা মেডিকেল কলেজ ও হাসপাতাল চত্বর',
                'ব্যান্ড রোড পুলিশ লাইন্স এলাকা',
                'রূপাতলী বাস টার্মিনাল সংলগ্ন এলাকা',
                'নথুল্লাবাদ কেন্দ্রীয় বাস টার্মিনাল',
                'কাউনিয়া প্রধান সড়ক',
                'বরিশাল নদী বন্দর / লঞ্চঘাট চত্বর',
            ],
            16 => [ // Cumilla
                'কান্দিরপাড় বাণিজ্যিক এলাকা',
                'ভিক্টোরিয়া সরকারি কলেজ চত্বর',
                'চকবাজার প্রধান সড়ক ও কাঁচাবাজার',
                'শাসনগাছা বাস টার্মিনাল এলাকা',
                'টমসম ব্রিজ মোড়',
                'ঝাউতলা প্রধান সড়ক',
                'রাজগঞ্জ বাজার এলাকা',
            ],
            1 => [ // Dhaka
                'মিরপুর ১০ গোলচত্বর',
                'ধানমন্ডি ২৭ নম্বর এলাকা',
                'ফার্মগেট মোড়',
                'মতিঝিল বাণিজ্যিক এলাকা',
                'গুলশান ২ সার্কেল',
                'উত্তরা আজমপুর বাসস্ট্যান্ড',
            ],
        ];

        $suggestedPlaces = $placesByDistrict[$districtId] ?? [
            'উপজেলা পরিষদ চত্বর',
            'পৌরসভা ভবন এলাকা',
            'প্রধান বাজার রোড',
            'সরকারি হাসপাতাল মোড়',
            'উপজেলা ভূমি অফিস চত্বর',
        ];

        $suggestedTimeChips = [
            'আজকে (তাৎক্ষণিক ঘটনা)',
            'বিগত ২-৩ দিন যাবৎ',
            'বিগত ১ সপ্তাহ ধরে',
            'প্রায় ১ মাস ধরে চলমান',
            'নির্দিষ্ট তারিখে (ক্যালেন্ডার নির্বাচন)',
        ];

        // 7. Probable Root Causes & Problem Scenarios (৩. কী ঘটেছে এবং কীভাবে সমস্যার সৃষ্টি হয়েছে?)
        $scenariosByCategory = [
            1 => [
                'কর্মস্থলে চিকিৎসকের অনুপস্থিতি ও ঘণ্টার পর ঘণ্টা লাইনে দাঁড় করিয়ে ভোগান্তি সৃষ্টি',
                'সরকারি ওষুধ ও টেস্ট থাকার পরও বাইরে থেকে অতিরিক্ত দামে কিনতে বাধ্য করা',
                'চিকিৎসক, নার্স ও হাসপাতালের কর্মচারীদের অসৌজন্যমূলক ও কর্কশ আচরণ',
                'জরুরি বিভাগে সময়মতো চিকিৎসা সেবা প্রদানে অস্বীকৃতি ও অবহেলা',
                'হাসপাতাল ওয়ার্ডে তীব্র অপরিচ্ছন্নতা, বর্জ্য ও সুপেয় পানির সংকট',
            ],
            2 => [
                'নামজারি (খারিজ) আবেদনের ২৮ দিন পেরিয়ে গেলেও অহেতুক ফাইল আটকে রাখা',
                'সরকারি নির্ধারিত ফি ব্যতীত অতিরিক্ত অর্থ ও অবৈধ বকশিশ দাবি',
                'রেকর্ড সংশোধনে ভুল খতিয়ান দেখিয়ে বারবার শুনানির তারিখ দিয়ে ঘোরানো',
                'বৈধ কাগজপত্র থাকা সত্ত্বেও মধ্যস্বত্বভোগী/দালাল ছাড়া কাজ করতে অনীহা',
            ],
            3 => [
                'নর্দমা ও ড্রেনেজ ব্যবস্থা দীর্ঘদিন পরিষ্কার না করায় সামান্য বৃষ্টিতেই রাস্তা ও দোকানে পানি জমে জলাবদ্ধতা',
                'দিনের পর দিন রাস্তার পাশে বর্জ্য ও ময়লার স্তূপ ফেলে রাখায় তীব্র দুর্গন্ধ ও রোগবালাই ছড়াচ্ছে',
                'রাস্তার সড়ক বাতি (Street Light) নষ্ট থাকায় রাতে অন্ধকার ও পথচারীদের নিরাপত্তাহীনতা',
                'পৌর সরবরাহ লাইনে দুর্গন্ধযুক্ত ও ময়লা পানি আসায় পানের অযোগ্য হয়ে পড়েছে',
            ],
            4 => [
                'দিনে বারবার লোডশেডিং এবং ট্রান্সফরমার বিকল হয়ে দীর্ঘ সময় বিদ্যুৎ বিচ্ছিন্ন থাকা',
                'মিটার রিডিংয়ের চেয়ে অবাস্তব ও ভুতুড়ে অতিরিক্ত বিদ্যুৎ বিল প্রস্তুত করা',
                'নতুন বিদ্যুৎ সংযোগের আবেদন মাসের পর মাস নিষ্পত্তি না করে ঝুলিয়ে রাখা',
            ],
            5 => [
                'শিক্ষাপ্রতিষ্ঠান বা কর্মক্ষেত্রের যাতায়াত পথে বখাটেদের নিয়মিত উত্ত্যক্ত ও ইভটিজিং',
                'আইনি সুরক্ষা ও তাৎক্ষণিক পুলিশি সহায়তা প্রাপ্তিতে অবহেলা ও বিলম্ব',
            ],
            6 => [
                'সরকারি দপ্তরের বৈধ নাগরিক সেবা পেতে অবৈধ অর্থ দাবি ও হয়রানি',
                'নথিপত্র প্রস্তুতের অজুহাতে কর্মকর্তা ও কর্মচারীদের যোগসাজশে আর্থিক অনিয়ম',
            ],
            7 => [
                'নদী, খাল বা সরকারি জলাশয় অবৈধভাবে ভরাট ও জবরদখল',
                'জনবসতিপূর্ণ এলাকায় অনুমোদনহীন কলকারখানার বিষাক্ত ধোঁয়া ও বর্জ্য নির্গমন',
            ],
            8 => [
                'সড়কে বড় বড় খানাখন্দ সৃষ্টি হওয়ায় নিয়মিত যানবাহন বিকল ও দুর্ঘটনার শিকার হওয়া',
                'সংস্কার কাজে নিম্নমানের সামগ্রী ব্যবহার ও ধীরগতির কারণে পথচারীদের চরম ভোগান্তি',
            ],
        ];

        $suggestedScenarios = $scenariosByCategory[$matchedCategoryId] ?? [
            'নাগরিক সেবা প্রদানে অহেতুক দীর্ঘসূত্রতা ও দায়িত্বহীনতা',
            'দায়িত্বপ্রাপ্ত কর্মকর্তার অপেশাদার ও অসৌজন্যমূলক আচরণ',
            'জনস্বার্থবিরোধী কাজের ফলে সাধারণ নাগরিকদের মারাত্মক ভোগান্তি',
        ];

        // 8. Expected Remedies (৪. প্রত্যাশিত প্রতিকার)
        $remediesByCategory = [
            1 => [
                'সরেজমিন পরিদর্শনপূর্বক ঘটনার সুষ্ঠু তদন্ত এবং অবহেলাকারী চিকিৎসকের বিরুদ্ধে বিভাগীয় ব্যবস্থা গ্রহণ',
                'জরুরি চিকিৎসা সেবা নিশ্চিতকরণ ও রোগীদের জন্য পর্যাপ্ত ওষুধ সরবরাহ চালু করা',
                'হাসপাতাল ওয়ার্ডের নিয়মিত পরিচ্ছন্নতা ও সেবার পরিবেশ তদারকি',
            ],
            2 => [
                'আবেদনকারীর নামজারি (খারিজ) নথি অতি দ্রুত যাচাইপূর্বক বৈধ খতিয়ান প্রদান',
                'অযথা হয়রানি ও অবৈধ অর্থ দাবির বিষয়ে নিরপেক্ষ প্রশাসনিক তদন্ত পরিচালনা',
            ],
            3 => [
                'জরুরি ভিত্তিতে নর্দমা খনন/পরিষ্কার করে জলাবদ্ধতা দূর করা এবং বর্জ্য অপসারণ সম্পন্ন করা',
                'অকেজো সড়কবাতি ও ড্রেন দ্রুত সংস্কারপূর্বক নাগরিক চলাচল নির্বিঘ্ন করা',
            ],
            4 => [
                'জরুরি ভিত্তিতে লাইন ও ট্রান্সফরমার মেরামত করে নিরবচ্ছিন্ন বিদ্যুৎ সংযোগ চালু করা',
                'ভুতুড়ে বিদ্যুৎ বিল সংশোধন করে সঠিক রিডিং অনুযায়ী বিল সমন্বয় করা',
            ],
            6 => [
                'দায়ী ব্যক্তির বিরুদ্ধে দুর্নীতি দমন আইনে তদন্ত ও কঠোর শাস্তিমূলক ব্যবস্থা গ্রহণ',
                'অবৈধভাবে আদায়কৃত অর্থ ভুক্তভোগীকে ফেরত প্রদান নিশ্চিত করা',
            ],
            8 => [
                'সড়কের খানাখন্দ জরুরিভাবে মেরামত ও পিচঢালাই করে যান চলাচল নিরাপদ করা',
            ],
        ];

        $suggestedRemedies = $remediesByCategory[$matchedCategoryId] ?? [
            'সরেজমিন পরিদর্শনপূর্বক নিরপেক্ষ তদন্ত ও দায়ী ব্যক্তির বিরুদ্ধে যথাযথ আইনি ব্যবস্থা গ্রহণ',
            'জনভোগান্তি নিরসনে জরুরি ভিত্তিতে সেবা বা ত্রুটি সংশোধন নিশ্চিত করা',
            'ভবিষ্যতে এ ধরনের ঘটনা রোধে নিয়মিত প্রশাসনিক মনিটরিং ব্যবস্থা চালু করা',
        ];

        // 9. Generate Professional Titles
        $titles = [
            1 => ['bn' => 'হাসপাতাল স্বাস্থ্যসেবা প্রাপ্তিতে অবহেলা ও ভোগান্তি নিরসন আবেদন', 'en' => 'Application for resolution of hospital healthcare negligence'],
            2 => ['bn' => 'ভূমি সেবা ও নামজারি প্রাপ্তিতে বিলম্ব ও অনিয়ম নিরসন আবেদন', 'en' => 'Application regarding land service delay and irregularities'],
            3 => ['bn' => 'পৌর ড্রেনেজ ব্যবস্থা সংস্কার ও জলাবদ্ধতা দূরীকরণ আবেদন', 'en' => 'Application for municipal drainage repair and waterlogging resolution'],
            4 => ['bn' => 'বিদ্যুৎ বিভ্রাট ও সরবরাহ ব্যবস্থা পুনঃস্থাপনের আবেদন', 'en' => 'Application for restoration of power outage and supply line'],
            5 => ['bn' => 'নারী ও শিশু সুরক্ষা এবং সংবেদনশীল বিষয়ে প্রতিকার প্রার্থনা', 'en' => 'Application for protection and immediate redressal'],
            6 => ['bn' => 'অন্যায় অর্থ দাবি ও সেবা প্রাপ্তিতে অযথা হয়রানির অভিযোগ', 'en' => 'Complaint regarding unfair financial extortion and harassment'],
            7 => ['bn' => 'পরিবেশ দূষণ রোধ ও জনস্বাস্থ্য রক্ষায় কার্যকর ব্যবস্থা গ্রহণ', 'en' => 'Application to halt environmental pollution'],
            8 => ['bn' => 'ভাঙা সড়ক সংস্কার ও জননিরাপত্তা নিশ্চিতকরণের আবেদন', 'en' => 'Application for broken road repair and public safety'],
            9 => ['bn' => 'নাগরিক সেবা বিঘ্ন নিরসন ও জনস্বার্থে প্রতিকার আবেদন', 'en' => 'Civic complaint for resolution of public service disruption'],
        ];

        $suggestedTitle = $titles[$matchedCategoryId][$lang === 'en' ? 'en' : 'bn'] ?? "{$category->name_bn} সংক্রান্ত আবেদন";

        return response()->json([
            'success' => true,
            'category_id' => $category->id,
            'category_name_bn' => $category->name_bn,
            'category_name_en' => $category->name_en,
            'division_id' => $divisionId,
            'district_id' => $districtId,
            'district_name_bn' => $districtNameBn,
            'office_id' => $office?->id,
            'office_name_bn' => $office?->name_bn,
            'candidate_officers' => $candidateOfficers,
            'suggested_places' => $suggestedPlaces,
            'suggested_time_chips' => $suggestedTimeChips,
            'suggested_scenarios' => $suggestedScenarios,
            'suggested_remedies' => $suggestedRemedies,
            'priority' => $priority,
            'suggested_title' => $suggestedTitle,
            'extracted_summary' => $text,
        ]);
    }

    /**
     * Generate Formal Official Complaint Letter Structure
     * Strictly fulfills all 4 dimensions requested by user:
     * 1. Identified Officer/Person
     * 2. Incident Date, Time & Specific Location
     * 3. What happened & how the problem occurred (synthesized narrative)
     * 4. Expected Remedy & Evidence statement (explicit note on missing evidence without hallucination)
     */
    public function generateFormalLetter(Request $request)
    {
        $officeName = $request->input('office_name', 'সংশ্লিষ্ট কর্তৃপক্ষ');
        $officerName = $request->input('officer_name', '');
        $officerDesignation = $request->input('officer_designation', '');
        $isPersonUnknown = $request->boolean('is_person_unknown');
        
        $location = $request->input('location', 'সংশ্লিষ্ট এলাকা');
        $incidentDate = $request->input('incident_date', date('d/m/Y'));
        $title = $request->input('title', 'নাগরিক ভোগান্তি নিরসনে প্রতিকার প্রার্থনা');
        $description = $request->input('description', '');
        $remedyRequested = $request->input('remedy_requested', 'সরেজমিন পরিদর্শনপূর্বক সুষ্ঠু তদন্ত ও কার্যকর ব্যবস্থা গ্রহণ।');
        
        // Strict Evidence Collection & Transparency handling
        $evidenceList = $request->input('evidence_list', '');
        if (empty(trim((string)$evidenceList)) || $evidenceList === 'কোনো প্রমাণ নেই' || $evidenceList === 'none') {
            $evidenceStatement = 'কোনো দালিলিক প্রমাণ বা ফুটেজ এই মুহূর্তে সংযুক্ত নেই (সরেজমিন পরিদর্শন, কর্মকর্তা অনুসন্ধান ও ভুক্তভোগীর প্রত্যক্ষ সাক্ষ্য সাপেক্ষ)';
        } else {
            $evidenceStatement = trim((string)$evidenceList);
        }

        $isAnonymous = $request->boolean('is_anonymous');
        $complainantName = $isAnonymous ? 'সচেতন নাগরিক (পরিচয় গোপন রাখা হয়েছে)' : ($request->input('complainant_name') ?: 'সচেতন নাগরিক');
        $complainantPhone = $isAnonymous ? 'গোপন' : ($request->input('complainant_phone') ?: 'অনুল্লেখিত');

        $recipientTitle = !empty($officerDesignation) ? $officerDesignation : 'উপযুক্ত দায়িত্বপ্রাপ্ত কর্মকর্তা / দপ্তর প্রধান';

        // Officer identification line
        if ($isPersonUnknown || empty($officerName)) {
            $officerBlock = "নির্দিষ্ট ব্যক্তির নাম অজ্ঞাত (প্রতিষ্ঠানের সামগ্রিক অব্যবস্থাপনা ও দায়িত্বপ্রাপ্তদের বিরুদ্ধে)";
        } else {
            $officerBlock = "{$officerName} (পদবি: {$officerDesignation})";
        }

        // Standard Bangladesh Government Official Format
        $letterText = "বরাবর,\n"
            . "{$recipientTitle}\n"
            . "{$officeName}, {$location}।\n\n"
            . "বিষয়: {$title}।\n\n"
            . "মহোদয়,\n"
            . "যথাযথ সম্মানপূর্বক বিনীত নিবেদন এই যে, আমি {$location} এলাকার একজন সচেতন নাগরিক। জনস্বার্থে ও নাগরিক অধিকার ক্ষুণ্ণ হওয়ার প্রেক্ষিতে আপনার কার্যালয়ের আশু হস্তক্ষেপ কামনা করে নিম্নবর্ণিত অভিযোগটি দাখিল করছি:\n\n"
            . "১. অভিযোগভুক্ত সংশ্লিষ্ট ব্যক্তি বা কর্মকর্তা:\n"
            . "   {$officerBlock}\n\n"
            . "২. ঘটনার সুনির্দিষ্ট স্থান:\n"
            . "   {$location}\n\n"
            . "৩. ঘটনার তারিখ ও সময়কাল:\n"
            . "   {$incidentDate}\n\n"
            . "৪. কী ঘটেছে এবং কীভাবে সমস্যার সৃষ্টি হয়েছে (বিবরণ):\n"
            . "   {$description}\n\n"
            . "৫. সংযুক্ত প্রমাণাদি:\n"
            . "   {$evidenceStatement}\n\n"
            . "৬. প্রার্থিত প্রতিকার:\n"
            . "   অতএব, মহোদয়ের নিকট আকুল প্রার্থনা—বর্ণিত বিষয়টি জনগুরুত্বপূর্ণ ও অতীব জরুরি বিবেচনা করে অতি দ্রুত সরেজমিনে তদন্তপূর্বক {$remedyRequested}-এর প্রয়োজনীয় আইনানুগ ও কার্যকর ব্যবস্থা গ্রহণ করে বাধিত করবেন।\n\n"
            . "বিনীত নিবেদক,\n"
            . "{$complainantName}\n"
            . "মোবাইল: {$complainantPhone}\n"
            . "তারিখ: " . date('d/m/Y') . " ইং";

        return response()->json([
            'success' => true,
            'formal_letter' => $letterText,
            'title' => $title,
            'recipient' => "{$recipientTitle}, {$officeName}",
            'evidence_statement' => $evidenceStatement,
            'officer_block' => $officerBlock,
        ]);
    }

    /**
     * Direct Conversational Complaint Registration with Consent
     */
    public function submitComplaint(Request $request)
    {
        // Check if POST payload was stripped by server due to post_max_size
        if ($request->isMethod('post') && empty($_POST) && empty($_FILES) && (int) $request->header('CONTENT_LENGTH', 0) > 0) {
            return response()->json([
                'success' => false,
                'message' => 'আপলোড করা ফাইল বা ভিডিওর সাইজ সার্ভার সীমার চেয়ে বড়। অনুগ্রহ করে ১০০ মেগাবাইটের কম সাইজের ফাইল দিন অথবা ইউটিউব/গুগল ড্রাইভ লিংক ব্যবহার করুন।',
            ], 422);
        }

        $request->validate([
            'category_id' => 'required|exists:complaint_categories,id',
            'division_id' => 'required|exists:divisions,id',
            'district_id' => 'required|exists:districts,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'is_anonymous' => 'nullable|boolean',
            'complainant_name' => 'nullable|string|max:100',
            'complainant_phone' => 'nullable|string|max:20',
            'office_id' => 'nullable|exists:offices,id',
            'specific_officer_id' => 'nullable|exists:officer_profiles,id',
            'formal_letter' => 'nullable|string',
            'remedy_requested' => 'nullable|string|max:1000',
            'user_consent' => 'required|accepted',
            'attachments.*' => 'nullable|file|max:102400', // 100MB max per attachment
        ], [
            'user_consent.accepted' => 'অভিযোগ জমা দিতে আপনার সম্মতি প্রদান করা আবশ্যক।',
            'title.required' => 'অভিযোগের শিরোনাম আবশ্যক।',
            'description.required' => 'অভিযোগের বিবরণ আবশ্যক।',
            'attachments.*.max' => 'প্রতিটি ফাইলের সাইজ সর্বোচ্চ ১০০ মেগাবাইট হতে পারবে।',
        ]);

        return DB::transaction(function () use ($request) {
            $user = auth()->user();
            $phone = $request->complainant_phone ?: ($user?->phone ?: '01700000000');
            $name = $request->boolean('is_anonymous') 
                ? 'গোপন নাগরিক (AI Assistant)' 
                : ($request->complainant_name ?: ($user?->name ?: 'সচেতন নাগরিক'));

            if (! $user) {
                $user = User::firstOrCreate(
                    ['phone' => $phone],
                    ['name' => $name, 'role' => 'citizen']
                );

                Citizen::firstOrCreate(
                    ['user_id' => $user->id],
                    [
                        'division_id' => $request->division_id,
                        'district_id' => $request->district_id,
                    ]
                );
            }

            // Generate Tracking ID
            $trackingId = TrackingIdGenerator::generate($request->division_id);

            $category = ComplaintCategory::findOrFail($request->category_id);
            $priority = $request->priority ?: 'medium';

            // Resolve Office
            if ($request->office_id) {
                $office = Office::find($request->office_id);
            } else {
                $office = Office::where('district_id', $request->district_id)
                    ->where('organization_id', $category->default_organization_id)
                    ->first();
            }

            if (! $office) {
                $office = Office::where('district_id', $request->district_id)->first() ?: Office::first();
            }

            // Officer
            $officer = $request->specific_officer_id ? OfficerProfile::find($request->specific_officer_id) : null;

            // Resolve SLA & Route
            $dueAt = SlaCalculationService::calculateDueDate($category->id, $priority);
            $routed = ComplaintRoutingService::resolveRoute(
                categoryId: $category->id,
                subcategoryId: null,
                divisionId: $request->division_id,
                districtId: $request->district_id,
                upazilaId: null,
                officeId: $office->id,
                branchId: null,
                specificOfficerId: $officer?->id,
                isPersonUnknown: empty($officer)
            );

            // Detailed combined description including remedy and formal text
            $finalDescription = $request->description;
            if ($request->filled('remedy_requested')) {
                $finalDescription .= "\n\n[প্রত্যাশিত প্রতিকার]: " . $request->remedy_requested;
            }
            if ($request->filled('formal_letter')) {
                $finalDescription .= "\n\n--- আনুষ্ঠানিক অভিযোগপত্র ---\n" . $request->formal_letter;
            }

            // Create Complaint
            $complaint = Complaint::create([
                'tracking_id' => $trackingId,
                'user_id' => $user->id,
                'complainant_name' => $name,
                'complainant_phone' => $phone,
                'is_anonymous' => $request->boolean('is_anonymous'),
                'category_id' => $category->id,
                'title' => $request->title,
                'description' => $finalDescription,
                'priority' => $priority,
                'is_sensitive' => $category->is_sensitive,
                'division_id' => $request->division_id,
                'district_id' => $request->district_id,
                'upazila_id' => null,
                'organization_id' => $office->organization_id,
                'office_id' => $office->id,
                'specific_officer_id' => $officer?->id,
                'is_person_unknown' => empty($officer),
                'assigned_officer_id' => $routed['assigned_officer_id'],
                'current_status' => 'submitted',
                'selected_issues_summary' => 'AI স্মার্ট সহকারীর মাধ্যমে আনুষ্ঠানিক অভিযোগপত্র দাখিল',
                'due_at' => $dueAt,
            ]);

            // Store uploaded evidence files if any
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    if ($file && $file->isValid()) {
                        $path = $file->store('evidence', 'public');
                        ComplaintAttachment::create([
                            'complaint_id' => $complaint->id,
                            'file_path' => $path,
                            'original_filename' => $file->getClientOriginalName(),
                            'mime_type' => $file->getClientMimeType() ?: 'application/octet-stream',
                            'file_size' => $file->getSize() ?: 0,
                            'is_camera_capture' => str_starts_with($file->getClientMimeType() ?: '', 'image/'),
                            'is_private' => true,
                            'uploaded_by_user_id' => $user->id,
                        ]);
                    }
                }
            }

            // Store evidence web links if any
            if ($request->filled('evidence_links')) {
                $rawLinks = $request->input('evidence_links');
                $links = is_array($rawLinks) ? $rawLinks : json_decode($rawLinks, true);
                if (is_array($links)) {
                    foreach ($links as $lnk) {
                        $url = is_array($lnk) ? ($lnk['url'] ?? '') : (string)$lnk;
                        $title = is_array($lnk) ? ($lnk['title'] ?? 'সংযুক্ত ওয়েব লিংক') : 'সংযুক্ত ওয়েব লিংক';
                        if (!empty(trim((string)$url))) {
                            ComplaintAttachment::create([
                                'complaint_id' => $complaint->id,
                                'file_path' => trim((string)$url),
                                'original_filename' => $title ?: 'সংযুক্ত ওয়েব লিংক',
                                'mime_type' => 'text/uri-list',
                                'file_size' => strlen((string)$url),
                                'is_camera_capture' => false,
                                'is_private' => false,
                                'uploaded_by_user_id' => $user->id,
                            ]);
                        }
                    }
                }
            }

            // Audit Log
            AuditLog::logEvent('complaint_created_via_ai', $complaint, null, [
                'tracking_id' => $trackingId,
                'category' => $category->name_bn,
                'channel' => 'ai_complaint_assistant_formal',
                'priority' => $priority,
                'attachments_count' => $complaint->attachments()->count(),
            ], $user);

            // In-app Notification
            Notification::create([
                'user_id' => $user->id,
                'title_bn' => 'AI সহকারীর মাধ্যমে অভিযোগ দাখিল সম্পন্ন',
                'message_bn' => "আপনার ট্র্যাকিং আইডি {$trackingId}। অভিযোগটি সংশ্লিষ্ট দপ্তরে ({$office->name_bn}) পাঠানো হয়েছে।",
                'type' => 'success',
                'link' => route('complaint.track', ['id' => $trackingId]),
            ]);

            // Clear cache
            Cache::forget('public_home_data');
            Cache::forget('admin_dashboard_metrics');

            return response()->json([
                'success' => true,
                'tracking_id' => $trackingId,
                'complaint_id' => $complaint->id,
                'title' => $complaint->title,
                'office_name' => $office->name_bn,
                'category_name' => $category->name_bn,
                'officer_name' => $officer?->name_bn,
                'submitted_at' => now()->format('d/m/Y h:i A'),
                'due_at' => $dueAt ? $dueAt->format('d/m/Y') : null,
                'status_label' => 'গৃহীত ও প্রক্রিয়াধীন',
                'track_url' => route('complaint.track', ['id' => $trackingId]),
                'receipt' => [
                    'tracking_id' => $trackingId,
                    'title' => $complaint->title,
                    'office_name' => $office->name_bn,
                    'category_name' => $category->name_bn,
                    'complainant' => $name,
                    'priority' => $priority === 'urgent' ? 'জরুরি' : ($priority === 'high' ? 'উচ্চ' : 'স্বাভাবিক'),
                    'submitted_at' => now()->format('d/m/Y h:i A'),
                    'due_at' => $dueAt ? $dueAt->format('d/m/Y') : '৩ কার্যদিবস',
                    'status' => 'দাখিলকৃত (Submitted)'
                ],
                'message' => 'আপনার আনুষ্ঠানিক অভিযোগ সফলভাবে দাখিল হয়েছে।'
            ]);
        });
    }
}
