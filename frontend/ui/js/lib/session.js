import { create as createRpc } from '../../vendor/atek-browser-rpc.js'

let emitter = new EventTarget()
export let api = createRpc('/_api')
export let info = undefined

export async function setup () {
  window.api = api
  info = {
    username: 'user' // DEBUG
  }
  loadSecondaryState()
}

export async function loadSecondaryState () {
  if (!isActive()) {
    return
  }
  // TODO - needed?
  emitter.dispatchEvent(new Event('secondary-state'))
}

export function isActive () {
  return !!info
}

export function onChange (cb) {
  emitter.addEventListener('change', cb)
  // return api.session.onChange(cb)
}

export function onSecondaryState (cb, opts) {
  emitter.addEventListener('secondary-state', cb, opts)
}

export function unOnSecondaryState (cb) {
  emitter.removeEventListener('secondary-state', cb)
}
