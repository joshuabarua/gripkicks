"use client";

import { useState, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ScatterController,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import ShoeImage from '@/components/ShoeImage';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import type { Doc } from 'convex/_generated/dataModel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Target, Zap, Shield, Activity, Search, Filter, X, Star, Heart, Wrench } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ScatterController
);

type Shoe = Doc<'shoes'>;

interface ChartPosition {
  x: number; // Comfort (-1) to Performance (1)
  y: number; // Durability (-1) to Aggressiveness (1)
}

interface QuadrantInfo {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  characteristics: string[];
}

const quadrants: Record<string, QuadrantInfo> = {
  'comfortable-durable': {
    name: 'Comfortable & Durable',
    description: 'All-day climbing shoes built for comfort and longevity',
    icon: <Heart className="w-4 h-4" />,
    color: 'rgba(34, 197, 94, 0.2)', // Green
    characteristics: ['High comfort', 'Excellent durability', 'All-day wear', 'Beginner friendly']
  },
  'comfortable-aggressive': {
    name: 'Comfortable Performance',
    description: 'Performance shoes with enhanced comfort features',
    icon: <Activity className="w-4 h-4" />,
    color: 'rgba(59, 130, 246, 0.2)', // Blue
    characteristics: ['Performance edge', 'Comfortable fit', 'Versatile', 'Moderate aggressiveness']
  },
  'performance-durable': {
    name: 'Technical & Durable',
    description: 'Precision shoes built to last through intense use',
    icon: <Wrench className="w-4 h-4" />,
    color: 'rgba(251, 146, 60, 0.2)', // Orange
    characteristics: ['Technical precision', 'High durability', 'Stiff edge', 'Advanced climbers']
  },
  'performance-aggressive': {
    name: 'Pure Performance',
    description: 'Maximum performance shoes for difficult climbs',
    icon: <Target className="w-4 h-4" />,
    color: 'rgba(239, 68, 68, 0.2)', // Red
    characteristics: ['Maximum performance', 'High aggressiveness', 'Precise fit', 'Expert level']
  }
};

