import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from '@/lib/auth';
import { LayoutDashboard, Settings, Footprints, Archive, Heart, Box, Info, Shield, Crown, Target } from 'lucide-react';
import { AnimatedNavIcon } from '@/components/ui/AnimatedNavIcon';
import type { LucideIcon } from 'lucide-react';

type IconAnimation = 'bounce' | 'wiggle' | 'pulse' | 'spin' | 'pop' | 'shake';

interface NavItem {
    title: string;
    href: string;
    icon: LucideIcon;
    animation: IconAnimation;
}

const mainLinks: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, animation: 'bounce' },
    { title: "Foot Lab", href: "/footchecker", icon: Footprints, animation: 'wiggle' },
    { title: "Sanctuary", href: "/stash", icon: Archive, animation: 'pop' },
    { title: "Matcher", href: "/matcher", icon: Target, animation: 'pulse' },
    { title: "Sole Mate", href: "/findmyshoe", icon: Heart, animation: 'pulse' },
]

const secondaryLinks: NavItem[] = [
    { title: "Profile", href: "/profile", icon: Settings, animation: 'spin' },
    { title: "3D Selector", href: "/selector", icon: Box, animation: 'wiggle' },
    { title: "About", href: "/about", icon: Info, animation: 'bounce' },
    { title: "Privacy", href: "/privacy", icon: Shield, animation: 'shake' },
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

export default function NavLinks() {
    const { data: session } = useSession();
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;
    
    const adminLink: NavItem = { title: "Admin", href: "/admin", icon: Crown, animation: 'pop' };

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
                            <AnimatedNavIcon
                                icon={<link.icon className="w-6 h-6 text-black/40 group-hover:text-black transition-colors shrink-0" />}
                                animation={link.animation}
                                size={24}
                                className="shrink-0"
                            />
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
                                <AnimatedNavIcon
                                    icon={<link.icon className="w-3.5 h-3.5 text-black/30 group-hover:text-black/70 transition-colors" />}
                                    animation={link.animation}
                                    size={8}
                                />
                                {link.title}
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
