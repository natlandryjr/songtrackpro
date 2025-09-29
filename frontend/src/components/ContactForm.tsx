import { useState } from 'react'
import { Send } from 'lucide-react'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    setSubmitted(true)
    setIsSubmitting(false)

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: '', email: '', company: '', message: '' })
      setSubmitted(false)
    }, 3000)
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-500/50 bg-green-500/10 p-12 text-center backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
          <svg
            className="h-8 w-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-2xl font-bold text-white">
          Message Sent!
        </h3>
        <p className="text-gray-300">
          We'll get back to you within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
    >
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-300">
          Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
          Email *
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="john@example.com"
          required
        />
      </div>

      <div>
        <label htmlFor="company" className="mb-2 block text-sm font-medium text-gray-300">
          Company / Artist Name
        </label>
        <input
          type="text"
          id="company"
          value={formData.company}
          onChange={e => setFormData({ ...formData, company: e.target.value })}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Acme Records"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-300">
          Message *
        </label>
        <textarea
          id="message"
          rows={5}
          value={formData.message}
          onChange={e => setFormData({ ...formData, message: e.target.value })}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Tell us about your needs..."
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-medium text-white transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:hover:scale-100"
      >
        {isSubmitting ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Send Message
          </>
        )}
      </button>
    </form>
  )
}