"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import LocomotiveScroll from 'locomotive-scroll';
import DragHandle from "./_components/slider";
import { manualWorkData, WorkItem, START_YEAR, END_YEAR } from "./_components/workData"

gsap.registerPlugin(Draggable);

interface DraggableInstance extends Draggable {
    x: number;
    target: HTMLElement;
  }

const Works: React.FC = () => {
    const [works, setWorks] = useState<WorkItem[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<DraggableInstance | null>(null);
    const locoScrollRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && containerRef.current) {
            locoScrollRef.current = new LocomotiveScroll({
                el: containerRef.current,
                smooth: true,
                direction: 'horizontal',
                gestureDirection: 'both',
                tablet: { smooth: true },
                smartphone: { smooth: true },
            } as any);

            return () => {
                if (locoScrollRef.current) {
                    locoScrollRef.current.destroy();
                }
            };
        }
    }, []);

    const setupScrollAndDrag = useCallback(() => {
        if (containerRef.current && scrollerRef.current && timelineRef.current) {
            const totalWidth = containerRef.current.scrollWidth - window.innerWidth;
            const timelineWidth = timelineRef.current.offsetWidth - scrollerRef.current.offsetWidth;

            const containerXTo = gsap.quickTo(containerRef.current, "x", {duration: 1.5, ease: "power3.out"});
            const scrollerXTo = gsap.quickTo(scrollerRef.current, "x", {duration: 1, ease: "power3.out"});

            const updateScroll = (progress: number) => {
                containerXTo(-progress * totalWidth);
                scrollerXTo(progress * timelineWidth);
                if (locoScrollRef.current && locoScrollRef.current.scroll) {
                    locoScrollRef.current.scrollTo(progress * totalWidth, {
                        duration: 0,
                        disableLerp: true,
                    });
                }
            };

            if (dragRef.current) {
                dragRef.current.kill();
            }

            dragRef.current = Draggable.create(scrollerRef.current, {
                type: "x",
                bounds: timelineRef.current,
                inertia: true,
                onDrag: function(this: DraggableInstance) {
                    const progress = this.x / timelineWidth;
                    updateScroll(progress);
                },
                onDragEnd: function(this: DraggableInstance) {
                    const progress = this.x / timelineWidth;
                    updateScroll(progress);
                }
            })[0] as DraggableInstance;

            const handleWheel = (e: WheelEvent) => {
                e.preventDefault();
                if (dragRef.current) {
                    const currentX = dragRef.current.x;
                    const newX = gsap.utils.clamp(0, timelineWidth, currentX + e.deltaY);
                    const progress = newX / timelineWidth;
                    updateScroll(progress);
                    dragRef.current.update();
                }
            };

            window.addEventListener("wheel", handleWheel, { passive: false });

            return () => {
                window.removeEventListener("wheel", handleWheel);
            };
        }
    }, []);


    useEffect(() => {
        setWorks(manualWorkData);
    }, []);

    useEffect(() => {
        const cleanup = setupScrollAndDrag();

        return () => {
            if (cleanup) cleanup();
            if (dragRef.current) {
                dragRef.current.kill();
            }
        };
    }, [setupScrollAndDrag]);

  const yearRange = START_YEAR - END_YEAR + 1;

  const worksByYear = works.reduce((acc, work) => {
    if (!acc[work.year]) {
      acc[work.year] = [];
    }
    acc[work.year].push(work);
    return acc;
  }, {} as Record<number, WorkItem[]>);

  const sortedYears = Object.keys(worksByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="h-screen w-screen overflow-hidden">
      <div
        ref={containerRef}
        className="absolute top-0 left-0 w-[1260vw] h-[90vh] ml-10 flex items-center justify-center overflow-hidden gap-x-10"
        data-scroll-container
      >
        {sortedYears.map((year) => (
          <React.Fragment key={year}>
            <div className="flex flex-col items-start justify-start">
              <h2 className="text-3xl font-bold text-navText mb-8">{year}</h2>
            </div>
            {worksByYear[Number(year)].map((work) => (
              <section
                key={work.id}
                className="relative w-full h-[90vh] pt-12 flex flex-col items-start justify-center"
                data-scroll-section
              >
                <div className="w-full max-h-[80vh] relative flex flex-col items-start justify-start">
                    <div style={{ paddingTop: `${(1 / work.aspectRatio) * 100}%` }} />
                  <Image
                    className="w-full h-full p-0"
                    src={work.imageUrl}
                    alt={`Work from ${work.year}`}
                    layout="fill"
                    objectFit="contain"   
                  />
                </div>
                <div className="w-auto flex items-start justify-start text-navText">
                  <p>{work.description}</p>
                </div>
              </section>
            ))}
          </React.Fragment>
        ))}
      </div>
      <div
        ref={timelineRef}
        className="fixed bottom-0 left-0 w-screen h-[10vh] px-6 py-9 flex justify-between items-center"
      >
        <div className="h-[80%] flex items-center font-semibold text-navText text-xs">
          {START_YEAR}
        </div>
        {Array.from({ length: yearRange + yearRange - 2 }).map((_, index) => (
          <div key={index} className="h-[100%] w-[2px] bg-[#323232]" />
        ))}
        <div className="h-full flex items-center font-semibold text-navText text-xs">
          {END_YEAR}
        </div>
        <DragHandle ref={scrollerRef} />
      </div>
    </div>
  );
};

export default Works;
