import { LitElement, html } from '../../vendor/lit/lit.min.js'
import * as session from '../lib/session.js'
import { getServiceUrl } from '../lib/services.js'
import * as toast from '../com/toast.js'
import { emit } from '../lib/dom.js'
import * as contextMenu from '../com/context-menu.js'
import '../com/button.js'
import '../com/header.js'

const TIMESTAMP_RE = /( (\d)+\/(\d)+\/(\d)+, (\d)+:(\d)+:(\d)+ (AM|PM))/g

class AppAppSettingsView extends LitElement {
  static get properties () {
    return {
      srvId: {type: String},
      currentView: {type: String},
      currentPath: {type: String, attribute: 'current-path'},
      error: {type: String},
      service: {type: Object},
      showLogTimestamps: {type: Boolean},
      updaterState: {type: Object}
    }
  }

  createRenderRoot() {
    return this // dont use shadow dom
  }

  constructor () {
    super()
    this.error = undefined
    this.log = ''
    this.logStream = undefined
    this.showLogTimestamps = false
    this.updaterState = undefined
  }

  get srvName () {
    return this.service?.manifest?.name || this.srvId
  }

  async load () {
    document.title = `Home`

    const pathParts = window.location.pathname.split('/').filter(Boolean)
    let oldView = this.currentView
    this.srvId = pathParts[2]
    this.currentView = pathParts[3] || 'properties'
    this.service = (await session.api.services_get(this.srvId))
    console.log(this.service)

    // TODO
    /*if (!this.logStream) {
      try {
        this.logStream = await session.api.services.logStream(this.srvId)
        this.logStream.addEventListener('data', e => {
          this.log += e.detail.value
          if (this.currentView === 'log') {
            this.updateLogViewer()
          }
        })
      } catch (e) {
        console.debug('Failed to acquire log stream', e)
      }
    }*/

    if (oldView !== this.currentView && this.currentView === 'log') {
      await this.requestUpdate()
      this.updateLogViewer(true) // force scroll to bottom
    }
  }

  async refresh () {
  }

  async pageLoadScrollTo (y) {
  }

  async updateLogViewer (forceScroll = false) {
    const el = this.querySelector('#log-viewer')
    const isNearBottom = (el.scrollHeight - (el.scrollTop + el.offsetHeight)) < 100
    el.value = this.logCleaned
    if (forceScroll || isNearBottom) {
      el.scrollTop = el.scrollHeight // autoscroll
    }
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    this.logStream?.close()
  }

  get logCleaned () {
    if (this.showLogTimestamps) {
      return this.log
    }
    return this.log.replace(TIMESTAMP_RE, '')
  }

  // rendering
  // =

  render () {
    return html`
      <main class="min-h-screen bg-default-3">
        <lonestar-header></lonestar-header>
        <div class="max-w-4xl my-8 mx-auto bg-default rounded px-6 py-4">
          <div>
            <a class="hover:underline" href="/p/settings"><span class="fas fa-angle-left"></span> Apps</a>
          </div>
          <h1 class="text-5xl mb-4">${this.srvName}</h1>
          ${this.renderSrvHeader()}
          <div class="flex border border-default">
            <div class="border-r border-default">
              <a class="block px-4 py-2 ${this.currentView === 'properties' ? 'bg-default-2' : ''} hover:underline" href="/p/app-settings/${this.srvId}">Properties</a>
              <a class="block px-4 py-2 ${this.currentView === 'log' ? 'bg-default-2' : ''} hover:underline" href="/p/app-settings/${this.srvId}/log">Logs</a>
            </div>
            <div class="flex-1">
              ${this.renderAppCurrentView()}
            </div>
          </div>
        </div>
      </main>
    `
  }

