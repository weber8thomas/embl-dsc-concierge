import {
  Beaker,
  BookOpen,
  Brain,
  Building2,
  Calculator,
  Camera,
  CircleHelp,
  Cloud,
  Cpu,
  Database,
  FileSpreadsheet,
  FlaskConical,
  FolderTree,
  GraduationCap,
  HardDrive,
  Image,
  Laptop,
  LineChart,
  Mail,
  Megaphone,
  Microscope,
  Network,
  Palette,
  Server,
  Settings,
  Share2,
  Sigma,
  Workflow,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

/**
 * Curated set of lucide icons content editors can reference via an entity's
 * optional `icon:` field. Distinguishing entities by icon (never colour) is the
 * EMBL rule. Unknown names fall back to a neutral icon — never a crash.
 *
 * Keep this list in sync with the names documented in public/content.yaml.
 */
export const ENTITY_ICONS: Record<string, LucideIcon> = {
  beaker: Beaker,
  book: BookOpen,
  brain: Brain,
  building: Building2,
  calculator: Calculator,
  camera: Camera,
  cloud: Cloud,
  cpu: Cpu,
  database: Database,
  flask: FlaskConical,
  folder: FolderTree,
  'graduation-cap': GraduationCap,
  'hard-drive': HardDrive,
  image: Image,
  laptop: Laptop,
  'line-chart': LineChart,
  mail: Mail,
  megaphone: Megaphone,
  microscope: Microscope,
  network: Network,
  palette: Palette,
  server: Server,
  settings: Settings,
  share: Share2,
  sigma: Sigma,
  spreadsheet: FileSpreadsheet,
  workflow: Workflow,
  wrench: Wrench,
}

export const FALLBACK_ICON: LucideIcon = CircleHelp

export function resolveIcon(name?: string): LucideIcon {
  if (name && ENTITY_ICONS[name]) return ENTITY_ICONS[name]
  return FALLBACK_ICON
}
