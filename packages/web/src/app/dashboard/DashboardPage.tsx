"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useLoading } from "@/contexts/LoadingContext";
import ShoeImage from "@/components/ShoeImage";
import { useFootProfileStore } from "@/stores/footProfileStore";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [sessionTimedOut, setSessionTimedOut] = useState(false);
  const { profile: footProfile } = useFootProfileStore();
  const { showLoader, hideLoader } = useLoading();

  useEffect(() => {
    if (!isPending) return;

    const timer = setTimeout(() => {
      setSessionTimedOut(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isPending]);

  useEffect(() => {
    if (isPending || session?.user) return;

    router.replace("/auth/login");
  }, [isPending, router, session?.user]);

  const userData = useQuery(
    api.users.findByBetterAuthId,
    session?.user ? { betterAuthId: session.user.id } : "skip",
  );
  const userStashData = useQuery(
    api.stash.getUserStash,
    userData ? { userId: userData._id } : "skip",
  );

  const isLoadingData = userStashData === undefined || userData === undefined;

  // Move useMemo before early returns to satisfy Rules of Hooks
  const userShoes = useMemo(() => userStashData ?? [], [userStashData]);

  useEffect(() => {
    if ((isPending && !sessionTimedOut) || isLoadingData) {
      showLoader("dashboard");
    } else {
      hideLoader("dashboard");
    }
  }, [isPending, sessionTimedOut, isLoadingData, showLoader, hideLoader]);

  if (!isPending && !session?.user) return null;

  const firstName = (userData?.name || session?.user?.name || "Climber").split(
    " ",
  )[0];
  const avgComfort =
    userShoes.length > 0
      ? (
        userShoes.reduce((acc, s) => acc + (s.comfortScore || 0), 0) /
        userShoes.length
      ).toFixed(1)
      : "—";
  const favCount = userShoes.filter((s) => s.isFavourite).length;
  const footShape = footProfile?.shape || userData?.footShape;
  const footVolume = footProfile?.volume || userData?.footVolume;
  const hasFootProfile = !!(footShape && footVolume);

  return (
    <main className="min-h-screen bg-black text-brand-chalk overflow-x-hidden">
      <section className="px-6 md:px-12 lg:px-16 py-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 mb-12"
        >
          <div>
            <h1 className="font-ball-pill text-5xl md:text-7xl lg:text-8xl leading-[0.9] text-brand-chalk">
              Hey {firstName},<br />
              <span className="text-brand-red">ready to climb?</span>
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/stash")}
            className="group relative font-ball-pill text-2xl text-brand-red hover:text-white transition-colors duration-500 shrink-0"
          >
            <span className="relative">
              View Collection
              <span className="absolute left-0 -bottom-1 h-px w-full origin-left scale-x-0 bg-brand-red group-hover:scale-x-100 transition-transform duration-500 ease-out" />
            </span>
          </motion.button>
        </motion.div>

        <div className="w-full h-px bg-white/[0.06] mb-12" />

        <div className="grid grid-cols-12 gap-px bg-white/[0.06] mb-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="col-span-12 md:col-span-4 row-span-2 bg-black p-8 flex flex-col justify-between min-h-[280px]"
          >
            <div>
              <div className="font-ball-pill text-7xl text-brand-chalk leading-none">
                {userShoes.length}
              </div>
              <p className="font-sora text-brand-putty/40 text-sm mt-2">
                Shoes in your collection
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="col-span-6 md:col-span-4 bg-black p-8 flex flex-col justify-between min-h-[140px]"
          >
            <div className="font-ball-pill text-4xl text-brand-chalk">
              {favCount}
            </div>
            <p className="font-sora text-brand-putty/40 text-xs mt-1">
              Favorites
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="col-span-6 md:col-span-4 bg-black p-8 flex flex-col justify-between min-h-[140px]"
          >
            <div className="font-ball-pill text-4xl text-brand-chalk">
              {avgComfort}
            </div>
            <p className="font-sora text-brand-putty/40 text-xs mt-1">
              Avg Comfort
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            onClick={() => router.push("/footscan")}
            className="col-span-12 md:col-span-8 bg-black p-8 flex items-center justify-between cursor-pointer hover:bg-brand-surface transition-colors duration-500 group relative overflow-hidden min-h-[140px]"
          >
            <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-red origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
            <div className="relative">
              {hasFootProfile ? (
                <>
                  <div className="font-ball-pill text-2xl text-brand-chalk group-hover:text-brand-red transition-colors duration-500 capitalize">
                    {footShape} <span className="text-brand-putty/30">/</span>{" "}
                    {footVolume} volume
                  </div>
                  <p className="font-sora text-brand-putty/40 text-xs mt-0.5">
                    Your foot profile — tap to update
                  </p>
                </>
              ) : (
                <>
                  <div className="font-ball-pill text-xl text-brand-red">
                    Set up your foot profile
                  </div>
                  <p className="font-sora text-brand-putty/40 text-xs mt-0.5">
                    Takes 30 seconds — unlocks better matches
                  </p>
                </>
              )}
            </div>
            <span className="relative font-sora text-[10px] uppercase tracking-[0.35em] text-brand-putty/40 group-hover:text-brand-red transition-colors duration-500 w-fit">
              Open
              <span className="absolute left-0 -bottom-1 h-px w-full origin-left scale-x-0 bg-brand-red group-hover:scale-x-100 transition-transform duration-500 ease-out" />
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="w-full h-px bg-white/[0.06] mb-12" />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <h2 className="font-ball-pill text-4xl md:text-5xl leading-none text-brand-chalk">
              Where to next?
            </h2>
            <button
              onClick={() => router.push("/matcher")}
              className="group relative font-ball-pill text-xl text-brand-red hover:text-white transition-colors duration-500"
            >
              <span className="relative">
                Find my shoe
                <span className="absolute left-0 -bottom-1 h-px w-full origin-left scale-x-0 bg-brand-red group-hover:scale-x-100 transition-transform duration-500 ease-out" />
              </span>
            </button>
          </div>

          <div className="grid grid-cols-12 gap-px bg-white/[0.06]">
            <motion.div
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              onClick={() => router.push("/stash")}
              className="col-span-12 md:col-span-8 bg-brand-red p-8 flex flex-col justify-between cursor-pointer group relative overflow-hidden min-h-[180px]"
            >
              <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-black origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
              <h3 className="font-ball-pill text-4xl md:text-5xl text-black group-hover:text-white transition-colors duration-500">
                Shoe Sanctuary
              </h3>
              <p className="relative font-sora text-black/60 max-w-md text-sm">
                Your full climbing shoe collection
              </p>
            </motion.div>

            <motion.div
              whileHover={{ backgroundColor: "rgba(26,26,26,1)" }}
              onClick={() => router.push("/matcher?tab=mate")}
              className="monolith-card col-span-6 md:col-span-4 bg-black p-6 flex flex-col justify-between cursor-pointer group relative overflow-hidden transition-colors duration-500 min-h-[180px]"
            >
              <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-red origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
              <div className="relative">
                <h4 className="font-ball-pill text-xl text-brand-chalk mb-1 group-hover:text-brand-red transition-colors duration-500">
                  Sole Mate
                </h4>
                <p className="font-sora text-brand-putty/40 text-xs">
                  Discover shoes made for you
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ backgroundColor: "rgba(26,26,26,1)" }}
              onClick={() => router.push("/footscan")}
              className="monolith-card col-span-6 md:col-span-4 bg-black p-6 flex flex-col justify-between cursor-pointer group relative overflow-hidden transition-colors duration-500 min-h-[180px]"
            >
              <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-red origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
              <div className="relative">
                <h4 className="font-ball-pill text-xl text-brand-chalk mb-1 group-hover:text-brand-red transition-colors duration-500">
                  Foot Lab
                </h4>
                <p className="font-sora text-brand-putty/40 text-xs">
                  Update your foot profile
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ backgroundColor: "rgba(26,26,26,1)" }}
              onClick={() => router.push("/matcher")}
              className="monolith-card col-span-6 md:col-span-4 bg-black p-6 flex flex-col justify-between cursor-pointer group relative overflow-hidden transition-colors duration-500 min-h-[180px]"
            >
              <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-red origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
              <div className="relative">
                <h4 className="font-ball-pill text-xl text-brand-chalk mb-1 group-hover:text-brand-red transition-colors duration-500">
                  Matcher
                </h4>
                <p className="font-sora text-brand-putty/40 text-xs">
                  Visual shoe matcher
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {userShoes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="w-full h-px bg-white/[0.06] mb-12" />

            <div className="flex items-end justify-between mb-8">
              <h2 className="font-ball-pill text-4xl md:text-5xl leading-none text-brand-chalk">
                Recent Shoes
              </h2>
              {userShoes.length > 3 && (
                <button
                  onClick={() => router.push("/stash")}
                  className="group relative font-ball-pill text-xl text-brand-red hover:text-white transition-colors duration-500"
                >
                  <span className="relative">
                    View all
                    <span className="absolute left-0 -bottom-1 h-px w-full origin-left scale-x-0 bg-brand-red group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                  </span>
                </button>
              )}
            </div>
            <div className="border border-white/[0.06]">
              <div className="divide-y divide-white/[0.06]">
                {userShoes.slice(0, 3).map((shoe, index) => {
                  const details = shoe.shoe;
                  const brand = details?.brand ?? "Unknown Brand";
                  const name =
                    details?.modelName ?? details?.name ?? "Unknown Shoe";
                  const imageUrl = details?.imageUrl;
                  const slug = details?.slug;
                  const gender = details?.gender;

                  return (
                    <motion.div
                      key={shoe._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.08 }}
                      onClick={() => router.push("/stash")}
                      className="redline-accent flex items-center justify-between p-5 hover:bg-brand-surface cursor-pointer transition-colors duration-500 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-brand-surface overflow-hidden flex-shrink-0">
                          <ShoeImage
                            brand={brand}
                            shoeName={name}
                            className="p-2"
                            transformation={[
                              {
                                height: 56,
                                width: 56,
                                crop: "at_max",
                                cropMode: "pad_resize",
                                format: "png",
                                quality: 75,
                              },
                            ]}
                            {...(imageUrl ? { imageUrl } : {})}
                            {...(slug ? { slug } : {})}
                            {...(gender ? { gender } : {})}
                          />
                        </div>
                        <div>
                          <h3 className="font-sora font-medium text-brand-chalk group-hover:text-brand-red transition-colors duration-500">
                            {name}
                          </h3>
                          <p className="font-sora text-[10px] text-brand-putty/30">
                            {brand}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-brand-red fill-brand-red" />
                            <span className="font-sora text-xs text-brand-putty/50">
                              {shoe.comfortScore || 0}
                            </span>
                          </div>
                          <span className="font-sora text-[10px] text-brand-putty/30">
                            Comfort
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {userShoes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-16 text-center"
          >
            <div className="w-full h-px bg-white/[0.06] mb-16" />

            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-3 h-3 bg-brand-red rounded-full mx-auto mb-8"
            />
            <h3 className="font-ball-pill text-4xl text-brand-chalk mb-3">
              NO SHOES YET
            </h3>
            <p className="font-sora text-brand-putty/40 mb-8 max-w-sm mx-auto">
              Add your shoes so we can start figuring out what fits you best
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/stash")}
              className="border border-brand-red text-brand-red font-ball-pill text-lg px-8 py-3 hover:bg-brand-red hover:text-black transition-all duration-500"
            >
              ADD YOUR FIRST SHOE
            </motion.button>
          </motion.div>
        )}
      </section>
    </main>
  );
}
