import { Router, Route } from "react-router";
import { Breadcrumbs, IBreadcrumbsProps } from "../../../../src/components/presentation/Breadcrumbs";
import { ISitemapItem } from "../../../../src/interfaces/ServerModels";
import { Promise } from "es6-promise";
import { routing } from "../../../mocks/Routing";

const routingHistory = routing.getHistory();

class BreadcrumbsComponent extends SDL.Client.Test.TestBase {

    public runTests(): void {

        describe(`Breadcrumbs tests`, (): void => {
            const target = super.createTargetElement();

            const data = {
                publicationId: "ish:777-1-1",
                publicationTitle: "Publication"
            };

            const selectedItem: ISitemapItem = {
                Id: "s-9",
                Title: "Selected",
                Url: "ish:5-15-99",
                IsAbstract: false,
                HasChildNodes: false,
                Items: []
            };

            const itemsPath: ISitemapItem[] = [{
                Id: "r-5",
                Title: "Root",
                IsAbstract: false,
                HasChildNodes: true,
                Items: []
            },
            {
                Id: "ch-6",
                Title: "Child",
                Url: "ish:5-15-66",
                IsAbstract: false,
                HasChildNodes: true,
                Items: []
            },
                selectedItem
            ];

            const loadItemsPath = (parentId: string, publicationId: string): Promise<ISitemapItem[]> => {
                return Promise.resolve(itemsPath);
            };

            beforeEach(() => {
                routingHistory.push(`/${encodeURIComponent(data.publicationId)}`);
                const props: IBreadcrumbsProps = {
                    publicationId: data.publicationId,
                    publicationTitle: data.publicationTitle,
                    loadItemsPath: loadItemsPath,
                    selectedItem: selectedItem
                };
                this._renderComponent(props, target);
            });

            afterEach(() => {
                const domNode = ReactDOM.findDOMNode(target);
                ReactDOM.unmountComponentAtNode(domNode);
            });

            afterAll(() => {
                target.parentElement.removeChild(target);
            });

            it("renders breadcumbs", (): void => {
                const domNode = ReactDOM.findDOMNode(target) as HTMLElement;
                expect(domNode).not.toBeNull();
                const nodes = domNode.querySelectorAll(".sdl-dita-delivery-breadcrumbs a");
                expect(nodes.length).toBe(1);
                expect(nodes.item(0).getAttribute("title")).toBe(data.publicationTitle);
            });

            it("renders breadcrumbs for selected item", (done: () => void): void => {
                const domNode = ReactDOM.findDOMNode(target) as HTMLElement;
                expect(domNode).not.toBeNull();

                // Use a timeout to allow the DataStore to return a promise with the data
                setTimeout((): void => {
                    const nodes = domNode.querySelectorAll(".sdl-dita-delivery-breadcrumbs a");
                    expect(nodes.length).toBe(3);
                    expect(nodes.item(0).textContent).toBe("Publication");
                    expect(nodes.item(1).textContent).toBe("Root");
                    expect(nodes.item(2).textContent).toBe("Child");

                    // Last item is the selected item and should not highlighted with Link
                    const spanNodes = domNode.querySelectorAll(".sdl-dita-delivery-breadcrumbs span");
                    expect(spanNodes.length).toBe(1);
                    expect(spanNodes.item(0).textContent).toBe("Selected");
                    done();
                }, 0);
            });

            // Tests below does not make sense
            it("navigates to publication root when a publication title breadcrumb is clicked", (done: () => void): void => {
                const domNode = ReactDOM.findDOMNode(target) as HTMLElement;
                expect(domNode).not.toBeNull();

                // Use a timeout to allow the DataStore to return a promise with the data
                setTimeout((): void => {
                    const hyperlinksNodes = domNode.querySelectorAll(".sdl-dita-delivery-breadcrumbs a");
                    const hyperlink = hyperlinksNodes.item(0) as HTMLElement;

                    expect(hyperlink).toBeDefined();
                    hyperlink.click();

                    done();
                }, 0);
            });

            it("navigates to another item when a breadcrumb is clicked", (done: () => void): void => {
                const domNode = ReactDOM.findDOMNode(target) as HTMLElement;
                expect(domNode).not.toBeNull();

                // Use a timeout to allow the DataStore to return a promise with the data
                setTimeout((): void => {
                    const hyperlinksNodes = domNode.querySelectorAll(".sdl-dita-delivery-breadcrumbs a");
                    expect(hyperlinksNodes.length).toBe(3);

                    for (let i: number = hyperlinksNodes.length - 1; i > 0; i--) {
                        const hyperlink = hyperlinksNodes.item(i) as HTMLElement;
                        expect(hyperlink).toBeDefined();
                        if (hyperlink) {
                            hyperlink.click();
                        }
                    };

                    done();
                }, 0);
            });
        });
    }

    private _renderComponent(props: IBreadcrumbsProps, target: HTMLElement): void {
        ReactDOM.render(
            <Router history={routing.getHistory()}>
                <Route path=":publicationId(/:pageId)" component={() => (<Breadcrumbs {...props} />)} />
            </Router>, target);
    }
}

new BreadcrumbsComponent().runTests();
