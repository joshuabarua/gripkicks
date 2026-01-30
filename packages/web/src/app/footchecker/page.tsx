'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, Footprints } from 'lucide-react';
import { useSession } from '@/lib/auth';
import { fetchApi } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { z } from 'zod';

type FootShape = 'egyptian' | 'roman' | 'greek' | 'germanic' | 'celtic';
type FootVolume = 'low' | 'medium' | 'high';

// Zod schema for foot profile validation
const footProfileSchema = z.object({
  footShape: z.enum(['egyptian', 'roman', 'greek', 'germanic', 'celtic']),
  footVolume: z.enum(['low', 'medium', 'high']),
});

const footShapeInfo: Record<FootShape, { name: string; description: string; characteristics: string[] }> = {
  egyptian: {
    name: 'Egyptian',
    description: 'Big toe is the longest, toes descend in length',
    characteristics: [
      'Big toe longest',
      'Gradual toe length decrease',
      'Common foot type (70%)',
      'Best for: Asymmetric shoes'
    ]
  },
  roman: {
    name: 'Roman',
    description: 'First three toes are similar length',
    characteristics: [
      'First 2-3 toes equal length',
      'Square foot shape',
      'Common in Europeans',
      'Best for: Symmetric shoes'
    ]
  },
  greek: {
    name: 'Greek',
    description: 'Second toe is longer than the big toe',
    characteristics: [
      'Second toe longest (Morton\'s toe)',
      'Often needs wider shoes',
      'Pressure on second toe',
      'Best for: Shoes with roomier toe box'
    ]
  },
  germanic: {
    name: 'Germanic',
    description: 'Big toe is longest, other toes are similar length',
    characteristics: [
      'Big toe dominant',
      'Other toes similar length',
      'Broad foot shape',
      'Best for: Wide-fit shoes'
    ]
  },
  celtic: {
    name: 'Celtic',
    description: 'Second toe longest, big toe and third toe similar',
    characteristics: [
      'Second and third toes long',
      'Big toe slightly shorter',
      'Unique foot shape',
      'Best for: Asymmetric with extra room'
    ]
  },
};

const footVolumeInfo: Record<FootVolume, { name: string; description: string; characteristics: string[] }> = {
  low: {
    name: 'Low Volume',
    description: 'Narrow foot with minimal height',
    characteristics: [
      'Narrow foot width',
      'Low instep/arch',
      'Often needs tighter shoes',
      'Best for: Performance shoes with snug fit'
    ]
  },
  medium: {
    name: 'Medium Volume',
    description: 'Average foot width and height',
    characteristics: [
      'Average foot width',
      'Moderate instep/arch',
      'Fits most standard shoes',
      'Best for: All-around climbing shoes'
    ]
  },
  high: {
    name: 'High Volume',
    description: 'Wide foot with significant height',
    characteristics: [
      'Wide foot width',
      'High instep/arch',
      'Often needs roomier shoes',
      'Best for: Comfort-focused or wide-fit shoes'
    ]
  },
};

