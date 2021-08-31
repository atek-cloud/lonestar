import createExpressApp, * as express from 'express'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { AtekRpcServer } from '@atek-cloud/node-rpc'
import ServicesApiClient from './gen/atek.cloud/services-api.js'

const __dirname = join(dirname(fileURLToPath(import.meta.url)), '..')

// TODO auth

const services = new ServicesApiClient()
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
  services_configure: (id, updates) => services.configure(id, updates)
}, undefined, undefined)

const app = createExpressApp()
app.use(express.json())
app.head('/', (req, res) => res.status(200).end())
app.post('/_api', (req, res) => {
  apiServer.handle(req, res, req.body)
})
app.use(express.static(join(__dirname, 'frontend/ui')))
app.use((req, res) => res.sendFile(join(__dirname, 'frontend/ui/index.html')))

const PORT = Number(process.env.ATEK_ASSIGNED_PORT)
app.listen(PORT, () => console.log('Lonestar listening on', PORT))