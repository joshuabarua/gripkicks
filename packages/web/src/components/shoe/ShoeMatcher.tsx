"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import ShoeImage from "@/components/ShoeImage";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Target, Zap, Activity, Clock, Search, Filter, X } from "lucide-react";

type Shoe = Doc<"shoes">;

interface GridPosition {
  x: number; // -1 to 1 (Bouldering to Sport)
  y: number; // -1 to 1 (Technical to Endurance)
}

interface QuadrantInfo {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  characteristics: string[];
}

const quadrants: Record<string, QuadrantInfo> = {
  "technical-bouldering": {
    name: "Technical Bouldering",
    description: "Aggressive shoes for precise, powerful movements",
    icon: <Target className="w-4 h-4" />,
    color: "bg-red-500/20 border-red-500/50",
    characteristics: [
      "High aggressiveness",
      "Stiff",
      "Downturned",
      "Precise fit",
    ],
  },
  "endurance-bouldering": {
    name: "Endurance Bouldering",
    description: "Comfortable shoes for long bouldering sessions",
    icon: <Activity className="w-4 h-4" />,
    color: "bg-blue-500/20 border-blue-500/50",
    characteristics: [
      "Moderate aggressiveness",
      "Flexible",
      "Comfortable",
      "All-day wear",
    ],
  },
  "technical-sport": {
    name: "Technical Sport",
    description: "Precision shoes for difficult sport climbing",
    icon: <Zap className="w-4 h-4" />,
    color: "bg-brand-red/20 border-brand-red/50",
    characteristics: [
      "High performance",
      "Stiff edge",
      "Sensitive",
      "Precise placement",
    ],
  },
  "endurance-sport": {
    name: "Endurance Sport",
    description: "Comfortable shoes for long sport routes",
    icon: <Clock className="w-4 h-4" />,
    color: "bg-green-500/20 border-green-500/50",
    characteristics: [
      "Comfortable fit",
      "Moderate stiffness",
      "Durable",
      "Multi-pitch ready",
    ],
  },
};

