import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserCircle2 } from 'lucide-react';
import { useAuth } from '@/context/useAuthStore';
import type { User } from '@/types/user';

const Navigation: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  return (
    <nav className="bg-transparent p-2 w-full">
      <ul className="flex justify-between text-foreground">
        <li>
          <Link href="/">
            <Button variant="ghost" className="font-basteleur">Grip Kicks</Button>
          </Link>
        </li>
        <li>
          <Link href="/comfort-ranking">
            <Button className="font-sora" variant="ghost">Comfort Ranking</Button>
          </Link>
        </li>
        <li>
          {user ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center focus:outline-none"
                aria-label="User menu"
              >
                <UserCircle2 size={32} className="text-white" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/shoe-stash"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer"
                  >
                    Shoe Stash
                  </Link>
                  <Link
                    href="/foot-checker"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer"
                  >
                    Foot Checker
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-gray-800 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login">
              <Button className="font-sora" variant="outline">Login</Button>
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;