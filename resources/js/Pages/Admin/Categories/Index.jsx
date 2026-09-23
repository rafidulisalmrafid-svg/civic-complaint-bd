import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FolderTree, Plus, Layers, Settings, Eye, Trash2, Edit3,
    CheckCircle2, Clock, ShieldAlert, Sparkles, PlusCircle, FormInput
} from 'lucide-react';

export default function CategoriesIndex({ categories = [], organizations = [] }) {
    const [selectedCategory, setSelectedCategory] = useState(categories[0] || null);
    const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
    const [showCreateSubcategoryModal, setShowCreateSubcategoryModal] = useState(false);
    const [showFieldBuilderModal, setShowFieldBuilderModal] = useState(false);

    // Create Category Form
    const categoryForm = useForm({
        name: '',
        name_bn: '',
        code: '',
        description: '',
        default_organization_id: '',
        default_sla_hours: 72,
        default_priority: 'medium',
        is_active: true,
        icon: 'HelpCircle'
    });

    // Create Subcategory Form
    const subcategoryForm = useForm({
        category_id: selectedCategory?.id || '',
        name: '',
        name_bn: '',
        code: '',
        description: '',
        default_sla_hours: 48,
        default_priority: 'medium',
        is_active: true
    });

    // Field Builder Form
    const fieldForm = useForm({
        category_id: selectedCategory?.id || '',
        field_name: '',
        label_en: '',
        label_bn: '',
        field_type: 'text',
        options: '',
        placeholder_bn: '',
        help_text_bn: '',
        is_required: false,
        validation_rules: 'nullable',
        sort_order: (selectedCategory?.custom_fields?.length || 0) + 1
    });

    const handleCreateCategory = (e) => {
        e.preventDefault();
        categoryForm.post('/admin/categories', {
            onSuccess: () => {
                setShowCreateCategoryModal(false);
                categoryForm.reset();
            }
        });
    };

    const handleCreateSubcategory = (e) => {
        e.preventDefault();
        subcategoryForm.setData('category_id', selectedCategory?.id);
        subcategoryForm.post('/admin/categories/subcategory', {
            onSuccess: () => {
                setShowCreateSubcategoryModal(false);
                subcategoryForm.reset();
            }
        });
    };

    const handleCreateField = (e) => {
        e.preventDefault();
        fieldForm.setData('category_id', selectedCategory?.id);
        fieldForm.post('/admin/categories/custom-field', {
            onSuccess: () => {
                setShowFieldBuilderModal(false);
                fieldForm.reset();
            }
        });
    };

    return (
        <AdminLayout title="ক্যাটাগরি ও ডায়নামিক ফর্ম ফিল্ড">
            <Head title="অভিযোগের ক্যাটাগরি ও ফিল্ড বিল্ডার - নাগরিক অভিযোগ" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                            <FolderTree className="w-7 h-7 text-emerald-600" />
                            অভিযোগ ক্যাটাগরি ও ডায়নামিক ফর্ম কনফিগারেশন
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            অভিযোগের শ্রেণিবিভাগ, সাব-ক্যাটাগরি এবং নির্দিষ্ট ক্যাটাগরির জন্য কাস্টম ফর্ম ফিল্ড বিল্ডার
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreateCategoryModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
                    >
                        <Plus className="w-4 h-4" />
                        নতুন প্রধান ক্যাটাগরি
                    </button>
                </div>

                {/* 2-Column Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Category List */}
                    <div className="lg:col-span-4 space-y-3">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center justify-between">
                                <span>ক্যাটাগরি তালিকা ({categories.length})</span>
                                <span className="text-xs text-slate-400 font-normal">ডিফল্ট SLA</span>
                            </h3>

                            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                                            selectedCategory?.id === cat.id
                                                ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500/20'
                                                : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div>
                                            <div className={`font-semibold text-sm ${selectedCategory?.id === cat.id ? 'text-emerald-900' : 'text-slate-800'}`}>
                                                {cat.name_bn || cat.name}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                                <span>কোড: {cat.code}</span>
                                                <span>•</span>
                                                <span>{cat.subcategories?.length || 0} টি সাব-ক্যাটাগরি</span>
                                            </div>
                                        </div>

                                        <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-white text-slate-600 border border-slate-200">
                                            {cat.default_sla_hours}h
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Selected Category Details, Subcategories & Dynamic Field Builder */}
                    <div className="lg:col-span-8 space-y-6">
                        {selectedCategory ? (
                            <>
                                {/* Category Header Card */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-xl font-bold text-slate-900">
                                                    {selectedCategory.name_bn}
                                                </h2>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                                    {selectedCategory.name}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {selectedCategory.description || 'কোন বিবরণ যোগ করা হয়নি'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                SLA: {selectedCategory.default_sla_hours} ঘণ্টা
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                অগ্রাধিকার: {selectedCategory.default_priority}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Default Organization */}
                                    <div className="mt-4 text-xs text-slate-600 flex items-center gap-2">
                                        <span className="font-semibold text-slate-700">প্রাথমিক দায়িত্বপ্রাপ্ত অধিদপ্তর:</span>
                                        <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                                            {selectedCategory.default_organization?.name_bn || 'কোন নির্দিষ্ট অধিদপ্তর নেই'}
                                        </span>
                                    </div>
                                </div>

                                {/* Subcategories Section */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                            <Layers className="w-5 h-5 text-emerald-600" />
                                            সাব-ক্যাটাগরি সমূহ ({selectedCategory.subcategories?.length || 0})
                                        </h3>

                                        <button
                                            onClick={() => setShowCreateSubcategoryModal(true)}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            সাব-ক্যাটাগরি যোগ করুন
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedCategory.subcategories?.map(sub => (
                                            <div key={sub.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between">
                                                <div>
                                                    <div className="font-semibold text-sm text-slate-900">{sub.name_bn || sub.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono mt-0.5">কোড: {sub.code}</div>
                                                </div>
                                                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                    {sub.default_sla_hours}h
                                                </span>
                                            </div>
                                        ))}

                                        {(!selectedCategory.subcategories || selectedCategory.subcategories.length === 0) && (
                                            <div className="col-span-2 text-center py-6 text-sm text-slate-400">
                                                কোন সাব-ক্যাটাগরি তৈরি করা হয়নি
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Dynamic Form Builder (Custom Fields) */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                                <FormInput className="w-5 h-5 text-emerald-600" />
                                                কাস্টম ফিল্ড বিল্ডার (Dynamic Form Fields)
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                এই ক্যাটাগরির অভিযোগ জানানোর সময় নাগরিকের কাছ থেকে অতিরিক্ত তথ্য সংগ্রহের ইনপুট ফিল্ড
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => setShowFieldBuilderModal(true)}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-sm transition"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            নতুন ফিল্ড যোগ করুন
                                        </button>
                                    </div>

                                    {/* Existing Custom Fields */}
                                    <div className="space-y-3">
                                        {selectedCategory.custom_fields?.map((field, idx) => (
                                            <div key={field.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                                                        {idx + 1}
                                                    </span>
                                                    <div>
                                                        <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                                                            {field.label_bn}
                                                            {field.is_required && (
                                                                <span className="text-xs font-bold text-red-500">* আবশ্যক</span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                                                            <span>field: {field.field_name}</span>
                                                            <span>•</span>
                                                            <span className="capitalize text-emerald-700 font-semibold">{field.field_type}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {field.options && (
                                                        <span className="text-xs text-slate-400">
                                                            {Array.isArray(field.options) ? field.options.length : 'Multiple'} অপশন
                                                        </span>
                                                    )}
                                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                                        ক্রম: {field.sort_order}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {(!selectedCategory.custom_fields || selectedCategory.custom_fields.length === 0) && (
                                            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                                                <p className="text-sm font-medium text-slate-600">কোন কাস্টম ফিল্ড নির্ধারিত নেই</p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    এই ক্যাটাগরির জন্য অতিরিক্ত তথ্য (যেমনঃ মিটারের ছবি, পানির লিক হওয়ার সময় ইত্যাদি) চাইতে ফিল্ড যুক্ত করুন
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
                                বাম পাশের তালিকা থেকে একটি ক্যাটাগরি নির্বাচন করুন
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Category Modal */}
                {showCreateCategoryModal && (
                    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FolderTree className="w-5 h-5 text-emerald-600" />
                                নতুন ক্যাটাগরি তৈরি
                            </h3>

                            <form onSubmit={handleCreateCategory} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">ক্যাটাগরির নাম (বাংলা) *</label>
                                        <input
                                            type="text"
                                            required
                                            value={categoryForm.data.name_bn}
                                            onChange={(e) => categoryForm.setData('name_bn', e.target.value)}
                                            placeholder="উদাঃ সড়ক ও ফুটপাত"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Name (English) *</label>
                                        <input
                                            type="text"
                                            required
                                            value={categoryForm.data.name}
                                            onChange={(e) => categoryForm.setData('name', e.target.value)}
                                            placeholder="Roads & Footpaths"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">ইউনিক কোড *</label>
                                        <input
                                            type="text"
                                            required
                                            value={categoryForm.data.code}
                                            onChange={(e) => categoryForm.setData('code', e.target.value.toUpperCase())}
                                            placeholder="ROAD"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">ডিফল্ট SLA (ঘণ্টা)</label>
                                        <input
                                            type="number"
                                            value={categoryForm.data.default_sla_hours}
                                            onChange={(e) => categoryForm.setData('default_sla_hours', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">দায়িত্বপ্রাপ্ত প্রাথমিক দপ্তর</label>
                                    <select
                                        value={categoryForm.data.default_organization_id}
                                        onChange={(e) => categoryForm.setData('default_organization_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    >
                                        <option value="">নির্বাচন করুন (ঐচ্ছিক)</option>
                                        {organizations.map(org => (
                                            <option key={org.id} value={org.id}>{org.name_bn || org.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">সংক্ষিপ্ত বিবরণ</label>
                                    <textarea
                                        rows="2"
                                        value={categoryForm.data.description}
                                        onChange={(e) => categoryForm.setData('description', e.target.value)}
                                        placeholder="এই ক্যাটাগরির আওতায় কি ধরণের অভিযোগ পড়বে..."
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateCategoryModal(false)}
                                        className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-xl transition"
                                    >
                                        বাতিল
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={categoryForm.processing}
                                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
                                    >
                                        ক্যাটাগরি তৈরি করুন
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Create Subcategory Modal */}
                {showCreateSubcategoryModal && (
                    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-emerald-600" />
                                নতুন সাব-ক্যাটাগরি যোগ
                            </h3>
                            <p className="text-xs text-slate-500 mb-4">
                                মূল ক্যাটাগরি: <span className="font-semibold text-slate-800">{selectedCategory?.name_bn}</span>
                            </p>

                            <form onSubmit={handleCreateSubcategory} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">সাব-ক্যাটাগরির নাম (বাংলা) *</label>
                                    <input
                                        type="text"
                                        required
                                        value={subcategoryForm.data.name_bn}
                                        onChange={(e) => subcategoryForm.setData('name_bn', e.target.value)}
                                        placeholder="উদাঃ ম্যানহোলের ঢাকনা ভাঙা"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Name (English) *</label>
                                    <input
                                        type="text"
                                        required
                                        value={subcategoryForm.data.name}
                                        onChange={(e) => subcategoryForm.setData('name', e.target.value)}
                                        placeholder="Broken Manhole Cover"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">সাব-কোড *</label>
                                        <input
                                            type="text"
                                            required
                                            value={subcategoryForm.data.code}
                                            onChange={(e) => subcategoryForm.setData('code', e.target.value.toUpperCase())}
                                            placeholder="MANHOLE"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">SLA (ঘণ্টা)</label>
                                        <input
                                            type="number"
                                            value={subcategoryForm.data.default_sla_hours}
                                            onChange={(e) => subcategoryForm.setData('default_sla_hours', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateSubcategoryModal(false)}
                                        className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-xl transition"
                                    >
                                        বাতিল
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={subcategoryForm.processing}
                                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
                                    >
                                        সংরক্ষণ করুন
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Dynamic Field Builder Modal */}
                {showFieldBuilderModal && (
                    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <PlusCircle className="w-5 h-5 text-emerald-600" />
                                ডায়নামিক ফর্ম ফিল্ড যুক্ত করুন
                            </h3>
                            <p className="text-xs text-slate-500 mb-4">
                                ক্যাটাগরি: <span className="font-semibold text-slate-800">{selectedCategory?.name_bn}</span>
                            </p>

                            <form onSubmit={handleCreateField} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">ফিল্ডের লেবেল (বাংলা) *</label>
                                        <input
                                            type="text"
                                            required
                                            value={fieldForm.data.label_bn}
                                            onChange={(e) => fieldForm.setData('label_bn', e.target.value)}
                                            placeholder="উদাঃ মিটার নম্বর"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Field Label (EN)</label>
                                        <input
                                            type="text"
                                            value={fieldForm.data.label_en}
                                            onChange={(e) => fieldForm.setData('label_en', e.target.value)}
                                            placeholder="Meter Number"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">সিস্টেম ফিল্ড কী *</label>
                                        <input
                                            type="text"
                                            required
                                            value={fieldForm.data.field_name}
                                            onChange={(e) => fieldForm.setData('field_name', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                            placeholder="meter_number"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">ফিল্ডের ধরণ *</label>
                                        <select
                                            value={fieldForm.data.field_type}
                                            onChange={(e) => fieldForm.setData('field_type', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                                        >
                                            <option value="text">টেক্সট ইনপুট (Text)</option>
                                            <option value="number">সংখ্যা (Number)</option>
                                            <option value="textarea">বড় বিবরণ (Textarea)</option>
                                            <option value="select">ড্রপডাউন নির্বাচন (Select)</option>
                                            <option value="date">তারিখ (Date)</option>
                                            <option value="file">ফাইল / ছবি আপলোড (File)</option>
                                        </select>
                                    </div>
                                </div>

                                {fieldForm.data.field_type === 'select' && (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">ড্রপডাউন অপশনসমূহ (কমা দিয়ে আলাদা করুন)</label>
                                        <input
                                            type="text"
                                            value={fieldForm.data.options}
                                            onChange={(e) => fieldForm.setData('options', e.target.value)}
                                            placeholder="বিদ্যুৎ নেই, লো ভোল্টেজ, তার ছিঁড়ে গেছে"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">সহায়ক নির্দেশনা (Help text)</label>
                                    <input
                                        type="text"
                                        value={fieldForm.data.help_text_bn}
                                        onChange={(e) => fieldForm.setData('help_text_bn', e.target.value)}
                                        placeholder="উদাঃ আপনার বিদ্যুৎ বিলের উপরে থাকা ৮ ডিজিটের নম্বর"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={fieldForm.data.is_required}
                                            onChange={(e) => fieldForm.setData('is_required', e.target.checked)}
                                            className="w-4 h-4 text-emerald-600 rounded"
                                        />
                                        অভিযোগ দাখিলের সময় পূরণ করা বাধ্যতামূলক (Required)
                                    </label>
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowFieldBuilderModal(false)}
                                        className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-xl transition"
                                    >
                                        বাতিল
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={fieldForm.processing}
                                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
                                    >
                                        ফিল্ড সংরক্ষণ করুন
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
