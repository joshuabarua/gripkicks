'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Footprints, 
  Plus, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  User,
  Camera,
  Star,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { fetchApi } from '@/lib/api-client'
import { ShoeImage } from '@/components/ShoeImage'
import { ShoeSearch } from '@/components/ShoeSearch'
import { shoeSizes } from '@/constants/shoe-data'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface Shoe {
  _id: string
  name: string
  brand: string
  imageUrl?: string
}

type OnboardingStep = 'welcome' | 'profile' | 'foot-data' | 'first-shoe' | 'complete'

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, isPending: sessionLoading } = useSession()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedShoe, setSelectedShoe] = useState<Shoe | null>(null)
  const [shoeFormData, setShoeFormData] = useState({
    size: '',
    condition: 'new' as const,
    comfort: 5,
    performance: 5,
    notes: ''
  })

  // Profile data
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    image: ''
  })

  // Foot data
  const [footShape, setFootShape] = useState('')
  const [footVolume, setFootVolume] = useState('')

  const steps: { key: OnboardingStep; title: string; description: string }[] = [
    { key: 'welcome', title: 'Welcome to GripKicks', description: 'Let\'s set up your profile' },
    { key: 'profile', title: 'Your Profile', description: 'Tell us about yourself' },
    { key: 'foot-data', title: 'Foot Profile', description: 'Help us understand your feet' },
    { key: 'first-shoe', title: 'Your First Shoe', description: 'Add a climbing shoe to your collection' },
    { key: 'complete', title: 'All Set!', description: 'You\'re ready to climb' }
  ]

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push('/auth')
      return
    }

    // Calculate progress based on current step
    const stepIndex = steps.findIndex(s => s.key === currentStep)
    setProgress(((stepIndex + 1) / steps.length) * 100)
  }, [currentStep, session, sessionLoading, router])

  const handleNext = async () => {
    if (currentStep === 'profile') {
      // Save profile data
      setIsLoading(true)
      try {
        await fetchApi('/api/v1/profile', {
          method: 'PUT',
          body: JSON.stringify(profileData)
        })
      } catch (error) {
        console.error('Failed to save profile:', error)
      } finally {
        setIsLoading(false)
      }
    } else if (currentStep === 'foot-data') {
      // Save foot data
      setIsLoading(true)
      try {
        await fetchApi('/api/v1/profile', {
          method: 'PUT',
          body: JSON.stringify({ footShape, footVolume })
        })
      } catch (error) {
        console.error('Failed to save foot data:', error)
      } finally {
        setIsLoading(false)
      }
    } else if (currentStep === 'first-shoe') {
      // Save shoe and complete onboarding
      if (!selectedShoe) return
      
      setIsLoading(true)
      try {
        // Add shoe to stash
        const shoeResponse = await fetchApi('/api/v1/stash', {
          method: 'POST',
          body: JSON.stringify({ 
            shoeId: selectedShoe._id,
            ...shoeFormData
          })
        })

        if (shoeResponse.isOk() && shoeResponse.value.success) {
          // Complete onboarding
          const onboardingResponse = await fetchApi('/api/v1/users/onboarding', {
            method: 'POST',
            body: JSON.stringify({
              footShape,
              favoriteShoeId: selectedShoe._id
            })
          });
          
          if (!onboardingResponse.isOk()) {
            console.error('Failed to complete onboarding:', onboardingResponse.error);
          }
        } else {
          console.error('Failed to add shoe to stash');
        }
      } catch (error) {
        console.error('Failed to complete onboarding:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Move to next step
    const currentIndex = steps.findIndex(s => s.key === currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key)
    }
  }

  const handlePrevious = () => {
    const currentIndex = steps.findIndex(s => s.key === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key)
    }
  }

  const handleSkipOnboarding = async () => {
    // Mark onboarding as complete without data
    try {
      const result = await fetchApi('/api/v1/users/onboarding', {
        method: 'POST',
        body: JSON.stringify({})
      });
      
      if (result.isOk()) {
        router.push('/stash');
      } else {
        console.error('Failed to skip onboarding:', result.error);
      }
    } catch (error) {
      console.error('Failed to skip onboarding:', error)
    }
  }

  const handleFinish = () => {
    router.push('/stash')
  }

  if (sessionLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-medium text-gray-600">
              Step {steps.findIndex(s => s.key === currentStep) + 1} of {steps.length}
            </h2>
            <button 
              onClick={handleSkipOnboarding}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip for now
            </button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 'welcome' && (
              <Card className="text-center">
                <CardHeader className="pb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold">Welcome to GripKicks!</CardTitle>
                  <CardDescription className="text-lg">
                    Your personal climbing shoe companion
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4 text-left">
                    <div className="p-4 rounded-lg bg-blue-50">
                      <Footprints className="w-8 h-8 text-blue-600 mb-2" />
                      <h3 className="font-semibold">Track Your Feet</h3>
                      <p className="text-sm text-gray-600">Understand your foot shape for better shoe selection</p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-50">
                      <Star className="w-8 h-8 text-purple-600 mb-2" />
                      <h3 className="font-semibold">Rate Your Shoes</h3>
                      <p className="text-sm text-gray-600">Keep track of comfort and performance for each pair</p>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-50">
                      <Plus className="w-8 h-8 text-amber-600 mb-2" />
                      <h3 className="font-semibold">Find Your Match</h3>
                      <p className="text-sm text-gray-600">Get personalized recommendations based on your data</p>
                    </div>
                  </div>
                  <Button onClick={handleNext} size="lg" className="w-full">
                    Let's Get Started
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {currentStep === 'profile' && (
              <Card>
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle>Tell Us About Yourself</CardTitle>
                  <CardDescription>
                    This information helps us personalize your experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handlePrevious}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button onClick={handleNext} disabled={!profileData.name || isLoading}>
                      {isLoading ? 'Saving...' : 'Next'}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 'foot-data' && (
              <Card>
                <CardHeader>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Footprints className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle>What's Your Foot Shape?</CardTitle>
                  <CardDescription>
                    This helps us recommend shoes that will fit you best
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">Foot Shape</Label>
                    <div className="grid gap-3 mt-2">
                      {[
                        { value: 'egyptian', label: 'Egyptian', desc: 'Big toe is longest' },
                        { value: 'roman', label: 'Roman', desc: 'First three toes similar length' },
                        { value: 'greek', label: 'Greek', desc: 'Second toe is longest' },
                        { value: 'germanic', label: 'Germanic', desc: 'Big toe and others equal' },
                        { value: 'celtic', label: 'Celtic', desc: 'Big toe and second toe equal' }
                      ].map((shape) => (
                        <button
                          key={shape.value}
                          onClick={() => setFootShape(shape.value)}
                          className={`p-4 rounded-lg border text-left transition-colors ${
                            footShape === shape.value
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">{shape.label}</div>
                          <div className="text-sm text-gray-600">{shape.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Foot Volume</Label>
                    <Select value={footVolume} onValueChange={setFootVolume}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select your foot volume" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Narrow feet</SelectItem>
                        <SelectItem value="medium">Medium - Average width</SelectItem>
                        <SelectItem value="high">High - Wide feet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handlePrevious}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button onClick={handleNext} disabled={!footShape || !footVolume || isLoading}>
                      {isLoading ? 'Saving...' : 'Next'}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 'first-shoe' && (
              <Card>
                <CardHeader>
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-amber-600" />
                  </div>
                  <CardTitle>Add Your First Climbing Shoe</CardTitle>
                  <CardDescription>
                    Search for a shoe and rate your experience with it
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Shoe Search */}
                  <div>
                    <Label className="text-base font-medium">Search Shoes</Label>
                    <div className="mt-2">
                      <ShoeSearch 
                        onShoeSelect={setSelectedShoe}
                        selectedShoe={selectedShoe}
                      />
                    </div>
                  </div>

                  {/* Selected Shoe */}
                  {selectedShoe && (
                    <div className="p-4 rounded-lg border bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-white rounded-lg overflow-hidden">
                          <ShoeImage
                            brand={selectedShoe.brand}
                            shoeName={selectedShoe.name}
                            imageUrl={selectedShoe.imageUrl}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold">{selectedShoe.name}</h3>
                          <p className="text-sm text-gray-600">{selectedShoe.brand}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shoe Details Form */}
                  {selectedShoe && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="size">Size</Label>
                          <Select value={shoeFormData.size} onValueChange={(value) => setShoeFormData({ ...shoeFormData, size: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              {shoeSizes.map((size) => (
                                <SelectItem key={size.value} value={size.value}>
                                  {size.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="condition">Condition</Label>
                          <Select value={shoeFormData.condition} onValueChange={(value: any) => setShoeFormData({ ...shoeFormData, condition: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="like-new">Like New</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="worn">Worn</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Comfort Rating</Label>
                          <div className="flex items-center gap-2 mt-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => setShoeFormData({ ...shoeFormData, comfort: rating })}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  shoeFormData.comfort >= rating
                                    ? 'border-amber-500 bg-amber-50'
                                    : 'border-gray-300'
                                }`}
                              >
                                {rating}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label>Performance Rating</Label>
                          <div className="flex items-center gap-2 mt-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => setShoeFormData({ ...shoeFormData, performance: rating })}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  shoeFormData.performance >= rating
                                    ? 'border-amber-500 bg-amber-50'
                                    : 'border-gray-300'
                                }`}
                              >
                                {rating}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Textarea
                          id="notes"
                          value={shoeFormData.notes}
                          onChange={(e) => setShoeFormData({ ...shoeFormData, notes: e.target.value })}
                          placeholder="Any additional notes about this shoe..."
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handlePrevious}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button onClick={handleNext} disabled={!selectedShoe || !shoeFormData.size || isLoading}>
                      {isLoading ? 'Completing...' : 'Complete Setup'}
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 'complete' && (
              <Card className="text-center">
                <CardHeader className="pb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold">You're All Set!</CardTitle>
                  <CardDescription className="text-lg">
                    Your profile is ready and you can start exploring
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Link href="/footchecker">
                      <Button variant="outline" className="w-full h-auto p-4 flex-col">
                        <Footprints className="w-8 h-8 mb-2" />
                        <span>Foot Lab</span>
                      </Button>
                    </Link>
                    <Link href="/stash">
                      <Button variant="outline" className="w-full h-auto p-4 flex-col">
                        <Plus className="w-8 h-8 mb-2" />
                        <span>My Shoes</span>
                      </Button>
                    </Link>
                    <Link href="/findmyshoe">
                      <Button variant="outline" className="w-full h-auto p-4 flex-col">
                        <Star className="w-8 h-8 mb-2" />
                        <span>Find Shoes</span>
                      </Button>
                    </Link>
                  </div>
                  <Button onClick={handleFinish} size="lg" className="w-full">
                    Go to My Shoe Sanctuary
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
