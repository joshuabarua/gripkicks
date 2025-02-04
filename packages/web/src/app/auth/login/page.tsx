'use client'

import { LoginForm } from "@/components/login-form"
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { User } from "../../../../types/user";
import { useRouter } from 'next/navigation'; 
import  useSessionStore from "@/store/sessionStore";

export default function Login() {  
  const setSessionData = useSessionStore((state: { setSessionData: any; }) => state.setSessionData);


  // const router = useRouter();

  // const mutation = useMutation({
  //   mutationFn: async ({ email, password }: { email: string; password: string }) => {
  //     const response = await fetch('http://localhost:3001/login', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Login failed');
  //     }

  //     return response.json();
  //   },
  //   onSuccess: (data: { access_token: User; refresh_token: any; }) => {
  //     console.log('Session Data:', data);
  //     setSessionData(data); 
  //     localStorage.setItem('sessionData', JSON.stringify(data));

  //     router.push('/');

  //   },
  //   onError: (error: any) => {
  //     console.error('Error logging in:', error);
  //   },
  // });

  // const handleSubmit = (event: React.FormEvent) => {
  //   event.preventDefault();
  //   mutation.mutate({ email, password });
  // };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
