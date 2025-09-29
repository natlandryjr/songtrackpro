import { createContext, useContext, useState, ReactNode } from 'react'

export interface Track {
  id?: string
  title: string
  artist: string
  genre: string
  releaseDate: string
  duration?: number
  spotifyUrl?: string
  coverArtUrl?: string
  isrcCode?: string
}

export interface AudienceTargeting {
  demographics: {
    ageMin: number
    ageMax: number
    genders: string[]
    locations: string[]
  }
  interests: string[]
  customAudiences: string[]
  lookalike: {
    enabled: boolean
    sourceAudienceId?: string
    similarity: number
  }
}

export interface AdCreative {
  format: 'image' | 'video' | 'carousel'
  headline: string
  primaryText: string
  description: string
  callToAction: string
  mediaUrls: string[]
  template?: string
  abTesting: {
    enabled: boolean
    variants: number
  }
}

export interface BudgetSchedule {
  totalBudget: number
  dailyBudget?: number
  startDate: string
  endDate: string
  bidStrategy: 'lowest_cost' | 'cost_cap' | 'bid_cap'
  bidAmount?: number
  optimization: 'link_clicks' | 'impressions' | 'reach' | 'conversions'
}

export interface CampaignData {
  name: string
  objective: 'awareness' | 'traffic' | 'engagement' | 'conversions'
  track?: Track
  targeting?: AudienceTargeting
  creative?: AdCreative
  budget?: BudgetSchedule
  status: 'draft' | 'review' | 'submitted'
}

interface CampaignWizardContextType {
  currentStep: number
  campaignData: CampaignData
  goToStep: (step: number) => void
  nextStep: () => void
  previousStep: () => void
  updateCampaignData: (data: Partial<CampaignData>) => void
  saveDraft: () => void
  loadDraft: (draftId: string) => void
  resetWizard: () => void
  validateStep: (step: number) => boolean
}

const CampaignWizardContext = createContext<CampaignWizardContextType | undefined>(undefined)

const initialCampaignData: CampaignData = {
  name: '',
  objective: 'traffic',
  status: 'draft',
}

export function CampaignWizardProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [campaignData, setCampaignData] = useState<CampaignData>(initialCampaignData)

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 5) {
      setCurrentStep(step)
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 5) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const updateCampaignData = (data: Partial<CampaignData>) => {
    setCampaignData(prev => ({ ...prev, ...data }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(campaignData.name && campaignData.track?.title && campaignData.track?.artist)
      case 2:
        return !!(
          campaignData.targeting?.demographics.locations.length &&
          campaignData.targeting?.demographics.ageMin &&
          campaignData.targeting?.demographics.ageMax
        )
      case 3:
        return !!(
          campaignData.creative?.headline &&
          campaignData.creative?.primaryText &&
          campaignData.creative?.mediaUrls.length
        )
      case 4:
        return !!(
          campaignData.budget?.totalBudget &&
          campaignData.budget?.startDate &&
          campaignData.budget?.endDate
        )
      default:
        return true
    }
  }

  const saveDraft = () => {
    const draftId = `draft_${Date.now()}`
    localStorage.setItem(draftId, JSON.stringify(campaignData))
    localStorage.setItem('lastDraftId', draftId)
    console.log('Draft saved:', draftId)
  }

  const loadDraft = (draftId: string) => {
    const saved = localStorage.getItem(draftId)
    if (saved) {
      setCampaignData(JSON.parse(saved))
    }
  }

  const resetWizard = () => {
    setCampaignData(initialCampaignData)
    setCurrentStep(1)
  }

  return (
    <CampaignWizardContext.Provider
      value={{
        currentStep,
        campaignData,
        goToStep,
        nextStep,
        previousStep,
        updateCampaignData,
        saveDraft,
        loadDraft,
        resetWizard,
        validateStep,
      }}
    >
      {children}
    </CampaignWizardContext.Provider>
  )
}

export function useCampaignWizard() {
  const context = useContext(CampaignWizardContext)
  if (context === undefined) {
    throw new Error('useCampaignWizard must be used within a CampaignWizardProvider')
  }
  return context
}