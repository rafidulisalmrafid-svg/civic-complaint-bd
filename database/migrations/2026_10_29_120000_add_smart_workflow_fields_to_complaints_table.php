<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->string('accused_person_name')->nullable()->after('is_person_unknown');
            $table->text('other_problem_description')->nullable()->after('selected_issues_summary');
            $table->boolean('ai_tamper_detected')->default(false)->after('conflict_resolution_note');
        });

        Schema::table('complaint_attachments', function (Blueprint $table) {
            $table->boolean('ai_tamper_detected')->default(false)->after('analysis_flags');
            $table->integer('video_duration_seconds')->nullable()->after('file_size');
        });
    }

    public function down(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropColumn(['accused_person_name', 'other_problem_description', 'ai_tamper_detected']);
        });

        Schema::table('complaint_attachments', function (Blueprint $table) {
            $table->dropColumn(['ai_tamper_detected', 'video_duration_seconds']);
        });
    }
};
