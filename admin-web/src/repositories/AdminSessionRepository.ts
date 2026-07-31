import { AdminRole } from '../models/types';

export class AdminSessionRepository {
  private static ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
    superAdmin: ['*'],
    admin: [
      'recipes:manage', 'exercises:manage', 'templates:manage', 'announcements:manage',
      'config:manage', 'reviews:manage', 'ingredients:manage', 'categories:manage'
    ],
    contentEditor: ['recipes:edit', 'exercises:edit', 'templates:edit'],
    nutritionReviewer: ['recipes:review', 'ingredients:review', 'mealPlans:review'],
    exerciseReviewer: ['exercises:review', 'workoutTemplates:review'],
    support: ['support:view']
  };

  static hasPermission(role: AdminRole, permission: string): boolean {
    const permissions = this.ROLE_PERMISSIONS[role] || [];
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  }

  static canPublish(role: AdminRole): boolean {
    return role === 'superAdmin' || role === 'admin';
  }
}
