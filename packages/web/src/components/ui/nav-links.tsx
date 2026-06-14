import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from '@/lib/auth';
interface NavItem {
    title: string;
    href: string;
}

const mainLinks: NavItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Foot Lab", href: "/footlab" },
    { title: "Sanctuary", href: "/stash" },
    { title: "Matcher", href: "/matcher" },
]

const secondaryLinks: NavItem[] = [
    { title: "About", href: "/about" },
    { title: "Privacy", href: "/privacy" },
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

interface NavLinksProps {
    footerAction?: React.ReactNode;
}

export default function NavLinks({ footerAction }: NavLinksProps) {
    const { data: session } = useSession();
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

    const adminLink: NavItem = { title: "Admin", href: "/admin" };

    return (
        <div className="nav relative h-full flex flex-col justify-between">
            <div className="body flex flex-col gap-2">
                {mainLinks.map((link, i) => (
                    <motion.div
                        key={`m_${i}`}
                        className="linkContainer"
                        custom={i}
                        initial="initial"
                        animate="enter"
                        exit="exit"
                        variants={perspective}
                    >
                        <Link href={link.href} className="font-sora nav-link-item group">
                            {link.title}
                        </Link>
                    </motion.div>
                ))}

                <div className="footer mt-auto border-t border-black/10 pt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                    {[...secondaryLinks, ...(isAdmin ? [adminLink] : [])].map((link, i) => (
                        <motion.div
                            key={`s_${i}`}
                            variants={slideIn}
                            custom={i}
                            initial="initial"
                            animate="enter"
                            exit="exit"
                        >
                            <Link href={link.href} className="nav-secondary-link group">
                                {link.title}
                            </Link>
                        </motion.div>
                    ))}
                    {footerAction && (
                        <div className="ml-auto pl-4 border-l border-black/10">
                            {footerAction}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
