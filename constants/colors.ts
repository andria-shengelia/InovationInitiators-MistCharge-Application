// Main Theme Colors
export const THEME = {
  BACKGROUND: '#B8E8E1', // Warm beige background
  WHITE: '#ffffff',
  BLACK: '#000000',
} as const;

// Text Colors
export const TEXT = {
  PRIMARY: '#1e293b', // Dark text for titles
  SECONDARY: '#64748b', // Medium text for subtitles
  TERTIARY: '#94a3b8', // Light text for captions
  DARK: '#1f2937', // Very dark text
  MEDIUM: '#374151', // Medium dark text
  LIGHT: '#6b7280', // Light gray text
  MUTED: '#9ca3af', // Muted text
} as const;

// Status Colors
export const STATUS = {
  SUCCESS: '#22c55e', // Green for good/safe
  WARNING: '#f59e0b', // Orange for warning/caution
  ERROR: '#ef4444', // Red for error/danger
  INFO: '#3b82f6', // Blue for info
  SUCCESS_DARK: '#10b981', // Darker green
  ERROR_DARK: '#dc2626', // Darker red
  ERROR_DARKER: '#991b1b', // Even darker red
} as const;

// Temperature Colors
export const TEMPERATURE = {
  COLD: '#3b82f6', // Blue for cold
  COMFORTABLE: '#22c55e', // Green for comfortable
  WARM: '#f59e0b', // Orange for warm
  HOT: '#ef4444', // Red for hot
} as const;

// Battery Colors
export const BATTERY = {
  GOOD: '#22c55e', // Green for good battery
  MEDIUM: '#f59e0b', // Orange for medium battery
  LOW: '#ef4444', // Red for low battery
} as const;

// Humidity Colors
export const HUMIDITY = {
  DRY: '#ef4444', // Red for too dry
  MODERATE: '#f59e0b', // Orange for moderate
  OPTIMAL: '#22c55e', // Green for optimal
  HIGH: '#06b6d4', // Cyan for high
} as const;

// Water Colors
export const WATER = {
  PRIMARY: '#06b6d4', // Cyan for water theme
  COLLECTION: '#06b6d4', // Water collection color
  QUALITY_SAFE: '#22c55e', // Safe water quality
  QUALITY_CAUTION: '#f59e0b', // Caution water quality
  QUALITY_UNSAFE: '#ef4444', // Unsafe water quality
  QUALITY_UNKNOWN: '#6b7280', // Unknown water quality
} as const;

// Power Colors
export const POWER = {
  ON: '#10b981', // Green for power on
  OFF: '#ef4444', // Red for power off
} as const;

// Chart Colors
export const CHART = {
  PRIMARY: '#3b82f6', // Blue for charts
  BARS: '#3b82f6', // Chart bars
} as const;

// Border Colors
export const BORDER = {
  LIGHT: '#e2e8f0', // Light border
  MEDIUM: '#e5e7eb', // Medium border
  DARK: '#f1f5f9', // Dark border
} as const;

// Background Colors
export const BACKGROUND = {
  CARD: '#ffffff', // Card background
  ERROR: '#fef2f2', // Error background
  SUCCESS: '#f0fdf4', // Success background
  WARNING: '#fffbeb', // Warning background
  INFO: '#f8fafc', // Info background
  POWER_INFO: '#f8fafc', // Power control info background
} as const;

// Tab Colors
export const TAB = {
  ACTIVE: '#2563eb', // Active tab color
  INACTIVE: '#6b7280', // Inactive tab color
  BACKGROUND: '#ffffff', // Tab bar background
  BORDER: '#e5e7eb', // Tab bar border
} as const;

// Switch Colors
export const SWITCH = {
  TRACK_OFF: '#e2e8f0', // Switch track when off
  TRACK_ON: '#3b82f6', // Switch track when on
  THUMB: '#ffffff', // Switch thumb color
} as const;

// Network Colors
export const NETWORK = {
  ONLINE: '#34C759', // Green for online
  OFFLINE: '#FF3B30', // Red for offline
  WARNING: '#FF9500', // Orange for warning
  PRIMARY: '#007AFF', // Blue for network status
  MUTED: '#999', // Muted network status
} as const;

// Sync Colors
export const SYNC = {
  PRIMARY: '#007AFF', // Primary sync color
  SUCCESS: '#E3F2FD', // Success sync background
  WARNING: '#FFF3CD', // Warning sync background
  WARNING_TEXT: '#856404', // Warning sync text
  ERROR: '#FF3B30', // Error sync color
  BORDER: '#E5E5E5', // Sync border
  BACKGROUND: '#F8F9FA', // Sync background
  MUTED_BACKGROUND: '#F0F0F0', // Muted sync background
} as const;

// Progress Colors
export const PROGRESS = {
  BACKGROUND: '#e2e8f0', // Progress bar background
  FILL: '#06b6d4', // Progress bar fill
  FILL_HIGH: '#22c55e', // Progress bar fill when high
} as const;

// Shadow Colors
export const SHADOW = {
  PRIMARY: '#000000', // Primary shadow color
} as const;

// Export all colors as a single object for easy access
export const COLORS = {
  ...THEME,
  ...TEXT,
  ...STATUS,
  ...TEMPERATURE,
  ...BATTERY,
  ...HUMIDITY,
  ...WATER,
  ...POWER,
  ...CHART,
  ...BORDER,
  ...BACKGROUND,
  ...TAB,
  ...SWITCH,
  ...NETWORK,
  ...SYNC,
  ...PROGRESS,
  ...SHADOW,
} as const;

// Type for color names
export type ColorName = keyof typeof COLORS; 