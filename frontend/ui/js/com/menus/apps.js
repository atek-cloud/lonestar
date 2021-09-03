import { LitElement, html } from '../../../vendor/lit/lit.min.js'
import { repeat } from '../../../vendor/lit/directives/repeat.js'
import * as session from '../../lib/session.js'
import * as contextMenu from '../context-menu.js'
import '../button.js'

export function create ({parent, x, y}) {
  return contextMenu.create({
    parent,
    x: -310,
    y,
    render () {
      return html`
        <app-apps-menu></app-apps-menu>
      `
    }
  })
}

export class AppsMenu extends LitElement {
  static get properties () {
    return {
      services: {type: Object}
    }
  }

  createRenderRoot() {
    return this // dont use shadow dom
  }

  constructor () {
    super()
    this.services = undefined
    this.load()
  }

  async load () {
    this.services = (await session.api.services_list())?.services
  }

  get activeServices () {
    return (this.services || []).filter(srv => srv.status === 'active' && !srv.settings.id.startsWith('core.'))
  }

  // rendering
  // =

  render () {
    return html`
      <style>
        .container {
          display: grid;
          grid-template-columns: repeat(3, 100px);
          grid-gap: 30px 0;
          background: #fff;
          width: 300px;
          box-shadow: rgb(0 0 0 / 30%) 0px 2px 15px;
          padding: 1.4rem 0.8rem;
          border-radius: 0.5rem;
        }
        .container a {
          display: block;
          text-align: center;
          text-decoration: none;
          font-size: 12px;
        }
        .container a img {
          display: block;
          width: 50px;
          height: 50px;
          object-fit: cover;
          margin: 0 auto 10px;
        }
        .container a span {
          display: block;
          color: #444;
          line-height: 1;
        }
      </style>
      <div class="container">
        ${this.services ? html`
          ${repeat(this.activeServices, srv => srv.id, (srv, i) => html`
            <a class="block text-center" href="http://${srv.settings.id}.localhost/">
              <img src="/img/todo.png">
              <span>${srv.settings.manifest?.name || srv.settings.id}</span>
            </a>
          `)}
          <a class="block text-center" href="/p/install-app">
            <img src="/img/icons/install@2x.png">
            <span>Install App</span>
          </a>
          <a class="block text-center" href="/p/cloud">
            <img src="/img/icons/cloud@2x.png">
            <span>My Data</span>
          </a>
          <a class="block text-center" href="/p/apps">
            <img src="/img/icons/settings@2x.png">
            <span>Settings</span>
          </a>
        ` : ''}
      </div>
    `
  }

  // events
  // =
}

customElements.define('app-apps-menu', AppsMenu)
