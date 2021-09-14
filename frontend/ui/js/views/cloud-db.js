import { LitElement, html } from '../../vendor/lit/lit.min.js'
import { repeat } from '../../vendor/lit/directives/repeat.js'
import { guard } from '../../vendor/lit/directives/guard.js'
import { JsonPointer } from '../../vendor/json-ptr.js'
import * as session from '../lib/session.js'
import { joinPath } from '../lib/strings.js'
import '../com/header.js'
import '../com/button.js'

class AppCloudDbView extends LitElement {
  static get properties () {
    return {
      currentPath: {type: String, attribute: 'current-path'},
      currentView: {type: String},
      error: {type: String},
      record: {type: Array},
      records: {type: Array},
      tables: {type: Array},
      hasChanges: {type: Boolean},
      modifiedData: {type: Object}
    }
  }

  createRenderRoot() {
    return this // dont use shadow dom
  }

  constructor () {
    super()
    this.currentPath = ''
    this.currentView = 'form'
    this.hyperKey = ''
    this.dbDesc = undefined
    this.error = undefined
    this.record = undefined
    this.records = undefined
    this.tables = undefined
    this.hasChanges = false
    this.modifiedData = undefined

    this.iframe = undefined
    this.iframeResizeObserver = undefined
  }

  async load () {
    document.title = `Server Settings`

    this.record = undefined
    this.records = undefined
    this.tables = undefined
    this.hasChanges = false
    this.modifiedData = undefined
    const pathParts = this.currentPath.split('/').filter(Boolean)
    this.hyperKey = pathParts[3]

    if (!this.dbDesc) {
      this.dbDesc = await session.api.adb_dbDescribe(this.hyperKey)
      console.log(this.dbDesc)
    }

    const subpathParts = pathParts.slice(4)
    const tableId = subpathParts.slice(0, 2).join('/')
    const recordKey = subpathParts.slice(2)[0]
    this.currentDBPath = {tableId, recordKey}
    this.currentView = 'form'
    try {
      if (tableId) {
        if (recordKey) {
          this.record = await session.api.adb_tblGet(this.hyperKey, tableId, recordKey)
          if (this.getSchema(this.record.path)) {
            this.currentView = 'form'
          } else {
            this.currentView = 'data'
          }
        } else {
          this.records = (await session.api.adb_tblList(this.hyperKey, tableId)).records
        }
      } else {
        this.tables = this.dbDesc?.tables
      }
      console.log(this.currentDBPath, this.record || this.records)
    } catch (e) {
      this.error = e.toString()
      console.log('Failed to fetch records')
      console.log(e)
    }
  }

  async refresh () {
  }

  async pageLoadScrollTo (y) {
  }

  getTable (path) {
    return this.dbDesc?.tables?.find(t => t.tableId === path.split('/').filter(Boolean).slice(0, 2).join('/'))
  }

  getSchema (path) {
    const table = this.getTable(path)
    if (table) return adjustRefs(table.definition)
    return undefined
  }

  async updated (changedProperties) {
    const iframe = this.querySelector('iframe')
    if (this.record) {
      if (iframe && iframe !== this.iframe) {
        if (!iframe.contentWindow.isAppReady) {
          await new Promise(r => iframe.contentWindow.addEventListener('DOMContentLoaded', r))
        }
        const schema = this.getSchema(this.record.path)
        iframe.contentWindow.app.render({schema, initialData: this.record.value})
        
        iframe.height = iframe.contentWindow.document.body.scrollHeight + 10;
        if (!this.iframeResizeObserver) {
          this.iframeResizeObserver = new ResizeObserver(entries => {
            iframe.height = iframe.contentWindow.document.body.scrollHeight + 10;
          })
          this.iframeResizeObserver.observe(iframe.contentWindow.document.body)
        }
      } else if (changedProperties.has('currentView')) {
        const table = this.getTable(this.record.path)
        if (this.currentView === 'schema') {
          iframe.contentWindow.app.render({schema: table.definition, initialData: table, mode: 'editor', readonly: true})
        } else {
          iframe.contentWindow.app.render({schema: table.definition, initialData: this.modifiedData || this.record.value, mode: this.currentView})
        }
      }
    }
    if (iframe && !this.iframe) {
      iframe.contentWindow.addEventListener('data-change', this.onJsonFormsDataChange.bind(this))
    }
    if (!iframe && this.iframeResizeObserver) {
      this.iframeResizeObserver.unobserve(this.iframe)
      this.iframeResizeObserver = undefined
    }
    this.iframe = iframe
  }

  // rendering
  // =

