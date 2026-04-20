import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { ActivityLog } from '@/models/ActivityLog'
import { withAuth } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      await connectDB()

      const { searchParams } = new URL(request.url)
      const organizationId = user.organization

      if (!organizationId) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 400 })
      }

      // Parse query params
      const page = parseInt(searchParams.get('page') || '1')
      const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
      const entityType = searchParams.get('entityType') || ''
      const action = searchParams.get('action') || ''
      const projectId = searchParams.get('project') || ''
      const userId = searchParams.get('user') || ''
      const dateRange = searchParams.get('dateRange') || ''
      const search = searchParams.get('search') || ''

      // Build query filters
      const filters: any = {
        organization: organizationId
      }

      if (entityType && entityType !== 'all') {
        filters.entityType = entityType
      }

      if (action && action !== 'all') {
        filters.action = action
      }

      if (projectId && projectId !== 'all') {
        filters.project = projectId
      }

      if (userId && userId !== 'all') {
        filters.user = userId
      }

      // Date range filtering
      if (dateRange && dateRange !== 'all') {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        switch (dateRange) {
          case 'today':
            filters.createdAt = { $gte: today }
            break
          case 'week': {
            const weekAgo = new Date(today)
            weekAgo.setDate(today.getDate() - 7)
            filters.createdAt = { $gte: weekAgo }
            break
          }
          case 'month': {
            const monthAgo = new Date(today)
            monthAgo.setMonth(today.getMonth() - 1)
            filters.createdAt = { $gte: monthAgo }
            break
          }
        }
      }

      // Search by entity name or project name
      if (search) {
        filters.$or = [
          { entityName: { $regex: search, $options: 'i' } },
          { projectName: { $regex: search, $options: 'i' } }
        ]
      }

      // Execute query with pagination
      const skip = (page - 1) * limit
      const [activities, total] = await Promise.all([
        ActivityLog.find(filters)
          .populate('user', 'firstName lastName email avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ActivityLog.countDocuments(filters)
      ])

      // Format response
      const formattedActivities = activities.map((activity: any) => ({
        id: String(activity._id),
        action: activity.action,
        entityType: activity.entityType,
        entityId: activity.entityId ? String(activity.entityId) : null,
        entityName: activity.entityName || '',
        projectId: activity.project ? String(activity.project) : null,
        projectName: activity.projectName || '',
        details: activity.details || {},
        user: activity.user ? {
          _id: String(activity.user._id),
          firstName: activity.user.firstName || '',
          lastName: activity.user.lastName || '',
          email: activity.user.email || '',
          avatar: activity.user.avatar || undefined
        } : null,
        timestamp: activity.createdAt
      }))

      return NextResponse.json({
        success: true,
        activities: formattedActivities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      })

    } catch (error) {
      console.error('Activity API error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}
