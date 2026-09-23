<?php

namespace Database\Seeders;

use App\Models\RoutingRule;
use App\Models\SlaRule;
use App\Models\EscalationRule;
use App\Models\SystemSetting;
use App\Models\ComplaintCategory;
use App\Models\District;
use App\Models\Office;
use App\Models\Organization;
use Illuminate\Database\Seeder;

class RulesAndSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $barishalDist = District::where('code', 'BARISHAL_DIST')->first();
        $cumillaDist = District::where('code', 'CUMILLA_DIST')->first();

        $dghs = Organization::where('code', 'DGHS')->first();
        $land = Organization::where('code', 'MINLAND')->first();
        $lgrd = Organization::where('code', 'LGD')->first();

        $csBarishal = Office::where('name_en', 'Civil Surgeon Office, Barishal')->first();
        $acLandBarishal = Office::where('name_en', 'Upazila Land Office, Barishal Sadar')->first();
        $engCumilla = Office::where('name_en', 'Engineering Department, Cumilla City Corporation')->first();

        $healthCat = ComplaintCategory::where('slug', 'health')->first();
        $landCat = ComplaintCategory::where('slug', 'land')->first();
        $localGovCat = ComplaintCategory::where('slug', 'local-government')->first();

        // 1. Routing Rules
        if ($healthCat && $dghs && $barishalDist) {
            RoutingRule::create([
                'name' => 'বরিশাল জেলা স্বাস্থ্য সংক্রান্ত অভিযোগ রাউটিং',
                'category_id' => $healthCat->id,
                'district_id' => $barishalDist->id,
                'target_organization_id' => $dghs->id,
                'target_office_id' => $csBarishal?->id,
                'priority_override' => null,
                'is_active' => true,
            ]);
        }

        if ($landCat && $land && $barishalDist) {
            RoutingRule::create([
                'name' => 'বরিশাল সদর ভূমি সেবা অভিযোগ রাউটিং',
                'category_id' => $landCat->id,
                'district_id' => $barishalDist->id,
                'target_organization_id' => $land->id,
                'target_office_id' => $acLandBarishal?->id,
                'is_active' => true,
            ]);
        }

        if ($localGovCat && $lgrd && $cumillaDist) {
            RoutingRule::create([
                'name' => 'কুমিল্লা সিটি কর্পোরেশন পৌরসেবা অভিযোগ রাউটিং',
                'category_id' => $localGovCat->id,
                'district_id' => $cumillaDist->id,
                'target_organization_id' => $lgrd->id,
                'target_office_id' => $engCumilla?->id,
                'is_active' => true,
            ]);
        }

        // 2. SLA Rules
        SlaRule::create(['priority' => 'urgent', 'review_sla_hours' => 6, 'investigation_sla_hours' => 24, 'resolution_sla_hours' => 48, 'is_active' => true]);
        SlaRule::create(['priority' => 'high', 'review_sla_hours' => 12, 'investigation_sla_hours' => 48, 'resolution_sla_hours' => 72, 'is_active' => true]);
        SlaRule::create(['priority' => 'medium', 'review_sla_hours' => 24, 'investigation_sla_hours' => 72, 'resolution_sla_hours' => 168, 'is_active' => true]);
        SlaRule::create(['priority' => 'low', 'review_sla_hours' => 48, 'investigation_sla_hours' => 120, 'resolution_sla_hours' => 336, 'is_active' => true]);

        // 3. Escalation Rules
        EscalationRule::create([
            'name' => '২৪ ঘণ্টা ওভারডিউতে দপ্তর প্রধানকে সতর্কবার্তা',
            'trigger_after_overdue_hours' => 24,
            'escalate_to_role' => 'dept_admin',
            'notification_message' => 'অভিযোগটির এসএলএ সময়সীমা ২৪ ঘণ্টা অতিক্রম করেছে। দ্রুত ব্যবস্থা নেওয়ার নির্দেশ দেওয়া হচ্ছে।',
            'is_active' => true,
        ]);

        EscalationRule::create([
            'name' => '৭২ ঘণ্টা ওভারডিউতে জেলা প্রশাসক ও কেন্দ্রীয় অ্যাডমিন এসকেলেশন',
            'trigger_after_overdue_hours' => 72,
            'escalate_to_role' => 'main_admin',
            'notification_message' => 'অভিযোগটি ৭২ ঘণ্টার বেশি সময় অতিবাহিত হলেও নিষ্পন্ন হয়নি। এটি কেন্দ্রীয় অডিট তালিকায় তোলা হয়েছে।',
            'is_active' => true,
        ]);

        // 4. System Settings
        SystemSetting::set('platform_title_bn', 'নাগরিক সেবা ও অভিযোগ প্রতিকার প্ল্যাটফর্ম', 'general', 'প্ল্যাটফর্মের নাম (বাংলা)');
        SystemSetting::set('platform_title_en', 'Civic Complaint Management Platform Bangladesh', 'general', 'Platform Title (English)');
        SystemSetting::set('pilot_focus', 'Barishal, Cumilla', 'general', 'পাইলট জেলাসমূহ');
        SystemSetting::set('sms_gateway_enabled', 'true', 'integration', 'এসএমএস গেটওয়ে সক্রিয়তা');
        SystemSetting::set('allow_anonymous_complaints', 'true', 'complaint', 'বেনামে অভিযোগ জমা দেওয়ার সুযোগ');
        SystemSetting::set('emergency_hotline_999', 'true', 'emergency', 'জরুরি সেবা ৯৯৯ ডিসপ্লে');
    }
}
