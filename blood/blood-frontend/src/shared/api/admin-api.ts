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

export interface NotificationPrefs {
  email: boolean;
  sms: boolean;
  push: boolean;
  emergencyAlerts: boolean;
  donationReminders: boolean;
  newsletter: boolean;
}

export interface DonationScheduleResponse {
  id: number;
  donationTime: string;
  capacity: number;
  locationId?: number;
  locationName?: string;
}

export interface DonorMatchResponse {
  donorId: number;
  donorName: string;
  bloodGroup: string;
  priorityScore: number;
  bloodGroupScore: number;
  availabilityScore: number;
  healthScore: number;
  reason: string;
}

export interface CheckpointResponse {
  location: string;
  description: string;
  timestamp: string;
  temperature: number;
}

export interface ShipmentResponse {
  id: number;
  bloodRequestId: number;
  status: string;
  courierName: string;
  courierPhone: string;
  pickedUpAt: string;
  deliveredAt: string;
  temperatureAtPickup: number;
  notes: string;
  checkpoints: CheckpointResponse[];
}

export interface CampaignResponse {
  id: number;
  title: string;
  description: string;
  targetBloodGroup: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface CampaignResponse {
  id: number;
  title: string;
  description: string;
  targetBloodGroup: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface HospitalMetricsResponse {
  pendingRequests: number;
  fulfilledToday: number;
  avgResponseTime: string;
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

export interface ActivityEntry {
  id: string;
  type: "donation" | "request" | "certificate" | "appointment";
  title: string;
  date: string;
  status?: string;
}

export interface DonorSummary {
  totalDonations: number;
  livesSaved: number;
  nextEligibleDate: string;
  lastDonationDate?: string | null;
  recentActivities: ActivityEntry[];
}

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

export async function getDonorSummary(): Promise<DonorSummary> {
  const { data } = await AXIOS_INSTANCE.get('/api/donate/me/summary');
  return unwrap(data);
}

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

export async function getNotificationPreferences(): Promise<NotificationPrefs> {
  const { data } = await AXIOS_INSTANCE.get('/api/profile/notification-preferences');
  return unwrap(data);
}

export async function updateNotificationPreferences(payload: NotificationPrefs): Promise<NotificationPrefs> {
  const { data } = await AXIOS_INSTANCE.put('/api/profile/notification-preferences', payload);
  return unwrap(data);
}

export async function getSchedules(): Promise<DonationScheduleResponse[]> {
  const { data } = await AXIOS_INSTANCE.get('/api/schedules');
  return unwrap(data);
}

export interface CreateAppointmentRequest {
  scheduleId: number;
  donorNotes?: string;
}

export async function createAppointment(payload: CreateAppointmentRequest): Promise<any> {
  const { data } = await AXIOS_INSTANCE.post('/api/donate/appointments', payload);
  return unwrap(data);
}

export async function getRecommendations(requestId: number, limit = 10): Promise<DonorMatchResponse[]> {
  const { data } = await AXIOS_INSTANCE.get(`/api/matching/recommend/${requestId}`, { params: { limit } });
  return unwrap(data);
}

export async function getShipments(): Promise<ShipmentResponse[]> {
  const { data } = await AXIOS_INSTANCE.get('/api/shipments');
  return unwrap(data);
}

export async function getCampaigns(): Promise<CampaignResponse[]> {
  const { data } = await AXIOS_INSTANCE.get('/api/campaigns');
  return unwrap(data);
}

export async function getHospitalMetrics(): Promise<HospitalMetricsResponse> {
  const { data } = await AXIOS_INSTANCE.get('/api/metrics/hospital');
  return unwrap(data);
}