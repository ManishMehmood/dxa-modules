import { connect } from "react-redux";
import { PublicationContentPresentation } from "@sdl/dd/PublicationContent/PublicationContentPresentation";
import { updateCurrentLocation } from "store/actions/Actions";
import { setCurrentPublicationByReleaseVersion, setCurrentPageByReleaseVersion } from "store/actions/Api";
import {
    getCurrentLocation, getPubById, getPageById, getErrorMessage,
    isPageLoading as isPageLoadingGetter, isPublicationFound as isPublicationFoundGetter, getReleaseVersionsForPub
} from "store/reducers/Reducer";
import { IState } from "store/interfaces/State";
import { isPage, isDummyPage } from "utils/Page";
import { getLastConditions } from "store/reducers/Reducer";

const mapStateToProps = (state: IState) => {
    const { publicationId, pageId, taxonomyId, anchor } = getCurrentLocation(state);
    const publication = getPubById(state, publicationId);
    const page = getPageById(state, publicationId, pageId);
    const errorMessage = getErrorMessage(state, publicationId, pageId);
    const isPageLoading = isPage(page) && isDummyPage(page) && isPageLoadingGetter(state, publicationId, pageId);
    const productReleaseVersions = getReleaseVersionsForPub(state, publicationId);
    const isPublicationFound = isPublicationFoundGetter(state, publicationId);
    const conditions = getLastConditions(state, publicationId);

    return {
        publication,
        page,
        publicationId,
        pageId,
        taxonomyId,
        anchor,
        isPageLoading,
        errorMessage,
        productReleaseVersions,
        productReleaseVersion: publication.productReleaseVersion ? publication.productReleaseVersion[0] : "",
        isPublicationFound,
        conditions,
        splitterPosition: state.splitterPosition
    };
};

const mapDispatchToProps = {
    onPublicationChange: updateCurrentLocation,
    onReleaseVersionChanged: setCurrentPublicationByReleaseVersion,
    onPageReleaseVersionChanged: setCurrentPageByReleaseVersion
};

/**
 * Connector of Publication Content component for Redux
 * @export
 */
export const PublicationContent = connect(mapStateToProps, mapDispatchToProps)(PublicationContentPresentation);