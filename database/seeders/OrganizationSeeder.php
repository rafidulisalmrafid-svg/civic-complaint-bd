<?php

namespace Database\Seeders;

use App\Models\OrganizationType;
use App\Models\Organization;
use App\Models\Office;
use App\Models\OfficerProfile;
use App\Models\District;
use App\Models\Upazila;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrganizationSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Organization Types
        $ministryType = OrganizationType::create(['name_bn' => 'মন্ত্রণালয়', 'name_en' => 'Ministry', 'slug' => 'ministry', 'level_order' => 1]);
        $directorateType = OrganizationType::create(['name_bn' => 'অধিদপ্তর / পরিদপ্তর', 'name_en' => 'Directorate', 'slug' => 'directorate', 'level_order' => 2]);
        $agencyType = OrganizationType::create(['name_bn' => 'সংস্থা / বোর্ড / কর্পোরেশন', 'name_en' => 'Agency/Board', 'slug' => 'agency', 'level_order' => 3]);
        $fieldOfficeType = OrganizationType::create(['name_bn' => 'মাঠ পর্যায়ের কার্যালয়', 'name_en' => 'Field Office', 'slug' => 'field_office', 'level_order' => 4]);

        // 2. Ministries (Parent Level Organizations)
        // 1) Health Ministry
        $mohfw = Organization::create([
            'organization_type_id' => $ministryType->id,
            'name_bn' => 'স্বাস্থ্য ও পরিবার কল্যাণ মন্ত্রণালয়',
            'name_en' => 'Ministry of Health and Family Welfare',
            'code' => 'MOHFW',
            'email' => 'info@mohfw.gov.bd',
            'website' => 'https://mohfw.gov.bd',
            'icon' => 'activity',
        ]);

        // 2) Land Ministry
        $minland = Organization::create([
            'organization_type_id' => $ministryType->id,
            'name_bn' => 'ভূমি মন্ত্রণালয়',
            'name_en' => 'Ministry of Land',
            'code' => 'MINLAND',
            'email' => 'info@minland.gov.bd',
            'phone' => '16122',
            'website' => 'https://minland.gov.bd',
            'icon' => 'map-pin',
        ]);

        // 3) Local Government Division (LGRD)
        $lgd = Organization::create([
            'organization_type_id' => $ministryType->id,
            'name_bn' => 'স্থানীয় সরকার, পল্লী উন্নয়ন ও সমবায় মন্ত্রণালয়',
            'name_en' => 'Ministry of Local Government, Rural Development & Co-operatives',
            'code' => 'LGD_MINISTRY',
            'email' => 'secretary@lgd.gov.bd',
            'website' => 'https://lgd.gov.bd',
            'icon' => 'building-2',
        ]);

        // 4) Power & Energy Ministry
        $mpemr = Organization::create([
            'organization_type_id' => $ministryType->id,
            'name_bn' => 'বিদ্যুৎ, জ্বালানি ও খনিজ সম্পদ মন্ত্রণালয়',
            'name_en' => 'Ministry of Power, Energy and Mineral Resources',
            'code' => 'MPEMR',
            'website' => 'https://mpemr.gov.bd',
            'icon' => 'zap',
        ]);

        // 5) Home Affairs Ministry
        $mha = Organization::create([
            'organization_type_id' => $ministryType->id,
            'name_bn' => 'স্বরাষ্ট্র মন্ত্রণালয়',
            'name_en' => 'Ministry of Home Affairs',
            'code' => 'MHA',
            'website' => 'https://mha.gov.bd',
            'icon' => 'shield',
        ]);

        // 6) Environment Ministry
        $moef = Organization::create([
            'organization_type_id' => $ministryType->id,
            'name_bn' => 'পরিবেশ, বন ও জলবায়ু পরিবর্তন মন্ত্রণালয়',
            'name_en' => 'Ministry of Environment, Forest and Climate Change',
            'code' => 'MOEFCC',
            'website' => 'https://moef.gov.bd',
            'icon' => 'leaf',
        ]);

        // 7) Road Transport & Bridges Ministry
        $morb = Organization::create([
            'organization_type_id' => $ministryType->id,
            'name_bn' => 'সড়ক পরিবহন ও সেতু মন্ত্রণালয়',
            'name_en' => 'Ministry of Road Transport and Bridges',
            'code' => 'RTHD',
            'website' => 'https://rthd.gov.bd',
            'icon' => 'truck',
        ]);

        // 8) Public Administration & Cabinet (Anti-Corruption / General Administration)
        $mopa = Organization::create([
            'organization_type_id' => $ministryType->id,
            'name_bn' => 'জনপ্রশাসন মন্ত্রণালয় ও মন্ত্রিপরিষদ বিভাগ',
            'name_en' => 'Ministry of Public Administration & Cabinet Division',
            'code' => 'MOPA_CABINET',
            'website' => 'https://mopa.gov.bd',
            'icon' => 'scale',
        ]);

        // 3. Child Organizations (Agencies / Directorates / Boards under Ministries)
        // Under Health Ministry:
        $dghs = Organization::create([
            'parent_id' => $mohfw->id,
            'organization_type_id' => $directorateType->id,
            'name_bn' => 'স্বাস্থ্য অধিদপ্তর (ডিজিএইচএস)',
            'name_en' => 'Directorate General of Health Services (DGHS)',
            'code' => 'DGHS',
            'email' => 'info@dghs.gov.bd',
            'website' => 'https://dghs.gov.bd',
            'icon' => 'activity',
        ]);

        $dgda = Organization::create([
            'parent_id' => $mohfw->id,
            'organization_type_id' => $directorateType->id,
            'name_bn' => 'ঔষধ প্রশাসন অধিদপ্তর (ডিজিডিএ)',
            'name_en' => 'Directorate General of Drug Administration',
            'code' => 'DGDA',
            'website' => 'https://dgda.gov.bd',
            'icon' => 'shield-plus',
        ]);

        // Under Land Ministry:
        $landAdmin = Organization::create([
            'parent_id' => $minland->id,
            'organization_type_id' => $agencyType->id,
            'name_bn' => 'উপজেলা ভূমি প্রশাসন (এসি ল্যান্ড কার্যালয়সমূহ)',
            'name_en' => 'Upazila Land Administration (AC Land)',
            'code' => 'AC_LAND_ADMIN',
            'website' => 'https://minland.gov.bd',
            'icon' => 'map-pin',
        ]);

        $dlrs = Organization::create([
            'parent_id' => $minland->id,
            'organization_type_id' => $directorateType->id,
            'name_bn' => 'ভূমি রেকর্ড ও জরিপ অধিদপ্তর (ডিএলআরএস)',
            'name_en' => 'Directorate of Land Records and Survey',
            'code' => 'DLRS',
            'website' => 'https://dlrs.gov.bd',
            'icon' => 'file-text',
        ]);

        // Under Local Government Ministry:
        $cityPouraAdmin = Organization::create([
            'parent_id' => $lgd->id,
            'organization_type_id' => $agencyType->id,
            'name_bn' => 'সিটি কর্পোরেশন ও পৌর প্রশাসন',
            'name_en' => 'City Corporation & Pourashava Administration',
            'code' => 'CITY_POURA_ADMIN',
            'website' => 'https://lgd.gov.bd',
            'icon' => 'building',
        ]);

        $lged = Organization::create([
            'parent_id' => $lgd->id,
            'organization_type_id' => $directorateType->id,
            'name_bn' => 'স্থানীয় সরকার প্রকৌশল অধিদপ্তর (এলজিইডি)',
            'name_en' => 'Local Government Engineering Department (LGED)',
            'code' => 'LGED',
            'website' => 'https://lged.gov.bd',
            'icon' => 'hard-hat',
        ]);

        $dphe = Organization::create([
            'parent_id' => $lgd->id,
            'organization_type_id' => $directorateType->id,
            'name_bn' => 'জনস্বাস্থ্য প্রকৌশল অধিদপ্তর (ডিপিএইচই)',
            'name_en' => 'Department of Public Health Engineering',
            'code' => 'DPHE',
            'website' => 'https://dphe.gov.bd',
            'icon' => 'droplet',
        ]);

        // Under Power & Energy Ministry:
        $bpdb = Organization::create([
            'parent_id' => $mpemr->id,
            'organization_type_id' => $agencyType->id,
            'name_bn' => 'বাংলাদেশ বিদ্যুৎ উন্নয়ন বোর্ড (বিউবো)',
            'name_en' => 'Bangladesh Power Development Board (BPDB)',
            'code' => 'BPDB',
            'website' => 'https://bpdb.gov.bd',
            'icon' => 'zap',
        ]);

        $wzpdcl = Organization::create([
            'parent_id' => $mpemr->id,
            'organization_type_id' => $agencyType->id,
            'name_bn' => 'ওয়েস্ট জোন পাওয়ার ডিস্ট্রিবিউশন কোম্পানি (ওজোপাডিকো)',
            'name_en' => 'West Zone Power Distribution Company (WZPDCL)',
            'code' => 'WZPDCL',
            'website' => 'https://wzpdcl.org.bd',
            'icon' => 'zap',
        ]);

        $breb = Organization::create([
            'parent_id' => $mpemr->id,
            'organization_type_id' => $agencyType->id,
            'name_bn' => 'বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড (বিআরইবি)',
            'name_en' => 'Bangladesh Rural Electrification Board (BREB)',
            'code' => 'BREB',
            'website' => 'https://reb.gov.bd',
            'icon' => 'zap',
        ]);

        // Under Home Affairs Ministry:
        $police = Organization::create([
            'parent_id' => $mha->id,
            'organization_type_id' => $agencyType->id,
            'name_bn' => 'বাংলাদেশ পুলিশ',
            'name_en' => 'Bangladesh Police',
            'code' => 'BD_POLICE',
            'website' => 'https://police.gov.bd',
            'icon' => 'shield',
        ]);

        // Under Environment Ministry:
        $doe = Organization::create([
            'parent_id' => $moef->id,
            'organization_type_id' => $directorateType->id,
            'name_bn' => 'পরিবেশ অধিদপ্তর (ডিওই)',
            'name_en' => 'Department of Environment (DOE)',
            'code' => 'DOE',
            'website' => 'https://doe.gov.bd',
            'icon' => 'leaf',
        ]);

        // Under Road Transport Ministry:
        $rhd = Organization::create([
            'parent_id' => $morb->id,
            'organization_type_id' => $directorateType->id,
            'name_bn' => 'সড়ক ও জনপথ অধিদপ্তর (সওজ)',
            'name_en' => 'Roads and Highways Department (RHD)',
            'code' => 'RHD',
            'website' => 'https://rhd.gov.bd',
            'icon' => 'truck',
        ]);

        // Under Public Administration / Anti-Corruption:
        $acc = Organization::create([
            'parent_id' => $mopa->id,
            'organization_type_id' => $agencyType->id,
            'name_bn' => 'দুর্নীতি দমন কমিশন (দুদক)',
            'name_en' => 'Anti-Corruption Commission (ACC)',
            'code' => 'ACC',
            'website' => 'https://acc.org.bd',
            'icon' => 'scale',
        ]);

        $districtAdmin = Organization::create([
            'parent_id' => $mopa->id,
            'organization_type_id' => $agencyType->id,
            'name_bn' => 'জেলা ও উপজেলা প্রশাসন (ডিসি ও ইউএনও কার্যালয়)',
            'name_en' => 'District & Upazila Administration (DC & UNO)',
            'code' => 'DC_UNO_ADMIN',
            'website' => 'https://mopa.gov.bd',
            'icon' => 'landmark',
        ]);

        // 4. Local Offices strictly linked to specific Organizations
        $barishalDist = District::where('code', 'BARISHAL_DIST')->first();
        $cumillaDist = District::where('code', 'CUMILLA_DIST')->first();
        $dhakaDist = District::where('code', 'DHAKA_DIST')->first();

        $barishalSadar = Upazila::where('name_en', 'like', '%Barishal Sadar%')->first();
        $cumillaSadar = Upazila::where('name_en', 'like', '%Adarsha Sadar%')->first();
        $dhakaSadar = Upazila::where('name_en', 'like', '%Dhanmondi%')->first();

        // Offices for DGHS
        $barishalCSOffice = Office::create([
            'organization_id' => $dghs->id,
            'name_bn' => 'সিভিল সার্জন কার্যালয়, বরিশাল',
            'name_en' => 'Civil Surgeon Office, Barishal',
            'district_id' => $barishalDist?->id,
            'upazila_id' => $barishalSadar?->id,
            'address' => 'ব্যান্ড রোড, বরিশাল সদর, বরিশাল',
            'phone' => '0431-2173456',
            'email' => 'csbarishal@dghs.gov.bd',
        ]);

        $barishalMedHospital = Office::create([
            'organization_id' => $dghs->id,
            'name_bn' => 'শের-ই-বাংলা মেডিকেল কলেজ হাসপাতাল, বরিশাল',
            'name_en' => 'Sher-e-Bangla Medical College Hospital (SBMCH)',
            'district_id' => $barishalDist?->id,
            'upazila_id' => $barishalSadar?->id,
            'address' => 'বান্দ রোড, বরিশাল',
            'phone' => '0431-2173555',
        ]);

        $cumillaCSOffice = Office::create([
            'organization_id' => $dghs->id,
            'name_bn' => 'সিভিল সার্জন কার্যালয়, কুমিল্লা',
            'name_en' => 'Civil Surgeon Office, Cumilla',
            'district_id' => $cumillaDist?->id,
            'upazila_id' => $cumillaSadar?->id,
            'address' => 'টমছম ব্রিজ রোড, কুমিল্লা',
            'phone' => '081-76543',
        ]);

        // Offices for AC Land Admin
        $barishalAcLandOffice = Office::create([
            'organization_id' => $landAdmin->id,
            'name_bn' => 'উপজেলা ভূমি অফিস (এসি ল্যান্ড), বরিশাল সদর',
            'name_en' => 'Upazila Land Office, Barishal Sadar',
            'district_id' => $barishalDist?->id,
            'upazila_id' => $barishalSadar?->id,
            'address' => 'কালেক্টরেট চত্বর, বরিশাল সদর',
            'phone' => '0431-64532',
            'email' => 'acland.barishal@minland.gov.bd',
        ]);

        $cumillaAcLandOffice = Office::create([
            'organization_id' => $landAdmin->id,
            'name_bn' => 'উপজেলা ভূমি অফিস (এসি ল্যান্ড), আদর্শ সদর, কুমিল্লা',
            'name_en' => 'Upazila Land Office, Adarsha Sadar, Cumilla',
            'district_id' => $cumillaDist?->id,
            'upazila_id' => $cumillaSadar?->id,
            'address' => 'শাসনগাছা, কুমিল্লা',
            'phone' => '081-64210',
        ]);

        // Offices for City Corporation & Pourashava Administration
        $bccOffice = Office::create([
            'organization_id' => $cityPouraAdmin->id,
            'name_bn' => 'নগর ভবন, বরিশাল সিটি কর্পোরেশন',
            'name_en' => 'Nagar Bhaban, Barishal City Corporation',
            'district_id' => $barishalDist?->id,
            'upazila_id' => $barishalSadar?->id,
            'address' => 'ফজলুল হক এভিনিউ, বরিশাল',
            'phone' => '0431-2176101',
        ]);

        $coccOffice = Office::create([
            'organization_id' => $cityPouraAdmin->id,
            'name_bn' => 'নগর ভবন, কুমিল্লা সিটি কর্পোরেশন',
            'name_en' => 'Nagar Bhaban, Cumilla City Corporation',
            'district_id' => $cumillaDist?->id,
            'upazila_id' => $cumillaSadar?->id,
            'address' => 'কান্দিরপাড়, কুমিল্লা',
            'phone' => '081-65432',
            'email' => 'engg@cocc.gov.bd',
        ]);

        // Offices for Power (BPDB / WZPDCL / BREB)
        $wzpdclBarishalOffice = Office::create([
            'organization_id' => $wzpdcl->id,
            'name_bn' => 'বিদ্যুৎ বিক্রয় ও বিতরণ বিভাগ-১ (ওজোপাডিকো), বরিশাল',
            'name_en' => 'Distribution Division 1, WZPDCL, Barishal',
            'district_id' => $barishalDist?->id,
            'upazila_id' => $barishalSadar?->id,
            'address' => 'পলাশপুর মোড়, বরিশাল',
            'phone' => '0431-71234',
        ]);

        $bpdbCumillaOffice = Office::create([
            'organization_id' => $bpdb->id,
            'name_bn' => 'বিদ্যুৎ বিক্রয় ও বিতরণ বিভাগ-১ (বিউবো), কুমিল্লা',
            'name_en' => 'BPDB Distribution Division 1, Cumilla',
            'district_id' => $cumillaDist?->id,
            'upazila_id' => $cumillaSadar?->id,
            'address' => 'ঝাউতলা, কুমিল্লা',
            'phone' => '081-67890',
        ]);

        // Offices for Bangladesh Police
        $barishalKotowaliPS = Office::create([
            'organization_id' => $police->id,
            'name_bn' => 'কোতোয়ালি মডেল থানা, বরিশাল মেট্রোপলিটন পুলিশ',
            'name_en' => 'Kotowali Model Police Station, BMP, Barishal',
            'district_id' => $barishalDist?->id,
            'upazila_id' => $barishalSadar?->id,
            'address' => 'সদর রোড, বরিশাল',
            'phone' => '01713374256',
        ]);

        $cumillaKotowaliPS = Office::create([
            'organization_id' => $police->id,
            'name_bn' => 'কোতোয়ালি মডেল থানা, কুমিল্লা জেলা পুলিশ',
            'name_en' => 'Kotowali Model Police Station, Cumilla',
            'district_id' => $cumillaDist?->id,
            'upazila_id' => $cumillaSadar?->id,
            'address' => 'চকবাজার, কুমিল্লা',
            'phone' => '01713373780',
        ]);

        // Offices for Environment (DOE)
        $barishalDoeOffice = Office::create([
            'organization_id' => $doe->id,
            'name_bn' => 'পরিবেশ অধিদপ্তর জেলা কার্যালয়, বরিশাল',
            'name_en' => 'Department of Environment, Barishal District Office',
            'district_id' => $barishalDist?->id,
            'upazila_id' => $barishalSadar?->id,
            'address' => 'রূপাতলী, বরিশাল',
            'phone' => '0431-2179876',
        ]);

        // Offices for Roads (RHD)
        $barishalRhdOffice = Office::create([
            'organization_id' => $rhd->id,
            'name_bn' => 'সড়ক ও জনপথ বিভাগীয় কার্যালয়, বরিশাল',
            'name_en' => 'RHD Divisional Office, Barishal',
            'district_id' => $barishalDist?->id,
            'upazila_id' => $barishalSadar?->id,
            'address' => 'সিঅ্যান্ডবি রোড, বরিশাল',
            'phone' => '0431-64111',
        ]);

        // Offices for District & Upazila Administration
        $barishalDcOffice = Office::create([
            'organization_id' => $districtAdmin->id,
            'name_bn' => 'জেলা প্রশাসকের কার্যালয় (ডিসি অফিস), বরিশাল',
            'name_en' => 'Deputy Commissioner (DC) Office, Barishal',
            'district_id' => $barishalDist?->id,
            'upazila_id' => $barishalSadar?->id,
            'address' => 'কালেক্টরেট ভবন, বরিশাল',
            'phone' => '0431-2176100',
        ]);

        $cumillaDcOffice = Office::create([
            'organization_id' => $districtAdmin->id,
            'name_bn' => 'জেলা প্রশাসকের কার্যালয় (ডিসি অফিস), কুমিল্লা',
            'name_en' => 'Deputy Commissioner (DC) Office, Cumilla',
            'district_id' => $cumillaDist?->id,
            'upazila_id' => $cumillaSadar?->id,
            'address' => 'ফৌজদারী চত্বর, কুমিল্লা',
            'phone' => '081-68900',
        ]);

        // 5. Officer Profiles
        $userOfficerBarishal = User::where('email', 'officer@barishal.gov.bd')->first();
        $userOfficerCumilla = User::where('email', 'officer@cumilla.gov.bd')->first();
        $userAcLand = User::where('email', 'acland@barishal.gov.bd')->first();

        OfficerProfile::create([
            'user_id' => $userOfficerBarishal?->id,
            'employee_id' => 'DGHS-BAR-001',
            'name_bn' => 'ডা. মারুফ হাসান',
            'name_en' => 'Dr. Maruf Hasan',
            'designation_bn' => 'সিভিল সার্জন',
            'designation_en' => 'Civil Surgeon',
            'official_phone' => '01800000000',
            'official_email' => 'officer@barishal.gov.bd',
            'organization_id' => $dghs->id,
            'office_id' => $barishalCSOffice->id,
            'district_id' => $barishalDist?->id,
            'upazila_id' => $barishalSadar?->id,
            'joining_date' => '2022-03-15',
            'status' => 'active',
        ]);

        OfficerProfile::create([
            'user_id' => $userAcLand?->id,
            'employee_id' => 'BCS-LAND-042',
            'name_bn' => 'নুসরাত জাহান',
            'name_en' => 'Nusrat Jahan',
            'designation_bn' => 'সহকারী কমিশনার (ভূমি)',
            'designation_en' => 'Assistant Commissioner (Land)',
            'official_phone' => '01600000000',
            'official_email' => 'acland@barishal.gov.bd',
            'organization_id' => $landAdmin->id,
            'office_id' => $barishalAcLandOffice->id,
            'district_id' => $barishalDist?->id,
            'upazila_id' => $barishalSadar?->id,
            'joining_date' => '2023-08-01',
            'status' => 'active',
        ]);

        OfficerProfile::create([
            'user_id' => $userOfficerCumilla?->id,
            'employee_id' => 'COCC-ENG-108',
            'name_bn' => 'মোঃ জহিরুল ইসলাম',
            'name_en' => 'Md. Zahirul Islam',
            'designation_bn' => 'নির্বাহী প্রকৌশলী (পূর্ত)',
            'designation_en' => 'Executive Engineer (Civil)',
            'official_phone' => '01900000000',
            'official_email' => 'officer@cumilla.gov.bd',
            'organization_id' => $cityPouraAdmin->id,
            'office_id' => $coccOffice->id,
            'district_id' => $cumillaDist?->id,
            'upazila_id' => $cumillaSadar?->id,
            'joining_date' => '2021-11-20',
            'status' => 'active',
        ]);
    }
}
