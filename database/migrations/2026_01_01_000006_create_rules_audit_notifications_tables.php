<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Dynamic Routing Rules (ডাইনামিক রাউটিং ইঞ্জিন)
        Schema::create('routing_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('category_id')->nullable()->constrained('complaint_categories')->nullOnDelete();
            $table->foreignId('subcategory_id')->nullable()->constrained('complaint_subcategories')->nullOnDelete();
            $table->foreignId('division_id')->nullable()->constrained('divisions')->nullOnDelete();
            $table->foreignId('district_id')->nullable()->constrained('districts')->nullOnDelete();
            $table->foreignId('upazila_id')->nullable()->constrained('upazilas')->nullOnDelete();
            $table->foreignId('target_organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('target_office_id')->nullable()->constrained('offices')->nullOnDelete();
            $table->string('priority_override')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        // 2. SLA Rules (এসএলএ কনফিগারেশন)
        Schema::create('sla_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('complaint_categories')->cascadeOnDelete();
            $table->string('priority')->default('medium'); // low, medium, high, urgent
            $table->integer('review_sla_hours')->default(24);
            $table->integer('investigation_sla_hours')->default(72);
            $table->integer('resolution_sla_hours')->default(168); // 7 days default
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Escalation Rules (এসকেলেশন নীতিমালা)
        Schema::create('escalation_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('trigger_after_overdue_hours')->default(24);
            $table->string('escalate_to_role')->default('dept_admin'); // dept_admin, main_admin
            $table->string('notification_message');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. Audit Logs (সম্পূর্ণ অডিট ট্রেইল)
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->nullable();
            $table->string('user_role')->nullable();
            $table->string('event_action')->index(); // created, updated, deleted, status_changed, assigned, resolved
            $table->string('auditable_type')->index();
            $table->unsignedBigInteger('auditable_id')->index();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });

        // 5. Notifications (ইন-অ্যাপ নোটিফিকেশন)
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title_bn');
            $table->text('message_bn');
            $table->string('type')->default('info'); // info, success, warning, alert
            $table->string('link')->nullable();
            $table->boolean('is_read')->default(false)->index();
            $table->timestamps();
        });

        // 6. System Settings (সিস্টেম কনফিগারেশন)
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->index();
            $table->text('value')->nullable();
            $table->string('group')->default('general');
            $table->string('label_bn')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('escalation_rules');
        Schema::dropIfExists('sla_rules');
        Schema::dropIfExists('routing_rules');
    }
};
