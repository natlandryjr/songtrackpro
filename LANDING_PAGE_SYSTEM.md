# Landing Page Generation System Documentation

## Overview

The SongTrackPro landing page system provides a complete solution for creating, managing, and optimizing custom landing pages for music promotion campaigns.

## Architecture

### Backend Services

#### LandingPageService (`backend/shared/services/LandingPageService.ts`)
- **CRUD Operations**: Create, read, update, delete landing pages
- **Section Management**: Add, remove, reorder, duplicate sections
- **Publishing**: Validate and publish pages
- **A/B Testing**: Create and manage split tests
- **Analytics**: Track visits and conversions

Key Methods:
```typescript
createFromTemplate(userId, templateId, name)
addSection(pageId, section)
updateSection(pageId, sectionId, updates)
reorderSections(pageId, sectionIds)
publishPage(pageId)
createABTest(pageId, testName, variantContent)
recordVisit(visit)
```

### Frontend Components

#### PageBuilder (`frontend/src/components/landing-page/PageBuilder.tsx`)
Main page builder interface with:
- **Three-column layout**: Sections list, preview, settings
- **Drag-and-drop**: Reorder sections with @dnd-kit
- **Live preview**: Desktop/mobile responsive views
- **Tabs**: Sections, Theme, SEO settings
- **Actions**: Save, publish, preview

## Section Types

### 1. Hero Section
```typescript
{
  type: 'hero',
  content: {
    hero: {
      headline: string
      subheadline: string
      image: string
      cta_primary: CTAButton
      cta_secondary: CTAButton
    }
  }
}
```

### 2. Spotify Player Section
```typescript
{
  type: 'spotify_player',
  content: {
    spotify_player: {
      uri: string // spotify:track:xxx or spotify:album:xxx
      type: 'track' | 'album' | 'playlist'
      theme: 'dark' | 'light'
      height: number
      compact: boolean
    }
  }
}
```

Embed code:
```html
<iframe
  src="https://open.spotify.com/embed/{type}/{id}"
  width="100%"
  height="{height}"
  frameBorder="0"
  allow="encrypted-media"
></iframe>
```

### 3. CTA Section
```typescript
{
  type: 'cta',
  content: {
    cta: {
      headline: string
      description: string
      buttons: CTAButton[]
    }
  }
}
```

### 4. Form Section
```typescript
{
  type: 'form',
  content: {
    form: {
      fields: FormField[]
      submit_button_text: string
      success_message: string
      webhook_url: string
    }
  }
}
```

### 5. Social Links Section
```typescript
{
  type: 'social_links',
  content: {
    social_links: {
      title: string
      links: SocialLink[]
      style: 'icons' | 'buttons' | 'text'
    }
  }
}
```

### 6. Countdown Section
```typescript
{
  type: 'countdown',
  content: {
    countdown: {
      title: string
      end_date: string
      end_message: string
    }
  }
}
```

### 7. Gallery Section
```typescript
{
  type: 'gallery',
  content: {
    gallery: {
      title: string
      images: GalleryImage[]
      columns: number
      lightbox: boolean
    }
  }
}
```

## Meta Pixel Integration

### Setup
```typescript
// In page head
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '{pixel_id}');
  fbq('track', 'PageView');
</script>
```

### Event Tracking
```typescript
// Track custom events
fbq('track', 'ViewContent', {
  content_name: 'Song Landing Page',
  content_ids: ['{track_id}'],
  content_type: 'music'
});

fbq('track', 'Lead', {
  content_name: 'Email Signup',
  value: 0,
  currency: 'USD'
});

fbq('track', 'AddToCart', {
  content_name: 'Pre-save',
  content_ids: ['{track_id}'],
  value: 0
});
```

## A/B Testing System

### Creating a Test
```typescript
const abTest = {
  id: 'test_123',
  name: 'Hero Headline Test',
  status: 'running',
  variants: [
    {
      id: 'variant_a',
      name: 'Original',
      content: originalContent,
      visits: 0,
      conversions: 0,
      conversion_rate: 0
    },
    {
      id: 'variant_b',
      name: 'New Headline',
      content: variantContent,
      visits: 0,
      conversions: 0,
      conversion_rate: 0
    }
  ],
  traffic_split: [50, 50],
  started_at: new Date().toISOString()
}
```

