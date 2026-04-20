import { ActivityLog, ActivityAction, ActivityEntityType } from '@/models/ActivityLog'

interface LogActivityParams {
  organizationId: string
  userId: string
  action: ActivityAction
  entityType: ActivityEntityType
  entityId?: string
  entityName?: string
  projectId?: string
  projectName?: string
  details?: Record<string, any>
}

/**
 * Log a user activity. This function is fire-and-forget — it does not throw
 * and should be called without `await` to avoid blocking API responses.
 *
 * Usage:
 *   logActivity({ ... }).catch(err => console.error('Failed to log activity:', err))
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await ActivityLog.create({
      organization: params.organizationId,
      user: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      entityName: params.entityName,
      project: params.projectId,
      projectName: params.projectName,
      details: params.details
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}
