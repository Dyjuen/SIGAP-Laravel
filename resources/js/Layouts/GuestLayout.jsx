import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: "url('/images/backgrounds/Auth.png')" }}>
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="float-circle circle-1"></div>
                <div className="float-circle circle-2"></div>
                <div className="float-circle circle-3"></div>
                <div className="float-circle circle-4"></div>
                <div className="float-circle circle-5"></div>
                <div className="float-circle circle-6"></div>
            </div>

            <div className="w-full max-w-lg px-4 relative z-10">
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-8 sm:p-12 border border-white/50">
                    <div className="flex justify-center mb-6">
                        <Link href="/">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-transparent">
                                <img src="/images/logo/logoauth.svg" alt="SIGAP PNJ Logo" className="w-10 h-10" />
                            </div>
                        </Link>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
