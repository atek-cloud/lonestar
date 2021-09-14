import { LitElement, html } from '../../vendor/lit/lit.min.js'
import { emit } from '../lib/dom.js'
import * as appsMenu from './menus/apps.js'
import * as contextMenu from './context-menu.js'
import './button.js'
import './search-input.js'
import * as session from '../lib/session.js'

export class Header extends LitElement {
  static get properties () {
    return {
    }
  }

  createRenderRoot() {
    return this // dont use shadow dom
  }

  constructor () {
    super()
  }

  render () {
    return html`
      <div class="flex items-center pr-5 pl-4 py-2 text-default-2 text-lg bg-default border-b border-default-2 relative z-10">
        <div class="w-40">
          <a class="cursor-pointer" href="/">
            <img src="/img/logo-sm.png" srcset="/img/logo-sm.png 1x, /img/logo-sm@2x.png 2x" style="width: 32px">
          </a>
        </div>
        <div class="w-full max-w-2xl mx-auto">
          <app-search-input in-header class="block"></app-search-input>
        </div>
        <div class="w-40 text-right">
          <span class="inline-block mr-4"><app-button transparent icon="dots" icon-size="24" @click=${this.onClickAppsMenu}></app-button></span>
          <img class="inline-block w-8 h-8 rounded-full" src="/img/default-user-thumb.jpg" @click=${this.onClickProfileMenu}>
        </div>
      </div>
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

  onClickProfileMenu (e) {
    e.preventDefault()
    e.stopPropagation()
    contextMenu.create({
      x: 10,
      y: undefined,
      right: true,
      parent: e.currentTarget.parentNode,
      items: [
        {icon: 'fas fa-fw fa-sign-out-alt', label: 'Log out', async click () {
          await session.logout()
          window.location.reload()
        }}
      ]
    })
  }

  onKeydownSearch (e) {
    if (e.code === 'Enter') {
      let q = e.currentTarget.value.trim()
      emit(this, 'navigate-to', {detail: {url: `/p/search?q=${q}`}})
    }
  }
}

customElements.define('app-header', Header)
