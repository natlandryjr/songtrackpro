import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, Eye, Settings, Smartphone, Monitor, Save, Upload } from 'lucide-react'
import Button from '@/components/ui/Button'
import SortableSection from './SortableSection'
import SectionSettings from './SectionSettings'
import AddSectionModal from './AddSectionModal'
import ThemeSettings from './ThemeSettings'
import SEOSettings from './SEOSettings'
import type { LandingPage, PageSection } from '@/types/landingPage'

interface PageBuilderProps {
  page: LandingPage
  onUpdate: (page: LandingPage) => void
  onSave: () => void
  onPublish: () => void
}

export default function PageBuilder({ page, onUpdate, onSave, onPublish }: PageBuilderProps) {
  const [sections, setSections] = useState<PageSection[]>(page.content.sections)
  const [selectedSection, setSelectedSection] = useState<PageSection | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showThemeSettings, setShowThemeSettings] = useState(false)
  const [showSEOSettings, setShowSEOSettings] = useState(false)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [activeTab, setActiveTab] = useState<'sections' | 'theme' | 'seo'>('sections')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSections(items => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)

        const newSections = arrayMove(items, oldIndex, newIndex)

        // Update order property
        const reorderedSections = newSections.map((section, index) => ({
          ...section,
          order: index,
        }))

        onUpdate({
          ...page,
          content: {
            ...page.content,
            sections: reorderedSections,
          },
        })

        return reorderedSections
      })
    }
  }

  const handleAddSection = (section: Omit<PageSection, 'id' | 'order'>) => {
    const newSection: PageSection = {
      ...section,
      id: `section_${Date.now()}`,
      order: sections.length,
    }

    const newSections = [...sections, newSection]
    setSections(newSections)

    onUpdate({
      ...page,
      content: {
        ...page.content,
        sections: newSections,
      },
    })

    setShowAddModal(false)
  }

  const handleUpdateSection = (sectionId: string, updates: Partial<PageSection>) => {
    const newSections = sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    )

    setSections(newSections)

    onUpdate({
      ...page,
      content: {
        ...page.content,
        sections: newSections,
      },
    })
  }

  const handleDeleteSection = (sectionId: string) => {
    const newSections = sections
      .filter(section => section.id !== sectionId)
      .map((section, index) => ({
        ...section,
        order: index,
      }))

    setSections(newSections)

    onUpdate({
      ...page,
      content: {
        ...page.content,
        sections: newSections,
      },
    })

    if (selectedSection?.id === sectionId) {
      setSelectedSection(null)
    }
  }

  const handleDuplicateSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    const duplicatedSection: PageSection = {
      ...section,
      id: `section_${Date.now()}`,
      order: section.order + 1,
    }

    const newSections = [
      ...sections.slice(0, section.order + 1),
      duplicatedSection,
      ...sections.slice(section.order + 1),
    ].map((s, index) => ({ ...s, order: index }))

    setSections(newSections)

    onUpdate({
      ...page,
      content: {
        ...page.content,
        sections: newSections,
      },
    })
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar - Sections List */}
      <div className="w-80 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Page Builder</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onSave}>
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="primary" size="sm" onClick={onPublish}>
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('sections')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'sections'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Sections
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'theme'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Theme
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'seo'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            SEO
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4" style={{ height: 'calc(100vh - 140px)' }}>
          {activeTab === 'sections' && (
            <>
              <Button
                variant="outline"
                className="mb-4 w-full"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {sections.map(section => (
                      <SortableSection
                        key={section.id}
                        section={section}
                        isSelected={selectedSection?.id === section.id}
                        onSelect={() => setSelectedSection(section)}
                        onDelete={() => handleDeleteSection(section.id)}
                        onDuplicate={() => handleDuplicateSection(section.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {sections.length === 0 && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No sections yet. Click "Add Section" to get started.
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'theme' && (
            <ThemeSettings
              theme={page.theme}
              onChange={theme => onUpdate({ ...page, theme })}
            />
          )}

          {activeTab === 'seo' && (
            <SEOSettings
              seo={page.seo}
              onChange={seo => onUpdate({ ...page, seo })}
            />
          )}
        </div>
      </div>

      {/* Center - Preview */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview</span>
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`rounded p-1.5 ${
                  previewMode === 'desktop'
                    ? 'bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`rounded p-1.5 ${
                  previewMode === 'mobile'
                    ? 'bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Preview Live
          </Button>
        </div>

        <div className="flex h-full items-center justify-center p-8">
          <div
            className={`bg-white shadow-xl transition-all ${
              previewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-6xl'
            }`}
            style={{ height: 'calc(100vh - 180px)', overflowY: 'auto' }}
          >
            {/* Preview content will be rendered here */}
            <div className="p-8 text-center">
              <p className="text-gray-500">Preview will render here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Section Settings */}
      {selectedSection && (
        <div className="w-80 border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedSection.type.charAt(0).toUpperCase() + selectedSection.type.slice(1)} Settings
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedSection(null)}>
                ×
              </Button>
            </div>
          </div>

          <div className="overflow-y-auto p-4" style={{ height: 'calc(100vh - 80px)' }}>
            <SectionSettings
              section={selectedSection}
              onChange={updates => handleUpdateSection(selectedSection.id, updates)}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddSectionModal
          onAdd={handleAddSection}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}