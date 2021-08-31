import { LitElement, html } from '../../vendor/lit/lit.min.js'
import { repeat } from '../../vendor/lit/directives/repeat.js'
import * as session from '../lib/session.js'
import { emit } from '../lib/dom.js'
import * as contextMenu from '../com/context-menu.js'
import '../com/header.js'
import '../com/button.js'

class AppAppsView extends LitElement {
  static get properties () {
    return {
      currentPath: {type: String, attribute: 'current-path'},
      services: {type: Array},
      updaterStates: {type: Object}
    }
  }

  createRenderRoot() {
    return this // dont use shadow dom
  }

  constructor () {
    super()
    this.updaterStates = {}
  }

  async load () {
    document.title = `Home`
    if (!session.isActive()) {
      window.location = '/'
      return
    }
    this.services = (await session.api.services_list())?.services
    console.log(this.services)
  }

  async refresh () {
  }

  async pageLoadScrollTo (y) {
  }

  // rendering
  // =

  render () {
    return html`
      <main class="min-h-screen bg-default-3">
        <app-header></app-header>
        <div class="max-w-4xl my-8 mx-auto bg-default rounded px-6 py-4">
          <h1 class="text-5xl mb-6">Apps</h1>
          <div class="mb-6">
            <app-button label="Install New App" href="/p/install-app"></app-button>
          </div>
          ${this.renderAppsList()}
        </div>
      </main>
    `
  }

  renderAppsList () {
    if (!this.services) {
      return html`<div><span class="spinner"></span></div>`
    }
    if (!this.services.length) {
      return html`<div>No apps installed</div>`
    }
    return html`
      <div>
        ${repeat(this.services, srv => srv.settings.id, srv => html`
          <div class="mb-4">
            <h2 class="text-2xl">
              <a class="hover:underline" href="http://${srv.settings.id}.${window.location.hostname}" target="_blank">${srv.settings.manifest?.name || srv.settings.id}</a>
            </h2>
            <div>
              ${srv.settings.package.sourceType === 'git' ? srv.settings.package.installedVersion : 'Local folder'}
              |
              <a href="/p/app/${srv.settings.id}" class="text-default-3 hover:underline">Details</a>
              |
              <span class="inline-block">
                <a class="cursor-pointer px-2 py-0.5 hover:bg-default-2" @click=${e => this.onClickAppMenu(e, srv)}><span class="fas fa-ellipsis-h"></span></a>
              </span>
            </div>
            ${this.renderAppUpdater(srv.settings.id)}
          </div>
        `)}
      </div>
    `
  }

  renderAppUpdater (id) {
    if (!this.updaterStates[id]) return ''
    let cls = 'bg-default-2'
    if (this.updaterStates[id].status === 'error') cls = 'bg-error text-error font-medium'
    if (this.updaterStates[id].status === 'update-available' || this.updaterStates[id].status === 'update-installed') cls = 'bg-secondary text-inverse font-medium'
    return html`
      <div class="mt-2 ml-6 px-4 py-3 rounded text-sm ${cls}">
        ${this.updaterStates[id].status === 'processing' ? html`<span class="spinner"></span>` : ''}
        ${this.updaterStates[id].status === 'no-update-available' ? html`<span class="fas fa-check-circle"></span>` : ''}
        ${this.updaterStates[id].status === 'update-available' ? html`<span class="fas fa-download"></span>` : ''}
        ${this.updaterStates[id].status === 'error' ? html`<span class="fas fa-exclamation-triangle"></span>` : ''}
        ${this.updaterStates[id].status === 'update-installed' ? html`<span class="fas fa-check-circle"></span>` : ''}
        ${this.updaterStates[id].message}
        ${this.updaterStates[id].status === 'update-available' ? html`
          <span class="ml-2">
            <app-button label="Install Now" btn-class="bg-secondary text-inverse hover:bg-secondary-2 border border-inverse" @click=${e => this.onClickInstallUpdate(e, id)}></app-button>
          </span>
        ` : ''}
      </div>
    `
  }

  // events
  // =

  onClickAppMenu (e, srv) {
    e.preventDefault()
    e.stopPropagation()
    const el = e.currentTarget
    
    let items = []
    if (srv.settings.package.sourceType === 'git') {
      items.push({label: 'Check for updates', click: () => this.onClickCheckUpdates(undefined, srv.settings.id)})
    }
    items.push({label: 'Details', click: () => emit(el, 'navigate-to', {detail: {url: `/p/app/${srv.settings.id}`}})})
    items.push({label: 'Uninstall', click: () => this.onClickUninstallApp(undefined, srv.settings.id)})

    contextMenu.create({
      parent: e.currentTarget.parentNode,
      noBorders: true,
      style: `padding: 4px 0`,
      items
    })
  }

  async onClickStartApp (e, id) {
    e?.preventDefault()
    await session.api.services_start(id)
    this.load()
  }

  async onClickRestartApp (e, id) {
    e?.preventDefault()
    await session.api.services_restart(id)
    this.load()
  }

  async onClickStopApp (e, id) {
    e?.preventDefault()
    await session.api.services_stop(id)
    this.load()
  }

  async onClickUninstallApp (e, id) {
    e?.preventDefault()
    if (!confirm(`Uninstall ${id}?`)) return
    await session.api.services_uninstall(id)
    this.load()
  }

  async onClickCheckUpdates (e, id) {
    e?.preventDefault()
    this.updaterStates = Object.assign(this.updaterStates, {[id]: {status: 'processing', message: 'Checking for updates...'}})
    this.requestUpdate()
    try {
      const status = await session.api.services_checkForPackageUpdates(id)
      if (status.hasUpdate) {
        this.updaterStates = Object.assign(this.updaterStates, {[id]: {status: 'update-available', message: `Update available: v${status.latestVersion} can now be installed!`}})
        this.requestUpdate()
      } else {
        this.updaterStates = Object.assign(this.updaterStates, {[id]: {status: 'no-update-available', message: `Your app is up-to-date!`}})
        this.requestUpdate()
      }
    } catch (e) {
      this.updaterStates = Object.assign(this.updaterStates, {[id]: {status: 'error', message: e.toString()}})
      this.requestUpdate()
    }
  }

  async onClickInstallUpdate (e, id) {
    e?.preventDefault()
    this.updaterStates = Object.assign(this.updaterStates, {[id]: {status: 'processing', message: 'Installing update...'}})
    this.requestUpdate()
    try {
      const status = await session.api.services_updatePackage(id)
      console.log(status)
      if (this.services.find(app => app.id === id)?.isActive) {
        this.updaterStates = Object.assign(this.updaterStates, {[id]: {status: 'processing', message: 'Restarting...'}})
        this.requestUpdate()
        await session.api.services_restart(id)
      }
      this.updaterStates = Object.assign(this.updaterStates, {[id]: {status: 'update-installed', message: `Update complete: v${status.installedVersion} is now installed!`}})
      this.requestUpdate()
      this.load()
    } catch (e) {
      this.updaterStates = Object.assign(this.updaterStates, {[id]: {status: 'error', message: e.toString()}})
      this.requestUpdate()
    }
  }
}

customElements.define('app-apps-view', AppAppsView)