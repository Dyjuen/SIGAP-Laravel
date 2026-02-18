import React, { useState, useEffect, useRef } from 'react';

const IntroOverlay = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [videoSrc, setVideoSrc] = useState('');
    const videoRef = useRef(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        // Check if intro has been seen
        const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
        if (hasSeenIntro === 'true') {
            setIsVisible(false);
            return;
        }

        // Detect mobile
        const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768 && !/iPad/i.test(navigator.userAgent));
        setVideoSrc(isMobile ? '/videos/introm.mp4' : '/videos/intro.mp4');

    }, []);

    const handleHide = () => {
        if (!overlayRef.current) return;

        sessionStorage.setItem('hasSeenIntro', 'true');
        overlayRef.current.style.transition = 'opacity 0.5s ease-out';
        overlayRef.current.style.opacity = '0';

        setTimeout(() => {
            setIsVisible(false);
        }, 500);
    };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.addEventListener('ended', handleHide);
        }
        return () => {
            if (videoRef.current) {
                videoRef.current.removeEventListener('ended', handleHide);
            }
        };
    }, [videoSrc]);

    if (!isVisible) return null;

    return (
        <div
            ref={overlayRef}
            id="videoIntro"
            className="fixed top-0 left-0 w-screen h-screen bg-[#1a1a1a] z-[99999] flex items-center justify-center cursor-pointer"
            onClick={handleHide}
        >
            {videoSrc && (
                <video
                    ref={videoRef}
                    id="introVideo"
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover bg-[#1a1a1a]"
                    src={videoSrc}
                >
                    Your browser does not support the video tag.
                </video>
            )}

            <div className="absolute bottom-8 right-8 bg-[#54d2e8]/25 backdrop-blur-md px-5 py-2.5 rounded-full text-white/95 text-[13px] font-normal border border-[#54d2e8]/35 pointer-events-none transition-all duration-300 shadow-[0_2px_12px_rgba(84,210,232,0.2)] opacity-60 hover:opacity-85 hover:bg-[#54d2e8]/40 hover:border-[#54d2e8]/50">
                Klik di mana saja untuk melewati
            </div>
        </div>
    );
};

export default IntroOverlay;
