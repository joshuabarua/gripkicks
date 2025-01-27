import React from 'react';
import Footer from "./footer/page";
import Navigation from "./navigation/page";
// import { supabase } from '../../../../src/supabaseClient';

export default function Home() {

// async function fetchData() {
//     const { data, error } = await supabase
//         .from('users')
//         .select('*');

//     if (error) {
//         console.error('Error fetching data:', error);
//     } else {
//         console.log('Data:', data);
//     }
// }
// fetchData();

  return (
    <div>

      <Navigation />
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <div className="flex flex-col items-center justify-center min-h-screen ">
            <h1 className="text-4xl font-bold mb-4">Welcome to GripKicks</h1>
            <p className="text-lg text-center max-w-md">
              We help you find the right fit based on our community of climbers and their shoe fit preferences. Discover the best climbing shoes tailored to your unique foot profile and climbing needs.
            </p>

          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
