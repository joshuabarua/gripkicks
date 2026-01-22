'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ChevronRight, ChevronLeft, Check } from 'lucide-react';
/* eslint-disable @next/next/no-img-element */
import { fetchApi } from '@/lib/api-client';
import { cn } from '@/lib/utils';

type FootShape = 'egyptian' | 'roman' | 'greek' | 'germanic' | 'celtic';

interface Shoe {
  id: string;
  name: string;
  brand: string;
  imageUrl?: string;
}

const footShapeInfo: Record<FootShape, { name: string; description: string; icon: string }> = {
  egyptian: {
    name: 'Egyptian',
    description: 'Big toe is the longest, toes descend in length',
    icon: '🦶',
  },
  roman: {
    name: 'Roman',
    description: 'First three toes are similar length',
    icon: '🦶',
  },
  greek: {
    name: 'Greek',
    description: 'Second toe is longer than the big toe',
    icon: '🦶',
  },
  germanic: {
    name: 'Germanic',
    description: 'Big toe is longest, other toes are similar length',
    icon: '🦶',
  },
  celtic: {
    name: 'Celtic',
    description: 'Second toe longest, big toe and third toe similar',
    icon: '🦶',
  },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [footShape, setFootShape] = useState<FootShape | null>(null);
  const [favoriteShoeId, setFavoriteShoeId] = useState<string | null>(null);
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingShoes, setLoadingShoes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadShoes() {
      try {
        const response = await fetchApi<{ success: boolean; data: Shoe[] }>('/api/v1/shoes');
        if (response.success) {
          setShoes(response.data);
        }
      } catch (err) {
        console.error('Failed to load shoes:', err);
      } finally {
        setLoadingShoes(false);
      }
    }
    loadShoes();
  }, []);

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      await fetchApi('/api/v1/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          footShape,
          favoriteShoeId,
        }),
      });
      router.push('/');
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await fetchApi('/api/v1/onboarding', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      router.push('/');
    } catch (err) {
      console.error('Skip error:', err);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {step === 1 ? 'What\'s Your Foot Shape?' : 'Pick Your Favorite Shoe'}
                </CardTitle>
                <CardDescription>
                  {step === 1
                    ? 'This helps us recommend the best climbing shoes for you'
                    : 'Select a shoe you love or have experience with'}
                </CardDescription>
              </div>
              <div className="text-sm text-muted-foreground">
                Step {step} of 2
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(Object.keys(footShapeInfo) as FootShape[]).map((shape) => (
                    <button
                      key={shape}
                      onClick={() => setFootShape(shape)}
                      className={cn(
                        'flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left',
                        footShape === shape
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{footShapeInfo[shape].icon}</span>
                        <span className="font-medium">{footShapeInfo[shape].name}</span>
                        {footShape === shape && (
                          <Check className="h-4 w-4 text-primary ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {footShapeInfo[shape].description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {loadingShoes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : shoes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No shoes available yet. You can skip this step.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                    {shoes.map((shoe) => (
                      <button
                        key={shoe.id}
                        onClick={() => setFavoriteShoeId(shoe.id)}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left',
                          favoriteShoeId === shoe.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        {shoe.imageUrl ? (
                          <img
                            src={shoe.imageUrl}
                            alt={shoe.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            👟
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{shoe.name}</p>
                          <p className="text-sm text-muted-foreground">{shoe.brand}</p>
                        </div>
                        {favoriteShoeId === shoe.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="text-sm text-red-500 mt-4">{error}</div>
            )}

            <div className="flex items-center justify-between mt-6">
              {step === 1 ? (
                <>
                  <Button variant="ghost" onClick={handleSkip} disabled={loading}>
                    Skip for now
                  </Button>
                  <Button onClick={() => setStep(2)} disabled={!footShape}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <Button onClick={handleComplete} disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Complete
                        <Check className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
