import type { LandingPageTheme } from '@/types/landingPage'

interface ThemeSettingsProps {
  theme: LandingPageTheme
  onChange: (theme: LandingPageTheme) => void
}

export default function ThemeSettings({ theme, onChange }: ThemeSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Colors</h3>
        <div className="space-y-3">
          {Object.entries(theme.colors).map(([key, value]) => (
            <div key={key}>
              <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={e =>
                    onChange({
                      ...theme,
                      colors: { ...theme.colors, [key]: e.target.value },
                    })
                  }
                  className="h-10 w-16 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={value}
                  onChange={e =>
                    onChange({
                      ...theme,
                      colors: { ...theme.colors, [key]: e.target.value },
                    })
                  }
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Typography</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
              Heading Font
            </label>
            <select
              value={theme.fonts.heading}
              onChange={e =>
                onChange({
                  ...theme,
                  fonts: { ...theme.fonts, heading: e.target.value },
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Montserrat">Montserrat</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}