import { LitElement, html } from '../../vendor/lit/lit.min.js'
import { repeat } from '../../vendor/lit/directives/repeat.js'
import * as session from '../lib/session.js'
import * as appsMenu from '../com/menus/apps.js'
import '../com/button.js'
import '../com/login.js'
import '../com/img-fallbacks.js'
import '../com/subnav.js'
import '../com/search-input.js'

class AppMainView extends LitElement {
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
    if (!session.isActive()) {
      if (location.pathname !== '/') {
        window.location = '/'
      }
      return this.requestUpdate()
    }
    this.services = (await session.api.services_list())?.services
    console.log(this.services)
  }

  async refresh () {
  }

  async pageLoadScrollTo (y) {
  }

  get activeServices () {
    return (this.services || []).filter(srv => srv.status === 'active' && !srv.settings.id.startsWith('core.'))
  }

  // rendering
  // =

  render () {
    return html`
      ${this.renderCurrentView()}
    `
  }

  renderCurrentView () {
    if (!session.isActive()) {
      return this.renderNoSession()
    }
    return this.renderWithSession()
  }

  renderNoSession () {
    return html`
      <div class="flex items-center justify-center w-screen h-screen bg-blue-600">
        <style>
          .animated-ring {
            animation: animated-ring-anim 3s infinite;
          }
          @keyframes animated-ring-anim {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            100% {
              transform: scale(1.25);
              opacity: 0;
            }
          }
        </style>
        <div class="w-96">
          <div class="w-48 h-48 relative mx-auto mb-10">
            <div class="animated-ring absolute rounded-full w-48 h-48 border border-white"></div>
            <div class="flex items-center justify-center rounded-full w-48 h-48 border-8 border-white text-white text-4xl">PF</div>
          </div>
          <app-login></app-login>
        </div>
      </div>
    `
  }

  renderWithSession () {
    const SUBNAV_ITEMS = [
      // {menu: true, mobileOnly: true, label: html`<span class="fas fa-bars"></span>`},
      {path: '/', thin: true, label: 'Updates'},
      {path: '/album', thin: true, label: 'Album'},
      {path: '/calendar', thin: true, label: 'Calendar'}
    ]
    const srvColCount = Math.min((this.activeServices.length || 0) + 3, 5)
    return html`
      <main class="min-h-screen" style="background: url(/img/home-bg.png); background-size: cover;">
        <div class="flex items-center px-5 pt-4 text-lg">
          <div class="flex-1"></div>
          <div class="mx-3">
            <button class="rounded hover:bg-gray-200 px-2 py-1" @click=${this.onClickAppsMenu}><span class="fas fa-th"></span></button>
          </div>
          <img class="inline-block w-8 h-8 rounded-full" src="/img/default-user-thumb.jpg" @click=${this.onClickLogout}>
        </div>
        <div style="margin-top: calc(20vh - 40px)">
          <img class="block mx-auto mb-12" src="/img/logo-md.png">
          <app-search-input class="block max-w-xl mx-auto mb-12"></app-search-input>
          <div class="grid gap-8 justify-center max-w-2xl mx-auto text-sm" style="grid-template-columns: repeat(${srvColCount}, auto)">
            ${repeat(this.activeServices, srv => srv.id, (srv, i) => html`
              <a class="block w-24 text-center" href="http://${srv.settings.id}.localhost/">
                <img class="border border-white mx-auto object-fit rounded-full shadow" src="/img/todo.png" style="width: 40px; height: 40px">
                <span class="inline-block w-full truncate pt-3">${srv.settings.manifest?.name || srv.settings.id}</span>
              </a>
            `)}
            <a class="block w-24 text-center" href="/p/install-app">
              <img class="border border-white mx-auto object-fit rounded-full shadow" src="/img/icons/install.png" style="width: 52px; height: 52px">
              <span class="inline-block w-full truncate pt-3">Install App</span>
            </a>
            <a class="block w-24 text-center" href="/p/cloud">
              <img class="border border-white mx-auto object-fit rounded-full shadow" src="/img/icons/cloud.png" style="width: 52px; height: 52px">
              <span class="inline-block w-full truncate pt-3">My Data</span>
            </a>
            <a class="block w-24 text-center" href="/p/apps">
              <img class="border border-white mx-auto object-fit rounded-full shadow" src="/img/icons/settings.png" style="width: 52px; height: 52px">
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

customElements.define('app-main-view', AppMainView)