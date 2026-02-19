import { CallLog } from '@/types';

/**
 * Reminder phases in priority order
 */
export type ReminderPhase =
  | 'UPCOMING'
  | 'ACTIVE'
  | 'WARNING'
  | 'CRITICAL';

/**
 * Returns reminder date at 12:00 AM
 */
export function getReminderDate(log: CallLog): Date | null {
  if (!log.reminderDays) return null;

  const baseDate = new Date(log.dateTime);
  const reminderDate = new Date(baseDate);

  reminderDate.setDate(reminderDate.getDate() + log.reminderDays);
  reminderDate.setHours(0, 0, 0, 0); // unlock at 12:00 AM

  return reminderDate;
}

/**
 * Returns number of days overdue
 */
export function getDaysOverdue(reminderDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diff =
    (today.getTime() - reminderDate.getTime()) /
    (1000 * 60 * 60 * 24);

  return Math.floor(diff);
}

/**
 * Determines reminder phase
 */
export function getReminderPhase(
  log: CallLog
): ReminderPhase | null {
  if (!log.reminderDays) return null;

  const reminderDate = getReminderDate(log);
  if (!reminderDate) return null;

  const daysOverdue = getDaysOverdue(reminderDate);

  if (daysOverdue < 0) return 'UPCOMING';
  if (daysOverdue <= 1) return 'ACTIVE';
  if (daysOverdue === 2) return 'WARNING';

  return 'CRITICAL';
}

/**
 * Maps reminder phase to shadcn/ui Badge variants
 */
export function getReminderBadgeVariant(
  phase: ReminderPhase
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (phase) {
    case 'ACTIVE':
      return 'default';      // green-ish primary
    case 'WARNING':
      return 'outline';      // yellow-ish warning feel
    case 'CRITICAL':
      return 'destructive'; // red
    case 'UPCOMING':
    default:
      return 'secondary';   // muted
  }
}

/**
 * Sorting priority (lower = higher priority)
 */
export function getReminderPriority(log: CallLog): number {
  const phase = getReminderPhase(log);

  switch (phase) {
    case 'CRITICAL':
      return 1;
    case 'WARNING':
      return 2;
    case 'ACTIVE':
      return 3;
    case 'UPCOMING':
      return 4;
    default:
      return 5;
  }
}
