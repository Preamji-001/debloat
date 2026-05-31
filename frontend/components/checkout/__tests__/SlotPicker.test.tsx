import { render, screen, fireEvent } from '@testing-library/react'
import SlotPicker from '../SlotPicker'
import type { DeliverySlot } from '@/lib/types'

const slots: DeliverySlot[] = [
  { id: 's1', date: '2026-05-27', label: '8am - 10am', capacity: 10, booked_count: 5, is_active: true },
  { id: 's2', date: '2026-05-27', label: '6pm - 8pm', capacity: 5, booked_count: 5, is_active: true },
]

jest.mock('@/lib/api', () => ({
  getDeliverySlots: jest.fn().mockResolvedValue({
    data: [
      { id: 's1', date: '2026-05-27', label: '8am - 10am', capacity: 10, booked_count: 5, is_active: true },
      { id: 's2', date: '2026-05-27', label: '6pm - 8pm', capacity: 5, booked_count: 5, is_active: true },
    ],
  }),
}))

test('disables slot when booked_count >= capacity', async () => {
  render(<SlotPicker selectedSlotId={null} onSelect={jest.fn()} />)
  const fullSlot = await screen.findByText(/6pm - 8pm/i)
  expect(fullSlot.closest('button')).toBeDisabled()
})

test('calls onSelect with slot id on click', async () => {
  const onSelect = jest.fn()
  render(<SlotPicker selectedSlotId={null} onSelect={onSelect} />)
  const slot = await screen.findByText(/8am - 10am/i)
  fireEvent.click(slot.closest('button')!)
  expect(onSelect).toHaveBeenCalledWith('s1')
})