export default function FootLabPage() {
  const { data: session } = useSession();
  const [selectedFootShape, setSelectedFootShape] = useState<FootShape | null>(null);
  const [selectedFootVolume, setSelectedFootVolume] = useState<FootVolume | null>(null);
  const [savedFootShape, setSavedFootShape] = useState<FootShape | null>(null);
  const [savedFootVolume, setSavedFootVolume] = useState<FootVolume | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's current foot shape on mount
  useEffect(() => {
    if (session?.user) {
      loadUserFootProfile();
    }
  }, [session]);

  const loadUserFootProfile = async () => {
    try {
      const response = await fetchApi<{ success: boolean; data: { footShape?: string; footVolume?: string } }>('/api/v1/profile');
      if (response.success && response.data.footShape) {
        setSavedFootShape(response.data.footShape as FootShape);
        setSelectedFootShape(response.data.footShape as FootShape);
      }
      if (response.success && response.data.footVolume) {
        setSavedFootVolume(response.data.footVolume as FootVolume);
        setSelectedFootVolume(response.data.footVolume as FootVolume);
      }
    } catch (error) {
      console.error('Failed to load foot profile:', error);
    }
  };

  const saveFootProfile = async () => {
    if (!selectedFootShape || !selectedFootVolume || !session?.user) {
      setError('Please select both foot shape and volume');
      return;
    }

    // Validate with Zod
    const validationResult = footProfileSchema.safeParse({
      footShape: selectedFootShape,
      footVolume: selectedFootVolume,
    });
    
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      setError(firstError.message);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await fetchApi('/api/v1/profile', {
        method: 'PUT',
        body: JSON.stringify({ 
          footShape: selectedFootShape,
          footVolume: selectedFootVolume,
        }),
      });
      setSavedFootShape(selectedFootShape);
      setSavedFootVolume(selectedFootVolume);
    } catch (error) {
      console.error('Failed to save foot profile:', error);
      setError('Failed to save foot profile');
    } finally {
      setSaving(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Footprints className="w-12 h-12 mx-auto mb-4 text-primary" />
            <CardTitle>Foot Lab</CardTitle>
            <CardDescription>Log in to discover your foot shape</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-svh w-full bg-gradient-to-br from-purple-50 to-blue-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Footprints className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-2">Foot Lab</h1>
          <p className="text-muted-foreground text-lg">
            Discover your foot shape for better shoe recommendations
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Select Your Foot Shape
              {savedFootShape && (
                <span className="text-sm font-normal text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Saved: {footShapeInfo[savedFootShape].name}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Look at your foot and compare it to the shapes below. Click to select your foot type.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.keys(footShapeInfo) as FootShape[]).map((shape) => (
                <button
                  key={shape}
                  onClick={() => setSelectedFootShape(shape)}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left',
                    selectedFootShape === shape
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50 hover:shadow-sm'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{footShapeInfo[shape].name}</h3>
                    {selectedFootShape === shape && (
                      <Check className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {footShapeInfo[shape].description}
                  </p>

                  <ul className="space-y-1">
                    {footShapeInfo[shape].characteristics.map((char, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="w-1 h-1 bg-current rounded-full mt-1.5 flex-shrink-0" />
                        {char}
                      </li>
                    ))}
                  </ul>

                  {/* Visual representation */}
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex justify-center items-end h-16 gap-0.5">
                      {shape === 'egyptian' && (
                        <>
                          <div className="w-3 h-12 bg-primary/60 rounded-t" />
                          <div className="w-3 h-10 bg-primary/50 rounded-t" />
                          <div className="w-3 h-8 bg-primary/40 rounded-t" />
                          <div className="w-3 h-6 bg-primary/30 rounded-t" />
                          <div className="w-3 h-4 bg-primary/20 rounded-t" />
                        </>
                      )}
                      {shape === 'roman' && (
                        <>
                          <div className="w-3 h-10 bg-primary/60 rounded-t" />
                          <div className="w-3 h-10 bg-primary/60 rounded-t" />
                          <div className="w-3 h-9 bg-primary/50 rounded-t" />
                          <div className="w-3 h-7 bg-primary/40 rounded-t" />
                          <div className="w-3 h-5 bg-primary/30 rounded-t" />
                        </>
                      )}
                      {shape === 'greek' && (
                        <>
                          <div className="w-3 h-10 bg-primary/50 rounded-t" />
                          <div className="w-3 h-12 bg-primary/60 rounded-t" />
                          <div className="w-3 h-9 bg-primary/50 rounded-t" />
                          <div className="w-3 h-7 bg-primary/40 rounded-t" />
                          <div className="w-3 h-5 bg-primary/30 rounded-t" />
                        </>
                      )}
                      {shape === 'germanic' && (
                        <>
                          <div className="w-3 h-11 bg-primary/60 rounded-t" />
                          <div className="w-3 h-8 bg-primary/50 rounded-t" />
                          <div className="w-3 h-8 bg-primary/50 rounded-t" />
                          <div className="w-3 h-8 bg-primary/50 rounded-t" />
                          <div className="w-3 h-7 bg-primary/40 rounded-t" />
                        </>
                      )}
                      {shape === 'celtic' && (
                        <>
                          <div className="w-3 h-10 bg-primary/50 rounded-t" />
                          <div className="w-3 h-11 bg-primary/60 rounded-t" />
                          <div className="w-3 h-11 bg-primary/60 rounded-t" />
                          <div className="w-3 h-8 bg-primary/50 rounded-t" />
                          <div className="w-3 h-6 bg-primary/40 rounded-t" />
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Foot Volume Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Select Your Foot Volume
              {savedFootVolume && (
                <span className="text-sm font-normal text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Saved: {footVolumeInfo[savedFootVolume].name}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Foot volume refers to the overall height and width of your foot, including your instep.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {Object.entries(footVolumeInfo).map(([volume, info]) => (
                <button
                  key={volume}
                  onClick={() => setSelectedFootVolume(volume as FootVolume)}
                  className={cn(
                    "p-4 rounded-lg border-2 text-left transition-all hover:shadow-md",
                    selectedFootVolume === volume
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{info.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                    </div>
                    {selectedFootVolume === volume && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {info.characteristics.map((char, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full" />
                        {char}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <Button 
                onClick={saveFootProfile}
                disabled={!selectedFootShape || !selectedFootVolume || saving || 
                  (selectedFootShape === savedFootShape && selectedFootVolume === savedFootVolume)}
                className="min-w-[120px]"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : selectedFootShape === savedFootShape && selectedFootVolume === savedFootVolume ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Saved
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Why Your Foot Shape Matters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Understanding your foot shape helps us recommend climbing shoes that will:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Fit your toes comfortably without pressure</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Provide optimal power transfer</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Prevent toe pain and injuries</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Improve climbing performance</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
