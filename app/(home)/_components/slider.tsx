import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const DragHandle = React.forwardRef<HTMLDivElement, {}>((props, ref) => {
    const bracketsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseDown = () => {
            gsap.to(bracketsRef.current, {
                scale: 1.2,
                duration: 0.5,
                ease: "power2.out",
            });
        };

        const handleMouseUp = () => {
            gsap.to(bracketsRef.current, {
                scale: 1,
                duration: 0.2,
                ease: "power2.out",
            });
        };

        if (ref && "current" in ref && ref.current) {
            ref.current.addEventListener("mousedown", handleMouseDown);
            window.addEventListener("mouseup", handleMouseUp);

            return () => {
                ref.current?.removeEventListener("mousedown", handleMouseDown);
                window.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [ref]);

    return (
        <div
      ref={ref}
      className="absolute flex items-center justify-center bg-sliderBg top-1/2 px-3 left-0 transform -translate-y-1/2 cursor-grab active:cursor-grabbing"
    >
      <div ref={bracketsRef} className="flex items-center">
        <svg
          width="8"
          height="20"
          viewBox="0 0 8 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8 0V2H2V18H8V20H0V0H8Z" fill="currentColor" className="text-navText"></path>
        </svg>
        <span className="text-navText text-xs font-semibold px-6">SCROLL</span>
        <svg
          width="8"
          height="20"
          viewBox="0 0 8 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 0V2H6V18H0V20H8V0H0Z" fill="currentColor" className="text-navText"></path>
        </svg>
      </div>
    </div>
    );
});

export default DragHandle;