export function ShoeMatcherChart() {
  const shoes = useQuery(api.shoes.list);
  const [selectedShoe, setSelectedShoe] = useState<Shoe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuadrantFilter, setSelectedQuadrantFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const chartRef = useRef<ChartJS<'scatter'>>(null);

  // Calculate shoe position based on user ratings
  const calculateShoePosition = useCallback((shoe: Shoe): ChartPosition => {
    let x = 0; // Comfort (-1) to Performance (1)
    let y = 0; // Durability (-1) to Aggressiveness (1)

    // X-axis: Comfort vs Performance
    const comfortScore = shoe.avgComfortScore || 2.5; // Default to middle if no rating
    const performanceScore = shoe.avgPerformanceRating || 2.5;
    
    // Normalize to -1 to 1 scale
    x = (performanceScore - comfortScore) / 2.5; // Range: -1 (comfort) to 1 (performance)

    // Y-axis: Durability vs Aggressiveness
    const durabilityScore = shoe.avgDurabilityRating || 2.5;
    
    // Use aggressiveness as a factor (convert to numeric scale)
    let aggressivenessScore = 2.5; // Default middle
    if (shoe.aggressiveness === 'very_high') aggressivenessScore = 5;
    else if (shoe.aggressiveness === 'high') aggressivenessScore = 4;
    else if (shoe.aggressiveness === 'moderate') aggressivenessScore = 3;
    else if (shoe.aggressiveness === 'low') aggressivenessScore = 1;
    
    y = (aggressivenessScore - durabilityScore) / 2.5; // Range: -1 (durable) to 1 (aggressive)

    // Clamp values to chart bounds
    return {
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y))
    };
  }, []);

  // Get quadrant for a position
  const getQuadrant = (position: ChartPosition): string => {
    if (position.x < 0 && position.y < 0) return 'comfortable-durable';
    if (position.x < 0 && position.y >= 0) return 'comfortable-aggressive';
    if (position.x >= 0 && position.y < 0) return 'performance-durable';
    return 'performance-aggressive';
  };

  // Calculate positions for all shoes with filtering
  const shoePositions = useMemo(() => {
    if (!shoes) return [];
    
    let filteredShoes = shoes;

    // Apply search filter
    if (searchQuery.trim()) {
      filteredShoes = filteredShoes.filter(shoe =>
        shoe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shoe.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply quadrant filter
    if (selectedQuadrantFilter !== 'all') {
      filteredShoes = filteredShoes.filter(shoe => {
        const position = calculateShoePosition(shoe);
        return getQuadrant(position) === selectedQuadrantFilter;
      });
    }
    
    return filteredShoes.map(shoe => ({
      shoe,
      position: calculateShoePosition(shoe),
      quadrant: getQuadrant(calculateShoePosition(shoe))
    }));
  }, [shoes, calculateShoePosition, searchQuery, selectedQuadrantFilter]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const datasets = Object.keys(quadrants).map((quadrantKey) => {
      const quadrantData = shoePositions.filter(item => item.quadrant === quadrantKey);
      const quadrant = quadrants[quadrantKey];
      
      return {
        label: quadrant.name,
        data: quadrantData.map(item => ({
          x: item.position.x,
          y: item.position.y,
          shoe: item.shoe,
          position: item.position
        })),
        backgroundColor: quadrant.color.replace('0.2', '0.6'),
        borderColor: quadrant.color.replace('0.2', '1'),
        borderWidth: 2,
        pointRadius: 8,
        pointHoverRadius: 12,
        pointStyle: 'circle',
      };
    });

    return { datasets };
  }, [shoePositions]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const shoe = context.raw.shoe as Shoe;
            return [
              `${shoe.brand} ${shoe.name}`,
              `Comfort: ${shoe.avgComfortScore?.toFixed(1) || 'N/A'}`,
              `Performance: ${shoe.avgPerformanceRating?.toFixed(1) || 'N/A'}`,
              `Durability: ${shoe.avgDurabilityRating?.toFixed(1) || 'N/A'}`,
              `Aggressiveness: ${shoe.aggressiveness}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        min: -1.2,
        max: 1.2,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: 'white',
          callback: function(value: string | number) {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (numValue === -1) return 'Comfort';
            if (numValue === 0) return 'Balanced';
            if (numValue === 1) return 'Performance';
            return '';
          }
        },
        title: {
          display: true,
          text: 'Comfort ↔ Performance',
          color: 'white',
          font: {
            size: 14
          }
        }
      },
      y: {
        type: 'linear' as const,
        min: -1.2,
        max: 1.2,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: 'white',
          callback: function(value: string | number) {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (numValue === -1) return 'Durable';
            if (numValue === 0) return 'Balanced';
            if (numValue === 1) return 'Aggressive';
            return '';
          }
        },
        title: {
          display: true,
          text: 'Durability ↔ Aggressiveness',
          color: 'white',
          font: {
            size: 14
          }
        }
      }
    },
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0) {
        const datasetIndex = elements[0].datasetIndex;
        const index = elements[0].index;
        const clickedShoe = (chartData.datasets[datasetIndex].data[index] as any).shoe;
        setSelectedShoe(clickedShoe);
      }
    }
  };

  if (!shoes) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-neutral-500">Loading shoe matcher...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Shoe Matcher</h1>
        <p className="text-neutral-400">
          Find your perfect shoe based on user ratings and climbing characteristics
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <Input
              placeholder="Search shoes by name or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {selectedQuadrantFilter !== 'all' && (
              <Badge className="ml-2 bg-orange-500 text-black">
                1
              </Badge>
            )}
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">Filter by Category</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedQuadrantFilter('all')}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                variant={selectedQuadrantFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedQuadrantFilter('all')}
                className={selectedQuadrantFilter === 'all' ? 'bg-orange-500 text-black' : 'bg-neutral-800 border-neutral-700 text-white'}
              >
                All
              </Button>
              {Object.entries(quadrants).map(([key, quadrant]) => (
                <Button
                  key={key}
                  variant={selectedQuadrantFilter === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedQuadrantFilter(key)}
                  className={selectedQuadrantFilter === key ? 'bg-orange-500 text-black' : 'bg-neutral-800 border-neutral-700 text-white'}
                >
                  {quadrant.name.split(' ')[0]}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        <div className="text-sm text-neutral-500">
          Showing {shoePositions.length} of {shoes?.length || 0} shoes
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
        <div className="h-[600px]">
          <Scatter ref={chartRef} data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Selected Shoe Details */}
      {selectedShoe && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card className="bg-neutral-950 border-neutral-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-neutral-900 rounded-lg overflow-hidden flex-shrink-0">
                  <ShoeImage
                    brand={selectedShoe.brand}
                    shoeName={selectedShoe.name}
                    imageUrl={selectedShoe.imageUrl ?? undefined}
                    className="p-2"
                    transformation={[{ height: 80, width: 80, crop: 'at_max', format: 'png' }]}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{selectedShoe.name}</h3>
                  <p className="text-neutral-400 mb-3">{selectedShoe.brand}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-neutral-500">Comfort</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-orange-500" />
                        <p className="text-sm text-white">{selectedShoe.avgComfortScore?.toFixed(1) || 'No rating'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Performance</p>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-orange-500" />
                        <p className="text-sm text-white">{selectedShoe.avgPerformanceRating?.toFixed(1) || 'No rating'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Durability</p>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-orange-500" />
                        <p className="text-sm text-white">{selectedShoe.avgDurabilityRating?.toFixed(1) || 'No rating'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Aggressiveness</p>
                      <p className="text-sm text-white capitalize">{selectedShoe.aggressiveness.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedShoe(null)}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(quadrants).map(([key, quadrant]) => (
          <div key={key} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: quadrant.color.replace('0.2', '1') }}></div>
              <h4 className="font-semibold text-white">{quadrant.name}</h4>
            </div>
            <p className="text-xs text-neutral-400 mb-2">{quadrant.description}</p>
            <div className="flex flex-wrap gap-1">
              {quadrant.characteristics.slice(0, 2).map((char) => (
                <Badge key={char} variant="secondary" className="text-xs">
                  {char}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
