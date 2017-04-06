import * as React from "react";
import * as ReactDOM from "react-dom";
import { Promise } from "es6-promise";
import { IAppContext } from "components/container/App";
import { NavigationMenu } from "components/presentation/NavigationMenu";
import { Toc } from "components/presentation/Toc";
import { Page } from "components/Page/Page";
import { Breadcrumbs, IBreadcrumbItem } from "components/presentation/Breadcrumbs";
import { ContentLanguageWarning } from "components/ContentLanguageWarning/ContentLanguageWarning";

import { VersionSelector } from "components/presentation/VersionSelector";
import { Html, IHeader } from "utils/Html";
import { TcmId } from "utils/TcmId";
import { Url } from "utils/Url";
import { debounce } from "utils/Function";
import { isDummyPage, isPage } from "utils/Page";

import { ITaxonomy } from "interfaces/Taxonomy";
import { IPage } from "interfaces/Page";
import { TaxonomyItemId } from "interfaces/TcmId";
import { IPublication } from "interfaces/Publication";
import { IPublicationCurrentState } from "store/interfaces/State";
import { IProductReleaseVersion } from "interfaces/ProductReleaseVersion";

import Version from "utils/Version";

import "./PublicationContent.less";

/**
 * PublicationContent component props
 *
 * @export
 * @interface IPublicationContentProps
 */
export interface IPublicationContentProps {
    /**
     * Publication
     *
     * @type {IPublication}
     * @memberOf IPublicationContentProps
     */
    publication: IPublication;
    /**
     * Page
     *
     * @type {IPage}
     * @memberOf IPublicationContentProps
     */
    page: IPage;
    /**
     * Possible error message while page loading
     *
     * @type {string}
     * @memberOf IPublicationContentProps
     */
    errorMessage: string;
    /**
     * Is Page loading status
     *
     * @type {boolean}
     * @memberOf IPublicationContentProps
     */
    isPageLoading: boolean;
    /**
     * Available product release versions for the selected publication
     *
     * @type {IProductReleaseVersion[]}
     * @memberOf IPublicationsListState
     */

    productReleaseVersions: IProductReleaseVersion[];
    productReleaseVersion: string;
    /**
     * Function to execute when publication is changing
     *
     * @type {Function}
     * @memberOf IPublicationContentProps
     */
    onPublicationChange?: (publicationId: string, pageId: string) => void;
    onReleaseVersionChanged?: (publicationId: string, releaseVersions: string) => void;
}

/**
 * PublicationContent component state
 *
 * @export
 * @interface IPublicationContentState
 */
export interface IPublicationContentState {
    /**
     * Toc is loading
     *
     * @type {boolean}
     */
    isTocLoading?: boolean;
    /**
     * Current selected item in the TOC
     *
     * @type {ITaxonomy | null}
     */
    selectedTocItem?: ITaxonomy | null;
    /**
     * Current active item path in the TOC
     *
     * @type {string[]}
     */
    activeTocItemPath?: string[];

    /**
     * Active header inside the page
     *
     * @type {IHeader}
     * @memberOf IPublicationContentState
     */
    activePageHeader?: IHeader;
}

interface IToc {
    /**
     * An error prevented the toc from rendering
     *
     * @type {string}
     * @memberOf IToc
     */
    error?: string;
    /**
     * Root items
     *
     * @type {ITaxonomy[]}
     * @memberOf IToc
     */
    rootItems?: ITaxonomy[];
}

/**
 * Publication content props
 */
export type Pub = IPublicationContentProps & IPublicationCurrentState;

/**
 * Publication + content component
 */
export class PublicationContentPresentation extends React.Component<Pub, IPublicationContentState> {

    public static contextTypes: React.ValidationMap<IAppContext> = {
        services: React.PropTypes.object.isRequired,
        router: React.PropTypes.object.isRequired
    };

    public context: IAppContext;
    private _toc: IToc = {};
    private _isUnmounted: boolean = false;
    private _topOffset: number = 0;

