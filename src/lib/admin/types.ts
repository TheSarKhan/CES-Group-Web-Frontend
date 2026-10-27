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
