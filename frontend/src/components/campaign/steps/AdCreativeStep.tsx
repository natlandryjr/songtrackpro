import { useState } from 'react'
import { Image, Video, Sparkles, Upload, Eye } from 'lucide-react'
import { useCampaignWizard } from '@/contexts/CampaignWizardContext'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const templates = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple design',
    preview: 'https://via.placeholder.com/300x400?text=Minimal+Template',
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Bold colors and energy',
    preview: 'https://via.placeholder.com/300x400?text=Vibrant+Template',
  },
  {
    id: 'retro',
    name: 'Retro',
    description: 'Vintage aesthetic',
    preview: 'https://via.placeholder.com/300x400?text=Retro+Template',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary style',
    preview: 'https://via.placeholder.com/300x400?text=Modern+Template',
  },
]

const ctaOptions = [
  'Listen Now',
  'Stream on Spotify',
  'Pre-Save',
  'Learn More',
  'Get Tickets',
  'Follow Artist',
]

export default function AdCreativeStep() {
  const { campaignData, updateCampaignData } = useCampaignWizard()

  const [creative, setCreative] = useState({
    format: campaignData.creative?.format || 'image',
    headline: campaignData.creative?.headline || '',
    primaryText: campaignData.creative?.primaryText || '',
    description: campaignData.creative?.description || '',
    callToAction: campaignData.creative?.callToAction || 'Listen Now',
    mediaUrls: campaignData.creative?.mediaUrls || [],
    template: campaignData.creative?.template || '',
    abTesting: campaignData.creative?.abTesting || { enabled: false, variants: 2 },
  })

  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleCreativeUpdate = (updates: Partial<typeof creative>) => {
    const updated = { ...creative, ...updates }
    setCreative(updated)
    updateCampaignData({ creative: updated })
  }

  const handleGenerateAICopy = async () => {
    setIsGeneratingAI(true)
    // Simulate AI generation
    setTimeout(() => {
      const trackTitle = campaignData.track?.title || 'your track'
      const artist = campaignData.track?.artist || 'the artist'

      handleCreativeUpdate({
        headline: `🎵 New Release: ${trackTitle}`,
        primaryText: `Experience the latest from ${artist}. Stream ${trackTitle} now on all platforms and discover why fans can't stop listening!`,
        description: `Don't miss out on this incredible new release from ${artist}. Perfect for fans of ${campaignData.track?.genre || 'great music'}.`,
      })
      setIsGeneratingAI(false)
    }, 1500)
  }

  const handleTemplateSelect = (templateId: string) => {
    handleCreativeUpdate({ template: templateId })
  }

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      // Simulate file upload
      const urls = Array.from(files).map(file => URL.createObjectURL(file))
      handleCreativeUpdate({ mediaUrls: [...creative.mediaUrls, ...urls] })
    }
  }

  return (
    <div className="space-y-6">
      {/* Ad Format Selection */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Ad Format</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'image', label: 'Image', icon: Image },
              { value: 'video', label: 'Video', icon: Video },
              { value: 'carousel', label: 'Carousel', icon: Image },
            ].map(format => {
              const Icon = format.icon
              return (
                <button
                  key={format.value}
                  onClick={() => handleCreativeUpdate({ format: format.value as any })}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                    creative.format === format.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                  )}
                >
                  <Icon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-gray-900 dark:text-white">{format.label}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Template Selection */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Choose Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={cn(
                  'group relative overflow-hidden rounded-lg border-2 transition-all',
                  creative.template === template.id
                    ? 'border-purple-500 ring-2 ring-purple-500'
                    : 'border-gray-200 hover:border-purple-300 dark:border-gray-700'
                )}
              >
                <img
                  src={template.preview}
                  alt={template.name}
                  className="h-48 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <p className="font-semibold">{template.name}</p>
                  <p className="text-xs opacity-90">{template.description}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Media Upload */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Upload Media *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-all hover:border-purple-400 hover:bg-purple-50 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-purple-500 dark:hover:bg-purple-900/10">
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-gray-500">
                {creative.format === 'video' ? 'MP4, MOV up to 100MB' : 'PNG, JPG, GIF up to 10MB'}
              </span>
              <input
                type="file"
                accept={creative.format === 'video' ? 'video/*' : 'image/*'}
                multiple={creative.format === 'carousel'}
                onChange={handleMediaUpload}
                className="hidden"
              />
            </label>

            {/* Uploaded Media Preview */}
            {creative.mediaUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {creative.mediaUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                    <img src={url} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
                    <button
                      onClick={() => {
                        const updated = creative.mediaUrls.filter((_, i) => i !== index)
                        handleCreativeUpdate({ mediaUrls: updated })
                      }}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ad Copy */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ad Copy</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateAICopy}
              isLoading={isGeneratingAI}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI Generate
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Headline *
            </label>
            <Input
              type="text"
              placeholder="Eye-catching headline (max 40 characters)"
              value={creative.headline}
              onChange={e => handleCreativeUpdate({ headline: e.target.value })}
              maxLength={40}
              className="mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">{creative.headline.length}/40 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Primary Text *
            </label>
            <textarea
              placeholder="Main ad copy that engages your audience (max 125 characters)"
              value={creative.primaryText}
              onChange={e => handleCreativeUpdate({ primaryText: e.target.value })}
              maxLength={125}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500">{creative.primaryText.length}/125 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              placeholder="Additional details about your track or campaign (optional)"
              value={creative.description}
              onChange={e => handleCreativeUpdate({ description: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Call to Action *
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ctaOptions.map(cta => (
                <button
                  key={cta}
                  onClick={() => handleCreativeUpdate({ callToAction: cta })}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                    creative.callToAction === cta
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  )}
                >
                  {cta}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* A/B Testing */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>A/B Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="ab-testing"
              checked={creative.abTesting.enabled}
              onChange={e => handleCreativeUpdate({
                abTesting: { ...creative.abTesting, enabled: e.target.checked },
              })}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="ab-testing" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable A/B testing to compare ad variations
            </label>
          </div>

          {creative.abTesting.enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Number of Variants: {creative.abTesting.variants}
              </label>
              <input
                type="range"
                min="2"
                max="5"
                value={creative.abTesting.variants}
                onChange={e => handleCreativeUpdate({
                  abTesting: { ...creative.abTesting, variants: parseInt(e.target.value) },
                })}
                className="mt-2 w-full"
              />
              <p className="mt-1 text-xs text-gray-500">
                We'll automatically create {creative.abTesting.variants} variations to test
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setShowPreview(!showPreview)}
      >
        <Eye className="mr-2 h-4 w-4" />
        {showPreview ? 'Hide' : 'Show'} Preview
      </Button>

      {/* Preview */}
      {showPreview && creative.mediaUrls.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Ad Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <img
                src={creative.mediaUrls[0]}
                alt="Ad preview"
                className="w-full rounded-lg object-cover"
              />
              <div className="mt-4 space-y-2">
                <h3 className="font-bold text-gray-900 dark:text-white">{creative.headline}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{creative.primaryText}</p>
                {creative.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">{creative.description}</p>
                )}
                <button className="mt-3 w-full rounded-lg bg-purple-600 py-2 font-medium text-white hover:bg-purple-700">
                  {creative.callToAction}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}