  render () {
    return html`
      <main class="min-h-screen bg-default-3">
        <app-header></app-header>
        <div class="px-4 py-4">
          <h1 class="text-lg mb-2 font-medium">
            <a class="text-primary hover:underline" href="/p/cloud">My Cloud</a>
            › <a class="hover:underline" href="/p/cloud/view/${this.hyperKey}">${this.dbDesc?.displayName}</a>
          </h1>
          <div class="mb-2">${this.renderBreadcrumbs()}</div>
          ${this.renderCurrentData()}
        </div>
      </main>
    `
  }

  renderBreadcrumbs () {
    const htmlAcc = []
    htmlAcc.push(html`
      <a class="px-2 py-1 hover:text-primary" href="/p/cloud/view/${this.hyperKey}/">Root</a>
    `)
    if (this.currentDBPath) {
      const {tableId, recordKey} = this.currentDBPath
      if (tableId) {
        const table = this.dbDesc?.tables?.find(t => t.tableId === tableId)
        htmlAcc.push(html`
          <div class="relative" style="width: 20px">
            <div class="absolute border-t border-r border-default" style="transform: rotate(45deg); width: 24px; height: 24px; left: -10px; top: 4px;"></div>
          </div>
        `)
        htmlAcc.push(html`
          <a class="px-2 py-1 hover:text-primary" href="/p/cloud/view/${this.hyperKey}/${tableId}">${table ? getTableTitle(table) : tableId}</a>
        `)
      }
      if (recordKey) {
        htmlAcc.push(html`
          <div class="relative" style="width: 20px">
            <div class="absolute border-t border-r border-default" style="transform: rotate(45deg); width: 24px; height: 24px; left: -10px; top: 4px;"></div>
          </div>
        `)
        htmlAcc.push(html`
          <a class="px-2 py-1 hover:text-primary" href="/p/cloud/view/${this.hyperKey}/${tableId}/${recordKey}">${recordKey}</a>
        `)
      }
    }
    return html`
      <div class="inline-flex border border-default rounded bg-default px-2">
        ${htmlAcc}
      </div>
    `
  }

  renderCurrentData () {
    if (this.records) {
      return this.renderRecords()
    } else if (this.record) {
      return this.renderRecord()
    } else if (this.tables) {
      return this.renderTables()
    } else {
      return html`
        <div><span class="spinner"></span></div>
      `
    }
  }

