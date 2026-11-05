'use client'

import { useDeferredValue, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search } from 'lucide-react'
import ShoeImage from '@/components/ShoeImage'
import { LoadingBar } from '@/components/ui/loading'
import { usePaginatedQuery } from "convex/react"
import { api } from "convex/_generated/api"
import type { Shoe } from '@/types/api'

interface ShoeSearchProps {
  onShoeSelect: (shoe: Shoe) => void
  selectedShoe: Shoe | null
}

export function ShoeSearch({ onShoeSelect, selectedShoe }: ShoeSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  
  // Use Convex to fetch filtered shoes instead of loading the full catalog
  const { results: searchResults, status } = usePaginatedQuery(
    api.shoes.searchCatalog,
    deferredSearchQuery.trim()
      ? { searchTerm: deferredSearchQuery }
      : { brand: 'La Sportiva' },
    { initialNumItems: 20 },
  )
  const isLoading = status === 'LoadingFirstPage'

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-putty/50" />
        <Input
          placeholder="Search for shoes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-black border-white/6 text-brand-chalk placeholder:text-brand-putty/30 focus:border-brand-red rounded-none h-12"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <LoadingBar size="lg" />
        </div>
      ) : (
        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
          {searchResults.map((shoe) => (
            <Card
              key={shoe._id}
              className={`cursor-pointer transition-colors border-white/6 rounded-none ${
                selectedShoe?._id === shoe._id
                  ? 'border-brand-red bg-brand-red/10'
                  : 'bg-black hover:bg-brand-surface'
              }`}
              onClick={() => onShoeSelect(shoe)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black/50 border border-white/5 rounded-lg overflow-hidden shrink-0">
                    <ShoeImage
                      brand={shoe.brand}
                      shoeName={shoe.name}
                      imageUrl={shoe.imageUrl}
                      slug={shoe.slug}
                      className="w-full h-full object-contain p-1 mix-blend-screen"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate text-brand-chalk font-mono text-sm">{shoe.name}</h3>
                    <p className="text-xs text-brand-putty/50 font-mono uppercase tracking-wider mt-0.5">{shoe.brand}</p>
                  </div>
                  {selectedShoe?._id === shoe._id && (
                    <div className="w-5 h-5 rounded-full bg-brand-red flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
