import { AXIOS_INSTANCE } from './axios-instance';

/**
 * Thin typed wrappers around the admin / self-service endpoints that have
 * not yet been picked up by the OpenAPI → Orval regeneration pipeline.
 *
 * Once `npm run orval` regenerates the controllers from a live backend
 * these helpers can be deleted and the generated hooks can be used instead.
 */

export type Role =
  | 'DONOR'
  | 'RECIPIENT'
  | 'HOSPITAL'
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'STAFF'
  | 'MEDICAL_STAFF'
  | 'LAB_STAFF'
  | 'COURIER'
  | 'VOLUNTEER'
  | 'MEDICALCENTER';

export interface AdminUserSummary {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  bloodGroup?: string | null;
}

export interface AdminAuditEvent {
  id: number;
  actorId?: number | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  reason?: string | null;
  ipAddress?: string | null;
  deviceId?: string | null;
  createdAt: string;
}

export interface AdminNotification {
  id: number;
  title: string;
  body: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  channel?: string | null;
  createdAt: string;
  referenceType?: string | null;
  referenceId?: string | null;
}

export interface QueueTodayResponse {
  date: string;
  total: number;
  checkedIn: number;
  approved: number;
  deferred: number;
  completed: number;
  rows: any[];
}

export interface AnalyticsSummary {
  totalUsers: number;
  totalDonations: number;
  totalBloodUnits: number;
  totalRequests: number;
  emergencyRequests: number;
  donationsByMonth: Record<string, number>;
  bloodTypeDistribution: Record<string, number>;
  generatedAt: string;
}

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

export async function getUsersCount(): Promise<{ total: number }> {
  const { data } = await AXIOS_INSTANCE.get('/api/admin/users/count');
  return unwrap(data);
}

export async function getAuditLogs(size = 100): Promise<AdminAuditEvent[]> {
  const { data } = await AXIOS_INSTANCE.get('/api/admin/audit-logs', {
    params: { page: 0, size },
  });
  return unwrap(data) ?? [];
}

export async function getMyNotifications(): Promise<AdminNotification[]> {
  const { data } = await AXIOS_INSTANCE.get('/api/notifications');
  return unwrap(data) ?? [];
}

export async function markNotificationRead(id: number): Promise<void> {
  await AXIOS_INSTANCE.post(`/api/notifications/${id}/read`);
}

export async function getQueueToday(medicalCenterName?: string): Promise<QueueTodayResponse> {
  const { data } = await AXIOS_INSTANCE.get('/api/medical-center/queue/today', {
    params: medicalCenterName ? { medicalCenterName } : {},
  });
  return unwrap(data);
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const { data } = await AXIOS_INSTANCE.get('/api/analytics/summary');
  return unwrap(data);
}

export async function updateMe(payload: {
  firstName: string;
  lastName: string;
  phone?: string;
  birthDate?: string;
}): Promise<AdminUserSummary> {
  const { data } = await AXIOS_INSTANCE.patch('/api/users/me', payload);
  return unwrap(data);
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await AXIOS_INSTANCE.post('/api/users/me/change-password', payload);
}