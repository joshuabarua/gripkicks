import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserCircle2 } from 'lucide-react';
import { useAuth } from '@/context/useAuthStore';
import type { User } from '@/types/user';
import { Glow, GlowArea } from '@/components/ui/glow';
import NavButton from '@/components/ui/nav-button';

const Navigation: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const { user, logout } = useAuth();

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  return (
    <GlowArea className="w-full z-4">
      <Glow className="rounded-sm">
        <nav className="p-2">
          <ul className="flex justify-between text-foreground">
            <li>
              <Link href="/">
                <h1 className="font-tanker text-2xl hover:scale-105 duration-1000 ease-in-out">Grip Kicks</h1>
              </Link>
            </li>
            {/* <li>
              <Link href="/comfort-ranking">
                <Button className="font-sora hover:scale-105 duration-1000 ease-in-out" variant="outline">Comfort Ranking</Button>
              </Link>
            </li> */}
            <li>
              {user ? (
                <div className="relative">
                  <NavButton isActive={isActive} toggleMenu={() => { setIsActive(!isActive) }} />
                  {dropdownOpen && (
                    <div className="navbar absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg z-20">
                      <ul className='navbar-nav'>
                        <Link
                          href="/profile"
                          className="block px-4 py-2 hover:bg-gray-200 cursor-pointer"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/shoe-stash"
                          className="block px-4 py-2 hover:bg-gray-200 cursor-pointer"
                        >
                          Shoe Stash
                        </Link>
                        <Link
                          href="/foot-checker"
                          className="block px-4 py-2 hover:bg-gray-200 cursor-pointer"
                        >
                          Foot Checker
                        </Link>
                        <Button
                          onClick={handleLogout}
                          className="w-full text-left block px-4 py-2"
                          variant="outline"
                        >
                          Logout
                        </Button>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/login">
                  <Button className="font-sora" variant="ghost">Login</Button>
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </Glow>
    </GlowArea >
  );
};

export default Navigation;