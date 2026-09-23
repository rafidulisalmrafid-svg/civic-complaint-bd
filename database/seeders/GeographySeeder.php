<?php

namespace Database\Seeders;

use App\Models\Division;
use App\Models\District;
use App\Models\Upazila;
use App\Models\LocalGovernment;
use App\Models\Ward;
use App\Models\Area;
use App\Models\PostOffice;
use Illuminate\Database\Seeder;

class GeographySeeder extends Seeder
{
    public function run(): void
    {
        // 1. All 8 Divisions of Bangladesh
        $divisionsData = [
            ['name_bn' => 'ঢাকা', 'name_en' => 'Dhaka', 'code' => 'DHAKA'],
            ['name_bn' => 'চট্টগ্রাম', 'name_en' => 'Chattogram', 'code' => 'CHATTOGRAM'],
            ['name_bn' => 'রাজশাহী', 'name_en' => 'Rajshahi', 'code' => 'RAJSHAHI'],
            ['name_bn' => 'খুলনা', 'name_en' => 'Khulna', 'code' => 'KHULNA'],
            ['name_bn' => 'বরিশাল', 'name_en' => 'Barishal', 'code' => 'BARISHAL'],
            ['name_bn' => 'সিলেট', 'name_en' => 'Sylhet', 'code' => 'SYLHET'],
            ['name_bn' => 'রংপুর', 'name_en' => 'Rangpur', 'code' => 'RANGPUR'],
            ['name_bn' => 'ময়মনসিংহ', 'name_en' => 'Mymensingh', 'code' => 'MYMENSINGH'],
        ];

        $divisions = [];
        foreach ($divisionsData as $item) {
            $divisions[$item['code']] = Division::create($item);
        }

        // 2. All 64 Districts of Bangladesh
        $districtsByDivision = [
            'DHAKA' => [
                ['name_bn' => 'ঢাকা', 'name_en' => 'Dhaka', 'code' => 'DHAKA_DIST', 'lat' => 23.8103, 'lng' => 90.4125],
                ['name_bn' => 'গাজীপুর', 'name_en' => 'Gazipur', 'code' => 'GAZIPUR_DIST', 'lat' => 23.9999, 'lng' => 90.4203],
                ['name_bn' => 'নারায়ণগঞ্জ', 'name_en' => 'Narayanganj', 'code' => 'NARAYANGANJ_DIST', 'lat' => 23.6238, 'lng' => 90.5000],
                ['name_bn' => 'নরসিংদী', 'name_en' => 'Narsingdi', 'code' => 'NARSINGDI_DIST', 'lat' => 23.9322, 'lng' => 90.7154],
                ['name_bn' => 'মুন্সীগঞ্জ', 'name_en' => 'Munshiganj', 'code' => 'MUNSHIGANJ_DIST', 'lat' => 23.5422, 'lng' => 90.5305],
                ['name_bn' => 'মানিকগঞ্জ', 'name_en' => 'Manikganj', 'code' => 'MANIKGANJ_DIST', 'lat' => 23.8617, 'lng' => 90.0003],
                ['name_bn' => 'কিশোরগঞ্জ', 'name_en' => 'Kishoreganj', 'code' => 'KISHOREGANJ_DIST', 'lat' => 24.4449, 'lng' => 90.7766],
                ['name_bn' => 'ফরিদপুর', 'name_en' => 'Faridpur', 'code' => 'FARIDPUR_DIST', 'lat' => 23.6071, 'lng' => 89.8429],
                ['name_bn' => 'গোপালগঞ্জ', 'name_en' => 'Gopalganj', 'code' => 'GOPALGANJ_DIST', 'lat' => 23.0051, 'lng' => 89.8266],
                ['name_bn' => 'মাদারীপুর', 'name_en' => 'Madaripur', 'code' => 'MADARIPUR_DIST', 'lat' => 23.1641, 'lng' => 90.1897],
                ['name_bn' => 'রাজবাড়ী', 'name_en' => 'Rajbari', 'code' => 'RAJBARI_DIST', 'lat' => 23.7574, 'lng' => 89.6445],
                ['name_bn' => 'শরীয়তপুর', 'name_en' => 'Shariatpur', 'code' => 'SHARIATPUR_DIST', 'lat' => 23.2423, 'lng' => 90.4348],
                ['name_bn' => 'টাঙ্গাইল', 'name_en' => 'Tangail', 'code' => 'TANGAIL_DIST', 'lat' => 24.2513, 'lng' => 89.9167],
            ],
            'CHATTOGRAM' => [
                ['name_bn' => 'চট্টগ্রাম', 'name_en' => 'Chattogram', 'code' => 'CHATTOGRAM_DIST', 'lat' => 22.3569, 'lng' => 91.7832],
                ['name_bn' => 'কক্সবাজার', 'name_en' => 'Cox\'s Bazar', 'code' => 'COXBZ_DIST', 'lat' => 21.4272, 'lng' => 92.0058],
                ['name_bn' => 'কুমিল্লা', 'name_en' => 'Cumilla', 'code' => 'CUMILLA_DIST', 'lat' => 23.4607, 'lng' => 91.1809],
                ['name_bn' => 'ব্রাহ্মণবাড়িয়া', 'name_en' => 'Brahmanbaria', 'code' => 'BRAHMANBARIA_DIST', 'lat' => 23.9571, 'lng' => 91.1119],
                ['name_bn' => 'চাঁদপুর', 'name_en' => 'Chandpur', 'code' => 'CHANDPUR_DIST', 'lat' => 23.2333, 'lng' => 90.6667],
                ['name_bn' => 'নোয়াখালী', 'name_en' => 'Noakhali', 'code' => 'NOAKHALI_DIST', 'lat' => 22.8696, 'lng' => 91.0993],
                ['name_bn' => 'ফেনী', 'name_en' => 'Feni', 'code' => 'FENI_DIST', 'lat' => 23.0186, 'lng' => 91.3966],
                ['name_bn' => 'লক্ষ্মীপুর', 'name_en' => 'Lakshmipur', 'code' => 'LAKSHMIPUR_DIST', 'lat' => 22.9425, 'lng' => 90.8412],
                ['name_bn' => 'খাগড়াছড়ি', 'name_en' => 'Khagrachhari', 'code' => 'KHAGRACHHARI_DIST', 'lat' => 23.1193, 'lng' => 91.9847],
                ['name_bn' => 'রাঙ্গামাটি', 'name_en' => 'Rangamati', 'code' => 'RANGAMATI_DIST', 'lat' => 22.7324, 'lng' => 92.2985],
                ['name_bn' => 'বান্দরবান', 'name_en' => 'Bandarban', 'code' => 'BANDARBAN_DIST', 'lat' => 22.1953, 'lng' => 92.2184],
            ],
            'RAJSHAHI' => [
                ['name_bn' => 'রাজশাহী', 'name_en' => 'Rajshahi', 'code' => 'RAJSHAHI_DIST', 'lat' => 24.3745, 'lng' => 88.6042],
                ['name_bn' => 'বগুড়া', 'name_en' => 'Bogura', 'code' => 'BOGURA_DIST', 'lat' => 24.8465, 'lng' => 89.3777],
                ['name_bn' => 'পাবনা', 'name_en' => 'Pabna', 'code' => 'PABNA_DIST', 'lat' => 24.0064, 'lng' => 89.2372],
                ['name_bn' => 'সিরাজগঞ্জ', 'name_en' => 'Sirajganj', 'code' => 'SIRAJGANJ_DIST', 'lat' => 24.4534, 'lng' => 89.7008],
                ['name_bn' => 'নওগাঁ', 'name_en' => 'Naogaon', 'code' => 'NAOGAON_DIST', 'lat' => 24.8103, 'lng' => 88.9324],
                ['name_bn' => 'নাটোর', 'name_en' => 'Natore', 'code' => 'NATORE_DIST', 'lat' => 24.4206, 'lng' => 89.0003],
                ['name_bn' => 'চাঁপাইনবাবগঞ্জ', 'name_en' => 'Chapai Nawabganj', 'code' => 'CHAPAI_DIST', 'lat' => 24.5965, 'lng' => 88.2776],
                ['name_bn' => 'জয়পুরহাট', 'name_en' => 'Joypurhat', 'code' => 'JOYPURHAT_DIST', 'lat' => 25.1015, 'lng' => 89.0277],
            ],
            'KHULNA' => [
                ['name_bn' => 'খুলনা', 'name_en' => 'Khulna', 'code' => 'KHULNA_DIST', 'lat' => 22.8456, 'lng' => 89.5403],
                ['name_bn' => 'যশোর', 'name_en' => 'Jashore', 'code' => 'JASHORE_DIST', 'lat' => 23.1664, 'lng' => 89.2182],
                ['name_bn' => 'সাতক্ষীরা', 'name_en' => 'Satkhira', 'code' => 'SATKHIRA_DIST', 'lat' => 22.7185, 'lng' => 89.0705],
                ['name_bn' => 'বাগেরহাট', 'name_en' => 'Bagerhat', 'code' => 'BAGERHAT_DIST', 'lat' => 22.6516, 'lng' => 89.7859],
                ['name_bn' => 'কুষ্টিয়া', 'name_en' => 'Kushtia', 'code' => 'KUSHTIA_DIST', 'lat' => 23.9013, 'lng' => 89.1205],
                ['name_bn' => 'ঝিনাইদহ', 'name_en' => 'Jhenaidah', 'code' => 'JHENAIDAH_DIST', 'lat' => 23.5450, 'lng' => 89.1726],
                ['name_bn' => 'চুয়াডাঙ্গা', 'name_en' => 'Chuadanga', 'code' => 'CHUADANGA_DIST', 'lat' => 23.6402, 'lng' => 88.8418],
                ['name_bn' => 'মেহেরপুর', 'name_en' => 'Meherpur', 'code' => 'MEHERPUR_DIST', 'lat' => 23.7622, 'lng' => 88.6318],
                ['name_bn' => 'মাগুরা', 'name_en' => 'Magura', 'code' => 'MAGURA_DIST', 'lat' => 23.4873, 'lng' => 89.4199],
                ['name_bn' => 'নড়াইল', 'name_en' => 'Narail', 'code' => 'NARAIL_DIST', 'lat' => 23.1725, 'lng' => 89.5127],
            ],
            'BARISHAL' => [
                ['name_bn' => 'বরিশাল', 'name_en' => 'Barishal', 'code' => 'BARISHAL_DIST', 'lat' => 22.7010, 'lng' => 90.3535],
                ['name_bn' => 'পটুয়াখালী', 'name_en' => 'Patuakhali', 'code' => 'PATUAKHALI_DIST', 'lat' => 22.3596, 'lng' => 90.3299],
                ['name_bn' => 'ভোলা', 'name_en' => 'Bhola', 'code' => 'BHOLA_DIST', 'lat' => 22.6859, 'lng' => 90.6481],
                ['name_bn' => 'পিরোজপুর', 'name_en' => 'Pirojpur', 'code' => 'PIROJPUR_DIST', 'lat' => 22.5841, 'lng' => 89.9720],
                ['name_bn' => 'বরগুনা', 'name_en' => 'Barguna', 'code' => 'BARGUNA_DIST', 'lat' => 22.0953, 'lng' => 90.1121],
                ['name_bn' => 'ঝালকাঠি', 'name_en' => 'Jhalokati', 'code' => 'JHALOKATI_DIST', 'lat' => 22.6406, 'lng' => 90.1987],
            ],
            'SYLHET' => [
                ['name_bn' => 'সিলেট', 'name_en' => 'Sylhet', 'code' => 'SYLHET_DIST', 'lat' => 24.8949, 'lng' => 91.8687],
                ['name_bn' => 'মৌলভীবাজার', 'name_en' => 'Moulvibazar', 'code' => 'MOULVIBAZAR_DIST', 'lat' => 24.4829, 'lng' => 91.7774],
                ['name_bn' => 'হবিগঞ্জ', 'name_en' => 'Habiganj', 'code' => 'HABIGANJ_DIST', 'lat' => 24.3749, 'lng' => 91.4155],
                ['name_bn' => 'সুনামগঞ্জ', 'name_en' => 'Sunamganj', 'code' => 'SUNAMGANJ_DIST', 'lat' => 25.0658, 'lng' => 91.3950],
            ],
            'RANGPUR' => [
                ['name_bn' => 'রংপুর', 'name_en' => 'Rangpur', 'code' => 'RANGPUR_DIST', 'lat' => 25.7439, 'lng' => 89.2752],
                ['name_bn' => 'দিনাজপুর', 'name_en' => 'Dinajpur', 'code' => 'DINAJPUR_DIST', 'lat' => 25.6217, 'lng' => 88.6355],
                ['name_bn' => 'কুড়িগ্রাম', 'name_en' => 'Kurigram', 'code' => 'KURIGRAM_DIST', 'lat' => 25.8054, 'lng' => 89.6362],
                ['name_bn' => 'গাইবান্ধা', 'name_en' => 'Gaibandha', 'code' => 'GAIBANDHA_DIST', 'lat' => 25.3288, 'lng' => 89.5407],
                ['name_bn' => 'নীলফামারী', 'name_en' => 'Nilphamari', 'code' => 'NILPHAMARI_DIST', 'lat' => 25.9318, 'lng' => 88.8560],
                ['name_bn' => 'লালমনিরহাট', 'name_en' => 'Lalmonirhat', 'code' => 'LALMONIRHAT_DIST', 'lat' => 25.9923, 'lng' => 89.2847],
                ['name_bn' => 'ঠাকুরগাঁও', 'name_en' => 'Thakurgaon', 'code' => 'THAKURGAON_DIST', 'lat' => 26.0337, 'lng' => 88.4617],
                ['name_bn' => 'পঞ্চগড়', 'name_en' => 'Panchagarh', 'code' => 'PANCHAGARH_DIST', 'lat' => 26.3411, 'lng' => 88.5542],
            ],
            'MYMENSINGH' => [
                ['name_bn' => 'ময়মনসিংহ', 'name_en' => 'Mymensingh', 'code' => 'MYMENSINGH_DIST', 'lat' => 24.7471, 'lng' => 90.4203],
                ['name_bn' => 'জামালপুর', 'name_en' => 'Jamalpur', 'code' => 'JAMALPUR_DIST', 'lat' => 24.9375, 'lng' => 89.9378],
                ['name_bn' => 'নেত্রকোণা', 'name_en' => 'Netrokona', 'code' => 'NETROKONA_DIST', 'lat' => 24.8709, 'lng' => 90.7279],
                ['name_bn' => 'শেরপুর', 'name_en' => 'Sherpur', 'code' => 'SHERPUR_DIST', 'lat' => 25.0205, 'lng' => 90.0153],
            ],
        ];

        $districts = [];
        foreach ($districtsByDivision as $divCode => $dList) {
            $divId = $divisions[$divCode]->id;
            foreach ($dList as $d) {
                $districts[$d['code']] = District::create([
                    'division_id' => $divId,
                    'name_bn' => $d['name_bn'],
                    'name_en' => $d['name_en'],
                    'code' => $d['code'],
                    'lat' => $d['lat'],
                    'lng' => $d['lng'],
                ]);
            }
        }

        // 3. Upazilas / Thanas for key districts
        $upazilasMap = [];

        // Barishal Upazilas
        $barishalUpazilas = [
            ['name_bn' => 'বরিশাল সদর (কোতোয়ালি)', 'name_en' => 'Barishal Sadar (Kotowali)', 'lat' => 22.7010, 'lng' => 90.3535],
            ['name_bn' => 'বাবুগঞ্জ', 'name_en' => 'Babuganj', 'lat' => 22.8291, 'lng' => 90.3204],
            ['name_bn' => 'বাকেরগঞ্জ', 'name_en' => 'Bakerganj', 'lat' => 22.5516, 'lng' => 90.3396],
            ['name_bn' => 'বানারীপাড়া', 'name_en' => 'Banaripara', 'lat' => 22.7797, 'lng' => 90.1650],
            ['name_bn' => 'গৌরনদী', 'name_en' => 'Gournadi', 'lat' => 22.9734, 'lng' => 90.2312],
            ['name_bn' => 'হিজলা', 'name_en' => 'Hizla', 'lat' => 22.9080, 'lng' => 90.5098],
            ['name_bn' => 'মেহেন্দিগঞ্জ', 'name_en' => 'Mehendiganj', 'lat' => 22.8272, 'lng' => 90.5312],
            ['name_bn' => 'মুলাদী', 'name_en' => 'Muladi', 'lat' => 22.9150, 'lng' => 90.4150],
            ['name_bn' => 'উজিরপুর', 'name_en' => 'Wazirpur', 'lat' => 22.8105, 'lng' => 90.2440],
            ['name_bn' => 'আগৈলঝাড়া', 'name_en' => 'Agailjhara', 'lat' => 22.9667, 'lng' => 90.1500],
        ];
        foreach ($barishalUpazilas as $u) {
            $created = Upazila::create([
                'district_id' => $districts['BARISHAL_DIST']->id,
                'name_bn' => $u['name_bn'],
                'name_en' => $u['name_en'],
                'lat' => $u['lat'],
                'lng' => $u['lng'],
            ]);
            $upazilasMap['BAR_' . $u['name_en']] = $created;
        }

        // Dhaka Upazilas / Metropolitan Thanas
        $dhakaThanas = [
            ['name_bn' => 'ধানমন্ডি থানা', 'name_en' => 'Dhanmondi Thana', 'lat' => 23.7461, 'lng' => 90.3742],
            ['name_bn' => 'গুলশান থানা', 'name_en' => 'Gulshan Thana', 'lat' => 23.7925, 'lng' => 90.4078],
            ['name_bn' => 'মিরপুর থানা', 'name_en' => 'Mirpur Thana', 'lat' => 23.8041, 'lng' => 90.3654],
            ['name_bn' => 'উত্তরা থানা', 'name_en' => 'Uttara Thana', 'lat' => 23.8759, 'lng' => 90.3795],
            ['name_bn' => 'রমনা থানা', 'name_en' => 'Ramna Thana', 'lat' => 23.7413, 'lng' => 90.4042],
            ['name_bn' => 'মতিঝিল থানা', 'name_en' => 'Motijheel Thana', 'lat' => 23.7333, 'lng' => 90.4175],
            ['name_bn' => 'মোহাম্মদপুর থানা', 'name_en' => 'Mohammadpur Thana', 'lat' => 23.7658, 'lng' => 90.3584],
            ['name_bn' => 'সাভার উপজেলা', 'name_en' => 'Savar Upazila', 'lat' => 23.8583, 'lng' => 90.2667],
            ['name_bn' => 'কেরানীগঞ্জ উপজেলা', 'name_en' => 'Keraniganj Upazila', 'lat' => 23.6833, 'lng' => 90.3167],
            ['name_bn' => 'ধামরাই উপজেলা', 'name_en' => 'Dhamrai Upazila', 'lat' => 23.9167, 'lng' => 90.2167],
        ];
        foreach ($dhakaThanas as $u) {
            $created = Upazila::create([
                'district_id' => $districts['DHAKA_DIST']->id,
                'name_bn' => $u['name_bn'],
                'name_en' => $u['name_en'],
                'lat' => $u['lat'],
                'lng' => $u['lng'],
            ]);
            $upazilasMap['DHK_' . $u['name_en']] = $created;
        }

        // Chattogram Upazilas / Thanas
        $ctgThanas = [
            ['name_bn' => 'কোতোয়ালি থানা (চট্টগ্রাম)', 'name_en' => 'Kotowali Thana (Chattogram)', 'lat' => 22.3384, 'lng' => 91.8317],
            ['name_bn' => 'পাঁচলাইশ থানা', 'name_en' => 'Panchlaish Thana', 'lat' => 22.3686, 'lng' => 91.8286],
            ['name_bn' => 'খুলশী থানা', 'name_en' => 'Khulshi Thana', 'lat' => 22.3600, 'lng' => 91.8000],
            ['name_bn' => 'পতেঙ্গা থানা', 'name_en' => 'Patenga Thana', 'lat' => 22.2536, 'lng' => 91.7981],
            ['name_bn' => 'সীতাকুণ্ড উপজেলা', 'name_en' => 'Sitakunda Upazila', 'lat' => 22.6167, 'lng' => 91.6667],
            ['name_bn' => 'মীরসরাই উপজেলা', 'name_en' => 'Mirsarai Upazila', 'lat' => 22.7667, 'lng' => 91.5667],
            ['name_bn' => 'পটিয়া উপজেলা', 'name_en' => 'Patiya Upazila', 'lat' => 22.3000, 'lng' => 91.9833],
            ['name_bn' => 'হাটহাজারী উপজেলা', 'name_en' => 'Hathazari Upazila', 'lat' => 22.5083, 'lng' => 91.8083],
        ];
        foreach ($ctgThanas as $u) {
            $created = Upazila::create([
                'district_id' => $districts['CHATTOGRAM_DIST']->id,
                'name_bn' => $u['name_bn'],
                'name_en' => $u['name_en'],
                'lat' => $u['lat'],
                'lng' => $u['lng'],
            ]);
            $upazilasMap['CTG_' . $u['name_en']] = $created;
        }

        // Cumilla Upazilas
        $cumillaUpazilas = [
            ['name_bn' => 'আদর্শ সদর (কোতোয়ালি)', 'name_en' => 'Adarsha Sadar (Kotowali)', 'lat' => 23.4607, 'lng' => 91.1809],
            ['name_bn' => 'সদর দক্ষিণ', 'name_en' => 'Sadar Dakshin', 'lat' => 23.3850, 'lng' => 91.1710],
            ['name_bn' => 'দাউদকান্দি', 'name_en' => 'Daudkandi', 'lat' => 23.5333, 'lng' => 90.7167],
            ['name_bn' => 'চান্দিনা', 'name_en' => 'Chandina', 'lat' => 23.4833, 'lng' => 90.9833],
            ['name_bn' => 'দেবীদ্বার', 'name_en' => 'Debidwar', 'lat' => 23.6000, 'lng' => 90.9833],
            ['name_bn' => 'মুরাদনগর', 'name_en' => 'Muradnagar', 'lat' => 23.6333, 'lng' => 90.9333],
            ['name_bn' => 'লাকসাম', 'name_en' => 'Laksham', 'lat' => 23.2417, 'lng' => 91.1250],
            ['name_bn' => 'চৌদ্দগ্রাম', 'name_en' => 'Chauddagram', 'lat' => 23.2167, 'lng' => 91.3167],
            ['name_bn' => 'বুড়িচং', 'name_en' => 'Burichang', 'lat' => 23.5500, 'lng' => 91.1333],
            ['name_bn' => 'ব্রাহ্মণপাড়া', 'name_en' => 'Brahmanpara', 'lat' => 23.6167, 'lng' => 91.1167],
        ];
        foreach ($cumillaUpazilas as $u) {
            $created = Upazila::create([
                'district_id' => $districts['CUMILLA_DIST']->id,
                'name_bn' => $u['name_bn'],
                'name_en' => $u['name_en'],
                'lat' => $u['lat'],
                'lng' => $u['lng'],
            ]);
            $upazilasMap['CUM_' . $u['name_en']] = $created;
        }

        // For all other districts, provide Sadar Upazila
        foreach ($districts as $code => $distModel) {
            if (!in_array($code, ['BARISHAL_DIST', 'DHAKA_DIST', 'CHATTOGRAM_DIST', 'CUMILLA_DIST'])) {
                $created = Upazila::create([
                    'district_id' => $distModel->id,
                    'name_bn' => $distModel->name_bn . ' সদর',
                    'name_en' => $distModel->name_en . ' Sadar',
                    'lat' => $distModel->lat,
                    'lng' => $distModel->lng,
                ]);
                $upazilasMap[$code . '_SADAR'] = $created;
            }
        }

        // 4. Local Governments: City Corporations (all 12), Pourashavas, and Unions
        // 12 City Corporations of Bangladesh
        $cityCorps = [
            ['upazila_key' => 'DHK_Gulshan Thana', 'name_bn' => 'ঢাকা উত্তর সিটি কর্পোরেশন (ডিএনসিসি)', 'name_en' => 'Dhaka North City Corporation (DNCC)', 'code' => 'DNCC'],
            ['upazila_key' => 'DHK_Ramna Thana', 'name_bn' => 'ঢাকা দক্ষিণ সিটি কর্পোরেশন (ডিএসসিসি)', 'name_en' => 'Dhaka South City Corporation (DSCC)', 'code' => 'DSCC'],
            ['upazila_key' => 'CTG_Kotowali Thana (Chattogram)', 'name_bn' => 'চট্টগ্রাম সিটি কর্পোরেশন (চসিক)', 'name_en' => 'Chattogram City Corporation (CCC)', 'code' => 'CCC'],
            ['upazila_key' => 'BAR_Barishal Sadar (Kotowali)', 'name_bn' => 'বরিশাল সিটি কর্পোরেশন (বিসিসি)', 'name_en' => 'Barishal City Corporation (BCC)', 'code' => 'BCC'],
            ['upazila_key' => 'CUM_Adarsha Sadar (Kotowali)', 'name_bn' => 'কুমিল্লা সিটি কর্পোরেশন (কুসিক)', 'name_en' => 'Cumilla City Corporation (COCC)', 'code' => 'COCC'],
            ['upazila_key' => 'GAZIPUR_DIST_SADAR', 'name_bn' => 'গাজীপুর সিটি কর্পোরেশন (গাসিক)', 'name_en' => 'Gazipur City Corporation (GCC)', 'code' => 'GCC'],
            ['upazila_key' => 'NARAYANGANJ_DIST_SADAR', 'name_bn' => 'নারায়ণগঞ্জ সিটি কর্পোরেশন (নাসিক)', 'name_en' => 'Narayanganj City Corporation (NCC)', 'code' => 'NCC'],
            ['upazila_key' => 'RAJSHAHI_DIST_SADAR', 'name_bn' => 'রাজশাহী সিটি কর্পোরেশন (রাসিক)', 'name_en' => 'Rajshahi City Corporation (RCC)', 'code' => 'RCC'],
            ['upazila_key' => 'KHULNA_DIST_SADAR', 'name_bn' => 'খুলনা সিটি কর্পোরেশন (কেসিসি)', 'name_en' => 'Khulna City Corporation (KCC)', 'code' => 'KCC'],
            ['upazila_key' => 'SYLHET_DIST_SADAR', 'name_bn' => 'সিলেট সিটি কর্পোরেশন (সিসিক)', 'name_en' => 'Sylhet City Corporation (SCC)', 'code' => 'SCC'],
            ['upazila_key' => 'RANGPUR_DIST_SADAR', 'name_bn' => 'রংপুর সিটি কর্পোরেশন (রসিক)', 'name_en' => 'Rangpur City Corporation (RPCC)', 'code' => 'RPCC'],
            ['upazila_key' => 'MYMENSINGH_DIST_SADAR', 'name_bn' => 'ময়মনসিংহ সিটি কর্পোরেশন (মসিক)', 'name_en' => 'Mymensingh City Corporation (MCC)', 'code' => 'MCC'],
        ];

        $lgMap = [];
        foreach ($cityCorps as $cc) {
            $upz = $upazilasMap[$cc['upazila_key']] ?? $upazilasMap['BAR_Barishal Sadar (Kotowali)'];
            $lg = LocalGovernment::create([
                'upazila_id' => $upz->id,
                'name_bn' => $cc['name_bn'],
                'name_en' => $cc['name_en'],
                'type' => 'city_corporation',
                'code' => $cc['code'],
            ]);
            $lgMap[$cc['code']] = $lg;
        }

        // Notable Pourashavas (Municipalities)
        $pourashavas = [
            ['upazila_key' => 'BAR_Gournadi', 'name_bn' => 'গৌরনদী পৌরসভা', 'name_en' => 'Gournadi Pourashava', 'code' => 'GP'],
            ['upazila_key' => 'BAR_Bakerganj', 'name_bn' => 'বাকেরগঞ্জ পৌরসভা', 'name_en' => 'Bakerganj Pourashava', 'code' => 'BKP'],
            ['upazila_key' => 'BAR_Banaripara', 'name_bn' => 'বানারীপাড়া পৌরসভা', 'name_en' => 'Banaripara Pourashava', 'code' => 'BNP'],
            ['upazila_key' => 'CUM_Laksham', 'name_bn' => 'লাকসাম পৌরসভা', 'name_en' => 'Laksham Pourashava', 'code' => 'LP'],
            ['upazila_key' => 'CUM_Daudkandi', 'name_bn' => 'দাউদকান্দি পৌরসভা', 'name_en' => 'Daudkandi Pourashava', 'code' => 'DP'],
            ['upazila_key' => 'DHK_Savar Upazila', 'name_bn' => 'সাভার পৌরসভা', 'name_en' => 'Savar Pourashava', 'code' => 'SVP'],
            ['upazila_key' => 'CTG_Sitakunda Upazila', 'name_bn' => 'সীতাকুণ্ড পৌরসভা', 'name_en' => 'Sitakunda Pourashava', 'code' => 'SKP'],
            ['upazila_key' => 'BOGURA_DIST_SADAR', 'name_bn' => 'বগুড়া পৌরসভা', 'name_en' => 'Bogura Pourashava', 'code' => 'BOGP'],
            ['upazila_key' => 'JASHORE_DIST_SADAR', 'name_bn' => 'যশোর পৌরসভা', 'name_en' => 'Jashore Pourashava', 'code' => 'JASP'],
            ['upazila_key' => 'PATUAKHALI_DIST_SADAR', 'name_bn' => 'পটুয়াখালী পৌরসভা', 'name_en' => 'Patuakhali Pourashava', 'code' => 'PATP'],
            ['upazila_key' => 'BHOLA_DIST_SADAR', 'name_bn' => 'ভোলা পৌরসভা', 'name_en' => 'Bhola Pourashava', 'code' => 'BHP'],
            ['upazila_key' => 'COX\'S BAZAR_DIST_SADAR', 'name_bn' => 'কক্সবাজার পৌরসভা', 'name_en' => 'Cox\'s Bazar Pourashava', 'code' => 'COXP'],
        ];

        foreach ($pourashavas as $p) {
            $upz = $upazilasMap[$p['upazila_key']] ?? null;
            if ($upz) {
                $lg = LocalGovernment::create([
                    'upazila_id' => $upz->id,
                    'name_bn' => $p['name_bn'],
                    'name_en' => $p['name_en'],
                    'type' => 'pourashava',
                    'code' => $p['code'],
                ]);
                $lgMap[$p['code']] = $lg;
            }
        }

        // Notable Union Parishads
        $unions = [
            ['upazila_key' => 'BAR_Barishal Sadar (Kotowali)', 'name_bn' => 'কাশিপুর ইউনিয়ন পরিষদ', 'name_en' => 'Kashipur Union Parishad', 'code' => 'KUP'],
            ['upazila_key' => 'BAR_Barishal Sadar (Kotowali)', 'name_bn' => 'রায়পাশা কড়াপুর ইউনিয়ন পরিষদ', 'name_en' => 'Raipasha Karapur Union', 'code' => 'RKU'],
            ['upazila_key' => 'BAR_Barishal Sadar (Kotowali)', 'name_bn' => 'চরবাড়িয়া ইউনিয়ন পরিষদ', 'name_en' => 'Charbaria Union', 'code' => 'CBU'],
            ['upazila_key' => 'BAR_Babuganj', 'name_bn' => 'মাধবপাশা ইউনিয়ন পরিষদ', 'name_en' => 'Madhabpasha Union', 'code' => 'MPU'],
            ['upazila_key' => 'BAR_Babuganj', 'name_bn' => 'রহমতপুর ইউনিয়ন পরিষদ', 'name_en' => 'Rahmatpur Union', 'code' => 'RPU'],
            ['upazila_key' => 'CUM_Adarsha Sadar (Kotowali)', 'name_bn' => 'কালিরবাজার ইউনিয়ন পরিষদ', 'name_en' => 'Kalirbazar Union', 'code' => 'KBU'],
            ['upazila_key' => 'CUM_Adarsha Sadar (Kotowali)', 'name_bn' => 'আমড়াতলী ইউনিয়ন পরিষদ', 'name_en' => 'Amratali Union', 'code' => 'ATU'],
            ['upazila_key' => 'CUM_Daudkandi', 'name_bn' => 'গৌরীপুর ইউনিয়ন পরিষদ', 'name_en' => 'Gouripur Union', 'code' => 'GPU'],
            ['upazila_key' => 'DHK_Savar Upazila', 'name_bn' => 'আমিনবাজার ইউনিয়ন পরিষদ', 'name_en' => 'Aminbazar Union', 'code' => 'ABU'],
            ['upazila_key' => 'DHK_Savar Upazila', 'name_bn' => 'বিরুলিয়া ইউনিয়ন পরিষদ', 'name_en' => 'Birulia Union', 'code' => 'BRU'],
        ];

        foreach ($unions as $u) {
            $upz = $upazilasMap[$u['upazila_key']] ?? null;
            if ($upz) {
                $lg = LocalGovernment::create([
                    'upazila_id' => $upz->id,
                    'name_bn' => $u['name_bn'],
                    'name_en' => $u['name_en'],
                    'type' => 'union_parishad',
                    'code' => $u['code'],
                ]);
                $lgMap[$u['code']] = $lg;
            }
        }

        // 5. Wards for Barishal & Cumilla City Corporations (for Admin Dashboard management)
        $bcc = $lgMap['BCC'] ?? null;
        if ($bcc) {
            for ($i = 1; $i <= 30; $i++) {
                $numStr = str_pad((string)$i, 2, '0', STR_PAD_LEFT);
                $w = Ward::create([
                    'local_government_id' => $bcc->id,
                    'ward_number' => $numStr,
                    'name_bn' => "ওয়ার্ড নং {$numStr} (বিসিসি)",
                    'name_en' => "Ward {$numStr} (BCC)",
                ]);

                if ($i === 10) {
                    Area::create(['ward_id' => $w->id, 'name_bn' => 'ব্যান্ড রোড', 'name_en' => 'Band Road', 'type' => 'road']);
                    Area::create(['ward_id' => $w->id, 'name_bn' => 'লঞ্চ ঘাট এলাকা', 'name_en' => 'Launch Ghat', 'type' => 'mohalla']);
                }
            }
        }

        $cocc = $lgMap['COCC'] ?? null;
        if ($cocc) {
            for ($i = 1; $i <= 27; $i++) {
                $numStr = str_pad((string)$i, 2, '0', STR_PAD_LEFT);
                $w = Ward::create([
                    'local_government_id' => $cocc->id,
                    'ward_number' => $numStr,
                    'name_bn' => "ওয়ার্ড নং {$numStr} (কুসিক)",
                    'name_en' => "Ward {$numStr} (COCC)",
                ]);

                if ($i === 11) {
                    Area::create(['ward_id' => $w->id, 'name_bn' => 'কান্দিরপাড়', 'name_en' => 'Kandirpar', 'type' => 'mohalla']);
                    Area::create(['ward_id' => $w->id, 'name_bn' => 'বাদুরতলা', 'name_en' => 'Badurtala', 'type' => 'mohalla']);
                }
            }
        }

        // 6. Post Offices
        $postOffices = [
            ['upazila_id' => $upazilasMap['BAR_Barishal Sadar (Kotowali)']->id, 'name_bn' => 'বরিশাল প্রধান ডাকঘর', 'name_en' => 'Barishal Head Post Office', 'post_code' => '8200'],
            ['upazila_id' => $upazilasMap['BAR_Barishal Sadar (Kotowali)']->id, 'name_bn' => 'নথুল্লাবাদ উপ-ডাকঘর', 'name_en' => 'Nathullabad Sub-PO', 'post_code' => '8201'],
            ['upazila_id' => $upazilasMap['BAR_Barishal Sadar (Kotowali)']->id, 'name_bn' => 'রূপাতলী উপ-ডাকঘর', 'name_en' => 'Rupatali Sub-PO', 'post_code' => '8202'],
            ['upazila_id' => $upazilasMap['CUM_Adarsha Sadar (Kotowali)']->id, 'name_bn' => 'কুমিল্লা প্রধান ডাকঘর', 'name_en' => 'Cumilla Head Post Office', 'post_code' => '3500'],
            ['upazila_id' => $upazilasMap['CUM_Adarsha Sadar (Kotowali)']->id, 'name_bn' => 'কান্দিরপাড় উপ-ডাকঘর', 'name_en' => 'Kandirpar Sub-PO', 'post_code' => '3501'],
            ['upazila_id' => $upazilasMap['DHK_Dhanmondi Thana']->id, 'name_bn' => 'ধানমন্ডি পোস্ট অফিস', 'name_en' => 'Dhanmondi Post Office', 'post_code' => '1209'],
            ['upazila_id' => $upazilasMap['DHK_Gulshan Thana']->id, 'name_bn' => 'গুলশান পোস্ট অফিস', 'name_en' => 'Gulshan Post Office', 'post_code' => '1212'],
        ];

        foreach ($postOffices as $p) {
            PostOffice::create($p);
        }
    }
}
