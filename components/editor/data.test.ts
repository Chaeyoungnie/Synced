import { describe, it, expect } from 'vitest'
import { fileContents, fileTree, files, collaborators, flattenFileTree, type FileNode, type FolderNode, type GitStatus } from './data'

describe('data', () => {
  describe('fileContents', () => {
    it('contains page.tsx content', () => {
      expect(fileContents['page.tsx']).toBeDefined()
      expect(typeof fileContents['page.tsx']).toBe('string')
      expect(fileContents['page.tsx'].length).toBeGreaterThan(0)
    })

    it('contains editor-shell.tsx content', () => {
      expect(fileContents['editor-shell.tsx']).toBeDefined()
    })

    it('contains globals.css content', () => {
      expect(fileContents['globals.css']).toBeDefined()
      expect(typeof fileContents['globals.css']).toBe('string')
    })

    it('contains layout.tsx content', () => {
      expect(fileContents['layout.tsx']).toBeDefined()
    })

    it('contains components.json content', () => {
      expect(fileContents['components.json']).toBeDefined()
    })

    it('has content for all files', () => {
      const contents = Object.values(fileContents)
      expect(contents.length).toBeGreaterThanOrEqual(1)
      contents.forEach((content) => {
        expect(typeof content).toBe('string')
        expect(content.length).toBeGreaterThan(0)
      })
    })
  })

  describe('fileTree', () => {
    it('has a root folder', () => {
      expect(fileTree.name).toBe('collaborative-editor')
      expect(fileTree.children).toBeDefined()
    })

    it('contains nested components folder', () => {
      const componentsFolder = fileTree.children.find(
        (child) => 'children' in child && child.name === 'components'
      ) as FolderNode | undefined

      expect(componentsFolder).toBeDefined()
      expect(componentsFolder!.children.length).toBeGreaterThan(0)
    })

    it('has editor subfolder inside components', () => {
      const componentsFolder = fileTree.children.find(
        (child) => 'children' in child && child.name === 'components'
      ) as FolderNode | undefined

      const editorFolder = componentsFolder!.children.find(
        (child) => 'children' in child && child.name === 'editor'
      ) as FolderNode | undefined

      expect(editorFolder).toBeDefined()
      expect(editorFolder!.children.length).toBeGreaterThan(0)
    })

    it('files have correct type properties', () => {
      const pageFile = fileTree.children.find(
        (child) => !('children' in child) && child.name === 'page.tsx'
      ) as FileNode | undefined

      expect(pageFile).toBeDefined()
      expect(pageFile!.type).toBe('code')
    })

    it('files have git status properties', () => {
      const editorShell = fileTree.children.find(
        (child) => !('children' in child) && child.name === 'editor-shell.tsx'
      ) as FileNode | undefined

      expect(editorShell).toBeDefined()
      expect(editorShell!.status).toBeDefined()
    })

    it('has open state on folders', () => {
      expect(fileTree.open).toBe(true)
    })
  })

  describe('files (flat array)', () => {
    it('is an array', () => {
      expect(Array.isArray(files)).toBe(true)
    })

    it('contains all top-level files', () => {
      expect(files.length).toBeGreaterThan(0)
      expect(files.some((f) => f.name === 'page.tsx')).toBe(true)
    })

    it('each file has required properties', () => {
      files.forEach((file) => {
        expect(file).toHaveProperty('name')
        expect(file).toHaveProperty('type')
        expect(typeof file.name).toBe('string')
        expect(typeof file.type).toBe('string')
      })
    })
  })

  describe('collaborators', () => {
    it('is an array', () => {
      expect(Array.isArray(collaborators)).toBe(true)
    })

    it('has at least one collaborator', () => {
      expect(collaborators.length).toBeGreaterThan(0)
    })

    it('each collaborator has required properties', () => {
      collaborators.forEach((person) => {
        expect(person).toHaveProperty('name')
        expect(person).toHaveProperty('initials')
        expect(person).toHaveProperty('color')
        expect(person).toHaveProperty('status')
      })
    })

    it('has unique names', () => {
      const names = collaborators.map((c) => c.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(names.length)
    })

    it('has unique initials', () => {
      const initials = collaborators.map((c) => c.initials)
      const uniqueInitials = new Set(initials)
      expect(uniqueInitials.size).toBe(initials.length)
    })

    it('each collaborator has a color string', () => {
      collaborators.forEach((person) => {
        expect(typeof person.color).toBe('string')
        expect(person.color.length).toBeGreaterThan(0)
      })
    })
  })
})

describe('Type exports', () => {
  it('FileNode type can be used', () => {
    const file: FileNode = {
      name: 'test.tsx',
      type: 'code',
      status: 'committed',
    }
    expect(file.name).toBe('test.tsx')
  })

  it('FolderNode type can be used', () => {
    const folder: FolderNode = {
      name: 'test',
      open: true,
      children: [],
    }
    expect(folder.name).toBe('test')
  })

  it('GitStatus type values are valid', () => {
    const validStatuses: GitStatus[] = ['committed', 'modified', 'new', 'untracked', 'deleted']
    expect(validStatuses.length).toBe(5)
  })
})

describe('flattenFileTree', () => {
  it('returns a flat list of files with paths', () => {
    const flat = flattenFileTree(fileTree)
    expect(Array.isArray(flat)).toBe(true)
    expect(flat.length).toBeGreaterThan(0)
    flat.forEach((f) => {
      expect(typeof f.name).toBe('string')
      expect(typeof f.path).toBe('string')
    })
  })

  it('includes root-level files with empty path', () => {
    const flat = flattenFileTree(fileTree)
    const pageFile = flat.find((f) => f.name === 'page.tsx')
    expect(pageFile).toBeDefined()
    expect(pageFile!.path).toBe('')
  })

  it('includes nested files with correct path', () => {
    const flat = flattenFileTree(fileTree)
    const sidebarFile = flat.find((f) => f.name === 'sidebar.tsx')
    expect(sidebarFile).toBeDefined()
    expect(sidebarFile!.path).toContain('components')
    expect(sidebarFile!.path).toContain('editor')
  })

  it('does not include folders in the output', () => {
    const flat = flattenFileTree(fileTree)
    const folderNames = ['components', 'editor', 'ui']
    folderNames.forEach((name) => {
      expect(flat.find((f) => f.name === name)).toBeUndefined()
    })
  })

  it('handles empty tree', () => {
    const emptyTree: FolderNode = { name: 'empty', children: [] }
    const flat = flattenFileTree(emptyTree)
    expect(flat).toEqual([])
  })

  it('produces unique entries for each file', () => {
    const flat = flattenFileTree(fileTree)
    const keys = flat.map((f) => `${f.path}/${f.name}`)
    const uniqueKeys = new Set(keys)
    expect(uniqueKeys.size).toBe(keys.length)
  })
})
