import { useState } from 'react'
import { Music, Upload, Search, CheckCircle } from 'lucide-react'
import { useCampaignWizard } from '@/contexts/CampaignWizardContext'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const mockTracks = [
  {
    id: '1',
    title: 'Summer Vibes',
    artist: 'DJ Sunset',
    genre: 'Electronic',
    releaseDate: '2024-06-15',
    coverArtUrl: 'https://via.placeholder.com/150',
    spotifyUrl: 'https://open.spotify.com/track/123',
  },
  {
    id: '2',
    title: 'Midnight Dreams',
    artist: 'Luna Waves',
    genre: 'Indie Pop',
    releaseDate: '2024-05-20',
    coverArtUrl: 'https://via.placeholder.com/150',
    spotifyUrl: 'https://open.spotify.com/track/456',
  },
  {
    id: '3',
    title: 'City Lights',
    artist: 'Urban Echo',
    genre: 'Hip Hop',
    releaseDate: '2024-07-01',
    coverArtUrl: 'https://via.placeholder.com/150',
    spotifyUrl: 'https://open.spotify.com/track/789',
  },
]

export default function SongSelectionStep() {
  const { campaignData, updateCampaignData } = useCampaignWizard()
  const [activeTab, setActiveTab] = useState<'existing' | 'new' | 'spotify'>('existing')
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [isValidating, setIsValidating] = useState(false)

  const [newTrack, setNewTrack] = useState({
    title: '',
    artist: '',
    genre: '',
    releaseDate: '',
    isrcCode: '',
  })

  const handleSelectTrack = (track: typeof mockTracks[0]) => {
    updateCampaignData({
      track: {
        ...track,
        duration: 180,
      },
    })
  }

  const handleNewTrackSubmit = () => {
    if (newTrack.title && newTrack.artist && newTrack.genre) {
      updateCampaignData({
        track: { ...newTrack },
      })
    }
  }

  const handleSpotifyValidation = async () => {
    setIsValidating(true)
    // Simulate API call
    setTimeout(() => {
      updateCampaignData({
        track: {
          title: 'Validated Track',
          artist: 'Spotify Artist',
          genre: 'Pop',
          releaseDate: '2024-01-01',
          spotifyUrl,
          coverArtUrl: 'https://via.placeholder.com/150',
        },
      })
      setIsValidating(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Campaign Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Campaign Name *
        </label>
        <Input
          type="text"
          placeholder="e.g., Summer Release 2024"
          value={campaignData.name}
          onChange={e => updateCampaignData({ name: e.target.value })}
          className="mt-1"
        />
      </div>

      {/* Campaign Objective */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Campaign Objective *
        </label>
        <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { value: 'awareness', label: 'Brand Awareness', icon: '👁️' },
            { value: 'traffic', label: 'Drive Traffic', icon: '🚀' },
            { value: 'engagement', label: 'Engagement', icon: '❤️' },
            { value: 'conversions', label: 'Conversions', icon: '💰' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => updateCampaignData({ objective: option.value as any })}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                campaignData.objective === option.value
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              )}
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Track Selection Tabs */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Select Your Track</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('existing')}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                activeTab === 'existing'
                  ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              <Music className="mr-2 inline h-4 w-4" />
              Existing Tracks
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                activeTab === 'new'
                  ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              <Upload className="mr-2 inline h-4 w-4" />
              Add New
            </button>
            <button
              onClick={() => setActiveTab('spotify')}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                activeTab === 'spotify'
                  ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              <Search className="mr-2 inline h-4 w-4" />
              Spotify Import
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'existing' && (
              <div className="space-y-3">
                {mockTracks.map(track => (
                  <button
                    key={track.id}
                    onClick={() => handleSelectTrack(track)}
                    className={cn(
                      'flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-all hover:border-purple-300 dark:hover:border-purple-700',
                      campaignData.track?.id === track.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    )}
                  >
                    <img
                      src={track.coverArtUrl}
                      alt={track.title}
                      className="h-16 w-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{track.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{track.artist}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {track.genre} • {track.releaseDate}
                      </p>
                    </div>
                    {campaignData.track?.id === track.id && (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'new' && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Track Title *
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter track title"
                      value={newTrack.title}
                      onChange={e => setNewTrack({ ...newTrack, title: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Artist Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter artist name"
                      value={newTrack.artist}
                      onChange={e => setNewTrack({ ...newTrack, artist: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Genre *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Pop, Rock, Hip Hop"
                      value={newTrack.genre}
                      onChange={e => setNewTrack({ ...newTrack, genre: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Release Date *
                    </label>
                    <Input
                      type="date"
                      value={newTrack.releaseDate}
                      onChange={e => setNewTrack({ ...newTrack, releaseDate: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      ISRC Code (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="US-XXX-XX-XXXXX"
                      value={newTrack.isrcCode}
                      onChange={e => setNewTrack({ ...newTrack, isrcCode: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button onClick={handleNewTrackSubmit} variant="primary">
                  Add Track
                </Button>
              </div>
            )}

            {activeTab === 'spotify' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Spotify Track URL *
                  </label>
                  <div className="mt-1 flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://open.spotify.com/track/..."
                      value={spotifyUrl}
                      onChange={e => setSpotifyUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSpotifyValidation}
                      isLoading={isValidating}
                      disabled={!spotifyUrl || isValidating}
                    >
                      Validate
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Paste the Spotify track URL to automatically import track details
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Track Preview */}
      {campaignData.track && (
        <Card variant="elevated">
          <CardContent>
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Selected: {campaignData.track.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  by {campaignData.track.artist} • {campaignData.track.genre}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}