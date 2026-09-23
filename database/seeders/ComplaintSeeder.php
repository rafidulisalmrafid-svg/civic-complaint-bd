<?php

namespace Database\Seeders;

use App\Models\Complaint;
use App\Models\ComplaintAttachment;
use App\Models\ComplaintStatusHistory;
use App\Models\ComplaintInternalNote;
use App\Models\ComplaintAction;
use App\Models\ComplaintFeedback;
use App\Models\ComplaintCategory;
use App\Models\ComplaintSubcategory;
use App\Models\Division;
use App\Models\District;
use App\Models\Upazila;
use App\Models\LocalGovernment;
use App\Models\Ward;
use App\Models\Area;
use App\Models\PostOffice;
use App\Models\Organization;
use App\Models\Office;
use App\Models\OfficerProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ComplaintSeeder extends Seeder
{
    public function run(): void
    {
        $citizen1 = User::where('email', 'tanvir@gmail.com')->first();
        $citizen2 = User::where('email', 'nazmun@gmail.com')->first();
        $admin = User::where('role', 'main_admin')->first();

        $barishalDiv = Division::where('code', 'BARISHAL')->first();
        $chattogramDiv = Division::where('code', 'CHATTOGRAM')->first();

        $barishalDist = District::where('code', 'BARISHAL_DIST')->first();
        $cumillaDist = District::where('code', 'CUMILLA_DIST')->first();

        $barishalSadar = Upazila::where('name_en', 'like', '%Barishal Sadar%')->first();
        $cumillaSadar = Upazila::where('name_en', 'like', '%Adarsha Sadar%')->first();

        $bcc = LocalGovernment::where('code', 'BCC')->first();
        $cocc = LocalGovernment::where('code', 'COCC')->first();

        $bccWard10 = Ward::where('local_government_id', $bcc?->id)->where('ward_number', '10')->first();
        $coccWard11 = Ward::where('local_government_id', $cocc?->id)->where('ward_number', '11')->first();
        $coccWard15 = Ward::where('local_government_id', $cocc?->id)->where('ward_number', '15')->first();

        $bandRoad = Area::where('name_en', 'Band Road')->first();
        $kandirpar = Area::where('name_en', 'Kandirpar')->first();
        $tomsom = Area::where('name_en', 'Tomsom Bridge')->first();

        $poBarishal = PostOffice::where('post_code', '8200')->first();
        $poCumilla = PostOffice::where('post_code', '3500')->first();

        $dghs = Organization::where('code', 'DGHS')->first();
        $land = Organization::where('code', 'AC_LAND_ADMIN')->first() ?: Organization::where('code', 'MINLAND')->first();
        $lgrd = Organization::where('code', 'CITY_POURA_ADMIN')->first() ?: Organization::where('code', 'LGD_MINISTRY')->first();
        $bpdb = Organization::where('code', 'BPDB')->first();

        $csOffice = Office::where('name_en', 'like', '%Civil Surgeon Office, Barishal%')->first();
        $acLandOffice = Office::where('name_en', 'like', '%Upazila Land Office, Barishal Sadar%')->first();
        $engOffice = Office::where('name_en', 'like', '%Cumilla City Corporation%')->first();

        $officerMaruf = OfficerProfile::where('employee_id', 'DGHS-BAR-001')->first();
        $officerNusrat = OfficerProfile::where('employee_id', 'BCS-LAND-042')->first();
        $officerZahirul = OfficerProfile::where('employee_id', 'COCC-ENG-108')->first();

        $healthCat = ComplaintCategory::where('slug', 'health')->first();
        $landCat = ComplaintCategory::where('slug', 'land')->first();
        $localGovCat = ComplaintCategory::where('slug', 'local-government')->first();
        $powerCat = ComplaintCategory::where('slug', 'power')->first();

        $docSub = ComplaintSubcategory::where('name_en', 'Doctor Absenteeism')->first();
        $mutSub = ComplaintSubcategory::where('name_en', 'E-Mutation Delay')->first();
        $roadSub = ComplaintSubcategory::where('name_en', 'Potholes & Broken Roads')->first();
        $transSub = ComplaintSubcategory::where('name_en', 'Transformer Defect')->first();

        // Complaint 1: Barishal Health - In Investigation
        $c1 = Complaint::create([
            'tracking_id' => 'CT-BAR-2026-000101',
            'user_id' => $citizen1->id,
            'complainant_name' => 'তানভীর আহমেদ',
            'complainant_phone' => '01711223344',
            'category_id' => $healthCat->id,
            'subcategory_id' => $docSub?->id,
            'title' => 'জরুরি বিভাগে কর্তব্যরত চিকিৎসকের অনুপস্থিতি ও জীবনরক্ষাকারী ঔষুধ না পাওয়া',
            'description' => 'গত ১৮ সেপ্টেম্বর রাত ১০টায় আত্মীয়কে নিয়ে বরিশাল শের-ই-বাংলা মেডিকেল হাসপাতালের জরুরি বিভাগে যাই। সেখানে ডিউটি ডাক্তার ছিলেন না, ইন্টার্ন চিকিৎসকরাও কোনো সদুত্তর দেননি। এমনকি প্রাথমিক স্যালাইন ও ইনজেকশন বাইরে থেকে বেশি দামে কিনতে হয়েছে।',
            'priority' => 'high',
            'is_sensitive' => false,
            'division_id' => $barishalDiv->id,
            'district_id' => $barishalDist->id,
            'upazila_id' => $barishalSadar->id,
            'local_government_id' => $bcc?->id,
            'ward_id' => $bccWard10?->id,
            'area_id' => $bandRoad?->id,
            'post_office_id' => $poBarishal?->id,
            'specific_location_details' => 'শের-ই-বাংলা মেডিকেল কলেজ হাসপাতাল জরুরি বিভাগ',
            'latitude' => 22.7010,
            'longitude' => 90.3535,
            'organization_id' => $dghs?->id,
            'office_id' => $csOffice?->id,
            'assigned_officer_id' => $officerMaruf?->id,
            'current_status' => 'investigation_started',
            'custom_fields_data' => [
                'hospital_name' => 'শের-ই-বাংলা মেডিকেল কলেজ হাসপাতাল, বরিশাল',
                'department_or_ward' => 'জরুরি বিভাগ',
            ],
            'due_at' => Carbon::now()->addDays(3),
            'created_at' => Carbon::now()->subDays(2),
        ]);

        ComplaintStatusHistory::create([
            'complaint_id' => $c1->id,
            'from_status' => 'submitted',
            'to_status' => 'submitted',
            'action_type' => 'submitted',
            'remarks_bn' => 'নাগরিক কর্তৃক সফলভাবে অভিযোগ দাখিল করা হয়েছে।',
            'is_public_to_citizen' => true,
            'created_at' => Carbon::now()->subDays(2),
        ]);

        ComplaintStatusHistory::create([
            'complaint_id' => $c1->id,
            'from_status' => 'submitted',
            'to_status' => 'assigned',
            'action_type' => 'assigned',
            'remarks_bn' => 'অভিযোগটি বরিশাল জেলা সিভিল সার্জন কার্যালয়ে প্রেরণ করা হয়েছে। দায়িত্বপ্রাপ্ত কর্মকর্তা: ডা. মারুফ হাসান।',
            'changed_by_user_id' => $admin->id,
            'is_public_to_citizen' => true,
            'created_at' => Carbon::now()->subDays(1)->subHours(10),
        ]);

        ComplaintStatusHistory::create([
            'complaint_id' => $c1->id,
            'from_status' => 'assigned',
            'to_status' => 'investigation_started',
            'action_type' => 'investigated',
            'remarks_bn' => 'কর্তব্যরত চিকিৎসকদের রোস্টার ও রেজিস্টার খাতা পর্যালোচনার জন্য তদন্ত কর্মকর্তা নিয়োগ করা হয়েছে।',
            'changed_by_user_id' => $officerMaruf->user_id,
            'is_public_to_citizen' => true,
            'created_at' => Carbon::now()->subHours(8),
        ]);

        ComplaintInternalNote::create([
            'complaint_id' => $c1->id,
            'author_user_id' => $officerMaruf->user_id,
            'note' => 'উক্ত রাতের দায়িত্বপ্রাপ্ত মেডিকেল অফিসারের বিরুদ্ধে কৈফিয়ত তলব নোটিশ জারি করা হয়েছে। ২৪ ঘণ্টার মধ্যে জবাব চাওয়া হয়েছে।',
            'is_confidential' => true,
        ]);

        // Complaint 2: Barishal Land - Resolved
        $c2 = Complaint::create([
            'tracking_id' => 'CT-BAR-2026-000102',
            'user_id' => $citizen1->id,
            'complainant_name' => 'তানভীর আহমেদ',
            'complainant_phone' => '01711223344',
            'category_id' => $landCat->id,
            'subcategory_id' => $mutSub?->id,
            'title' => 'অনলাইন ই-নামজারি আবেদনের শুনানির তারিখ পেতে বিলম্ব',
            'description' => 'বরিশাল সদর ভূমি অফিসে নামজারি আবেদন নম্বর MUT-2026-4521 জমা দেওয়ার পর ৬০ দিন পেরিয়ে গেলেও প্রস্তাবপত্র কিংবা শুনানির তারিখ দেওয়া হয়নি।',
            'priority' => 'medium',
            'division_id' => $barishalDiv->id,
            'district_id' => $barishalDist->id,
            'upazila_id' => $barishalSadar->id,
            'local_government_id' => $bcc?->id,
            'organization_id' => $land?->id,
            'office_id' => $acLandOffice?->id,
            'assigned_officer_id' => $officerNusrat?->id,
            'current_status' => 'resolved',
            'custom_fields_data' => [
                'khatian_dag_no' => 'খতিয়ান নং ১০৫, দাগ নং ৪২০',
                'mutation_case_no' => 'MUT-2026-4521',
            ],
            'due_at' => Carbon::now()->addDays(5),
            'resolved_at' => Carbon::now()->subDay(),
            'created_at' => Carbon::now()->subDays(6),
        ]);

        ComplaintStatusHistory::create([
            'complaint_id' => $c2->id,
            'from_status' => 'submitted',
            'to_status' => 'resolved',
            'action_type' => 'resolved',
            'remarks_bn' => 'আবেদনটি নথিভুক্ত করে তদন্ত প্রতিবেদন যাচাইপূর্বক নামজারি খতিয়ান প্রস্তুত করা হয়েছে এবং ডিসিআর ফি গ্রহণের অনুমোদন দেওয়া হয়েছে।',
            'changed_by_user_id' => $officerNusrat->user_id,
            'is_public_to_citizen' => true,
            'created_at' => Carbon::now()->subDay(),
        ]);

        ComplaintFeedback::create([
            'complaint_id' => $c2->id,
            'user_id' => $citizen1->id,
            'was_resolved' => 'yes',
            'satisfaction_rating' => 5,
            'comment' => 'অভিযোগ জানানোর পর দ্রুত পদক্ষেপ নিয়ে কাজ সম্পন্ন করে দেওয়া হয়েছে। ধন্যবাদ!',
            'is_reopen_requested' => false,
        ]);

        // Complaint 3: Cumilla Municipal - Action Taken
        $c3 = Complaint::create([
            'tracking_id' => 'CT-CUM-2026-000103',
            'user_id' => $citizen2->id,
            'complainant_name' => 'নাজমুন নাহার',
            'complainant_phone' => '01811223344',
            'category_id' => $localGovCat->id,
            'subcategory_id' => $roadSub?->id,
            'title' => 'কান্দিরপাড় প্রধান সড়কে গভীর গর্ত ও ড্রেনের ঢাকনা ভাঙা থাকায় তীব্র দুর্ভোগ',
            'description' => 'কুমিল্লা সিটি কর্পোরেশনের ১১ নং ওয়ার্ডের কান্দিরপাড় গোলচত্বর সংলগ্ন রাস্তায় বিশাল গর্ত ও ড্রেনের স্লাব ভেঙে গিয়ে প্রতিদিন রিকশা ও পথচারীরা দুর্ঘটনার শিকার হচ্ছে।',
            'priority' => 'high',
            'division_id' => $chattogramDiv->id,
            'district_id' => $cumillaDist->id,
            'upazila_id' => $cumillaSadar->id,
            'local_government_id' => $cocc?->id,
            'ward_id' => $coccWard11?->id,
            'area_id' => $kandirpar?->id,
            'post_office_id' => $poCumilla?->id,
            'latitude' => 23.4607,
            'longitude' => 91.1809,
            'organization_id' => $lgrd?->id,
            'office_id' => $engOffice?->id,
            'assigned_officer_id' => $officerZahirul?->id,
            'current_status' => 'action_taken',
            'due_at' => Carbon::now()->addDays(2),
            'created_at' => Carbon::now()->subDays(3),
        ]);

        ComplaintStatusHistory::create([
            'complaint_id' => $c3->id,
            'from_status' => 'investigation_started',
            'to_status' => 'action_taken',
            'action_type' => 'action_taken',
            'remarks_bn' => 'প্রকৌশল বিভাগের কারিগরি টিম সরেজমিনে পরিদর্শন করে নতুন আরসিসি স্লাব স্থাপন ও পিচ ঢালাইয়ের কাজ শুরু করেছে।',
            'changed_by_user_id' => $officerZahirul->user_id,
            'is_public_to_citizen' => true,
            'created_at' => Carbon::now()->subHours(12),
        ]);

        // Complaint 4: Cumilla Power - Overdue
        Complaint::create([
            'tracking_id' => 'CT-CUM-2026-000104',
            'user_id' => $citizen2->id,
            'complainant_name' => 'নাজমুন নাহার',
            'complainant_phone' => '01811223344',
            'category_id' => $powerCat->id,
            'subcategory_id' => $transSub?->id,
            'title' => 'টমছম ব্রিজ এলাকায় ট্রান্সফরমার ৩ দিন ধরে বিকল, শতাধিক পরিবার বিদ্যুৎহীন',
            'description' => 'টমছম ব্রিজ মসজিদের পেছনের ট্রান্সফরমার পুড়ে যাওয়ায় টানা ৩ দিন ধরে কোনো বিদ্যুৎ নেই। স্থানীয় অফিসে যোগাযোগ করা হলেও কোনো টেকনিশিয়ান আসেনি। তীব্র গরমে শিশু ও বৃদ্ধরা অসুস্থ হয়ে পড়ছে।',
            'priority' => 'urgent',
            'division_id' => $chattogramDiv->id,
            'district_id' => $cumillaDist->id,
            'upazila_id' => $cumillaSadar->id,
            'local_government_id' => $cocc?->id,
            'ward_id' => $coccWard15?->id,
            'area_id' => $tomsom?->id,
            'organization_id' => $bpdb?->id,
            'current_status' => 'overdue',
            'due_at' => Carbon::now()->subHours(14), // Overdue!
            'created_at' => Carbon::now()->subDays(3),
        ]);

        // Complaint 5: Barishal - Submitted (New)
        Complaint::create([
            'tracking_id' => 'CT-BAR-2026-000105',
            'user_id' => $citizen1->id,
            'complainant_name' => 'তানভীর আহমেদ',
            'complainant_phone' => '01711223344',
            'category_id' => $localGovCat->id,
            'title' => 'নথুল্লাবাদ কেন্দ্রীয় বাস টার্মিনাল সংলগ্ন এলাকায় ময়লার স্তূপ ও তীব্র দুর্গন্ধ',
            'description' => 'নথুল্লাবাদ বাস টার্মিনাল মোড়ে সড়কের পাশে ডাস্টবিনের ময়লা উপচে পড়ে প্রধান রাস্তা আটকে যাচ্ছে। বৃষ্টির পানিতে ময়লা ছড়িয়ে পরিবেশ মারাত্মক দূষিত হচ্ছে।',
            'priority' => 'medium',
            'division_id' => $barishalDiv->id,
            'district_id' => $barishalDist->id,
            'upazila_id' => $barishalSadar->id,
            'local_government_id' => $bcc?->id,
            'organization_id' => $lgrd?->id,
            'current_status' => 'submitted',
            'due_at' => Carbon::now()->addDays(7),
            'created_at' => Carbon::now()->subHours(3),
        ]);
    }
}
