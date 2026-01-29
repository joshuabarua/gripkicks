'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Check, Filter } from 'lucide-react';
import { useSession } from '@/lib/auth';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { fetchApi } from '@/lib/api-client';

interface UserShoe {
  _id: string;
  shoeId: string;
  shoe: {
    _id: string;
    name: string;
    brand: string;
  };
}

export default function StashPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [userShoes, setUserShoes] = useState<UserShoe[]>([]);

  // Fetch shoes from Convex
  const shoes = useQuery(api.shoes.list) ?? [];
  const loading = shoes.length === 0 && !shoes;

  // Fetch user's stash from Hono API
  useEffect(() => {
    if (session?.user) {
      fetchUserStash();
    }
  }, [session]);

  const fetchUserStash = async () => {
    try {
      const response = await fetchApi<{ success: boolean; data: UserShoe[] }>('/api/v1/stash');
      if (response.success) {
        setUserShoes(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user stash:', error);
    }
  };

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

  const toggleShoe = async (shoeId: string) => {
    if (!session?.user) return;
    setSaving(shoeId);
    
    try {
      const isOwned = userShoes.some(us => us.shoeId === shoeId);
      
      if (isOwned) {
        // Remove from stash
        await fetchApi(`/api/v1/stash/${shoeId}`, { method: 'DELETE' });
      } else {
        // Add to stash
        await fetchApi('/api/v1/stash', {
          method: 'POST',
          body: JSON.stringify({ shoeId }),
        });
      }
      
      // Refresh stash
      await fetchUserStash();
    } catch (error) {
      console.error('Failed to toggle shoe:', error);
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
              Browse {shoes.length} climbing shoes from top brands
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

        {/* All Shoes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredShoes.map(shoe => {
            const isOwned = userShoes.some(us => us.shoeId === shoe._id);
            const isSaving = saving === shoe._id;

            return (
              <Card
                key={shoe._id}
                className={cn(
                  "relative overflow-hidden transition-all cursor-pointer hover:shadow-lg",
                  isOwned && "ring-2 ring-primary"
                )}
                onClick={() => toggleShoe(shoe._id)}
              >
                {isOwned && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                    {shoe.imageUrl ? (
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
