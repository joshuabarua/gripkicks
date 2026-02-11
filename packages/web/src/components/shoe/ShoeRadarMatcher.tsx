"use client";

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import ShoeImage from '@/components/ShoeImage';
import { useShoeScoring } from '@/hooks/useShoeScoring';
import { useFootProfileStore } from '@/stores/footProfileStore';
import type { Doc } from 'convex/_generated/dataModel';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Target, Zap, Shield, Heart, Search, X, Plus, Star, User, TrendingUp } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title
);

type Shoe = Doc<'shoes'>;

interface ShoeComparison {
  shoe: Shoe;
  metrics: {
    comfort: number;
    performance: number;
    durability: number;
    aggressiveness: number;
    versatility: number;
  };
  color: string;
  score: number;
  breakdown: {
    footTypeCompatibility: number;
    volumeCompatibility: number;
    userPreferenceMatch: number;
    communityApproval: number;
    overallRating: number;
  };
}

const colors = [
  'rgba(255, 99, 132, 0.2)',  // Red
  'rgba(54, 162, 235, 0.2)',  // Blue
  'rgba(255, 206, 86, 0.2)',  // Yellow
  'rgba(75, 192, 192, 0.2)',  // Green
  'rgba(153, 102, 255, 0.2)', // Purple
  'rgba(255, 159, 64, 0.2)',  // Orange
];

const borderColors = [
  'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(75, 192, 192, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
];

