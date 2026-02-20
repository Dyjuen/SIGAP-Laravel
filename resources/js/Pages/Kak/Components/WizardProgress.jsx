import React from 'react';
import { FileText, ChartBar, DollarSign, Check } from 'lucide-react';

/**
 * WizardProgress Component
 * Displays the main progress steps (KAK -> IKU -> RAB)
 */
export default function WizardProgress({ currentStep, steps = [] }) {
    const defaultSteps = [
        { id: 1, label: 'Kerangka Acuan Kerja', icon: FileText },
        { id: 2, label: 'Indikator Kinerja Utama', icon: ChartBar },
        { id: 3, label: 'Rencana Anggaran Biaya', icon: DollarSign },
    ];

    const actualSteps = steps.length > 0 ? steps : defaultSteps;

    return (
        <div className="flex justify-center gap-4 md:gap-24 mb-8 backdrop-blur-md p-6 rounded-xl shadow-lg bg-white/80 border border-gray-100 overflow-x-auto">
            {actualSteps.map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                const IconComponent = step.icon;

                return (
                    <div key={step.id} className="flex items-center justify-center gap-3 px-4 min-w-max">
                        <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-sm
                            ${isActive ? 'bg-cyan-500 text-white shadow-cyan-500/40 ring-4 ring-cyan-100' :
                                    isCompleted ? 'bg-emerald-500 text-white shadow-emerald-500/40' : 'bg-gray-200 text-gray-500'}
                            `}
                        >
                            {isCompleted ? (
                                <Check size={24} />
                            ) : (
                                <IconComponent size={24} />
                            )}
                        </div>
                        <div className="text-left hidden md:block">
                            <div className={`text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-cyan-600' : isCompleted ? 'text-emerald-600' : 'text-gray-500'}`}>
                                {step.label}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
