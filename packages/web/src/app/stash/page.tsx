'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Check, X, Filter } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useSession } from '@/lib/auth';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Shoe {
  id: string;
  name: string;
  brand: string;
  imageUrl?: string;
  aggressiveness: string;
  stiffness: string;
  climbingDiscipline: string;
  volume: string;
}

interface UserShoe {
  id: string;
  shoeId: string;
  shoe: Shoe;
}

export default function StashPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [userShoes, setUserShoes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get unique brands from shoes
  const brands = [...new Set(shoes.map(s => s.brand))].sort();

  // Filter shoes based on search and brand
  const filteredShoes = shoes.filter(shoe => {
    const matchesSearch = searchQuery === '' || 
      shoe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shoe.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = !selectedBrand || shoe.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  useEffect(() => {
    async function loadData() {
      try {
        // Load all shoes
        const shoesRes = await fetchApi<{ success: boolean; data: Shoe[] }>('/api/v1/shoes');
        if (shoesRes.success) {
          setShoes(shoesRes.data);
        }

        // Load user's stash if logged in
        if (session?.user) {
          try {
            const stashRes = await fetchApi<{ success: boolean; data: UserShoe[] }>('/api/v1/stash');
            if (stashRes.success) {
              setUserShoes(stashRes.data.map(us => us.shoeId));
            }
          } catch {
            // Stash endpoint might not exist yet, that's ok
            console.log('Stash endpoint not available');
          }
        }
      } catch (err) {
        console.error('Failed to load shoes:', err);
        setError('Failed to load shoes');
      } finally {
        setLoading(false);
      }
    }

    if (!sessionLoading) {
      loadData();
    }
  }, [session, sessionLoading]);

  const toggleShoe = async (shoeId: string) => {
    if (!session?.user) return;
    
    setSaving(shoeId);
    const isAdding = !userShoes.includes(shoeId);

    try {
      if (isAdding) {
        await fetchApi('/api/v1/stash', {
          method: 'POST',
          body: JSON.stringify({ shoeId }),
        });
        setUserShoes(prev => [...prev, shoeId]);
      } else {
        await fetchApi(`/api/v1/stash/${shoeId}`, {
          method: 'DELETE',
        });
        setUserShoes(prev => prev.filter(id => id !== shoeId));
      }
    } catch (err) {
      console.error('Failed to update stash:', err);
      setError('Failed to update your collection');
    } finally {
      setSaving(null);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-svh w-full flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sole Sanctuary</CardTitle>
            <CardDescription>Log in to manage your climbing shoe collection</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/login">
              <Button className="w-full">Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-svh w-full p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Sole Sanctuary</h1>
            <p className="text-muted-foreground">
              Build your climbing shoe collection • {userShoes.length} shoe{userShoes.length !== 1 ? 's' : ''} in your stash
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search shoes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedBrand === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedBrand(null)}
                >
                  All Brands
                </Button>
                {brands.slice(0, 5).map(brand => (
                  <Button
                    key={brand}
                    variant={selectedBrand === brand ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedBrand(brand === selectedBrand ? null : brand)}
                  >
                    {brand}
                  </Button>
                ))}
                {brands.length > 5 && (
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    +{brands.length - 5} more
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Collection */}
        {userShoes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {shoes
                  .filter(shoe => userShoes.includes(shoe.id))
                  .map(shoe => (
                    <div
                      key={shoe.id}
                      className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm"
                    >
                      <span>{shoe.brand} {shoe.name}</span>
                      <button
                        onClick={() => toggleShoe(shoe.id)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                        disabled={saving === shoe.id}
                      >
                        {saving === shoe.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="text-sm text-red-500 text-center">{error}</div>
        )}

        {/* All Shoes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredShoes.map(shoe => {
            const isOwned = userShoes.includes(shoe.id);
            const isSaving = saving === shoe.id;

            return (
              <Card
                key={shoe.id}
                className={cn(
                  "relative overflow-hidden transition-all cursor-pointer hover:shadow-lg",
                  isOwned && "ring-2 ring-primary"
                )}
                onClick={() => toggleShoe(shoe.id)}
              >
                {isOwned && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                    {shoe.imageUrl && shoe.imageUrl !== 'unknown' ? (
                      <img
                        src={shoe.imageUrl}
                        alt={shoe.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-4xl">👟</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {shoe.brand}
                    </p>
                    <h3 className="font-semibold">{shoe.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">
                        {shoe.climbingDiscipline}
                      </span>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">
                        {shoe.aggressiveness}
                      </span>
                    </div>
                  </div>
                  {isSaving && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredShoes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No shoes found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
