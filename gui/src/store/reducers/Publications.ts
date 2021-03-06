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

import { find, chain, isEqual } from "lodash";
import { PUBLICATIONS_LOADED, PUBLICATIONS_LOADING } from "store/actions/Actions";
import { IPublication } from "interfaces/Publication";
import { handleAction, combineReducers, combine } from "store/reducers/CombineReducers";
import { PUBLICATIONS_LOADING_ERROR } from "store/actions/Actions";
import { IPublicationsMap, IPublicationsState } from "store/interfaces/State";
import { DEFAULT_LANGUAGE } from "services/common/LocalizationService";
import { DEFAULT_UNKNOWN_PRODUCT_FAMILY_TITLE, DEFAULT_UNKNOWN_PRODUCT_RELEASE_VERSION } from "models/Publications";
import { IPublicationsListPropsParams } from "@sdl/dd/PublicationsList/PublicationsListPresentation";
import { IState } from "store/interfaces/State";
import Version from "utils/Version";
import { String } from "utils/String";

const buildMap = (currentMap: IPublicationsMap, publications: IPublication[]) => {
    return Object.assign({}, currentMap, ...publications.map(publication => ({ [publication.id]: publication })));
};

export const notFound = (id: string): IPublication => ({
    id,
    title: "",
    logicalId: "",
    version: "",
    createdOn: new Date(2000, 1, 1)
});

const byId = handleAction(
    PUBLICATIONS_LOADED,
    (state: IPublicationsMap, payload: IPublication[]): IPublicationsMap => buildMap(state, payload),
    {}
);

const isLoading = combine(
    handleAction(PUBLICATIONS_LOADING, () => true, false),
    handleAction(PUBLICATIONS_LOADED, () => false, false),
    handleAction(PUBLICATIONS_LOADING_ERROR, () => false, false)
);

const lastError = combine(
    handleAction(PUBLICATIONS_LOADING_ERROR, (state, message: string) => message, ""),
    handleAction(PUBLICATIONS_LOADED, () => "", "")
);

export const publications = combineReducers({
    byId,
    isLoading,
    lastError
});

// Selectors
const normalizeVersionHack = (prop: string, obj: {}): string | string[] => {
    // tslint:disable-next-line:no-any
    let value = (obj as any)[prop];
    switch (prop) {
        case "productReleaseVersion":
            return Array.isArray(value)
                ? value.map(Version.normalizeReleaseVersion)
                : Version.normalizeReleaseVersion(value);
        case "productFamily":
            return Array.isArray(value)
                ? value.map(Version.normalizeProductFamily)
                : Version.normalizeProductFamily(value);
        default:
            return value;
    }
};

const normalizeValue = (value: string, defaultLabel: string): string | null => {
    return String.normalize(value) === String.normalize(defaultLabel) ? null : value;
};

/**
 * Returns lisf of publicaions that are in state.
 * You can filter list of publications that  you need for different usecases
 * Example: getPubList(state, {
 *  language: "en",
 *  productFamily: ["Kupchino"]
 *  "!id": "myId"
 * });
 * @param state
 * @param filter
 */
export const getPubList = (state: IPublicationsState, filter: {} = {}): IPublication[] => {
    const keys = Object.keys(filter);
    return Object.values(state.byId).filter(publication => {
        return keys.every(propName => {
            let isExcludeCondition = false;
            if (propName[0] == "!") {
                isExcludeCondition = true;
                propName = propName.substr(1);
            }

            if (propName in publication === false) {
                console.warn(`There is no property ${propName} in`, publication);
            }

            const filterValue = normalizeVersionHack(propName, filter);
            const publicationValue = normalizeVersionHack(propName, publication);
            if (Array.isArray(publicationValue)) {
                if (Array.isArray(filterValue)) {
                    return filterValue.every(fv => {
                        const includesValue = publicationValue.includes(fv);
                        return isExcludeCondition ? !includesValue : includesValue;
                    });
                } else {
                    const includesValue = publicationValue.includes(filterValue);
                    return isExcludeCondition ? !includesValue : includesValue;
                }
            } else if (Array.isArray(filterValue)) {
                return filterValue.every(fv => {
                    const includesValue = fv === publicationValue;
                    return isExcludeCondition ? !includesValue : includesValue;
                });
            }
            return isExcludeCondition ? filterValue !== publicationValue : filterValue === publicationValue;
        });
    });
};
export const getPubById = (state: IPublicationsState, id: string): IPublication =>
    id in state.byId ? state.byId[id] : notFound(id);

export const getPubsByLang = (state: IPublicationsState, language: string) => getPubList(state, { language });

export const getPubForLang = (state: IPublicationsState, publication: IPublication, language: string) => {
    return (
        getPubList(state, {
            "!id": publication.id,
            language,
            versionRef: publication.versionRef,
            productReleaseVersion: publication.productReleaseVersion
        })[0] || notFound(publication.id)
    );
};

export const getPubListRepresentatives = (state: IState, filter: {}): (IPublication | undefined)[] => {
    // Groups publications by versionRef
    // find one we need by language or fallback language
    return chain(getPubList(state.publications, filter))
        .groupBy("versionRef")
        .values()
        .flatMap(
            (pubsByRef: IPublication[]) =>
                find(pubsByRef, { language: state.language }) || find(pubsByRef, { language: DEFAULT_LANGUAGE })
        )
        .value()
        .filter(publiction => publiction !== undefined);
};

export const isLoadnig = (state: IPublicationsState): boolean => state.isLoading;
export const getLastError = (state: IPublicationsState): string => state.lastError;

export const normalizeProductFamily = (params: IPublicationsListPropsParams): string | null =>
    normalizeValue(params.productFamily, DEFAULT_UNKNOWN_PRODUCT_FAMILY_TITLE);

export const normalizeProductReleaseVersion = (params: IPublicationsListPropsParams | string): string | null => {
    const value = typeof params === "string" ? params : params.productReleaseVersion || "";
    return normalizeValue(value, DEFAULT_UNKNOWN_PRODUCT_RELEASE_VERSION);
};

export const isPublicationFound = (state: IPublicationsState, publicationId: string): boolean =>
    !isEqual(getPubById(state, publicationId), notFound(publicationId));
