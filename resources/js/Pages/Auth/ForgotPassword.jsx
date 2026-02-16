import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    return (
        <GuestLayout>
            <Head title="Lupa Kata Sandi" />

            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50 ring-4 ring-cyan-100">
                    <svg className="h-8 w-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Lupa Password?</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Untuk mereset password, silakan hubungi Admin SIGAP langsung via WhatsApp.
                </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
                <a
                    href="https://wa.me/+6285156863267"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-cyan-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"></path>
                        <path d="M7 10v4"></path>
                        <path d="M10 10v4"></path>
                        <path d="M13 10v4"></path>
                        <path fill="currentColor" d="M17.2 11.2c-.3-.3-.7-.5-1.2-.5s-.9.2-1.2.5c-.3.3-.5.7-.5 1.2s.2.9.5 1.2c.3.3.7.5 1.2.5s.9-.2 1.2-.5c.3-.3.5-.7.5-1.2s-.2-.9-.5-1.2z"></path>
                    </svg>
                    Hubungi Admin via WhatsApp
                </a>

                <Link
                    href={route('login')}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-cyan-600"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Kembali ke halaman login
                </Link>
            </div>
        </GuestLayout>
    );
}
