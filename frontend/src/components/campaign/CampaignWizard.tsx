import { Check } from 'lucide-react'
import { useCampaignWizard } from '@/contexts/CampaignWizardContext'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import SongSelectionStep from './steps/SongSelectionStep'
import AudienceTargetingStep from './steps/AudienceTargetingStep'
import AdCreativeStep from './steps/AdCreativeStep'
import BudgetScheduleStep from './steps/BudgetScheduleStep'
import ReviewStep from './steps/ReviewStep'

const steps = [
  { number: 1, title: 'Song Selection', description: 'Choose your track' },
  { number: 2, title: 'Audience', description: 'Define your target' },
  { number: 3, title: 'Ad Creative', description: 'Design your ads' },
  { number: 4, title: 'Budget & Schedule', description: 'Set your spend' },
  { number: 5, title: 'Review', description: 'Launch campaign' },
]

export default function CampaignWizard({ onClose }: { onClose: () => void }) {
  const { currentStep, nextStep, previousStep, saveDraft, validateStep, resetWizard } = useCampaignWizard()

  const handleNext = () => {
    if (validateStep(currentStep)) {
      saveDraft()
      nextStep()
    }
  }

  const handleClose = () => {
    if (confirm('Are you sure you want to close? Your progress will be saved as a draft.')) {
      saveDraft()
      resetWizard()
      onClose()
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <SongSelectionStep />
      case 2:
        return <AudienceTargetingStep />
      case 3:
        return <AdCreativeStep />
      case 4:
        return <BudgetScheduleStep />
      case 5:
        return <ReviewStep />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-800">
        {/* Header */}
        <div className="border-b border-gray-200 px-8 py-6 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Campaign</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Stepper */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                        currentStep > step.number
                          ? 'border-green-500 bg-green-500 text-white'
                          : currentStep === step.number
                            ? 'border-purple-500 bg-purple-500 text-white'
                            : 'border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      )}
                    >
                      {currentStep > step.number ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-semibold">{step.number}</span>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{step.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'mx-2 h-0.5 flex-1 transition-all',
                        currentStep > step.number
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-8 py-6 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={previousStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => saveDraft()}>
                Save Draft
              </Button>

              {currentStep < 5 ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!validateStep(currentStep)}
                >
                  Next Step
                </Button>
              ) : (
                <Button variant="primary" onClick={() => console.log('Launch campaign')}>
                  Launch Campaign
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}