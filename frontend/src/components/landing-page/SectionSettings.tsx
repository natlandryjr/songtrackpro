import type { PageSection } from '@/types/landingPage'

interface SectionSettingsProps {
  section: PageSection
  onChange: (updates: Partial<PageSection>) => void
}

export default function SectionSettings({ section, onChange }: SectionSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Visibility
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={section.visible}
            onChange={e => onChange({ visible: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">Show this section</span>
        </label>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Container Width
        </label>
        <select
          value={section.settings.container_width || 'normal'}
          onChange={e =>
            onChange({
              settings: {
                ...section.settings,
                container_width: e.target.value as any,
              },
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="full">Full Width</option>
          <option value="wide">Wide</option>
          <option value="normal">Normal</option>
          <option value="narrow">Narrow</option>
        </select>
      </div>

      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Section-specific settings will appear here based on the section type.
        </p>
      </div>
    </div>
  )
}