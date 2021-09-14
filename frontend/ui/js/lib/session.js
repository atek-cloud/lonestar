import { create as createRpc } from '../../vendor/atek-browser-rpc.js'

export let api = createRpc('/_api')
export let info = undefined

const sessionsApi = createRpc('/_atek/gateway?api=atek.cloud%2Fuser-sessions-api')

export async function setup () {
  window.api = api
  info = await sessionsApi.whoami()
}

export async function logout () {
  await sessionsApi.logout()
}
