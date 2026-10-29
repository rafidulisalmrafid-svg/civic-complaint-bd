<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ComplaintCategory;
use App\Models\ComplaintSubcategory;
use App\Models\CustomField;
use App\Models\Organization;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = ComplaintCategory::with(['subcategories', 'customFields', 'defaultOrganization'])
            ->withCount('complaints')
            ->orderBy('display_order')
            ->get();

        $organizations = Organization::where('status', 'active')->select('id', 'name_bn')->get();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
            'organizations' => $organizations,
        ]);
    }

    public function storeCategory(Request $request)
    {
        $request->validate([
            'name_bn' => 'required|string|max:150',
            'name_en' => 'required|string|max:150',
            'default_priority' => 'required|in:low,medium,high,urgent',
            'default_sla_days' => 'required|integer|min:1|max:90',
            'is_sensitive' => 'nullable|boolean',
            'default_organization_id' => 'nullable|exists:organizations,id',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
        ]);

        $slug = Str::slug($request->name_en);
        $cat = ComplaintCategory::create(array_merge(
            $request->all(),
            ['slug' => $slug, 'status' => 'active']
        ));

        AuditLog::logEvent('category_created', $cat, null, $cat->toArray());

        return back()->with('success', 'নতুন অভিযোগের ধরন (ক্যাটাগরি) সফলভাবে যুক্ত হয়েছে।');
    }

    public function storeSubcategory(Request $request)
    {
        $request->validate([
            'complaint_category_id' => 'required|exists:complaint_categories,id',
            'name_bn' => 'required|string|max:150',
            'name_en' => 'required|string|max:150',
            'description' => 'nullable|string',
            'default_organization_id' => 'nullable|exists:organizations,id',
        ]);

        $sub = ComplaintSubcategory::create($request->all());
        AuditLog::logEvent('subcategory_created', $sub, null, $sub->toArray());

        return back()->with('success', 'নতুন সাব-ক্যাটাগরি যুক্ত হয়েছে।');
    }

    /**
     * Dynamic Form Builder: Add Custom Field to Category
     */
    public function storeCustomField(Request $request)
    {
        $request->validate([
            'complaint_category_id' => 'nullable|exists:complaint_categories,id',
            'label_bn' => 'required|string|max:150',
            'label_en' => 'required|string|max:150',
            'field_type' => 'required|in:text,textarea,number,date,dropdown,radio,checkbox,file',
            'options' => 'nullable|string', // Comma-separated options for dropdown/radio
            'placeholder_bn' => 'nullable|string',
            'is_required' => 'nullable|boolean',
        ]);

        $fieldName = Str::slug($request->label_en, '_');
        $optionsArray = null;
        if ($request->filled('options')) {
            $optionsArray = array_map('trim', explode(',', $request->options));
        }

        $field = CustomField::create([
            'complaint_category_id' => $request->complaint_category_id,
            'field_name' => $fieldName,
            'label_bn' => $request->label_bn,
            'label_en' => $request->label_en,
            'field_type' => $request->field_type,
            'options_json' => $optionsArray,
            'placeholder_bn' => $request->placeholder_bn,
            'is_required' => $request->boolean('is_required'),
            'status' => 'active',
        ]);

        AuditLog::logEvent('custom_field_created', $field, null, $field->toArray());

        return back()->with('success', 'কাস্টম ফর্ম ফিল্ড সফলভাবে তৈরি হয়েছে। নাগরিক ফর্মে এটি তাৎক্ষণিকভাবে কার্যকর হবে।');
    }

    public function toggleCategoryStatus($id)
    {
        $cat = ComplaintCategory::findOrFail($id);
        $newStatus = $cat->status === 'active' ? 'inactive' : 'active';
        $cat->update(['status' => $newStatus]);

        \Illuminate\Support\Facades\Cache::forget('submission_form_categories');
        \Illuminate\Support\Facades\Cache::forget('home_categories');

        AuditLog::logEvent('category_status_toggled', $cat, null, ['status' => $newStatus]);

        $statusMsg = $newStatus === 'active' ? 'সক্রিয় (অন)' : 'সাময়িক নিষ্ক্রিয় (অফ)';
        return back()->with('success', "ক্যাটাগরি '{$cat->name_bn}' সফলভাবে {$statusMsg} করা হয়েছে।");
    }
}
