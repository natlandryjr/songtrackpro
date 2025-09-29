import { Calendar } from 'lucide-react'
import { useState } from 'react'
import Button from '@/components/ui/Button'

interface DateRangePickerProps {
  onDateChange: (startDate: string, endDate: string) => void
}

export default function DateRangePicker({ onDateChange }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [preset, setPreset] = useState('30d')

  const handlePresetChange = (presetValue: string) => {
    setPreset(presetValue)
    const end = new Date()
    let start = new Date()

    switch (presetValue) {
      case '7d':
        start.setDate(end.getDate() - 7)
        break
      case '30d':
        start.setDate(end.getDate() - 30)
        break
      case '90d':
        start.setDate(end.getDate() - 90)
        break
      case 'ytd':
        start = new Date(end.getFullYear(), 0, 1)
        break
    }

    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]
    setStartDate(startStr)
    setEndDate(endStr)
    onDateChange(startStr, endStr)
  }

  const handleCustomDateChange = () => {
    if (startDate && endDate) {
      onDateChange(startDate, endDate)
      setPreset('custom')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Calendar className="h-5 w-5 text-gray-500" />

      {/* Preset Buttons */}
      <div className="flex gap-2">
        {[
          { value: '7d', label: 'Last 7 days' },
          { value: '30d', label: 'Last 30 days' },
          { value: '90d', label: 'Last 90 days' },
          { value: 'ytd', label: 'Year to date' },
        ].map(p => (
          <Button
            key={p.value}
            variant={preset === p.value ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handlePresetChange(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Custom Date Inputs */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <span className="text-gray-500">to</span>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <Button variant="outline" size="sm" onClick={handleCustomDateChange}>
          Apply
        </Button>
      </div>
    </div>
  )
}