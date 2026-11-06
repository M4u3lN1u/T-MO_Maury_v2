import { Bell, Bot, Calendar, ChartColumn, CircleUser, FileText, Folder, LayoutDashboard, ListChecks, NotebookPen,
  TriangleAlert, Users, Wallet } from 'lucide-react'

// Íconos de Lucide (https://lucide.dev/icons/) por nombre del menú
const ICONOS = {
  dash: LayoutDashboard,
  task: ListChecks,
  cal: Calendar,
  user: Users,
  me: CircleUser,
  doc: FileText,
  note: NotebookPen,
  money: Wallet,
  folder: Folder,
  alert: TriangleAlert,
  bot: Bot,
  chart: ChartColumn,
  bell: Bell,
}

// Icono por nombre
export default function Icono({ nombre }) {
  const Componente = ICONOS[nombre]
  return <Componente aria-hidden="true" />
}
