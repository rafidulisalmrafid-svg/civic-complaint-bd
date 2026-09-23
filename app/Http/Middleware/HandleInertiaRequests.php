<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'phone' => $user->phone,
                    'email' => $user->email,
                    'role' => $user->role,
                    'avatar' => $user->avatar,
                    'officer_profile' => $user->officerProfile ? [
                        'id' => $user->officerProfile->id,
                        'designation_bn' => $user->officerProfile->designation_bn,
                        'organization' => $user->officerProfile->organization?->name_bn,
                        'office' => $user->officerProfile->office?->name_bn,
                        'district' => $user->officerProfile->district?->name_bn,
                        'upazila' => $user->officerProfile->upazila?->name_bn,
                    ] : null,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
                'submittedComplaint' => fn () => $request->session()->get('submittedComplaint'),
            ],
            'emergencyNumbers' => [
                ['name' => 'জাতীয় জরুরি সেবা', 'number' => '999', 'badge' => '২৪/৭'],
                ['name' => 'সরকারি তথ্য ও সেবা', 'number' => '333', 'badge' => 'টোল ফ্রি'],
                ['name' => 'নারী ও শিশু নির্যাতন প্রতিরোধ', 'number' => '109', 'badge' => 'সহায়তা'],
                ['name' => 'দুদক অভিযোগ কেন্দ্র', 'number' => '106', 'badge' => 'দুর্নীতি দমন'],
            ],
        ]);
    }
}
