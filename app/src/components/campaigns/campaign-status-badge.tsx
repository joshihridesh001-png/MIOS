import { Badge } from "@/components/ui/badge"
import { CampaignStatus } from "@/lib/types/database"
import { statusLabels, statusColors } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <Badge variant="outline" className={cn("gap-1.5 capitalize font-medium", statusColors[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabels[status] || status}
    </Badge>
  )
}
