export interface CodeFile {
  name: string
  path: string
  language: string
  content: string
}

export interface FolderNode {
  name: string
  path: string
  type: 'folder' | 'file'
  language?: string
  children?: FolderNode[]
  content?: string
}

export interface ProjectSource {
  id: string
  name: string
  folder: string
  root: FolderNode
}

export const PROJECTS_CODE: Record<string, ProjectSource> = {}

// File extensions to language mapping
const LANGUAGE_MAP: Record<string, string> = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.go': 'go',
  '.py': 'python',
  '.html': 'html',
  '.css': 'css',
  '.json': 'json',
  '.md': 'markdown',
  '.sql': 'sql',
  '.txt': 'text'
}

function getLanguageFromExtension(filename: string): string {
  const ext = filename.substring(filename.lastIndexOf('.'));
  return LANGUAGE_MAP[ext] || 'text';
}

export async function loadProjects(): Promise<void> {
  try {
    const response = await fetch('/projects-structure.json');
    if (!response.ok) {
      console.error('Failed to load projects structure');
      return;
    }
    
    const structure = await response.json();
    
    for (const [projectName, projectData] of Object.entries(structure)) {
      PROJECTS_CODE[projectName] = {
        id: projectName,
        name: projectName,
        folder: projectName,
        root: projectData as FolderNode
      };
    }

    // Add private projects without code
    PROJECTS_CODE['learndevs'] = {
      id: 'learndevs',
      name: 'LearnDevs',
      folder: 'learndevs',
      root: {
        name: 'learndevs',
        path: 'learndevs',
        type: 'folder',
        children: []
      }
    };

    PROJECTS_CODE['places4students'] = {
      id: 'places4students',
      name: 'Places4Students',
      folder: 'places4students',
      root: {
        name: 'places4students',
        path: 'places4students',
        type: 'folder',
        children: []
      }
    };
  } catch (error) {
    console.error('Failed to load projects:', error);
  }
}

export async function loadFileContent(projectName: string, filePath: string): Promise<CodeFile | null> {
  try {
    const response = await fetch(`/projects/${projectName}/${filePath}`);
    if (!response.ok) return null;
    
    const content = await response.text();
    const filename = filePath.split('/').pop() || '';
    const language = getLanguageFromExtension(filename);
    
    return {
      name: filename,
      path: `${projectName}/${filePath}`,
      language,
      content
    };
  } catch (error) {
    console.error('Failed to load file content:', error);
    return null;
  }
}