### Variant Selection
```typescript
// Server-side variant selection
function selectVariant(test: ABTest, visitorId: string): ABTestVariant {
  const hash = hashString(visitorId + test.id)
  const percentage = hash % 100

  let cumulative = 0
  for (let i = 0; i < test.variants.length; i++) {
    cumulative += test.traffic_split[i]
    if (percentage < cumulative) {
      return test.variants[i]
    }
  }

  return test.variants[0]
}
```

## Analytics Tracking

### Page Visit Recording
```typescript
const visit: PageVisit = {
  id: nanoid(),
  page_id: page.id,
  variant_id: selectedVariant?.id,
  visitor_id: getVisitorId(), // Cookie-based
  session_id: getSessionId(),
  timestamp: new Date().toISOString(),
  user_agent: navigator.userAgent,
  ip_address: req.ip,
  referrer: document.referrer,
  utm_source: params.get('utm_source'),
  utm_medium: params.get('utm_medium'),
  utm_campaign: params.get('utm_campaign'),
  device_type: getDeviceType(),
  os: getOS(),
  browser: getBrowser(),
  converted: false
}
```

### Conversion Tracking
```typescript
function trackConversion(pageId: string, visitorId: string, value?: number) {
  // Update visit record
  updateVisit(visitorId, {
    converted: true,
    conversion_value: value
  })

  // Track to Meta Pixel
  if (page.meta_pixel_id) {
    fbq('track', 'Purchase', {
      value: value || 0,
      currency: 'USD'
    })
  }

  // Track to Google Analytics
  if (page.tracking.google_analytics_id) {
    gtag('event', 'conversion', {
      value: value || 0
    })
  }
}
```

## SEO Optimization

### Meta Tags
```html
<head>
  <title>{seo.title}</title>
  <meta name="description" content="{seo.description}">
  <meta name="keywords" content="{seo.keywords.join(', ')}">
  <meta name="robots" content="{seo.robots}">

  <!-- Open Graph -->
  <meta property="og:title" content="{seo.og_title || seo.title}">
  <meta property="og:description" content="{seo.og_description || seo.description}">
  <meta property="og:image" content="{seo.og_image}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{canonical_url}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="{seo.twitter_card}">
  <meta name="twitter:title" content="{seo.twitter_title || seo.title}">
  <meta name="twitter:description" content="{seo.twitter_description || seo.description}">
  <meta name="twitter:image" content="{seo.twitter_image || seo.og_image}">

  <!-- Canonical URL -->
  <link rel="canonical" href="{seo.canonical_url}">

  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    "name": "{track.name}",
    "byArtist": {
      "@type": "MusicGroup",
      "name": "{artist.name}"
    },
    "duration": "PT{duration}S",
    "url": "{page.url}"
  }
  </script>
</head>
```

## Custom Domain Support

### DNS Configuration
```
CNAME: {custom_domain} -> pages.songtrackpro.com
```

### SSL Certificate
- Automatic Let's Encrypt certificate provisioning
- Certificate renewal every 90 days
- HTTPS enforcement

### Domain Verification
```typescript
async function verifyDomain(domain: string): Promise<boolean> {
  try {
    const records = await dns.resolveCname(domain)
    return records.includes('pages.songtrackpro.com')
  } catch (error) {
    return false
  }
}
```

## Mobile Responsiveness

### Breakpoints
```css
/* Mobile First */
.container {
  width: 100%;
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 3rem;
  }
}
```

### Touch Optimizations
- Minimum 44x44px touch targets
- Swipe gestures for galleries
- Touch-friendly navigation
- Reduced animations on mobile

## Performance Optimizations

### Image Optimization
- Lazy loading with Intersection Observer
- WebP format with fallback
- Responsive images with srcset
- CDN delivery

### Code Splitting
```typescript
// Lazy load section components
const HeroSection = lazy(() => import('./sections/HeroSection'))
const SpotifyPlayer = lazy(() => import('./sections/SpotifyPlayer'))
const CTASection = lazy(() => import('./sections/CTASection'))
```

### Caching Strategy
```
Cache-Control: public, max-age=31536000, immutable (static assets)
Cache-Control: public, max-age=3600 (pages)
Cache-Control: no-cache (API responses)
```

