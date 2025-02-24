import { motion } from 'framer-motion';
import styles from './style.module.scss';

interface NavButtonProps {
    isActive: boolean;
    toggleMenu: () => void;
}

interface PerspectiveTextProps {
    label: string;
}

export default function NavButton({ isActive, toggleMenu }: NavButtonProps) {
    return (
        <div className={"nav-button"}>
            <motion.div
                className={"nav-slider"}
                animate={{ top: isActive ? "-100%" : "0%" }}
                transition={{ duration: 0.5, type: "tween", ease: [0.76, 0, 0.24, 1] }}
            >
                <div
                    className={"nav-el"}
                    onClick={() => { toggleMenu() }}
                >
                    <PerspectiveText label="Menu" />
                </div>
                <div
                    className={"nav-el"}
                    onClick={() => { toggleMenu() }}
                >
                    <PerspectiveText label="Close" />
                </div>
            </motion.div>
        </div>
    )
}

function PerspectiveText({ label }: PerspectiveTextProps) {
    return (
        <div className={"nav-perspectiveText"}>
            <p>{label}</p>
            <p>{label}</p>
        </div>
    )
}