    /**
     * Creates an instance of App.
     */
    constructor() {
        super();
        this.state = {
            isTocLoading: true,
            selectedTocItem: null
        };

        this._fixPanels = this._fixPanels.bind(this);
    }

    /**
     * Invoked once, both on the client and server, immediately before the initial rendering occurs.
     */
    public fetchPublication(publicationId: string): void {
       // this is temporary hack to move out loading data from this component
        if (publicationId) {
            // Load the page
            this._loadTocRootItems(publicationId);
        }
    }

    public fetchPage(publicationId: string, page: IPage): void {
        this._onPageContentRetrieved(publicationId, page);
    }

    public componentDidMount(): void {
        const { publicationId, page, errorMessage } = this.props;
        if (!isPage(page)) {
            this.fetchPublication(publicationId);
        }

        if (isPage(page) && !isDummyPage(page)) {
            this.fetchPage(publicationId, page);
        } else if (errorMessage) {
           this._onPageContentRetrievFailed(publicationId, errorMessage);
       }

       this.addResizeHandlers();
    }

    /**
     *
     * @param {Pub} prevProps
     *
     * @memberOf PublicationContentPresentation
     */
    public componentWillReceiveProps(nextProps: Pub): void {
       const { page, publicationId } = this.props;
       const { publicationId: nextPubId, page: nextPage, errorMessage} = nextProps;

       if (!isPage(nextPage) || nextPubId !== publicationId) {
            this.fetchPublication(nextPubId);
       }

       if (isPage(nextPage) && !isDummyPage(nextPage) && nextPage.content !== page.content) {
            this.fetchPage(nextPubId, nextPage);
       } else if (errorMessage) {
           this._onPageContentRetrievFailed(nextPubId, errorMessage);
       }
    }

    /**
     * Render the component
     *
     * @returns {JSX.Element}
     */
    public render(): JSX.Element {
        const { activeTocItemPath, selectedTocItem, activePageHeader } = this.state;
        const { services, router } = this.context;
        const { publicationId, pageId, page, publication, isPageLoading, errorMessage, productReleaseVersion, productReleaseVersions } = this.props;
        const { taxonomyService } = services;
        const { rootItems } = this._toc;
        const tocError = this._toc.error;
        const selectedProductReleaseVersion = productReleaseVersion ? Version.normalize(productReleaseVersion) : undefined;
        return (
            <section className={"sdl-dita-delivery-publication-content"}>
                <Page
                    showActivityIndicator={isPageLoading}
                    content={page.content}
                    error={errorMessage}
                    onNavigate={(url: string): void => {
                        /* istanbul ignore else */
                        if (router) {
                            router.push(url);
                        }
                    } }
                    url={pageId ?
                        Url.getPageUrl(publicationId, pageId, publication.title, page.title || (selectedTocItem && selectedTocItem.title) || "") :
                        Url.getPublicationUrl(publicationId, publication.title)}
                    scrollOffset={this._topOffset}
                    activeHeader={activePageHeader}>
                    <NavigationMenu isOpen={false}>{/* TODO: use global state store */}
                        <Toc
                            activeItemPath={activeTocItemPath}
                            rootItems={rootItems}
                            loadChildItems={(parentId: string): Promise<ITaxonomy[]> => {
                                return taxonomyService.getSitemapItems(publicationId, parentId);
                            } }
                            onSelectionChanged={this._onTocSelectionChanged.bind(this)}
                            error={tocError}
                            onRetry={() => this._loadTocRootItems(publicationId) }
                            >
                            <span className="separator" />
                        </Toc>
                    </NavigationMenu>
                    <Breadcrumbs
                        loadItemPath={(breadcrumbItem: ITaxonomy): Promise<IBreadcrumbItem[]> => {
                            const publicationTitle = publication.title;
                            const productFamilyTitle = publication.productFamily;
                            let breadCrumbPath = [{
                                title: productFamilyTitle,
                                url: Url.getProductFamilyUrl(productFamilyTitle || "", selectedProductReleaseVersion)
                            }, {
                                title: publicationTitle,
                                url: Url.getPublicationUrl(publicationId, publicationTitle)
                            }] as IBreadcrumbItem[];
                            const parsedUrl = breadcrumbItem.url && Url.parsePageUrl(breadcrumbItem.url);
                            if (parsedUrl && parsedUrl.pageId) {
                                return taxonomyService.getSitemapPath(publicationId, parsedUrl.pageId, breadcrumbItem.id || "").then(
                                    path => {
                                        breadCrumbPath.push(...path.map(item => {
                                            return {
                                                title: item.title,
                                                url: item.url
                                            } as IBreadcrumbItem;
                                        }));
                                        return breadCrumbPath;
                                    },
                                    siteMapError => {
                                        return Promise.reject(siteMapError);
                                    }
                                );
                            } else {
                                return Promise.resolve(breadCrumbPath);
                            }
                        }}
                        selectedItem={selectedTocItem}
                        />
                    <ContentLanguageWarning />
                    <VersionSelector productReleaseVersions={productReleaseVersions}
                        selectedProductReleaseVersion={selectedProductReleaseVersion}
                        onChange={version => this._navigateToOtherReleaseVersion(publicationId, version)} />
                </Page>
            </section>
        );
    }

