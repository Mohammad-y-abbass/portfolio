import { delay } from './utils'

const BOOT_LINES = [
  'PORTFOLIO BIOS v1.0',
  'Copyright (C) 2024 Mohammad Abbass',
  '',
  'Detecting primary master... OK',
  'Detecting primary slave...  NONE',
  'Detecting floppy drive A: ... OK',
  '',
  'Loading MONITOR DRIVER........ OK',
  'Loading NETWORK STACK......... OK',
  'Initializing CRT-14 DISPLAY... OK',
  '',
  'Booting Portfolio v1.0...',
  '',
  '>> SYSTEM READY <<',
]

export class BootSequence {
  private overlay: HTMLElement
  private text: HTMLElement

  constructor() {
    this.overlay = document.getElementById('boot-overlay')!
    this.text = document.getElementById('boot-text')!
  }

  async execute(): Promise<void> {
    let output = ''
    for (const line of BOOT_LINES) {
      output += line + '\n'
      this.text.textContent = output
      const delayTime = line === '' ? 80 : 60 + Math.random() * 80
      await delay(delayTime)
    }
    await delay(600)
    this.overlay.classList.add('hidden')
  }
}