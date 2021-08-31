import { AtekRpcClient } from '@atek-cloud/node-rpc';
export const ID = "atek.cloud/services-api";
export const REVISION = undefined;
export default class ServicesApiClient extends AtekRpcClient {
    constructor() {
        super("atek.cloud/services-api");
    }
    list() {
        return this.$rpc("list", []);
    }
    get(id) {
        return this.$rpc("get", [id]);
    }
    install(opts) {
        return this.$rpc("install", [opts]);
    }
    uninstall(id) {
        return this.$rpc("uninstall", [id]);
    }
    configure(id, opts) {
        return this.$rpc("configure", [id, opts]);
    }
    start(id) {
        return this.$rpc("start", [id]);
    }
    stop(id) {
        return this.$rpc("stop", [id]);
    }
    restart(id) {
        return this.$rpc("restart", [id]);
    }
    checkForPackageUpdates(id) {
        return this.$rpc("checkForPackageUpdates", [id]);
    }
    updatePackage(id) {
        return this.$rpc("updatePackage", [id]);
    }
    subscribe(id) {
        return this.$subscribe([id]);
    }
}
export var StatusEnum;
(function (StatusEnum) {
    StatusEnum["inactive"] = "inactive";
    StatusEnum["active"] = "active";
})(StatusEnum || (StatusEnum = {}));
export var SourceTypeEnum;
(function (SourceTypeEnum) {
    SourceTypeEnum["file"] = "file";
    SourceTypeEnum["git"] = "git";
})(SourceTypeEnum || (SourceTypeEnum = {}));
