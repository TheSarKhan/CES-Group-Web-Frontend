export type Action = "VIEW" | "CREATE" | "UPDATE" | "DELETE" | "PUBLISH";

export type UserInfo = {
  id: number;
  email: string;
  name: string;
  superAdmin: boolean;
  totpEnabled: boolean;
  mfaSetupRequired: boolean;
};

export type SiteAccess = { code: string; name: string; domain: string; locales: string; modules: Record<string, Action[]> };

export type Me = { id: number; email: string; name: string; superAdmin: boolean; sites: SiteAccess[]; global: Record<string, Action[]> };

export type RoleRef = { id: number; name: string };

export type UserView = {
  id: number;
  email: string;
  name: string;
  active: boolean;
  totpEnabled: boolean;
  locked: boolean;
  lastLoginAt: string | null;
  roles: RoleRef[];
};

export type Permission = { module: string; action: Action; siteCode: string | null };

export type RoleView = {
  id: number;
  name: string;
  description: string | null;
  system: boolean;
  superRole: boolean;
  userCount: number;
  permissions: Permission[];
};

export type Meta = {
  modules: { code: string; global: boolean }[];
  actions: Action[];
  sites: { code: string; name: string; domain: string; locales: string }[];
};

export type AuditRow = {
  id: number;
  userEmail: string | null;
  action: string;
  module: string | null;
  entity: string | null;
  entityId: string | null;
  siteCode: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
};

export type Page<T> = { items: T[]; total: number; page: number; size: number };

export const MODULE_LABELS: Record<string, string> = {
  SUBMISSIONS: "Müraciətlər",
  PAGES: "Səhifələr",
  PROJECTS: "Layihələr",
  FAQ: "Suallar",
  FLEET: "Texnika kataloqu",
  MEDIA: "Media",
  SEO: "SEO",
  REDIRECTS: "Yönləndirmələr",
  SETTINGS: "Ayarlar",
  NOTIFICATIONS: "Bildirişlər",
  STATISTICS: "Statistika",
  TRASH: "Zibil qutusu",
  USERS: "İstifadəçilər",
  ROLES: "Rollar",
  AUDIT: "Audit log",
};

export const ACTION_LABELS: Record<Action, string> = {
  VIEW: "Bax",
  CREATE: "Yarat",
  UPDATE: "Redaktə",
  DELETE: "Sil",
  PUBLISH: "Dərc et",
};

export type LeadStatus = "NEW" | "IN_PROGRESS" | "DONE" | "SPAM";
export type SubmissionType = "CONTACT" | "QUOTE";

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Yeni",
  IN_PROGRESS: "İşlənir",
  DONE: "Tamamlanıb",
  SPAM: "Spam",
};

export const TYPE_LABELS: Record<SubmissionType, string> = { CONTACT: "Əlaqə", QUOTE: "Qiymət sorğusu" };

/** Qiymət sorğusunun əlavə sahələrinin başlıqları */
export const EXTRA_LABELS: Record<string, string> = { equipmentType: "Texnika növü", duration: "Müddət", location: "Yer" };

export type Submission = {
  id: number;
  type: SubmissionType;
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
  message: string | null;
  payload: string | null;
  origin: string | null;
  status: LeadStatus;
  assignee: { id: number; name: string } | null;
  ipAddress: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Note = { id: number; authorEmail: string | null; body: string; createdAt: string };

export type SubmissionDetail = { submission: Submission; notes: Note[] };

export type NotificationSettings = {
  emails: string[];
  fallbackEmail: string | null;
  telegram: { id: number; username: string; connected: boolean }[];
  botConfigured: boolean;
  botUsername: string | null;
};

export type StatItem = { name: string; value: number };

export type SiteStats = {
  days: number;
  from: string;
  to: string;
  totals: { users: number; sessions: number; pageViews: number; engagementRate: number };
  leads: number;
  conversionRate: number;
  daily: { date: string; users: number; pageViews: number }[];
  pages: StatItem[];
  sources: StatItem[];
  aiSessions: number;
  countries: StatItem[];
  devices: StatItem[];
  browsers: StatItem[];
  generatedAt: string;
};

export type StatsOverview = {
  days: number;
  sites: { code: string; name: string; users: number; pageViews: number; sessions: number; leads: number; conversionRate: number }[];
  generatedAt: string;
};
