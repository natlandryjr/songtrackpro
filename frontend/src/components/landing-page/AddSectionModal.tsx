import { X } from 'lucide-react'
import Button from '@/components/ui/Button'
import type { PageSection } from '@/types/landingPage'

interface AddSectionModalProps {
  onAdd: (section: Omit<PageSection, 'id' | 'order'>) => void
  onClose: () => void
}

const sectionTypes = [
  { type: 'hero', name: 'Hero', description: 'Large header with headline and CTA' },
  { type: 'spotify_player', name: 'Spotify Player', description: 'Embed Spotify track or album' },
  { type: 'text', name: 'Text', description: 'Rich text content' },
  { type: 'cta', name: 'Call to Action', description: 'Buttons and action prompts' },
  { type: 'form', name: 'Form', description: 'Contact or signup form' },
  { type: 'social_links', name: 'Social Links', description: 'Social media links' },
]

export default function AddSectionModal({ onAdd, onClose }: AddSectionModalProps) {
  const handleAdd = (type: string) => {
    onAdd({
      type: type as any,
      visible: true,
      settings: { container_width: 'normal' },
      content: {},
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Section</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {sectionTypes.map(section => (
            <button
              key={section.type}
              onClick={() => handleAdd(section.type)}
              className="rounded-lg border-2 border-gray-200 p-4 text-left transition-all hover:border-purple-600 hover:bg-purple-50 dark:border-gray-700 dark:hover:border-purple-600 dark:hover:bg-purple-900/20"
            >
              <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">{section.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{section.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}