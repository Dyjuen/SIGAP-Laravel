import React from 'react';

export default function PageHeader({ title, description, action }) {
    return (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 sm:mt-6 mb-6 animate-fade-in-up">
            <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-2xl sm:text-3xl lg:text-[2.25rem] leading-tight font-bold bg-gradient-to-br from-cyan-600 to-cyan-400 bg-clip-text text-transparent tracking-tight m-0 break-words">
                    {title}
                </h2>
                {description && (
                    <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-base font-medium leading-relaxed max-w-2xl">
                        {description}
                    </p>
                )}
            </div>
            {action && (
                <div className="mt-4 sm:mt-0 flex shrink-0 gap-2">
                    {action}
                </div>
            )}
        </div>
    );
}
