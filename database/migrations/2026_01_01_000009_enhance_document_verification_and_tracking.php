<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Enhance complaint_attachments with AI Document Verification Pipeline fields
        Schema::table('complaint_attachments', function (Blueprint $table) {
            $table->string('verification_status')->default('pending')->index();
            $table->integer('confidence_score')->default(0);
            $table->string('document_type')->nullable()->index();
            $table->longText('ocr_extracted_text')->nullable();
            $table->json('extracted_entities')->nullable();
            $table->string('file_hash', 64)->nullable()->index();
            $table->boolean('is_duplicate')->default(false)->index();
            $table->unsignedBigInteger('duplicate_of_attachment_id')->nullable();
            $table->json('analysis_flags')->nullable();
            $table->string('verification_method')->nullable();
            $table->string('admin_review_status')->default('pending')->index();
            $table->text('admin_review_notes')->nullable();
            $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
        });

        // 2. Enhance complaints with Conflict of Interest & Dispatch telemetry
        Schema::table('complaints', function (Blueprint $table) {
            $table->boolean('conflict_of_interest_detected')->default(false)->index();
            $table->string('conflict_resolution_note')->nullable();
            $table->timestamp('routing_dispatch_time')->nullable();
            $table->timestamp('department_acknowledged_at')->nullable();
            $table->string('delivery_status')->default('delivered')->index();
            $table->string('formal_letter_text')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropColumn([
                'conflict_of_interest_detected',
                'conflict_resolution_note',
                'routing_dispatch_time',
                'department_acknowledged_at',
                'delivery_status',
                'formal_letter_text',
            ]);
        });

        Schema::table('complaint_attachments', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by_user_id']);
            $table->dropColumn([
                'verification_status',
                'confidence_score',
                'document_type',
                'ocr_extracted_text',
                'extracted_entities',
                'file_hash',
                'is_duplicate',
                'duplicate_of_attachment_id',
                'analysis_flags',
                'verification_method',
                'admin_review_status',
                'admin_review_notes',
                'reviewed_by_user_id',
                'reviewed_at',
            ]);
        });
    }
};
