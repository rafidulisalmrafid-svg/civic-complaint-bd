<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Organization Types (দপ্তর/সংস্থার ধরন)
        Schema::create('organization_types', function (Blueprint $table) {
            $table->id();
            $table->string('name_bn');
            $table->string('name_en');
            $table->string('slug')->unique();
            $table->integer('level_order')->default(1); // 1: Ministry, 2: Directorate, 3: Agency/Board, 4: Field Office
            $table->timestamps();
        });

        // 2. Organizations (মন্ত্রণালয়, অধিদপ্তর, সংস্থা)
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->foreignId('organization_type_id')->constrained('organization_types')->cascadeOnDelete();
            $table->string('name_bn');
            $table->string('name_en');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('website')->nullable();
            $table->string('icon')->nullable();
            $table->string('status')->default('active')->index(); // active, inactive, archived
            $table->timestamps();
        });

        // 3. Offices (নির্দিষ্ট অফিস: যেমন জেলা কার্যালয়, উপজেলা অফিস)
        Schema::create('offices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('offices')->nullOnDelete();
            $table->string('name_bn');
            $table->string('name_en');
            $table->string('code')->nullable();
            $table->foreignId('division_id')->nullable()->constrained('divisions')->nullOnDelete();
            $table->foreignId('district_id')->nullable()->constrained('districts')->nullOnDelete();
            $table->foreignId('upazila_id')->nullable()->constrained('upazilas')->nullOnDelete();
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('status')->default('active')->index(); // active, inactive, archived
            $table->timestamps();
        });

        // 4. Officer Profiles (কর্মকর্তার তথ্য - decoupled from login account)
        Schema::create('officer_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->unique()->constrained('users')->nullOnDelete();
            $table->string('employee_id')->nullable()->index();
            $table->string('name_bn');
            $table->string('name_en');
            $table->string('designation_bn');
            $table->string('designation_en')->nullable();
            $table->string('official_phone')->nullable();
            $table->string('official_email')->nullable();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('office_id')->constrained('offices')->cascadeOnDelete();
            $table->foreignId('division_id')->nullable()->constrained('divisions')->nullOnDelete();
            $table->foreignId('district_id')->nullable()->constrained('districts')->nullOnDelete();
            $table->foreignId('upazila_id')->nullable()->constrained('upazilas')->nullOnDelete();
            $table->foreignId('jurisdiction_id')->nullable()->constrained('jurisdictions')->nullOnDelete();
            $table->date('joining_date')->nullable();
            $table->string('status')->default('active')->index(); // active, inactive, transferred, retired, archived
            $table->timestamps();
        });

        // 5. Officer Assignment History (বদলি ও পদায়ন ইতিহাস)
        Schema::create('officer_assignment_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('officer_profile_id')->constrained('officer_profiles')->cascadeOnDelete();
            $table->foreignId('previous_office_id')->nullable()->constrained('offices')->nullOnDelete();
            $table->foreignId('new_office_id')->nullable()->constrained('offices')->nullOnDelete();
            $table->string('previous_designation')->nullable();
            $table->string('new_designation')->nullable();
            $table->string('change_type')->default('transfer'); // joining, transfer, promotion, redesignation, retirement
            $table->string('transfer_order_no')->nullable();
            $table->date('effective_date')->nullable();
            $table->foreignId('changed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('officer_assignment_histories');
        Schema::dropIfExists('officer_profiles');
        Schema::dropIfExists('offices');
        Schema::dropIfExists('organizations');
        Schema::dropIfExists('organization_types');
    }
};
