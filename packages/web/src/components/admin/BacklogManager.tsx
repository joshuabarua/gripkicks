"use client";

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import type { Id } from '../../../../../convex/_generated/dataModel';

type BacklogItem = {
  _id: Id<"backlogItems">;
  title: string;
  notes?: string;
  status: "not_started" | "in_progress" | "done";
  createdAt: number;
  updatedAt: number;
};

type EditingItem = Partial<BacklogItem> & { _id: Id<"backlogItems"> };

export function BacklogManager() {
  const [statusFilter, setStatusFilter] = useState<"all" | "not_started" | "in_progress" | "done">("all");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<Id<"backlogItems"> | null>(null);
  const [newItem, setNewItem] = useState({ title: "", notes: "", status: "not_started" as const });
  const [editForm, setEditForm] = useState<EditingItem | null>(null);

  const backlogItems = useQuery(api.backlog.listBacklogItems, 
    statusFilter === "all" ? {} : { statusFilter }
  );
  const createBacklogItem = useMutation(api.backlog.createBacklogItem);
  const updateBacklogItem = useMutation(api.backlog.updateBacklogItem);
  const deleteBacklogItem = useMutation(api.backlog.deleteBacklogItem);

  const handleCreate = async () => {
    if (!newItem.title.trim()) return;
    
    await createBacklogItem({
      title: newItem.title.trim(),
      notes: newItem.notes.trim() || undefined,
      status: newItem.status,
    });
    
    setNewItem({ title: "", notes: "", status: "not_started" });
    setIsCreating(false);
  };

  const handleEdit = (item: BacklogItem) => {
    setEditingId(item._id);
    setEditForm(item);
  };

  const handleSave = async () => {
    if (!editForm || !editForm._id || !editForm.title?.trim()) return;
    
    await updateBacklogItem({
      id: editForm._id,
      title: editForm.title.trim(),
      notes: editForm.notes?.trim() || undefined,
      status: editForm.status,
    });
    
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = async (id: Id<"backlogItems">) => {
    if (confirm('Are you sure you want to delete this backlog item?')) {
      await deleteBacklogItem({ id });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not_started": return "bg-gray-600/20 text-gray-400 border-gray-600/30";
      case "in_progress": return "bg-blue-600/20 text-blue-400 border-blue-600/30";
      case "done": return "bg-green-600/20 text-green-400 border-green-600/30";
      default: return "bg-gray-600/20 text-gray-400 border-gray-600/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "not_started": return "Not Started";
      case "in_progress": return "In Progress";
      case "done": return "Done";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Backlog Management</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: "all", label: "All" },
          { value: "not_started", label: "Not Started" },
          { value: "in_progress", label: "In Progress" },
          { value: "done", label: "Done" }
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value as any)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === filter.value
                ? "bg-orange-600 text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Create New Item */}
      {isCreating && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Title</label>
            <input
              type="text"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              placeholder="Enter task title..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Notes</label>
            <textarea
              value={newItem.notes}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              placeholder="Add notes..."
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Status</label>
            <select
              value={newItem.status}
              onChange={(e) => setNewItem({ ...newItem, status: e.target.value as any })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewItem({ title: "", notes: "", status: "not_started" });
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Backlog Items */}
      <div className="space-y-3">
        {backlogItems?.map((item) => (
          <div key={item._id} className="bg-white/5 border border-white/10 rounded-lg p-4">
            {editingId === item._id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Title</label>
                  <input
                    type="text"
                    value={editForm?.title || ""}
                    onChange={(e) => setEditForm(editForm ? { ...editForm, title: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Notes</label>
                  <textarea
                    value={editForm?.notes || ""}
                    onChange={(e) => setEditForm(editForm ? { ...editForm, notes: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Status</label>
                  <select
                    value={editForm?.status || "not_started"}
                    onChange={(e) => setEditForm(editForm ? { ...editForm, status: e.target.value as any } : null)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditForm(null);
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-medium">{item.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-white/60 text-sm whitespace-pre-wrap">{item.notes}</p>
                  )}
                  <p className="text-white/40 text-xs mt-2">
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {backlogItems?.length === 0 && (
          <div className="text-center py-8">
            <p className="text-white/60">No backlog items found</p>
            <p className="text-white/40 text-sm mt-2">Create your first backlog item to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