    /**
     * Invoked once, only on the client (not on the server), immediately after the initial rendering occurs.
     */
    public addResizeHandlers(): void {
        if (ReactDOM) {
            const domNode = ReactDOM.findDOMNode(this) as HTMLElement;
            if (domNode) {
                this._topOffset = domNode.offsetTop;
            }
        }

        window.addEventListener("scroll", this._fixPanels);
        window.addEventListener("resize", this._fixPanels);
        this._fixPanels();
    }

    /**
     * Component will unmount
     */
    public componentWillUnmount(): void {
        this._isUnmounted = true;

        window.removeEventListener("scroll", this._fixPanels);
        window.removeEventListener("resize", this._fixPanels);
    }

    private _onTocSelectionChanged(sitemapItem: ITaxonomy, path: string[]): void {
        const { onPublicationChange, pageId, publicationId } = this.props;

        const updatedState: IPublicationContentState = {
            activeTocItemPath: path,
            selectedTocItem: sitemapItem,
            isTocLoading: false
        };
        this.setState(updatedState);

        // When the tree is expanding it is also calling the onTocSelectionChanged callback
        /* istanbul ignore else */
        const navPath = sitemapItem.url;
        const parsedUrl = navPath && Url.parsePageUrl(navPath);
        const pageHasChanged = parsedUrl && (pageId !== parsedUrl.pageId && publicationId === parsedUrl.publicationId);
        if (pageHasChanged && parsedUrl && onPublicationChange) {
            onPublicationChange(parsedUrl.publicationId, parsedUrl.pageId);
        }
    }

    private _onPageContentRetrieved(publicationId: string, pageInfo: IPage): void {
        const { activeTocItemPath, isTocLoading } = this.state;

        // Set the current active path for the tree
        if (Array.isArray(pageInfo.sitemapIds) && pageInfo.sitemapIds.length > 0) {
            // Always take the first sitemap id
            // There is no proper way for having a deep link to the second/third/... occurance inside the toc
            const firstSitemapId = pageInfo.sitemapIds[0];
            const taxonomyId = TcmId.getTaxonomyItemId(TaxonomyItemId.Toc, firstSitemapId) || firstSitemapId;

            this._getActiveSitemapPath(publicationId, pageInfo.id, taxonomyId, path => {
                /* istanbul ignore if */
                if (this._isUnmounted) {
                    return;
                }

                if (isTocLoading) {
                    this._loadTocRootItems(publicationId, path);
                } else if (!activeTocItemPath || path.join("") !== activeTocItemPath.join("")) {
                    this.setState({
                        activeTocItemPath: path
                    });
                }
            });
        } else if (isTocLoading) {
            this._loadTocRootItems(publicationId);
        }
    }