  renderRecords () {
    const table = this.dbDesc?.tables?.find(t => t.tableId === this.currentDBPath.tableId)
    return html`
      <div class="flex">
        <div class="flex-1 mr-2 min-w-0">
          ${repeat(this.records, (record, i) => html`
            <a class="flex border ${i === 0 ? 'rounded-t' : 'border-t-0'} border-default bg-default hover:bg-default-2 cursor-pointer ${i === this.records.length - 1 ? 'rounded-b' : ''} tabular-nums" href="${joinPath(this.currentPath, record.key)}">
              <div class="px-2 py-2 truncate" style="flex: 0 0 200px">${record.key}</div>
              <div class="flex-1 px-2 py-2 border-l border-default truncate">
                ${getRecordDescription(table, record) || JSON.stringify(record.value)}
              </div>
            </a>
          `)}
          ${this.records?.length === 0 ? html`
            <div class="flex border border-default bg-default rounded px-4 py-2">This table is empty.</div>
          ` : ''}
        </div>
        <div style="flex: 0 0 33vw">
          ${table ? html`
            <div class="mb-2 px-2 py-2 bg-default border border-default rounded">
              <div class="border-b border-default font-medium mb-2 pb-2 px-1 text-lg">
                <div class="font-medium">${getTableTitle(table)}</div>
                ${getTableDescription(table) ? html`<div class="text-sm">${getTableDescription(table)}</div>` : ''}
              </div>
              <div>
                <app-button transparent label="New record" icon="fas fa-plus" @click=${this.onClickNew}></app-button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `
  }

  renderRecord () {
    const table = this.record ? this.getTable(this.record.path) : undefined
    const desc = this.record ? getRecordDescription(table, this.record) : undefined
    console.log(table, desc)
    return html`
      <div class="flex">
        <div class="flex-1 mr-2">
          ${guard([this.currentPath], () => html`
            <iframe id="json-forms-iframe" src="/json-forms" class="w-full"></iframe>
          `)}
        </div>
        <div style="flex: 0 0 33vw">
          <div class="bg-default border border-default rounded mb-1">
            <div class="px-2 py-2">
              <app-button ?primary=${this.hasChanges} label="Save changes" icon="fas fa-save" ?disabled=${!this.hasChanges} @click=${this.onClickSave}></app-button>
              <app-button transparent btn-class="hover:text-error" label="Delete" icon="far fa-trash-alt" @click=${this.onClickDelete}></app-button>
            </div>
            ${desc ? html`
              <div class="flex items-center border-t border-default">
                <div class="px-2 py-1.5 text-sm border-r border-default-2 text-default-3" style="flex: 0 0 55px">Desc</div>
                <div class="px-2 py-1.5 flex-1">${desc}</div>
              </div>
            `  : ''}
            <div class="flex items-center border-t border-default-2">
              <div class="px-2 py-1.5 text-sm border-r border-default-2 text-default-3" style="flex: 0 0 55px">Key</div>
              <div class="px-2 py-1.5 flex-1">${this.record.key}</div>
            </div>
            <div class="flex items-center border-t border-default-2">
              <div class="px-2 py-1.5 text-sm border-r border-default-2 text-default-3" style="flex: 0 0 55px">Seq</div>
              <div class="px-2 py-1.5 flex-1">${this.record.seq}</div>
            </div>
            <div class="border-t border-default-2 px-2 py-1 text-sm text-default-3">
              ${table?.definition ? html`
                <a class="${this.currentView === 'form' ? 'font-semibold' : ''} ml-1 cursor-pointer hover:underline" @click=${e => this.setCurrentView('form')}>Form</a>
              ` : ''}
              <a class="${this.currentView === 'data' ? 'font-semibold' : ''} ml-1 cursor-pointer hover:underline" @click=${e => this.setCurrentView('data')}>Data</a>
              ${table?.definition ? html`
                <a class="${this.currentView === 'schema' ? 'font-semibold' : ''} ml-1 cursor-pointer hover:underline" @click=${e => this.setCurrentView('schema')}>Schema</a>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `
  }

  renderTables () {
    return html`
      <div class="mb-2 px-2 py-2 bg-default border border-default rounded">
        <h2 class="border-b border-default font-medium mb-2 pb-1 px-1 text-lg">
          Tables
        </h2>
        ${repeat(this.tables, t => t.tableId, table => html`
          <a class="flex items-center rounded bg-default hover:bg-default-2 cursor-pointer px-3 py-3" href="/p/cloud/view/${this.hyperKey}/${table.tableId}/">
            <div style="flex: 0 0 40px">
              <img class="block" src="/img/todo.png" style="width: 40px; height: 40px">
            </div>
            <div class="flex-1 pl-4">
              <div class="font-semibold leading-none">${getTableTitle(table)}</div>
              <div class="">${getTableDescription(table)}</div>
              <div class="text-xs text-default-2">${getTableNS(table)}</div>
            </div>
          </a>
        `)}
      </div>
    `
  }

  // events
  // =

  onJsonFormsDataChange (e) {
    this.hasChanges = true
    this.modifiedData = e.detail.data
  }

  setCurrentView (view) {
    this.currentView = view
  }

  onClickNew () {
    alert('TODO')
  }

  onClickSave () {
    alert('TODO')
  }

  onClickDelete () {
    if (!confirm('Delete this record?')) return
    alert('TODO')
  }
}

customElements.define('app-cloud-db-view', AppCloudDbView)

function getTableTitle (table) {
  return table?.templates?.table?.title || table.tableId.split('/')[1]
}

function getTableDescription (table) {
  return table?.templates?.table?.description || ''
}

function getTableNS (table) {
  return table?.tableId?.split('/')[0]
}

function getRecordDescription (table, record) {
  const recTmpl = table?.templates?.record
  const desc = recTmpl?.description || recTmpl?.title
  if (!desc) {
    return undefined
  }
  return desc.replaceAll(/\{\{([^\}]*)\}\}/g, (_, path) => {
    return JsonPointer.get(record.value, path) || _
  })
}

// HACK
// json-forms seems to struggle with the $refs
// so we "denormalize" them here
// -prf
function adjustRefs (obj, base) {
  base = base || obj
  if (!obj) return obj
  else if (Array.isArray(obj)) return obj.map(item => adjustRefs(item, base))
  else if (typeof obj === 'object') {
    if (obj.$ref) {
      let refParts = obj.$ref.split('/')
      while (refParts[0] === '#') refParts = refParts.slice(1)
      let target = base
      while (refParts.length) {
        target = target[refParts[0]]
        refParts = refParts.slice(1)
      }
      Object.assign(obj, target)
      delete obj.$ref
    }
    for (const k in obj) {
      obj[k] = adjustRefs(obj[k], base)
    }
    return obj
  } else {
    return obj
  }
}