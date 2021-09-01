import { LitElement, html } from '../../vendor/lit/lit.min.js'
import { repeat } from '../../vendor/lit/directives/repeat.js'
import * as session from '../lib/session.js'
import { emit } from '../lib/dom.js'
import * as contextMenu from '../com/context-menu.js'
import '../com/header.js'
import '../com/button.js'

class AppCloudView extends LitElement {
  static get properties () {
    return {
      currentPath: {type: String, attribute: 'current-path'},
      dbs: {type: Array}
    }
  }

  createRenderRoot() {
    return this // dont use shadow dom
  }

  constructor () {
    super()
    this.bucketId = 'root'
  }

  async load () {
    document.title = `My Cloud`
    if (!session.isActive()) {
      window.location = '/'
      return
    }

    const cfg = await session.api.adbctrl_getConfig()
    this.dbs = [
      {dbId: cfg.serverDbId, displayName: 'System DB'}
    ].concat(await session.api.adbctrl_listDbs())
    console.log(this.dbs)
    /*let pathParts = this.currentPath.split('/').filter(Boolean)
    if (this.currentPath.startsWith('/p/cloud/bucket')) {
      this.bucketId = this.currentPath.split('/').filter(Boolean).pop()
    } else {
      this.bucketId = 'root'
    }
    this.bucket = (await (await fetch(`/_api/cloud/bucket/${this.bucketId}`)).json())*/
  }

  // updated (changedProperties) {
  //   if (changedProperties.has('currentPath')) {
  //     console.log('hit', this.currentPath)
  //   }
  // }

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
        <div class="px-4 py-4">
          <h2 class="border-b border-default font-medium mb-3 pb-1 text-lg">
            <a href="/p/cloud" class="hover:underline">My Cloud</a>
            ${''/*this.bucketId !== 'root' ? html`
              › <a class="hover:underline" href="/p/cloud/bucket/${this.bucketId}">${this.bucket?.title || this.bucketId}</a>
            ` : ''*/}
          </h2>
          ${!this.dbs ? html`
            <div><span class="spinner"></span></div>
          ` : !this.dbs.length ? html`
            <div>This server is empty.</div>
          ` : html`
            <div class="grid gap-2" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))">
              ${repeat(this.dbs, db => html`
                <a class="block border border-default rounded bg-default text-center pt-8 pb-8" href=${`/p/cloud/view/${db.dbId}`}>
                  ${this.renderItemIcon(db)}
                  <div class="text-lg leading-none mb-1">${db.displayName}</div>
                  <div class="text-sm text-default-2 leading-none">Atek DB</div>
                </a>
              `)}
            </div>
          `}
        </div>
      </main>
    `
  }

  renderItemIcon (item) {
    /*if (item.type === 'profile') {
      return html`
        <div class="mb-4 relative">
          <img class="block mx-auto mb-4" src="/img/user.png" style="width: 40px; height: 40px">
          <img class="absolute rounded-full object-fit border border-inverse" src="/img/default-user-thumb.jpg" style="right: calc(50% - 26px); bottom: 0; width: 24px; height: 24px;">
        </div>
      `
    }
    if (item.type === 'system-trash') {
      return html`<img class="block mx-auto mb-4" src="/img/todo.png" style="width: 40px; height: 40px">`
    }
    if (item.type === 'system-db') {
      return html`<img class="block mx-auto mb-4" src="/img/todo.png" style="width: 40px; height: 40px">`
    }
    if (item.type === 'app-bucket') {
      return html`<img class="block mx-auto mb-4" src="/img/todo.png" style="width: 40px; height: 40px">`
    }*/
    return html`
      <img class="block mx-auto mb-4" src="/img/todo.png" style="width: 40px; height: 40px">
    `
  }

  // events
  // =

}

customElements.define('app-cloud-view', AppCloudView)