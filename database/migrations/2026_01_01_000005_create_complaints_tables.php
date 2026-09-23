<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Citizens (নাগরিক প্রোফাইল)
        Schema::create('citizens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('nid_number')->nullable();
            $table->string('alternative_phone')->nullable();
            $table->text('address')->nullable();
            $table->foreignId('division_id')->nullable()->constrained('divisions')->nullOnDelete();
            $table->foreignId('district_id')->nullable()->constrained('districts')->nullOnDelete();
            $table->foreignId('upazila_id')->nullable()->constrained('upazilas')->nullOnDelete();
            $table->string('preferred_language')->default('bn');
            $table->json('notification_prefs')->nullable();
            $table->timestamps();
        });

        // 2. Complaints (অভিযোগ মূল টেবিল)
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_id')->unique()->index(); // e.g. CT-BAR-2026-000152
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('complainant_name');
            $table->string('complainant_phone');
            $table->boolean('is_anonymous')->default(false);

            // Category
            $table->foreignId('category_id')->constrained('complaint_categories')->cascadeOnDelete();
            $table->foreignId('subcategory_id')->nullable()->constrained('complaint_subcategories')->nullOnDelete();

            $table->string('title');
            $table->text('description');
            $table->string('priority')->default('medium')->index(); // low, medium, high, urgent
            $table->boolean('is_sensitive')->default(false)->index();

            // Geography
            $table->foreignId('division_id')->nullable()->constrained('divisions')->nullOnDelete();
            $table->foreignId('district_id')->nullable()->constrained('districts')->nullOnDelete();
            $table->foreignId('upazila_id')->nullable()->constrained('upazilas')->nullOnDelete();
            $table->foreignId('local_government_id')->nullable()->constrained('local_governments')->nullOnDelete();
            $table->foreignId('ward_id')->nullable()->constrained('wards')->nullOnDelete();
            $table->foreignId('area_id')->nullable()->constrained('areas')->nullOnDelete();
            $table->foreignId('post_office_id')->nullable()->constrained('post_offices')->nullOnDelete();
            $table->text('specific_location_details')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Authority & Assignment
            $table->foreignId('organization_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->foreignId('office_id')->nullable()->constrained('offices')->nullOnDelete();
            $table->foreignId('specific_officer_id')->nullable()->constrained('officer_profiles')->nullOnDelete(); // Targeted officer (not auto-assigned!)
            $table->foreignId('assigned_officer_id')->nullable()->constrained('officer_profiles')->nullOnDelete();

            // Status & Lifecycle
            // submitted, received, under_review, assigned, forwarded, investigation_started, action_taken, resolution_submitted, resolved, closed, reopened, escalated, overdue, rejected
            $table->string('current_status')->default('submitted')->index();
            $table->json('custom_fields_data')->nullable();

            $table->timestamp('due_at')->nullable()->index();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });

        // 3. Complaint Attachments (প্রমাণ ও নথি)
        Schema::create('complaint_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained('complaints')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('original_filename');
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size');
            $table->boolean('is_camera_capture')->default(false);
            $table->boolean('is_private')->default(false); // Only accessible to authorized reviewers
            $table->foreignId('uploaded_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 4. Complaint Status History & Timeline (টাইমলাইন ও ট্র্যাক রেকর্ড)
        Schema::create('complaint_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained('complaints')->cascadeOnDelete();
            $table->string('from_status');
            $table->string('to_status');
            $table->string('action_type'); // submitted, reviewed, assigned, forwarded, investigated, resolved, reopened
            $table->text('remarks_bn')->nullable();
            $table->foreignId('changed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_public_to_citizen')->default(true); // Internal status details hidden if false
            $table->timestamps();
        });

        // 5. Complaint Assignments (অ্যাসাইনমেন্ট ও পুনঃঅ্যাসাইনমেন্ট লগ)
        Schema::create('complaint_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained('complaints')->cascadeOnDelete();
            $table->foreignId('assigned_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_to_officer_id')->constrained('officer_profiles')->cascadeOnDelete();
            $table->foreignId('assigned_office_id')->nullable()->constrained('offices')->nullOnDelete();
            $table->text('instruction')->nullable();
            $table->timestamp('deadline')->nullable();
            $table->string('status')->default('active'); // active, reassigned, completed
            $table->timestamps();
        });

        // 6. Complaint Internal Notes (অভ্যন্তরীণ নোট - নাগরিকদের থেকে সম্পূর্ণ গোপন)
        Schema::create('complaint_internal_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained('complaints')->cascadeOnDelete();
            $table->foreignId('author_user_id')->constrained('users')->cascadeOnDelete();
            $table->text('note');
            $table->boolean('is_confidential')->default(true);
            $table->timestamps();
        });

        // 7. Complaint Actions & Resolution Proof (ব্যবস্থা গ্রহণ ও নিষ্পত্তি প্রমাণ)
        Schema::create('complaint_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained('complaints')->cascadeOnDelete();
            $table->foreignId('officer_id')->constrained('officer_profiles')->cascadeOnDelete();
            $table->string('action_type'); // inspection, warning_issued, fine, repair_initiated, resolved
            $table->text('description');
            $table->foreignId('proof_attachment_id')->nullable()->constrained('complaint_attachments')->nullOnDelete();
            $table->timestamps();
        });

        // 8. Complaint Feedbacks & Reopen (নাগরিক প্রতিক্রিয়া ও পুনরায় খোলার আবেদন)
        Schema::create('complaint_feedbacks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained('complaints')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('was_resolved')->default('yes'); // yes, partially, no
            $table->tinyInteger('satisfaction_rating')->nullable(); // 1 to 5
            $table->text('comment')->nullable();
            $table->boolean('is_reopen_requested')->default(false);
            $table->text('reopen_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_feedbacks');
        Schema::dropIfExists('complaint_actions');
        Schema::dropIfExists('complaint_internal_notes');
        Schema::dropIfExists('complaint_assignments');
        Schema::dropIfExists('complaint_status_histories');
        Schema::dropIfExists('complaint_attachments');
        Schema::dropIfExists('complaints');
        Schema::dropIfExists('citizens');
    }
};
