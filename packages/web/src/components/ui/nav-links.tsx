import { motion, AnimatePresence } from 'framer-motion';
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
        title: "Sole Sanctuary ",
        href: "/stash"
    },
    {
        title: "Shoe Selector",
        href: "/findmyshoe"
    },
    {
        title: "Foot Lab",
        href: "/footchecker"
    },
    {
        title: "Logout",
        href: "#"
    }
]
const footerLinks = [
    {
        title: "Profile",
        href: "/profile"
    },
    {
        title: "Sole Sanctuary",
        href: "/stash"
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
        translateX: 10,
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
            opacity: { duration: 2 }
        }
    }),
    exit: {
        opacity: 0,
        transition: { duration: 0.9, type: "linear", ease: [0.76, 0, 0.24, 1] }
    }
}
const slideIn = {
    initial: {
        opacity: 0,
        y: 20
    },
    enter: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            delay: 0.8 + (i * 0.1),
            ease: [.215, .61, .355, 1]
        }
    }),
    exit: {
        opacity: 0,
        transition: { duration: 0.9, type: "tween", ease: "easeInOut" }
    }
}

export default function NavLinks({ handleLogout }: NavLinksProps) {
    return (
        <div className={"nav"}>
            <div className={"body"}>
                {
                    links.map((link, i: number) => {
                        const { title, href } = link;
                        return (
                            <div key={`b_${i}`} className={"linkContainer"}>
                                {title === "Logout" ? (
                                    <motion.div
                                        className='font-sora'
                                        custom={i}
                                        initial="initial"
                                        animate="enter"
                                        exit="exit"
                                        variants={perspective}
                                        key={`f_${i}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleLogout?.();
                                        }
                                        }
                                    >
                                        <Link href={href} >
                                            {title}
                                        </Link>
                                    </motion.div>
                                ) : (
                                    <motion.div className='font-sora' variants={perspective}
                                        custom={i}
                                        initial="initial"
                                        animate="enter"
                                        exit="exit"
                                        key={`f_${i}`}>
                                        <Link href={href}>
                                            {title}
                                        </Link>
                                    </motion.div>
                                )}
                            </div>
                        )
                    })
                }
                <div className={"footer"}>
                    {
                        footerLinks.map((link, i) => {
                            const { title, href } = link;
                            return (
                                <motion.a
                                    variants={slideIn}
                                    custom={i}
                                    initial="initial"
                                    animate="enter"
                                    exit="exit"
                                    key={`f_${i}`}
                                >
                                    {title}
                                </motion.a>
                            )
                        })
                    }
                </div>
            </div>
        </div >
    )
}
