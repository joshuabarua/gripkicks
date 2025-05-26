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
        href: "/foot-profile"
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
        transition: { duration: 0.6, type: "linear", ease: [0.76, 0, 0.24, 1] }
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
        transition: { duration: 0.6, type: "tween", ease: "easeInOut" }
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
                            <motion.div
                                key={`b_${i}`}
                                className={"linkContainer"}
                                custom={i}
                                initial="initial"
                                animate="enter"
                                exit="exit"
                                variants={perspective}
                            >
                                {title === "Logout" ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: 0.1 + (i * 0.1),
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <Link
                                            href={href}
                                            className='font-sora'
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleLogout?.();
                                            }}
                                        >
                                            {title}
                                        </Link>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: 0.1 + (i * 0.1),
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <Link href={href} className='font-sora'>
                                            {title}
                                        </Link>
                                    </motion.div>
                                )}
                            </motion.div>
                        )
                    })
                }
                <div className={"footer"}>
                    {footerLinks.map((link, i) => {
                        const { title, href } = link;
                        return (
                            <motion.div
                                key={`f_${i}`}
                                variants={slideIn}
                                custom={i}
                                initial="initial"
                                animate="enter"
                                exit="exit"
                            >

                                <Link
                                    href={href}
                                    onClick={title === "Logout" ? (e) => {
                                        e.preventDefault();
                                        handleLogout?.();
                                    } : undefined}
                                >
                                    {title}
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div >
    )
}
