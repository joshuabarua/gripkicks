"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import type { PaginationStatus } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { PaginatedList } from "@/components/ui/PaginatedList";
import { LoadingBar } from "@/components/ui/loading";
import { AddShoeForm } from "@/components/admin/AddShoeForm";
import { ShoeBackfillControls } from "@/components/admin/ShoeBackfillControls";
import {
  ShoeEditRow,
  type EditingShoe,
  type Shoe,
} from "@/components/admin/ShoeEditRow";
import { Plus, Search } from "lucide-react";

interface ShoeCatalogTabProps {
  shoes: Shoe[];
  shoesStatus: PaginationStatus;
  loadMoreShoes: (numItems: number) => void;
  searchTerm: string;
  onSearchTermChange: (searchTerm: string) => void;
  brandFilter: string;
  onBrandFilterChange: (brand: string) => void;
}

export function ShoeCatalogTab({
  shoes,
  shoesStatus,
  loadMoreShoes,
  searchTerm,
  onSearchTermChange,
  brandFilter,
  onBrandFilterChange,
}: ShoeCatalogTabProps) {
  const [editingId, setEditingId] = useState<Id<"shoes"> | null>(null);
  const [editForm, setEditForm] = useState<EditingShoe | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const uniqueBrands = useQuery(api.shoes.listBrands, {}) ?? [];
  const rubberTechnologies = useQuery(api.rubberTechnologies.list);

  const handleEdit = (shoe: Shoe) => {
    setEditingId(shoe._id);
    setEditForm({ ...shoe });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="text-white/60">
          {shoes.length} shoes loaded
        </div>
        <div className="flex items-center gap-4">
          <ShoeBackfillControls />
          <select
            value={brandFilter}
            onChange={(e) => onBrandFilterChange(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-hidden focus:ring-2 focus:ring-white/30"
          >
            <option value="all">All Brands</option>
            {uniqueBrands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Search shoes..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-hidden focus:ring-2 focus:ring-white/30"
            />
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Shoe
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 min-h-[60vh]">
        <AddShoeForm
          open={showAddForm}
          onClose={() => setShowAddForm(false)}
          brands={uniqueBrands}
          rubberTechnologies={rubberTechnologies}
        />

        <PaginatedList
          items={shoes}
          renderItem={(shoe) => {
            const isEditingCurrentShoe =
              editingId === shoe._id && editForm?._id === shoe._id;

            return (
              <ShoeEditRow
                key={shoe._id}
                shoe={shoe}
                editForm={isEditingCurrentShoe ? editForm : null}
                setEditForm={setEditForm}
                onEdit={() => handleEdit(shoe)}
                onStopEditing={() => {
                  setEditingId(null);
                  setEditForm(null);
                }}
                rubberTechnologies={rubberTechnologies}
              />
            );
          }}
          className="flex-1 min-h-0 space-y-2"
          hasMore={shoesStatus === "CanLoadMore"}
          isLoading={shoesStatus === "LoadingMore"}
          onEndReached={() => loadMoreShoes(50)}
          loadingIndicator={
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-brand-putty text-sm">
                <LoadingBar size="sm" />
                <span>Loading more shoes...</span>
              </div>
            </div>
          }
          completedIndicator={
            <span className="text-white/60">
              All {shoes.length} shoes loaded
            </span>
          }
        />
      </div>
    </>
  );
}
