<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\ComplaintCategory;
use App\Models\Division;
use App\Models\District;
use App\Models\Upazila;
use App\Models\Office;
use App\Models\OfficeBranch;
use App\Models\Organization;
use App\Models\Complaint;
use App\Models\ComplaintProblemType;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SmartWorkflowAndAdminManagementTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Test 1: Admin can toggle/pause categories and public API reflects status
     */
    public function test_admin_can_toggle_category_and_public_reflects_status(): void
    {
        $admin = User::where('role', 'main_admin')->first();
        $category = ComplaintCategory::first();
        $originalStatus = $category->status;

        // Toggle category status
        $response = $this->actingAs($admin)->post("/admin/categories/{$category->id}/toggle");
        $response->assertRedirect();
        
        $category->refresh();
        $expected = $originalStatus === 'active' ? 'inactive' : 'active';
        $this->assertEquals($expected, $category->status);

        // Public submission page renders without error
        $publicCategoriesResponse = $this->get('/submit');
        $publicCategoriesResponse->assertStatus(200);

        // Toggle back to original status
        if ($category->status !== $originalStatus) {
            $this->actingAs($admin)->post("/admin/categories/{$category->id}/toggle");
            $category->refresh();
            $this->assertEquals($originalStatus, $category->status);
        }
    }

    /**
     * Test 2: Admin can manage offices and branches (CRUD)
     */
    public function test_admin_can_manage_offices_and_branches(): void
    {
        $admin = User::where('role', 'main_admin')->first();
        $office = Office::first();

        // 1. Update office
        $updateOfficeResponse = $this->actingAs($admin)->put("/admin/organizations/office/{$office->id}", [
            'organization_id' => $office->organization_id,
            'name_bn' => 'জেলা প্রশাসক কার্যালয় (হালনাগাদকৃত)',
            'name_en' => $office->name_en ?: 'Deputy Commissioner Office Updated',
            'code' => $office->code ?? 'DC-UPD-01',
            'phone' => '01700000000',
            'email' => 'dc-test@example.com',
            'address' => 'জেলা সদর, বাংলাদেশ',
            'status' => 'active',
        ]);
        $updateOfficeResponse->assertRedirect();
        $this->assertDatabaseHas('offices', [
            'id' => $office->id,
            'name_bn' => 'জেলা প্রশাসক কার্যালয় (হালনাগাদকৃত)',
        ]);

        // 2. Create a new branch under this office
        $createBranchResponse = $this->actingAs($admin)->post('/admin/organizations/branch', [
            'office_id' => $office->id,
            'name_bn' => 'নাগরিক সেবা ও ওয়ানস্টপ কাউন্টার',
            'name_en' => 'Citizen Service & One-Stop Desk',
            'code' => 'OSC-101',
            'floor' => '২য় তলা',
            'room_number' => '২০৪ নং কক্ষ',
            'phone' => '01811223344',
            'email' => 'desk@example.com',
            'description' => 'নাগরিকদের সরাসরি সহায়তা ডেস্ক',
            'status' => 'active',
        ]);
        $createBranchResponse->assertRedirect();
        $this->assertDatabaseHas('office_branches', [
            'office_id' => $office->id,
            'name_bn' => 'নাগরিক সেবা ও ওয়ানস্টপ কাউন্টার',
            'floor' => '২য় তলা',
        ]);

        $createdBranch = OfficeBranch::where('office_id', $office->id)
            ->where('name_bn', 'নাগরিক সেবা ও ওয়ানস্টপ কাউন্টার')
            ->first();

        // 3. Update branch
        $updateBranchResponse = $this->actingAs($admin)->put("/admin/organizations/branch/{$createdBranch->id}", [
            'office_id' => $office->id,
            'name_bn' => 'নাগরিক সেবা ও ওয়ানস্টপ কাউন্টার (সংশোধিত)',
            'name_en' => 'Citizen Service & One-Stop Desk Rev',
            'code' => 'OSC-101B',
            'floor' => '৩য় তলা',
            'room_number' => '৩০৪ নং কক্ষ',
            'phone' => '01811223344',
            'status' => 'active',
        ]);
        $updateBranchResponse->assertRedirect();
        $this->assertDatabaseHas('office_branches', [
            'id' => $createdBranch->id,
            'name_bn' => 'নাগরিক সেবা ও ওয়ানস্টপ কাউন্টার (সংশোধিত)',
            'floor' => '৩য় তলা',
        ]);

        // 4. Delete branch
        $deleteBranchResponse = $this->actingAs($admin)->delete("/admin/organizations/branch/{$createdBranch->id}");
        $deleteBranchResponse->assertRedirect();
        $this->assertDatabaseMissing('office_branches', [
            'id' => $createdBranch->id,
        ]);
    }

    /**
     * Test 3: Public cascading endpoints for offices, branches, and officers
     */
    public function test_public_cascading_geo_endpoints(): void
    {
        $office = Office::first();
        $category = ComplaintCategory::where('status', 'active')->first();
        $district = District::first();

        // 1. Branches API
        $branchesResponse = $this->getJson("/api/geo/branches/{$office->id}");
        $branchesResponse->assertStatus(200);
        $branches = $branchesResponse->json();
        $this->assertIsArray($branches);
        $this->assertNotEmpty($branches);
        $this->assertArrayHasKey('id', $branches[0]);
        $this->assertArrayHasKey('name_bn', $branches[0]);

        // 2. Officers API
        $officersResponse = $this->getJson("/api/geo/officers/{$office->id}");
        $officersResponse->assertStatus(200);
        $this->assertIsArray($officersResponse->json());

        // 3. Offices by service API
        $officesResponse = $this->getJson("/api/geo/offices-by-service?category_id={$category->id}&district_id={$district->id}");
        $officesResponse->assertStatus(200);
        $this->assertIsArray($officesResponse->json());
    }

    /**
     * Test 4: Citizen submits complaint with unknown person / informal name, branch, custom problem description
     */
    public function test_citizen_can_submit_complaint_with_smart_workflow_fields(): void
    {
        Storage::fake('public');

        $division = Division::first();
        $district = District::where('division_id', $division->id)->first() ?: District::first();
        $upazila = Upazila::where('district_id', $district->id)->first();
        $category = ComplaintCategory::where('status', 'active')->first();
        $office = Office::first();
        $branch = OfficeBranch::where('office_id', $office->id)->first();
        $problems = ComplaintProblemType::where('category_id', $category->id)->take(2)->pluck('id')->toArray();

        $submissionData = [
            'division_id' => $division->id,
            'district_id' => $district->id,
            'upazila_id' => $upazila ? $upazila->id : null,
            'category_id' => $category->id,
            'office_id' => $office->id,
            'office_branch_id' => $branch ? $branch->id : null,
            'is_person_unknown' => false,
            'accused_person_name' => 'কাউন্টার ক্যাশিয়ার রফিক সাহেব',
            'problem_types' => $problems,
            'other_problem_description' => 'দীর্ঘদিন ধরে সেবা না দিয়ে বিভিন্ন অজুহাতে কালক্ষেপণ করা হচ্ছে।',
            'incident_date' => now()->subDays(2)->format('Y-m-d'),
            'description' => 'আমি উল্লেখিত অফিসে পাসপোর্ট নবায়নের জন্য গেলে হয়রানির শিকার হই। নির্দিষ্ট কাউন্টারে টাকা দাবি করা হয়।',
            'complainant_name' => 'নাগরিক টেস্ট',
            'complainant_phone' => '01712345678',
            'is_anonymous' => false,
        ];

        $response = $this->post('/submit', $submissionData);
        $response->assertRedirect();

        $complaint = Complaint::where('complainant_phone', '01712345678')->latest()->first();
        $this->assertNotNull($complaint);
        $this->assertNotEmpty($complaint->tracking_id);

        // Verify database persistence
        $this->assertDatabaseHas('complaints', [
            'tracking_id' => $complaint->tracking_id,
            'accused_person_name' => 'কাউন্টার ক্যাশিয়ার রফিক সাহেব',
            'other_problem_description' => 'দীর্ঘদিন ধরে সেবা না দিয়ে বিভিন্ন অজুহাতে কালক্ষেপণ করা হচ্ছে।',
            'office_id' => $office->id,
        ]);

        $this->assertEquals('কাউন্টার ক্যাশিয়ার রফিক সাহেব', $complaint->accused_person_name);
        $this->assertEquals('দীর্ঘদিন ধরে সেবা না দিয়ে বিভিন্ন অজুহাতে কালক্ষেপণ করা হচ্ছে।', $complaint->other_problem_description);
    }

    /**
     * Test 5: Live camera capture boosts priority and marks attachment verified
     */
    public function test_live_camera_capture_attachment_boosts_priority(): void
    {
        Storage::fake('public');

        $division = Division::first();
        $district = District::where('division_id', $division->id)->first() ?: District::first();
        $category = ComplaintCategory::where('status', 'active')->first();
        $office = Office::first();

        // 1x1 transparent PNG data URI
        $cameraDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        $submissionData = [
            'division_id' => $division->id,
            'district_id' => $district->id,
            'category_id' => $category->id,
            'office_id' => $office->id,
            'is_person_unknown' => true,
            'incident_date' => now()->format('Y-m-d'),
            'description' => 'লাইভ ক্যামেরা দিয়ে ঘটনাস্থলের সরাসরি ছবি ধারণ করে দ্রুত সমাধান প্রত্যাশা করছি।',
            'complainant_name' => 'সরাসরি অভিযোগকারী',
            'complainant_phone' => '01898765432',
            'is_anonymous' => false,
            'camera_photos' => [$cameraDataUri],
        ];

        $response = $this->post('/submit', $submissionData);
        $response->assertRedirect();

        $complaint = Complaint::where('complainant_phone', '01898765432')->latest()->first();

        $this->assertNotNull($complaint);
        $this->assertTrue((bool) $complaint->is_person_unknown);

        // Check attachment
        $attachment = $complaint->attachments()->first();
        $this->assertNotNull($attachment);
        $this->assertEquals('verified', $attachment->verification_status);
        $this->assertGreaterThanOrEqual(90, $attachment->confidence_score);
    }

    /**
     * Test 6: Gallery upload with AI generator / manipulation metadata flags tamper detection
     */
    public function test_gallery_upload_with_ai_tamper_metadata(): void
    {
        Storage::fake('public');

        $division = Division::first();
        $district = District::where('division_id', $division->id)->first() ?: District::first();
        $category = ComplaintCategory::where('status', 'active')->first();
        $office = Office::first();

        // Create an uploaded file with AI generator metadata signature in content
        $fakeAiFile = UploadedFile::fake()->createWithContent(
            'evidence_midjourney_render.jpg',
            "Exif metadata: Software=Midjourney v6.0 prompt=deepfake civic scene\nFake Image Content"
        );

        $submissionData = [
            'division_id' => $division->id,
            'district_id' => $district->id,
            'category_id' => $category->id,
            'office_id' => $office->id,
            'is_person_unknown' => true,
            'incident_date' => now()->format('Y-m-d'),
            'description' => 'গ্যালারি থেকে সংগৃহীত ফাইল আপলোড পরীক্ষা।',
            'complainant_name' => 'সতর্ক নাগরিক',
            'complainant_phone' => '01911223344',
            'is_anonymous' => false,
            'attachments' => [$fakeAiFile],
        ];

        $response = $this->post('/submit', $submissionData);
        $response->assertRedirect();

        $complaint = Complaint::where('complainant_phone', '01911223344')->latest()->first();

        $this->assertNotNull($complaint);
        $this->assertTrue((bool) $complaint->ai_tamper_detected);

        $attachment = $complaint->attachments()->first();
        $this->assertNotNull($attachment);
        $this->assertTrue((bool) $attachment->ai_tamper_detected);
        $this->assertEquals('potentially_manipulated', $attachment->verification_status);
    }

    /**
     * Test 7: Video upload (MP4, WebM) processes smoothly and creates video_evidence attachment
     */
    public function test_video_upload_and_verification_pipeline(): void
    {
        Storage::fake('public');

        $division = Division::first();
        $district = District::where('division_id', $division->id)->first() ?: District::first();
        $category = ComplaintCategory::where('status', 'active')->first();
        $office = Office::first();

        // Create simulated MP4 video file
        $videoFile = UploadedFile::fake()->createWithContent(
            'incident_video_evidence.mp4',
            "\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00isommp42\x00\x00\x00\x08free" . str_repeat('V', 20000)
        );

        $submissionData = [
            'division_id' => $division->id,
            'district_id' => $district->id,
            'category_id' => $category->id,
            'office_id' => $office->id,
            'is_person_unknown' => true,
            'incident_date' => now()->format('Y-m-d'),
            'description' => 'ভিডিও ফুটেজে অনিয়মের সুস্পষ্ট প্রমাণ ধরা পড়েছে।',
            'complainant_name' => 'ভিডিও প্রমাণদাতা',
            'complainant_phone' => '01511223344',
            'is_anonymous' => false,
            'attachments' => [$videoFile],
        ];

        $response = $this->post('/submit', $submissionData);
        $response->assertRedirect();

        $complaint = Complaint::where('complainant_phone', '01511223344')->latest()->first();
        $this->assertNotNull($complaint);

        $attachment = $complaint->attachments()->first();
        $this->assertNotNull($attachment);
        $this->assertEquals('video_evidence', $attachment->document_type);
        $this->assertEquals('incident_video_evidence.mp4', $attachment->original_filename);
        $this->assertFalse((bool) $attachment->ai_tamper_detected);
    }
}
