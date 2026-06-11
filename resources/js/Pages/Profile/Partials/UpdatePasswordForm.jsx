import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react'; // Import usePage
import { useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const checkPasswordStrength = (password) => {
        if (!password) return { score: 0, text: 'Kosong', color: 'bg-slate-200' };
        let score = 0;
        if (password.length >= 10) score += 1;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        const rating = [
            { score: 0, text: 'Sangat Lemah', color: 'bg-rose-500 w-1/4' },
            { score: 1, text: 'Lemah', color: 'bg-rose-400 w-2/4' },
            { score: 2, text: 'Sedang', color: 'bg-amber-400 w-3/4' },
            { score: 3, text: 'Kuat', color: 'bg-emerald-400 w-full' },
            { score: 4, text: 'Sangat Kuat', color: 'bg-emerald-600 w-full' }
        ];
        return rating[score];
    };

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Perbarui Kata Sandi
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Pastikan akun Anda menggunakan kata sandi yang panjang dan acak agar tetap aman.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Kata Sandi Saat Ini"
                    />

                    <div className="relative mt-1 flex items-center">
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            type={showCurrentPassword ? 'text' : 'password'}
                            className="block w-full pr-10"
                            autoComplete="current-password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 text-gray-400 hover:text-[#33C8DA] focus:outline-none"
                        >
                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <InputError
                        message={errors.current_password}
                        className="mt-2"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi Baru" />

                    <div className="relative mt-1 flex items-center">
                        <TextInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type={showPassword ? 'text' : 'password'}
                            className="block w-full pr-10"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            maxLength={100}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 text-gray-400 hover:text-[#33C8DA] focus:outline-none"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {data.password && (
                        <div className="mt-2 max-w-xl">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold text-gray-600">Kekuatan Kata Sandi:</span>
                                <span className={`text-xs font-bold ${
                                    checkPasswordStrength(data.password).score <= 1 ? 'text-rose-500' :
                                    checkPasswordStrength(data.password).score === 2 ? 'text-amber-500' :
                                    'text-emerald-500'
                                }`}>{checkPasswordStrength(data.password).text}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-300 ${checkPasswordStrength(data.password).color}`}></div>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                                Gunakan minimal 10 karakter dengan kombinasi huruf kapital, huruf kecil, angka, dan simbol.
                            </p>
                        </div>
                    )}

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Konfirmasi Kata Sandi Baru"
                    />

                    <div className="relative mt-1 flex items-center">
                        <TextInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            type={showConfirmPassword ? 'text' : 'password'}
                            className="block w-full pr-10"
                            autoComplete="new-password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 text-gray-400 hover:text-[#33C8DA] focus:outline-none"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Simpan</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            Tersimpan.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
