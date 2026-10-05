import { motion } from 'framer-motion';

interface NavButtonProps {
    isActive: boolean;
    toggleMenu: () => void;
}

interface PerspectiveTextProps {
    label: string;
}

export default function NavButton({ isActive, toggleMenu }: NavButtonProps) {
    return (
        <button
            type="button"
            aria-label={isActive ? "Close menu" : "Open menu"}
            aria-expanded={isActive}
            onClick={toggleMenu}
            className={"nav-button translate-y-[3px] border-0 bg-transparent p-0"}
        >
            <motion.div
                className={"nav-slider"}
                animate={{ top: isActive ? "-100%" : "0%" }}
                transition={{ duration: 0.5, type: "tween", ease: [0.76, 0, 0.24, 1] }}
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
        <div className={"nav-perspectiveText font-sora"}>
            <p>{label}</p>
            <p>{label}</p>
        </div>
    )
}