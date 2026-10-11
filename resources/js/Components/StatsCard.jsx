import React from 'react';

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'emerald' }) {
    const colorStyles = {
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-4 ring-emerald-50',
        blue: 'bg-blue-50 text-blue-700 border-blue-200/80 ring-4 ring-blue-50',
        amber: 'bg-amber-50 text-amber-700 border-amber-200/80 ring-4 ring-amber-50',
        red: 'bg-red-50 text-red-700 border-red-200/80 ring-4 ring-red-50',
        purple: 'bg-purple-50 text-purple-700 border-purple-200/80 ring-4 ring-purple-50',
    };

    return (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm card-hover-lift">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 font-mono">{value}</h3>
                    {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
                </div>
                {Icon && (
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-2xs ${colorStyles[color] || colorStyles.emerald}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                )}
            </div>
        </div>
    );
}
