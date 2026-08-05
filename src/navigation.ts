export class Navigation {
  private navTabs: NodeListOf<HTMLButtonElement>
  private panels: NodeListOf<HTMLElement>
  private channelStatic: HTMLElement

  constructor() {
    this.navTabs = document.querySelectorAll<HTMLButtonElement>('.nav-tab')
    this.panels = document.querySelectorAll<HTMLElement>('.panel')
    this.channelStatic = document.getElementById('channel-static')!
    this.init()
  }

  private init(): void {
    this.navTabs.forEach((tab) => {
      tab.addEventListener('click', () => this.handleTabClick(tab))
    })
  }

  private handleTabClick(tab: HTMLButtonElement): void {
    const section = tab.dataset.section
    if (!section || tab.classList.contains('active')) return

    this.showChannelStatic()
    this.switchTab(tab, section)
  }

  private showChannelStatic(): void {
    this.channelStatic.classList.add('active')
    setTimeout(() => this.channelStatic.classList.remove('active'), 400)
  }

  private switchTab(tab: HTMLButtonElement, section: string): void {
    setTimeout(() => {
      this.navTabs.forEach((t) => t.classList.remove('active'))
      tab.classList.add('active')
      this.panels.forEach((p) => {
        p.classList.toggle('active', p.dataset.panel === section)
      })
    }, 200)
  }
}