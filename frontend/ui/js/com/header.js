import { LitElement, html } from '../../vendor/lit/lit.min.js'
import * as icons from './icons.js'
import { emit } from '../lib/dom.js'
import * as appsMenu from './menus/apps.js'
import './button.js'
import './search-input.js'

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
      <div class="flex items-center pr-5 pl-4 py-2 text-default-2 text-lg bg-default shadow relative z-10">
        <a class="inline-block p-1 mr-3 cursor-pointer" href="/">
          <img src="/img/logo-sm.png">
        </a>
        <div class="flex-1">
          <app-search-input in-header class="block max-w-2xl"></app-search-input>
        </div>
        <div class="mx-3"><app-button transparent icon="fas fa-th" @click=${this.onClickAppsMenu}></app-button></div>
        <img class="inline-block w-8 h-8 rounded-full" src="/img/default-user-thumb.jpg" @click=${this.onClickLogout}>
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

  onKeydownSearch (e) {
    if (e.code === 'Enter') {
      let q = e.currentTarget.value.trim()
      emit(this, 'navigate-to', {detail: {url: `/p/search?q=${q}`}})
    }
  }
}

customElements.define('app-header', Header)
