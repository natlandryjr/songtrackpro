import type { SEOSettings as SEOSettingsType } from '@/types/landingPage'

interface SEOSettingsProps {
  seo: SEOSettingsType
  onChange: (seo: SEOSettingsType) => void
}

export default function SEOSettings({ seo, onChange }: SEOSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Page Title
        </label>
        <input
          type="text"
          value={seo.title}
          onChange={e => onChange({ ...seo, title: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="60 characters recommended"
        />
        <p className="mt-1 text-xs text-gray-500">{seo.title.length}/60</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Meta Description
        </label>
        <textarea
          value={seo.description}
          onChange={e => onChange({ ...seo, description: e.target.value })}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="160 characters recommended"
        />
        <p className="mt-1 text-xs text-gray-500">{seo.description.length}/160</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Keywords
        </label>
        <input
          type="text"
          value={seo.keywords.join(', ')}
          onChange={e => onChange({ ...seo, keywords: e.target.value.split(',').map(k => k.trim()) })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Comma separated keywords"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          OG Image URL
        </label>
        <input
          type="url"
          value={seo.og_image || ''}
          onChange={e => onChange({ ...seo, og_image: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Robots
        </label>
        <select
          value={seo.robots}
          onChange={e => onChange({ ...seo, robots: e.target.value as any })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="index,follow">Index, Follow</option>
          <option value="noindex,follow">No Index, Follow</option>
          <option value="index,nofollow">Index, No Follow</option>
          <option value="noindex,nofollow">No Index, No Follow</option>
        </select>
      </div>
    </div>
  )
}