<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Citizen;
use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Models\Division;
use App\Models\District;
use App\Models\Upazila;
use App\Models\Office;
use App\Models\Organization;
use App\Models\OfficerProfile;
use App\Models\Post;
use App\Models\ComplaintProblemType;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class ComprehensivePlatformAuditTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Test 1: Public Pages & Visual Routes
     */
    public function test_public_pages_render_successfully(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);

        $response = $this->get('/categories');
        $response->assertStatus(200);

        $response = $this->get('/how-it-works');
        $response->assertStatus(200);

        $response = $this->get('/faq');
        $response->assertStatus(200);

        $response = $this->get('/about');
        $response->assertStatus(200);

        $response = $this->get('/privacy');
        $response->assertStatus(200);

        $response = $this->get('/contact');
        $response->assertStatus(200);

        $response = $this->get('/ai-assistant');
        $response->assertStatus(200);

        $response = $this->get('/submit');
        $response->assertStatus(200);
    }

    /**
     * Test 2: AI & Voice Complaint Assistant Endpoints
     */
    public function test_ai_initial_data_and_analyzer(): void
    {
        // Initial Data
        $response = $this->getJson('/api/ai/initial-data');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'categories',
                'offices',
                'officers',
                'posts',
                'districts',
                'divisions'
            ]);

        // Smart Analyzer on natural language text
        $response = $this->postJson('/api/ai/analyze', [
            'text' => 'বরিশাল সদর হাসপাতালের জরুরি বিভাগে ডাক্তার নেই, রোগীরা চরম ভোগান্তিতে পড়েছেন।',
            'lang' => 'bn'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'category_id' => 1, // Health
            ])
            ->assertJsonStructure([
                'category_name_bn',
                'office_name_bn',
                'candidate_officers',
                'suggested_scenarios',
                'suggested_remedies'
            ]);
    }

    /**
     * Test 3: Bengali Voice TTS Streaming Endpoint
     */
    public function test_voice_tts_streaming(): void
    {
        $response = $this->get('/api/ai/tts?text=' . urlencode('আসসালামু আলাইকুম'));
        $response->assertStatus(200);
        $this->assertEquals('audio/mpeg', $response->headers->get('Content-Type'));
    }

    /**
     * Test 4: AI Formal Letter Generation and Complaint Submission
     */
    public function test_ai_formal_letter_generation_and_submission(): void
    {
        $letterResponse = $this->postJson('/api/ai/generate-formal-letter', [
            'category_id' => 1,
            'office_name' => 'সিভিল সার্জন কার্যালয়, বরিশাল',
            'officer_name' => 'কর্তব্যরত আবাসিক মেডিকেল অফিসার',
            'officer_designation' => 'আবাসিক মেডিকেল অফিসার',
            'is_person_unknown' => false,
            'incident_location' => 'বরিশাল সদর রোড',
            'incident_time' => 'গত ৩ দিন ধরে',
            'description' => 'হাসপাতালে সেবা নিতে গিয়ে চরম অবহেলা ও দীর্ঘক্ষণ অপেক্ষার শিকার হতে হয়েছে।',
            'remedy_requested' => 'জরুরি ভিত্তিতে তদন্ত ও যথাযথ ব্যবস্থা গ্রহণ',
            'evidence_statement' => 'সরেজমিন প্রত্যক্ষদর্শী বিবরণ',
            'complainant_name' => 'মোসাদ্দেক হোসেন',
            'complainant_phone' => '01712345678',
        ]);

        $letterResponse->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure(['formal_letter', 'title', 'recipient']);

        $formalLetter = $letterResponse->json('formal_letter');

        // Submit via AI endpoint
        $submitResponse = $this->postJson('/api/ai/submit-complaint', [
            'category_id' => 1,
            'division_id' => 5, // Barishal
            'district_id' => 43, // Barishal
            'title' => 'হাসপাতালে সেবা অবহেলা প্রতিকার প্রার্থনা',
            'description' => 'হাসপাতালে সেবা নিতে গিয়ে চরম অবহেলা ও দীর্ঘক্ষণ অপেক্ষার শিকার হতে হয়েছে।',
            'priority' => 'high',
            'is_anonymous' => 0,
            'complainant_name' => 'মোসাদ্দেক হোসেন',
            'complainant_phone' => '01712345678',
            'formal_letter' => $formalLetter,
            'remedy_requested' => 'জরুরি তদন্ত ও সমাধান',
            'user_consent' => 1,
        ]);

        $submitResponse->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'tracking_id',
                'complaint_id',
                'office_name',
                'receipt' => [
                    'tracking_id',
                    'office_name',
                    'track_url'
                ]
            ]);

        $trackingId = $submitResponse->json('tracking_id');
        $this->assertDatabaseHas('complaints', [
            'tracking_id' => $trackingId,
            'complainant_name' => 'মোসাদ্দেক হোসেন',
            'current_status' => 'submitted',
        ]);
    }

    /**
     * Test 5: Dynamic Cascading Geography & Organization APIs
     */
    public function test_cascading_geo_apis(): void
    {
        $division = Division::first();
        $this->assertNotNull($division);

        $districtsResponse = $this->getJson("/api/geo/districts/{$division->id}");
        $districtsResponse->assertStatus(200);

        $district = District::where('division_id', $division->id)->first();
        if ($district) {
            $upazilasResponse = $this->getJson("/api/geo/upazilas/{$district->id}");
            $upazilasResponse->assertStatus(200);
        }

        $officesResponse = $this->getJson('/api/geo/offices');
        $officesResponse->assertStatus(200);

        $category = ComplaintCategory::first();
        $problemTypesResponse = $this->getJson("/api/geo/problem-types/{$category->id}");
        $problemTypesResponse->assertStatus(200);
    }

    /**
     * Test 6: Complaint Tracking & Citizen Feedback Loop
     */
    public function test_complaint_tracking_and_feedback(): void
    {
        $complaint = Complaint::first();
        $this->assertNotNull($complaint);

        // View Tracking Page
        $trackResponse = $this->get("/track?id={$complaint->tracking_id}");
        $trackResponse->assertStatus(200);

        // Submit Feedback
        $feedbackResponse = $this->post("/track/{$complaint->tracking_id}/feedback", [
            'was_resolved' => 'yes',
            'satisfaction_rating' => 5,
            'comment' => 'দ্রুত প্রতিকার পাওয়ার জন্য ধন্যবাদ।',
            'is_reopen_requested' => 0,
        ]);

        $feedbackResponse->assertRedirect();
        $this->assertDatabaseHas('complaint_feedbacks', [
            'complaint_id' => $complaint->id,
            'was_resolved' => 'yes',
            'satisfaction_rating' => 5,
        ]);
    }

    /**
     * Test 7: Role Authorization Gates
     */
    public function test_role_authorization_and_middleware_isolation(): void
    {
        $citizen = User::where('role', 'citizen')->first();
        $officer = User::where('role', 'officer')->first();
        $admin = User::where('role', 'main_admin')->first();

        // Guest cannot access protected areas
        $this->get('/citizen')->assertRedirect('/login');
        $this->get('/officer')->assertRedirect('/login');
        $this->get('/admin')->assertRedirect('/login');

        // Citizen can access citizen area but forbidden from officer/admin
        $this->actingAs($citizen)->get('/citizen')->assertStatus(200);
        $this->actingAs($citizen)->get('/officer')->assertRedirect('/');
        $this->actingAs($citizen)->get('/admin')->assertRedirect('/');

        // Officer can access officer area but forbidden from admin
        $this->actingAs($officer)->get('/officer')->assertStatus(200);
        $this->actingAs($officer)->get('/admin')->assertRedirect('/');

        // Admin can access all management areas
        $this->actingAs($admin)->get('/admin')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/geography')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/organizations')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/officers')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/categories')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/rules')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/audit')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/documents')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/ai-eval')->assertStatus(200);
    }

    /**
     * Test 8: Officer Complaint Status Update and Notification Generation
     */
    public function test_officer_complaint_status_update(): void
    {
        $officer = User::where('role', 'officer')->first();
        $complaint = Complaint::first();

        $response = $this->actingAs($officer)->post("/officer/complaint/{$complaint->id}/status", [
            'status' => 'investigation_started',
            'remarks_bn' => 'সরেজমিন তদন্ত শুরু করা হয়েছে এবং প্রাথমিক প্রতিবেদন তলব করা হয়েছে।',
            'is_public_to_citizen' => 1,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('complaints', [
            'id' => $complaint->id,
            'current_status' => 'investigation_started',
        ]);

        $this->assertDatabaseHas('complaint_status_histories', [
            'complaint_id' => $complaint->id,
            'to_status' => 'investigation_started',
        ]);
    }

    /**
     * Test 9: Multi-step Complaint Submission via Web Form
     */
    public function test_multi_step_complaint_submission_form(): void
    {
        $category = ComplaintCategory::first();
        $office = Office::first();
        $division = Division::first();
        $district = District::where('division_id', $division->id)->first();

        $response = $this->post('/submit', [
            'division_id' => $division->id,
            'district_id' => $district->id,
            'category_id' => $category->id,
            'office_id' => $office->id,
            'title' => 'রাস্তায় খানাখন্দ সংস্কারের আবেদন',
            'description' => 'দীর্ঘদিন ধরে প্রধান সড়কে খানাখন্দের কারণে যান চলাচল মারাত্মক বিঘ্নিত হচ্ছে।',
            'priority' => 'high',
            'is_anonymous' => 0,
            'complainant_name' => 'আবুল কাশেম',
            'complainant_phone' => '01811223344',
            'is_person_unknown' => 1,
        ]);

        $response->assertRedirect();

        $complaint = Complaint::where('complainant_phone', '01811223344')->latest()->first();
        $this->assertNotNull($complaint);
        $this->assertEquals('submitted', $complaint->current_status);
        $this->assertNotNull($complaint->tracking_id);
        $this->assertNotNull($complaint->due_at);
    }

    /**
     * Test 10: Officer Internal Notes, Forwarding, and Resolution Pipeline
     */
    public function test_officer_internal_notes_and_resolution(): void
    {
        $officer = User::where('role', 'officer')->first();
        $complaint = Complaint::first();
        $anotherOfficer = OfficerProfile::where('id', '!=', $complaint->assigned_officer_id)->first();

        // 1. Add Internal Note
        $noteResponse = $this->actingAs($officer)->post("/officer/complaint/{$complaint->id}/internal-note", [
            'note' => 'তদন্ত দলের সাথে ফোনে যোগাযোগ হয়েছে, আগামীকাল সরেজমিনে পরিদর্শনে যাচ্ছেন।',
        ]);
        $noteResponse->assertRedirect();
        $this->assertDatabaseHas('complaint_internal_notes', [
            'complaint_id' => $complaint->id,
            'author_user_id' => $officer->id,
        ]);

        // 2. Submit Final Resolution
        $resolveResponse = $this->actingAs($officer)->post("/officer/complaint/{$complaint->id}/resolve", [
            'action_type' => 'inspection_completed',
            'resolution_summary' => 'সরেজমিন পরিদর্শন সম্পন্ন হয়েছে এবং তাৎক্ষণিক সংস্কার কার্যক্রম সম্পন্ন করা হয়েছে।',
            'close_complaint' => 1,
        ]);
        $resolveResponse->assertRedirect();

        $complaint->refresh();
        $this->assertEquals('resolved', $complaint->current_status);
        $this->assertNotNull($complaint->resolved_at);
    }

    /**
     * Test 11: Admin Operations (Geography, Posts, Problem Types, Review Queue)
     */
    public function test_admin_management_crud_operations(): void
    {
        $admin = User::where('role', 'main_admin')->first();

        // 1. Create a Post/Designation
        $postResponse = $this->actingAs($admin)->post('/admin/posts', [
            'name_bn' => 'সহকারী পরিচালক (মনিটরিং)',
            'name_en' => 'Assistant Director (Monitoring)',
            'service_type' => 'administration',
            'grade_level' => 9,
            'description' => 'জেলা ও বিভাগীয় পর্যায়ের অভিযোগ তদারকি',
            'is_active' => true,
        ]);
        $postResponse->assertRedirect();
        $this->assertDatabaseHas('posts', ['name_en' => 'Assistant Director (Monitoring)']);

        // 2. Create a Problem Type
        $category = ComplaintCategory::first();
        $ptResponse = $this->actingAs($admin)->post('/admin/problem-types', [
            'category_id' => $category->id,
            'title_bn' => 'জরুরি বিভাগের টিকিট পেতে বিলম্ব',
            'title_en' => 'Emergency ticket delay',
            'cluster_name_bn' => 'রোগী ভর্তি ও টিকিট সংক্রান্ত',
            'cluster_name_en' => 'Ticketing & Admission',
            'severity' => 'medium',
            'default_sla_days' => 3,
            'display_order' => 1,
            'status' => 'active',
        ]);
        $ptResponse->assertRedirect();
        $this->assertDatabaseHas('complaint_problem_types', ['title_bn' => 'জরুরি বিভাগের টিকিট পেতে বিলম্ব']);
    }

    /**
     * Test 12: Authentication Flow (Login, Invalid Credentials, Logout)
     */
    public function test_authentication_login_and_logout_flow(): void
    {
        // Invalid credentials rejection
        $failResponse = $this->post('/login/password', [
            'identifier' => 'admin@nagorik.gov.bd',
            'password' => 'wrongpassword',
        ]);
        $failResponse->assertSessionHasErrors();
        $this->assertGuest();

        // Valid Super Admin login
        $loginResponse = $this->post('/login/password', [
            'identifier' => 'admin@nagorik.gov.bd',
            'password' => 'password123',
        ]);
        $loginResponse->assertRedirect('/admin');
        $this->assertAuthenticated();

        // Logout
        $logoutResponse = $this->post('/logout');
        $logoutResponse->assertRedirect('/');
        $this->assertGuest();
    }
}

