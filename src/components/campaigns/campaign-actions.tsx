'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PencilSimple, Trash } from "@phosphor-icons/react"
import { Button } from '@/components/ui/button'
import { deleteCampaign } from '@/hooks/use-campaigns'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function CampaignActions({ id }: { id: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await deleteCampaign(id)
      toast.success('Campaign deleted')
      setOpen(false)
      router.push('/campaigns')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete campaign')
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/campaigns/${id}/edit`} className="gap-2">
          <PencilSimple weight="duotone" className="w-4 h-4" />
          Edit
        </Link>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="destructive" size="sm" className="gap-2" />}>
          <Trash weight="duotone" className="w-4 h-4" />
          Delete
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the campaign
              and remove its data from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
