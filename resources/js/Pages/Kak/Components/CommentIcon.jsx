import React from 'react';
import { MessageSquareText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CommentIcon({
    hasComment = false,
    onClick,
    isPastNote = false,
    isPengusul = false,
    className = ''
}) {
    // If it has a comment, use red for active/new comments, yellow for past/old comments
    // Pengusul always sees red.
    const activeClass = (isPastNote && !isPengusul)
        ? "bg-yellow-100 text-yellow-600 border-yellow-300 hover:bg-yellow-500 hover:text-white ring-yellow-400/50"
        : "bg-red-100 text-red-600 border-red-300 hover:bg-red-500 hover:text-white ring-red-400/50 animate-pulse";

    const inactiveClass = "bg-cyan-50 text-cyan-500 border-cyan-200 hover:bg-cyan-500 hover:text-white hover:scale-110";

    return (
        <button
            type="button"
            onClick={onClick}
            className={`absolute right-3 top-[50%] -translate-y-[50%] w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all duration-300 z-10 
                ${hasComment ? activeClass : inactiveClass} 
                ${hasComment && !isPastNote ? 'ring-4' : ''} 
                ${className}`}
            title={hasComment ? (isPastNote ? "Lihat Catatan (Lama)" : "Lihat/Edit Catatan") : "Tambah Catatan Revisi"}
        >
            <MessageSquareText size={16} />
        </button>
    );
}
