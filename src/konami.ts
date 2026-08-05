export class KonamiEasterEgg {
  private readonly KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
  private currentIndex: number = 0
  private invader: HTMLElement

  constructor() {
    this.invader = document.getElementById('invader-sprite')!
    this.init()
  }

  private init(): void {
    document.addEventListener('keydown', (e) => this.handleKeyPress(e.key))
  }

  private handleKeyPress(key: string): void {
    if (key === this.KONAMI_CODE[this.currentIndex]) {
      this.currentIndex++
      if (this.currentIndex === this.KONAMI_CODE.length) {
        this.showInvader()
        this.currentIndex = 0
      }
    } else {
      this.currentIndex = 0
    }
  }

  private showInvader(): void {
    this.invader.classList.add('visible')
    setTimeout(() => this.invader.classList.remove('visible'), 8000)
  }
}