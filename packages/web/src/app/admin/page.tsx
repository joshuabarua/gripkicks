'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { useSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ShoeImage from '@/components/ShoeImage';
import { Pencil, Trash2, X, Check, Plus, Search, Footprints, Users } from 'lucide-react';

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
  imageUrl?: string;
  slug?: string;
  gender?: 'men' | 'women' | 'kids' | 'unisex';
  aggressiveness: string;
  stiffness: string;
  climbingDiscipline: string;
  volume: string;
  rubberTechnologyId?: Id<"rubberTechnologies">;
  rubberTechnology?: RubberTechnology | null;
};

type EditingShoe = Partial<Shoe> & { _id: Id<"shoes"> };

export default function AdminDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const shoes = useQuery(api.shoes.list);
  const updateShoe = useMutation(api.shoes.update).withOptimisticUpdate(
    (localStore, args) => {
      // Optimistic update logic
      const shoe = localStore.getQuery(api.shoes.list)?.find(s => s._id === args.id);
      if (shoe) {
        Object.assign(shoe, args);
      }
    }
  );
  const deleteShoe = useMutation(api.shoes.remove);
  const createShoe = useMutation(api.shoes.create);

  const [editingId, setEditingId] = useState<Id<"shoes"> | null>(null);
  const [editForm, setEditForm] = useState<EditingShoe | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingImageId, setEditingImageId] = useState<Id<"shoes"> | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newShoe, setNewShoe] = useState({
    name: '',
    brand: '',
    imageUrl: '',
    slug: '',
    gender: 'unisex' as const,
    aggressiveness: 'moderate',
    stiffness: 'medium',
    climbingDiscipline: 'sport',
    volume: 'medium',
    rubberTechnologyId: undefined as Id<"rubberTechnologies"> | undefined,
  });
  const [activeTab, setActiveTab] = useState<'shoes' | 'users'>('shoes');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');

  const uniqueBrands = [...new Set(shoes?.map(s => s.brand) || [])].sort();

  const users = useQuery(api.users.list);
  const rubberTechnologies = useQuery(api.rubberTechnologies.list);

  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

  useEffect(() => {
    if (!isPending && (!session?.user || !isAdmin)) {
      router.push('/');
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
          <p className="text-white/60">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const filteredShoes = shoes?.filter(shoe => {
    const matchesSearch = shoe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shoe.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = brandFilter === 'all' || shoe.brand === brandFilter;
    const matchesLaSportiva = shoe.brand === 'La Sportiva';
    return matchesSearch && matchesBrand && matchesLaSportiva;
  }) || [];

  const filteredUsers = users?.filter(user =>
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    (user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()))
  ) || [];

  const handleEdit = (shoe: Shoe) => {
    setEditingId(shoe._id);
    setEditForm({ ...shoe });
  };

  const requireImageOrSlug = (image?: string | null, slug?: string | null) => {
    return Boolean(image?.trim()) || Boolean(slug?.trim());
  };

  const handleSave = async () => {
    if (!editForm) return;

    if (!requireImageOrSlug(editForm.imageUrl, editForm.slug)) {
      alert('Please provide either an image URL or a slug before saving.');
      return;
    }
    try {
      await updateShoe({
        id: editForm._id,
        name: editForm.name,
        brand: editForm.brand,
        imageUrl: editForm.imageUrl,
        slug: editForm.slug?.trim() || undefined,
        gender: editForm.gender,
        aggressiveness: editForm.aggressiveness,
        stiffness: editForm.stiffness,
        climbingDiscipline: editForm.climbingDiscipline,
        volume: editForm.volume,
      });
      setEditingId(null);
      setEditForm(null);
      console.log('Shoe updated successfully');
    } catch (error) {
      console.error('Failed to update shoe:', error);
      alert('Failed to save shoe changes. Please try again.');
    }
  };

  const handleDelete = async (id: Id<"shoes">) => {
    if (confirm('Are you sure you want to delete this shoe?')) {
      await deleteShoe({ id });
    }
  };

  const handleCreate = async () => {
    if (!requireImageOrSlug(newShoe.imageUrl, newShoe.slug)) {
      alert('Please provide either an image URL or a slug before creating a shoe.');
      return;
    }

    await createShoe({
      ...newShoe,
      slug: newShoe.slug.trim() || undefined,
    });
    setShowAddForm(false);
    setNewShoe({
      name: '',
      brand: '',
      imageUrl: '',
      slug: '',
      gender: 'unisex',
      aggressiveness: 'moderate',
      stiffness: 'medium',
      climbingDiscipline: 'sport',
      volume: 'medium',
      rubberTechnologyId: undefined,
    });
  };

  const genderOptions = ['men', 'women', 'kids', 'unisex'];
  const aggressivenessOptions = ['flat', 'moderate', 'aggressive'];
  const stiffnessOptions = ['soft', 'medium', 'stiff'];
  const disciplineOptions = ['gym', 'sport', 'bouldering', 'trad', 'competition', 'all-around'];
  const volumeOptions = ['low', 'medium', 'high'];

  return (
    <div className="min-h-screen bg-background p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('shoes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'shoes'
              ? 'bg-accent text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
          >
            <Footprints className="w-4 h-4" />
            Shoes ({shoes?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'users'
              ? 'bg-accent text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
          >
            <Users className="w-4 h-4" />
            Users ({users?.length || 0})
          </button>
        </div>

        {activeTab === 'shoes' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-white/60">
                {filteredShoes.length} shoes in database
              </div>
              <div className="flex gap-4">
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="all">All Brands</option>
                  {uniqueBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
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

            {showAddForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddForm(false)}>
                <div className="bg-zinc-900 p-6 rounded-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <h2 className="text-xl font-bold text-white mb-4">Add New Shoe</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/70 text-sm mb-1">Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Solution"
                        value={newShoe.name}
                        onChange={(e) => setNewShoe({ ...newShoe, name: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-1">Brand *</label>
                      <select
                        value={newShoe.brand}
                        onChange={(e) => setNewShoe({ ...newShoe, brand: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      >
                        <option value="">Select brand...</option>
                        {uniqueBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                        <option value="__new">+ Add new brand</option>
                      </select>
                      {newShoe.brand === '__new' && (
                        <input
                          type="text"
                          placeholder="Enter new brand name"
                          onChange={(e) => setNewShoe({ ...newShoe, brand: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white mt-2"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-1">Image URL</label>
                      <input
                        type="text"
                        placeholder="https://ik.imagekit.io/..."
                        value={newShoe.imageUrl}
                        onChange={(e) => setNewShoe({ ...newShoe, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-1">Slug</label>
                      <input
                        type="text"
                        placeholder="e.g. la_sportiva/solution-men"
                        value={newShoe.slug}
                        onChange={(e) => setNewShoe({ ...newShoe, slug: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      />
                      <p className="text-[11px] text-white/40 mt-1 font-mono">Used when no direct image URL is set.</p>
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-1">Rubber Technology</label>
                      <select
                        value={newShoe.rubberTechnologyId || ''}
                        onChange={(e) => setNewShoe({ ...newShoe, rubberTechnologyId: e.target.value as Id<"rubberTechnologies"> || undefined })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      >
                        <option value="">None</option>
                        {rubberTechnologies?.map(rubber => (
                          <option key={rubber._id} value={rubber._id}>
                            {rubber.brand} - {rubber.compound}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Gender</label>
                        <select
                          value={newShoe.gender}
                          onChange={(e) => setNewShoe({ ...newShoe, gender: e.target.value as typeof newShoe.gender })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        >
                          {genderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Volume</label>
                        <select
                          value={newShoe.volume}
                          onChange={(e) => setNewShoe({ ...newShoe, volume: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        >
                          {volumeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Aggressiveness</label>
                        <select
                          value={newShoe.aggressiveness}
                          onChange={(e) => setNewShoe({ ...newShoe, aggressiveness: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        >
                          {aggressivenessOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Stiffness</label>
                        <select
                          value={newShoe.stiffness}
                          onChange={(e) => setNewShoe({ ...newShoe, stiffness: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        >
                          {stiffnessOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-1">Climbing Discipline</label>
                      <select
                        value={newShoe.climbingDiscipline}
                        onChange={(e) => setNewShoe({ ...newShoe, climbingDiscipline: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      >
                        {disciplineOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
                      disabled={!newShoe.name || !newShoe.brand || newShoe.brand === '__new'}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white rounded-lg"
                    >
                      Create Shoe
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-3 text-white/70 font-medium">Image</th>
                    <th className="text-left p-3 text-white/70 font-medium">Name</th>
                    <th className="text-left p-3 text-white/70 font-medium">Brand</th>
                    <th className="text-left p-3 text-white/70 font-medium">Gender</th>
                    <th className="text-left p-3 text-white/70 font-medium">Rubber</th>
                    <th className="text-left p-3 text-white/70 font-medium">Aggressiveness</th>
                    <th className="text-left p-3 text-white/70 font-medium">Stiffness</th>
                    <th className="text-left p-3 text-white/70 font-medium">Discipline</th>
                    <th className="text-left p-3 text-white/70 font-medium">Volume</th>
                    <th className="text-left p-3 text-white/70 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShoes.map((shoe) => (
                    <tr key={shoe._id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-3">
                        {editingImageId === shoe._id ? (
                          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingImageId(null)}>
                            <div className="bg-zinc-900 p-4 rounded-xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
                              <h3 className="text-white font-medium mb-3">Edit Image URL</h3>
                              <input
                                type="text"
                                value={editingImageUrl}
                                onChange={(e) => setEditingImageUrl(e.target.value)}
                                placeholder="Image URL"
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm mb-3"
                                autoFocus
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setEditingImageId(null)}
                                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-sm"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={async () => {
                                    await updateShoe({ id: shoe._id, imageUrl: editingImageUrl });
                                    setEditingImageId(null);
                                  }}
                                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : null}
                        <div
                          className="rounded-lg overflow-hidden bg-white/10 cursor-pointer hover:ring-2 hover:ring-accent transition-all"
                          onClick={() => {
                            setEditingImageId(shoe._id);
                            setEditingImageUrl(shoe.imageUrl || '');
                          }}
                          title="Click to edit image URL"
                        >
                          <ShoeImage
                            brand={shoe.brand}
                            shoeName={shoe.name}
                            imageUrl={shoe.imageUrl}
                            slug={shoe.slug}
                            className=""
                            gender={shoe.gender}
                          />
                        </div>
                      </td>
                      {editingId === shoe._id ? (
                        <>
                          <td className="p-3">
                            <input
                              type="text"
                              value={editForm?.name || ''}
                              onChange={(e) => setEditForm({ ...editForm!, name: e.target.value })}
                              className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={editForm?.brand || ''}
                              onChange={(e) => setEditForm({ ...editForm!, brand: e.target.value })}
                              className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                            />
                            <input
                              type="text"
                              value={editForm?.slug || ''}
                              onChange={(e) => setEditForm({ ...editForm!, slug: e.target.value })}
                              placeholder="Slug"
                              className="w-full mt-2 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs"
                            />
                          </td>
                          <td className="p-3">
                            <select
                              value={editForm?.gender || 'unisex'}
                              onChange={(e) => setEditForm({ ...editForm!, gender: e.target.value as Shoe['gender'] })}
                              className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                            >
                              {genderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </td>
                          <td className="p-3">
                            <select
                              value={editForm?.rubberTechnologyId || ''}
                              onChange={(e) => setEditForm({ ...editForm!, rubberTechnologyId: e.target.value as Id<'rubberTechnologies'> || undefined })}
                              className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                            >
                              <option value="">None</option>
                              {rubberTechnologies?.map(rubber => (
                                <option key={rubber._id} value={rubber._id}>
                                  {rubber.brand} - {rubber.compound}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3">
                            <select
                              value={editForm?.aggressiveness || 'moderate'}
                              onChange={(e) => setEditForm({ ...editForm!, aggressiveness: e.target.value })}
                              className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                            >
                              {aggressivenessOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </td>
                          <td className="p-3">
                            <select
                              value={editForm?.stiffness || 'medium'}
                              onChange={(e) => setEditForm({ ...editForm!, stiffness: e.target.value })}
                              className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                            >
                              {stiffnessOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </td>
                          <td className="p-3">
                            <select
                              value={editForm?.climbingDiscipline || 'sport'}
                              onChange={(e) => setEditForm({ ...editForm!, climbingDiscipline: e.target.value })}
                              className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                            >
                              {disciplineOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </td>
                          <td className="p-3">
                            <select
                              value={editForm?.volume || 'medium'}
                              onChange={(e) => setEditForm({ ...editForm!, volume: e.target.value })}
                              className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                            >
                              {volumeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <button
                                onClick={handleSave}
                                className="p-2 bg-green-600 hover:bg-green-700 rounded text-white"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setEditingId(null); setEditForm(null); }}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded text-white"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3 text-white">{shoe.name}</td>
                          <td className="p-3 text-white/80">
                            <div>{shoe.brand}</div>
                            {shoe.slug && (
                              <p className="text-[10px] text-white/40 mt-1 font-mono truncate">slug: {shoe.slug}</p>
                            )}
                          </td>
                          <td className="p-3 text-white/60">{shoe.gender || 'unisex'}</td>
                          <td className="p-3 text-white/60 text-xs">{shoe.rubberTechnology?.compound || '-'}</td>
                          <td className="p-3 text-white/60">{shoe.aggressiveness}</td>
                          <td className="p-3 text-white/60">{shoe.stiffness}</td>
                          <td className="p-3 text-white/60">{shoe.climbingDiscipline}</td>
                          <td className="p-3 text-white/60">{shoe.volume}</td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(shoe as Shoe)}
                                className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(shoe._id)}
                                className="p-2 bg-red-600 hover:bg-red-700 rounded text-white"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'users' && (
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
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-3 text-white/70 font-medium">Avatar</th>
                    <th className="text-left p-3 text-white/70 font-medium">Name</th>
                    <th className="text-left p-3 text-white/70 font-medium">Email</th>
                    <th className="text-left p-3 text-white/70 font-medium">Foot Shape</th>
                    <th className="text-left p-3 text-white/70 font-medium">Foot Volume</th>
                    <th className="text-left p-3 text-white/70 font-medium">Admin</th>
                    <th className="text-left p-3 text-white/70 font-medium">Onboarded</th>
                    <th className="text-left p-3 text-white/70 font-medium">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10">
                          {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/50">
                              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-white">{user.name || '-'}</td>
                      <td className="p-3 text-white/80">{user.email}</td>
                      <td className="p-3 text-white/60">{user.footShape || '-'}</td>
                      <td className="p-3 text-white/60">{user.footVolume || '-'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${user.isAdmin ? 'bg-green-600/20 text-green-400' : 'bg-white/10 text-white/50'}`}>
                          {user.isAdmin ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${user.onboardingComplete ? 'bg-blue-600/20 text-blue-400' : 'bg-white/10 text-white/50'}`}>
                          {user.onboardingComplete ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${user.emailVerified ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'}`}>
                          {user.emailVerified ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
