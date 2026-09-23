<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RoutingRule;
use App\Models\SlaRule;
use App\Models\EscalationRule;
use App\Models\ComplaintCategory;
use App\Models\District;
use App\Models\Organization;
use App\Models\Office;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoutingSlaController extends Controller
{
    public function index()
    {
        $routingRules = RoutingRule::with(['category', 'subcategory', 'district', 'targetOrganization', 'targetOffice'])->get();
        $slaRules = SlaRule::with('category')->get();
        $escalationRules = EscalationRule::all();

        $categories = ComplaintCategory::where('status', 'active')->select('id', 'name_bn')->get();
        $districts = District::where('status', 'active')->select('id', 'name_bn')->get();
        $organizations = Organization::where('status', 'active')->select('id', 'name_bn')->get();
        $offices = Office::where('status', 'active')->select('id', 'name_bn', 'organization_id')->get();

        return Inertia::render('Admin/Rules/Index', [
            'routingRules' => $routingRules,
            'slaRules' => $slaRules,
            'escalationRules' => $escalationRules,
            'categories' => $categories,
            'districts' => $districts,
            'organizations' => $organizations,
            'offices' => $offices,
        ]);
    }

    public function storeRoutingRule(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:200',
            'category_id' => 'nullable|exists:complaint_categories,id',
            'district_id' => 'nullable|exists:districts,id',
            'target_organization_id' => 'required|exists:organizations,id',
            'target_office_id' => 'nullable|exists:offices,id',
        ]);

        $rule = RoutingRule::create(array_merge($request->all(), ['is_active' => true]));
        AuditLog::logEvent('routing_rule_created', $rule, null, $rule->toArray());

        return back()->with('success', 'নতুন রাউটিং রুল সফলভাবে তৈরি হয়েছে।');
    }

    public function updateSlaRule(Request $request, $id)
    {
        $request->validate([
            'review_sla_hours' => 'required|integer|min:1',
            'investigation_sla_hours' => 'required|integer|min:1',
            'resolution_sla_hours' => 'required|integer|min:1',
        ]);

        $rule = SlaRule::findOrFail($id);
        $old = $rule->toArray();
        $rule->update($request->only(['review_sla_hours', 'investigation_sla_hours', 'resolution_sla_hours']));
        AuditLog::logEvent('sla_rule_updated', $rule, $old, $rule->toArray());

        return back()->with('success', 'এসএলএ সময়সীমা সফলভাবে আপডেট করা হয়েছে।');
    }
}
