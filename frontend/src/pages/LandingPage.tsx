import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Music,
  Target,
  BarChart3,
  Zap,
  Shield,
  Check,
  ChevronDown,
  Mail,
  ArrowRight,
  Sparkles,
  Users,
} from 'lucide-react'

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-gray-900/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-8 w-8 text-purple-500" />
              <span className="text-xl font-bold text-white">SongTrackPro</span>
            </div>
            <div className="hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm text-gray-300 hover:text-white">
                Features
              </a>
              <a href="#pricing" className="text-sm text-gray-300 hover:text-white">
                Pricing
              </a>
              <a href="#faq" className="text-sm text-gray-300 hover:text-white">
                FAQ
              </a>
              <Link
                to="/login"
                className="text-sm text-gray-300 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20" />
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/50 bg-purple-500/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-purple-300">
                The #1 Platform for Music Marketing Analytics
              </span>
            </div>

            <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
              Turn Meta Ads into{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Spotify Streams
              </span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300 sm:text-xl">
              Bridge the gap between your Meta advertising campaigns and Spotify
              streaming analytics. See exactly how your ad spend drives real streams
              and grow your fanbase with data-driven insights.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/register"
                className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-medium text-white transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50 sm:w-auto"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#demo"
                className="w-full rounded-full border border-white/20 bg-white/5 px-8 py-4 text-lg font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 sm:w-auto"
              >
                Watch Demo
              </a>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <div className="mt-20">
            <div className="relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-2 shadow-2xl backdrop-blur-sm">
              <div className="aspect-video rounded-lg bg-gradient-to-br from-purple-900/50 to-pink-900/50" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/10 bg-white/5 px-4 py-16 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-white">$2M+</div>
              <div className="text-sm text-gray-400">Ad Spend Tracked</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-white">50M+</div>
              <div className="text-sm text-gray-400">Streams Analyzed</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-white">500+</div>
              <div className="text-sm text-gray-400">Artists & Labels</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
              Everything You Need to Succeed
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              Powerful tools designed specifically for music marketers who want to
              understand the true ROI of their campaigns
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Target className="h-8 w-8" />}
              title="Unified Campaign Tracking"
              description="Connect your Meta Ads campaigns directly with Spotify streaming data to see the complete picture of your marketing performance."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Real-Time Analytics"
              description="Monitor streams, listener demographics, and engagement metrics in real-time as your campaigns run."
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="ROI Optimization"
              description="Understand which ads drive the most streams and optimize your spend for maximum impact."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Audience Insights"
              description="Deep dive into listener demographics, locations, and behaviors to refine your targeting."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Automated Reporting"
              description="Schedule and export beautiful reports that show the correlation between ad spend and streams."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Enterprise Security"
              description="Bank-level encryption and SOC 2 compliance to keep your data and campaigns secure."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <PricingCard
              name="Starter"
              price="29"
              description="Perfect for independent artists"
              features={[
                '5 active campaigns',
                'Up to 10 tracks',
                'Basic analytics',
                'Email support',
                '30-day data retention',
                'Meta & Spotify integration',
              ]}
            />
            <PricingCard
              name="Professional"
              price="99"
              description="For growing labels and agencies"
              features={[
                'Unlimited campaigns',
                'Unlimited tracks',
                'Advanced analytics',
                'Priority support',
                '1-year data retention',
                'Custom audiences',
                'Automated reporting',
                'API access',
              ]}
              popular
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              description="For large organizations"
              features={[
                'Everything in Pro',
                'Dedicated account manager',
                'Custom integrations',
                'White-label options',
                'SLA guarantee',
                'Advanced permissions',
                'Training & onboarding',
                'Custom contracts',
              ]}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-white/10 bg-white/5 px-4 py-24 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
              Loved by Music Marketers
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              See what industry professionals are saying about SongTrackPro
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <TestimonialCard
              quote="SongTrackPro changed how we run campaigns. We can finally see the direct impact of our Meta ads on Spotify streams. ROI increased by 240%."
              author="Sarah Chen"
              role="Marketing Director, Indie Label"
              image="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
            />
            <TestimonialCard
              quote="The real-time analytics are a game changer. We can adjust campaigns on the fly based on actual streaming data. No more guessing."
              author="Marcus Johnson"
              role="Independent Artist"
              image="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"
            />
            <TestimonialCard
              quote="As an agency managing 50+ artists, SongTrackPro gives us the insights we need to prove value to our clients. Indispensable tool."
              author="Emily Rodriguez"
              role="CEO, Music Marketing Agency"
              image="https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-400">
              Everything you need to know about SongTrackPro
            </p>
          </div>

          <div className="space-y-4">
            <FAQItem
              question="How does SongTrackPro connect Meta Ads with Spotify?"
              answer="We use official APIs from both Meta and Spotify to securely connect your accounts. Our platform correlates campaign timing, targeting, and spend with streaming data to show you the direct impact of your ads."
              isOpen={openFaq === 0}
              onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
            />
            <FAQItem
              question="Is my data secure?"
              answer="Absolutely. We use bank-level encryption, are SOC 2 compliant, and never share your data with third parties. Your campaign data and streaming analytics are completely private and secure."
              isOpen={openFaq === 1}
              onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
            />
            <FAQItem
              question="Can I track multiple artists or campaigns?"
              answer="Yes! All plans support multiple campaigns. The Starter plan includes 5 campaigns and 10 tracks, while Professional and Enterprise plans offer unlimited campaigns and tracks."
              isOpen={openFaq === 2}
              onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
            />
            <FAQItem
              question="What kind of analytics do you provide?"
              answer="We provide comprehensive analytics including stream counts, listener demographics, geographic data, campaign ROI, cost per stream, audience growth, and much more. Professional plans include advanced features like predictive analytics and custom reports."
              isOpen={openFaq === 3}
              onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
            />
            <FAQItem
              question="Do you offer a free trial?"
              answer="Yes! We offer a 14-day free trial on all plans with no credit card required. You'll have full access to all features during your trial period."
              isOpen={openFaq === 4}
              onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
            />
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes, you can cancel your subscription at any time with no penalties. You'll continue to have access until the end of your billing period."
              isOpen={openFaq === 5}
              onClick={() => setOpenFaq(openFaq === 5 ? null : 5)}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 p-12 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="relative text-center">
              <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
                Ready to Transform Your Music Marketing?
              </h2>
              <p className="mb-8 text-xl text-white/90">
                Join hundreds of artists and labels using data to grow their fanbase
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-medium text-purple-600 transition-all hover:scale-105 hover:shadow-xl"
              >
                Start Your Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="mt-4 text-sm text-white/70">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-white/10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <Mail className="mx-auto mb-4 h-12 w-12 text-purple-400" />
          <h3 className="mb-2 text-2xl font-bold text-white">
            Stay Updated
          </h3>
          <p className="mb-6 text-gray-400">
            Get music marketing tips and product updates delivered to your inbox
          </p>
          <form
            onSubmit={e => {
              e.preventDefault()
              // Handle newsletter signup
              console.log('Newsletter signup:', email)
            }}
            className="flex gap-2"
          >
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-medium text-white transition-all hover:scale-105"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h4 className="mb-4 font-semibold text-white">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 SongTrackPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Component helpers
function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-purple-500/50 hover:bg-white/10">
      <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3 text-purple-400 transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}

