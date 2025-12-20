/**
 * ============================================================================
 * SHARED DEADLINE STATS HOOK
 * ============================================================================
 * Purpose: Compute deadline statistics (overdue, due soon counts) using
 *          EXACTLY THE SAME LOGIC as Dashboard so Notification counts match
 * 
 * Usage:
 *   const { overdueTasks, dueSoonTasks, upcomingTasks } = useDeadlineStats();
 * 
 * Features:
 *   - Uses isTaskExpired & isTaskDueSoon helpers (client-side logic)
 *   - Filters only non-Done tasks (status ≠ 'Done')
 *   - DueSoon = deadline within 48h (Dashboard uses 72h for list, but 48h for stats)
 *   - Reactive: updates when useTaskStore.tasks changes
 *   - No API calls: uses in-memory task data
 * ============================================================================
 */

import { useMemo } from 'react';
import { useTaskStore } from '../features/taskStore.js';
import { isTaskExpired, isTaskDueSoon } from '../utils/deadlineHelpers.js';

export const useDeadlineStats = () => {
  const { tasks } = useTaskStore();

  return useMemo(() => {
    // Ensure tasks is array
    if (!Array.isArray(tasks)) {
      return {
        overdueTasks: [],
        dueSoonTasks: [],
        upcomingTasks: [],
        overdueCount: 0,
        dueSoonCount: 0
      };
    }

    // Filter to non-Done tasks only
    const activeTasks = tasks.filter(t => t.status !== 'Done');

    // Partition by deadline status
    const overdueTasks = activeTasks.filter(t => isTaskExpired(t));
    const dueSoonTasks = activeTasks.filter(t => 
      !isTaskExpired(t) && isTaskDueSoon(t, 48) // 48h threshold to match backend
    );

    // Combine: overdue + dueSoon (for upcoming list in modal)
    const upcomingTasks = [...dueSoonTasks, ...overdueTasks]
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    return {
      overdueTasks,
      dueSoonTasks,
      upcomingTasks,
      overdueCount: overdueTasks.length,
      dueSoonCount: dueSoonTasks.length
    };
  }, [tasks]);
};
