import { AtekRpcClient } from '@atek-cloud/node-rpc';
export const ID = "atek.cloud/adb-api";
export const REVISION = undefined;
export default class AdbApiClient extends AtekRpcClient {
    constructor() {
        super("atek.cloud/adb-api");
    }
    describe(dbId) {
        return this.$rpc("describe", [dbId]);
    }
    table(dbId, tableId, desc) {
        return this.$rpc("table", [dbId, tableId, desc]);
    }
    list(dbId, tableId, opts) {
        return this.$rpc("list", [dbId, tableId, opts]);
    }
    get(dbId, tableId, key) {
        return this.$rpc("get", [dbId, tableId, key]);
    }
    create(dbId, tableId, value, blobs) {
        return this.$rpc("create", [dbId, tableId, value, blobs]);
    }
    put(dbId, tableId, key, value) {
        return this.$rpc("put", [dbId, tableId, key, value]);
    }
    delete(dbId, tableId, key) {
        return this.$rpc("delete", [dbId, tableId, key]);
    }
    diff(dbId, opts) {
        return this.$rpc("diff", [dbId, opts]);
    }
    getBlob(dbId, tableId, key, blobName) {
        return this.$rpc("getBlob", [dbId, tableId, key, blobName]);
    }
    putBlob(dbId, tableId, key, blobName, blobValue) {
        return this.$rpc("putBlob", [dbId, tableId, key, blobName, blobValue]);
    }
    delBlob(dbId, tableId, key, blobName) {
        return this.$rpc("delBlob", [dbId, tableId, key, blobName]);
    }
    subscribe(dbId, opts) {
        return this.$subscribe([dbId, opts]);
    }
}
