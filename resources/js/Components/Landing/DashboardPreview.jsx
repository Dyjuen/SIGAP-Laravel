import React, { useRef, useEffect } from 'react';

const DashboardPreview = () => {
    const containerRef = useRef(null);
    const innerRef = useRef(null);
    const bgRef = useRef(null);
    const elementsRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        const inner = innerRef.current;
        const bg = bgRef.current;
        const elements = elementsRef.current;

        if (!container || !inner || !bg || !elements) return;

        const handleMouseMove = (e) => {
            const rect = container.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) / rect.width;
            const mouseY = (e.clientY - rect.top) / rect.height;

            const normalizedX = (mouseX - 0.5) * 2;
            const normalizedY = (mouseY - 0.5) * 2;

            const maxRotation = 10;
            const rotateY = normalizedX * maxRotation;
            const rotateX = -normalizedY * maxRotation;

            inner.style.transform = `
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg) 
                scale3d(1.02, 1.02, 1.02)
            `;

            const parallax = 8;
            bg.style.transform = `translateX(${normalizedX * parallax}px) translateY(${normalizedY * parallax}px)`;
            elements.style.transform = `translateX(${-normalizedX * parallax * 1.5}px) translateY(${-normalizedY * parallax * 1.5}px)`;
        };

        const handleMouseLeave = () => {
            inner.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            bg.style.transform = 'translateX(0) translateY(0)';
            elements.style.transform = 'translateX(0) translateY(0)';
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative max-w-5xl mx-auto"
            style={{ perspective: '1000px', perspectiveOrigin: 'center center' }}
            data-aos="fade-up"
            data-aos-duration="1200"
            data-aos-delay="600"
        >
            <div
                ref={innerRef}
                className="relative dashboard-3d glow-border rounded-2xl shadow-2xl border border-gray-100 overflow-hidden bg-white"
                style={{
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.1s ease-out',
                    transformOrigin: 'center center'
                }}
            >
                <img
                    ref={bgRef}
                    src="/images/landing/previews/dashboard-preview.png"
                    alt="SIGAP Dashboard Background"
                    className="w-full h-auto rounded-2xl"
                    style={{ transition: 'transform 0.1s ease-out' }}
                />
                <img
                    ref={elementsRef}
                    src="/images/landing/previews/dashboard-elements.png"
                    alt="SIGAP Dashboard Elements"
                    className="absolute top-0 left-0 w-full h-auto pointer-events-none"
                    style={{ transition: 'transform 0.1s ease-out' }}
                />
            </div>
        </div>
    );
};

export default DashboardPreview;
