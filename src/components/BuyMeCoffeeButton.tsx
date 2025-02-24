/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState } from 'react';

export default function BuyMeCoffeeButton() {
    // Use a ref for potential future use (not strictly needed for this approach)
    const buttonRef = useRef<HTMLDivElement>(null);

    // Base bottom offset of 18px
    const baseOffset = 18;
    // Gap we want between the button and the footer
    const gap = 12;
    const [bottomOffset, setBottomOffset] = useState(baseOffset);

    useEffect(() => {
        // This function will update the button's bottom offset depending on the footer's position
        function updatePosition() {
            const footer = document.querySelector('footer');
            if (footer) {
                const footerRect = footer.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                let extraOffset = 0;
                // If the footer is visible in the viewport, calculate how much it overlaps
                if (footerRect.top < viewportHeight) {
                    extraOffset = (viewportHeight - footerRect.top) + gap;
                }
                const newBottom = baseOffset + extraOffset;
                setBottomOffset(newBottom);
                console.log(`Update Button Position: footer.top=${footerRect.top}, viewportHeight=${viewportHeight}, newBottom=${newBottom}`);
            } else {
                console.warn('Footer element not found');
            }
        }

        // Initial update
        updatePosition();

        // Listen to scroll and resize events
        window.addEventListener('scroll', updatePosition);
        window.addEventListener('resize', updatePosition);

        // Cleanup listeners on component unmount
        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }, []);

    return (
        <div
            ref={buttonRef}
            style={{ bottom: `${bottomOffset}px` }}
            className="fixed right-[18px] z-[9999] transition-all duration-300"
        >
            <a
                href="https://www.buymeacoffee.com/ollolabs"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:-translate-y-1"
            >
                <img
                    src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png"
                    alt="Buy Us A Coffee"
                    className="h-[60px] w-[217px]"
                />
            </a>
        </div>
    );
}