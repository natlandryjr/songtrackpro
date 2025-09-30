import { useState } from 'react'
import { Users, MapPin, Heart, Target, Plus, X } from 'lucide-react'
import { useCampaignWizard } from '@/contexts/CampaignWizardContext'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

const musicGenres = [
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Country',
  'Jazz', 'Classical', 'Indie', 'Alternative', 'Metal', 'Folk'
]

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia',
  'Germany', 'France', 'Spain', 'Italy', 'Brazil', 'Mexico'
]

export default function AudienceTargetingStep() {
  const { campaignData, updateCampaignData } = useCampaignWizard()

  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    campaignData.targeting?.demographics.locations || []
  )
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    campaignData.targeting?.interests || []
  )
  const [customInterest, setCustomInterest] = useState('')
  const [customLocation, setCustomLocation] = useState('')

  const [demographics, setDemographics] = useState({
    ageMin: campaignData.targeting?.demographics.ageMin || 18,
    ageMax: campaignData.targeting?.demographics.ageMax || 65,
    genders: campaignData.targeting?.demographics.genders || ['all'],
  })

  const [lookalike, setLookalike] = useState({
    enabled: campaignData.targeting?.lookalike.enabled || false,
    similarity: campaignData.targeting?.lookalike.similarity || 1,
  })

  const handleLocationToggle = (location: string) => {
    const updated = selectedLocations.includes(location)
      ? selectedLocations.filter(l => l !== location)
      : [...selectedLocations, location]

    setSelectedLocations(updated)
    updateCampaignData({
      targeting: {
        ...campaignData.targeting,
        demographics: {
          ...demographics,
          locations: updated,
        },
      },
    })
  }

  const handleAddCustomLocation = () => {
    if (customLocation && !selectedLocations.includes(customLocation)) {
      const updated = [...selectedLocations, customLocation]
      setSelectedLocations(updated)
      updateCampaignData({
        targeting: {
          ...campaignData.targeting,
          demographics: {
            ...demographics,
            locations: updated,
          },
        },
      })
      setCustomLocation('')
    }
  }

  const handleInterestToggle = (interest: string) => {
    const updated = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest]

    setSelectedInterests(updated)
    updateCampaignData({
      targeting: {
        ...campaignData.targeting!,
        interests: updated,
      },
    })
  }

  const handleAddCustomInterest = () => {
    if (customInterest && !selectedInterests.includes(customInterest)) {
      const updated = [...selectedInterests, customInterest]
      setSelectedInterests(updated)
      updateCampaignData({
        targeting: {
          ...campaignData.targeting!,
          interests: updated,
        },
      })
      setCustomInterest('')
    }
  }

  const updateTargeting = (updates: Partial<typeof demographics>) => {
    updateCampaignData({
      targeting: {
        demographics: {
          ...demographics,
          ...updates,
          locations: selectedLocations,
        },
        interests: selectedInterests,
        customAudiences: [],
        lookalike,
      },
    })
  }

  const handleDemographicsChange = (field: string, value: any) => {
    const updated = { ...demographics, [field]: value }
    setDemographics(updated)
    updateTargeting(updated)
  }

  const handleLookalikeChange = (field: string, value: any) => {
    const updated = { ...lookalike, [field]: value }
    setLookalike(updated)
    updateCampaignData({
      targeting: {
        ...campaignData.targeting!,
        lookalike: updated,
      },
    })
  }

  const estimatedReach = selectedLocations.length * 50000 + selectedInterests.length * 25000

  return (
    <div className="space-y-6">
      {/* Demographics */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            <CardTitle>Demographics</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Age Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Age Range *
            </label>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="number"
                  min="13"
                  max="65"
                  value={demographics.ageMin}
                  onChange={e => handleDemographicsChange('ageMin', parseInt(e.target.value))}
                />
                <p className="mt-1 text-xs text-gray-500">Min age</p>
              </div>
              <span className="text-gray-500">to</span>
              <div className="flex-1">
                <Input
                  type="number"
                  min="13"
                  max="65"
                  value={demographics.ageMax}
                  onChange={e => handleDemographicsChange('ageMax', parseInt(e.target.value))}
                />
                <p className="mt-1 text-xs text-gray-500">Max age</p>
              </div>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Gender
            </label>
            <div className="mt-2 flex gap-2">
              {['all', 'male', 'female', 'other'].map(gender => (
                <button
                  key={gender}
                  onClick={() => handleDemographicsChange('genders', [gender])}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all',
                    demographics.genders.includes(gender)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  )}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Targeting */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-purple-600" />
            <CardTitle>Geographic Targeting *</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {countries.map(country => (
              <button
                key={country}
                onClick={() => handleLocationToggle(country)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-all',
                  selectedLocations.includes(country)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                )}
              >
                {country}
              </button>
            ))}
          </div>

          {/* Custom Location */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add custom location..."
              value={customLocation}
              onChange={e => setCustomLocation(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAddCustomLocation()}
              className="flex-1"
            />
            <Button onClick={handleAddCustomLocation} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Selected Locations */}
          {selectedLocations.length > 0 && (
            <div className="flex flex-wrap gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected:</span>
              {selectedLocations.map(location => (
                <Badge key={location} variant="success">
                  {location}
                  <button
                    onClick={() => handleLocationToggle(location)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interest-Based Targeting */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-purple-600" />
            <CardTitle>Interest-Based Targeting</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Music Genres
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {musicGenres.map(genre => (
                <button
                  key={genre}
                  onClick={() => handleInterestToggle(genre)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-all',
                    selectedInterests.includes(genre)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  )}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Interest */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add custom interest (e.g., festival goers, vinyl collectors)..."
              value={customInterest}
              onChange={e => setCustomInterest(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAddCustomInterest()}
              className="flex-1"
            />
            <Button onClick={handleAddCustomInterest} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Selected Interests */}
          {selectedInterests.length > 0 && (
            <div className="flex flex-wrap gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected:</span>
              {selectedInterests.map(interest => (
                <Badge key={interest} variant="info">
                  {interest}
                  <button
                    onClick={() => handleInterestToggle(interest)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lookalike Audiences */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            <CardTitle>Lookalike Audiences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="lookalike-enabled"
              checked={lookalike.enabled}
              onChange={e => handleLookalikeChange('enabled', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="lookalike-enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable lookalike audience targeting
            </label>
          </div>

          {lookalike.enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Similarity Level: {lookalike.similarity}%
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={lookalike.similarity}
                onChange={e => handleLookalikeChange('similarity', parseInt(e.target.value))}
                className="mt-2 w-full"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Broad (More reach)</span>
                <span>Narrow (More similar)</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estimated Reach */}
      <Card variant="elevated">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Reach</h4>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {estimatedReach.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">potential users</p>
            </div>
            <div className="rounded-lg bg-purple-100 p-4 dark:bg-purple-900/30">
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}