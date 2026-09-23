<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Complaint Categories (অভিযোগের মূল ক্যাটাগরি)
        Schema::create('complaint_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name_bn');
            $table->string('name_en');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->text('description')->nullable();
            $table->string('default_priority')->default('medium'); // low, medium, high, urgent
            $table->integer('default_sla_days')->default(7);
            $table->boolean('is_sensitive')->default(false); // women/children, harassment, sensitive safety
            $table->foreignId('ministry_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->foreignId('default_organization_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->integer('display_order')->default(0);
            $table->string('status')->default('active')->index(); // active, inactive, archived
            $table->timestamps();
        });

        // 2. Complaint Subcategories (সাবক্যাটাগরি)
        Schema::create('complaint_subcategories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_category_id')->constrained('complaint_categories')->cascadeOnDelete();
            $table->string('name_bn');
            $table->string('name_en');
            $table->text('description')->nullable();
            $table->foreignId('default_organization_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->integer('display_order')->default(0);
            $table->string('status')->default('active')->index(); // active, inactive, archived
            $table->timestamps();
        });

        // 3. Custom Fields for Dynamic Form Builder (কাস্টম ফিল্ড বিল্ডার)
        Schema::create('custom_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_category_id')->nullable()->constrained('complaint_categories')->cascadeOnDelete(); // null = global
            $table->string('field_name');
            $table->string('label_bn');
            $table->string('label_en');
            $table->string('field_type')->default('text'); // text, textarea, number, date, dropdown, radio, checkbox, file
            $table->json('options_json')->nullable(); // For dropdown, radio, checkbox
            $table->string('placeholder_bn')->nullable();
            $table->boolean('is_required')->default(false);
            $table->integer('display_order')->default(0);
            $table->string('status')->default('active')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_fields');
        Schema::dropIfExists('complaint_subcategories');
        Schema::dropIfExists('complaint_categories');
    }
};
