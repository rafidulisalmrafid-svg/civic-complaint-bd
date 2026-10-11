<?php

namespace Database\Seeders;

use App\Models\Office;
use App\Models\OfficeBranch;
use App\Models\OfficerProfile;
use App\Models\Post;
use App\Models\ComplaintCategory;
use App\Models\ComplaintProblemType;
use Illuminate\Database\Seeder;

class BranchAndProblemTypeSeeder extends Seeder
{
    public function run(): void
    {
        // ==========================================
        // 1. SEED OFFICE BRANCHES / DEPARTMENTS
        // ==========================================
        $offices = Office::all();

        foreach ($offices as $office) {
            $org = $office->organization;
            $orgCode = $org ? $org->code : '';
            $officeName = $office->name_en;

            // Health Offices (Hospitals & Health Complexes)
            if (str_contains($officeName, 'Hospital') || str_contains($officeName, 'Health') || str_contains($orgCode, 'HEALTH') || str_contains($orgCode, 'DGHS')) {
                $branches = [
                    ['name_bn' => 'অর্থোপেডিকস ও ট্রমা বিভাগ', 'name_en' => 'Orthopedics & Trauma', 'code' => 'ORTHO', 'room_number' => '২০৪', 'floor' => '২য় তলা'],
                    ['name_bn' => 'জেনারেল মেডিসিন বিভাগ', 'name_en' => 'General Medicine', 'code' => 'MED', 'room_number' => '১০২', 'floor' => '১ম তলা'],
                    ['name_bn' => 'জেনারেল সার্জারি বিভাগ', 'name_en' => 'General Surgery', 'code' => 'SURG', 'room_number' => '৩০১', 'floor' => '৩য় তলা'],
                    ['name_bn' => 'কার্ডিওলজি (হৃদরোগ) বিভাগ', 'name_en' => 'Cardiology', 'code' => 'CARDIO', 'room_number' => '২০৮', 'floor' => '২য় তলা'],
                    ['name_bn' => 'শিশু ও নবজাতক বিভাগ', 'name_en' => 'Pediatrics', 'code' => 'PEDIA', 'room_number' => '১০৫', 'floor' => '১ম তলা'],
                    ['name_bn' => 'জরুরি বিভাগ ও ক্যাজুয়াল্টি', 'name_en' => 'Emergency & Casualty', 'code' => 'EMERGENCY', 'room_number' => 'গ্রাউন্ড ফ্লোর', 'floor' => 'নিচতলা'],
                    ['name_bn' => 'সরকারি ডিসপেনসারি ও ফার্মেসি', 'name_en' => 'Dispensary & Pharmacy', 'code' => 'PHARMACY', 'room_number' => '১০১', 'floor' => 'নিচতলা'],
                ];
                foreach ($branches as $b) {
                    OfficeBranch::firstOrCreate(['office_id' => $office->id, 'code' => $b['code']], $b);
                }
            }
            // Land Offices (AC Land & Sub-Registry)
            elseif (str_contains($officeName, 'Land') || str_contains($officeName, 'AC Land') || str_contains($orgCode, 'LAND')) {
                $branches = [
                    ['name_bn' => 'ই-নামজারি ও রেকর্ড শাখা', 'name_en' => 'E-Mutation & Record Section', 'code' => 'MUTATION', 'room_number' => '১০৩', 'floor' => '১ম তলা'],
                    ['name_bn' => 'ভূমি উন্নয়ন কর ও খাজনা শাখা', 'name_en' => 'Land Development Tax', 'code' => 'LD_TAX', 'room_number' => '১০১', 'floor' => 'নিচতলা'],
                    ['name_bn' => 'কানুনগো ও মাঠ জরিপ শাখা', 'name_en' => 'Survey & Field Inspection', 'code' => 'SURVEY', 'room_number' => '১০৪', 'floor' => '১ম তলা'],
                    ['name_bn' => 'খতিয়ান ও পরচা বিতরণ শাখা', 'name_en' => 'Record Room & Porcha Distribution', 'code' => 'RECORD_ROOM', 'room_number' => '১০২', 'floor' => 'নিচতলা'],
                    ['name_bn' => 'শুনানি ও মিসকেস এজলাস', 'name_en' => 'Hearing & Misc Case Court', 'code' => 'HEARING', 'room_number' => '২০১', 'floor' => '২য় তলা'],
                ];
                foreach ($branches as $b) {
                    OfficeBranch::firstOrCreate(['office_id' => $office->id, 'code' => $b['code']], $b);
                }
            }
            // Police Stations / Thanas
            elseif (str_contains($officeName, 'Thana') || str_contains($officeName, 'Police') || str_contains($orgCode, 'POLICE')) {
                $branches = [
                    ['name_bn' => 'ডিউটি অফিসার ডেস্ক (জিডি ও অভিযোগ গ্রহণ)', 'name_en' => 'Duty Officer Desk (GD & Complaint)', 'code' => 'DUTY_DESK', 'room_number' => '১০১', 'floor' => 'নিচতলা'],
                    ['name_bn' => 'তদন্ত ও মামলা পরিচালনা শাখা', 'name_en' => 'Investigation Section', 'code' => 'INVESTIGATION', 'room_number' => '১০২', 'floor' => '১ম তলা'],
                    ['name_bn' => 'নারী ও শিশু সহায়তা ডেস্ক', 'name_en' => 'Women & Children Help Desk', 'code' => 'WOMEN_HELP', 'room_number' => '১০৩', 'floor' => '১ম তলা'],
                    ['name_bn' => 'ট্রাফিক ও সড়ক শৃঙ্খলা ইউনিট', 'name_en' => 'Traffic & Road Safety Unit', 'code' => 'TRAFFIC', 'room_number' => '১০৫', 'floor' => 'নিচতলা'],
                ];
                foreach ($branches as $b) {
                    OfficeBranch::firstOrCreate(['office_id' => $office->id, 'code' => $b['code']], $b);
                }
            }
            // Local Government / City Corporation / Pourashava
            elseif (str_contains($officeName, 'Corporation') || str_contains($officeName, 'Pourashava') || str_contains($orgCode, 'CITY_CORP') || str_contains($orgCode, 'POURASHAVA')) {
                $branches = [
                    ['name_bn' => 'বর্জ্য ব্যবস্থাপনা ও পরিচ্ছন্নতা বিভাগ', 'name_en' => 'Waste Management & Conservancy', 'code' => 'CONSERVANCY', 'room_number' => '১০১', 'floor' => 'নিচতলা'],
                    ['name_bn' => 'সড়ক বাতি ও বৈদ্যুতিক শাখা', 'name_en' => 'Street Light & Electrical Branch', 'code' => 'STREET_LIGHT', 'room_number' => '২০২', 'floor' => '২য় তলা'],
                    ['name_bn' => 'পানি সরবরাহ ও পয়ঃনিষ্কাশন শাখা', 'name_en' => 'Water Supply & Drainage', 'code' => 'DRAINAGE', 'room_number' => '২০৩', 'floor' => '২য় তলা'],
                    ['name_bn' => 'ট্রেড লাইসেন্স ও রাজস্ব শাখা', 'name_en' => 'Trade License & Revenue', 'code' => 'TRADE_LIC', 'room_number' => '১০৪', 'floor' => '১ম তলা'],
                    ['name_bn' => 'ইমারত নির্মাণ ও প্ল্যান অনুমোদন শাখা', 'name_en' => 'Building Planning & Approval', 'code' => 'PLANNING', 'room_number' => '৩০১', 'floor' => '৩য় তলা'],
                ];
                foreach ($branches as $b) {
                    OfficeBranch::firstOrCreate(['office_id' => $office->id, 'code' => $b['code']], $b);
                }
            }
            // Education Offices
            elseif (str_contains($officeName, 'Education') || str_contains($orgCode, 'EDUCATION') || str_contains($orgCode, 'DSHE')) {
                $branches = [
                    ['name_bn' => 'ভর্তি ও ফি নিরীক্ষা শাখা', 'name_en' => 'Admission & Fee Audit', 'code' => 'ADMISSION', 'room_number' => '১০১', 'floor' => '১ম তলা'],
                    ['name_bn' => 'সনদ, প্রতিলিপি ও সংশোধন শাখা', 'name_en' => 'Certificate & Correction', 'code' => 'CERTIFICATE', 'room_number' => '১০২', 'floor' => '১ম তলা'],
                    ['name_bn' => 'উপবৃত্তি ও কল্যাণ ফান্ড শাখা', 'name_en' => 'Stipend & Welfare Section', 'code' => 'STIPEND', 'room_number' => '২০১', 'floor' => '২য় তলা'],
                ];
                foreach ($branches as $b) {
                    OfficeBranch::firstOrCreate(['office_id' => $office->id, 'code' => $b['code']], $b);
                }
            }
            // General Office fallback
            else {
                $branches = [
                    ['name_bn' => 'সাধারণ নাগরিক সেবা ডেস্ক', 'name_en' => 'Citizen Service Desk', 'code' => 'GENERAL_DESK', 'room_number' => '১০১', 'floor' => 'নিচতলা'],
                    ['name_bn' => 'অভিযোগ গ্রহণ ও তদন্ত সেল', 'name_en' => 'Complaint & Inspection Cell', 'code' => 'COMPLAINT_CELL', 'room_number' => '১০২', 'floor' => '১ম তলা'],
                ];
                foreach ($branches as $b) {
                    OfficeBranch::firstOrCreate(['office_id' => $office->id, 'code' => $b['code']], $b);
                }
            }
        }

        // ==========================================
        // 2. SEED SMART PREDEFINED PROBLEM TYPES
        // ==========================================
        $categories = ComplaintCategory::all();

        foreach ($categories as $cat) {
            $catCode = strtoupper($cat->slug);

            // Healthcare Problems
            if (str_contains($catCode, 'HEALTH') || str_contains($cat->name_en, 'Health')) {
                $issues = [
                    // Doctor cluster
                    ['cluster_name_bn' => 'চিকিৎসক সংক্রান্ত', 'cluster_name_en' => 'Doctor', 'title_bn' => 'ডাক্তার নির্ধারিত সময়ে কর্মস্থলে উপস্থিত ছিলেন না / পাওয়া যায়নি', 'severity' => 'high'],
                    ['cluster_name_bn' => 'চিকিৎসক সংক্রান্ত', 'cluster_name_en' => 'Doctor', 'title_bn' => 'ডাক্তার ঠিকমতো মনোযোগ দিয়ে রোগী দেখেননি ও খারাপ আচরণ করেছেন', 'severity' => 'medium'],
                    ['cluster_name_bn' => 'চিকিৎসক সংক্রান্ত', 'cluster_name_en' => 'Doctor', 'title_bn' => 'সরকারি হাসপাতালে বাইরে থেকে অপ্রয়োজনীয় ডায়াগনস্টিক পরীক্ষা করাতে বাধ্য করেছেন', 'severity' => 'high'],
                    ['cluster_name_bn' => 'চিকিৎসক সংক্রান্ত', 'cluster_name_en' => 'Doctor', 'title_bn' => 'জরুরি বিভাগে অবিলম্বে চিকিৎসা প্রদানে অবহেলা করা হয়েছে', 'severity' => 'urgent'],

                    // Staff & Nurse cluster
                    ['cluster_name_bn' => 'স্টাফ ও নার্স সংক্রান্ত', 'cluster_name_en' => 'Staff & Nurse', 'title_bn' => 'ওয়ার্ড বয় বা স্টাফ রোগীর স্বজনদের সাথে দুর্ব্যবহার করেছে', 'severity' => 'medium'],
                    ['cluster_name_bn' => 'স্টাফ ও নার্স সংক্রান্ত', 'cluster_name_en' => 'Staff & Nurse', 'title_bn' => 'ট্রলি, সিট বা হুইলচেয়ারের জন্য জোরপূর্বক বকশিশ/টাকা দাবি করা হয়েছে', 'severity' => 'high'],
                    ['cluster_name_bn' => 'স্টাফ ও নার্স সংক্রান্ত', 'cluster_name_en' => 'Staff & Nurse', 'title_bn' => 'নার্স সময়মতো ওষুধ বা স্যালাইন পুশ করেননি', 'severity' => 'high'],

                    // Medicine cluster
                    ['cluster_name_bn' => 'ওষুধ ও ফার্মেসি', 'cluster_name_en' => 'Medicine', 'title_bn' => 'স্টকে সরকারি ওষুধ থাকা সত্ত্বেও রোগীদের সরবরাহ না করে বাইরে কিনতে বলেছে', 'severity' => 'high'],
                    ['cluster_name_bn' => 'ওষুধ ও ফার্মেসি', 'cluster_name_en' => 'Medicine', 'title_bn' => 'বিনামূল্যে বিতরণের ওষুধে অতিরিক্ত টাকা আদায় করা হয়েছে', 'severity' => 'urgent'],

                    // Bribery / Extra Money
                    ['cluster_name_bn' => 'ঘুষ ও অনিয়ম', 'cluster_name_en' => 'Bribery & Fraud', 'title_bn' => 'অপারেশন বা বেডের জন্য অবৈধভাবে টাকা/ঘুষ দাবি করা হয়েছে', 'severity' => 'urgent'],
                    ['cluster_name_bn' => 'ঘুষ ও অনিয়ম', 'cluster_name_en' => 'Bribery & Fraud', 'title_bn' => 'টিকিট বা ওপিডি স্লিপে নির্ধারিত ফি-র চেয়ে বেশি টাকা রাখা হয়েছে', 'severity' => 'medium'],

                    // Service Delay & Quality
                    ['cluster_name_bn' => 'বিলম্ব ও পরিবেশ', 'cluster_name_en' => 'Delay & Cleanliness', 'title_bn' => 'হাসপাতালের প্যাথলজি/এক্সরে রিপোর্ট পেতে অযথা একাধিক দিন বিলম্ব হয়েছে', 'severity' => 'medium'],
                    ['cluster_name_bn' => 'বিলম্ব ও পরিবেশ', 'cluster_name_en' => 'Delay & Cleanliness', 'title_bn' => 'ওয়ার্ড ও শৌচাগার অপরিচ্ছন্ন ও ব্যবহারের অনুপযোগী ছিল', 'severity' => 'low'],
                ];
                foreach ($issues as $idx => $iss) {
                    ComplaintProblemType::firstOrCreate(
                        ['category_id' => $cat->id, 'title_bn' => $iss['title_bn']],
                        array_merge($iss, ['display_order' => $idx + 1])
                    );
                }
            }
            // Land Problems
            elseif (str_contains($catCode, 'LAND') || str_contains($cat->name_en, 'Land')) {
                $issues = [
                    ['cluster_name_bn' => 'নামজারি ও আবেদন', 'cluster_name_en' => 'Mutation', 'title_bn' => 'নির্দিষ্ট ২৮ কর্মদিবস পার হলেও নামজারি (মিউটেশন) নিষ্পত্তি হয়নি', 'severity' => 'high'],
                    ['cluster_name_bn' => 'ঘুষ ও অবৈধ অর্থ', 'cluster_name_en' => 'Bribery', 'title_bn' => 'ভূমি জরিপ বা তদন্ত প্রতিবেদনের জন্য কানুনগো/সার্ভেয়ার অবৈধ টাকা দাবি করেছেন', 'severity' => 'urgent'],
                    ['cluster_name_bn' => 'ঘুষ ও অবৈধ অর্থ', 'cluster_name_en' => 'Bribery', 'title_bn' => 'ইউনিয়ন ভূমি অফিসে খাজনা/দাখিলা কাটতে অতিরিক্ত অর্থ দাবি করা হয়েছে', 'severity' => 'high'],
                    ['cluster_name_bn' => 'হয়রানি ও বিলম্ব', 'cluster_name_en' => 'Harassment', 'title_bn' => 'শুনানির তারিখ দিয়ে বারবার বিনা কারণে মুলতবি করে হয়রানি করা হচ্ছে', 'severity' => 'medium'],
                    ['cluster_name_bn' => 'হয়রানি ও বিলম্ব', 'cluster_name_en' => 'Harassment', 'title_bn' => 'রেকর্ড রুম থেকে খতিয়ান/পরচার সার্টিফায়েড কপি দিতে অযথা বিলম্ব করছে', 'severity' => 'medium'],
                ];
                foreach ($issues as $idx => $iss) {
                    ComplaintProblemType::firstOrCreate(
                        ['category_id' => $cat->id, 'title_bn' => $iss['title_bn']],
                        array_merge($iss, ['display_order' => $idx + 1])
                    );
                }
            }
            // Police Problems
            elseif (str_contains($catCode, 'POLICE') || str_contains($catCode, 'LAW') || str_contains($cat->name_en, 'Police')) {
                $issues = [
                    ['cluster_name_bn' => 'জিডি ও অভিযোগ গ্রহণ', 'cluster_name_en' => 'GD & FIR', 'title_bn' => 'থানায় সাধারণ ডায়েরি (GD) বা লিখিত অভিযোগ নিতে অযথা গড়িমসি/অস্বীকৃতি জানিয়েছে', 'severity' => 'high'],
                    ['cluster_name_bn' => 'তদন্ত ও অনিয়ম', 'cluster_name_en' => 'Investigation', 'title_bn' => 'তদন্তকারী কর্মকর্তা পক্ষপাতমূলক আচরণ করেছেন বা অনৈতিক সুবিধা চেয়েছেন', 'severity' => 'urgent'],
                    ['cluster_name_bn' => 'হয়রানি ও আচরণ', 'cluster_name_en' => 'Harassment', 'title_bn' => 'ডিউটি অফিসার বা পুলিশ সদস্য সাধারণ নাগরিকের সাথে অপমানজনক আচরণ করেছেন', 'severity' => 'high'],
                    ['cluster_name_bn' => 'পাসপোর্ট ও ভেরিফিকেশন', 'cluster_name_en' => 'Verification', 'title_bn' => 'পাসপোর্ট বা পুলিশ ক্লিয়ারেন্স ভেরিফিকেশনে টাকা না দেওয়ায় রিপোর্ট আটকে রাখা হয়েছে', 'severity' => 'urgent'],
                ];
                foreach ($issues as $idx => $iss) {
                    ComplaintProblemType::firstOrCreate(
                        ['category_id' => $cat->id, 'title_bn' => $iss['title_bn']],
                        array_merge($iss, ['display_order' => $idx + 1])
                    );
                }
            }
            // Local Government / City Corporation Problems
            elseif (str_contains($catCode, 'LOCAL') || str_contains($catCode, 'MUNICIPAL') || str_contains($cat->name_en, 'Local')) {
                $issues = [
                    ['cluster_name_bn' => 'বর্জ্য ও পরিচ্ছন্নতা', 'cluster_name_en' => 'Waste', 'title_bn' => 'রাস্তা ও আবাসিক এলাকায় দীর্ঘদিন ময়লা-আবর্জনা জমে রয়েছে, সরানো হয়নি', 'severity' => 'medium'],
                    ['cluster_name_bn' => 'ড্রেনেজ ও জলাবদ্ধতা', 'cluster_name_en' => 'Drainage', 'title_bn' => 'ড্রেন ভরাট হয়ে সামান্য বৃষ্টিতেই রাস্তায় নোংরা পানির জলাবদ্ধতা তৈরি হচ্ছে', 'severity' => 'high'],
                    ['cluster_name_bn' => 'সড়ক বাতি', 'cluster_name_en' => 'Lighting', 'title_bn' => 'এলাকার সড়ক বাতি দীর্ঘদিন অকেজো/নষ্ট থাকায় অন্ধকারে দুর্ঘটনা ঝুঁকি বাড়ছে', 'severity' => 'medium'],
                    ['cluster_name_bn' => 'ট্রেড লাইসেন্স ও সনদ', 'cluster_name_en' => 'Certificate', 'title_bn' => 'জন্ম নিবন্ধন বা ট্রেড লাইসেন্স পেতে সরকারি ফির বেশি টাকা চাওয়া হয়েছে', 'severity' => 'high'],
                ];
                foreach ($issues as $idx => $iss) {
                    ComplaintProblemType::firstOrCreate(
                        ['category_id' => $cat->id, 'title_bn' => $iss['title_bn']],
                        array_merge($iss, ['display_order' => $idx + 1])
                    );
                }
            }
            // Education Problems
            elseif (str_contains($catCode, 'EDU') || str_contains($cat->name_en, 'Education')) {
                $issues = [
                    ['cluster_name_bn' => 'ভর্তি ও ফি', 'cluster_name_en' => 'Admission', 'title_bn' => 'সরকারি নীতিমালার অতিরিক্ত ভর্তি ফি ও সেশন চার্জ দাবি করা হয়েছে', 'severity' => 'high'],
                    ['cluster_name_bn' => 'শিক্ষক ও ক্লাস', 'cluster_name_en' => 'Teacher', 'title_bn' => 'শিক্ষক ক্লাসে নিয়মিত উপস্থিত থাকেন না বা প্রাইভেট পড়ার জন্য চাপ দেন', 'severity' => 'medium'],
                    ['cluster_name_bn' => 'সনদ ও ডকুমেন্টস', 'cluster_name_en' => 'Certificate', 'title_bn' => 'প্রশংসাপত্র, প্রশংসাপত্র বা ছাড়পত্র দিতে অহেতুক ঘুষ/টাকা দাবি করা হয়েছে', 'severity' => 'high'],
                ];
                foreach ($issues as $idx => $iss) {
                    ComplaintProblemType::firstOrCreate(
                        ['category_id' => $cat->id, 'title_bn' => $iss['title_bn']],
                        array_merge($iss, ['display_order' => $idx + 1])
                    );
                }
            }
            // General / Default Problems
            else {
                $issues = [
                    ['cluster_name_bn' => 'সেবায় বিলম্ব', 'cluster_name_en' => 'Delay', 'title_bn' => 'সরকারি সেবা পেতে অযথা কালক্ষেপণ ও ফাইলের কাজ ঝুলিয়ে রাখা হয়েছে', 'severity' => 'medium'],
                    ['cluster_name_bn' => 'ঘুষ ও দুর্নীতি', 'cluster_name_en' => 'Bribery', 'title_bn' => 'ন্যায়সঙ্গত অধিকার বা সেবার বিনিময়ে অবৈধ অর্থ/সুবিধা দাবি করা হয়েছে', 'severity' => 'urgent'],
                    ['cluster_name_bn' => 'আচরণ ও হয়রানি', 'cluster_name_en' => 'Harassment', 'title_bn' => 'দায়িত্বপ্রাপ্ত কর্মকর্তা বা কর্মচারী অপেশাদার ও অপমানজনক আচরণ করেছেন', 'severity' => 'high'],
                    ['cluster_name_bn' => 'অনুপস্থিতি', 'cluster_name_en' => 'Absenteeism', 'title_bn' => 'অফিস চলাকালীন সময়ে দায়িত্বে থাকা কোনো কর্মকর্তাকে পাওয়া যায়নি', 'severity' => 'medium'],
                ];
                foreach ($issues as $idx => $iss) {
                    ComplaintProblemType::firstOrCreate(
                        ['category_id' => $cat->id, 'title_bn' => $iss['title_bn']],
                        array_merge($iss, ['display_order' => $idx + 1])
                    );
                }
            }
        }

        // ==========================================
        // 3. MAP EXISTING OFFICERS TO BRANCHES & POSTS
        // ==========================================
        $officers = OfficerProfile::all();
        $posts = Post::all()->keyBy('code');

        foreach ($officers as $officer) {
            $office = $officer->office;
            if (! $office) continue;

            $branch = OfficeBranch::where('office_id', $office->id)->first();
            $officer->office_branch_id = $branch?->id;

            // Map post
            if (str_contains($officer->designation_bn, 'সিভিল সার্জন')) {
                $officer->post_id = $posts['CIVIL_SURG']?->id;
                $officer->is_office_focal_point = true;
                $officer->is_district_complaint_officer = true;
            } elseif (str_contains($officer->designation_bn, 'নির্বাহী প্রকৌশলী')) {
                $officer->post_id = $posts['EXEC_ENGR']?->id;
                $officer->is_office_focal_point = true;
            } elseif (str_contains($officer->designation_bn, 'সহকারী কমিশনার') || str_contains($officer->designation_bn, 'এসি ল্যান্ড')) {
                $officer->post_id = $posts['AC_LAND']?->id;
                $officer->is_office_focal_point = true;
            } elseif (str_contains($officer->designation_bn, 'কনসালট্যান্ট')) {
                $officer->post_id = $posts['SR_CONSULT']?->id;
            } elseif (str_contains($officer->designation_bn, 'অফিসার')) {
                $officer->post_id = $posts['MED_OFFICER']?->id;
            } else {
                $officer->post_id = $posts['MED_OFFICER']?->id ?? 1;
            }

            $officer->save();
        }

        // Add specific doctors to Orthopedics and Medicine in Barishal & Cumilla Hospitals
        $barishalHospital = Office::where('name_en', 'like', '%Hospital%')->where('district_id', 1)->first()
            ?? Office::where('district_id', 1)->first();

        if ($barishalHospital) {
            $orthoBranch = OfficeBranch::where('office_id', $barishalHospital->id)->where('code', 'ORTHO')->first();
            $medBranch = OfficeBranch::where('office_id', $barishalHospital->id)->where('code', 'MED')->first();

            if ($orthoBranch) {
                // Doctor 1: Dr. Mahbubur Rahman - Senior Consultant Orthopedics
                $doc1 = OfficerProfile::firstOrCreate([
                    'official_phone' => '01711002233',
                ], [
                    'user_id' => 2, // Officer user
                    'employee_id' => 'EMP-MED-084',
                    'name_bn' => 'ডাঃ মোঃ মাহবুবুর রহমান',
                    'name_en' => 'Dr. Md. Mahbubur Rahman',
                    'designation_bn' => 'সিনিয়র কনসালট্যান্ট (অর্থোপেডিকস)',
                    'designation_en' => 'Senior Consultant (Orthopedics)',
                    'official_email' => 'dr.mahbub@barishal.gov.bd',
                    'organization_id' => $barishalHospital->organization_id,
                    'office_id' => $barishalHospital->id,
                    'office_branch_id' => $orthoBranch->id,
                    'post_id' => $posts['SR_CONSULT']?->id,
                    'division_id' => $barishalHospital->division_id,
                    'district_id' => $barishalHospital->district_id,
                    'upazila_id' => $barishalHospital->upazila_id,
                    'joining_date' => '2023-01-15',
                    'status' => 'active',
                ]);

                // Doctor 2: Dr. Tasnim Jahan - Medical Officer Orthopedics
                $doc2 = OfficerProfile::firstOrCreate([
                    'official_phone' => '01711002244',
                ], [
                    'employee_id' => 'EMP-MED-085',
                    'name_bn' => 'ডাঃ তাসনিম জাহান',
                    'name_en' => 'Dr. Tasnim Jahan',
                    'designation_bn' => 'রেজিস্ট্রার ও মেডিকেল অফিসার (অর্থোপেডিকস)',
                    'designation_en' => 'Registrar & Medical Officer (Orthopedics)',
                    'official_email' => 'dr.tasnim@barishal.gov.bd',
                    'organization_id' => $barishalHospital->organization_id,
                    'office_id' => $barishalHospital->id,
                    'office_branch_id' => $orthoBranch->id,
                    'post_id' => $posts['MED_OFFICER']?->id,
                    'division_id' => $barishalHospital->division_id,
                    'district_id' => $barishalHospital->district_id,
                    'upazila_id' => $barishalHospital->upazila_id,
                    'joining_date' => '2024-03-01',
                    'status' => 'active',
                ]);
            }
        }
    }
}
