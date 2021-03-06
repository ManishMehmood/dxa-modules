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

import { IPublicationService } from "services/interfaces/PublicationService";
import { IPublication } from "interfaces/Publication";
import { IProductFamily } from "interfaces/ProductFamily";
import { IProductReleaseVersion } from "interfaces/ProductReleaseVersion";
import { Promise } from "es6-promise";
import { IConditionMap } from "store/interfaces/Conditions";

/**
 * Publication Service for the server.
 *
 * @export
 * @class PublicationService
 * @implements {IPublicationService}
 */
export class PublicationService implements IPublicationService {

    private _mockDataPublications: {
        error: string | null;
        publications: IPublication[];
        productFamilies: IProductFamily[];
        productReleaseVersions: IProductReleaseVersion[];
    } = {
        error: null,
        publications: [],
        productFamilies: [],
        productReleaseVersions: []
    };

    private _mockDataPublication: {
        error: string | null,
        title: string | undefined
    } = {
        error: null,
        title: "MP330"
    };

    private _mockDataConditions: {
        values: IConditionMap;
        error: string | null
    } = {
        values: {},
        error: null
    };

    /**
     * Get the list of publications
     *
     * @param {string} [productFamily] productFamily title
     * @param {string} [productReleaseVersion] product release version title
     * @returns {Promise<IPublication[]>} promise to return the items
     *
     * @memberOf DataStoreServer
     */
    public getPublications(productFamily?: string, productReleaseVersion?: string): Promise<IPublication[]> {
        const { error, publications } = this._mockDataPublications;
        if (error) {
            return Promise.reject(error);
        } else {
            return Promise.resolve(publications);
        }
    }

    /**
     * Get the list of publications product families
     *
     * @returns {Promise<ProductFamily[]>} promise to return the items
     *
     * @memberOf DataStoreServer
     */
    public getProductFamilies(): Promise<IProductFamily[]> {
        const { error, productFamilies } = this._mockDataPublications;
        if (error) {
            return Promise.reject(error);
        } else {
            return Promise.resolve(productFamilies);
        }
    }

    /**
     * Get the list of product release versions for a product ProductFamily
     * Are sorted by release time (latest to oldest)
     *
     * @param {string} productFamily Product family
     * @returns {Promise<IProductReleaseVersion[]>} Promise to return the product release versions
     *
     * @memberOf IPublicationService
     */
    public getProductReleaseVersions(productFamily: string): Promise<IProductReleaseVersion[]> {
        const { error, productReleaseVersions } = this._mockDataPublications;
        if (error) {
            return Promise.reject(error);
        } else {
            return Promise.resolve(productReleaseVersions);
        }
    }

    /**
     * Get the list of product release versions for a publication
     * Are sorted by release time (latest to oldest)
     *
     * @param {string} publicationId Publication id
     * @returns {Promise<IProductReleaseVersion[]>} Promise to return the product release versions
     *
     * @memberOf IPublicationService
     */
    public getProductReleaseVersionsByPublicationId(publicationId: string): Promise<IProductReleaseVersion[]> {
        const { error, productReleaseVersions } = this._mockDataPublications;
        if (error) {
            return Promise.reject(error);
        } else {
            return Promise.resolve(productReleaseVersions);
        }
    }

    /**
     * Get the publication by id
     *
     * @param {string} publicationId Publication id
     * @returns {Promise<IPublication>} Promise to return the publication
     *
     * @memberOf PublicationService
     */
    public getPublicationById(publicationId: string): Promise<IPublication> {
        const { error, title } = this._mockDataPublication;
        if (error) {
            return Promise.reject(error);
        } else {
            return Promise.resolve({ title } as IPublication);
        }
    }

    /**
     * Get conditions for a publication
     *
     * @param {string} publicationId
     * @returns {Promise<ICondition[]>}
     *
     * @memberof PublicationService
     */
    public getConditions(publicationId: string): Promise<IConditionMap> {
        const { error, values } = this._mockDataConditions;
        if (error) {
            return Promise.reject(error);
        } else {
            return Promise.resolve(values);
        }
    }
}
