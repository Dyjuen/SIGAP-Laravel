import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';

export default function CustomSelect({ value, onChange, options, placeholder = "Pilih opsi", disabled = false, className = "" }) {
    const selectedOption = options.find(opt => opt.value == value) || { label: placeholder, value: '' };

    return (
        <div className="relative w-full group">
            <Listbox value={value} onChange={onChange} disabled={disabled}>
                <div className="relative">
                    <Listbox.Button className={`relative w-full text-left bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all ${disabled ? 'opacity-70 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:bg-gray-50'} ${className || 'py-2 pl-3 pr-10 text-sm'}`}>
                        <div className="flex items-center gap-2">
                            {selectedOption.colorClass && (
                                <span className={`w-2 h-2 rounded-full ${selectedOption.colorClass}`}></span>
                            )}
                            <span className="block truncate text-gray-700 font-medium">{selectedOption.label}</span>
                        </div>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                            <svg className="w-4 h-4 text-gray-400 group-focus-within:text-cyan-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-150"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <Listbox.Options className="absolute z-50 w-full py-2 mt-2 text-base bg-white/95 backdrop-blur-2xl border border-white/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] focus:outline-none sm:text-sm overflow-y-auto max-h-60 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {options.map((option, optionIdx) => (
                                <Listbox.Option
                                    key={optionIdx}
                                    className={({ active }) =>
                                        `relative cursor-pointer select-none py-2.5 pl-4 pr-4 mx-2 my-0.5 rounded-xl transition-all duration-200 ${
                                            active ? 'bg-cyan-500/10 text-cyan-900' : 'text-gray-700 hover:bg-gray-50'
                                        }`
                                    }
                                    value={option.value}
                                >
                                    {({ selected, active }) => (
                                        <div className="flex items-center gap-2">
                                            {option.colorClass && (
                                                <span className={`w-2 h-2 rounded-full ${option.colorClass}`}></span>
                                            )}
                                            <span className={`block truncate ${selected ? 'font-bold text-cyan-700' : 'font-medium'}`}>
                                                {option.label}
                                            </span>
                                            {selected ? (
                                                <span className={`absolute inset-y-0 right-0 flex items-center pr-3 text-cyan-600`}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                                </span>
                                            ) : null}
                                        </div>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
}
