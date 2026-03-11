"use client";
import { cn } from "@/lib/utils";
import { useReducedEffects } from "@/hooks/useReducedEffects";
import React, {
    ComponentPropsWithoutRef,
    CSSProperties,
    useEffect,
    useRef,
} from "react";

interface GlowAreaProps extends ComponentPropsWithoutRef<"div"> {
    size?: number;
    forceEnabled?: boolean;
}

export const GlowArea = (props: GlowAreaProps) => {
    const { className = "", size = 300, forceEnabled = false, ...rest } = props;
    const element = useRef<HTMLDivElement>(null);
    const frameId = useRef<number | null>(null);
    const latestCoords = useRef<{ x: number; y: number } | null>(null);
    const isReducedEffects = useReducedEffects();

    const updateGlow = () => {
        if (latestCoords.current && element.current) {
            element.current.style.setProperty(
                "--glow-x",
                `${latestCoords.current.x}px`,
            );
            element.current.style.setProperty(
                "--glow-y",
                `${latestCoords.current.y}px`,
            );
            frameId.current = null;
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isReducedEffects && !forceEnabled) return;
        const bounds = e.currentTarget.getBoundingClientRect();
        latestCoords.current = {
            x: e.clientX - bounds.left,
            y: e.clientY - bounds.top,
        };

        if (!frameId.current) {
            frameId.current = requestAnimationFrame(() => updateGlow());
        }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.removeProperty("--glow-x");
        e.currentTarget.style.removeProperty("--glow-y");
    };
    return (
        <div
            ref={element}
            style={
                {
                    position: "relative",
                    "--glow-size": `${size}px`,
                } as CSSProperties
            }
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(className, "")}
            {...rest}
        />
    );
};

GlowArea.displayName = "GlowArea";

interface GlowProps extends ComponentPropsWithoutRef<"div"> {
    color?: string;
    forceEnabled?: boolean;
}

export const Glow = (props: GlowProps) => {
    const { className, color = "#EB5E28", forceEnabled = false, children, ...rest } = props;
    const element = useRef<HTMLDivElement>(null);
    const isReducedEffects = useReducedEffects();

    useEffect(() => {
        element.current?.style.setProperty(
            "--glow-top",
            `${element.current?.offsetTop}px`,
        );
        element.current?.style.setProperty(
            "--glow-left",
            `${element.current?.offsetLeft}px`,
        );
    }, []);

    return (
        <div ref={element} className={cn(className, "relative")}>
            <div
                {...rest}
                style={{
                    backgroundImage: isReducedEffects && !forceEnabled ? "none" : `radial-gradient(
            var(--glow-size) var(--glow-size) at calc(var(--glow-x, -99999px) - var(--glow-left, 0px))
            calc(var(--glow-y, -99999px) - var(--glow-top, 0px)),
            ${color} 0%,
            transparent 100%
          )`,
                }}
                className={cn(
                    className,
                    "absolute pointer-events-none inset-0 dark:mix-blend-lighten mix-blend-multiply after:content-[''] after:absolute after:bg-background/90 after:inset-0.5 after:rounded-[inherit]",
                )}
            ></div>
            {children}
        </div>
    );
};

Glow.displayName = "Glow";