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

import { ISearchService } from "services/interfaces/SearchService";
import { ISearchQuery, ISearchQueryResults } from "interfaces/Search";

import { Search } from "models/Search";
import { Promise } from "es6-promise";
import { MD5 } from "object-hash";

/**
 * Search service, interacts with the models to fetch the required data.
 *
 * @export
 * @class SearchService
 * @implements {ISearchService}
 */
export class SearchService implements ISearchService {

    /**
     * Search model
     *
     * @private
     * @static
     * @type {{ [publicationId: string]: { [searchQuery: string]: Search } }}
     */
    protected static SearchModel:
    { [key: string]: Search } = {};

    /**
     * Get search results
     *
     * @param {ISearchQuery} query Search query
     * @returns {Promise<ISearchQueryResults>} Promise to return Items
     *
     * @memberOf DataStoreClient
     */
    public getSearchResults(query: ISearchQuery): Promise<ISearchQueryResults> {
        const search = this.getSearchModel(query);

        return new Promise((resolve: (items?: ISearchQueryResults) => void, reject: (error: string | null) => void) => {
            let removeEventListeners: () => void;
            const onLoad = () => {
                removeEventListeners();
                resolve(search.getSeachResults());
            };
            const onLoadFailed = (event: Event & { data: { error: string } }) => {
                removeEventListeners();
                reject(event.data.error);
            };
            removeEventListeners = (): void => {
                search.removeEventListener("load", onLoad);
                search.removeEventListener("loadfailed", onLoadFailed);
            };

            search.addEventListener("load", onLoad);
            search.addEventListener("loadfailed", onLoadFailed);
            search.load(true);
        });
    }

    private getSearchModel(query: ISearchQuery): Search {
        if (!SearchService.SearchModel) {
            SearchService.SearchModel = {};
        }
        const key = this._getKey(query);
        if (!SearchService.SearchModel[key]) {
            SearchService.SearchModel[key] = new Search(query);
        }
        return SearchService.SearchModel[key] as Search;
    }

    private _getKey(query: ISearchQuery): string {
        return [query.publicationId,
        query.locale,
        MD5(query.searchQuery),
        query.startIndex].join("::");
    }
}
