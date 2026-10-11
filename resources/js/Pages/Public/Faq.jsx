import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function Faq() {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            q: 'অভিযোগ দাখিল করতে কি ফি বা কোনো টাকা দিতে হয়?',
            a: 'না। ই-অভিযোগ বাক্সে অভিযোগ জমা দেওয়া সম্পূর্ণ বিনামূল্যে। কোনো প্রকার ফি বা চার্জ প্রযোজ্য নয়।'
        },
        {
            q: 'আমি কি নিজের পরিচয় গোপন রেখে বেনামে অভিযোগ করতে পারি?',
            a: 'হ্যাঁ। ফরমের শেষ ধাপে "পরিচয় গোপন রাখতে চাই" বিকল্পটি নির্বাচন করলে আপনার নাম ও পরিচয় সম্পূর্ণ গোপন রাখা হবে।'
        },
        {
            q: 'সংবেদনশীল বা নারী ও শিশু সংক্রান্ত অভিযোগ কীভাবে সুরক্ষিত থাকে?',
            a: 'নারী ও শিশু নির্যাতন, যৌন হয়রানি বা দুর্নীতি সম্পর্কিত অভিযোগগুলোকে স্বয়ংক্রিয়ভাবে "সংবেদনশীল" (Sensitive) হিসেবে চিহ্নিত করা হয়। এর বিস্তারিত বিবরণ পাবলিক ট্র্যাকিং পেজে দেখানো হয় না এবং কেবল অনুমোদিত তদন্তকারী দেখতে পারেন।'
        },
        {
            q: 'নির্দিষ্ট কোনো কর্মকর্তার বিরুদ্ধে অভিযোগ করলে কী হবে?',
            a: 'স্বার্থের সংঘাত রোধ করতে অভিযোগটি কখনোই অভিযুক্ত কর্মকর্তার কাছে সরাসরি যায় না। সিস্টেম এটি স্বয়ংক্রিয়ভাবে তার ঊর্ধ্বতন কর্মকর্তা ও দপ্তরের প্রশাসনিক প্রধানের কাছে পাঠায়।'
        },
        {
            q: 'এসএলএ (SLA) বা নিষ্পত্তির সময়সীমা অতিক্রান্ত হলে কী ব্যবস্থা নেওয়া হয়?',
            a: 'নির্ধারিত কার্যদিবসের মধ্যে অভিযোগ সমাধান না হলে সিস্টেম সেটিকে "ওভারডিউ" হিসেবে চিহ্নিত করে এবং স্বয়ংক্রিয়ভাবে জেলা প্রশাসক ও কেন্দ্রীয় মন্ত্রণালয়ের মনিটরিং সেলে এসকেলেট করে।'
        },
        {
            q: 'সমাধান মনঃপূত না হলে পুনরায় খোলার সুযোগ আছে কি?',
            a: 'হ্যাঁ। সমাধানের পর নাগরিক মতামত ফর্মে "না, সমাধান হয়নি" নির্বাচন করে কারণ উল্লেখপূর্বক পুনরায় খোলার আবেদন জানাতে পারেন।'
        }
    ];

    return (
        <PublicLayout>
            <Head title="সাধারণ জিজ্ঞাসা ও উত্তর — নাগরিক সেবা পোর্টাল" />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-10">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        সাধারণ জিজ্ঞাসা
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                        নাগরিকদের সচরাচর জিজ্ঞাসিত প্রশ্নাবলী
                    </h1>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:bg-slate-50 transition-colors"
                            >
                                <span className="flex items-center gap-2.5">
                                    <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                    {faq.q}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openIndex === idx ? 'rotate-180 text-emerald-600' : ''}`} />
                            </button>
                            {openIndex === idx && (
                                <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </PublicLayout>
    );
}
