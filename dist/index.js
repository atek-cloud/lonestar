import createExpressApp, * as express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createRpcServer } from '@atek-cloud/node-rpc';
import adb from '@atek-cloud/adb-api';
import services from '@atek-cloud/services-api';
const __dirname = join(dirname(fileURLToPath(import.meta.url)), '..');
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
    async adb_adminListDbsByOwningUser(userKey) {
        const res = await adb.api.adminListDbsByOwningUser(userKey || this.req.headers['atek-auth-user']);
        return res;
    },
    adb_dbDescribe: (dbId) => adb.api.dbDescribe(dbId),
    adb_recordList: (dbId, path, opts) => adb.api.recordList(dbId, path, opts),
    adb_recordGet: (dbId, path) => adb.api.recordGet(dbId, path),
    adb_recordPut: (dbId, path, value) => adb.api.recordPut(dbId, path, value),
    adb_recordDelete: (dbId, path) => adb.api.recordDelete(dbId, path),
});
const app = createExpressApp();
app.use(express.json());
app.head('/', (req, res) => res.status(200).end());
app.post('/_api', (req, res) => {
    apiServer.handle(req, res, req.body);
});
app.use(express.static(join(__dirname, 'frontend/ui')));
app.use((req, res) => res.sendFile(join(__dirname, 'frontend/ui/index.html')));
const SOCKETFILE = process.env.ATEK_ASSIGNED_SOCKET_FILE;
app.listen(SOCKETFILE, () => console.log('Lonestar listening on', SOCKETFILE));
