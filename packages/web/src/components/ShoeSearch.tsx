'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search } from 'lucide-react'
import ShoeImage from '@/components/ShoeImage'
import { fetchApi } from '@/lib/api-client'
import { debounce } from '@/lib/debounce'
import type { Shoe } from '@/types/api'

interface ShoeSearchProps {
  onShoeSelect: (shoe: Shoe) => void
  selectedShoe: Shoe | null
}

export function ShoeSearch({ onShoeSelect, selectedShoe }: ShoeSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [shoes, setShoes] = useState<Shoe[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<Shoe[]>([])

  useEffect(() => {
    fetchShoes()
  }, [])

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      if (searchQuery) {
        const results = shoes.filter(shoe => 
          shoe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shoe.brand.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setSearchResults(results)
      } else {
        setSearchResults(shoes.slice(0, 10)) // Show first 10 shoes when no search
      }
    }, 300)

    debouncedSearch()
  }, [searchQuery, shoes])

  const fetchShoes = async () => {
    setIsLoading(true)
    try {
      const response = await fetchApi<Shoe[]>('/api/v1/users/shoes')
      if (response.isOk()) {
        const shoes = response.value
        setShoes(shoes)
        setSearchResults(shoes.slice(0, 10))
      }
    } catch (error) {
      console.error('Failed to fetch shoes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search for shoes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <div className="max-h-60 overflow-y-auto space-y-2">
          {searchResults.map((shoe) => (
            <Card
              key={shoe._id}
              className={`cursor-pointer transition-colors ${
                selectedShoe?._id === shoe._id
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onShoeSelect(shoe)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <ShoeImage
                      brand={shoe.brand}
                      shoeName={shoe.name}
                      imageUrl={shoe.imageUrl}
                      slug={shoe.slug}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate">{shoe.name}</h3>
                    <p className="text-sm text-gray-600">{shoe.brand}</p>
                  </div>
                  {selectedShoe?._id === shoe._id && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
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
