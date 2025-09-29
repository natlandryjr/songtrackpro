import { CheckCircle, Edit, Music, Users, Image as ImageIcon, DollarSign } from 'lucide-react'
import { useCampaignWizard } from '@/contexts/CampaignWizardContext'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function ReviewStep() {
  const { campaignData, goToStep } = useCampaignWizard()

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="rounded-lg bg-green-50 p-6 text-center dark:bg-green-900/20">
        <CheckCircle className="mx-auto h-12 w-12 text-green-600 dark:text-green-400" />
        <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
          Your campaign is ready to launch!
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Review the details below and launch when you're ready
        </p>
      </div>

      {/* Campaign Overview */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Campaign Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Campaign Name</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{campaignData.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Objective</p>
            <Badge variant="info" className="mt-1 capitalize">
              {campaignData.objective}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Song Details */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-5 w-5 text-purple-600" />
              <CardTitle>Song Selection</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => goToStep(1)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {campaignData.track ? (
            <div className="flex items-center gap-4">
              {campaignData.track.coverArtUrl && (
                <img
                  src={campaignData.track.coverArtUrl}
                  alt={campaignData.track.title}
                  className="h-20 w-20 rounded object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{campaignData.track.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">by {campaignData.track.artist}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {campaignData.track.genre} • {campaignData.track.releaseDate}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No track selected</p>
          )}
        </CardContent>
      </Card>

      {/* Audience Details */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <CardTitle>Audience Targeting</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => goToStep(2)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {campaignData.targeting ? (
            <>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Demographics</p>
                <p className="mt-1 text-gray-900 dark:text-white">
                  Ages {campaignData.targeting.demographics.ageMin}-{campaignData.targeting.demographics.ageMax} •{' '}
                  {campaignData.targeting.demographics.genders.join(', ')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Locations</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {campaignData.targeting.demographics.locations.map(loc => (
                    <Badge key={loc} variant="default">
                      {loc}
                    </Badge>
                  ))}
                </div>
              </div>
              {campaignData.targeting.interests.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Interests</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {campaignData.targeting.interests.map(interest => (
                      <Badge key={interest} variant="info">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {campaignData.targeting.lookalike.enabled && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Lookalike Audience</p>
                  <Badge variant="success" className="mt-1">
                    Enabled • {campaignData.targeting.lookalike.similarity}% similarity
                  </Badge>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">No targeting configured</p>
          )}
        </CardContent>
      </Card>

      {/* Ad Creative */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-purple-600" />
              <CardTitle>Ad Creative</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => goToStep(3)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {campaignData.creative ? (
            <>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Format</p>
                <Badge variant="default" className="mt-1 capitalize">
                  {campaignData.creative.format}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Headline</p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">{campaignData.creative.headline}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Primary Text</p>
                <p className="mt-1 text-gray-900 dark:text-white">{campaignData.creative.primaryText}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Call to Action</p>
                <Badge variant="success" className="mt-1">
                  {campaignData.creative.callToAction}
                </Badge>
              </div>
              {campaignData.creative.mediaUrls.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Media ({campaignData.creative.mediaUrls.length})</p>
                  <div className="mt-2 flex gap-2">
                    {campaignData.creative.mediaUrls.slice(0, 3).map((url, i) => (
                      <img key={i} src={url} alt={`Media ${i + 1}`} className="h-20 w-20 rounded object-cover" />
                    ))}
                    {campaignData.creative.mediaUrls.length > 3 && (
                      <div className="flex h-20 w-20 items-center justify-center rounded bg-gray-100 text-sm font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        +{campaignData.creative.mediaUrls.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {campaignData.creative.abTesting.enabled && (
                <Badge variant="warning">A/B Testing: {campaignData.creative.abTesting.variants} variants</Badge>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">No creative configured</p>
          )}
        </CardContent>
      </Card>

      {/* Budget & Schedule */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <CardTitle>Budget & Schedule</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => goToStep(4)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {campaignData.budget ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Budget</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(campaignData.budget.totalBudget)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Budget</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(campaignData.budget.dailyBudget || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</p>
                <p className="mt-1 text-gray-900 dark:text-white">{formatDate(campaignData.budget.startDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</p>
                <p className="mt-1 text-gray-900 dark:text-white">{formatDate(campaignData.budget.endDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bid Strategy</p>
                <Badge variant="info" className="mt-1 capitalize">
                  {campaignData.budget.bidStrategy.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Optimization</p>
                <Badge variant="success" className="mt-1 capitalize">
                  {campaignData.budget.optimization.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No budget configured</p>
          )}
        </CardContent>
      </Card>

      {/* Legal Notice */}
      <Card variant="bordered">
        <CardContent>
          <div className="flex items-start gap-3">
            <input type="checkbox" id="terms" className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600" />
            <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
              I agree to the{' '}
              <a href="#" className="text-purple-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-purple-600 hover:underline">
                Advertising Policies
              </a>
              . I understand that my campaign will be reviewed before going live.
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}