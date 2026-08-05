export class PowerControl {
  private powerBtn: HTMLElement
  private powerLed: HTMLElement
  private crtScreen: HTMLElement
  private powered: boolean = true

  constructor() {
    this.powerBtn = document.getElementById('power-btn')!
    this.powerLed = document.getElementById('power-led')!
    this.crtScreen = document.getElementById('crt-screen')!
    this.init()
  }

  private init(): void {
    this.powerBtn.addEventListener('click', () => this.togglePower())
  }

  private togglePower(): void {
    this.powered = !this.powered
    this.crtScreen.classList.toggle('off', !this.powered)
    this.powerLed.classList.toggle('off', !this.powered)
  }
}