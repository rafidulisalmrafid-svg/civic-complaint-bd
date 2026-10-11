<?php

namespace Database\Seeders;

use App\Models\Post;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        $posts = [
            // Health
            ['name_bn' => 'পরিচালক (হাসপাতাল)', 'name_en' => 'Director (Hospital)', 'code' => 'DIR_HOSP', 'rank_level' => 3, 'department_group' => 'health'],
            ['name_bn' => 'সিভিল সার্জন', 'name_en' => 'Civil Surgeon', 'code' => 'CIVIL_SURG', 'rank_level' => 3, 'department_group' => 'health'],
            ['name_bn' => 'অধ্যাপক ও বিভাগীয় প্রধান', 'name_en' => 'Professor & Head of Dept', 'code' => 'PROF_HOD', 'rank_level' => 4, 'department_group' => 'health'],
            ['name_bn' => 'সহযোগী অধ্যাপক', 'name_en' => 'Associate Professor', 'code' => 'ASSOC_PROF', 'rank_level' => 5, 'department_group' => 'health'],
            ['name_bn' => 'সহকারী অধ্যাপক', 'name_en' => 'Assistant Professor', 'code' => 'ASST_PROF', 'rank_level' => 6, 'department_group' => 'health'],
            ['name_bn' => 'সিনিয়র কনসালট্যান্ট', 'name_en' => 'Senior Consultant', 'code' => 'SR_CONSULT', 'rank_level' => 5, 'department_group' => 'health'],
            ['name_bn' => 'জুনিয়র কনসালট্যান্ট', 'name_en' => 'Junior Consultant', 'code' => 'JR_CONSULT', 'rank_level' => 6, 'department_group' => 'health'],
            ['name_bn' => 'উপজেলা স্বাস্থ্য ও পরিবার পরিকল্পনা কর্মকর্তা (UHFPO)', 'name_en' => 'UHFPO', 'code' => 'UHFPO', 'rank_level' => 5, 'department_group' => 'health'],
            ['name_bn' => 'মেডিকেল অফিসার', 'name_en' => 'Medical Officer', 'code' => 'MED_OFFICER', 'rank_level' => 9, 'department_group' => 'health'],
            ['name_bn' => 'জরুরি মেডিকেল অফিসার', 'name_en' => 'Emergency Medical Officer', 'code' => 'EMO', 'rank_level' => 9, 'department_group' => 'health'],
            ['name_bn' => 'নার্সিং সুপারভাইজার', 'name_en' => 'Nursing Supervisor', 'code' => 'NURSE_SUPV', 'rank_level' => 10, 'department_group' => 'health'],
            ['name_bn' => 'ফার্মাসিস্ট', 'name_en' => 'Pharmacist', 'code' => 'PHARMACIST', 'rank_level' => 11, 'department_group' => 'health'],

            // Land
            ['name_bn' => 'অতিরিক্ত জেলা প্রশাসক (রাজস্ব)', 'name_en' => 'ADC (Revenue)', 'code' => 'ADC_REV', 'rank_level' => 5, 'department_group' => 'land'],
            ['name_bn' => 'সহকারী কমিশনার (ভূমি)', 'name_en' => 'Assistant Commissioner (Land)', 'code' => 'AC_LAND', 'rank_level' => 6, 'department_group' => 'land'],
            ['name_bn' => 'কানুনগো', 'name_en' => 'Kanungo', 'code' => 'KANUNGO', 'rank_level' => 10, 'department_group' => 'land'],
            ['name_bn' => 'সার্ভেয়ার', 'name_en' => 'Surveyor', 'code' => 'SURVEYOR', 'rank_level' => 14, 'department_group' => 'land'],
            ['name_bn' => 'ইউনিয়ন ভূমি উপ-সহকারী কর্মকর্তা (নায়েব)', 'name_en' => 'Union Land Sub-Assistant Officer', 'code' => 'NAYEB', 'rank_level' => 11, 'department_group' => 'land'],
            ['name_bn' => 'নামজারি সহকারী ও পেশকার', 'name_en' => 'Mutation Assistant', 'code' => 'MUT_ASST', 'rank_level' => 14, 'department_group' => 'land'],

            // Police
            ['name_bn' => 'পুলিশ সুপার (SP)', 'name_en' => 'Superintendent of Police', 'code' => 'SP', 'rank_level' => 5, 'department_group' => 'police'],
            ['name_bn' => 'অফিসার ইনচার্জ (OC)', 'name_en' => 'Officer-in-Charge', 'code' => 'OC', 'rank_level' => 9, 'department_group' => 'police'],
            ['name_bn' => 'পুলিশ পরিদর্শক (তদন্ত)', 'name_en' => 'Inspector (Investigation)', 'code' => 'INSP_INVEST', 'rank_level' => 9, 'department_group' => 'police'],
            ['name_bn' => 'উপ-পরিদর্শক (SI)', 'name_en' => 'Sub-Inspector', 'code' => 'SI', 'rank_level' => 10, 'department_group' => 'police'],
            ['name_bn' => 'সহকারী উপ-পরিদর্শক (ASI)', 'name_en' => 'Assistant Sub-Inspector', 'code' => 'ASI', 'rank_level' => 14, 'department_group' => 'police'],

            // Education
            ['name_bn' => 'জেলা শিক্ষা কর্মকর্তা (DEO)', 'name_en' => 'District Education Officer', 'code' => 'DEO', 'rank_level' => 6, 'department_group' => 'education'],
            ['name_bn' => 'উপজেলা মাধ্যমিক শিক্ষা কর্মকর্তা (USEO)', 'name_en' => 'Upazila Secondary Education Officer', 'code' => 'USEO', 'rank_level' => 9, 'department_group' => 'education'],
            ['name_bn' => 'প্রধান শিক্ষক / অধ্যক্ষ', 'name_en' => 'Head Teacher / Principal', 'code' => 'PRINCIPAL', 'rank_level' => 7, 'department_group' => 'education'],

            // Local Government & Engineering
            ['name_bn' => 'প্রধান নির্বাহী কর্মকর্তা (CEO)', 'name_en' => 'Chief Executive Officer', 'code' => 'CEO_LG', 'rank_level' => 5, 'department_group' => 'local_govt'],
            ['name_bn' => 'নির্বাহী প্রকৌশলী (Executive Engineer)', 'name_en' => 'Executive Engineer', 'code' => 'EXEC_ENGR', 'rank_level' => 6, 'department_group' => 'local_govt'],
            ['name_bn' => 'সহকারী প্রকৌশলী (Assistant Engineer)', 'name_en' => 'Assistant Engineer', 'code' => 'ASST_ENGR', 'rank_level' => 9, 'department_group' => 'local_govt'],
            ['name_bn' => 'বর্জ্য ব্যবস্থাপনা পরিদর্শক', 'name_en' => 'Waste Management Inspector', 'code' => 'WASTE_INSP', 'rank_level' => 12, 'department_group' => 'local_govt'],

            // General Administration
            ['name_bn' => 'জেলা প্রশাসক (DC)', 'name_en' => 'Deputy Commissioner', 'code' => 'DC', 'rank_level' => 5, 'department_group' => 'general_admin'],
            ['name_bn' => 'উপজেলা নির্বাহী কর্মকর্তা (UNO)', 'name_en' => 'Upazila Nirbahi Officer', 'code' => 'UNO', 'rank_level' => 6, 'department_group' => 'general_admin'],
            ['name_bn' => 'জেলা অভিযোগ কর্মকর্তা (DCO)', 'name_en' => 'District Complaint Officer', 'code' => 'DCO', 'rank_level' => 6, 'department_group' => 'general_admin'],
        ];

        foreach ($posts as $item) {
            Post::firstOrCreate(
                ['code' => $item['code']],
                $item
            );
        }
    }
}
