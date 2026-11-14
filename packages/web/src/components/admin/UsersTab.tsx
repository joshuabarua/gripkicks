"use client";

import { useState } from "react";
import type { Doc } from "convex/_generated/dataModel";
import type { PaginationStatus } from "convex/react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Search } from "lucide-react";

interface UsersTabProps {
  users: Doc<"users">[];
  usersStatus: PaginationStatus;
  loadMoreUsers: (numItems: number) => void;
}

export function UsersTab({ users, usersStatus, loadMoreUsers }: UsersTabProps) {
  const [userSearchTerm, setUserSearchTerm] = useState("");

  const filteredUsers =
    users?.filter(
      (user) =>
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()),
    ) || [];

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="text-white/60">
          {filteredUsers.length} users in database
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search users..."
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-hidden focus:ring-2 focus:ring-white/30"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/20 text-xs uppercase tracking-wide text-white/60">
              <th className="text-left py-2 pr-3 font-medium">Avatar</th>
              <th className="text-left py-2 pr-3 font-medium">Name</th>
              <th className="text-left py-2 pr-3 font-medium">Email</th>
              <th className="text-left py-2 pr-3 font-medium">
                Foot Shape
              </th>
              <th className="text-left py-2 pr-3 font-medium">
                Foot Volume
              </th>
              <th className="text-left py-2 pr-3 font-medium">Admin</th>
              <th className="text-left py-2 pr-3 font-medium">
                Onboarded
              </th>
              <th className="text-left py-2 pr-3 font-medium">
                Verified
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user._id}
                className="border-b border-white/10 hover:bg-white/5"
              >
                <td className="py-2 pr-3">
                  <UserAvatar
                    userId={user._id}
                    name={user.name ?? null}
                    email={user.email}
                    className="w-8 h-8 rounded-full"
                    size={64}
                  />
                </td>
                <td className="py-2 pr-3 text-white">
                  {user.name || "-"}
                </td>
                <td className="py-2 pr-3 text-white/80">{user.email}</td>
                <td className="py-2 pr-3 text-white/60">
                  {user.footShape || "-"}
                </td>
                <td className="py-2 pr-3 text-white/60">
                  {user.footVolume || "-"}
                </td>
                <td className="py-2 pr-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${user.isAdmin ? "bg-green-600/20 text-green-400" : "bg-white/10 text-white/50"}`}
                  >
                    {user.isAdmin ? "Yes" : "No"}
                  </span>
                </td>
                <td className="py-2 pr-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${user.onboardingComplete ? "bg-blue-600/20 text-blue-400" : "bg-white/10 text-white/50"}`}
                  >
                    {user.onboardingComplete ? "Yes" : "No"}
                  </span>
                </td>
                <td className="py-2 pr-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${user.emailVerified ? "bg-green-600/20 text-green-400" : "bg-yellow-600/20 text-yellow-400"}`}
                  >
                    {user.emailVerified ? "Yes" : "No"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(usersStatus === "CanLoadMore" ||
        usersStatus === "LoadingMore") && (
          <div className="flex justify-center py-4">
            <button
              onClick={() => loadMoreUsers(50)}
              disabled={usersStatus === "LoadingMore"}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {usersStatus === "LoadingMore"
                ? "Loading..."
                : "Load more users"}
            </button>
          </div>
        )}
    </>
  );
}
