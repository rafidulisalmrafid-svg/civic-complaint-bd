<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Posts / Designations Catalog (পদবি ডিরেক্টরি)
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('name_bn');
            $table->string('name_en');
            $table->string('code')->nullable();
            $table->integer('rank_level')->default(1);
            $table->string('department_group')->nullable(); // e.g. health, land, general_admin, police
            $table->string('status')->default('active')->index();
            $table->timestamps();
        });

        // 2. Office Branches / Departments / Service Units (অফিসের শাখা / ডিপার্টমেন্ট)
        Schema::create('office_branches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('office_id')->constrained('offices')->cascadeOnDelete();
            $table->string('name_bn');
            $table->string('name_en');
            $table->string('code')->nullable();
            $table->string('room_number')->nullable();
            $table->string('floor')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('active')->index();
            $table->timestamps();

            $table->index(['office_id', 'status'], 'office_branches_office_status_idx');
        });

        // 3. Predefined Problem Types / Clickable Issues (স্মার্ট সমস্যার ধরন ক্যাটালগ)
        Schema::create('complaint_problem_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('complaint_categories')->cascadeOnDelete();
            $table->string('cluster_name_bn')->default('সাধারণ'); // e.g. ডাক্তার, কর্মকর্তা/স্টাফ, ওষুধ, অর্থ/ঘুষ, সেবা প্রদানে বিলম্ব
            $table->string('cluster_name_en')->default('General');
            $table->string('title_bn');
            $table->string('title_en')->nullable();
            $table->string('severity')->default('medium')->index(); // low, medium, high, urgent
            $table->integer('default_sla_days')->default(7);
            $table->integer('display_order')->default(0);
            $table->string('status')->default('active')->index();
            $table->timestamps();

            $table->index(['category_id', 'status'], 'problem_types_cat_status_idx');
        });

        // 4. Complaint Selected Issues (অভিযোগে চিহ্নিত নির্দিষ্ট সমস্যাগুলোর রিলেশনাল রেকর্ড)
        Schema::create('complaint_selected_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained('complaints')->cascadeOnDelete();
            $table->foreignId('problem_type_id')->nullable()->constrained('complaint_problem_types')->nullOnDelete();
            $table->string('cluster_name_bn')->nullable();
            $table->string('title_bn');
            $table->timestamps();

            $table->index('complaint_id', 'selected_issues_complaint_id_idx');
        });

        // 5. Update officer_profiles table with branch and post references
        Schema::table('officer_profiles', function (Blueprint $table) {
            $table->foreignId('post_id')->nullable()->constrained('posts')->nullOnDelete();
            $table->foreignId('office_branch_id')->nullable()->constrained('office_branches')->nullOnDelete();
            $table->boolean('is_office_focal_point')->default(false)->index();
            $table->boolean('is_district_complaint_officer')->default(false)->index();
        });

        // 6. Update complaints table with branch and post references
        Schema::table('complaints', function (Blueprint $table) {
            $table->foreignId('office_branch_id')->nullable()->constrained('office_branches')->nullOnDelete();
            $table->foreignId('target_post_id')->nullable()->constrained('posts')->nullOnDelete();
            $table->boolean('is_person_unknown')->default(false)->index();
            $table->string('selected_issues_summary')->nullable(); // Cached text summary of selected issues
        });
    }

    public function down(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropForeign(['office_branch_id']);
            $table->dropForeign(['target_post_id']);
            $table->dropColumn(['office_branch_id', 'target_post_id', 'is_person_unknown', 'selected_issues_summary']);
        });

        Schema::table('officer_profiles', function (Blueprint $table) {
            $table->dropForeign(['post_id']);
            $table->dropForeign(['office_branch_id']);
            $table->dropColumn(['post_id', 'office_branch_id', 'is_office_focal_point', 'is_district_complaint_officer']);
        });

        Schema::dropIfExists('complaint_selected_issues');
        Schema::dropIfExists('complaint_problem_types');
        Schema::dropIfExists('office_branches');
        Schema::dropIfExists('posts');
    }
};
