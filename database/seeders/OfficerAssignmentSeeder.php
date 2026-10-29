<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CategoryOfficerAssignment;
use App\Models\ComplaintCategory;
use App\Models\Division;
use App\Models\District;
use App\Models\OfficerProfile;
use App\Models\User;

class OfficerAssignmentSeeder extends Seeder
{
    public function run(): void
    {
        $officers = OfficerProfile::all();
        $categories = ComplaintCategory::all();
        $divisions = Division::all();
        $admin = User::where('role', 'main_admin')->first();

        if ($officers->isEmpty() || $categories->isEmpty()) {
            return;
        }

        $healthCat = $categories->firstWhere('code', 'health') ?? $categories->first();
        $landCat = $categories->firstWhere('code', 'land') ?? ($categories->count() > 1 ? $categories[1] : $categories->first());
        $policeCat = $categories->firstWhere('code', 'police') ?? ($categories->count() > 2 ? $categories[2] : $categories->first());

        $barishal = $divisions->firstWhere('code', 'BAR') ?? $divisions->first();
        $chattogram = $divisions->firstWhere('code', 'CTG') ?? ($divisions->count() > 1 ? $divisions[1] : $divisions->first());
        $dhaka = $divisions->firstWhere('code', 'DHA') ?? ($divisions->count() > 2 ? $divisions[2] : $divisions->first());

        $officer1 = $officers[0];
        $officer2 = $officers->count() > 1 ? $officers[1] : $officers[0];
        $officer3 = $officers->count() > 2 ? $officers[2] : $officers[0];

        // 1. Health in Barishal
        CategoryOfficerAssignment::firstOrCreate([
            'category_id' => $healthCat->id,
            'division_id' => $barishal?->id,
        ], [
            'officer_profile_id' => $officer1->id,
            'user_id' => $officer1->user_id,
            'assigned_by_user_id' => $admin?->id,
            'is_active' => true,
            'notes' => 'বরিশাল বিভাগের স্বাস্থ্য ও পরিবার কল্যাণ খাত সংক্রান্ত সকল অভিযোগের প্রাথমিক তদারকি ও নিষ্পত্তি কর্মকর্তা।',
        ]);

        // 2. Land in Chattogram
        if ($chattogram && $landCat) {
            CategoryOfficerAssignment::firstOrCreate([
                'category_id' => $landCat->id,
                'division_id' => $chattogram->id,
            ], [
                'officer_profile_id' => $officer2->id,
                'user_id' => $officer2->user_id,
                'assigned_by_user_id' => $admin?->id,
                'is_active' => true,
                'notes' => 'চট্টগ্রাম বিভাগের ভূমি অফিস, নামজারি ও রেকর্ড সংক্রান্ত নাগরিক অভিযোগের দায়িত্বপ্রাপ্ত কর্মকর্তা।',
            ]);
        }

        // 3. Police in Dhaka
        if ($dhaka && $policeCat) {
            CategoryOfficerAssignment::firstOrCreate([
                'category_id' => $policeCat->id,
                'division_id' => $dhaka->id,
            ], [
                'officer_profile_id' => $officer3->id,
                'user_id' => $officer3->user_id,
                'assigned_by_user_id' => $admin?->id,
                'is_active' => true,
                'notes' => 'ঢাকা মেট্রোপলিটন ও রেঞ্জের থানা ও আইনশৃঙ্খলা সেবা সংক্রান্ত অভিযোগ দায়িত্ব কর্মকর্তা।',
            ]);
        }
    }
}
