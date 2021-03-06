/**
 *
 *  Copyright (c) 2014 All Rights Reserved by the SDL Group.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

/**
 * Header
 *
 * @export
 * @interface IHeader
 */
export interface IHeader {
    /**
     * Header title
     *
     * @type {string}
     * @memberOf IHeader
     */
    title: string;
    /**
     * Unique id
     *
     * @type {string}
     * @memberOf IHeader
     */
    id: string;
    /**
     * Header element
     *
     * @type {HTMLElement}
     * @memberOf IHeader
     */
    element?: HTMLElement;

    /**
     * Header importancy
     *
     * @type {number}
     * @memberOf IHeader
     */
    importancy: number;
}

/**
 * Selector for header elements
 */
const HEADER_SELECTOR = "h1, h2, h3";

/**
 * Html utilities
 *
 * @export
 * @class Html
 */
export class Html {

    /**
     * Get header links. Get's all h1, h2 and 3 headers.
     *
     * @static
     * @param {HTMLElement} element Source element to search in
     * @param {boolean} [includeElement=false] Include the element reference inside the output
     * @returns {IHeader[]}
     *
     * @memberOf Html
     */
    public static getHeaderLinks(element: HTMLElement, includeElement: boolean = false): IHeader[] {
        const headers = element.querySelectorAll(HEADER_SELECTOR);

        let navItems: IHeader[] = [];
        for (let i: number = 0, length: number = headers.length; i < length; i++) {
            const header = headers.item(i) as HTMLElement;
            const title = header.textContent || "";
            let id = encodeURIComponent(title.toLowerCase());
            let originalUrl = id;
            let timesFound = 0;
            while (Html._isHeaderAlreadyAdded(navItems, id)) {
                timesFound++;
                id = originalUrl + `_${timesFound}`;
            }
            const item: IHeader = {
                title: title,
                importancy: Number(header.tagName.replace(/h/i, "")) || 0,
                id: id
            };
            if (includeElement) {
                item.element = header;
            }
            navItems.push(item);
        }

        return navItems;
    }

    /**
     * Get the header element for an anchor
     *
     * @static
     * @param {HTMLElement} element Source element to search in
     * @param {string} anchorId Anchor id
     * @returns {(HTMLElement | undefined)}
     *
     * @memberOf Html
     */
    public static getHeaderElement(element: HTMLElement, anchorId: string): HTMLElement | undefined {
        const headers = Html.getHeaderLinks(element, true);
        for (let header of headers) {
            if (header.id === anchorId) {
                return header.element;
            }
        }
        return undefined;
    }

    /**
     * Get the info for a panel which should stick to the top and uses the amount of verticle space available.
     *
     * @static
     * @param {number} scrollTop Scroll top offset
     * @param {number} offsetTop Offset on the top. For example a header
     * @param {number} fixedHeaderHeight Height of the header on top which is using a fixed position
     * @param {number} [margins=0] Is removed from the maximum height. Use this to indicate there is empty space at the top and/or bottom of the panel.
     * @returns {{ sticksToTop: boolean; maxHeight: string; }}
     *
     * @memberOf Html
     */
    public static getFixedPanelInfo(scrollTop: number, offsetTop: number, fixedHeaderHeight: number, margins: number = 0): { sticksToTop: boolean; maxHeight: string; } {
        const viewPortHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        const sticksToTop = scrollTop > offsetTop;
        let maxHeight: string;
        if (sticksToTop) {
            maxHeight = (viewPortHeight - fixedHeaderHeight - margins) + "px";
        } else {
            maxHeight = (viewPortHeight - offsetTop - fixedHeaderHeight - margins + scrollTop) + "px";
        }
        return { sticksToTop, maxHeight };
    }

    /**
     * Get the active header in the document
     *
     * @static
     * @param {HTMLElement} scrollContainer Element which is used for scrolling
     * @param {HTMLElement} element Source element to search in
     * @param {number} offsetTop Offset on the top. For example a header
     * @returns {(IHeader | undefined)}
     *
     * @memberOf Html
     */
    public static getActiveHeader(scrollContainer: HTMLElement, element: HTMLElement, offsetTop: number): IHeader | undefined {
        // In IE scrollTop is always 0
        const top = (scrollContainer.scrollTop || document.documentElement.scrollTop || document.body.scrollTop || 0) - 10;
        const headers = element.querySelectorAll(HEADER_SELECTOR);
        for (let i = 0, length = headers.length; i < length; i++) {
            const headerEl = <HTMLElement>headers.item(i);
            if ((headerEl.offsetTop + offsetTop) >= top) {
                const headerLinks = Html.getHeaderLinks(element, true);
                const matchingHeaders = headerLinks.filter(item => item.element === headerEl);
                if (matchingHeaders.length > 0) {
                    return matchingHeaders[0];
                }
            }
        }
        return undefined;
    }

    /**
     * Scroll element into view
     *
     * @static
     * @param {HTMLElement} scrollContainer Element which is used for scrolling
     * @param {HTMLElement} element Element which should be in view
     * @param {} options
     *      - force {boolean} scroll to top of element even if you are in this element already
     *
     * @memberOf Html
     */
    public static scrollIntoView(scrollContainer: HTMLElement, element: HTMLElement, options?: { force?: boolean }): void {
        // In IE scrollTop is always 0
        const scrollTop = scrollContainer.scrollTop || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const offsetTop = element.offsetTop;

        // merge with default options
        const mergedOptions = Object.assign({
            force: false
        }, options);

        // Scroll when the element is out of view
        if (mergedOptions.force || offsetTop > (scrollContainer.clientHeight + scrollTop) // Below
            || offsetTop < scrollTop) { // Above
            let failedToScroll: boolean;

            scrollContainer.scrollTop = offsetTop;
            failedToScroll = scrollContainer.scrollTop !== offsetTop;

            if (failedToScroll) {
                document.documentElement.scrollTop = offsetTop;
            }
            failedToScroll = failedToScroll && document.documentElement.scrollTop !== offsetTop;

            if (failedToScroll) {
                document.body.scrollTop = offsetTop;
            }
            failedToScroll = failedToScroll && document.body.scrollTop !== offsetTop;

            if (failedToScroll) {
                window.scroll(0, offsetTop);
            }
        }
    }

    private static _isHeaderAlreadyAdded(navItems: IHeader[], id: string): boolean {
        return navItems.filter(item => item.id === id).length === 1;
    }
}
