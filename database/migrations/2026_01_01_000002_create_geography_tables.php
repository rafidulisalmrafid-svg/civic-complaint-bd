<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Divisions (বিভাগ)
        Schema::create('divisions', function (Blueprint $table) {
            $table->id();
            $table->string('name_bn');
            $table->string('name_en');
            $table->string('code')->unique();
            $table->string('status')->default('active')->index(); // active, inactive, archived
            $table->timestamps();
        });

        // 2. Districts (জেলা)
        Schema::create('districts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('division_id')->constrained('divisions')->cascadeOnDelete();
            $table->string('name_bn');
            $table->string('name_en');
            $table->string('code')->unique();
            $table->decimal('lat', 10, 8)->nullable();
            $table->decimal('lng', 11, 8)->nullable();
            $table->string('status')->default('active')->index();
            $table->timestamps();
        });

        // 3. Upazilas / Thanas (উপজেলা/থানা)
        Schema::create('upazilas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')->constrained('districts')->cascadeOnDelete();
            $table->string('name_bn');
            $table->string('name_en');
            $table->string('code')->nullable();
            $table->decimal('lat', 10, 8)->nullable();
            $table->decimal('lng', 11, 8)->nullable();
            $table->string('status')->default('active')->index();
            $table->timestamps();
        });

        // 4. Local Governments (সিটি কর্পোরেশন / পৌরসভা / ইউনিয়ন পরিষদ)
        Schema::create('local_governments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('upazila_id')->constrained('upazilas')->cascadeOnDelete();
            $table->string('name_bn');
            $table->string('name_en');
            $table->string('type')->default('union_parishad')->index(); // city_corporation, pourashava, union_parishad
            $table->string('code')->nullable();
            $table->string('status')->default('active')->index();
            $table->timestamps();
        });

        // 5. Wards (ওয়ার্ড - scoped strictly to parent local_government)
        Schema::create('wards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('local_government_id')->constrained('local_governments')->cascadeOnDelete();
            $table->string('ward_number')->index();
            $table->string('name_bn');
            $table->string('name_en')->nullable();
            $table->string('status')->default('active')->index();
            $table->timestamps();

            // Scoped uniqueness: Ward 01 can exist across different Pourashavas/Unions
            $table->unique(['local_government_id', 'ward_number']);
        });

        // 6. Areas / Villages / Mohallas (এলাকা / গ্রাম / মহল্লা / পাড়া)
        Schema::create('areas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ward_id')->constrained('wards')->cascadeOnDelete();
            $table->string('name_bn');
            $table->string('name_en')->nullable();
            $table->string('type')->default('village'); // village, mohalla, para, road
            $table->string('status')->default('active')->index();
            $table->timestamps();
        });

        // 7. Post Offices & Codes (পোস্ট অফিস ও পোস্ট কোড)
        Schema::create('post_offices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('upazila_id')->constrained('upazilas')->cascadeOnDelete();
            $table->string('name_bn');
            $table->string('name_en');
            $table->string('post_code')->index();
            $table->string('status')->default('active')->index();
            $table->timestamps();
        });

        // 8. Jurisdictions (সংসদীয় আসন / প্রশাসনিক জোন)
        Schema::create('jurisdictions', function (Blueprint $table) {
            $table->id();
            $table->string('name_bn');
            $table->string('name_en');
            $table->string('type')->default('parliamentary_seat'); // parliamentary_seat, police_circle, special_zone
            $table->string('code')->unique();
            $table->string('status')->default('active')->index();
            $table->timestamps();
        });

        Schema::create('jurisdiction_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jurisdiction_id')->constrained('jurisdictions')->cascadeOnDelete();
            $table->foreignId('upazila_id')->nullable()->constrained('upazilas')->nullOnDelete();
            $table->foreignId('local_government_id')->nullable()->constrained('local_governments')->nullOnDelete();
            $table->foreignId('ward_id')->nullable()->constrained('wards')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jurisdiction_locations');
        Schema::dropIfExists('jurisdictions');
        Schema::dropIfExists('post_offices');
        Schema::dropIfExists('areas');
        Schema::dropIfExists('wards');
        Schema::dropIfExists('local_governments');
        Schema::dropIfExists('upazilas');
        Schema::dropIfExists('districts');
        Schema::dropIfExists('divisions');
    }
};
