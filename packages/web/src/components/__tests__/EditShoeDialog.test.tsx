import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EditShoeDialog from "@/components/EditShoeDialog";
import type { UserShoe } from "@/types/api";
import type { EditFormData } from "@/schemas/shoe-schema";

const shoe: UserShoe = {
  _id: "stash-1",
  shoeId: "shoe-1",
  shoe: {
    _id: "shoe-1",
    name: "Drago",
    brand: "Scarpa",
    modelName: "Drago",
    aggressiveness: "aggressive",
    stiffness: "soft",
    volume: "low",
    climbingDiscipline: "bouldering",
  },
};

const form: EditFormData = { showNotes: false };

function renderDialog() {
  const setEditingShoe = vi.fn();
  const updateShoeStats = vi.fn();
  const removeShoe = vi.fn();
  render(
    <EditShoeDialog
      editingShoe={shoe}
      editForm={form}
      setEditForm={vi.fn()}
      setEditingShoe={setEditingShoe}
      updateShoeStats={updateShoeStats}
      removeShoe={removeShoe}
    />,
  );
  return { setEditingShoe, updateShoeStats, removeShoe };
}

describe("EditShoeDialog", () => {
  it("keeps Save and Remove actions in the header above the scroll body", () => {
    renderDialog();
    const title = screen.getByText("Edit Shoe Stats");
    const header = title.parentElement;
    const save = screen.getByRole("button", { name: "Save shoe changes" });
    const remove = screen.getByRole("button", { name: "Remove shoe" });
    expect(header).not.toBeNull();
    expect(header!.contains(save)).toBe(true);
    expect(header!.contains(remove)).toBe(true);
    const scrollBody = document.querySelector(".overflow-y-auto");
    expect(scrollBody).not.toBeNull();
    expect(save.compareDocumentPosition(scrollBody!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(remove.compareDocumentPosition(scrollBody!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("fires save and remove callbacks and has no bottom action duplicates", () => {
    const { updateShoeStats, removeShoe } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Save shoe changes" }));
    expect(updateShoeStats).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Remove shoe" }));
    expect(removeShoe).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Save Changes")).toBeNull();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
    expect(screen.getAllByRole("button", { name: /shoe changes|Remove shoe/ })).toHaveLength(2);
  });
});
