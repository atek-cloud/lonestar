import createExpressApp, * as express from 'express'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { AtekRpcServer } from '@atek-cloud/node-rpc'
import ServicesApiClient from './gen/atek.cloud/services-api.js'
import AdbApiClient from './gen/atek.cloud/adb-api.js'
import AdbApiCtrlClient from './gen/atek.cloud/adb-ctrl-api.js'

const __dirname = join(dirname(fileURLToPath(import.meta.url)), '..')

const services = new ServicesApiClient()
const adb = new AdbApiClient()
const adbCtrl = new AdbApiCtrlClient()

// TODO come up with a permanent rpc api solution which handles auth and etc -prf
const apiServer = new AtekRpcServer({
  whoami () {
    // TODO
  },

  login () {
    // TODO
  },

  logout () {
    // TODO
  },
  
  services_list: () => services.list(),
  services_get: (id) => services.get(id),
  services_start: (id) => services.start(id),
  services_stop: (id) => services.stop(id),
  services_restart: (id) => services.restart(id),
  services_install: (opts) => services.install(opts),
  services_uninstall: (id) => services.uninstall(id),
  services_checkForPackageUpdates: (id) => services.checkForPackageUpdates(id),
  services_updatePackage: (id) => services.updatePackage(id),
  services_configure: (id, updates) => services.configure(id, updates),

  adbctrl_getConfig: () => adbCtrl.getConfig(),
  adbctrl_listDbs: () => adbCtrl.listDbs(),

  adb_describe: (dbId) => adb.describe(dbId),
  adb_table: (dbId, tableId, desc) => adb.table(dbId, tableId, desc),
  adb_list: (dbId, tableId, opts) => adb.list(dbId, tableId, opts),
  adb_get: (dbId, tableId, key) => adb.get(dbId, tableId, key),
  adb_create: (dbId, tableId, value, blobs) => adb.create(dbId, tableId, value, blobs),
  adb_put: (dbId, tableId, key, value) => adb.put(dbId, tableId, key, value),
  adb_delete: (dbId, tableId, key) => adb.delete(dbId, tableId, key)
}, undefined, undefined)

const app = createExpressApp()
app.use(express.json())
app.head('/', (req, res) => res.status(200).end())
app.post('/_api', (req, res) => {
  apiServer.handle(req, res, req.body)
})
app.use('/json-forms', express.static(join(__dirname, 'frontend/json-forms')))
app.use(express.static(join(__dirname, 'frontend/ui')))
app.use((req, res) => res.sendFile(join(__dirname, 'frontend/ui/index.html')))

const PORT = Number(process.env.ATEK_ASSIGNED_PORT)
app.listen(PORT, () => console.log('Lonestar listening on', PORT))