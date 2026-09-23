<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Citizen;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Main System Administrator
        $admin = User::create([
            'name' => 'সুপার অ্যাডমিন (নাগরিক সেবা)',
            'phone' => '01700000000',
            'email' => 'admin@nagorik.gov.bd',
            'password' => Hash::make('password123'),
            'role' => 'main_admin',
            'is_active' => true,
        ]);

        // 2. Barishal District Civil Surgeon / Officer
        $officerBarishal = User::create([
            'name' => 'ডা. মারুফ হাসান (সিভিল সার্জন)',
            'phone' => '01800000000',
            'email' => 'officer@barishal.gov.bd',
            'password' => Hash::make('password123'),
            'role' => 'officer',
            'is_active' => true,
        ]);

        // 3. Cumilla City Corporation Executive Officer
        $officerCumilla = User::create([
            'name' => 'মোঃ জহিরুল ইসলাম (নির্বাহী প্রকৌশলী)',
            'phone' => '01900000000',
            'email' => 'officer@cumilla.gov.bd',
            'password' => Hash::make('password123'),
            'role' => 'officer',
            'is_active' => true,
        ]);

        // 4. Barishal Area Officer / UNO
        $areaOfficerBarishal = User::create([
            'name' => 'নুসরাত জাহান (সহকারী কমিশনার - ভূমি)',
            'phone' => '01600000000',
            'email' => 'acland@barishal.gov.bd',
            'password' => Hash::make('password123'),
            'role' => 'area_officer',
            'is_active' => true,
        ]);

        // 5. General Citizens
        $citizen1 = User::create([
            'name' => 'তানভীর আহমেদ',
            'phone' => '01711223344',
            'email' => 'tanvir@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'citizen',
            'is_active' => true,
        ]);

        Citizen::create([
            'user_id' => $citizen1->id,
            'nid_number' => '19951234567890123',
            'address' => 'ব্যান্ড রোড, কোতোয়ালি, বরিশাল',
            'preferred_language' => 'bn',
        ]);

        $citizen2 = User::create([
            'name' => 'নাজমুন নাহার',
            'phone' => '01811223344',
            'email' => 'nazmun@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'citizen',
            'is_active' => true,
        ]);

        Citizen::create([
            'user_id' => $citizen2->id,
            'nid_number' => '19989876543210987',
            'address' => 'কান্দিরপাড়, সদর, কুমিল্লা',
            'preferred_language' => 'bn',
        ]);
    }
}
