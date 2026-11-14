"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";

const genderOptions = ["men", "women", "kids", "unisex"];
const aggressivenessOptions = ["flat", "moderate", "aggressive"];
const stiffnessOptions = ["soft", "medium", "stiff"];
const disciplineOptions = [
  "gym",
  "sport",
  "bouldering",
  "trad",
  "competition",
];
const volumeOptions = ["low", "medium", "high"];

const requireImageOrSlug = (image?: string | null, slug?: string | null) => {
  return Boolean(image?.trim()) || Boolean(slug?.trim());
};

interface AddShoeFormProps {
  open: boolean;
  onClose: () => void;
  brands: string[];
  rubberTechnologies: Doc<"rubberTechnologies">[] | undefined;
}

// Stays mounted while closed so the draft survives closing and reopening.
export function AddShoeForm({
  open,
  onClose,
  brands,
  rubberTechnologies,
}: AddShoeFormProps) {
  const createShoe = useMutation(api.shoes.create);
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
    onClose();
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="lab-card p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
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
              {brands.map((brand) => (
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
            <p className="text-xs text-white/40 mt-1 font-mono">
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
                  {rubber.brand}: {rubber.compound}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-1">
                Brand Aggressiveness (1 to 5)
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
                Brand Stiffness (1 to 5)
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
            onClick={onClose}
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
  );
}