## Component Implementation Examples

### Spotify Player Component
```typescript
export function SpotifyPlayerSection({ content }: { content: SectionContent }) {
  const { spotify_player } = content
  if (!spotify_player) return null

  const embedUrl = `https://open.spotify.com/embed/${spotify_player.type}/${
    spotify_player.uri.split(':')[2]
  }?utm_source=generator&theme=${spotify_player.theme}`

  return (
    <div className="spotify-player-section">
      <iframe
        src={embedUrl}
        width="100%"
        height={spotify_player.height || 380}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  )
}
```

### Countdown Timer Component
```typescript
export function CountdownSection({ content }: { content: SectionContent }) {
  const { countdown } = content
  if (!countdown) return null

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(countdown.end_date))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(countdown.end_date))
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown.end_date])

  if (timeLeft.total <= 0) {
    return <div className="countdown-ended">{countdown.end_message}</div>
  }

  return (
    <div className="countdown-section">
      <h2>{countdown.title}</h2>
      <div className="countdown-timer">
        <div className="time-unit">
          <span className="value">{timeLeft.days}</span>
          <span className="label">Days</span>
        </div>
        <div className="time-unit">
          <span className="value">{timeLeft.hours}</span>
          <span className="label">Hours</span>
        </div>
        <div className="time-unit">
          <span className="value">{timeLeft.minutes}</span>
          <span className="label">Minutes</span>
        </div>
        <div className="time-unit">
          <span className="value">{timeLeft.seconds}</span>
          <span className="label">Seconds</span>
        </div>
      </div>
    </div>
  )
}
```

## Usage Examples

### Creating a Music Release Page
```typescript
const page = await landingPageService.createFromTemplate(
  userId,
  'music_release',
  'New Single - Summer Vibes'
)

// Add hero section
await landingPageService.addSection(page.id, {
  type: 'hero',
  visible: true,
  settings: { container_width: 'full' },
  content: {
    hero: {
      headline: 'Summer Vibes - Out Now',
      subheadline: 'The hottest track of the season',
      image: '/hero-image.jpg',
      cta_primary: {
        text: 'Listen on Spotify',
        url: 'https://open.spotify.com/track/xxx',
        style: 'primary'
      }
    }
  }
})

// Add Spotify player
await landingPageService.addSection(page.id, {
  type: 'spotify_player',
  visible: true,
  settings: { container_width: 'normal' },
  content: {
    spotify_player: {
      uri: 'spotify:track:xxx',
      type: 'track',
      theme: 'dark',
      height: 380
    }
  }
})

// Publish
await landingPageService.publishPage(page.id)
```

## API Endpoints

```
POST   /api/landing-pages              Create new page
GET    /api/landing-pages/:id          Get page
PUT    /api/landing-pages/:id          Update page
DELETE /api/landing-pages/:id          Delete page
GET    /api/landing-pages              List user pages
POST   /api/landing-pages/:id/publish  Publish page
POST   /api/landing-pages/:id/sections Add section
PUT    /api/landing-pages/:id/sections/:sectionId  Update section
DELETE /api/landing-pages/:id/sections/:sectionId  Delete section
POST   /api/landing-pages/:id/ab-test  Create A/B test
GET    /api/landing-pages/:id/analytics  Get analytics
POST   /api/landing-pages/:id/visit    Record visit
```

## Future Enhancements

1. **Template Marketplace**: Browse and use community templates
2. **AI Content Generation**: Auto-generate copy and images
3. **Email Integration**: Collect emails and sync with ESP
4. **Advanced Analytics**: Heatmaps, session recordings
5. **Dynamic Content**: Personalize based on visitor data
6. **Multi-language Support**: Automatic translation
7. **Version Control**: Rollback to previous versions
8. **Collaboration**: Team editing and comments
9. **White Label**: Custom branding for agencies
10. **Performance Monitoring**: Core Web Vitals tracking

## Conclusion

This landing page system provides a complete solution for creating high-converting pages optimized for music promotion. It includes drag-and-drop editing, Spotify integration, Meta pixel tracking, A/B testing, and comprehensive analytics—all with mobile-responsive design and SEO optimization.