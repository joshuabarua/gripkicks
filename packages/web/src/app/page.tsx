"use client"

import React, { useEffect, useState } from 'react';
import { User, } from '../../types/user';
import useSessionStore from '@/store/sessionStore';
import dynamic from 'next/dynamic';


export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const sessionData = useSessionStore((state) => state.sessionData);
  console.log('Session Data:', sessionData);
  const Scene = dynamic(() => import('@/components/3d/Scene'), { ssr: false });



  return (
    <main className="flex flex-col gap-4 row-start-2 items-center sm:items-start">
      <div className='relative h-screen w-screen flex items-center justify-center flex-col'>
        <Scene />
      </div>
    </main>

  );
}
