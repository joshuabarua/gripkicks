'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Footprints, 
  Plus, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  User,
  Star,
  Sparkles,
  ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'
import { fetchApi } from '@/lib/api-client'
import ShoeImage from '@/components/ShoeImage'
import { ShoeSearch } from '@/components/ShoeSearch'
import { shoeSizes } from '@/constants/shoe-data'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FullPageLoading } from '@/components/ui/loading'
import type { Shoe } from '@/types/api'

type ShoeSizeOption = { value: string; label: string }
const isShoeSizeOption = (size: (typeof shoeSizes)[number]): size is ShoeSizeOption => {
  return 'value' in size
}

interface ApiSuccessResponse {
  success: boolean
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
    condition: 'new' as string,
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

  const steps = useMemo(() => [
    { key: 'welcome', title: 'Welcome to GripKicks', description: 'Let&apos;s set up your profile' },
    { key: 'profile', title: 'Your Profile', description: 'Tell us about yourself' },
    { key: 'foot-data', title: 'Foot Profile', description: 'Help us understand your feet' },
    { key: 'first-shoe', title: 'Your First Shoe', description: 'Add a climbing shoe to your collection' },
    { key: 'complete', title: 'All Set!', description: 'You&apos;re ready to climb' }
  ] as const, [])

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push('/auth')
      return
    }

    // Calculate progress based on current step
    const stepIndex = steps.findIndex(s => s.key === currentStep)
    setProgress(((stepIndex + 1) / steps.length) * 100)
  }, [currentStep, session, sessionLoading, router, steps])

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
        const shoeResponse = await fetchApi<ApiSuccessResponse>('/api/v1/stash', {
          method: 'POST',
          body: JSON.stringify({ 
            shoeId: selectedShoe._id,
            ...shoeFormData
          })
        })

        if (shoeResponse.isOk() && shoeResponse.value.success) {
          // Complete onboarding
          const onboardingResponse = await fetchApi<ApiSuccessResponse>('/api/v1/users/onboarding', {
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
    return <FullPageLoading text="Loading" />
  }

  const inputClasses = "bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-orange-500 focus:ring-orange-500 rounded-xl h-12"
  const stepIndex = steps.findIndex(s => s.key === currentStep)

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <section className="px-6 md:px-12 lg:px-16 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <p className="font-mono text-xs text-orange-500 tracking-[0.3em]">
                [STEP_{stepIndex + 1}_OF_{steps.length}]
              </p>
              <button 
                onClick={handleSkipOnboarding}
                className="font-sora text-xs text-neutral-500 hover:text-orange-500 transition-colors"
              >
                Skip for now
              </button>
            </div>
            <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-orange-500 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
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
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Sparkles className="w-10 h-10 text-orange-500" />
                  </motion.div>
                  <h1 className="font-tanker text-5xl md:text-6xl mb-4">
                    WELCOME TO<br /><span className="text-orange-500">GRIPKICKS</span>
                  </h1>
                  <p className="font-sora text-neutral-400 text-lg mb-10">Your personal climbing shoe companion</p>

                  <div className="grid md:grid-cols-3 gap-4 text-left mb-10">
                    {[
                      { icon: Footprints, title: 'Know Your Feet', desc: 'Tell us your foot shape so we can narrow things down' },
                      { icon: Star, title: 'Rate Your Shoes', desc: 'Track how each pair feels on comfort and performance' },
                      { icon: Plus, title: 'Find Your Fit', desc: 'Get shoe recs based on real data from your feet' },
                    ].map((item) => (
                      <div key={item.title} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 group hover:border-orange-500/30 transition-colors">
                        <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
                          <item.icon className="w-5 h-5 text-orange-500" />
                        </div>
                        <h3 className="font-tanker text-lg text-white mb-1">{item.title}</h3>
                        <p className="font-sora text-neutral-500 text-xs">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-black font-tanker text-xl py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
                  >
                    LET&apos;S GET STARTED
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              )}

              {currentStep === 'profile' && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
                  <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6">
                    <User className="w-7 h-7 text-orange-500" />
                  </div>
                  <h2 className="font-tanker text-3xl mb-2">TELL US ABOUT YOURSELF</h2>
                  <p className="font-sora text-neutral-500 text-sm mb-8">This information helps us personalize your experience</p>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[NAME]</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        placeholder="John Doe"
                        className={inputClasses}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[PHONE_OPTIONAL]</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                        className={inputClasses}
                      />
                    </div>
                    <div className="flex justify-between pt-4">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePrevious} className="border border-neutral-700 hover:border-orange-500/30 text-neutral-400 font-sora text-sm px-6 py-3 rounded-2xl transition-all flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" /> Back
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNext} disabled={!profileData.name || isLoading} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black font-tanker text-lg px-8 py-3 rounded-2xl transition-colors flex items-center gap-2">
                        {isLoading ? 'SAVING...' : 'NEXT'} <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'foot-data' && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
                  <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6">
                    <Footprints className="w-7 h-7 text-orange-500" />
                  </div>
                  <h2 className="font-tanker text-3xl mb-2">FOOT SHAPE</h2>
                  <p className="font-sora text-neutral-500 text-sm mb-8">This helps us recommend shoes that will fit you best</p>

                  <div className="space-y-6">
                    <div>
                      <Label className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[SELECT_SHAPE]</Label>
                      <div className="grid gap-3 mt-3">
                        {[
                          { value: 'egyptian', label: 'Egyptian', desc: 'Big toe is longest' },
                          { value: 'roman', label: 'Roman', desc: 'First three toes similar length' },
                          { value: 'greek', label: 'Greek', desc: 'Second toe is longest' },
                          { value: 'germanic', label: 'Germanic', desc: 'Big toe and others equal' },
                          { value: 'celtic', label: 'Celtic', desc: 'Big toe and second toe equal' }
                        ].map((shape) => (
                          <motion.button
                            key={shape.value}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setFootShape(shape.value)}
                            className={`p-4 rounded-2xl border text-left transition-all ${
                              footShape === shape.value
                                ? 'border-orange-500 bg-orange-500/10'
                                : 'border-neutral-800 hover:border-neutral-700 bg-neutral-800/50'
                            }`}
                          >
                            <div className="font-sora font-medium text-white">{shape.label}</div>
                            <div className="font-sora text-xs text-neutral-500">{shape.desc}</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[FOOT_VOLUME]</Label>
                      <Select value={footVolume} onValueChange={setFootVolume}>
                        <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white rounded-xl h-12 focus:border-orange-500 focus:ring-orange-500">
                          <SelectValue placeholder="Select your foot volume" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800 border-neutral-700">
                          <SelectItem value="low">Low - Narrow feet</SelectItem>
                          <SelectItem value="medium">Medium - Average width</SelectItem>
                          <SelectItem value="high">High - Wide feet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-between pt-4">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePrevious} className="border border-neutral-700 hover:border-orange-500/30 text-neutral-400 font-sora text-sm px-6 py-3 rounded-2xl transition-all flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" /> Back
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNext} disabled={!footShape || !footVolume || isLoading} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black font-tanker text-lg px-8 py-3 rounded-2xl transition-colors flex items-center gap-2">
                        {isLoading ? 'SAVING...' : 'NEXT'} <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'first-shoe' && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
                  <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6">
                    <Plus className="w-7 h-7 text-orange-500" />
                  </div>
                  <h2 className="font-tanker text-3xl mb-2">ADD YOUR FIRST SHOE</h2>
                  <p className="font-sora text-neutral-500 text-sm mb-8">Search for a shoe and rate your experience with it</p>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[SEARCH_SHOES]</Label>
                      <div className="mt-2">
                        <ShoeSearch 
                          onShoeSelect={setSelectedShoe}
                          selectedShoe={selectedShoe}
                        />
                      </div>
                    </div>

                    {selectedShoe && (
                      <div className="p-4 rounded-2xl border border-orange-500/20 bg-orange-500/5">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-neutral-800 rounded-xl overflow-hidden">
                            <ShoeImage
                              brand={selectedShoe.brand}
                              shoeName={selectedShoe.name}
                              imageUrl={selectedShoe.imageUrl}
                              slug={selectedShoe.slug}
                              className="w-full h-full object-contain p-2"
                            />
                          </div>
                          <div>
                            <h3 className="font-sora font-semibold text-white">{selectedShoe.name}</h3>
                            <p className="font-mono text-[10px] text-neutral-500">{selectedShoe.brand}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedShoe && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[SIZE]</Label>
                            <Select value={shoeFormData.size} onValueChange={(value) => setShoeFormData({ ...shoeFormData, size: value })}>
                              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white rounded-xl h-12 focus:border-orange-500">
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent className="bg-neutral-800 border-neutral-700">
                                {shoeSizes.filter(isShoeSizeOption).map((size) => (
                                  <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[CONDITION]</Label>
                            <Select value={shoeFormData.condition} onValueChange={(value: string) => setShoeFormData({ ...shoeFormData, condition: value })}>
                              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white rounded-xl h-12 focus:border-orange-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-neutral-800 border-neutral-700">
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="like-new">Like New</SelectItem>
                                <SelectItem value="good">Good</SelectItem>
                                <SelectItem value="worn">Worn</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[COMFORT]</Label>
                            <div className="flex items-center gap-2 mt-2">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <motion.button
                                  key={rating}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setShoeFormData({ ...shoeFormData, comfort: rating })}
                                  className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-tanker text-sm transition-all ${
                                    shoeFormData.comfort >= rating
                                      ? 'border-orange-500 bg-orange-500/20 text-orange-500'
                                      : 'border-neutral-700 text-neutral-600'
                                  }`}
                                >
                                  {rating}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[PERFORMANCE]</Label>
                            <div className="flex items-center gap-2 mt-2">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <motion.button
                                  key={rating}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setShoeFormData({ ...shoeFormData, performance: rating })}
                                  className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-tanker text-sm transition-all ${
                                    shoeFormData.performance >= rating
                                      ? 'border-orange-500 bg-orange-500/20 text-orange-500'
                                      : 'border-neutral-700 text-neutral-600'
                                  }`}
                                >
                                  {rating}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[NOTES_OPTIONAL]</Label>
                          <Textarea
                            id="notes"
                            value={shoeFormData.notes}
                            onChange={(e) => setShoeFormData({ ...shoeFormData, notes: e.target.value })}
                            placeholder="Any additional notes about this shoe..."
                            rows={3}
                            className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-orange-500 rounded-xl"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-4">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePrevious} className="border border-neutral-700 hover:border-orange-500/30 text-neutral-400 font-sora text-sm px-6 py-3 rounded-2xl transition-all flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" /> Back
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNext} disabled={!selectedShoe || !shoeFormData.size || isLoading} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black font-tanker text-lg px-8 py-3 rounded-2xl transition-colors flex items-center gap-2">
                        {isLoading ? 'COMPLETING...' : 'COMPLETE SETUP'} <CheckCircle2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'complete' && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 text-orange-500" />
                  </motion.div>
                  <h1 className="font-tanker text-5xl md:text-6xl mb-4">
                    YOU&apos;RE<br /><span className="text-orange-500">ALL SET!</span>
                  </h1>
                  <p className="font-sora text-neutral-400 text-lg mb-10">Your profile is ready and you can start exploring</p>

                  <div className="grid md:grid-cols-3 gap-4 mb-10">
                    {[
                      { href: '/footchecker', icon: Footprints, label: 'Foot Lab' },
                      { href: '/stash', icon: Plus, label: 'My Shoes' },
                      { href: '/findmyshoe', icon: Star, label: 'Find Shoes' },
                    ].map((item) => (
                      <Link key={item.href} href={item.href}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col items-center gap-3 hover:border-orange-500/30 transition-colors cursor-pointer"
                        >
                          <item.icon className="w-8 h-8 text-orange-500" />
                          <span className="font-tanker text-lg text-white">{item.label}</span>
                        </motion.div>
                      </Link>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFinish}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-black font-tanker text-xl py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
                  >
                    GO TO SHOE SANCTUARY
                    <ArrowUpRight className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  )
}
