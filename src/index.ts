import createExpressApp, * as express from 'express'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { createRpcServer } from '@atek-cloud/node-rpc'
import adb from '@atek-cloud/adb-api'
import services from '@atek-cloud/services-api'

const __dirname = join(dirname(fileURLToPath(import.meta.url)), '..')

const apiServer = createRpcServer({

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

  adb_getConfig: () => adb.api.getConfig(),
  adb_dbList: () => adb.api.dbList(),

  adb_dbDescribe: (dbId) => adb.api.dbDescribe(dbId),
  adb_tblDefine: (dbId, tableId, desc) => adb.api.tblDefine(dbId, tableId, desc),
  adb_tblList: (dbId, tableId, opts) => adb.api.tblList(dbId, tableId, opts),
  adb_tblGet: (dbId, tableId, key) => adb.api.tblGet(dbId, tableId, key),
  adb_tblCreate: (dbId, tableId, value, blobs) => adb.api.tblCreate(dbId, tableId, value, blobs),
  adb_tblPut: (dbId, tableId, key, value) => adb.api.tblPut(dbId, tableId, key, value),
  adb_tblDelete: (dbId, tableId, key) => adb.api.tblDelete(dbId, tableId, key)
})

const app = createExpressApp()
app.use(express.json())
app.head('/', (req, res) => res.status(200).end())
app.post('/_api', (req, res) => {
  apiServer.handle(req, res, req.body)
})
app.use('/json-forms', express.static(join(__dirname, 'frontend/json-forms')))
app.use(express.static(join(__dirname, 'frontend/ui')))
app.use((req, res) => res.sendFile(join(__dirname, 'frontend/ui/index.html')))

const SOCKETFILE = process.env.ATEK_ASSIGNED_SOCKET_FILE
app.listen(SOCKETFILE, () => console.log('Lonestar listening on', SOCKETFILE))