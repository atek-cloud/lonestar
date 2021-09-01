import { AtekRpcClient } from '@atek-cloud/node-rpc';
export const ID = "atek.cloud/adb-ctrl-api";
export const REVISION = undefined;
export default class AdbCtrlApiClient extends AtekRpcClient {
    constructor() {
        super("atek.cloud/adb-ctrl-api");
    }
    init(config) {
        return this.$rpc("init", [config]);
    }
    getConfig() {
        return this.$rpc("getConfig", []);
    }
    createDb(opts) {
        return this.$rpc("createDb", [opts]);
    }
    getOrCreateDb(alias, opts) {
        return this.$rpc("getOrCreateDb", [alias, opts]);
    }
    configureDb(dbId, config) {
        return this.$rpc("configureDb", [dbId, config]);
    }
    getDbConfig(dbId) {
        return this.$rpc("getDbConfig", [dbId]);
    }
    listDbs() {
        return this.$rpc("listDbs", []);
    }
}
export var DbInternalType;
(function (DbInternalType) {
    DbInternalType["HYPERBEE"] = "hyperbee";
})(DbInternalType || (DbInternalType = {}));
