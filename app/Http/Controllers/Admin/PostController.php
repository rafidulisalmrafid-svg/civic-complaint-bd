<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $serviceType = $request->query('service_type');

        $query = Post::withCount('officers');

        if ($serviceType) {
            $query->where('service_type', $serviceType);
        }

        $posts = $query->orderBy('service_type')->orderBy('name_bn')->get();

        return Inertia::render('Admin/Posts/Index', [
            'posts' => $posts,
            'selectedServiceType' => $serviceType,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_bn' => 'required|string|max:150',
            'name_en' => 'required|string|max:150',
            'service_type' => 'required|string|max:50',
            'grade_level' => 'nullable|integer|min:1|max:20',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $post = Post::create($validated);

        AuditLog::logEvent('post_created', $post, null, $post->toArray());

        return back()->with('success', 'নতুন সরকারি পদবি/ডেসিগনেশন সফলভাবে তৈরি করা হয়েছে।');
    }

    public function update(Request $request, Post $post)
    {
        $validated = $request->validate([
            'name_bn' => 'required|string|max:150',
            'name_en' => 'required|string|max:150',
            'service_type' => 'required|string|max:50',
            'grade_level' => 'nullable|integer|min:1|max:20',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $oldData = $post->toArray();
        $post->update($validated);

        AuditLog::logEvent('post_updated', $post, $oldData, $post->toArray());

        return back()->with('success', 'পদবির তথ্য সফলভাবে হালনাগাদ করা হয়েছে।');
    }

    public function destroy(Post $post)
    {
        if ($post->officers()->count() > 0) {
            return back()->with('error', 'এই পদবিটিতে কর্মকর্তা সংযুক্ত থাকায় এটি মুছে ফেলা যাবে না।');
        }

        $post->delete();

        return back()->with('success', 'পদবিটি সফলভাবে মুছে ফেলা হয়েছে।');
    }
}
