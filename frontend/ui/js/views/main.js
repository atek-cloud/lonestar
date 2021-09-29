import { LitElement, html } from '../../vendor/lit/lit.min.js'
import { repeat } from '../../vendor/lit/directives/repeat.js'
import * as session from '../lib/session.js'
import { getServiceUrl } from '../lib/services.js'
import * as appsMenu from '../com/menus/apps.js'
import '../com/button.js'
import '../com/img-fallbacks.js'
import '../com/subnav.js'
import '../com/search-input.js'

class MainView extends LitElement {
  static get properties () {
    return {
      currentPath: {type: String, attribute: 'current-path'},
      services: {type: Array}
    }
  }

  createRenderRoot() {
    return this // dont use shadow dom
  }

  constructor () {
    super()
  }

  async load () {
    document.title = `Home`
    this.services = (await session.api.services_list())?.services
    console.log(this.services)
  }

  async refresh () {
  }

  async pageLoadScrollTo (y) {
  }

  get activeServices () {
    return (this.services || []).filter(srv => srv.status === 'active' && !srv.settings.id.startsWith('core.') && srv.settings.id !== 'lonestar')
  }

  // rendering
  // =

  render () {
    return html`
      ${this.renderCurrentView()}
    `
  }

  renderCurrentView () {
    const SUBNAV_ITEMS = [
      // {menu: true, mobileOnly: true, label: html`<span class="fas fa-bars"></span>`},
      {path: '/', thin: true, label: 'Updates'},
      {path: '/album', thin: true, label: 'Album'},
      {path: '/calendar', thin: true, label: 'Calendar'}
    ]
    const srvColCount = Math.min((this.activeServices.length || 0) + 3, 5)
    return html`
      <main class="min-h-screen">
        <lonestar-header></lonestar-header>
        <div style="margin-top: calc(20vh - 40px)">
          <div class="grid gap-12 justify-center max-w-2xl mx-auto text-sm" style="grid-template-columns: repeat(${srvColCount}, auto)">
            ${repeat(this.activeServices, srv => srv.id, (srv, i) => html`
              <a class="block w-24 text-center" href="${getServiceUrl(srv)}">
                <div class="mx-auto bg-gray-100 rounded-full" style="width: 70px; height: 70px; padding: 15px">
                  <img src="/img/todo.png" style="width: 40px; height: 40px">
                </div>
                <span class="inline-block w-full truncate pt-3">${srv.settings.manifest?.name || srv.settings.id}</span>
              </a>
            `)}
            <a class="block w-24 text-center" href="/app/core.adb">
              <div class="mx-auto bg-gray-100 rounded-full" style="width: 70px; height: 70px; padding: 15px">
                <img src="/img/icons/database.svg" style="width: 40px; height: 40px">
              </div>
              <span class="inline-block w-full truncate pt-3">Atek DB</span>
            </a>
            <a class="block w-24 text-center" href="/p/install-app">
              <div class="mx-auto bg-gray-100 rounded-full" style="width: 70px; height: 70px; padding: 15px">
                <img src="/img/icons/install.svg" style="width: 40px; height: 40px">
              </div>
              <span class="inline-block w-full truncate pt-3">Install App</span>
            </a>
            <a class="block w-24 text-center" href="/p/settings">
              <div class="mx-auto bg-gray-100 rounded-full" style="width: 70px; height: 70px; padding: 15px">
                <img src="/img/icons/settings.svg" style="width: 40px; height: 40px">
              </div>
              <span class="inline-block w-full truncate pt-3">Settings</span>
            </a>
          </div>
        </div>
      </main>
    `
  }


  // events
  // =

  onClickAppsMenu (e) {
    e.preventDefault()
    e.stopPropagation()
    appsMenu.create({
      x: undefined,
      y: undefined,
      parent: e.currentTarget.parentNode
    })
  }

  async onClickLogout (e) {
    await session.api.session.logout()
    this.load()
  }
}

customElements.define('lonestar-main-view', MainView)