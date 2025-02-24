import { motion } from 'framer-motion';
import Link from 'next/link';

interface NavLinksProps {
    handleLogout?: () => void;
}

export const links = [
    {
        title: "Profile",
        href: "/profile"
    },
    {
        title: "Shoe Stash",
        href: "/shoestash"
    },
    {
        title: "Foot Checker",
        href: "/footchecker"
    },
    {
        title: "Comfort Ranking",
        href: "/comfortranking"
    },
    {
        title: "Logout",
        href: "#"
    }
]

const perspective = {
    initial: {
        opacity: 0,
        rotateX: 90,
        translateY: 80,
        translateX: -20,
    },
    enter: (i: number) => ({
        opacity: 1,
        rotateX: 0,
        translateY: 0,
        translateX: 0,
        transition: {
            duration: 0.65,
            delay: 0.5 + (i * 0.1),
            ease: [.215, .61, .355, 1],
            opacity: { duration: 0.35 }
        }
    }),
    exit: {
        opacity: 0,
        transition: { duration: 0.1, type: "linear", ease: [0.76, 0, 0.24, 1] }
    }
}

export default function NavLinks({ handleLogout }: NavLinksProps) {
    return (
        <div className={"nav"}>
            <div className={"body"}>
                {
                    links.map((link, i) => {
                        const { title, href } = link;
                        return (
                            <div key={`b_${i}`} className={"linkContainer"}>
                                <motion.div
                                    custom={i}
                                    variants={perspective}
                                    initial="initial"
                                    animate="enter"
                                    exit="exit"
                                >
                                    {title === "Logout" ? (
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleLogout?.();
                                            }}
                                        >
                                            {title}
                                        </a>
                                    ) : (
                                        <Link href={href}>
                                            {title}
                                        </Link>
                                    )}
                                </motion.div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}