"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import ShoeImage from "@/components/ShoeImage";
import { PaginatedList } from "@/components/ui/PaginatedList";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { BacklogManager } from "@/components/admin/BacklogManager";
import ShoeImageUpload from "@/components/ShoeImageUpload";
import {
  Pencil,
  Trash2,
  X,
  Check,
  Plus,
  Search,
  Footprints,
  Users,
  ListTodo,
} from "lucide-react";

type RubberTechnology = {
  _id: Id<"rubberTechnologies">;
  brand: string;
  compound: string;
  stickiness: string;
  durability: string;
};

type Shoe = {
  _id: Id<"shoes">;
  name: string;
  brand: string;
  modelName?: string;
  variantLabel?: string;
  parentModelId?: Id<"shoes">;
  imageUrl?: string;
  slug?: string;
  gender?: "men" | "women" | "kids" | "unisex";
  aggressiveness: string;
  stiffness: string;
  climbingDiscipline: string;
  volume: string;
  rubberTechnologyId?: Id<"rubberTechnologies">;
  rubberTechnology?: RubberTechnology | null;
  brandAggressiveness?: number;
  brandStiffness?: number;
};

type EditingShoe = Partial<Shoe> & { _id: Id<"shoes"> };

export default function AdminDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const shoes = useQuery(api.shoes.listAll);
  const updateShoe = useMutation(api.shoes.update).withOptimisticUpdate(
    (localStore, args) => {
      const shoe = localStore
        .getQuery(api.shoes.listAll)
        ?.find((s: Shoe) => s._id === args.id);
      if (shoe) {
        Object.assign(shoe, args);
      }
    },
  );
  const deleteShoe = useMutation(api.shoes.remove);
  const createShoe = useMutation(api.shoes.create);
  const backfillVariantMetadata = useMutation(
    api.shoes.backfillVariantMetadata,
  );
  const backfillMissingRubberTechnology = useMutation(
    api.shoes.backfillMissingRubberTechnology,
  );

  const [editingId, setEditingId] = useState<Id<"shoes"> | null>(null);
  const [editForm, setEditForm] = useState<EditingShoe | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingImageId, setEditingImageId] = useState<Id<"shoes"> | null>(
    null,
  );
  const [editingImageUrl, setEditingImageUrl] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newShoe, setNewShoe] = useState({
    name: "",
    brand: "",
    modelName: "",
    variantLabel: "",
    imageUrl: "",
    slug: "",
    gender: "unisex" as const,
    aggressiveness: "moderate",
    stiffness: "medium",
    climbingDiscipline: "sport",
    volume: "medium",
    rubberTechnologyId: undefined as Id<"rubberTechnologies"> | undefined,
    brandAggressiveness: undefined as number | undefined,
    brandStiffness: undefined as number | undefined,
  });
  const [activeTab, setActiveTab] = useState<"shoes" | "users" | "backlog">(
    "shoes",
  );
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [isBackfillingVariants, setIsBackfillingVariants] = useState(false);
  const [backfillResult, setBackfillResult] = useState<string | null>(null);
  const [isBackfillingRubberTechnology, setIsBackfillingRubberTechnology] =
    useState(false);
  const [rubberBackfillResult, setRubberBackfillResult] = useState<
    string | null
  >(null);

  const uniqueBrands = [...new Set(shoes?.map((s) => s.brand) || [])].sort();

  const users = useQuery(api.users.list);
  const rubberTechnologies = useQuery(api.rubberTechnologies.list);
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;
  const shouldLoadMissingRubberTechnologyReport =
    !isPending && !!session?.user && !!isAdmin;
  const missingRubberTechnologyReport = useQuery(
    api.shoes.getMissingRubberTechnologyReport,
    shouldLoadMissingRubberTechnologyReport ? {} : "skip",
  );

  useEffect(() => {
    if (!isPending && (!session?.user || !isAdmin)) {
      router.push("/");
    }
  }, [session, isPending, router, isAdmin]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  if (!session?.user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-white/60">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  const filteredShoes =
    shoes?.filter((shoe) => {
      const matchesSearch =
        shoe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shoe.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = brandFilter === "all" || shoe.brand === brandFilter;
      const matchesLaSportiva = shoe.brand === "La Sportiva";
      return matchesSearch && matchesBrand && matchesLaSportiva;
    }) || [];

  const filteredUsers =
    users?.filter(
      (user) =>
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()),
    ) || [];

  const handleEdit = (shoe: Shoe) => {
    setEditingId(shoe._id);
    setEditForm({ ...shoe });
  };

  const requireImageOrSlug = (image?: string | null, slug?: string | null) => {
    return Boolean(image?.trim()) || Boolean(slug?.trim());
  };

  const handleDelete = async (id: Id<"shoes">) => {
    if (confirm("Are you sure you want to delete this shoe?")) {
      await deleteShoe({ id });
    }
  };

  const handleCreate = async () => {
    if (!requireImageOrSlug(newShoe.imageUrl, newShoe.slug)) {
      alert(
        "Please provide either an image URL or a slug before creating a shoe.",
      );
      return;
    }

    if (!newShoe.rubberTechnologyId) {
      alert("Please select a rubber technology before creating a shoe.");
      return;
    }

    const rubberTechnologyId = newShoe.rubberTechnologyId;
    const imageUrl = newShoe.imageUrl.trim();
    const slug = newShoe.slug.trim();
    const modelName = newShoe.modelName.trim();
    const variantLabel = newShoe.variantLabel.trim();

    const createPayload = {
      name: newShoe.name.trim(),
      brand: newShoe.brand.trim(),
      aggressiveness: newShoe.aggressiveness,
      stiffness: newShoe.stiffness,
      climbingDiscipline: newShoe.climbingDiscipline,
      volume: newShoe.volume,
      rubberTechnologyId,
      gender: newShoe.gender,
      ...(imageUrl ? { imageUrl } : {}),
      ...(slug ? { slug } : {}),
      ...(modelName ? { modelName } : {}),
      ...(variantLabel ? { variantLabel } : {}),
    };

    await createShoe(createPayload);
    setShowAddForm(false);
    setNewShoe({
      name: "",
      brand: "",
      modelName: "",
      variantLabel: "",
      imageUrl: "",
      slug: "",
      gender: "unisex",
      aggressiveness: "moderate",
      stiffness: "medium",
      climbingDiscipline: "sport",
      volume: "medium",
      rubberTechnologyId: rubberTechnologies?.[0]?._id,
      brandAggressiveness: undefined,
      brandStiffness: undefined,
    });
  };

  const handleBackfillVariants = async () => {
    try {
      setIsBackfillingVariants(true);
      setBackfillResult(null);
      const result = await backfillVariantMetadata({});
      setBackfillResult(`Backfilled ${result.updatedCount} shoes.`);
    } catch {
      setBackfillResult("Backfill failed. Please try again.");
    } finally {
      setIsBackfillingVariants(false);
    }
  };

  const handleBackfillRubberTechnology = async () => {
    try {
      setIsBackfillingRubberTechnology(true);
      setRubberBackfillResult(null);
      const result = await backfillMissingRubberTechnology({});

      if (result.skipped.length > 0) {
        setRubberBackfillResult(
          `Backfilled ${result.updatedCount} shoes. ${result.skipped.length} still need manual review.`,
        );
        return;
      }

      setRubberBackfillResult(
        `Backfilled ${result.updatedCount} shoes missing rubber technology.`,
      );
    } catch {
      setRubberBackfillResult(
        "Rubber technology backfill failed. Please try again.",
      );
    } finally {
      setIsBackfillingRubberTechnology(false);
    }
  };

  const genderOptions = ["men", "women", "kids", "unisex"];
  const aggressivenessOptions = ["flat", "moderate", "aggressive"];
  const stiffnessOptions = ["soft", "medium", "stiff"];
  const disciplineOptions = [
    "gym",
    "sport",
    "bouldering",
    "trad",
    "competition",
    "all-around",
  ];
  const volumeOptions = ["low", "medium", "high"];

  return (
    <div className="min-h-screen bg-background p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("shoes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "shoes"
                ? "bg-accent text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            <Footprints className="w-4 h-4" />
            Shoes ({shoes?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "users"
                ? "bg-accent text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            <Users className="w-4 h-4" />
            Users ({users?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("backlog")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "backlog"
                ? "bg-accent text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            <ListTodo className="w-4 h-4" />
            Backlog
          </button>
        </div>

        {activeTab === "shoes" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-white/60">
                {filteredShoes.length} shoes in database
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <button
                    onClick={handleBackfillVariants}
                    disabled={isBackfillingVariants}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {isBackfillingVariants
                      ? "Backfilling..."
                      : "Backfill Variants"}
                  </button>
                  {backfillResult && (
                    <div className="mt-1 text-xs text-white/60">
                      {backfillResult}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <button
                    onClick={handleBackfillRubberTechnology}
                    disabled={
                      isBackfillingRubberTechnology ||
                      !missingRubberTechnologyReport?.length
                    }
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {isBackfillingRubberTechnology
                      ? "Backfilling Rubber..."
                      : `Backfill Rubber (${missingRubberTechnologyReport?.length || 0})`}
                  </button>
                  {rubberBackfillResult && (
                    <div className="mt-1 text-xs text-white/60 text-right max-w-xs">
                      {rubberBackfillResult}
                    </div>
                  )}
                </div>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
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
              {showAddForm && (
                <div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                  onClick={() => setShowAddForm(false)}
                >
                  <div
                    className="bg-zinc-900 p-6 rounded-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h2 className="text-xl font-bold text-white mb-4">
                      Add New Shoe
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white/70 text-sm mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Solution"
                          value={newShoe.name}
                          onChange={(e) =>
                            setNewShoe({ ...newShoe, name: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-1">
                          Brand *
                        </label>
                        <select
                          value={newShoe.brand}
                          onChange={(e) =>
                            setNewShoe({ ...newShoe, brand: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        >
                          <option value="">Select brand...</option>
                          {uniqueBrands.map((brand) => (
                            <option key={brand} value={brand}>
                              {brand}
                            </option>
                          ))}
                          <option value="__new">+ Add new brand</option>
                        </select>
                        {newShoe.brand === "__new" && (
                          <input
                            type="text"
                            placeholder="Enter new brand name"
                            onChange={(e) =>
                              setNewShoe({ ...newShoe, brand: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white mt-2"
                          />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/70 text-sm mb-1">
                            Model Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Drago"
                            value={newShoe.modelName}
                            onChange={(e) =>
                              setNewShoe({
                                ...newShoe,
                                modelName: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-white/70 text-sm mb-1">
                            Variant Label
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. LV"
                            value={newShoe.variantLabel}
                            onChange={(e) =>
                              setNewShoe({
                                ...newShoe,
                                variantLabel: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-1">
                          Image URL
                        </label>
                        <input
                          type="text"
                          placeholder="https://ik.imagekit.io/..."
                          value={newShoe.imageUrl}
                          onChange={(e) =>
                            setNewShoe({ ...newShoe, imageUrl: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-1">
                          Slug
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. la_sportiva/solution-men"
                          value={newShoe.slug}
                          onChange={(e) =>
                            setNewShoe({ ...newShoe, slug: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        />
                        <p className="text-[11px] text-white/40 mt-1 font-mono">
                          Used when no direct image URL is set.
                        </p>
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-1">
                          Rubber Technology
                        </label>
                        <select
                          value={newShoe.rubberTechnologyId || ""}
                          onChange={(e) =>
                            setNewShoe({
                              ...newShoe,
                              rubberTechnologyId:
                                (e.target.value as Id<"rubberTechnologies">) ||
                                undefined,
                            })
                          }
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        >
                          <option value="">Select rubber technology...</option>
                          {rubberTechnologies?.map((rubber) => (
                            <option key={rubber._id} value={rubber._id}>
                              {rubber.brand} - {rubber.compound}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/70 text-sm mb-1">
                            Brand Aggressiveness (1–5)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={5}
                            step={1}
                            placeholder="e.g. 4"
                            value={newShoe.brandAggressiveness ?? ""}
                            onChange={(e) =>
                              setNewShoe({
                                ...newShoe,
                                brandAggressiveness: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              })
                            }
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-white/70 text-sm mb-1">
                            Brand Stiffness (1–5)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={5}
                            step={1}
                            placeholder="e.g. 3"
                            value={newShoe.brandStiffness ?? ""}
                            onChange={(e) =>
                              setNewShoe({
                                ...newShoe,
                                brandStiffness: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              })
                            }
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/70 text-sm mb-1">
                            Gender
                          </label>
                          <select
                            value={newShoe.gender}
                            onChange={(e) =>
                              setNewShoe({
                                ...newShoe,
                                gender: e.target.value as typeof newShoe.gender,
                              })
                            }
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          >
                            {genderOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-white/70 text-sm mb-1">
                            Volume
                          </label>
                          <select
                            value={newShoe.volume}
                            onChange={(e) =>
                              setNewShoe({ ...newShoe, volume: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          >
                            {volumeOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/70 text-sm mb-1">
                            Aggressiveness
                          </label>
                          <select
                            value={newShoe.aggressiveness}
                            onChange={(e) =>
                              setNewShoe({
                                ...newShoe,
                                aggressiveness: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          >
                            {aggressivenessOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-white/70 text-sm mb-1">
                            Stiffness
                          </label>
                          <select
                            value={newShoe.stiffness}
                            onChange={(e) =>
                              setNewShoe({
                                ...newShoe,
                                stiffness: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          >
                            {stiffnessOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-1">
                          Climbing Discipline
                        </label>
                        <select
                          value={newShoe.climbingDiscipline}
                          onChange={(e) =>
                            setNewShoe({
                              ...newShoe,
                              climbingDiscipline: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        >
                          {disciplineOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreate}
                        disabled={
                          !newShoe.name ||
                          !newShoe.brand ||
                          newShoe.brand === "__new" ||
                          !newShoe.rubberTechnologyId
                        }
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white rounded-lg"
                      >
                        Create Shoe
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <PaginatedList
                items={filteredShoes}
                renderItem={(shoe) => {
                  const isEditingCurrentShoe =
                    editingId === shoe._id && editForm?._id === shoe._id;
                  const currentEditForm = isEditingCurrentShoe
                    ? editForm
                    : null;

                  return (
                    <div
                      key={shoe._id}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col gap-2 max-h-[175px] overflow-hidden"
                    >
                      {editingImageId === shoe._id ? (
                        <div
                          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                          onClick={() => setEditingImageId(null)}
                        >
                          <div
                            className="bg-zinc-900 p-6 rounded-xl w-full max-w-lg mx-2 max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <h3 className="text-white font-medium mb-4">
                              Edit Shoe Image
                            </h3>

                            <div className="space-y-4">
                              {/* Image Upload Component */}
                              <ShoeImageUpload
                                brand={shoe.brand}
                                shoeName={shoe.name}
                                onUploadSuccess={(url) => {
                                  setEditingImageUrl(url);
                                  // Auto-save when upload is successful
                                  updateShoe({ id: shoe._id, imageUrl: url });
                                  setEditingImageId(null);
                                }}
                                onError={(error) => {
                                  console.error("Image upload failed:", error);
                                }}
                              />

                              {/* Fallback URL input */}
                              <div className="border-t border-white/10 pt-4">
                                <p className="text-white text-sm mb-2">
                                  Or enter image URL manually:
                                </p>
                                <input
                                  type="text"
                                  value={editingImageUrl}
                                  onChange={(e) =>
                                    setEditingImageUrl(e.target.value)
                                  }
                                  placeholder="Image URL"
                                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm mb-3"
                                  autoFocus
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                              <button
                                onClick={() => setEditingImageId(null)}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={async () => {
                                  await updateShoe({
                                    id: shoe._id,
                                    imageUrl: editingImageUrl,
                                  });
                                  setEditingImageId(null);
                                }}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
                              >
                                Save URL
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <div className="flex gap-3 h-full">
                        <div
                          className="rounded-lg overflow-hidden bg-white/10 cursor-pointer hover:ring-2 hover:ring-accent transition-all flex-shrink-0"
                          onClick={() => {
                            setEditingImageId(shoe._id);
                            setEditingImageUrl(shoe.imageUrl || "");
                          }}
                          title="Click to edit image URL"
                        >
                          <ShoeImage
                            brand={shoe.brand}
                            shoeName={shoe.name}
                            className="w-20 h-20"
                            transformation={[
                              {
                                height: 80,
                                width: 80,
                                crop: "at_max",
                                cropMode: "pad_resize",
                                format: "png",
                                quality: 80,
                              },
                            ]}
                            {...(shoe.imageUrl
                              ? { imageUrl: shoe.imageUrl }
                              : {})}
                            {...(shoe.slug ? { slug: shoe.slug } : {})}
                            {...(["men", "women", "kids", "unisex"].includes(
                              (shoe.gender ?? "").toLowerCase(),
                            )
                              ? {
                                  gender: shoe.gender?.toLowerCase() as
                                    | "men"
                                    | "women"
                                    | "kids"
                                    | "unisex",
                                }
                              : {})}
                          />
                        </div>

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm overflow-y-auto">
                          <div>
                            <label className="text-[10px] uppercase tracking-wide text-white/50">
                              Name
                            </label>
                            {isEditingCurrentShoe && currentEditForm ? (
                              <input
                                type="text"
                                value={currentEditForm.name || ""}
                                onChange={(e) =>
                                  setEditForm((prev) =>
                                    prev
                                      ? { ...prev, name: e.target.value }
                                      : prev,
                                  )
                                }
                                className="w-full px-2 py-0.5 bg-white/10 border border-white/20 rounded text-white text-[13px]"
                                autoFocus
                              />
                            ) : (
                              <div className="text-white font-medium">
                                {shoe.name}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-wide text-white/50">
                              Brand
                            </label>
                            {isEditingCurrentShoe && currentEditForm ? (
                              <input
                                type="text"
                                value={currentEditForm.brand || ""}
                                onChange={(e) =>
                                  setEditForm((prev) =>
                                    prev
                                      ? { ...prev, brand: e.target.value }
                                      : prev,
                                  )
                                }
                                className="w-full px-2 py-0.5 bg-white/10 border border-white/20 rounded text-white text-[13px]"
                              />
                            ) : (
                              <div className="text-white/70">{shoe.brand}</div>
                            )}
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-wide text-white/50">
                              Model
                            </label>
                            {isEditingCurrentShoe && currentEditForm ? (
                              <input
                                type="text"
                                value={currentEditForm.modelName || ""}
                                onChange={(e) =>
                                  setEditForm((prev) =>
                                    prev
                                      ? { ...prev, modelName: e.target.value }
                                      : prev,
                                  )
                                }
                                className="w-full px-2 py-0.5 bg-white/10 border border-white/20 rounded text-white text-[13px]"
                              />
                            ) : (
                              <div className="text-white/70">
                                {shoe.modelName}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-wide text-white/50">
                              Variant
                            </label>
                            {isEditingCurrentShoe && currentEditForm ? (
                              <input
                                type="text"
                                value={currentEditForm.variantLabel || ""}
                                onChange={(e) =>
                                  setEditForm((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          variantLabel: e.target.value,
                                        }
                                      : prev,
                                  )
                                }
                                className="w-full px-2 py-0.5 bg-white/10 border border-white/20 rounded text-white text-[13px]"
                              />
                            ) : (
                              <div className="text-white/70">
                                {shoe.variantLabel}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-wide text-white/50">
                              Slug
                            </label>
                            {isEditingCurrentShoe && currentEditForm ? (
                              <input
                                type="text"
                                value={currentEditForm.slug || ""}
                                onChange={(e) =>
                                  setEditForm((prev) =>
                                    prev
                                      ? { ...prev, slug: e.target.value }
                                      : prev,
                                  )
                                }
                                className="w-full px-2 py-0.5 bg-white/10 border border-white/20 rounded text-white text-[13px]"
                              />
                            ) : (
                              <div className="text-white/70 font-mono text-xs">
                                {shoe.slug}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-wide text-white/50">
                              Gender
                            </label>
                            {isEditingCurrentShoe && currentEditForm ? (
                              <select
                                value={currentEditForm.gender || ""}
                                onChange={(e) =>
                                  setEditForm((prev) => {
                                    if (!prev) return prev;

                                    const nextGender = e.target.value
                                      ? (e.target.value as NonNullable<
                                          Shoe["gender"]
                                        >)
                                      : undefined;

                                    return {
                                      ...prev,
                                      ...(nextGender
                                        ? { gender: nextGender }
                                        : {}),
                                    };
                                  })
                                }
                                className="w-full px-2 py-0.5 bg-white/10 border border-white/20 rounded text-white text-[13px]"
                              >
                                <option value="">Select</option>
                                <option value="men">Men</option>
                                <option value="women">Women</option>
                                <option value="kids">Kids</option>
                                <option value="unisex">Unisex</option>
                              </select>
                            ) : (
                              <div className="text-white/70">{shoe.gender}</div>
                            )}
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-wide text-white/50">
                              Aggressiveness
                            </label>
                            {isEditingCurrentShoe && currentEditForm ? (
                              <input
                                type="text"
                                value={currentEditForm.aggressiveness || ""}
                                onChange={(e) =>
                                  setEditForm((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          aggressiveness: e.target.value,
                                        }
                                      : prev,
                                  )
                                }
                                className="w-full px-2 py-0.5 bg-white/10 border border-white/20 rounded text-white text-[13px]"
                              />
                            ) : (
                              <div className="text-white/70">
                                {shoe.aggressiveness}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-wide text-white/50">
                              Stiffness
                            </label>
                            {isEditingCurrentShoe && currentEditForm ? (
                              <input
                                type="text"
                                value={currentEditForm.stiffness || ""}
                                onChange={(e) =>
                                  setEditForm((prev) =>
                                    prev
                                      ? { ...prev, stiffness: e.target.value }
                                      : prev,
                                  )
                                }
                                className="w-full px-2 py-0.5 bg-white/10 border border-white/20 rounded text-white text-[13px]"
                              />
                            ) : (
                              <div className="text-white/70">
                                {shoe.stiffness}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-wide text-white/50">
                              Discipline
                            </label>
                            {isEditingCurrentShoe && currentEditForm ? (
                              <input
                                type="text"
                                value={currentEditForm.climbingDiscipline || ""}
                                onChange={(e) =>
                                  setEditForm((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          climbingDiscipline: e.target.value,
                                        }
                                      : prev,
                                  )
                                }
                                className="w-full px-2 py-0.5 bg-white/10 border border-white/20 rounded text-white text-[13px]"
                              />
                            ) : (
                              <div className="text-white/70">
                                {shoe.climbingDiscipline}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-wide text-white/50">
                              Volume
                            </label>
                            {isEditingCurrentShoe && currentEditForm ? (
                              <input
                                type="text"
                                value={currentEditForm.volume || ""}
                                onChange={(e) =>
                                  setEditForm((prev) =>
                                    prev
                                      ? { ...prev, volume: e.target.value }
                                      : prev,
                                  )
                                }
                                className="w-full px-2 py-0.5 bg-white/10 border border-white/20 rounded text-white text-[13px]"
                              />
                            ) : (
                              <div className="text-white/70">{shoe.volume}</div>
                            )}
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-wide text-white/50">
                              Rubber
                            </label>
                            {isEditingCurrentShoe && currentEditForm ? (
                              <select
                                value={currentEditForm.rubberTechnologyId || ""}
                                onChange={(e) =>
                                  setEditForm((prev) => {
                                    if (!prev) return prev;

                                    const nextRubberTechnologyId = e.target
                                      .value
                                      ? (e.target
                                          .value as Id<"rubberTechnologies">)
                                      : undefined;

                                    return {
                                      ...prev,
                                      ...(nextRubberTechnologyId
                                        ? {
                                            rubberTechnologyId:
                                              nextRubberTechnologyId,
                                          }
                                        : {}),
                                    };
                                  })
                                }
                                className="w-full px-2 py-0.5 bg-white/10 border border-white/20 rounded text-white text-[13px]"
                              >
                                <option value="">Select</option>
                                {rubberTechnologies?.map((rubber) => (
                                  <option key={rubber._id} value={rubber._id}>
                                    {rubber.brand} - {rubber.compound}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="text-white/70">
                                {shoe.rubberTechnology
                                  ? `${shoe.rubberTechnology.brand} ${shoe.rubberTechnology.compound}`
                                  : "Missing rubber technology"}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center">
                            <div className="flex gap-1.5">
                              {isEditingCurrentShoe && currentEditForm ? (
                                <>
                                  <button
                                    onClick={async () => {
                                      if (!currentEditForm.rubberTechnologyId) {
                                        alert(
                                          "Please select a rubber technology before saving.",
                                        );
                                        return;
                                      }

                                      await updateShoe({
                                        id: shoe._id,
                                        ...currentEditForm,
                                      });
                                      setEditingId(null);
                                      setEditForm(null);
                                    }}
                                    className="p-1.5 bg-green-600 hover:bg-green-700 rounded text-white"
                                    title="Save"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingId(null);
                                      setEditForm(null);
                                    }}
                                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-white"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEdit(shoe)}
                                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-white"
                                    title="Edit"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(shoe._id)}
                                    className="p-1.5 bg-red-600 hover:bg-red-700 rounded text-white"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
                className="flex-1 min-h-0 space-y-2"
                itemsPerPage={15}
                loadingIndicator={
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 text-neutral-500 text-sm">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neutral-500"></div>
                      <span>Loading more shoes...</span>
                    </div>
                  </div>
                }
                completedIndicator={
                  <span className="text-white/60">
                    All {filteredShoes.length} shoes loaded
                  </span>
                }
              />
            </div>
          </>
        )}

        {activeTab === "users" && (
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
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
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
          </>
        )}

        {activeTab === "backlog" && <BacklogManager />}
      </div>
    </div>
  );
}
