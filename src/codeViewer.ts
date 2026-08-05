import { PROJECTS_CODE, loadProjects, loadFileContent, type CodeFile, type FolderNode } from './projectsCode'
import { escapeHtml } from './utils'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-json'

export class CodeViewer {
  private modal: HTMLElement
  private closeBtn: HTMLElement
  private projectSelect: HTMLSelectElement
  private filepath: HTMLElement
  private fileTree: HTMLElement
  private codeView: HTMLElement
  private statLang: HTMLElement
  private statLines: HTMLElement
  private copyBtn: HTMLElement
  private viewButtons: NodeListOf<HTMLButtonElement>

  private activeFile: CodeFile | null = null
  private expandedFolders = new Map<string, Set<string>>()

  constructor() {
    this.modal = document.getElementById('editor-modal')!
    this.closeBtn = document.getElementById('editor-close-btn')!
    this.projectSelect = document.getElementById('editor-project-select') as HTMLSelectElement
    this.filepath = document.getElementById('editor-filepath')!
    this.fileTree = document.getElementById('file-tree')!
    this.codeView = document.getElementById('code-view')!
    this.statLang = document.getElementById('editor-stat-lang')!
    this.statLines = document.getElementById('editor-stat-lines')!
    this.copyBtn = document.getElementById('editor-copy-btn')!
    this.viewButtons = document.querySelectorAll<HTMLButtonElement>('.code-view-btn')
    this.init()
  }

  private init(): void {
    this.setupViewButtons()
    this.setupProjectSelect()
    this.setupCloseButton()
    this.setupKeyboardShortcuts()
    this.setupCopyButton()
  }

