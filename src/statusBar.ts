import { padNumber } from './utils'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export class StatusBar {
  private dateElement: HTMLElement
  private timeElement: HTMLElement
  private loadBarElement: HTMLElement
  private clockInterval: number
  private loadBarInterval: number

  constructor() {
    this.dateElement = document.getElementById('sys-date')!
    this.timeElement = document.getElementById('sys-time')!
    this.loadBarElement = document.getElementById('load-bar')!
  }

  start(): void {
    this.updateClock()
    this.updateLoadBar()
    this.clockInterval = window.setInterval(() => this.updateClock(), 1000)
    this.loadBarInterval = window.setInterval(() => this.updateLoadBar(), 3000)
  }

  stop(): void {
    clearInterval(this.clockInterval)
    clearInterval(this.loadBarInterval)
  }

  private updateClock(): void {
    const now = new Date()
    this.dateElement.textContent = `${padNumber(now.getDate())} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`
    this.timeElement.textContent = `${padNumber(now.getHours())}:${padNumber(now.getMinutes())}:${padNumber(now.getSeconds())}`
  }

  private updateLoadBar(): void {
    const blocks = 15
    const filled = Math.floor(Math.random() * 4) + 8
    this.loadBarElement.textContent = '[' + '|'.repeat(filled) + ' '.repeat(blocks - filled) + ']'
  }
}