export function ShoeMatcher() {
  const shoes = useQuery(api.shoes.listAll);
  const [selectedShoe, setSelectedShoe] = useState<Shoe | null>(null);
  const [hoveredQuadrant, setHoveredQuadrant] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuadrantFilter, setSelectedQuadrantFilter] =
    useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Calculate shoe position on grid based on characteristics
  const calculateShoePosition = useCallback((shoe: Shoe): GridPosition => {
    let x = 0; // Bouldering (-1) to Sport (1)
    let y = 0; // Technical (-1) to Endurance (1)

    // X-axis: Bouldering vs Sport
    if (shoe.climbingDiscipline === "bouldering") {
      x = -0.8;
    } else if (shoe.climbingDiscipline === "sport") {
      x = 0.8;
    } else if (shoe.climbingDiscipline === "trad") {
      x = 0.6; // Trad leans toward sport climbing
    } else if (shoe.climbingDiscipline === "all_around") {
      x = 0; // Center
    } else if (shoe.climbingDiscipline === "indoor") {
      x = -0.4; // Indoor leans toward bouldering
    }

    // Y-axis: Technical vs Endurance
    if (shoe.aggressiveness === "very_high" || shoe.aggressiveness === "high") {
      y = -0.8; // More aggressive = more technical
    } else if (shoe.aggressiveness === "low") {
      y = 0.8; // Less aggressive = more endurance
    } else {
      y = 0; // Moderate aggressiveness = center
    }

    // Adjust based on stiffness
    if (shoe.stiffness === "very_stiff" || shoe.stiffness === "stiff") {
      y -= 0.2; // Stiffer = more technical
    } else if (shoe.stiffness === "soft") {
      y += 0.2; // Softer = more endurance
    }

    // Clamp values to grid bounds
    return {
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    };
  }, []);

  // Get quadrant for a position
  const getQuadrant = (position: GridPosition): string => {
    if (position.x < 0 && position.y < 0) return "technical-bouldering";
    if (position.x < 0 && position.y >= 0) return "endurance-bouldering";
    if (position.x >= 0 && position.y < 0) return "technical-sport";
    return "endurance-sport";
  };

  // Calculate positions for all shoes with filtering
  const shoePositions = useMemo(() => {
    if (!shoes) return [];

    let filteredShoes = shoes;

    // Apply search filter
    if (searchQuery.trim()) {
      filteredShoes = filteredShoes.filter(
        (shoe) =>
          shoe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shoe.brand.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply quadrant filter
    if (selectedQuadrantFilter !== "all") {
      filteredShoes = filteredShoes.filter((shoe) => {
        const position = calculateShoePosition(shoe);
        return getQuadrant(position) === selectedQuadrantFilter;
      });
    }

    return filteredShoes.map((shoe) => ({
      shoe,
      position: calculateShoePosition(shoe),
      quadrant: getQuadrant(calculateShoePosition(shoe)),
    }));
  }, [shoes, calculateShoePosition, searchQuery, selectedQuadrantFilter]);

  // Filter shoes by quadrant
  const getShoesInQuadrant = (quadrant: string) => {
    return shoePositions.filter((item) => item.quadrant === quadrant);
  };

  if (!shoes) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red mx-auto mb-4"></div>
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
          Find your perfect shoe based on climbing style and preferences
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
            {selectedQuadrantFilter !== "all" && (
              <Badge className="ml-2 bg-brand-red text-black">1</Badge>
            )}
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">
                Filter by Quadrant
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedQuadrantFilter("all")}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                variant={
                  selectedQuadrantFilter === "all" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedQuadrantFilter("all")}
                className={
                  selectedQuadrantFilter === "all"
                    ? "bg-brand-red text-black"
                    : "bg-neutral-800 border-neutral-700 text-white"
                }
              >
                All
              </Button>
              {Object.entries(quadrants).map(([key, quadrant]) => (
                <Button
                  key={key}
                  variant={
                    selectedQuadrantFilter === key ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedQuadrantFilter(key)}
                  className={
                    selectedQuadrantFilter === key
                      ? "bg-brand-red text-black"
                      : "bg-neutral-800 border-neutral-700 text-white"
                  }
                >
                  {quadrant.name.split(" ")[0]}
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

      {/* Grid Container */}
      <div className="relative bg-neutral-950 border border-neutral-800 rounded-2xl p-8 h-[600px]">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-full h-px bg-neutral-800"></div>
          <div className="absolute h-full w-px bg-neutral-800"></div>
        </div>

        {/* Axis Labels */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <span>Bouldering</span>
            <div className="w-20 h-px bg-neutral-700"></div>
            <span>Sport</span>
          </div>
        </div>

        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 -rotate-90">
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <span>Technical</span>
            <div className="w-20 h-px bg-neutral-700"></div>
            <span>Endurance</span>
          </div>
        </div>

        {/* Quadrants */}
        {Object.entries(quadrants).map(([key, quadrant]) => (
          <motion.div
            key={key}
            className={`absolute border-2 rounded-xl p-4 ${quadrant.color} backdrop-blur-sm transition-all duration-200 ${
              hoveredQuadrant === key ? "z-20" : "z-10"
            }`}
            style={{
              left: key.includes("bouldering") ? "2%" : "52%",
              top: key.includes("technical") ? "2%" : "52%",
              width: "46%",
              height: "46%",
            }}
            onHoverStart={() => setHoveredQuadrant(key)}
            onHoverEnd={() => setHoveredQuadrant(null)}
            whileHover={{ scale: 1.02 }}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                {quadrant.icon}
                <h3 className="font-semibold text-white">{quadrant.name}</h3>
              </div>
              <p className="text-xs text-neutral-400 mb-3">
                {quadrant.description}
              </p>

              {/* Characteristics */}
              <div className="flex flex-wrap gap-1 mb-3">
                {quadrant.characteristics.map((char) => (
                  <Badge key={char} variant="secondary" className="text-xs">
                    {char}
                  </Badge>
                ))}
              </div>

              {/* Shoe Count */}
              <div className="mt-auto">
                <p className="text-xs text-neutral-500">
                  {getShoesInQuadrant(key).length} shoes
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Shoes on Grid */}
        {shoePositions.map(({ shoe, position }) => (
          <motion.div
            key={shoe._id}
            className="absolute z-30 cursor-pointer"
            style={{
              left: `${50 + position.x * 45}%`,
              top: `${50 + position.y * 45}%`,
              transform: "translate(-50%, -50%)",
            }}
            whileHover={{ scale: 1.2, zIndex: 40 }}
            onClick={() => setSelectedShoe(shoe)}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-neutral-900 rounded-lg border border-neutral-700 overflow-hidden">
                <ShoeImage
                  brand={shoe.brand}
                  shoeName={shoe.name}
                  imageUrl={shoe.imageUrl ?? undefined}
                  className="p-1"
                  transformation={[
                    { height: 48, width: 48, crop: "at_max", format: "png" },
                  ]}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-brand-red rounded-full border-2 border-neutral-950"></div>
            </div>
          </motion.div>
        ))}

        {/* Center Point */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-4 h-4 bg-brand-red rounded-full border-2 border-neutral-950"></div>
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
                    transformation={[
                      { height: 80, width: 80, crop: "at_max", format: "png" },
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {selectedShoe.name}
                  </h3>
                  <p className="text-neutral-400 mb-3">{selectedShoe.brand}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-neutral-500">Discipline</p>
                      <p className="text-sm text-white capitalize">
                        {selectedShoe.climbingDiscipline.replace("_", " ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Aggressiveness</p>
                      <p className="text-sm text-white capitalize">
                        {selectedShoe.aggressiveness.replace("_", " ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Stiffness</p>
                      <p className="text-sm text-white capitalize">
                        {selectedShoe.stiffness}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Volume</p>
                      <p className="text-sm text-white capitalize">
                        {selectedShoe.volume}
                      </p>
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
      <div className="mt-8 text-center text-sm text-neutral-500">
        <p>
          Click on any shoe to see details • Shoes are positioned based on their
          technical characteristics
        </p>
      </div>
    </div>
  );
}
