export const PEAK_PRICE = 300;
export const OFF_PEAK_PRICE = 260;

export const PEAK_HOURS = ['09:00', '10:00', '16:00']; // 9-11 AM, 4-5 PM (start times)

export function isPeakHour(timeSlot: string): boolean {
  return PEAK_HOURS.includes(timeSlot);
}

export function getBasePrice(timeSlot: string): number {
  return isPeakHour(timeSlot) ? PEAK_PRICE : OFF_PEAK_PRICE;
}

export function calculateDiscount(sessions: number): number {
  if (sessions >= 30) return 0.3;
  if (sessions >= 20) return 0.2;
  if (sessions >= 10) return 0.1;
  return 0;
}

export function calculateTotalPrice(
timeSlots: string[],
sessionsCount: number)
: {
  subtotal: number;
  discountAmount: number;
  total: number;
  gst: number;
  final: number;
} {
  // For simplicity, if multiple sessions are booked, we assume they are distributed.
  // In this wizard, we book 1 slot at a time, but if it's a package, we multiply.
  // Let's assume the selected slot dictates the base price for the package.
  const basePrice =
  timeSlots.length > 0 ? getBasePrice(timeSlots[0]) : OFF_PEAK_PRICE;
  const subtotal = basePrice * sessionsCount;

  const discountRate = calculateDiscount(sessionsCount);
  const discountAmount = subtotal * discountRate;

  const total = subtotal - discountAmount;
  const gst = total * 0.18; // 18% GST

  return {
    subtotal,
    discountAmount,
    total,
    gst,
    final: total + gst
  };
}

export function getSlotDisplay(slot: string): string {
  if (!slot) return '';
  try {
    const [hour, min] = slot.split(':').map(Number);
    const endMin = (min + 45) % 60;
    const endHour = hour + Math.floor((min + 45) / 60);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hour)}:${pad(min)} - ${pad(endHour)}:${pad(endMin)}`;
  } catch (e) {
    return slot;
  }
}