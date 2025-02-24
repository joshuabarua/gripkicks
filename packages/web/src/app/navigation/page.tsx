import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/useAuthStore';
import { Glow, GlowArea } from '@/components/ui/glow';
import NavButton from '@/components/ui/nav-button';
import { motion } from 'framer-motion';
import NavLinks from '@/components/ui/nav-links';

const menu = {
  open: {
    width: "480px",
    height: "650px",
    top: "-25px",
    right: "-50px",
    transition: { duration: 0.75, type: "tween", ease: [0.76, 0, 0.24, 1] }

  },
  closed: {
    width: "1px",
    height: " 750px",
    top: "-1px",
    right: "-50px",
    transition: { duration: 0.75, delay: 0.35, type: "tween", ease: [0.76, 0, 0.24, 1] }
  }
}

const Navigation: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    setIsActive(false);
    await logout();
  };

  return (
    <nav className="p-2">
      <ul className="flex justify-between text-foreground">
        <GlowArea className="w-[120px] z-4 ">
          <Glow color="whitesmoke" className="rounded-sm flex justify-center align-center">
            <li>
              <Link href="/">
                <h1 className="font-tanker text-2xl hover:scale-105 duration-1000 ease-in-out">Grip Kicks</h1>
              </Link>
            </li>
          </Glow>
        </GlowArea >
        <li>
          {user ? (
            <div className="relative">
              <motion.div
                className={"nav-menu "}
                variants={menu}
                animate={isActive ? "open" : "closed"}
                initial="closed"
              >
                <NavLinks handleLogout={handleLogout} />
              </motion.div>
              <NavButton isActive={isActive} toggleMenu={() => { setIsActive(!isActive) }} />
            </div>
          ) : (
            <Link href="/auth/login">
              <Button className="font-sora" variant="ghost">Login</Button>
            </Link>
          )}
        </li>
      </ul>
    </nav>

  );
};

export default Navigation;