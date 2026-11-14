"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import ShoeImage from "@/components/ShoeImage";
import ShoeImageUpload from "@/components/ShoeImageUpload";
import { Pencil, Trash2, X, Check } from "lucide-react";

export type Shoe = Doc<"shoes"> & {
  rubberTechnology?: {
    brand: string;
    compound: string;
    stickiness: string;
    durability: string;
  } | null;
};

export type EditingShoe = Partial<Shoe> & { _id: Id<"shoes"> };

interface ShoeEditRowProps {
  shoe: Shoe;
  editForm: EditingShoe | null;
  setEditForm: Dispatch<SetStateAction<EditingShoe | null>>;
  onEdit: () => void;
  onStopEditing: () => void;
  rubberTechnologies: Doc<"rubberTechnologies">[] | undefined;
}

export function ShoeEditRow({
  shoe,
  editForm,
  setEditForm,
  onEdit,
  onStopEditing,
  rubberTechnologies,
}: ShoeEditRowProps) {
  const updateShoe = useMutation(api.shoes.update);
  const deleteShoe = useMutation(api.shoes.remove);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState("");

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this shoe?")) {
      await deleteShoe({ id: shoe._id });
    }
  };

  return (
    <div
      className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col gap-2 max-h-[175px] overflow-hidden"
    >
      {isEditingImage ? (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setIsEditingImage(false)}
        >
          <div
            className="lab-card p-6 w-full max-w-lg mx-2 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-medium mb-4">
              Edit Shoe Image
            </h3>

            <div className="space-y-4">

              <ShoeImageUpload
                brand={shoe.brand}
                shoeName={shoe.name}
                onUploadSuccess={(url) => {
                  setEditingImageUrl(url);
                  // Auto-save when upload is successful
                  updateShoe({ id: shoe._id, imageUrl: url });
                  setIsEditingImage(false);
                }}
                onError={(error) => {
                  console.error("Image upload failed:", error);
                }}
              />


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
                onClick={() => setIsEditingImage(false)}
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
                  setIsEditingImage(false);
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
          className="rounded-lg overflow-hidden bg-white/10 cursor-pointer hover:ring-2 hover:ring-accent transition-all shrink-0"
          onClick={() => {
            setIsEditingImage(true);
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
            <label className="lab-label font-mono text-brand-putty/50">
              Name
            </label>
            {editForm ? (
              <input
                type="text"
                value={editForm.name || ""}
                onChange={(e) =>
                  setEditForm((prev) =>
                    prev
                      ? { ...prev, name: e.target.value }
                      : prev,
                  )
                }
                className="w-full px-2 py-0.5 rounded-lg bg-black border border-white/6 text-brand-chalk text-xs"
                autoFocus
              />
            ) : (
              <div className="text-white font-medium">
                {shoe.name}
              </div>
            )}
          </div>

          <div>
            <label className="lab-label font-mono text-brand-putty/50">
              Brand
            </label>
            {editForm ? (
              <input
                type="text"
                value={editForm.brand || ""}
                onChange={(e) =>
                  setEditForm((prev) =>
                    prev
                      ? { ...prev, brand: e.target.value }
                      : prev,
                  )
                }
                className="w-full px-2 py-0.5 rounded-lg bg-black border border-white/6 text-brand-chalk text-xs"
              />
            ) : (
              <div className="text-white/70">{shoe.brand}</div>
            )}
          </div>

          <div>
            <label className="lab-label font-mono text-brand-putty/50">
              Model
            </label>
            {editForm ? (
              <input
                type="text"
                value={editForm.modelName || ""}
                onChange={(e) =>
                  setEditForm((prev) =>
                    prev
                      ? { ...prev, modelName: e.target.value }
                      : prev,
                  )
                }
                className="w-full px-2 py-0.5 rounded-lg bg-black border border-white/6 text-brand-chalk text-xs"
              />
            ) : (
              <div className="text-white/70">
                {shoe.modelName}
              </div>
            )}
          </div>

          <div>
            <label className="lab-label font-mono text-brand-putty/50">
              Variant
            </label>
            {editForm ? (
              <input
                type="text"
                value={editForm.variantLabel || ""}
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
                className="w-full px-2 py-0.5 rounded-lg bg-black border border-white/6 text-brand-chalk text-xs"
              />
            ) : (
              <div className="text-white/70">
                {shoe.variantLabel}
              </div>
            )}
          </div>

          <div>
            <label className="lab-label font-mono text-brand-putty/50">
              Slug
            </label>
            {editForm ? (
              <input
                type="text"
                value={editForm.slug || ""}
                onChange={(e) =>
                  setEditForm((prev) =>
                    prev
                      ? { ...prev, slug: e.target.value }
                      : prev,
                  )
                }
                className="w-full px-2 py-0.5 rounded-lg bg-black border border-white/6 text-brand-chalk text-xs"
              />
            ) : (
              <div className="text-white/70 font-mono text-xs">
                {shoe.slug}
              </div>
            )}
          </div>

          <div>
            <label className="lab-label font-mono text-brand-putty/50">
              Gender
            </label>
            {editForm ? (
              <select
                value={editForm.gender || ""}
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
                className="w-full px-2 py-0.5 rounded-lg bg-black border border-white/6 text-brand-chalk text-xs"
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
            <label className="lab-label font-mono text-brand-putty/50">
              Aggressiveness
            </label>
            {editForm ? (
              <input
                type="text"
                value={editForm.aggressiveness || ""}
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
                className="w-full px-2 py-0.5 rounded-lg bg-black border border-white/6 text-brand-chalk text-xs"
              />
            ) : (
              <div className="text-white/70">
                {shoe.aggressiveness}
              </div>
            )}
          </div>

          <div>
            <label className="lab-label font-mono text-brand-putty/50">
              Stiffness
            </label>
            {editForm ? (
              <input
                type="text"
                value={editForm.stiffness || ""}
                onChange={(e) =>
                  setEditForm((prev) =>
                    prev
                      ? { ...prev, stiffness: e.target.value }
                      : prev,
                  )
                }
                className="w-full px-2 py-0.5 rounded-lg bg-black border border-white/6 text-brand-chalk text-xs"
              />
            ) : (
              <div className="text-white/70">
                {shoe.stiffness}
              </div>
            )}
          </div>

          <div>
            <label className="lab-label font-mono text-brand-putty/50">
              Discipline
            </label>
            {editForm ? (
              <input
                type="text"
                value={editForm.climbingDiscipline || ""}
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
                className="w-full px-2 py-0.5 rounded-lg bg-black border border-white/6 text-brand-chalk text-xs"
              />
            ) : (
              <div className="text-white/70">
                {shoe.climbingDiscipline}
              </div>
            )}
          </div>

          <div>
            <label className="lab-label font-mono text-brand-putty/50">
              Volume
            </label>
            {editForm ? (
              <input
                type="text"
                value={editForm.volume || ""}
                onChange={(e) =>
                  setEditForm((prev) =>
                    prev
                      ? { ...prev, volume: e.target.value }
                      : prev,
                  )
                }
                className="w-full px-2 py-0.5 rounded-lg bg-black border border-white/6 text-brand-chalk text-xs"
              />
            ) : (
              <div className="text-white/70">{shoe.volume}</div>
            )}
          </div>

          <div>
            <label className="lab-label font-mono text-brand-putty/50">
              Rubber
            </label>
            {editForm ? (
              <select
                value={editForm.rubberTechnologyId || ""}
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
                className="w-full px-2 py-0.5 rounded-lg bg-black border border-white/6 text-brand-chalk text-xs"
              >
                <option value="">Select</option>
                {rubberTechnologies?.map((rubber) => (
                  <option key={rubber._id} value={rubber._id}>
                    {rubber.brand}: {rubber.compound}
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
              {editForm ? (
                <>
                  <button
                    onClick={async () => {
                      if (!editForm.rubberTechnologyId) {
                        alert(
                          "Please select a rubber technology before saving.",
                        );
                        return;
                      }

                      await updateShoe({
                        id: shoe._id,
                        ...editForm,
                      });
                      onStopEditing();
                    }}
                    className="p-1.5 bg-green-600 hover:bg-green-700 rounded text-white"
                    title="Save"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onStopEditing();
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
                    onClick={onEdit}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-white"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
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
}
