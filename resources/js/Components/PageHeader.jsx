import React from 'react';

export default function PageHeader({ title, description, action }) {
    return (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 sm:mt-6 mb-6 animate-fade-in-up">
            <div className="flex-1">
                <h2 className="text-3xl sm:text-[2.25rem] leading-tight font-bold bg-gradient-to-br from-cyan-600 to-cyan-400 bg-clip-text text-transparent tracking-tight m-0">
                    {title}
                </h2>
                {description && (
                    <p className="text-slate-500 mt-1 sm:mt-2 text-base font-medium">
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
