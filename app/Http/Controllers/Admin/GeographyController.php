<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\District;
use App\Models\Upazila;
use App\Models\LocalGovernment;
use App\Models\Ward;
use App\Models\Area;
use App\Models\PostOffice;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GeographyController extends Controller
{
    /**
     * Dedicated Geography & Administrative Structure Management Center
     */
    public function index(Request $request)
    {
        $tab = $request->query('tab', 'divisions');

        $emptyPaginate = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 15);

        $divisions = $tab === 'divisions' ? Division::withCount(['districts', 'complaints'])->get() : [];
        $districts = $tab === 'districts' ? District::with(['division'])->withCount(['upazilas', 'complaints'])->paginate(15)->withQueryString() : $emptyPaginate;
        $upazilas = $tab === 'upazilas' ? Upazila::with(['district.division'])->withCount(['localGovernments', 'postOffices', 'complaints'])->paginate(15)->withQueryString() : $emptyPaginate;
        $localGovernments = ($tab === 'localGovs' || $tab === 'localGovernments') ? LocalGovernment::with(['upazila.district'])->withCount(['wards', 'complaints'])->paginate(15)->withQueryString() : $emptyPaginate;
        $wards = $tab === 'wards' ? Ward::with(['localGovernment.upazila'])->withCount(['areas', 'complaints'])->paginate(15)->withQueryString() : $emptyPaginate;
        $areas = $tab === 'areas' ? Area::with(['ward.localGovernment'])->withCount(['complaints'])->paginate(15)->withQueryString() : $emptyPaginate;
        $postOffices = $tab === 'postOffices' ? PostOffice::with(['upazila.district'])->paginate(15)->withQueryString() : $emptyPaginate;

        // Simple lookup lists for dropdowns in modals
        $divisionList = Division::where('status', 'active')->select('id', 'name_bn')->get();
        $districtList = District::where('status', 'active')->select('id', 'name_bn', 'division_id')->get();
        $upazilaList = Upazila::where('status', 'active')->select('id', 'name_bn', 'district_id')->get();
        $localGovList = LocalGovernment::where('status', 'active')->select('id', 'name_bn', 'upazila_id')->get();
        $wardList = Ward::where('status', 'active')->select('id', 'ward_number', 'name_bn', 'local_government_id')->take(100)->get();

        return Inertia::render('Admin/Geography/Index', [
            'currentTab' => $tab,
            'divisions' => $divisions,
            'districts' => $districts,
            'upazilas' => $upazilas,
            'localGovernments' => $localGovernments,
            'wards' => $wards,
            'areas' => $areas,
            'postOffices' => $postOffices,
            'lookups' => [
                'divisions' => $divisionList,
                'districts' => $districtList,
                'upazilas' => $upazilaList,
                'localGovernments' => $localGovList,
                'wards' => $wardList,
            ],
        ]);
    }

    // Store handlers
    public function storeDivision(Request $request)
    {
        $request->validate([
            'name_bn' => 'required|string|max:100',
            'name_en' => 'required|string|max:100',
            'code' => 'required|string|unique:divisions,code',
        ]);

        $division = Division::create($request->all());
        AuditLog::logEvent('division_created', $division, null, $division->toArray());

        return back()->with('success', 'নতুন বিভাগ সফলভাবে যোগ করা হয়েছে।');
    }

    public function storeDistrict(Request $request)
    {
        $request->validate([
            'division_id' => 'required|exists:divisions,id',
            'name_bn' => 'required|string|max:100',
            'name_en' => 'required|string|max:100',
            'code' => 'required|string|unique:districts,code',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
        ]);

        $district = District::create($request->all());
        AuditLog::logEvent('district_created', $district, null, $district->toArray());

        return back()->with('success', 'নতুন জেলা সফলভাবে যোগ করা হয়েছে।');
    }

    public function storeUpazila(Request $request)
    {
        $request->validate([
            'district_id' => 'required|exists:districts,id',
            'name_bn' => 'required|string|max:100',
            'name_en' => 'required|string|max:100',
        ]);

        $upazila = Upazila::create($request->all());
        AuditLog::logEvent('upazila_created', $upazila, null, $upazila->toArray());

        return back()->with('success', 'নতুন উপজেলা সফলভাবে যোগ করা হয়েছে।');
    }

    public function storeLocalGovernment(Request $request)
    {
        $request->validate([
            'upazila_id' => 'required|exists:upazilas,id',
            'name_bn' => 'required|string|max:100',
            'name_en' => 'required|string|max:100',
            'type' => 'required|in:city_corporation,pourashava,union_parishad',
        ]);

        $lg = LocalGovernment::create($request->all());
        AuditLog::logEvent('local_government_created', $lg, null, $lg->toArray());

        return back()->with('success', 'নতুন সিটি কর্পোরেশন/পৌরসভা/ইউনিয়ন সফলভাবে যোগ করা হয়েছে।');
    }

    public function storeWard(Request $request)
    {
        $request->validate([
            'local_government_id' => 'required|exists:local_governments,id',
            'ward_number' => 'required|string|max:10',
            'name_bn' => 'required|string|max:100',
            'name_en' => 'nullable|string|max:100',
        ]);

        // Scoped uniqueness check
        $exists = Ward::where('local_government_id', $request->local_government_id)
            ->where('ward_number', $request->ward_number)
            ->exists();

        if ($exists) {
            return back()->withErrors(['ward_number' => 'এই স্থানীয় সরকার প্রতিষ্ঠানে উক্ত ওয়ার্ড নম্বরটি ইতিমধ্যে বিদ্যমান রয়েছে।']);
        }

        $ward = Ward::create($request->all());
        AuditLog::logEvent('ward_created', $ward, null, $ward->toArray());

        return back()->with('success', 'নতুন ওয়ার্ড সফলভাবে তৈরি করা হয়েছে। এটি অবিলম্বে নাগরিক আবেদন ফর্মে প্রদর্শিত হবে।');
    }

    public function storeArea(Request $request)
    {
        $request->validate([
            'ward_id' => 'required|exists:wards,id',
            'name_bn' => 'required|string|max:100',
            'name_en' => 'nullable|string|max:100',
            'type' => 'required|in:village,mohalla,para,road',
        ]);

        $area = Area::create($request->all());
        AuditLog::logEvent('area_created', $area, null, $area->toArray());

        return back()->with('success', 'নতুন এলাকা/গ্রাম/মহল্লা সফলভাবে যোগ করা হয়েছে।');
    }

    public function storePostOffice(Request $request)
    {
        $request->validate([
            'upazila_id' => 'required|exists:upazilas,id',
            'name_bn' => 'required|string|max:100',
            'name_en' => 'required|string|max:100',
            'post_code' => 'required|string|max:10',
        ]);

        $po = PostOffice::create($request->all());
        AuditLog::logEvent('post_office_created', $po, null, $po->toArray());

        return back()->with('success', 'নতুন পোস্ট অফিস সফলভাবে যোগ করা হয়েছে।');
    }

    public function toggleStatus(Request $request, $type, $id)
    {
        $model = match ($type) {
            'division' => Division::findOrFail($id),
            'district' => District::findOrFail($id),
            'upazila' => Upazila::findOrFail($id),
            'local_government' => LocalGovernment::findOrFail($id),
            'ward' => Ward::findOrFail($id),
            'area' => Area::findOrFail($id),
            'post_office' => PostOffice::findOrFail($id),
            default => abort(404),
        };

        $newStatus = $model->status === 'active' ? 'inactive' : 'active';
        $model->update(['status' => $newStatus]);

        AuditLog::logEvent('geo_status_toggled', $model, null, ['new_status' => $newStatus]);

        return back()->with('success', 'অবস্থা সফলভাবে পরিবর্তন করা হয়েছে।');
    }
}
