import { createAction, Action } from "redux-actions";
import { IConditionMap } from "../interfaces/State";

export { Action }

export const CHANGE_LANGUAGE = "CHANGE_LANGUAGE";
export const PAGE_ERROR = "PAGE_ERROR";
export const PAGE_LOADED = "PAGE_LOADED";
export const PAGE_LOADING = "PAGE_LOADING";

export const UPDATE_CURRENT_PUBLICATION = "UPDATE_CURRENT_PUBLICATION";
export const PUBLICATIONS_LOADED = "PUBLICATIONS_LOADED";
export const PUBLICATIONS_LOADING = "PUBLICATIONS_LOADING";
export const PUBLICATIONS_LOADING_ERROR = "PUBLICATIONS_LOADING_ERROR";
export const RELEASE_VERSIONS_LOADING = "RELEASE_VERSIONS_LOADING";
export const RELEASE_VERSIONS_LOADED = "RELEASE_VERSIONS_LOADED";

export const DIALOG_REQUEST_OPEN = "DIALOG_REQUEST_OPEN";
export const DIALOG_REQUEST_CLOSE = "DIALOG_REQUEST_CLOSE";

export const CONDITIONES_LOADED = "CONDITIONES_LOADED";
export const CONDITIONES_LOADING = "CONDITIONES_LOADING";
export const CONDITIONES_ERROR = "CONDITIONES_ERROR";
export const CONDITIONES_PUB_SAVE = "CONDITIONES_PUB_SAVE";

export const changeLanguage = createAction(CHANGE_LANGUAGE, language => language);
export const publicationsLoaded = createAction(PUBLICATIONS_LOADED, publications => publications);
export const updateCurrentPublication = createAction(UPDATE_CURRENT_PUBLICATION,
    (publicationId: string, pageId: string = "", anchor: string = "") => ({ publicationId, pageId, anchor }));

export const dialogRequestOpen = createAction(DIALOG_REQUEST_OPEN);
export const dialogRequestClose = createAction(DIALOG_REQUEST_CLOSE);

export const savePubConditions = createAction(CONDITIONES_PUB_SAVE,
    (pubId: string, conditions: IConditionMap) => ({ pubId, conditions }));
