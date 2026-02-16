import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
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
                    Selamat Datang di <br /> SIGAP PNJ!
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
                <div>
                    <InputLabel htmlFor="username" value="Nama Pengguna" />

                    <TextInput
                        id="username"
                        type="text"
                        name="username"
                        value={data.username}
                        className="mt-1 block w-full bg-white/50 backdrop-blur-sm"
                        autoComplete="username"
                        isFocused={true}
                        placeholder="Masukkan nama pengguna Anda"
                        onChange={(e) => setData('username', e.target.value)}
                    />

                    <InputError message={errors.username} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Kata Sandi" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full bg-white/50 backdrop-blur-sm"
                        autoComplete="current-password"
                        placeholder="Masukkan kata sandi Anda"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Ingat Saya
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm font-medium text-cyan-600 underline hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                        >
                            Lupa Kata Sandi?
                        </Link>
                    )}
                </div>

                <div className="mt-6">
                    <PrimaryButton className="w-full justify-center py-3 text-base" disabled={processing}>
                        Masuk
                    </PrimaryButton>
                </div>

                <p className="mt-6 text-center text-xs text-gray-500">
                    Sistem Informasi Gerbang Administrasi Pengajuan PNJ
                </p>
            </form>
        </GuestLayout>
    );
}
