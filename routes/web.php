<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\ComplaintSubmissionController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Citizen\CitizenDashboardController;
use App\Http\Controllers\Officer\OfficerComplaintController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\GeographyController;
use App\Http\Controllers\Admin\OrganizationController;
use App\Http\Controllers\Admin\OfficerController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\RoutingSlaController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\ProblemTypeController;
use App\Http\Controllers\AiAssistantController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [PublicController::class, 'home'])->name('home');
Route::get('/track', [PublicController::class, 'trackComplaint'])->name('complaint.track');
Route::post('/track/{trackingId}/feedback', [PublicController::class, 'submitFeedback'])->name('complaint.feedback');
Route::get('/how-it-works', [PublicController::class, 'howItWorks'])->name('how-it-works');
Route::get('/faq', [PublicController::class, 'faq'])->name('faq');
Route::get('/about', [PublicController::class, 'about'])->name('about');
Route::get('/categories', [PublicController::class, 'categories'])->name('categories');
Route::get('/ai-assistant', [PublicController::class, 'aiAssistant'])->name('ai-assistant');
Route::get('/privacy', [PublicController::class, 'privacy'])->name('privacy');
Route::get('/contact', [PublicController::class, 'contact'])->name('contact');

// Multi-step Complaint Submission
Route::get('/submit', [ComplaintSubmissionController::class, 'create'])->name('complaint.submit');
Route::post('/submit', [ComplaintSubmissionController::class, 'store'])->name('complaint.store');

// Dynamic Cascading Location & Organization APIs
Route::prefix('api/geo')->name('api.geo.')->group(function () {
    Route::get('/categories/{categoryId}/authority', [ComplaintSubmissionController::class, 'getCategoryAuthority'])->name('category-authority');
    Route::get('/districts/{divisionId}', [ComplaintSubmissionController::class, 'getDistricts'])->name('districts');
    Route::get('/upazilas/{districtId}', [ComplaintSubmissionController::class, 'getUpazilas'])->name('upazilas');
    Route::get('/local-governments/{upazilaId}', [ComplaintSubmissionController::class, 'getLocalGovernments'])->name('local-governments');
    Route::get('/local-governments-by-district/{districtId}', [ComplaintSubmissionController::class, 'getLocalGovernmentsByDistrict'])->name('local-governments-district');
    Route::get('/wards/{localGovernmentId}', [ComplaintSubmissionController::class, 'getWards'])->name('wards');
    Route::get('/areas/{wardId}', [ComplaintSubmissionController::class, 'getAreas'])->name('areas');
    Route::get('/offices', [ComplaintSubmissionController::class, 'getOffices'])->name('offices');
    Route::get('/offices-by-service', [ComplaintSubmissionController::class, 'getOfficesByService'])->name('offices-by-service');
    Route::get('/branches/{officeId}', [ComplaintSubmissionController::class, 'getBranches'])->name('branches');
    Route::get('/problem-types/{categoryId}', [ComplaintSubmissionController::class, 'getProblemTypes'])->name('problem-types');
    Route::get('/officers/{officeId}', [ComplaintSubmissionController::class, 'getOfficers'])->name('officers');
});

// AI Complaint Assistant Endpoints
Route::prefix('api/ai')->name('api.ai.')->group(function () {
    Route::get('/initial-data', [AiAssistantController::class, 'initialData'])->name('initial-data');
    Route::post('/analyze', [AiAssistantController::class, 'analyze'])->name('analyze');
    Route::post('/generate-formal-letter', [AiAssistantController::class, 'generateFormalLetter'])->name('generate-letter');
    Route::post('/submit-complaint', [AiAssistantController::class, 'submitComplaint'])->name('submit');
    Route::post('/verify-document', [AiAssistantController::class, 'verifyDocument'])->name('verify-document');
    Route::post('/track-status', [AiAssistantController::class, 'trackStatus'])->name('track-status');
});

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login/password', [AuthController::class, 'login'])->name('login.password');
Route::post('/auth/send-otp', [AuthController::class, 'sendOtp'])->name('auth.send-otp');
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp'])->name('auth.verify-otp');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

