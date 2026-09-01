'use client'

import { useState } from 'react'
import { Rocket, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

interface DeployButtonProps {
  workspaceName?: string
}

export function DeployButton({ workspaceName }: DeployButtonProps) {
  const [open, setOpen] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [deployed, setDeployed] = useState(false)
  const [deployUrl, setDeployUrl] = useState('')

  const handleDeploy = async () => {
    setDeploying(true)
    // Simulate deploy process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const slug = (workspaceName || 'my-app').toLowerCase().replace(/[^a-z0-9]/g, '-')
    setDeployUrl(`https://${slug}.vercel.app`)
    setDeployed(true)
    setDeploying(false)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={() => setOpen(true)}
      >
        <Rocket className="size-3.5" /> Deploy
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="size-5 text-blue-500" />
              Deploy to Vercel
            </DialogTitle>
            <DialogDescription>
              Deploy your project to Vercel with one click. Your project will be live in seconds.
            </DialogDescription>
          </DialogHeader>

          {deployed ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                <Rocket className="size-6" />
              </div>
              <div className="text-center">
                <p className="font-medium">Deployed successfully!</p>
                <a
                  href={deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {deployUrl}
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium">{workspaceName || 'My Project'}</p>
                <p className="text-xs text-muted-foreground">
                  Deploy as a static site or serverless function
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>✓ Automatic HTTPS</p>
                <p>✓ Custom domains</p>
                <p>✓ Instant rollbacks</p>
              </div>
            </div>
          )}

          <DialogFooter>
            {deployed ? (
              <Button onClick={() => setOpen(false)}>Done</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleDeploy} disabled={deploying}>
                  {deploying ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 size-4" />
                      Deploy
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