  private setupViewButtons(): void {
    this.viewButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const projectId = btn.dataset.project
        if (projectId) this.open(projectId)
      })
    })
  }

  private setupProjectSelect(): void {
    this.projectSelect.addEventListener('change', async (e) => {
      const target = e.target as HTMLSelectElement
      await this.loadProject(target.value)
    })
  }

  private setupCloseButton(): void {
    this.closeBtn.addEventListener('click', () => this.close())
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.close()
      }
    })
  }

  private setupCopyButton(): void {
    this.copyBtn.addEventListener('click', () => this.copyToClipboard())
  }

  async open(projectId: string): Promise<void> {
    if (!PROJECTS_CODE[projectId]) {
      await loadProjects()
    }

    if (!PROJECTS_CODE[projectId]) return

    this.projectSelect.value = projectId
    await this.loadProject(projectId)
    this.modal.classList.add('active')
  }

  close(): void {
    this.modal.classList.remove('active')
    this.clearCodeView()
  }

  private clearCodeView(): void {
    this.codeView.innerHTML = ''
    this.filepath.textContent = ''
    this.statLang.textContent = 'LANG: -'
    this.statLines.textContent = 'LINES: 0'
    this.activeFile = null
  }

  private async loadProject(projectId: string): Promise<void> {
    const project = PROJECTS_CODE[projectId]
    if (!project) return

    this.clearCodeView()
    this.fileTree.innerHTML = ''
    this.clearActiveFileStates()

    this.initializeExpandedFolders(projectId, project)
    this.renderFolderTree(project.root, projectId, this.fileTree, 0)
  }

  private clearActiveFileStates(): void {
    document.querySelectorAll('.file-item.active').forEach((el) => el.classList.remove('active'))
  }

  private initializeExpandedFolders(projectId: string, project: { root: FolderNode }): void {
    if (!this.expandedFolders.has(projectId)) {
      this.expandedFolders.set(projectId, new Set())
      const folderSet = this.expandedFolders.get(projectId)!
      
      folderSet.add(project.root.path)
      
      if (project.root.children) {
        for (const child of project.root.children) {
          if (child.type === 'folder') {
            folderSet.add(child.path)
          }
        }
      }
    }
  }

  private renderFolderTree(node: FolderNode, projectId: string, container: HTMLElement, depth: number): void {
    const item = document.createElement('div')
    item.className = 'tree-item'

    if (node.type === 'folder') {
      this.renderFolder(node, projectId, container, depth, item)
    } else {
      this.renderFile(node, projectId, container, depth, item)
    }
  }

  private renderFolder(node: FolderNode, projectId: string, container: HTMLElement, depth: number, item: HTMLElement): void {
    const projectExpanded = this.expandedFolders.get(projectId) || new Set()
    const isExpanded = projectExpanded.has(node.path)

    item.innerHTML = `
      <button class="folder-toggle ${isExpanded ? 'expanded' : ''}" data-path="${node.path}" style="padding-left: ${depth * 16}px">
        <span class="folder-icon">${isExpanded ? '📂' : '📁'}</span>
        <span class="folder-name">${node.name}</span>
      </button>
    `

    const toggle = item.querySelector('.folder-toggle') as HTMLButtonElement
    toggle.addEventListener('click', () => this.toggleFolder(node.path, projectId))

    container.appendChild(item)

    if (isExpanded && node.children) {
      const childrenContainer = document.createElement('div')
      childrenContainer.className = 'folder-children'
      container.appendChild(childrenContainer)

      for (const child of node.children) {
        this.renderFolderTree(child, projectId, childrenContainer, depth + 1)
      }
    }
  }

  private renderFile(node: FolderNode, projectId: string, container: HTMLElement, depth: number, item: HTMLElement): void {
    item.innerHTML = `
      <button class="file-item" data-path="${node.path}" data-language="${node.language || 'text'}" style="padding-left: ${depth * 16}px">
        <span class="file-icon">📄</span>
        <span class="file-name">${node.name}</span>
      </button>
    `

    const fileBtn = item.querySelector('.file-item') as HTMLButtonElement
    fileBtn.addEventListener('click', async () => {
      this.clearActiveFileStates()
      fileBtn.classList.add('active')

      const fileData: CodeFile = {
        name: node.name,
        path: node.path,
        language: node.language || 'text',
        content: ''
      }

      await this.displayFile(projectId, fileData)
    })

    container.appendChild(item)
  }

  private toggleFolder(path: string, projectId: string): void {
    const currentExpanded = this.expandedFolders.get(projectId) || new Set()
    
    if (currentExpanded.has(path)) {
      currentExpanded.delete(path)
    } else {
      currentExpanded.add(path)
    }
    
    this.expandedFolders.set(projectId, currentExpanded)
    this.loadProject(projectId)
  }

  private async displayFile(projectId: string, file: CodeFile): Promise<void> {
    this.filepath.textContent = `~/${file.path}`

    // Check if this is a private project
    const privateProjects = ['learndevs', 'places4students']
    if (privateProjects.includes(projectId)) {
      this.codeView.innerHTML = '<div class="private-code-message">This project code is private. Visit the website to learn more.</div>'
      this.activeFile = null
      this.statLang.textContent = 'LANG: -'
      this.statLines.textContent = 'LINES: 0'
      return
    }

    const fileData = await loadFileContent(projectId, file.path.replace(`${projectId}/`, ''))
    const content = fileData?.content || '// Loading file...'

    this.activeFile = {
      ...file,
      content
    }

    this.renderCode(content, file.language)
    this.updateStats(content, file.language)
  }

  private renderCode(content: string, language: string): void {
    const lines = content.split('\n')
    let html = ''

    for (let i = 0; i < lines.length; i++) {
      html += `
        <div class="code-line">
          <span class="line-number">${i + 1}</span>
          <span class="line-content">${escapeHtml(lines[i])}</span>
        </div>
      `
    }

    this.codeView.innerHTML = html
    this.codeView.className = `code-view language-${language}`

    this.applySyntaxHighlighting(language)
  }

  private applySyntaxHighlighting(language: string): void {
    const lineContents = this.codeView.querySelectorAll('.line-content')
    const grammar = Prism.languages[language] || Prism.languages.javascript

    lineContents.forEach((lineContent) => {
      const code = lineContent.textContent || ''
      const highlighted = Prism.highlight(code, grammar, language)
      lineContent.innerHTML = highlighted
    })
  }

  private updateStats(content: string, language: string): void {
    const lines = content.split('\n')
    this.statLang.textContent = `LANG: ${language.toUpperCase()}`
    this.statLines.textContent = `LINES: ${lines.length}`
  }

  private copyToClipboard(): void {
    if (!this.activeFile?.content) return

    navigator.clipboard.writeText(this.activeFile.content).then(() => {
      const originalText = this.copyBtn.textContent
      this.copyBtn.textContent = '[ COPIED! ]'
      setTimeout(() => {
        this.copyBtn.textContent = originalText
      }, 1500)
    })
  }
}