/*
|--------------------------------------------------------------------------
| Citizen Protected Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:citizen'])->prefix('citizen')->name('citizen.')->group(function () {
    Route::get('/', [CitizenDashboardController::class, 'index'])->name('dashboard');
    Route::get('/complaint/{trackingId}', [CitizenDashboardController::class, 'show'])->name('complaint.show');
    Route::get('/profile', [CitizenDashboardController::class, 'profile'])->name('profile');
    Route::post('/profile', [CitizenDashboardController::class, 'updateProfile'])->name('profile.update');
    Route::get('/notifications', [CitizenDashboardController::class, 'notifications'])->name('notifications');
    Route::post('/notifications/{id}/read', [CitizenDashboardController::class, 'markNotificationAsRead'])->name('notifications.read');
});

/*
|--------------------------------------------------------------------------
| Officer Protected Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:officer,area_officer,dept_admin'])->prefix('officer')->name('officer.')->group(function () {
    Route::get('/', [OfficerComplaintController::class, 'index'])->name('dashboard');
    Route::get('/complaint/{id}', [OfficerComplaintController::class, 'show'])->name('complaint.show');
    Route::post('/complaint/{id}/status', [OfficerComplaintController::class, 'updateStatus'])->name('complaint.status');
    Route::post('/complaint/{id}/internal-note', [OfficerComplaintController::class, 'addInternalNote'])->name('complaint.internal-note');
    Route::post('/complaint/{id}/forward', [OfficerComplaintController::class, 'forwardComplaint'])->name('complaint.forward');
    Route::post('/complaint/{id}/resolve', [OfficerComplaintController::class, 'submitResolution'])->name('complaint.resolve');
});

/*
|--------------------------------------------------------------------------
| Main Admin Protected Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:main_admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/map', [AdminDashboardController::class, 'map'])->name('map');
    Route::get('/search', [AdminDashboardController::class, 'globalSearch'])->name('search');

    // Geography Management (স্থান ও প্রশাসনিক কাঠামো)
    Route::get('/geography', [GeographyController::class, 'index'])->name('geography');
    Route::post('/geography/division', [GeographyController::class, 'storeDivision'])->name('geography.division');
    Route::post('/geography/district', [GeographyController::class, 'storeDistrict'])->name('geography.district');
    Route::post('/geography/upazila', [GeographyController::class, 'storeUpazila'])->name('geography.upazila');
    Route::post('/geography/local-government', [GeographyController::class, 'storeLocalGovernment'])->name('geography.local-government');
    Route::post('/geography/ward', [GeographyController::class, 'storeWard'])->name('geography.ward');
    Route::post('/geography/area', [GeographyController::class, 'storeArea'])->name('geography.area');
    Route::post('/geography/post-office', [GeographyController::class, 'storePostOffice'])->name('geography.post-office');
    Route::post('/geography/toggle/{type}/{id}', [GeographyController::class, 'toggleStatus'])->name('geography.toggle');

    // Organizations & Offices
    Route::get('/organizations', [OrganizationController::class, 'index'])->name('organizations');
    Route::post('/organizations/org', [OrganizationController::class, 'storeOrganization'])->name('organizations.org');
    Route::post('/organizations/office', [OrganizationController::class, 'storeOffice'])->name('organizations.office');
    Route::post('/organizations/toggle/{id}', [OrganizationController::class, 'toggleStatus'])->name('organizations.toggle');

    // Officers
    Route::get('/officers', [OfficerController::class, 'index'])->name('officers');
    Route::post('/officers', [OfficerController::class, 'store'])->name('officers.store');
    Route::post('/officers/{id}/create-login', [OfficerController::class, 'createLogin'])->name('officers.create-login');
    Route::post('/officers/{id}/transfer', [OfficerController::class, 'transfer'])->name('officers.transfer');

    // Categories & Custom Form Builder
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories');
    Route::post('/categories', [CategoryController::class, 'storeCategory'])->name('categories.store');
    Route::post('/categories/subcategory', [CategoryController::class, 'storeSubcategory'])->name('categories.subcategory');
    Route::post('/categories/custom-field', [CategoryController::class, 'storeCustomField'])->name('categories.custom-field');
    Route::post('/categories/{id}/toggle', [CategoryController::class, 'toggleCategoryStatus'])->name('categories.toggle');

    // Rules & SLA
    Route::get('/rules', [RoutingSlaController::class, 'index'])->name('rules');
    Route::post('/rules/routing', [RoutingSlaController::class, 'storeRoutingRule'])->name('rules.routing');
    Route::post('/rules/sla/{id}', [RoutingSlaController::class, 'updateSlaRule'])->name('rules.sla');

    // Posts / Designations (সরকারি পদবি ডিরেক্টরি)
    Route::get('/posts', [PostController::class, 'index'])->name('posts');
    Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
    Route::put('/posts/{post}', [PostController::class, 'update'])->name('posts.update');
    Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');

    // Complaint Problem Types (নির্দিষ্ট সমস্যা ক্যাটালগ)
    Route::get('/problem-types', [ProblemTypeController::class, 'index'])->name('problem-types');
    Route::post('/problem-types', [ProblemTypeController::class, 'store'])->name('problem-types.store');
    Route::put('/problem-types/{problemType}', [ProblemTypeController::class, 'update'])->name('problem-types.update');
    Route::delete('/problem-types/{problemType}', [ProblemTypeController::class, 'destroy'])->name('problem-types.destroy');

    // Audit Logs
    Route::get('/audit', [AuditLogController::class, 'index'])->name('audit');

    // Document Verification Queue (AI-Assisted Document Pipeline)
    Route::get('/documents', [AdminDashboardController::class, 'documentQueue'])->name('documents');
    Route::post('/documents/{attachment}/review', [AdminDashboardController::class, 'reviewDocument'])->name('documents.review');

    // AI Routing & Model Performance Evaluation (Human-in-the-loop Evaluation)
    Route::get('/ai-eval', [AdminDashboardController::class, 'aiEvaluation'])->name('ai-eval');
});
