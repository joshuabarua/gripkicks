"use client"

import React, { useEffect, useState } from 'react';
import Footer from "./footer/page";
import Navigation from "./navigation/page";
import { User, Users } from '../../types/user';


export default function Home() {

  const [users, setUsers] = useState<User[]>([]);

console.log("Data:", users);

  useEffect(() => {
    const fetchUsers = async (): Promise<void> => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>

      <Navigation />
      <div className="flex items-center justify-center min-h-screen gap-8 sm:p-20">
        <main className="flex flex-col gap-4 row-start-2 items-center sm:items-start">
          <div className="flex flex-col items-center justify-center ">
            <h1 className="text-4xl font-bold mb-4">Welcome to GripKicks</h1>
            <p className="text-lg text-center max-w-md">
              We help you find the right fit based on our community of climbers and their shoe fit preferences. Discover the best climbing shoes tailored to your unique foot profile and climbing needs.
            </p>

            <div>
      <h1>Users List</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
