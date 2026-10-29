<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add read tracking columns to complaints table
        Schema::table('complaints', function (Blueprint $table) {
            $table->boolean('is_read_by_officer')->default(false)->after('current_status')->index();
            $table->boolean('is_read_by_admin')->default(false)->after('is_read_by_officer')->index();
            $table->timestamp('officer_read_at')->nullable()->after('is_read_by_admin');
            $table->timestamp('admin_read_at')->nullable()->after('officer_read_at');
        });

        // 2. Division/District & Category-wise Designated Officer Assignments
        Schema::create('category_officer_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('complaint_categories')->cascadeOnDelete();
            $table->foreignId('division_id')->nullable()->constrained('divisions')->nullOnDelete();
            $table->foreignId('district_id')->nullable()->constrained('districts')->nullOnDelete();
            $table->foreignId('officer_profile_id')->constrained('officer_profiles')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_active')->default(true)->index();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['category_id', 'division_id', 'district_id', 'is_active'], 'cat_geo_officer_idx');
        });

        // 3. Admin <-> Officer In-App Chat Messages
        Schema::create('admin_officer_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->nullable()->constrained('complaints')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('receiver_id')->constrained('users')->cascadeOnDelete();
            $table->text('message');
            $table->boolean('is_read')->default(false)->index();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['complaint_id', 'created_at'], 'chat_complaint_created_idx');
            $table->index(['sender_id', 'receiver_id', 'is_read'], 'chat_sender_receiver_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_officer_messages');
        Schema::dropIfExists('category_officer_assignments');

        Schema::table('complaints', function (Blueprint $table) {
            $table->dropColumn([
                'is_read_by_officer',
                'is_read_by_admin',
                'officer_read_at',
                'admin_read_at',
            ]);
        });
    }
};
