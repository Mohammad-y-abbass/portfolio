export class Monitor {
  private crtUnit: HTMLElement

  constructor() {
    this.crtUnit = document.getElementById('crt-unit')!
    this.init()
  }

  private init(): void {
    window.addEventListener('resize', () => this.fitToViewport())
    
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => this.fitToViewport())
    }
    
    window.addEventListener('load', () => this.fitToViewport())
    this.fitToViewport()
  }

  private fitToViewport(): void {
    this.crtUnit.style.transform = ''
  }
}