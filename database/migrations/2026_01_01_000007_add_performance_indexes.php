<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Complaints indexes
        Schema::table('complaints', function (Blueprint $table) {
            $table->index('user_id', 'complaints_user_id_idx');
            $table->index('category_id', 'complaints_category_id_idx');
            $table->index('assigned_officer_id', 'complaints_assigned_officer_id_idx');
            $table->index('division_id', 'complaints_division_id_idx');
            $table->index('district_id', 'complaints_district_id_idx');
            $table->index('upazila_id', 'complaints_upazila_id_idx');
            $table->index('created_at', 'complaints_created_at_idx');
            $table->index('resolved_at', 'complaints_resolved_at_idx');
            $table->index(['user_id', 'current_status'], 'complaints_user_status_idx');
            $table->index(['assigned_officer_id', 'current_status'], 'complaints_officer_status_idx');
        });

        // 2. Geography foreign key indexes
        Schema::table('districts', function (Blueprint $table) {
            $table->index('division_id', 'districts_division_id_idx');
        });

        Schema::table('upazilas', function (Blueprint $table) {
            $table->index('district_id', 'upazilas_district_id_idx');
        });

        Schema::table('local_governments', function (Blueprint $table) {
            $table->index('upazila_id', 'local_governments_upazila_id_idx');
        });

        Schema::table('areas', function (Blueprint $table) {
            $table->index('ward_id', 'areas_ward_id_idx');
        });

        Schema::table('post_offices', function (Blueprint $table) {
            $table->index('upazila_id', 'post_offices_upazila_id_idx');
        });

        // 3. Organization and officer indexes
        Schema::table('offices', function (Blueprint $table) {
            $table->index('organization_id', 'offices_org_id_idx');
            $table->index('district_id', 'offices_district_id_idx');
        });

        Schema::table('officer_profiles', function (Blueprint $table) {
            $table->index('user_id', 'officer_profiles_user_id_idx');
            $table->index('office_id', 'officer_profiles_office_id_idx');
            $table->index('organization_id', 'officer_profiles_org_id_idx');
        });

        // 4. Complaint relations
        Schema::table('complaint_attachments', function (Blueprint $table) {
            $table->index('complaint_id', 'complaint_attachments_complaint_id_idx');
        });

        Schema::table('complaint_status_histories', function (Blueprint $table) {
            $table->index('complaint_id', 'complaint_status_histories_complaint_id_idx');
        });

        Schema::table('complaint_feedbacks', function (Blueprint $table) {
            $table->index('complaint_id', 'complaint_feedbacks_complaint_id_idx');
        });

        // 5. Notifications
        Schema::table('notifications', function (Blueprint $table) {
            $table->index('created_at', 'notifications_created_at_idx');
            $table->index(['user_id', 'is_read'], 'notifications_user_read_idx');
        });
    }

    public function down(): void
    {
        // SQLite dropIndex
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropIndex('complaints_user_id_idx');
            $table->dropIndex('complaints_category_id_idx');
            $table->dropIndex('complaints_assigned_officer_id_idx');
            $table->dropIndex('complaints_division_id_idx');
            $table->dropIndex('complaints_district_id_idx');
            $table->dropIndex('complaints_upazila_id_idx');
            $table->dropIndex('complaints_created_at_idx');
            $table->dropIndex('complaints_resolved_at_idx');
            $table->dropIndex('complaints_user_status_idx');
            $table->dropIndex('complaints_officer_status_idx');
        });
    }
};