  renderSrvHeader () {
    if (!this.service) return html`<div><span class="spinner"></span></div>`
    return html`
      <div class="mb-4">
        ${this.service.settings.package.sourceType === 'git' ? this.service.settings.package.installedVersion : 'Local folder'}
        |
        ${this.service.settings.package.sourceType === 'git' ? html`
          <a class="text-default-3 hover:underline" href=${this.service.settings.sourceUrl} target="_blank">${this.service.settings.sourceUrl}</a>
        ` : html`
          <span class="text-default-3">${this.service.settings.sourceUrl}</span>
        `}
      </div>
      <div class="mb-6">
        <lonestar-button primary label="Open" href=${getServiceUrl(this.service)} new-window></lonestar-button>
        ${this.service.settings.package.sourceType === 'git' ? html`<lonestar-button transparent label="Check for updates" @click=${this.onClickCheckUpdates}></lonestar-button>`: ''}
        <lonestar-button transparent label="Uninstall" @click=${this.onClickUninstallApp}></lonestar-button>
        <span class="inline-block">
          <a class="cursor-pointer px-2 py-0.5 hover:bg-default-2" @click=${this.onClickAppMenu}><span class="fas fa-ellipsis-h"></span></a>
        </span>
      </div>
      ${this.renderAppUpdater()}
    `
  }

  renderAppUpdater () {
    if (!this.updaterState) return ''
    let cls = 'bg-default-2'
    if (this.updaterState.status === 'error') cls = 'bg-error text-error font-medium'
    if (this.updaterState.status === 'update-available' || this.updaterState.status === 'update-installed') cls = 'bg-secondary text-inverse font-medium'
    return html`
      <div class="mb-6 px-4 py-3 rounded ${cls}">
        ${this.updaterState.status === 'processing' ? html`<span class="spinner"></span>` : ''}
        ${this.updaterState.status === 'no-update-available' ? html`<span class="fas fa-check-circle"></span>` : ''}
        ${this.updaterState.status === 'update-available' ? html`<span class="fas fa-download"></span>` : ''}
        ${this.updaterState.status === 'error' ? html`<span class="fas fa-exclamation-triangle"></span>` : ''}
        ${this.updaterState.status === 'update-installed' ? html`<span class="fas fa-check-circle"></span>` : ''}
        ${this.updaterState.message}
        ${this.updaterState.status === 'update-available' ? html`
          <span class="ml-2">
            <lonestar-button label="Install Now" btn-class="bg-secondary text-inverse hover:bg-secondary-2 border border-inverse" @click=${this.onClickInstallUpdate}></lonestar-button>
          </span>
        ` : ''}
      </div>
    `
  }

  renderAppCurrentView () {
    if (!this.service) return ''
    if (this.currentView === 'properties') {
      return this.renderAppProperties()
    }
    if (this.currentView === 'log') {
      return this.renderAppLog()
    }
  }

  renderAppProperties () {
    return html`
    ${this.service?.manifest ? html`
      <div class="px-5 py-3 border-b border-default text-lg">
        ${this.service?.manifest?.description ? html`<p>${this.service?.manifest?.description}</p>` : ''}
        ${this.service?.manifest?.author ? html`<p class="text-sm">By: <strong class="font-medium">${this.service?.manifest?.author}</strong></p>` : ''}
        ${this.service?.manifest?.license ? html`<p class="text-sm">License: <strong class="font-medium">${this.service?.manifest?.license}</strong></p>` : ''}
      </div>
    ` : ''}
      <div class="px-5 py-3 border-b border-default">
        <p class="text-sm">
          ${this.service.status === 'active' ? html`
            <span class="text-secondary"><span class="fas fa-circle"></span> Process is currently running</span>
          ` : html`
            <span class="text-default-4"><span class="fas fa-circle"></span> Process is not currently running</span>
          `}
        </p>
      </div>
      <div class="px-5 py-3 text-default-3">
        <form id="lonestar-properties">
          <label class="block font-semibold p-1" for="sourceUrl-input">Source</label>
          <input
            autofocus
            type="text"
            id="sourceUrl-input"
            name="sourceUrl"
            value="${this.service.settings.sourceUrl}"
            class="block box-border w-full p-3 mb-1 border border-default rounded"
            placeholder="Enter the Git URL or folder location of your app"
          />
          <label class="block font-semibold p-1" for="port-input">Port</label>
          <input
            autofocus
            type="text"
            id="port-input"
            name="port"
            value="${this.service.settings.port}"
            class="block box-border w-24 p-3 mb-1 border border-default rounded"
            placeholder=""
          />
          ${this.service.settings.package.sourceType === 'git' ? html`
            <label class="block font-semibold p-1" for="desiredVersion-input">Desired Version</label>
            <input
              autofocus
              type="text"
              id="desiredVersion-input"
              name="desiredVersion"
              value="${this.service.settings.desiredVersion}"
              placeholder="latest"
              class="block box-border w-48 p-3 mb-4 border border-default rounded"
            />
          ` : html`
          `}
          ${this.error ? html`
            <div class="bg-error text-error mb-4 rounded px-4 py-2">
              ${this.error}
            </div>
          ` : ''}
          <div class="text-right">
            <lonestar-button label="Save${this.service.settings === 'active' ? ' and restart' : ''}" btn-class="px-4 py-2" @click=${this.onClickSaveProperties}></lonestar-button>
          </div>
        </form>
      </div>
    `
  }

