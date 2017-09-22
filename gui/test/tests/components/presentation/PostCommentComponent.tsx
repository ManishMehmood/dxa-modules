import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";
import {
    PostCommentPresentation,
    PostCommentReplyPresentation,
    IPostCommentPresentationProps,
    IPostCommentPresentationDispatchProps
} from "@sdl/dd/PostComment/PostCommentPresentation";
import { ComponentWithContext } from "test/mocks/ComponentWithContext";

import { TestBase } from "@sdl/models";
import { Provider } from "react-redux";
import { configureStore } from "store/Store";
import { Store } from "redux";
import { IState } from "store/interfaces/State";
import { IPostComment } from "interfaces/Comments";

interface ITestData {
    [key: string]: string;
}

class PostCommentComponent extends TestBase {
    public runTests(): void {
        describe(`post comments tests.`, (): void => {
            const target = super.createTargetElement();

            const defaultProps = {
                publicationId: "1",
                pageId: "1",
                parentId: 0,
                handleSubmit: () => {},
                handleReset: () => {},
                error: "",
                isCommentSaving: false
            };

            const testData: ITestData = {
                name: "Test",
                email: "info@test.io",
                comment: "Comment"
            };

            afterEach(() => {
                const domNode = ReactDOM.findDOMNode(target);
                ReactDOM.unmountComponentAtNode(domNode);
            });

            afterAll(() => {
                if (target.parentElement) {
                    target.parentElement.removeChild(target);
                }
            });

            it("renders post comment form", (): void => {
                const postComment = this._renderPostCommentComponent(defaultProps, target);
                const postCommentNode = ReactDOM.findDOMNode(postComment);
                expect(postCommentNode.querySelectorAll("input, textarea, button").length).toBe(4);
            });

            it("validates comment form", (): void => {
                const postComment = this._renderPostCommentComponent(defaultProps, target);
                const postCommentDialog = ReactDOM.findDOMNode(postComment);
                ["name", "email", "comment"].forEach(i => {
                    const input = postCommentDialog.querySelector(`#${i}`) as HTMLInputElement | HTMLTextAreaElement;
                    expect(input).toBeDefined();
                    TestUtils.Simulate.focus(input);
                    expect(input.classList).not.toContain("error");
                    TestUtils.Simulate.blur(input);
                    expect(input.classList).toContain("error");
                });
            });

            it("can post comment", (done: () => void): void => {
                const postComment = this._renderPostCommentComponent(
                    {
                        ...defaultProps,
                        handleSubmit: ({}, commentData: IPostComment): void => {
                            expect(commentData.username).toBe(testData.name);
                            expect(commentData.email).toBe(testData.email);
                            expect(commentData.content).toBe(testData.comment);
                            done();
                        }
                    },
                    target
                );
                const postCommentDialog = ReactDOM.findDOMNode(postComment);

                const commentButton = postCommentDialog.querySelector("button") as HTMLButtonElement;
                expect(commentButton.disabled).toBe(true);

                ["name", "email", "comment"].forEach(i => {
                    const input = postCommentDialog.querySelector(`#${i}`) as HTMLInputElement | HTMLTextAreaElement;
                    expect(input).toBeDefined();
                    input.value = testData[i];
                    TestUtils.Simulate.change(input);
                });

                expect(commentButton.disabled).toBe(false);

                // Event propagation is not supported
                TestUtils.Simulate.submit(TestUtils.findRenderedDOMComponentWithTag(postComment, "form") as HTMLFormElement);
            });

            it("shows post comment error, when comment post failed", (): void => {
                const error = "Post comment error";
                const postComment = this._renderPostCommentComponent(
                    {
                        ...defaultProps,
                        error
                    },
                    target
                );
                const postCommentDialog = ReactDOM.findDOMNode(postComment);
                expect(postCommentDialog.querySelector(".sdl-dita-delivery-postcomment-error") as HTMLElement).toBeDefined();
            });
        });

        describe(`post comment replies tests`, (): void => {
            const target = super.createTargetElement();

            const defaultProps = {
                publicationId: "1",
                pageId: "1",
                parentId: 0,
                handleSubmit: () => {},
                handleReset: () => {},
                error: "",
                isCommentSaving: false
            };

            const testContent = "Test Reply";

            afterEach(() => {
                const domNode = ReactDOM.findDOMNode(target);
                ReactDOM.unmountComponentAtNode(domNode);
            });

            afterAll(() => {
                if (target.parentElement) {
                    target.parentElement.removeChild(target);
                }
            });

            it("renders post reply form", (): void => {
                const postComment = this._renderPostReplyComponent(defaultProps, target);
                const postCommentNode = ReactDOM.findDOMNode(postComment);
                expect(postCommentNode.querySelectorAll("textarea, button").length).toBe(3);
            });

            it("validates reply form", (): void => {
                const postComment = this._renderPostReplyComponent(defaultProps, target);
                const postCommentDialog = ReactDOM.findDOMNode(postComment);

                const input = postCommentDialog.querySelector("#comment") as HTMLTextAreaElement;
                expect(input).toBeDefined();
                TestUtils.Simulate.focus(input);
                expect(input.classList).not.toContain("error");
                TestUtils.Simulate.blur(input);
                expect(input.classList).toContain("error");
            });

            it("can post reply", (done: () => void): void => {
                const postComment = this._renderPostReplyComponent(
                    {
                        ...defaultProps,
                        handleSubmit: ({}, commentData: IPostComment): void => {
                            expect(commentData.content).toBe(testContent);
                            done();
                        }
                    },
                    target
                );
                const postCommentDialog = ReactDOM.findDOMNode(postComment);

                const commentButton = postCommentDialog.querySelector("button") as HTMLButtonElement;
                expect(commentButton.disabled).toBe(true);

                const input = postCommentDialog.querySelector("#comment") as HTMLTextAreaElement;
                expect(input).toBeDefined();
                input.value = testContent;
                TestUtils.Simulate.change(input);

                expect(commentButton.disabled).toBe(false);
                // Event propagation is not supported
                TestUtils.Simulate.submit(TestUtils.findRenderedDOMComponentWithTag(postComment, "form") as HTMLFormElement);
            });

            it("shows post reply error, when comment post failed", (): void => {
                const error = "Post comment error";
                const postComment = this._renderPostReplyComponent(
                    {
                        ...defaultProps,
                        error
                    },
                    target
                );
                const postCommentDialog = ReactDOM.findDOMNode(postComment);
                expect(postCommentDialog.querySelector(".sdl-dita-delivery-postcomment-error") as HTMLElement).toBeDefined();
            });
        });
    }

    private _renderPostCommentComponent(props: IPostCommentPresentationProps & IPostCommentPresentationDispatchProps, target: HTMLElement): PostCommentPresentation {
        const store: Store<IState> = configureStore();
        return TestUtils.findRenderedComponentWithType(
            ReactDOM.render(
                <ComponentWithContext>
                    <Provider store={store}>
                        <PostCommentPresentation {...props} />
                    </Provider>
                </ComponentWithContext>,
                target
            ) as React.Component<{}, {}>,
            PostCommentPresentation
        ) as PostCommentPresentation;
    }

    private _renderPostReplyComponent(props: IPostCommentPresentationProps & IPostCommentPresentationDispatchProps, target: HTMLElement): PostCommentReplyPresentation {
        const store: Store<IState> = configureStore();
        return TestUtils.findRenderedComponentWithType(
            ReactDOM.render(
                <ComponentWithContext>
                    <Provider store={store}>
                        <PostCommentReplyPresentation {...props} />
                    </Provider>
                </ComponentWithContext>,
                target
            ) as React.Component<{}, {}>,
            PostCommentReplyPresentation
        ) as PostCommentReplyPresentation;
    }
}

new PostCommentComponent().runTests();
