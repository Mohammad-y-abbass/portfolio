export class GlitchEffect {
  private glitchLayer: HTMLElement
  private interval: number = 0

  constructor() {
    this.glitchLayer = document.querySelector<HTMLElement>('.glitch-layer')!
  }

  start(): void {
    this.interval = window.setInterval(() => {
      if (Math.random() < 0.08) {
        this.trigger()
      }
    }, 8000)
  }

  stop(): void {
    clearInterval(this.interval)
  }

  private trigger(): void {
    this.glitchLayer.classList.add('active')
    setTimeout(() => this.glitchLayer.classList.remove('active'), 300)
  }
}