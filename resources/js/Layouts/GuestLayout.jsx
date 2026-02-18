import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-cover bg-center pt-6 sm:pt-0" style={{ backgroundImage: "url('/images/backgrounds/Auth.png')" }}>
            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white/70 px-6 py-8 shadow-2xl backdrop-blur-md sm:rounded-3xl sm:px-10">
                <div className="mb-6 flex justify-center">
                    <Link href="/">
                        <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                    </Link>
                </div>
                {children}
            </div>
            {/* Optional: Overlay or floating elements could be added here similar to original */}
        </div>
    );
}
