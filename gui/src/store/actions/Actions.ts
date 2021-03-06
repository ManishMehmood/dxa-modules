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

import { createAction, Action } from "redux-actions";
import { IConditionMap } from "store/interfaces/Conditions";
import { IPublication } from "interfaces/Publication";

export { Action };

export const CHANGE_LANGUAGE = "CHANGE_LANGUAGE";
export const PAGE_ERROR = "PAGE_ERROR";
export const PAGE_LOADED = "PAGE_LOADED";
export const PAGE_LOADING = "PAGE_LOADING";

export const UPDATE_CURRENT_LOCATION = "UPDATE_CURRENT_LOCATION";

export const PUBLICATIONS_LOADED = "PUBLICATIONS_LOADED";
export const PUBLICATIONS_LOADING = "PUBLICATIONS_LOADING";
export const PUBLICATIONS_LOADING_ERROR = "PUBLICATIONS_LOADING_ERROR";
export const RELEASE_VERSIONS_LOADING = "RELEASE_VERSIONS_LOADING";
export const RELEASE_VERSIONS_LOADED = "RELEASE_VERSIONS_LOADED";

export const PRODUCT_FAMILIES_LOADED = "PRODUCT_FAMILIES_LOADED";

export const DIALOG_REQUEST_OPEN = "DIALOG_REQUEST_OPEN";
export const DIALOG_REQUEST_CLOSE = "DIALOG_REQUEST_CLOSE";

export const CONDITIONS_LOADED = "CONDITIONS_LOADED";
export const CONDITIONS_LOADING = "CONDITIONS_LOADING";
export const CONDITIONS_ERROR = "CONDITIONS_ERROR";
export const CONDITIONS_APPLY = "CONDITIONS_APPLY";
export const CONDITIONS_EDITING_CHANGE = "[Conditions] Change data in conditions editiong dialog";

export const COMMENT_SAVING = "COMMENT_SAVING";
export const COMMENT_ERROR = "COMMENT_ERROR";
export const COMMENT_SAVED = "COMMENT_SAVED";
export const COMMENTS_LOADING = "COMMENTS_LOADING";
export const COMMENTS_LOADED = "COMMENTS_LOADED";
export const COMMENTS_ERROR = "COMMENTS_ERROR";

export const SPLITTER_POSITION_CHANGE = "SPLITTER_POSITION_CHANGE";

export const changeLanguage = createAction(CHANGE_LANGUAGE, (language: string) => language);
export const publicationsLoaded = createAction(PUBLICATIONS_LOADED, (publications: IPublication[]) => publications);
export const updateCurrentLocation = createAction(
    UPDATE_CURRENT_LOCATION,
    (publicationId: string, pageId: string, taxonomyId: string, anchor: string) => ({
        publicationId,
        pageId,
        taxonomyId,
        anchor
    })
);

export const dialogOpen = createAction(DIALOG_REQUEST_OPEN);
export const dialogClose = createAction(DIALOG_REQUEST_CLOSE);
export const updateEditingConditions = createAction(
    CONDITIONS_EDITING_CHANGE,
    (conditions: IConditionMap) => conditions
);

export const applyConditions = createAction(CONDITIONS_APPLY, (pubId: string, conditions: IConditionMap) => ({
    pubId,
    conditions
}));

export const splitterPositionChange = createAction(SPLITTER_POSITION_CHANGE, (positionX: number) => positionX);
