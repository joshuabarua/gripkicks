import React from 'react';
import Link from 'next/link';

const Navigation = () => {
  return (
    <nav className="bg-gray-800 p-2 w-full">
      <ul className="flex justify-around">
        <li>
          <Link href="/" className="text-white hover:text-gray-400">
            Home
          </Link>
        </li>
        <li>
          <Link href="/foot-profile" className="text-white hover:text-gray-400">
            Foot Profile
          </Link>
        </li>
        <li>
          <Link href="/recommendations" className="text-white hover:text-gray-400">
            Recommendations
          </Link>
        </li>
        <li>
          <Link href="/comfort-ranking" className="text-white hover:text-gray-400">
            Comfort Ranking
          </Link>
        </li>
        <li>
          <Link href="/user-account" className="text-white hover:text-gray-400">
            User Account
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;