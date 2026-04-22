import mongoose, { Schema, Document } from 'mongoose'

export type ActivityEntityType = 'task' | 'project' | 'sprint' | 'time_entry' | 'timer'

export type ActivityAction =
  | 'timer_started'
  | 'timer_stopped'
  | 'timer_paused'
  | 'timer_resumed'
  | 'time_entry_saved'
  | 'time_entry_updated'
  | 'time_entry_deleted'
  | 'task_created'
  | 'task_updated'
  | 'task_assigned'
  | 'task_status_changed'
  | 'project_created'
  | 'project_updated'
  | 'project_member_added'
  | 'project_member_removed'
  | 'sprint_created'
  | 'sprint_updated'
  | 'sprint_started'
  | 'sprint_completed'
  | 'sprint_task_added'
  | 'sprint_task_removed'

export interface IActivityLog extends Document {
  organization: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  action: ActivityAction
  entityType: ActivityEntityType
  entityId?: mongoose.Types.ObjectId
  entityName?: string
  project?: mongoose.Types.ObjectId
  projectName?: string
  details?: Record<string, any>
  createdAt: Date
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'timer_started', 'timer_stopped', 'timer_paused', 'timer_resumed',
        'time_entry_saved', 'time_entry_updated', 'time_entry_deleted',
        'task_created', 'task_updated', 'task_assigned', 'task_status_changed',
        'project_created', 'project_updated', 'project_member_added', 'project_member_removed',
        'sprint_created', 'sprint_updated', 'sprint_started', 'sprint_completed',
        'sprint_task_added', 'sprint_task_removed'
      ]
    },
    entityType: {
      type: String,
      required: true,
      enum: ['task', 'project', 'sprint', 'time_entry', 'timer']
    },
    entityId: {
      type: Schema.Types.ObjectId
    },
    entityName: {
      type: String,
      maxlength: 500
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project'
    },
    projectName: {
      type: String,
      maxlength: 200
    },
    details: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
)

// Indexes for efficient querying
ActivityLogSchema.index({ organization: 1, createdAt: -1 })
ActivityLogSchema.index({ organization: 1, user: 1, createdAt: -1 })
ActivityLogSchema.index({ organization: 1, entityType: 1, createdAt: -1 })
ActivityLogSchema.index({ organization: 1, project: 1, createdAt: -1 })

export const ActivityLog =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema)