function PricingCard({
  name,
  price,
  description,
  features,
  popular,
}: {
  name: string
  price: string
  description: string
  features: string[]
  popular?: boolean
}) {
  return (
    <div
      className={`relative rounded-2xl border p-8 ${
        popular
          ? 'border-purple-500 bg-gradient-to-br from-purple-500/10 to-pink-500/10 shadow-xl shadow-purple-500/20'
          : 'border-white/10 bg-white/5'
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 text-sm font-medium text-white">
          Most Popular
        </div>
      )}
      <div className="mb-8">
        <h3 className="mb-2 text-2xl font-bold text-white">{name}</h3>
        <p className="mb-4 text-gray-400">{description}</p>
        <div className="mb-2 flex items-baseline gap-2">
          {price === 'Custom' ? (
            <span className="text-4xl font-bold text-white">{price}</span>
          ) : (
            <>
              <span className="text-4xl font-bold text-white">${price}</span>
              <span className="text-gray-400">/month</span>
            </>
          )}
        </div>
      </div>
      <ul className="mb-8 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-gray-300">
            <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/register"
        className={`block w-full rounded-full py-3 text-center font-medium transition-all ${
          popular
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50'
            : 'border border-white/20 bg-white/5 text-white hover:bg-white/10'
        }`}
      >
        {price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
      </Link>
    </div>
  )
}

function TestimonialCard({
  quote,
  author,
  role,
  image,
}: {
  quote: string
  author: string
  role: string
  image: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
      <p className="mb-6 text-lg text-gray-300">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-4">
        <img
          src={image}
          alt={author}
          className="h-12 w-12 rounded-full ring-2 ring-purple-500"
        />
        <div>
          <div className="font-semibold text-white">{author}</div>
          <div className="text-sm text-gray-400">{role}</div>
        </div>
      </div>
    </div>
  )
}

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between p-6 text-left"
      >
        <span className="font-semibold text-white">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="border-t border-white/10 px-6 pb-6 pt-4 text-gray-400">
          {answer}
        </div>
      )}
    </div>
  )
}