<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\OfficerProfile;
use App\Models\ComplaintCategory;
use App\Models\Division;
use App\Models\District;
use App\Models\Office;
use App\Models\Complaint;
use App\Models\CategoryOfficerAssignment;
use App\Models\AdminOfficerMessage;
use App\Models\Notification;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CategoryOfficerAssignmentAndChatTest extends TestCase
{
    /**
     * Test 1: Admin can create, toggle, and manage category-wise officer assignments
     */
    public function test_admin_can_assign_officer_to_category_and_region(): void
    {
        $admin = User::where('role', 'main_admin')->first();
        $category = ComplaintCategory::first();
        $division = Division::first();
        $district = District::where('division_id', $division->id)->first();
        $officer = OfficerProfile::first();

        // Admin assigns officer
        $response = $this->actingAs($admin)->post('/admin/officer-assignments', [
            'category_id' => $category->id,
            'division_id' => $division->id,
            'district_id' => $district->id,
            'officer_profile_id' => $officer->id,
            'notes' => 'বরিশাল জেলার স্বাস্থ্যসেবা সংক্রান্ত অভিযোগ ফোকাল পয়েন্ট',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('category_officer_assignments', [
            'category_id' => $category->id,
            'officer_profile_id' => $officer->id,
            'division_id' => $division->id,
            'district_id' => $district->id,
            'is_active' => 1,
        ]);

        $assignment = CategoryOfficerAssignment::latest()->first();

        // Admin toggles assignment
        $toggleResponse = $this->actingAs($admin)->post("/admin/officer-assignments/{$assignment->id}/toggle");
        $toggleResponse->assertRedirect();
        $assignment->refresh();
        $this->assertFalse($assignment->is_active);

        // Toggle back to active
        $this->actingAs($admin)->post("/admin/officer-assignments/{$assignment->id}/toggle");
        $assignment->refresh();
        $this->assertTrue($assignment->is_active);
    }

    /**
     * Test 2: Auto-routing routes complaint to designated category officer and sends dual notifications
     */
    public function test_auto_routing_and_dual_notifications_on_submission(): void
    {
        $admin = User::where('role', 'main_admin')->first();
        $category = ComplaintCategory::first();
        $division = Division::first();
        $district = District::where('division_id', $division->id)->first();
        $office = Office::first();
        $officerUser = User::where('role', 'officer')->first();
        $officer = OfficerProfile::where('user_id', $officerUser->id)->first() ?? OfficerProfile::first();

        // Ensure category assignment exists
        CategoryOfficerAssignment::create([
            'category_id' => $category->id,
            'division_id' => $division->id,
            'district_id' => $district->id,
            'officer_profile_id' => $officer->id,
            'user_id' => $officer->user_id,
            'is_active' => true,
        ]);

        $initialAdminNotifCount = Notification::where('user_id', $admin->id)->count();
        $initialOfficerNotifCount = $officer->user_id ? Notification::where('user_id', $officer->user_id)->count() : 0;

        // Citizen submits complaint in that category & region
        $response = $this->post('/submit', [
            'division_id' => $division->id,
            'district_id' => $district->id,
            'category_id' => $category->id,
            'office_id' => $office->id,
            'title' => 'হাসপাতালে জরুরি বিভাগে ডাক্তার অনুপস্থিত',
            'description' => 'জরুরি বিভাগে রোগীরা অপেক্ষা করছেন কিন্তু দায়িত্বে থাকা ডাক্তার নেই।',
            'priority' => 'urgent',
            'is_anonymous' => 0,
            'complainant_name' => 'মোসাদ্দেক হোসেন',
            'complainant_phone' => '01799887766',
            'is_person_unknown' => 1,
        ]);

        $response->assertRedirect();

        $complaint = Complaint::where('complainant_phone', '01799887766')->latest()->first();
        $this->assertNotNull($complaint);

        // Verification 1: Automatically assigned to the category designated officer
        $this->assertEquals($officer->id, $complaint->assigned_officer_id);

        // Verification 2: Complaint marked as unread for both
        $this->assertFalse($complaint->is_read_by_officer);
        $this->assertFalse($complaint->is_read_by_admin);

        // Verification 3: Dual notifications generated
        $this->assertGreaterThan($initialAdminNotifCount, Notification::where('user_id', $admin->id)->count());
        if ($officer->user_id) {
            $this->assertGreaterThan($initialOfficerNotifCount, Notification::where('user_id', $officer->user_id)->count());
        }
    }

    /**
     * Test 3: Strict Category & Role-Based Data Isolation
     */
    public function test_strict_category_isolation_between_officers(): void
    {
        $admin = User::where('role', 'main_admin')->first();
        $officerA = User::where('role', 'officer')->first();
        $officerB = User::where('role', 'officer')->where('id', '!=', $officerA->id)->first();

        if (!$officerB) {
            // Create a second officer for isolation test
            $officerB = User::create([
                'name' => 'ভূমি কর্মকর্তা রহিম',
                'email' => 'land.officer@test.gov.bd',
                'password' => bcrypt('password123'),
                'role' => 'officer',
                'is_active' => true,
            ]);
            OfficerProfile::create([
                'user_id' => $officerB->id,
                'name_bn' => 'রহিম উল্লাহ',
                'name_en' => 'Rahim Ullah',
                'designation_bn' => 'সহকারী কমিশনার (ভূমি)',
                'office_id' => Office::first()->id,
                'status' => 'active',
            ]);
        }

        $complaint = Complaint::first();
        // Explicitly assign complaint to officer A
        $profileA = $officerA->officerProfile ?? OfficerProfile::first();
        $complaint->update(['assigned_officer_id' => $profileA->id]);

        // Officer A (assigned) CAN view
        $this->actingAs($officerA)->get("/officer/complaint/{$complaint->id}")->assertStatus(200);

        // Super Admin CAN view ALL complaints
        $this->actingAs($admin)->get("/officer/complaint/{$complaint->id}")->assertStatus(200);

        // Officer B (unrelated/different category) CANNOT view and gets 403 Forbidden
        $this->actingAs($officerB)->get("/officer/complaint/{$complaint->id}")->assertStatus(403);
    }

    /**
     * Test 4: Automatic unread clearing when viewed and In-App Admin <-> Officer Chat
     */
    public function test_admin_officer_chat_and_read_clearing(): void
    {
        $admin = User::where('role', 'main_admin')->first();
        $officer = User::where('role', 'officer')->first();
        $profile = $officer->officerProfile ?? OfficerProfile::first();
        $complaint = Complaint::first();
        AdminOfficerMessage::where('complaint_id', $complaint->id)->delete();
        $complaint->update([
            'assigned_officer_id' => $profile->id,
            'is_read_by_officer' => false,
            'is_read_by_admin' => false,
        ]);

        // 1. Officer opens complaint -> automatically cleared to read
        $this->actingAs($officer)->get("/officer/complaint/{$complaint->id}")->assertStatus(200);
        $complaint->refresh();
        $this->assertTrue($complaint->is_read_by_officer);

        // 2. Admin sends message to officer regarding this complaint
        $msgResponse = $this->actingAs($admin)->postJson('/api/chat/messages', [
            'complaint_id' => $complaint->id,
            'message' => 'এই অভিযোগের বিষয়ে দ্রুত তদন্ত টিম পাঠিয়ে আজই প্রতিবেদন দিন।',
            'receiver_id' => $officer->id,
        ]);

        $msgResponse->assertStatus(200);
        $msgResponse->assertJson(['success' => true]);

        $this->assertDatabaseHas('admin_officer_messages', [
            'complaint_id' => $complaint->id,
            'sender_id' => $admin->id,
            'receiver_id' => $officer->id,
            'is_read' => 0,
        ]);

        // 3. Officer replies to admin
        $replyResponse = $this->actingAs($officer)->postJson('/api/chat/messages', [
            'complaint_id' => $complaint->id,
            'message' => 'স্যার, তদন্ত সম্পন্ন হয়েছে এবং প্রয়োজনীয় সংস্কার নির্দেশ দেওয়া হয়েছে।',
            'receiver_id' => $admin->id,
        ]);

        $replyResponse->assertStatus(200);
        $replyResponse->assertJson(['success' => true]);

        // 4. Officer fetches chat thread -> incoming admin message automatically marked as read
        $threadResponse = $this->actingAs($officer)->getJson("/api/chat/messages?complaint_id={$complaint->id}");
        $threadResponse->assertStatus(200);
        $threadResponse->assertJsonCount(2, 'messages');

        $this->assertDatabaseHas('admin_officer_messages', [
            'complaint_id' => $complaint->id,
            'sender_id' => $admin->id,
            'is_read' => 1,
        ]);
    }
}
