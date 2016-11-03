import { IRouting, IPublicationLocation } from "../../interfaces/Routing";

/**
 * Routing related functionality
 *
 * @export
 * @class Routing
 */
export class RoutingServer implements IRouting {

    private _root: string = "/";

    /**
     * Use this hook to be notified on location changes
     *
     * @param {() => void} handler Handler which will be triggered upon a location change.
     */
    public onLocationChanged(handler: () => void): void {
        throw new Error(`Should not be used on a server side environment.`);
    }

    /**
     * Get the absolute path
     *
     * @param {string} path Path
     * @returns {string}
     */
    public getAbsolutePath(path: string): string {
        return this._root + path;
    }

    /**
     * Set publication location
     *
     * @param {string} publicationId Publication id
     * @param {string} publicationTitle Publication title
     * @param {string} [pageId] Page id
     * @param {string} [pageTitle] Page title
     */
    public setPublicationLocation(publicationId: string, publicationTitle: string,
        pageId?: string, pageTitle?: string): void {
        // TODO implement this
    }

    /**
     * Gets publication location path
     *
     * @param {string} publicationId Publication id
     * @param {string} publicationTitle Publication title
     * @param {string} [pageId] Page id
     * @param {string} [pageTitle] Page title
     *
     * @returns {string} Publication location path
     */
    public getPublicationLocationPath(publicationId: string, publicationTitle: string,
        pageId?: string, pageTitle?: string): string {
        // TODO implement this
        return "";
    }

    /**
     * Set page location
     *
     * @param {string} pageId Page id
     *
     * @memberOf IRouting
     */
    public setPageLocation(pageId: string): void {
        // TODO implement this
    }

    /**
     * Gets page location path
     *
     * @param {string} pageId Page id
     *
     * @memberOf IRouting
     * @returns {string | undefined} Page location path
     */
    public getPageLocationPath(pageId: string): string | undefined {
        // TODO implement this
        return undefined;
    }

    /**
     * Get the current location within a publication
     *
     * @returns {IPublicationLocation}
     */
    public getPublicationLocation(): IPublicationLocation {
        // TODO implement this
        return {
            publicationId: "",
            pageId: ""
        };
    }

    /**
     * gets the history
     *
     *
     * @memberOf IRouting
     * @returns {HistoryModule.History} The browser history object
     */
    public getHistory(): HistoryModule.History {
        throw new Error(`Should not be used on a server side environment.`);
    }
}

export let routing = new RoutingServer();
