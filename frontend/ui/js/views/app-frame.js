import { LitElement, html } from '../../vendor/lit/lit.min.js'
import * as session from '../lib/session.js'
import { getUnframedServiceUrl } from '../lib/services.js'
import * as toast from '../com/toast.js'
import { emit } from '../lib/dom.js'
import * as contextMenu from '../com/context-menu.js'
import '../com/button.js'
import '../com/header.js'

class AppFrameView extends LitElement {
  static get properties () {
    return {
      currentPath: {type: String, attribute: 'current-path'},
      srvId: {type: String}
    }
  }

  createRenderRoot() {
    return this // dont use shadow dom
  }

  constructor () {
    super()
    this.srvId = undefined
    this.service = undefined
  }

  get srvName () {
    return this.service?.manifest?.name || this.srvId
  }

  load () {
    const pathParts = window.location.pathname.split('/').filter(Boolean)
    this.srvId = pathParts[1]

    session.api.services_get(this.srvId).then(service => {
      this.service = service
      document.title = service?.settings?.manifest?.name || this.srvId
    })
  }

  async refresh () {
  }

  async pageLoadScrollTo (y) {
  }

  // rendering
  // =

  render () {
    if (!this.srvId) return
    // sandbox="allow-downloads allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts allow-top-navigation"
    return html`
      <main class="min-h-screen">
        <lonestar-header></lonestar-header>
        <iframe
          src=${getUnframedServiceUrl(this.srvId)}
          style="width: 100vw; height: calc(100vh - 53px);"
        ></iframe>
      </main>
    `
  }

  // events
  // =
}

customElements.define('lonestar-app-frame-view', AppFrameView)