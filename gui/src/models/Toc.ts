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

import { isEmpty } from "lodash";
import { ISitemapItem } from "interfaces/ServerModels";
import { ITaxonomy } from "interfaces/Taxonomy";
import { Api, API_REQUEST_TYPE_FORM } from "utils/Api";
import { Net, IWebRequest, LoadableObject } from "@sdl/models";
import { IConditionMap, IPostConditions, IPostConditionRequest } from "store/interfaces/Conditions";

/**
 * Toc model, used for interacting with the server and doing basic operations on the model itself.
 *
 * @export
 * @class Toc
 * @extends {LoadableObject}
 */
export class Toc extends LoadableObject {

    private _publicationId: string;
    private _parentId: string;
    private _conditions: IConditionMap;
    private _sitemapItems: ITaxonomy[];
    private _preLoaded: boolean = false;

    /**
     * Creates an instance of Toc.
     *
     * @param {string} publicationId Publication id
     * @param {string} parentId Parent sitemap item id, for the root item pass "root" as the parent id.
     * @param {ITaxonomy[]} items Create a toc model which has the data prefetched.
     */
    constructor(publicationId: string, parentId: string, conditions: IConditionMap, items?: ITaxonomy[]) {
        super();
        this._publicationId = publicationId;
        this._parentId = parentId;
        this._conditions = conditions;

        if (items) {
            this._sitemapItems = items;
            this._preLoaded = true;
        }
    }

    /**
     * Get the site map items
     *
     * @returns {ITaxonomy[]}
     */
    public getSitemapItems(): ITaxonomy[] {
        return this._sitemapItems;
    }

    /* Overloads */
    protected _executeLoad(reload: boolean): void {
        if (this._preLoaded) {
            // Reset preloaded state, on the second load it should use build in caching mechanism of loadable object
            // This is only needed to prevent the initial http request to be executed
            this._preLoaded = false;
            this._setLoaded();
        } else {
            const url = Api.getTocItemsUrl(this._publicationId, this._parentId);
            let postConditions: IPostConditions = {};
            for (let key in this._conditions) {
                if (this._conditions.hasOwnProperty(key)) {
                    postConditions[key] = this._conditions[key].values;
                }
            }
            const postBody: IPostConditionRequest = { publicationId: +this._publicationId, userConditions: postConditions };
            const body = `conditions=${JSON.stringify(postBody)}`;
            isEmpty(this._conditions)
                ? Net.getRequest(url, this.getDelegate(this._onLoad), this.getDelegate(this._onLoadFailed))
                : Net.postRequest(url, body, API_REQUEST_TYPE_FORM, this.getDelegate(this._onLoad), this.getDelegate(this._onLoadFailed));
        }
    }

    protected _processLoadResult(result: string, webRequest: IWebRequest): void {
        this._sitemapItems = (JSON.parse(result) as ISitemapItem[]).map((item: ISitemapItem) => {
            return {
                id: item.Id,
                title: item.Title,
                url: item.Url,
                hasChildNodes: item.HasChildNodes
            } as ITaxonomy;
        });

        super._processLoadResult(result, webRequest);
    }
}
