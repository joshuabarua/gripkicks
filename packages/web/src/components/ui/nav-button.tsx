import { motion, useReducedMotion } from 'framer-motion';

interface NavButtonProps {
    isActive: boolean;
    toggleMenu: () => void;
}

interface PerspectiveTextProps {
    label: string;
}

export default function NavButton({ isActive, toggleMenu }: NavButtonProps) {
    const reduceMotion = useReducedMotion();
    return (
        <button
            type="button"
            aria-label={isActive ? "Close menu" : "Open menu"}
            aria-expanded={isActive}
            onClick={toggleMenu}
            className={"nav-button border-0 bg-transparent p-0"}
        >
            <motion.div
                className={"nav-slider"}
                initial={false}
                animate={{ top: isActive ? "-100%" : "0%" }}
                transition={{ duration: reduceMotion ? 0 : isActive ? 0.5 : 0.24, type: "tween", ease: [0.76, 0, 0.24, 1] }}
            >
                <div aria-hidden="true" className={"nav-el"}>
                    <PerspectiveText label="Menu" />
                </div>
                <div aria-hidden="true" className={"nav-el"}>
                    <PerspectiveText label="Close" />
                </div>
            </motion.div>
        </button>
    )
}

function PerspectiveText({ label }: PerspectiveTextProps) {
    return (
        <div className={"nav-perspectiveText font-mono"}>
            <p>{label}</p>
            <p>{label}</p>
        </div>
    )
}