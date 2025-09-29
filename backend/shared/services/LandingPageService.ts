import {
  LandingPage,
  LandingPageTemplate,
  PageSection,
  ABTest,
  ABTestVariant,
  PageVisit,
  LandingPageAnalytics,
} from '../types/landingPage'
import { nanoid } from 'nanoid'

interface LandingPageStorage {
  getPage(id: string): Promise<LandingPage | null>
  savePage(page: LandingPage): Promise<void>
  deletePage(id: string): Promise<void>
  listPages(userId: string): Promise<LandingPage[]>
  getPageBySlug(slug: string): Promise<LandingPage | null>
  getPageByDomain(domain: string): Promise<LandingPage | null>
}

interface AnalyticsStorage {
  recordVisit(visit: PageVisit): Promise<void>
  getAnalytics(pageId: string, startDate: string, endDate: string): Promise<LandingPageAnalytics>
}

export class LandingPageService {
  private storage: LandingPageStorage
  private analytics: AnalyticsStorage

  constructor(storage: LandingPageStorage, analytics: AnalyticsStorage) {
    this.storage = storage
    this.analytics = analytics
  }

  /**
   * Create a new landing page from template
   */
  async createFromTemplate(
    userId: string,
    templateId: string,
    name: string
  ): Promise<LandingPage> {
    const slug = this.generateSlug(name)

    const page: LandingPage = {
      id: nanoid(),
      user_id: userId,
      name,
      slug,
      template_id: templateId,
      status: 'draft',
      theme: this.getDefaultTheme(),
      seo: this.getDefaultSEO(name),
      tracking: {
        conversion_events: [],
      },
      content: {
        sections: [],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      visits: 0,
      conversions: 0,
    }

    await this.storage.savePage(page)
    return page
  }

  /**
   * Create blank landing page
   */
  async createBlank(userId: string, name: string): Promise<LandingPage> {
    return this.createFromTemplate(userId, 'blank', name)
  }

  /**
   * Get landing page by ID
   */
  async getPage(id: string): Promise<LandingPage | null> {
    return this.storage.getPage(id)
  }

  /**
   * Get landing page by slug
   */
  async getPageBySlug(slug: string): Promise<LandingPage | null> {
    return this.storage.getPageBySlug(slug)
  }

  /**
   * Get landing page by custom domain
   */
  async getPageByDomain(domain: string): Promise<LandingPage | null> {
    return this.storage.getPageByDomain(domain)
  }

  /**
   * Update landing page
   */
  async updatePage(id: string, updates: Partial<LandingPage>): Promise<LandingPage> {
    const page = await this.storage.getPage(id)
    if (!page) {
      throw new Error('Page not found')
    }

    const updatedPage: LandingPage = {
      ...page,
      ...updates,
      updated_at: new Date().toISOString(),
    }

    await this.storage.savePage(updatedPage)
    return updatedPage
  }

  /**
   * Add section to page
   */
  async addSection(pageId: string, section: Omit<PageSection, 'id' | 'order'>): Promise<LandingPage> {
    const page = await this.storage.getPage(pageId)
    if (!page) {
      throw new Error('Page not found')
    }

    const newSection: PageSection = {
      ...section,
      id: nanoid(),
      order: page.content.sections.length,
    }

    page.content.sections.push(newSection)
    page.updated_at = new Date().toISOString()

    await this.storage.savePage(page)
    return page
  }

  /**
   * Update section
   */
  async updateSection(
    pageId: string,
    sectionId: string,
    updates: Partial<PageSection>
  ): Promise<LandingPage> {
    const page = await this.storage.getPage(pageId)
    if (!page) {
      throw new Error('Page not found')
    }

    const sectionIndex = page.content.sections.findIndex(s => s.id === sectionId)
    if (sectionIndex === -1) {
      throw new Error('Section not found')
    }

    page.content.sections[sectionIndex] = {
      ...page.content.sections[sectionIndex],
      ...updates,
    }

    page.updated_at = new Date().toISOString()

    await this.storage.savePage(page)
    return page
  }

  /**
   * Remove section
   */
  async removeSection(pageId: string, sectionId: string): Promise<LandingPage> {
    const page = await this.storage.getPage(pageId)
    if (!page) {
      throw new Error('Page not found')
    }

    page.content.sections = page.content.sections.filter(s => s.id !== sectionId)

    // Reorder remaining sections
    page.content.sections = page.content.sections.map((section, index) => ({
      ...section,
      order: index,
    }))

    page.updated_at = new Date().toISOString()

    await this.storage.savePage(page)
    return page
  }

  /**
   * Reorder sections
   */
  async reorderSections(pageId: string, sectionIds: string[]): Promise<LandingPage> {
    const page = await this.storage.getPage(pageId)
    if (!page) {
      throw new Error('Page not found')
    }

    const reorderedSections: PageSection[] = []

    for (let i = 0; i < sectionIds.length; i++) {
      const section = page.content.sections.find(s => s.id === sectionIds[i])
      if (section) {
        reorderedSections.push({
          ...section,
          order: i,
        })
      }
    }

    page.content.sections = reorderedSections
    page.updated_at = new Date().toISOString()

    await this.storage.savePage(page)
    return page
  }

  /**
   * Duplicate section
   */
  async duplicateSection(pageId: string, sectionId: string): Promise<LandingPage> {
    const page = await this.storage.getPage(pageId)
    if (!page) {
      throw new Error('Page not found')
    }

    const section = page.content.sections.find(s => s.id === sectionId)
    if (!section) {
      throw new Error('Section not found')
    }

    const duplicatedSection: PageSection = {
      ...section,
      id: nanoid(),
      order: section.order + 1,
    }

    // Insert after the original
    page.content.sections.splice(section.order + 1, 0, duplicatedSection)

    // Reorder all sections after the duplicated one
    page.content.sections = page.content.sections.map((s, index) => ({
      ...s,
      order: index,
    }))

    page.updated_at = new Date().toISOString()

    await this.storage.savePage(page)
    return page
  }

  /**
   * Publish page
   */
  async publishPage(pageId: string): Promise<LandingPage> {
    const page = await this.storage.getPage(pageId)
    if (!page) {
      throw new Error('Page not found')
    }

    // Validate page before publishing
    this.validatePage(page)

    page.status = 'published'
    page.published_at = new Date().toISOString()
    page.updated_at = new Date().toISOString()

    await this.storage.savePage(page)
    return page
  }

  /**
   * Unpublish page
   */
  async unpublishPage(pageId: string): Promise<LandingPage> {
    const page = await this.storage.getPage(pageId)
    if (!page) {
      throw new Error('Page not found')
    }

    page.status = 'draft'
    page.updated_at = new Date().toISOString()

    await this.storage.savePage(page)
    return page
  }

  /**
   * Delete page
   */
  async deletePage(pageId: string): Promise<void> {
    await this.storage.deletePage(pageId)
  }

  /**
   * Duplicate page
   */
  async duplicatePage(pageId: string, newName: string): Promise<LandingPage> {
    const original = await this.storage.getPage(pageId)
    if (!original) {
      throw new Error('Page not found')
    }

    const duplicate: LandingPage = {
      ...original,
      id: nanoid(),
      name: newName,
      slug: this.generateSlug(newName),
      status: 'draft',
      published_at: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      visits: 0,
      conversions: 0,
    }

    await this.storage.savePage(duplicate)
    return duplicate
  }

  /**
   * Create A/B test
   */
  async createABTest(
    pageId: string,
    testName: string,
    variantContent: any
  ): Promise<LandingPage> {
    const page = await this.storage.getPage(pageId)
    if (!page) {
      throw new Error('Page not found')
    }

    const variant: ABTestVariant = {
      id: nanoid(),
      name: 'Variant B',
      content: variantContent,
      visits: 0,
      conversions: 0,
      conversion_rate: 0,
    }

    const abTest: ABTest = {
      id: nanoid(),
      name: testName,
      status: 'running',
      variants: [
        {
          id: nanoid(),
          name: 'Original (A)',
          content: page.content,
          visits: 0,
          conversions: 0,
          conversion_rate: 0,
        },
        variant,
      ],
      traffic_split: [50, 50],
      started_at: new Date().toISOString(),
    }

    page.ab_test = abTest
    page.updated_at = new Date().toISOString()

    await this.storage.savePage(page)
    return page
  }

  /**
   * End A/B test and select winner
   */
  async endABTest(pageId: string, winnerId: string): Promise<LandingPage> {
    const page = await this.storage.getPage(pageId)
    if (!page || !page.ab_test) {
      throw new Error('A/B test not found')
    }

    const winner = page.ab_test.variants.find(v => v.id === winnerId)
    if (!winner) {
      throw new Error('Winner variant not found')
    }

    // Apply winner content to page
    page.content = winner.content
    page.ab_test.status = 'completed'
    page.ab_test.winner = winnerId
    page.ab_test.ended_at = new Date().toISOString()
    page.updated_at = new Date().toISOString()

    await this.storage.savePage(page)
    return page
  }

  /**
   * Record page visit
   */
  async recordVisit(visit: PageVisit): Promise<void> {
    await this.analytics.recordVisit(visit)

    // Update page visit count
    const page = await this.storage.getPage(visit.page_id)
    if (page) {
      page.visits++
      if (visit.converted) {
        page.conversions++
      }
      await this.storage.savePage(page)
    }
  }

  /**
   * Get page analytics
   */
  async getAnalytics(
    pageId: string,
    startDate: string,
    endDate: string
  ): Promise<LandingPageAnalytics> {
    return this.analytics.getAnalytics(pageId, startDate, endDate)
  }

  /**
   * Validate page before publishing
   */
  private validatePage(page: LandingPage): void {
    if (!page.name) {
      throw new Error('Page name is required')
    }

    if (!page.slug) {
      throw new Error('Page slug is required')
    }

    if (!page.seo.title) {
      throw new Error('SEO title is required')
    }

    if (!page.seo.description) {
      throw new Error('SEO description is required')
    }

    if (page.content.sections.length === 0) {
      throw new Error('Page must have at least one section')
    }
  }

  /**
   * Generate URL-safe slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  /**
   * Get default theme
   */
  private getDefaultTheme() {
    return {
      colors: {
        primary: '#9333EA',
        secondary: '#EC4899',
        accent: '#3B82F6',
        background: '#FFFFFF',
        text: '#111827',
        textSecondary: '#6B7280',
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
      },
      spacing: 'normal' as const,
      borderRadius: 'medium' as const,
      animations: true,
    }
  }

  /**
   * Get default SEO settings
   */
  private getDefaultSEO(name: string) {
    return {
      title: name,
      description: '',
      keywords: [],
      robots: 'index,follow' as const,
    }
  }

  /**
   * List user pages
   */
  async listPages(userId: string): Promise<LandingPage[]> {
    return this.storage.listPages(userId)
  }
}