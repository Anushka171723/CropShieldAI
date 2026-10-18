import { daysFromNow } from './seedDates'

// FICTIONAL sample follow-ups. Each one belongs to a report through `reportId`.
// status: Pending | Completed. Overdue is worked out from dueDate, not stored.
export const seedFollowUps = [
  { id: 'fu-501', reportId: 'rpt-1009', crop: 'Cotton', dueDate: daysFromNow(2), status: 'Pending', lastUpdate: 'Spray applied on day 1. Leaves are still curling.', updates: [{ at: daysFromNow(-1), outcome: 'Unchanged', note: 'Spray applied on day 1. Leaves are still curling.' }] },
  { id: 'fu-502', reportId: 'rpt-1007', crop: 'Chilli', dueDate: daysFromNow(-1), status: 'Pending', lastUpdate: 'White coating reduced on older leaves.', updates: [{ at: daysFromNow(-3), outcome: 'Improved', note: 'White coating reduced on older leaves.' }] },
  { id: 'fu-503', reportId: 'rpt-1012', crop: 'Tomato', dueDate: daysFromNow(5), status: 'Pending', lastUpdate: 'No updates yet. First follow-up after expert review.', updates: [] },
  { id: 'fu-504', reportId: 'rpt-0991', crop: 'Onion', dueDate: daysFromNow(-6), status: 'Completed', lastUpdate: 'Insects no longer visible. Case closed.', updates: [{ at: daysFromNow(-6), outcome: 'Improved', note: 'Insects no longer visible. Case closed.' }] },
]
