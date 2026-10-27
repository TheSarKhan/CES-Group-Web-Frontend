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
  PAGES: "Səhifə məzmunu",
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

export type FieldKind = "TEXT" | "TEXTAREA" | "URL" | "NUMBER" | "BOOL" | "IMAGE" | "GALLERY" | "SELECT" | "LIST";

export type FieldDef = {
  name: string;
  label: string;
  kind: FieldKind;
  translatable: boolean;
  required: boolean;
  max: number | null;
  hint: string | null;
  options: { value: string; label: string }[] | null;
  itemFields: FieldDef[] | null;
};

export type ContentType = {
  code: string;
  label: string;
  description: string;
  module: string;
  singleton: boolean;
  titleField: string;
  fields: FieldDef[];
};

export type ContentSummary = {
  id: number;
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  hasChanges: boolean;
  sortOrder: number;
  updatedAt: string;
  updatedBy: string | null;
  publishedAt: string | null;
  /** Hər dildə (en, ru) çatışan tərcümə sahələrinin sayı: qaralamada və (dərc olunubsa) dərc olunmuş nüsxədə */
  draftGaps: Record<string, number>;
  publishedGaps: Record<string, number> | null;
};

export type Seo = { title?: Record<string, string>; description?: Record<string, string>; ogImage?: string; canonical?: string; noindex?: boolean };

export type ContentEntry = {
  id: number;
  type: string;
  slug: string;
  sortOrder: number;
  status: "DRAFT" | "PUBLISHED";
  hasChanges: boolean;
  data: Record<string, unknown>;
  seo: Seo;
  published: Record<string, unknown> | null;
  publishedAt: string | null;
  publishedBy: string | null;
  updatedAt: string;
  updatedBy: string | null;
};

export type Revision = { id: number; version: number; note: string | null; createdBy: string | null; createdAt: string };
