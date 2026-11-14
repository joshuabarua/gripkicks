"use client";

import { useDeferredValue, useState, useEffect } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { LoadingBar } from "@/components/ui/loading";
import { BacklogManager } from "@/components/admin/BacklogManager";
import { ShoeCatalogTab } from "@/components/admin/ShoeCatalogTab";
import { UsersTab } from "@/components/admin/UsersTab";
import { Footprints, Users, ListTodo } from "lucide-react";

export default function AdminDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

  const [activeTab, setActiveTab] = useState<"shoes" | "users" | "backlog">(
    "shoes",
  );
  // The tab buttons show shoe and user counts, so both lists load here and
  // the shoe filters live here too.
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const {
    results: shoes,
    status: shoesStatus,
    loadMore: loadMoreShoes,
  } = usePaginatedQuery(
    api.shoes.searchCatalog,
    isAdmin
      ? {
        ...(deferredSearchTerm.trim() ? { searchTerm: deferredSearchTerm } : {}),
        ...(brandFilter !== "all" ? { brand: brandFilter } : {}),
      }
      : "skip",
    { initialNumItems: 50 },
  );
  const {
    results: users,
    status: usersStatus,
    loadMore: loadMoreUsers,
  } = usePaginatedQuery(
    api.users.list,
    isAdmin ? {} : "skip",
    { initialNumItems: 50 },
  );

  useEffect(() => {
    if (!isPending && (!session?.user || !isAdmin)) {
      router.push("/", { transitionTypes: ["page-nav"] });
    }
  }, [session, isPending, router, isAdmin]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingBar size="lg" />
      </div>
    );
  }

  if (!session?.user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="lab-title text-fluid-2xl mb-2 text-brand-chalk">Access Denied</h1>
          <p className="text-white/60">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="lab-title text-fluid-2xl text-brand-chalk">Admin Dashboard</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("shoes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === "shoes"
                ? "bg-accent text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
          >
            <Footprints className="w-4 h-4" />
            Shoes ({shoes.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === "users"
                ? "bg-accent text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
          >
            <Users className="w-4 h-4" />
            Users ({users?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("backlog")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === "backlog"
                ? "bg-accent text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
          >
            <ListTodo className="w-4 h-4" />
            Backlog
          </button>
        </div>

        {activeTab === "shoes" && (
          <ShoeCatalogTab
            shoes={shoes}
            shoesStatus={shoesStatus}
            loadMoreShoes={loadMoreShoes}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            brandFilter={brandFilter}
            onBrandFilterChange={setBrandFilter}
          />
        )}

        {activeTab === "users" && (
          <UsersTab
            users={users}
            usersStatus={usersStatus}
            loadMoreUsers={loadMoreUsers}
          />
        )}

        {activeTab === "backlog" && <BacklogManager />}
      </div>
    </div>
  );
}
