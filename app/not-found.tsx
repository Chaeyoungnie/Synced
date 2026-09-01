import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-center">
      <p className="font-mono text-xs text-primary">404</p>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
        Page not found.
      </h1>
      <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button className="mt-9" render={<a href="/" />} nativeButton={false}>
        Back to home
      </Button>
    </div>
  )
}
