export interface Alarm {
  id: number;
  name: string;
  description: string;
  alerting_msg: string;
  ok_msg: string;
  severity: number;
  permission_level: number;
  alarm_level: number;
  for_duration: number;
  manual_reset: boolean;
  context: any;
}

export interface AlarmsState {
  alarms: Alarm[];
  searchQuery: string;
  hasFetched: boolean;
}

export interface AlarmState {
  alarm: Alarm;
}

export enum Severity {
  Minor = 1,
  Major = 2,
  Critical = 4,
}

export interface SeverityInfo {
  value: Severity;
  label: string;
  description: string;
}

export const Severities: SeverityInfo[] = [
  { value: Severity.Minor, label: 'Minor', description: 'Minor' },
  { value: Severity.Major, label: 'Major', description: 'Major' },
  { value: Severity.Critical, label: 'Critical', description: 'Critical' },
];

export enum Permission {
  View = 1,
  Edit = 2,
  Admin = 4,
  GrafanaAdmin = 8,
}

export interface PermissionInfo {
  value: Permission;
  label: string;
  description: string;
}

export const AlarmPermissions: PermissionInfo[] = [
  { value: Permission.View, label: 'Viewer', description: 'Viewer' },
  { value: Permission.Edit, label: 'Editor', description: 'Editor' },
  { value: Permission.Admin, label: 'Org Admin', description: 'Org Admin' },
  { value: Permission.GrafanaAdmin, label: 'Super Admin', description: 'Super Admin' },
];

export enum AlarmLevel {
  Org = 1,
  Site = 2,
  Asset = 4,
}

export interface AlarmLevelInfo {
  value: AlarmLevel;
  label: string;
  description: string;
}

export const AlarmLevels: AlarmLevelInfo[] = [
  { value: AlarmLevel.Org, label: 'Org', description: 'Org Wide' },
  { value: AlarmLevel.Site, label: 'Site', description: 'Site Wide' },
  { value: AlarmLevel.Asset, label: 'Asset', description: 'Asset Wide' },
];
