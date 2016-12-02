import { BatchResult } from "../models";

export interface ListProxyEntity {
    list: Function;

    /**
     * ListNext funtion of the batch-client if applicable(Some list return everything at once)
     */
    listNext?: Function;
}

/**
 * List proxy, handle continuation tokens
 */
export class ListProxy {
    private nextLink: string;
    private items: any[];

    private reachEnd = false;
    private currentPromise: Promise<BatchResult> = null;

    constructor(private entity: ListProxyEntity, private params: any[], private options: any) {
        this.nextLink = null;
        this.items = [];
        this.params = this.params || [];
    }

    public hasMoreItems(): boolean {
        return !this.reachEnd;
    }

    public fetchNext(id: string): Promise<BatchResult> {
        console.log("Fetching next");
        if (this.currentPromise) {
            console.log("Current promise");
            return this.currentPromise;
        } else if (!this.hasMoreItems()) {
            console.log("No more items");
            return Promise.resolve({
                data: [],
            });
        } else {
            console.log("More items");

            if (this.nextLink) {
                this.currentPromise = this._listNext();
            } else {
                this.currentPromise = this._list();
            }
            this.currentPromise.then(() => {
                this.currentPromise = null;
            });
            this.currentPromise.catch(() => {
                this.currentPromise = null;
            });
            return this.currentPromise;
        }
    }

    public clone(): ListProxy {
        const clone = new ListProxy(this.entity, this.params, this.options);
        clone.nextLink = this.nextLink;
        clone.items = this.items;
        clone.reachEnd = this.reachEnd;
        clone.currentPromise = this.currentPromise;
        return clone;
    }

    private _list(): Promise<BatchResult> {
        return new Promise((resolve, reject) => {
            this.entity.list(...this.params, this.options, (error, result) => {
                this._processResult(result, error, resolve, reject);
            });
        });
    }

    private _listNext(): Promise<BatchResult> {
        return new Promise((resolve, reject) => {
            this.entity.listNext(this.nextLink, (error, result) => {
                this._processResult(result, error, resolve, reject);
            });
        });
    }

    private _processResult(result, error, resolve, reject) {
        if (error) {
            reject(error);
        }

        if (result) {
            this.nextLink = result.odatanextLink;
            if (!this.nextLink || !this.fetchNext) {
                this.reachEnd = true;
            }

            this.items.concat(result);

            /**
             * Check for result.value as MPI subtasks return { value: [] }
             */
            resolve({
                data: Array.isArray(result) ? result : result.value,
            });
        }
    }
}
