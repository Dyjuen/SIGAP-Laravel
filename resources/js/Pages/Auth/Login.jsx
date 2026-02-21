import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold text-gray-800" style={{ letterSpacing: '-0.02em' }}>
                    Selamat Datang di
                </h2>
                <h2 className="text-3xl font-bold text-gray-800" style={{ letterSpacing: '-0.02em' }}>
                    SIGAP PNJ!
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Silahkan masukkan nama pengguna dan kata sandi Anda
                </p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mb-4">
                    <InputLabel htmlFor="username" value="Nama Pengguna" className="text-gray-700 font-semibold mb-2" />

                    <div className="relative w-full rounded-2xl border border-gray-300/50 bg-white/5 backdrop-blur-sm transition-all duration-300 focus-within:border-[#33C8DA]/70 focus-within:bg-[#33C8DA]/10 focus-within:ring-4 focus-within:ring-[#33C8DA]/10">
                        <TextInput
                            id="username"
                            type="text"
                            name="username"
                            value={data.username}
                            className="w-full bg-transparent border-none p-4 text-sm outline-none focus:ring-0 shadow-none"
                            autoComplete="username"
                            isFocused={true}
                            placeholder="Masukkan nama pengguna Anda"
                            onChange={(e) => setData('username', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.username} className="mt-2" />
                </div>

                <div className="mb-4">
                    <InputLabel htmlFor="password" value="Kata Sandi" className="text-gray-700 font-semibold mb-2" />

                    <div className="relative w-full rounded-2xl border border-gray-300/50 bg-white/5 backdrop-blur-sm transition-all duration-300 focus-within:border-[#33C8DA]/70 focus-within:bg-[#33C8DA]/10 focus-within:ring-4 focus-within:ring-[#33C8DA]/10">
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="w-full bg-transparent border-none p-4 text-sm outline-none focus:ring-0 shadow-none"
                            autoComplete="current-password"
                            placeholder="Masukkan kata sandi Anda"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-6 mb-6 flex items-center justify-between gap-4 flex-wrap">
                    <label className="flex items-center cursor-pointer gap-2">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-gray-300 text-[#33C8DA] shadow-sm focus:ring-[#33C8DA]"
                        />
                        <span className="text-sm text-gray-700">Ingat Saya</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-[#33C8DA] hover:text-[#2BA9B8] hover:underline transition-all duration-300 focus:outline-none"
                        >
                            Lupa Kata Sandi?
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-gradient-to-br from-[#33C8DA] to-[#2BA9B8] text-white font-semibold py-4 rounded-2xl relative overflow-hidden transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-6px_rgba(51,200,218,0.5)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                    <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500 group-hover:left-[100%]"></span>
                    Masuk
                </button>

                <p className="mt-8 text-center text-xs text-gray-500">
                    Sistem Informasi Gerbang Administrasi Pengajuan PNJ
                </p>
            </form>
        </GuestLayout>
    );
}
