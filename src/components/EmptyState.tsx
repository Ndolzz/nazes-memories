import { Icon, type IconName } from './Icon'

export function EmptyState({
  icon = 'memory',
  title,
  description,
  action
}: {
  icon?: IconName
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-naze-gradient-soft text-violet-600">
        <Icon name={icon} size={28} />
      </div>
      <div className="space-y-1.5">
        <p className="font-display text-xl text-ink">{title}</p>
        <p className="text-sm text-ink-soft/70 max-w-xs mx-auto">{description}</p>
      </div>
      {action}
    </div>
  )
}