    private _onPageContentRetrievFailed(publicationId: string, error: string): void {
        const { isTocLoading } = this.state;

        if (publicationId && isTocLoading) {
            this._loadTocRootItems(publicationId);
        }
    }

    private _getActiveSitemapPath(publicationId: string, pageId: string, sitemapId: string, done: (path: string[]) => void): void {
        const { services } = this.context;

        if (pageId) {
            services.taxonomyService.getSitemapPath(publicationId, pageId, sitemapId).then(
                path => {
                    /* istanbul ignore else */
                    if (!this._isUnmounted) {
                        done(path.map(item => item.id || "") || []);
                    }
                },
                error => {
                    /* istanbul ignore else */
                    if (!this._isUnmounted) {
                        this._toc.error = error;
                        this.setState({
                            isTocLoading: false
                        });
                    }
                });
        }
    }

    private _fixPanels(): void {
        /* istanbul ignore if */
        if (this._isUnmounted) {
            return;
        }

        let ticking = false;

        // Set height of toc and content navigation panel to a maximum
        const domNode = ReactDOM.findDOMNode(this) as HTMLElement;
        if (domNode) {
            const toc = domNode.querySelector("nav.sdl-dita-delivery-toc") as HTMLElement;
            const contentNavigation = domNode.querySelector("nav.sdl-dita-delivery-content-navigation") as HTMLElement;
            const page = domNode.querySelector(".sdl-dita-delivery-page") as HTMLElement;
            if (!ticking) {
                requestAnimationFrame((): void => {
                    this._updatePanels(page, toc, contentNavigation);
                    ticking = false;
                });
                ticking = true;
            }
        }
    }

    private _updatePanels(page: HTMLElement, toc: HTMLElement, contentNavigation: HTMLElement): void {
        /* istanbul ignore if */
        if (!this._isUnmounted) {
            if (contentNavigation && page) {
                // Update active title inside content navigation panel
                const pageContent = page.querySelector(".page-content") as HTMLElement;
                if (pageContent) {
                    const header = Html.getActiveHeader(document.body, pageContent, 0);
                    if (header && header !== this.state.activePageHeader) {
                        this.setState({
                            activePageHeader: header
                        });
                        debounce((): void => {
                            // Make sure the active link is in view
                            const activeLinkEl = contentNavigation.querySelector("li.active") as HTMLElement;
                            if (activeLinkEl) {
                                Html.scrollIntoView(contentNavigation, activeLinkEl);
                            }
                        })();
                    }
                }
            }
        }
    }

    private _loadTocRootItems(publicationId: string, path?: string[]): Promise<ITaxonomy[]> {
        const { services } = this.context;
        // Get the data for the Toc
        this._toc.rootItems = undefined;
        this._toc.error = undefined;
        this.setState({
            activeTocItemPath: undefined,
            selectedTocItem: null,
            isTocLoading: true
        });

        return services.taxonomyService.getSitemapRoot(publicationId).then(
            items => {
                /* istanbul ignore else */
                if (!this._isUnmounted) {
                    this._toc.rootItems = items;
                    this._toc.error = undefined;
                    this.setState({
                        activeTocItemPath: path,
                        isTocLoading: false
                    });
                }
                return items;
            },
            error => {
                /* istanbul ignore else */
                if (!this._isUnmounted) {
                    this._toc.error = error;
                    this.setState({
                        isTocLoading: false
                    });
                }
            }
        );
    }

    private _navigateToOtherReleaseVersion(publicationId: string, releaseVersion: string): void {
       if (this.props.onReleaseVersionChanged) {
           this.props.onReleaseVersionChanged(publicationId, releaseVersion);
       }
    }
}
