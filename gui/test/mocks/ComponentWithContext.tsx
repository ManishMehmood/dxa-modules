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

import * as React from "react";
import * as PropTypes from "prop-types";
import { IServices } from "interfaces/Services";
import { PageService } from "test/mocks/services/PageService";
import { PublicationService } from "test/mocks/services/PublicationService";
import { TaxonomyService } from "test/mocks/services/TaxonomyService";
import { SearchService } from "test/mocks/services/SearchService";
import { localization } from "test/mocks/services/LocalizationService";
import { IPageService } from "services/interfaces/PageService";
import { ILocalizationService } from "services/interfaces/LocalizationService";
import { IPublicationService } from "services/interfaces/PublicationService";
import { ITaxonomyService } from "services/interfaces/TaxonomyService";
import { ISearchService } from "services/interfaces/SearchService";

export interface IComponentWithContextContext {
    services: IServices;
    router: IRouter;
}

export interface IComponentWithContextProps {
    localizationService?: ILocalizationService;
    pageService?: IPageService;
    publicationService?: IPublicationService;
    taxonomyService?: ITaxonomyService;
    searchService?: ISearchService;
}

export interface IRouter {
    createHref: () => void;
    push: (path: string) => void;
    replace: (path: string) => void;
    go: () => void;
    goBack: () => void;
    goForward: () => void;
    setRouteLeaveHook: () => void;
    isActive: () => void;
    getCurrentLocation: () => { pathname: string };
    listen: () => void;
}

const services: IServices = {
    pageService: new PageService(),
    publicationService: new PublicationService(),
    localizationService: localization,
    taxonomyService: new TaxonomyService(),
    searchService: new SearchService()
};

export class ComponentWithContext extends React.Component<IComponentWithContextProps, {}> {

    public static childContextTypes: React.ValidationMap<IComponentWithContextContext> = {
        services: PropTypes.object,
        router: PropTypes.object
    };

    public static contextTypes: React.ValidationMap<IComponentWithContextContext> = {
        router: PropTypes.object
    };

    public context: IComponentWithContextContext;

    public getChildContext(): IComponentWithContextContext {
        const { pageService, localizationService, publicationService, taxonomyService, searchService } = this.props;
        let pathname = "";
        return {
            services: {
                pageService: pageService || services.pageService,
                localizationService: localizationService || services.localizationService,
                publicationService: publicationService || services.publicationService,
                taxonomyService: taxonomyService || services.taxonomyService,
                searchService: searchService || services.searchService
            },
            router: this.context.router || {
                listen: (): void => { },
                createHref: (): void => { },
                push: (path: string): void => { pathname = path; },
                replace: (path: string): void => { pathname = path; },
                go: (): void => { },
                goBack: (): void => { },
                goForward: (): void => { },
                setRouteLeaveHook: (): void => { },
                isActive: (): void => { },
                getCurrentLocation: (): { pathname: string } => {
                    return {
                        pathname: pathname
                    };
                }
            }
        };
    };

    /**
     * Render the component
     *
     * @returns {JSX.Element}
     */
    public render(): JSX.Element {
        return (
            <span>{this.props.children}</span>
        );
    }
};
