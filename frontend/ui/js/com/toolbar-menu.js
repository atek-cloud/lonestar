import { LitElement, html } from '../../vendor/lit/lit.min.js'
import * as icons from './icons.js'
import './button.js'

export class ToolbarMenu extends LitElement {
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
      <div class="py-2">
        <lonestar-button icon="plus" label="New" btn-class="text-xs leading-tight pt-1 pb-0.5 pl-1 pr-1" is-dropdown></lonestar-button>
        <span class="text-default-4 mx-1">|</span>
        <lonestar-button icon="space" label="Space" btn-class="text-xs leading-tight pt-1 pb-0.5 pl-1 pr-1" is-dropdown></lonestar-button>
        <lonestar-button transparent label="[ Access: Everyone ]" btn-class="text-xs leading-tight py-1 pl-1"></lonestar-button>
        <lonestar-button transparent label="[ Authors: You ]" btn-class="text-xs leading-tight py-1 pl-1"></lonestar-button>
        <span class="text-default-4 mx-1">|</span>
        <lonestar-button icon="share" label="Share" btn-class="text-xs leading-tight pt-1 pb-0.5 pl-1 pr-2"></lonestar-button>
      </div>
    `
  }

  // events
  // =

}

customElements.define('lonestar-toolbar-menu', ToolbarMenu)
