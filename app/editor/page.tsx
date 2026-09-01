import { EditorShell } from '@/components/editor-shell'

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ ws?: string }> }) {
  const params = await searchParams
  const workspaceId = params.ws || null
  return <EditorShell workspaceId={workspaceId} />
}
