import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function CommentAlert({ message, className = '' }) {
    if (!message) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className={`bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-start gap-2 shadow-sm ${className}`}
            >
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <div className="flex-1">
                    <span className="font-bold block mb-0.5">Catatan Verifikator:</span>
                    <p className="whitespace-pre-wrap leading-relaxed">{message}</p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
