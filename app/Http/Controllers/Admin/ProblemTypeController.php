<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ComplaintCategory;
use App\Models\ComplaintProblemType;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProblemTypeController extends Controller
{
    public function index(Request $request)
    {
        $categoryId = $request->query('category_id');

        $categories = ComplaintCategory::select('id', 'name_bn', 'name_en')->orderBy('name_bn')->get();

        $query = ComplaintProblemType::with('category');

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        $problemTypes = $query->orderBy('category_id')
            ->orderBy('cluster_name_bn')
            ->orderBy('display_order')
            ->get();

        return Inertia::render('Admin/ProblemTypes/Index', [
            'problemTypes' => $problemTypes,
            'categories' => $categories,
            'selectedCategoryId' => $categoryId ? (int)$categoryId : null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'complaint_category_id' => 'nullable|exists:complaint_categories,id',
            'category_id' => 'nullable|exists:complaint_categories,id',
            'issue_group' => 'nullable|string|max:100',
            'cluster_name_bn' => 'nullable|string|max:100',
            'name_bn' => 'nullable|string|max:200',
            'title_bn' => 'nullable|string|max:200',
            'name_en' => 'nullable|string|max:200',
            'title_en' => 'nullable|string|max:200',
            'severity_level' => 'nullable|in:low,medium,high,critical,urgent',
            'severity' => 'nullable|in:low,medium,high,critical,urgent',
            'display_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'status' => 'nullable|string',
        ]);

        $catId = $request->input('category_id') ?? $request->input('complaint_category_id');
        $titleBn = $request->input('title_bn') ?? $request->input('name_bn');
        $titleEn = $request->input('title_en') ?? $request->input('name_en');
        $clusterBn = $request->input('cluster_name_bn') ?? $request->input('issue_group', 'general');
        $severity = $request->input('severity') ?? $request->input('severity_level', 'medium');
        $isActive = $request->has('is_active') ? (bool)$request->input('is_active') : true;

        if (!$catId || !$titleBn) {
            return back()->withErrors(['title_bn' => 'ক্যাটাগরি এবং সমস্যার নাম আবশ্যক।']);
        }

        $item = ComplaintProblemType::create([
            'category_id' => $catId,
            'cluster_name_bn' => $clusterBn,
            'cluster_name_en' => ucfirst((string)$clusterBn),
            'title_bn' => $titleBn,
            'title_en' => $titleEn,
            'severity' => $severity,
            'default_sla_days' => 7,
            'display_order' => (int)$request->input('display_order', 1),
            'status' => $isActive ? 'active' : 'inactive',
        ]);

        AuditLog::logEvent('problem_type_created', $item, null, $item->toArray());

        return back()->with('success', 'নতুন নির্দিষ্ট সমস্যা ধরন সফলভাবে যুক্ত হয়েছে।');
    }

    public function update(Request $request, ComplaintProblemType $problemType)
    {
        $request->validate([
            'complaint_category_id' => 'nullable|exists:complaint_categories,id',
            'category_id' => 'nullable|exists:complaint_categories,id',
            'issue_group' => 'nullable|string|max:100',
            'cluster_name_bn' => 'nullable|string|max:100',
            'name_bn' => 'nullable|string|max:200',
            'title_bn' => 'nullable|string|max:200',
            'name_en' => 'nullable|string|max:200',
            'title_en' => 'nullable|string|max:200',
            'severity_level' => 'nullable|in:low,medium,high,critical,urgent',
            'severity' => 'nullable|in:low,medium,high,critical,urgent',
            'display_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'status' => 'nullable|string',
        ]);

        $catId = $request->input('category_id') ?? $request->input('complaint_category_id', $problemType->category_id);
        $titleBn = $request->input('title_bn') ?? $request->input('name_bn', $problemType->title_bn);
        $titleEn = $request->input('title_en') ?? $request->input('name_en', $problemType->title_en);
        $clusterBn = $request->input('cluster_name_bn') ?? $request->input('issue_group', $problemType->cluster_name_bn);
        $severity = $request->input('severity') ?? $request->input('severity_level', $problemType->severity);
        $status = $request->has('is_active') ? ($request->input('is_active') ? 'active' : 'inactive') : $problemType->status;

        $old = $problemType->toArray();
        $problemType->update([
            'category_id' => $catId,
            'cluster_name_bn' => $clusterBn,
            'cluster_name_en' => ucfirst((string)$clusterBn),
            'title_bn' => $titleBn,
            'title_en' => $titleEn,
            'severity' => $severity,
            'display_order' => (int)$request->input('display_order', $problemType->display_order),
            'status' => $status,
        ]);

        AuditLog::logEvent('problem_type_updated', $problemType, $old, $problemType->toArray());

        return back()->with('success', 'সমস্যা ধরনের তথ্য সফলভাবে হালনাগাদ করা হয়েছে।');
    }

    public function destroy(ComplaintProblemType $problemType)
    {
        $problemType->delete();

        return back()->with('success', 'সমস্যা ধরনটি সফলভাবে মুছে ফেলা হয়েছে।');
    }
}