  renderAppLog () {
    return html`
      <div class="px-2 py-2 text-sm border-b border-default">
        <label class="flex items-center"><input type="checkbox" ?checked=${this.showLogTimestamps} @change=${this.onToggleTimestamps}> <span class="ml-1">Show timestamps</span></label>
      </div>
      <textarea id="log-viewer" class="px-2 w-full h-96 bg-default-2 font-mono text-xs whitespace-pre resize-none" readonly>
        ${this.logCleaned}
      </textarea>
    `
  }

  // events
  // =

  onClickAppMenu (e) {
    e.preventDefault()
    e.stopPropagation()
    
    let items = []
    if (this.service.status === 'active') {
      items.push({label: 'Restart', click: () => this.onClickRestartApp()})
      items.push({label: 'Stop', click: () => this.onClickStopApp()})
    } else {
      items.push({label: 'Start', click: () => this.onClickStartApp()})
    }

    contextMenu.create({
      parent: e.currentTarget.parentNode,
      noBorders: true,
      style: `padding: 4px 0`,
      items
    })
  }

  async onClickStartApp (e) {
    e?.preventDefault()
    await session.api.services_start(this.srvId)
    this.load()
  }

  async onClickRestartApp (e) {
    e?.preventDefault()
    await session.api.services_restart(this.srvId)
    this.load()
  }

  async onClickStopApp (e) {
    e?.preventDefault()
    await session.api.services_stop(this.srvId)
    this.load()
  }

  async onClickUninstallApp (e) {
    e?.preventDefault()
    if (!confirm(`Uninstall ${this.srvId}?`)) return
    await session.api.services_uninstall(this.srvId)
    emit(this, 'navigate-to', {detail: {url: '/p/settings'}})
  }

  async onClickCheckUpdates () {
    this.updaterState = {status: 'processing', message: 'Checking for updates...'}
    try {
      let status = await session.api.services_checkForPackageUpdates(this.srvId)
      if (status.hasUpdate) {
        this.updaterState = {status: 'update-available', message: `Update available: v${status.latestVersion} can now be installed!`}
      } else {
        this.updaterState = {status: 'no-update-available', message: `Your app is up-to-date!`}
      }
    } catch (e) {
      console.log(e)
      this.updaterState = {status: 'error', message: e.message || e.toString()}
    }
  }

  async onClickInstallUpdate () {
    this.updaterState = {status: 'processing', message: 'Installing update...'}
    try {
      let status = await session.api.services_updatePackage(this.srvId)
      if (this.service.status === 'active') {
        this.updaterState = {status: 'processing', message: 'Restarting...'}
        await session.api.services_restart(this.srvId)
      }
      this.updaterState = {status: 'update-installed', message: `Update complete: v${status.installedVersion} is now installed!`}
      this.load()
    } catch (e) {
      this.updaterState = {status: 'error', message: e.message || e.toString()}
    }
  }

  onToggleTimestamps () {
    this.showLogTimestamps = !this.showLogTimestamps
    this.updateLogViewer()
  }

  async onClickSaveProperties (e) {
    e.preventDefault()
    this.error = undefined
    try {
      const data = new FormData(this.querySelector('form#lonestar-properties'))
      const updates = Object.fromEntries(data.entries())
      if (updates.port) updates.port = Number(updates.port)
      await session.api.services_configure(this.srvId, updates)
      if (this.service.status === 'active') {
        await session.api.services_restart(this.srvId)
      }
      toast.create('Settings updated', 'success')
      this.load()
    } catch (e) {
      this.error = e.toString()
    }
  }
}

customElements.define('lonestar-app-settings-view', AppAppSettingsView)