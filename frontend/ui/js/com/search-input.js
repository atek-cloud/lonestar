import { LitElement, html } from '../../vendor/lit/lit.min.js'
import { repeat } from '../../vendor/lit/directives/repeat.js'
import { emit } from '../lib/dom.js'
import * as session from '../lib/session.js'
import * as icons from '../com/icons.js'

const LINKS = [
  {
    href: '/p/install-app',
    img: '/img/icons/install.png',
    title: 'Install App'
  },
  {
    href: '/p/cloud',
    img: '/img/icons/cloud.png',
    title: 'My Cloud'
  },
  {
    href: '/p/apps',
    img: '/img/icons/settings.png',
    title: 'Settings'
  }
]

export class SearchInput extends LitElement {
  static get properties () {
    return {
      query: {type: String},
      corpus: {type: Array},
      isInHeader: {type: Boolean, attribute: 'in-header'},
      isFocused: {type: Boolean},
      highlightIndex: {type: Number}
    }
  }

  createRenderRoot() {
    return this // dont use shadow dom
  }

  constructor () {
    super()
    this.query = ''
    this.corpus = undefined
    this.isFocused = false
    this.highlightIndex = 0
  }

  async firstUpdated () {
    const services = (await session.api.services_list())?.services
    this.corpus = LINKS.concat(
      services
        .filter(srv => !srv.settings.id.startsWith('core.'))
        .map(srv => ({
          href: `http://${srv.settings.id}.localhost/`,
          title: srv.settings.manifest?.name || srv.settings.id,
          keywords: `${srv.settings.id}`,
          img: '/img/todo.png'
        }))
    )
  }

  updated (changedProperties) {
    if (changedProperties.has('query')) {
      this.highlightIndex = Math.max(0, Math.min(this.highlightIndex, this.results.length - 1))
    }
  }

  moveSelectionUp () {
    this.highlightIndex = Math.max(this.highlightIndex - 1, 0)
    this.updateComplete.then(() => this.scrollToSelection())
  }

  moveSelectionDown () {
    this.highlightIndex = Math.min(this.highlightIndex + 1, this.results.length - 1)
    this.updateComplete.then(() => this.scrollToSelection())
  }

  navigateToSelection () {
    const el = this.querySelector(this.widgetMode ? '.current-selection' : '.result')
    if (!el || !el.getAttribute('href')) return
    emit(this, 'navigate-to', {detail: {url: el.getAttribute('href')}})
  }

  scrollToSelection () {
    const el = this.querySelector('.current-selection')
    const container = this.querySelector('#results-container')
    if (!el || !container) return
    const containerRect = container.getClientRects()[0]
    const elementRect = el.getClientRects()[0]
    const {offsetTop} = el
    const scrolledTop = el.getBoundingClientRect().top
    if (scrolledTop < 20) {
      container.scrollTo(0, offsetTop)
    } else if (scrolledTop > containerRect.bottom) {
      container.scrollTo(0, offsetTop - containerRect.height + elementRect.height)
    }
  }

  get results () {
    const q = this.query.toLowerCase()
    return (this.corpus||[])
      .filter(item => {
        if (!q) return true
        if (item.title.toLowerCase().includes(q)) return true
        if (item.keywords?.toLowerCase().includes(q)) return true
        return false
      })
  }

  // rendering
  // =

  render () {
    const results = this.results
    const renderResult = (i, href, title, inner) => {
      const isHighlighted = (i === this.highlightIndex)
      return html`
        <a
          class="
            result flex items-center pl-2 pr-4 py-1 text-sm hov:hover:bg-gray-100
            ${isHighlighted ? 'current-selection bg-gray-100' : 'bg-default'}
            ${i === results.length - 1 ? 'mb-1' : ''}
          "
          href=${href}
          title=${title}
          @mousedown=${this.onMousedownResult}
        >
          ${inner}
        </a>
      `
    }
    const showResults = this.isFocused && this.query
    return html`
      <div class="relative">
        <div class="
          flex items-center border bg-default
          ${this.isInHeader ? 'border-default py-1.5 px-1.5 text-sm' : 'border-darker py-2 px-1'}
          ${showResults ? 'rounded-t-2xl' : 'rounded-3xl'}
        " style="${showResults ? 'border-bottom-color: transparent' : ''}">
          <span class="px-1.5">${icons.search(20, 20, 'block')}</span>
          <input
            class="flex-1 bg-transparent"
            placeholder="Search"
            @keyup=${this.onKeyupQuery}
            @keydown=${this.onKeydownQuery}
            @focus=${e => {this.isFocused = true}}
            @blur=${e => {this.isFocused = false}}
          >
        </div>
        ${showResults ? html`
          <div
            id="results-container"
            class="absolute bg-default border ${this.isInHeader ? 'border-default' : 'border-darker'} border-t-0 left-0 overflow-y-auto w-full rounded-b-2xl"
            style="max-height: 75vh"
          >
            ${repeat(results, r => r.href, (r, i) => renderResult(i, r.href, r.title, html`
              <img class="w-8 h-8 object-cover mr-2" src=${r.img}>
              <span class="truncate">${r.title}</span>
            </a>
          `))}
          ${!this.results?.length ? html`
            <div class="px-4 py-2.5 bg-default text-sm text-gray-600">No results</div>
          ` : ''}
          </div>
        ` : ''}
      </div>
    `
  }

  // events
  // =

  onKeyupQuery (e) {
    this.query = e.currentTarget.value.trim()
    emit(this, 'search', {detail: {query: this.query}})
  }

  onKeydownQuery (e) {
    this.query = e.currentTarget.value.trim()
    emit(this, 'search', {detail: {query: this.query}})
    if (e.code === 'Enter') {
      e.preventDefault()
      this.navigateToSelection()
      this.querySelector('input').blur()
    } else if (e.code === 'ArrowUp') {
      e.preventDefault()
      this.moveSelectionUp()
    } else if (e.code === 'ArrowDown') {
      e.preventDefault()
      this.moveSelectionDown()
    }
  }

  onMousedownResult (e) {
    const href = e.currentTarget.getAttribute('href')
    if (href) emit(this, 'navigate-to', {detail: {url: href}})
  }
}

customElements.define('app-search-input', SearchInput)
