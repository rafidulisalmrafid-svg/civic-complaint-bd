<?php

namespace Database\Seeders;

use App\Models\ComplaintCategory;
use App\Models\ComplaintSubcategory;
use App\Models\CustomField;
use App\Models\Organization;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Ministries
        $mohfw = Organization::where('code', 'MOHFW')->first();
        $minland = Organization::where('code', 'MINLAND')->first();
        $lgd = Organization::where('code', 'LGD_MINISTRY')->first();
        $mpemr = Organization::where('code', 'MPEMR')->first();
        $mha = Organization::where('code', 'MHA')->first();
        $moef = Organization::where('code', 'MOEFCC')->first();
        $morb = Organization::where('code', 'RTHD')->first();
        $mopa = Organization::where('code', 'MOPA_CABINET')->first();

        // Specific Agencies
        $dghs = Organization::where('code', 'DGHS')->first();
        $landAdmin = Organization::where('code', 'AC_LAND_ADMIN')->first();
        $cityPouraAdmin = Organization::where('code', 'CITY_POURA_ADMIN')->first();
        $bpdb = Organization::where('code', 'BPDB')->first();
        $police = Organization::where('code', 'BD_POLICE')->first();
        $doe = Organization::where('code', 'DOE')->first();
        $rhd = Organization::where('code', 'RHD')->first();
        $acc = Organization::where('code', 'ACC')->first();
        $dcUno = Organization::where('code', 'DC_UNO_ADMIN')->first();

        // 1. Health & Medical Services
        $healthCat = ComplaintCategory::create([
            'name_bn' => 'স্বাস্থ্য ও চিকিৎসা সেবা',
            'name_en' => 'Health & Medical Services',
            'slug' => 'health',
            'icon' => 'activity',
            'description' => 'হাসপাতাল, চিকিৎসক অনুপস্থিতি, ঔষধ সংকট, চিকিৎসা অবহেলা ও অ্যাম্বুলেন্স সেবা সম্পর্কিত অভিযোগ',
            'default_priority' => 'high',
            'default_sla_days' => 5,
            'is_sensitive' => false,
            'ministry_id' => $mohfw?->id,
            'default_organization_id' => $dghs?->id,
            'display_order' => 1,
        ]);

        ComplaintSubcategory::create(['complaint_category_id' => $healthCat->id, 'name_bn' => 'সরকারি হাসপাতালে ডাক্তার অনুপস্থিতি', 'name_en' => 'Doctor Absenteeism', 'display_order' => 1]);
        ComplaintSubcategory::create(['complaint_category_id' => $healthCat->id, 'name_bn' => 'বিনামূল্যে সরকারি ঔষধ না দেওয়া বা সংকট', 'name_en' => 'Medicine Shortage', 'display_order' => 2]);
        ComplaintSubcategory::create(['complaint_category_id' => $healthCat->id, 'name_bn' => 'হাসপাতালের অপরিচ্ছন্নতা ও শয্যা সংকট', 'name_en' => 'Hospital Cleanliness', 'display_order' => 3]);
        ComplaintSubcategory::create(['complaint_category_id' => $healthCat->id, 'name_bn' => 'চিকিৎসায় অবহেলা বা ভুল চিকিৎসা', 'name_en' => 'Medical Negligence', 'display_order' => 4]);

        CustomField::create([
            'complaint_category_id' => $healthCat->id,
            'field_name' => 'hospital_name',
            'label_bn' => 'হাসপাতাল / স্বাস্থ্য কেন্দ্রের নাম',
            'label_en' => 'Hospital/Clinic Name',
            'field_type' => 'text',
            'placeholder_bn' => 'যেমন: বরিশাল শের-ই-বাংলা মেডিকেল বা উপজেলা স্বাস্থ্য কমপ্লেক্স',
            'is_required' => true,
            'display_order' => 1,
        ]);

        // 2. Land & Mutation Services
        $landCat = ComplaintCategory::create([
            'name_bn' => 'ভূমি সেবা ও বিরোধ',
            'name_en' => 'Land & Mutation Services',
            'slug' => 'land',
            'icon' => 'map-pin',
            'description' => 'নামজারি/খারিজ বিলম্ব, খতিয়ান সংক্রান্ত জটিলতা, ভূমি জবরদখল ও এসি ল্যান্ড অফিসের সেবা সংক্রান্ত',
            'default_priority' => 'medium',
            'default_sla_days' => 15,
            'is_sensitive' => false,
            'ministry_id' => $minland?->id,
            'default_organization_id' => $landAdmin?->id,
            'display_order' => 2,
        ]);

        ComplaintSubcategory::create(['complaint_category_id' => $landCat->id, 'name_bn' => 'ই-নামজারি (মিউটেশন) আবেদনে অযথা বিলম্ব', 'name_en' => 'E-Mutation Delay', 'display_order' => 1]);
        ComplaintSubcategory::create(['complaint_category_id' => $landCat->id, 'name_bn' => 'সরকারি বা খাস জমি জবরদখল', 'name_en' => 'Khas Land Encroachment', 'display_order' => 2]);
        ComplaintSubcategory::create(['complaint_category_id' => $landCat->id, 'name_bn' => 'ভূমি কর (খাজনা) দাখিলা প্রদানে হয়রানি', 'name_en' => 'Land Tax Harassment', 'display_order' => 3]);
        ComplaintSubcategory::create(['complaint_category_id' => $landCat->id, 'name_bn' => 'পরচা বা খতিয়ানে ভুল তথ্য সংশোধন', 'name_en' => 'Khatian Correction Issue', 'display_order' => 4]);

        CustomField::create([
            'complaint_category_id' => $landCat->id,
            'field_name' => 'khatian_dag_no',
            'label_bn' => 'খতিয়ান / দাগ নম্বর (যদি থাকে)',
            'label_en' => 'Khatian/Dag Number',
            'field_type' => 'text',
            'placeholder_bn' => 'যেমন: খতিয়ান নং ৪১২, দাগ নং ১২৮',
            'is_required' => false,
            'display_order' => 1,
        ]);

        // 3. Municipal & Local Gov Services
        $localGovCat = ComplaintCategory::create([
            'name_bn' => 'পৌরসেবা ও স্থানীয় সরকার',
            'name_en' => 'Municipal & Local Gov Services',
            'slug' => 'local-government',
            'icon' => 'building',
            'description' => 'ভাঙা রাস্তা, আবর্জনা অপসারণ, ড্রেনেজ ও জলাবদ্ধতা, স্ট্রিট লাইট নষ্ট ও জন্ম নিবন্ধন সনদ বিলম্ব',
            'default_priority' => 'medium',
            'default_sla_days' => 7,
            'is_sensitive' => false,
            'ministry_id' => $lgd?->id,
            'default_organization_id' => $cityPouraAdmin?->id,
            'display_order' => 3,
        ]);

        ComplaintSubcategory::create(['complaint_category_id' => $localGovCat->id, 'name_bn' => 'রাস্তার গর্ত ও বেহাল দশা', 'name_en' => 'Potholes & Broken Roads', 'display_order' => 1]);
        ComplaintSubcategory::create(['complaint_category_id' => $localGovCat->id, 'name_bn' => 'নিয়মিত বর্জ্য বা ময়লা অপসারণ না করা', 'name_en' => 'Waste Collection Delay', 'display_order' => 2]);
        ComplaintSubcategory::create(['complaint_category_id' => $localGovCat->id, 'name_bn' => 'ড্রেনেজ বন্ধ ও জলাবদ্ধতা', 'name_en' => 'Drainage Blockage', 'display_order' => 3]);
        ComplaintSubcategory::create(['complaint_category_id' => $localGovCat->id, 'name_bn' => 'রাস্তার বাতি বা স্ট্রিট লাইট বিকল', 'name_en' => 'Street Light Malfunction', 'display_order' => 4]);
        ComplaintSubcategory::create(['complaint_category_id' => $localGovCat->id, 'name_bn' => 'জন্ম ও মৃত্যু নিবন্ধন সনদে বিলম্ব ও অতিরিক্ত ফি', 'name_en' => 'Birth Certificate Delay', 'display_order' => 5]);

        // 4. Power & Utility Services
        $powerCat = ComplaintCategory::create([
            'name_bn' => 'বিদ্যুৎ ও জ্বালানি সেবা',
            'name_en' => 'Power & Utility Services',
            'slug' => 'power',
            'icon' => 'zap',
            'description' => 'ঘন ঘন লোডশেডিং, ট্রান্সফরমার বিকল, ভৌতিক বিদ্যুৎ বিল ও নতুন সংযোগে কালক্ষেপণ',
            'default_priority' => 'high',
            'default_sla_days' => 3,
            'is_sensitive' => false,
            'ministry_id' => $mpemr?->id,
            'default_organization_id' => $bpdb?->id,
            'display_order' => 4,
        ]);

        ComplaintSubcategory::create(['complaint_category_id' => $powerCat->id, 'name_bn' => 'অতিরিক্ত ও ভৌতিক বিদ্যুৎ বিল', 'name_en' => 'Erroneous Power Bill', 'display_order' => 1]);
        ComplaintSubcategory::create(['complaint_category_id' => $powerCat->id, 'name_bn' => 'ট্রান্সফরমার পুড়ে যাওয়া বা দীর্ঘ বিদ্যুৎ বিভ্রাট', 'name_en' => 'Transformer Defect', 'display_order' => 2]);
        ComplaintSubcategory::create(['complaint_category_id' => $powerCat->id, 'name_bn' => 'নতুন বিদ্যুৎ সংযোগে দীর্ঘসূত্রিতা', 'name_en' => 'Connection Delay', 'display_order' => 3]);

        CustomField::create([
            'complaint_category_id' => $powerCat->id,
            'field_name' => 'customer_account_no',
            'label_bn' => 'গ্রাহক হিসাব নম্বর / মিটার নম্বর',
            'label_en' => 'Account / Meter Number',
            'field_type' => 'text',
            'placeholder_bn' => 'বিদ্যুৎ বিলের ৮ সংখ্যার হিসাব নম্বর',
            'is_required' => false,
            'display_order' => 1,
        ]);

        // 5. Women & Children (Sensitive)
        $womenCat = ComplaintCategory::create([
            'name_bn' => 'নারী ও শিশু সুরক্ষা এবং সংবেদনশীল অভিযোগ',
            'name_en' => 'Women & Children Protection',
            'slug' => 'women-children',
            'icon' => 'heart-handshake',
            'description' => 'ইভটিজিং, যৌতুক ও পারিবারিক নির্যাতন, বাল্যবিয়ে ও জরুরি ব্যক্তিগত নিরাপত্তা (তথ্য অত্যন্ত গোপনীয় রাখা হয়)',
            'default_priority' => 'urgent',
            'default_sla_days' => 2,
            'is_sensitive' => true,
            'ministry_id' => $mha?->id,
            'default_organization_id' => $police?->id,
            'display_order' => 5,
        ]);

        ComplaintSubcategory::create(['complaint_category_id' => $womenCat->id, 'name_bn' => 'রাস্তাঘাটে বা কর্মক্ষেত্রে ইভটিজিং ও হেনস্তা', 'name_en' => 'Stalking & Harassment', 'display_order' => 1]);
        ComplaintSubcategory::create(['complaint_category_id' => $womenCat->id, 'name_bn' => 'বাল্যবিয়ে প্রতিরোধের জন্য তথ্য', 'name_en' => 'Child Marriage Prevention', 'display_order' => 2]);
        ComplaintSubcategory::create(['complaint_category_id' => $womenCat->id, 'name_bn' => 'পারিবারিক সহিংসতা ও হুমকি', 'name_en' => 'Domestic Violence & Safety', 'display_order' => 3]);

        // 6. Corruption & Bribery
        $corruptionCat = ComplaintCategory::create([
            'name_bn' => 'দুর্নীতি ও ঘুষ সংক্রান্ত অভিযোগ',
            'name_en' => 'Corruption & Bribery',
            'slug' => 'corruption',
            'icon' => 'scale',
            'description' => 'সরকারি কর্মকর্তা/কর্মচারীর ঘুষ দাবি, প্রকল্পের অর্থ আত্মসাৎ ও ক্ষমতার অপব্যবহার',
            'default_priority' => 'high',
            'default_sla_days' => 10,
            'is_sensitive' => true,
            'ministry_id' => $mopa?->id,
            'default_organization_id' => $acc?->id,
            'display_order' => 6,
        ]);

        ComplaintSubcategory::create(['complaint_category_id' => $corruptionCat->id, 'name_bn' => 'সেবা প্রদানের বিনিময়ে ঘুষ দাবি', 'name_en' => 'Bribery Demand', 'display_order' => 1]);
        ComplaintSubcategory::create(['complaint_category_id' => $corruptionCat->id, 'name_bn' => 'উন্নয়ন প্রকল্পের অর্থ আত্মসাৎ বা অনিয়ম', 'name_en' => 'Public Fund Embezzlement', 'display_order' => 2]);

        // 7. Environment & River
        $envCat = ComplaintCategory::create([
            'name_bn' => 'পরিবেশ দূষণ ও নদী দখল',
            'name_en' => 'Environment & River Encroachment',
            'slug' => 'environment',
            'icon' => 'leaf',
            'description' => 'কারখানার বর্জ্যদূষণ, শব্দদূষণ, ইটভাটার ধোঁয়া, নদী/খাল ভরাট ও অবৈধ বালু উত্তোলন',
            'default_priority' => 'medium',
            'default_sla_days' => 7,
            'is_sensitive' => false,
            'ministry_id' => $moef?->id,
            'default_organization_id' => $doe?->id,
            'display_order' => 7,
        ]);

        ComplaintSubcategory::create(['complaint_category_id' => $envCat->id, 'name_bn' => 'অবৈধ ইটভাটা ও বায়ুদূষণ', 'name_en' => 'Illegal Brick Kiln', 'display_order' => 1]);
        ComplaintSubcategory::create(['complaint_category_id' => $envCat->id, 'name_bn' => 'খাল বা নদী দখল ও ভরাট', 'name_en' => 'River/Canal Encroachment', 'display_order' => 2]);
        ComplaintSubcategory::create(['complaint_category_id' => $envCat->id, 'name_bn' => 'অবৈধভাবে ড্রেজার দিয়ে বালু উত্তোলন', 'name_en' => 'Illegal Sand Mining', 'display_order' => 3]);

        // 8. Road Transport & Infrastructure
        $roadCat = ComplaintCategory::create([
            'name_bn' => 'সড়ক, সেতু ও যানবাহন সেবা',
            'name_en' => 'Roads, Bridges & Transport',
            'slug' => 'roads-transport',
            'icon' => 'truck',
            'description' => 'মহাসড়কের ক্ষতি, ঝুঁকিপূর্ণ ব্রিজ ও গণপরিবহনে অতিরিক্ত ভাড়া বা হয়রানি সংক্রান্ত',
            'default_priority' => 'medium',
            'default_sla_days' => 7,
            'is_sensitive' => false,
            'ministry_id' => $morb?->id,
            'default_organization_id' => $rhd?->id,
            'display_order' => 8,
        ]);

        ComplaintSubcategory::create(['complaint_category_id' => $roadCat->id, 'name_bn' => 'মহাসড়কে ভাঙন বা ঝুঁকিপূর্ণ সেতু', 'name_en' => 'Damaged Highway / Bridge', 'display_order' => 1]);
        ComplaintSubcategory::create(['complaint_category_id' => $roadCat->id, 'name_bn' => 'ফিটনেসবিহীন গাড়ি ও অতিরিক্ত ভাড়া আদায়', 'name_en' => 'Unfit Vehicle / Overcharging', 'display_order' => 2]);

        // 9. Other Civic Complaints
        $otherCat = ComplaintCategory::create([
            'name_bn' => 'অন্যান্য সাধারণ নাগরিক অভিযোগ',
            'name_en' => 'Other Civic Complaints',
            'slug' => 'other',
            'icon' => 'help-circle',
            'description' => 'উপরে উল্লেখিত বিষয়ের বাইরে যেকোনো সাধারণ নাগরিক সমস্যা বা প্রশাসনিক সেবা বিঘ্নতা',
            'default_priority' => 'medium',
            'default_sla_days' => 7,
            'is_sensitive' => false,
            'ministry_id' => $mopa?->id,
            'default_organization_id' => $dcUno?->id,
            'display_order' => 9,
        ]);

        ComplaintSubcategory::create(['complaint_category_id' => $otherCat->id, 'name_bn' => 'সাধারণ প্রশাসনিক অসুবিধা', 'name_en' => 'General Administrative Issue', 'display_order' => 1]);
    }
}