export function ShoeRadarMatcher() {
  const { profile: footProfile } = useFootProfileStore();
  const [selectedShoes, setSelectedShoes] = useState<ShoeComparison[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    comfort: 3,
    performance: 3,
    durability: 3,
  });

  // Get scored shoes with intelligent ranking
  const { scoredShoes, isLoading } = useShoeScoring(userPreferences);

  // Get top recommendations based on foot profile
  const topRecommendations = useMemo(() => {
    return scoredShoes.slice(0, 10);
  }, [scoredShoes]);

  // Add shoe to comparison
  const addShoeToComparison = useCallback((shoeScore: typeof scoredShoes[0]) => {
    if (!shoeScore) return;

    if (selectedShoes.length >= 6) {
      // Remove oldest shoe if we have too many
      setSelectedShoes(prev => prev.slice(1));
    }
    
    const existingIndex = selectedShoes.findIndex(comp => comp.shoe._id === shoeScore.shoe._id);
    if (existingIndex === -1) {
      const newComparison: ShoeComparison = {
        shoe: shoeScore.shoe,
        metrics: shoeScore.metrics,
        color: colors[selectedShoes.length % colors.length],
        score: shoeScore.totalScore,
        breakdown: shoeScore.breakdown,
      };
      setSelectedShoes(prev => [...prev, newComparison]);
    }
    setShowAddPanel(false);
  }, [selectedShoes]);

  // Remove shoe from comparison
  const removeShoeFromComparison = useCallback((shoeId: string) => {
    setSelectedShoes(prev => prev.filter(comp => comp.shoe._id !== shoeId));
  }, []);

  // Filter shoes for search
  const filteredShoes = useMemo(() => {
    if (!scoredShoes) return [];
    
    return scoredShoes.filter(shoeScore => 
      !selectedShoes.some(comp => comp.shoe._id === shoeScore.shoe._id) &&
      (shoeScore.shoe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       shoeScore.shoe.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [scoredShoes, selectedShoes, searchQuery]);

  // Prepare radar chart data
  const radarData = useMemo(() => {
    const datasets = selectedShoes.map((comparison, index) => ({
      label: `${comparison.shoe.brand} ${comparison.shoe.name} (Score: ${comparison.score.toFixed(1)})`,
      data: [
        comparison.metrics.comfort,
        comparison.metrics.performance,
        comparison.metrics.durability,
        comparison.metrics.aggressiveness,
        comparison.metrics.versatility
      ],
      backgroundColor: comparison.color,
      borderColor: borderColors[index % borderColors.length],
      borderWidth: 2,
      pointBackgroundColor: borderColors[index % borderColors.length],
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: borderColors[index % borderColors.length],
    }));

    return {
      labels: ['Comfort', 'Performance', 'Durability', 'Aggressiveness', 'Versatility'],
      datasets
    };
  }, [selectedShoes]);

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
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.r;
            const metric = context.label;
            return `${label} - ${metric}: ${value.toFixed(1)}`;
          }
        }
      }
    },
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        pointLabels: {
          color: 'white',
          font: {
            size: 12
          }
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          backdropColor: 'transparent',
          stepSize: 1
        },
        min: 0,
        max: 5
      }
    }
  };

  if (isLoading) {
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
        <h1 className="text-3xl font-bold text-white mb-2">Shoe Radar Matcher</h1>
        <p className="text-neutral-400">
          Compare climbing shoes across multiple dimensions with interactive radar charts
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Add Shoe Button */}
          <Button
            onClick={() => setShowAddPanel(!showAddPanel)}
            disabled={selectedShoes.length >= 6}
            className="bg-orange-500 hover:bg-orange-600 text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Shoe ({selectedShoes.length}/6)
          </Button>

          {/* Clear All */}
          {selectedShoes.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setSelectedShoes([])}
              className="bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Add Shoe Panel */}
        {showAddPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white">Select Shoes to Compare</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddPanel(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input
                placeholder="Search shoes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
              />
            </div>

            {/* Shoe List */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredShoes.slice(0, 10).map((shoeScore) => (
                <div
                  key={shoeScore.shoe._id}
                  className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 cursor-pointer transition-colors"
                  onClick={() => addShoeToComparison(shoeScore)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-neutral-700 rounded-lg overflow-hidden">
                      <ShoeImage
                        brand={shoeScore.shoe.brand}
                        shoeName={shoeScore.shoe.name}
                        imageUrl={shoeScore.shoe.imageUrl ?? undefined}
                        className="p-1"
                        transformation={[{ height: 48, width: 48, crop: 'at_max', format: 'png' }]}
                      />
                    </div>
                    <div>
                      <p className="text-white font-medium">{shoeScore.shoe.name}</p>
                      <p className="text-neutral-400 text-sm">{shoeScore.shoe.brand}</p>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-orange-500" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Top Recommendations */}
      {scoredShoes.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Top Picks For You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topRecommendations.slice(0, 3).map((rec, index) => {
              const matchPercent = ((rec.totalScore / 5) * 100).toFixed(0);
              const isAlreadySelected = selectedShoes.some(comp => comp.shoe._id === rec.shoe._id);
              return (
                <Card
                  key={rec.shoe._id}
                  className={`bg-neutral-900 border-neutral-800 relative overflow-hidden ${index === 0 ? 'ring-1 ring-orange-500/50' : ''}`}
                >
                  {index === 0 && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                      Best Match
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-14 h-14 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                        <ShoeImage
                          brand={rec.shoe.brand}
                          shoeName={rec.shoe.name}
                          imageUrl={rec.shoe.imageUrl ?? undefined}
                          className="p-1"
                          transformation={[{ height: 56, width: 56, crop: 'at_max', format: 'png' }]}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate">{rec.shoe.name}</p>
                        <p className="text-neutral-400 text-sm">{rec.shoe.brand}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-orange-500" />
                        <span className="text-white font-semibold">{matchPercent}%</span>
                        <span className="text-neutral-500 text-xs">match</span>
                      </div>
                      <Button
                        size="sm"
                        disabled={isAlreadySelected || selectedShoes.length >= 6}
                        onClick={() => addShoeToComparison(rec)}
                        className="bg-orange-500 hover:bg-orange-600 text-black text-xs h-7 disabled:opacity-40"
                      >
                        {isAlreadySelected ? 'Added' : 'Compare'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : !isLoading && (
        <div className="mb-8 p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-center">
          <User className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
          <p className="text-neutral-400 text-sm">
            Complete your foot profile for personalized recommendations
          </p>
        </div>
      )}

      {/* Radar Chart */}
      {selectedShoes.length > 0 ? (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
          <div className="h-[500px]">
            <Radar data={radarData} options={chartOptions} />
          </div>
        </div>
      ) : (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Shoes Selected</h3>
          <p className="text-neutral-400 mb-4">
            Add up to 6 shoes to compare their characteristics on the radar chart
          </p>
          <Button
            onClick={() => setShowAddPanel(true)}
            className="bg-orange-500 hover:bg-orange-600 text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Shoe
          </Button>
        </div>
      )}

      {/* Selected Shoes Details */}
      {selectedShoes.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Selected Shoes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedShoes.map((comparison, index) => (
              <Card key={comparison.shoe._id} className="bg-neutral-900 border-neutral-800">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: borderColors[index % borderColors.length] }}
                      ></div>
                      <div>
                        <h4 className="text-white font-medium">{comparison.shoe.name}</h4>
                        <p className="text-neutral-400 text-sm">{comparison.shoe.brand}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeShoeFromComparison(comparison.shoe._id)}
                      className="text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Comfort</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-orange-500" />
                        <span className="text-sm text-white">{comparison.metrics.comfort.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Performance</span>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-orange-500" />
                        <span className="text-sm text-white">{comparison.metrics.performance.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Durability</span>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-orange-500" />
                        <span className="text-sm text-white">{comparison.metrics.durability.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Aggressiveness</span>
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3 text-orange-500" />
                        <span className="text-sm text-white">{comparison.metrics.aggressiveness.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Versatility</span>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-orange-500" />
                        <span className="text-sm text-white">{comparison.metrics.versatility.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
