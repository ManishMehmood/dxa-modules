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

import * as ServerModels from "interfaces/ServerModels";
import { IPublication } from "interfaces/Publication";
import { IProductFamily } from "interfaces/ProductFamily";
import { IProductReleaseVersion } from "interfaces/ProductReleaseVersion";
import { Api } from "utils/Api";
import { Net, IWebRequest, LoadableObject } from "@sdl/models";
import { localization } from "services/common/LocalizationService";
import { String } from "utils/String";
import Version from "utils/Version";

export const DEFAULT_UNKNOWN_PRODUCT_FAMILY_TITLE: string = "Unknown product";
export const DEFAULT_UNKNOWN_PRODUCT_RELEASE_VERSION: string = "Unknown product release version";

/**
 * Publications model
 *
 * @export
 * @class Publications
 * @extends {LoadableObject}
 */
export class Publications extends LoadableObject {
    private _publications: IPublication[];
    private _productFamilies?: IProductFamily[];
    private _unknownProductFamilyDescription: string = localization.formatMessage(
        "productfamilies.unknown.description"
    );
    private _unknownProductFamilyTitle: string = DEFAULT_UNKNOWN_PRODUCT_FAMILY_TITLE;
    private _unknownProductReleaseVersion: string = DEFAULT_UNKNOWN_PRODUCT_RELEASE_VERSION;

    /**
     * Get the Publications
     *
     * @param {string} [productFamily] productFamily title
     * @param {string} [productReleaseVersion] product release version title
     * @returns {IPublication[]}
     */
    public getPublications(productFamily?: string, productReleaseVersion?: string): IPublication[] {
        let result: IPublication[] = this._publications.slice();

        if (productFamily) {
            const normalizedProductFamily = String.normalize(productFamily);
            const familyTitle =
                normalizedProductFamily === String.normalize(this._unknownProductFamilyTitle)
                    ? undefined
                    : normalizedProductFamily;
            result = result.filter((publication: IPublication) => {
                if (!familyTitle) {
                    return !publication.productFamily;
                }
                return (
                    Array.isArray(publication.productFamily) &&
                    publication.productFamily.map(Version.normalizeProductFamily).includes(familyTitle)
                );
            });
        }

        if (productReleaseVersion) {
            const normalizedProductReleaseVersion = String.normalize(productReleaseVersion);
            const productReleaseVersionTitle =
                normalizedProductReleaseVersion === String.normalize(this._unknownProductReleaseVersion)
                    ? undefined
                    : normalizedProductReleaseVersion;
            result = result.filter((publication: IPublication) => {
                if (!productReleaseVersionTitle) {
                    return !publication.productReleaseVersion;
                }
                return (
                    Array.isArray(publication.productReleaseVersion) &&
                    publication.productReleaseVersion
                        .map(Version.normalizeReleaseVersion)
                        .includes(productReleaseVersionTitle)
                );
            });
        }

        return result;
    }

    /**
     * Get the Product Release Versions for Product Family
     *
     * @param {string} productFamily productFamily title
     * @returns {IProductReleaseVersion[]}
     */
    public getProductReleaseVersions(productFamily: string): IProductReleaseVersion[] {
        const publicationsList = this.getPublications(productFamily);
        return Version.sortProductReleaseVersions(publicationsList).map(version =>
            this._convertToProductReleaseVersion(version)
        );
    }

    /**
     * Get the Product Release Versions for a publication
     *
     * @param {string} publicationId Publication id
     * @returns {IProductReleaseVersion[]}
     */
    public getProductReleaseVersionsByPublicationId(publicationId: string): IProductReleaseVersion[] | undefined {
        const publicationsList = this.getPublications().filter(pub => pub.id === publicationId);
        const publication = publicationsList[0];
        if (publication) {
            const publicationVersionsList = this.getPublications().filter(
                pub => pub.logicalId === publication.logicalId
            );
            return Version.sortProductReleaseVersions(publicationVersionsList).map(version =>
                this._convertToProductReleaseVersion(version)
            );
        }
        return undefined;
    }

    /**
     * Get product families
     *
     * @returns {IProductFamily[]}
     */
    public getProductFamilies(): IProductFamily[] {
        if (!this._productFamilies) {
            const publications = this.getPublications();
            if (publications) {
                // Implementing sort
                this._productFamilies = Version.sortProductFamilyVersions(publications).map(family =>
                    this._convertToProductFamily(family)
                );
            }
        }
        return this._productFamilies || [];
    }

    /* Overloads */
    protected _executeLoad(reload: boolean): void {
        const url = Api.getPublicationsUrl();
        Net.getRequest(url, this.getDelegate(this._onLoad), this.getDelegate(this._onLoadFailed));
    }

    protected _processLoadResult(result: string, webRequest: IWebRequest): void {
        this._publications = (JSON.parse(result) as ServerModels.IPublication[]).map(
            (item: ServerModels.IPublication) => {
                return {
                    id: item.Id,
                    title: item.Title,
                    productFamily: item.ProductFamily,
                    productReleaseVersion: item.ProductReleaseVersion,
                    versionRef: item.VersionRef,
                    language: item.Language,
                    createdOn: new Date(item.CreatedOn),
                    version: item.Version,
                    logicalId: item.LogicalId
                } as IPublication;
            }
        );

        this._productFamilies = undefined;

        super._processLoadResult(result, webRequest);
    }

    private _convertToProductReleaseVersion(version: string | null): IProductReleaseVersion {
        if (version === null) {
            return {
                title: DEFAULT_UNKNOWN_PRODUCT_RELEASE_VERSION,
                value: String.normalize(DEFAULT_UNKNOWN_PRODUCT_RELEASE_VERSION),
                hasWarning: true
            };
        }
        return {
            title: version,
            value: String.normalize(version)
        };
    }

    private _convertToProductFamily(family: string | null): IProductFamily {
        if (family === null) {
            return {
                title: this._unknownProductFamilyTitle,
                description: this._unknownProductFamilyDescription,
                hasWarning: true
            };
        } else {
            return {
                title: family
            };
        }
    }
}
