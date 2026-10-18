// Sample records use dates relative to "now" so the demo always looks current.
export const daysFromNow = (days) => new Date(Date.now() + days * 864e5).toISOString()
