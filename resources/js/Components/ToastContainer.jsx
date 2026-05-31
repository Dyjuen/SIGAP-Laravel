import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';


function ToastItem({ id, message, type, duration, onClose }) {
    const [progress, setProgress] = useState(100);
    const [isPaused, setIsPaused] = useState(false);
    const progressInterval = useRef(null);
    const timeLeft = useRef(duration);
    const lastTick = useRef(Date.now());

    useEffect(() => {
        if (!isPaused) {
            lastTick.current = Date.now();
            progressInterval.current = setInterval(() => {
                const now = Date.now();
                const delta = now - lastTick.current;
                lastTick.current = now;
                
                timeLeft.current -= delta;
                const percentage = Math.max(0, (timeLeft.current / duration) * 100);
                setProgress(percentage);

                if (timeLeft.current <= 0) {
                    clearInterval(progressInterval.current);
                    onClose(id);
                }
            }, 50);
        } else {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        }

        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [isPaused, duration, id, onClose]);

    // Icon mapping
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
            default:
                return <Info className="w-5 h-5 text-cyan-500 shrink-0" />;
        }
    };

    // Styling configurations
    const getThemeClasses = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-emerald-50/90 border-emerald-100',
                    text: 'text-slate-800',
                    progressBg: 'bg-emerald-500'
                };
            case 'error':
                return {
                    bg: 'bg-rose-50/90 border-rose-100',
                    text: 'text-slate-800',
                    progressBg: 'bg-rose-500'
                };
            case 'warning':
                return {
                    bg: 'bg-amber-50/90 border-amber-100',
                    text: 'text-slate-800',
                    progressBg: 'bg-amber-500'
                };
            default:
                return {
                    bg: 'bg-cyan-50/90 border-cyan-100',
                    text: 'text-slate-800',
                    progressBg: 'bg-cyan-500'
                };
        }
    };

    const theme = getThemeClasses();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className={`w-full max-w-sm overflow-hidden rounded-2xl border backdrop-blur-xl shadow-xl shadow-slate-100/50 p-4 pointer-events-auto flex flex-col relative ${theme.bg}`}
        >
            <div className="flex items-start gap-3">
                {getIcon()}
                <div className="flex-1 mr-2">
                    <p className={`text-sm font-semibold leading-relaxed ${theme.text}`}>
                        {message}
                    </p>
                </div>
                <button
                    onClick={() => onClose(id)}
                    className="text-slate-400 hover:text-slate-600 rounded-lg p-0.5 hover:bg-slate-200/50 transition-colors shrink-0 focus:outline-none"
                    aria-label="Tutup"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Timer Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/20">
                <div
                    className={`h-full transition-all duration-75 ${theme.progressBg}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </motion.div>
    );
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState([]);
    const { flash } = usePage().props;
    const prevFlash = useRef(null);

    // Watch Inertia flash props
    useEffect(() => {
        if (flash && (flash.success || flash.error || flash.message)) {
            // Compare stringified representations to catch update cycles
            const currentFlashString = JSON.stringify(flash);
            if (currentFlashString !== prevFlash.current) {
                if (flash.success) {
                    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message: flash.success, type: 'success', duration: 5000 }]);
                }
                if (flash.error) {
                    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message: flash.error, type: 'error', duration: 5000 }]);
                }
                if (flash.message) {
                    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message: flash.message, type: 'info', duration: 5000 }]);
                }
                prevFlash.current = currentFlashString;
            }
        } else {
            prevFlash.current = null;
        }
    }, [flash]);


    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        id={toast.id}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={removeToast}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
