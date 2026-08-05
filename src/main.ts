import './style.css'
import 'prismjs/themes/prism-tomorrow.css'
import { loadProjects } from './projectsCode'
import { BootSequence } from './boot'
import { Navigation } from './navigation'
import { StatusBar } from './statusBar'
import { GlitchEffect } from './effects'
import { PowerControl } from './powerControl'
import { KonamiEasterEgg } from './konami'
import { CodeViewer } from './codeViewer'
import { Monitor } from './monitor'

class PortfolioApp {
  private bootSequence: BootSequence
  // @ts-ignore - Has side effects in constructor
  private navigation: Navigation
  private statusBar: StatusBar
  private glitchEffect: GlitchEffect
  // @ts-ignore - Has side effects in constructor
  private powerControl: PowerControl
  // @ts-ignore - Has side effects in constructor
  private konamiEasterEgg: KonamiEasterEgg
  // @ts-ignore - Has side effects in constructor
  private codeViewer: CodeViewer
  // @ts-ignore - Has side effects in constructor
  private monitor: Monitor

  constructor() {
    this.bootSequence = new BootSequence()
    this.navigation = new Navigation()
    this.statusBar = new StatusBar()
    this.glitchEffect = new GlitchEffect()
    this.powerControl = new PowerControl()
    this.konamiEasterEgg = new KonamiEasterEgg()
    this.codeViewer = new CodeViewer()
    this.monitor = new Monitor()
  }

  async initialize(): Promise<void> {
    await this.bootSequence.execute()
    this.statusBar.start()
    this.glitchEffect.start()
    await loadProjects()
  }
}

const app = new PortfolioApp()
app.initialize()

