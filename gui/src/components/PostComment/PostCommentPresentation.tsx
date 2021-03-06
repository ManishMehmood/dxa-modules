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
import "@sdl/dd/PostComment/styles/PostComment";
import "@sdl/dd/Input/Input";
import "@sdl/dd/Textarea/Textarea";
import { IAppContext } from "@sdl/dd/container/App/App";
import { IPostComment } from "interfaces/Comments";
import * as ClassNames from "classnames";

import { Url } from "utils/Url";

export interface IPostCommentPresentationProps {
    /**
     * Comment parent id if exists
     *
     * @type {number}
     * @memberOf IPostCommentPresentationProps
     */
    parentId?: number;

    /**
     * Comment submit handler
     *
     * @param {React.FormEvent<HTMLFormElement>} event
     * @param {IPostComment} commentData
     * @memberof IPostCommentPresentationProps
     */
    handleSubmit: (event: React.FormEvent<HTMLFormElement>, commentData: IPostComment) => void;

    /**
     * Comment form reset handler
     *
     * @param {React.FormEvent<HTMLFormElement>} event
     * @memberof IPostCommentPresentationProps
     */
    handleReset?: (event: React.FormEvent<HTMLFormElement>) => void;
}

export interface IPostCommentPresentationDispatchProps {
    /**
     * An error prevented the comment from posting
     *
     * @type {string | null}
     * @memberOf IPostCommentPresentationDispatchProps
     */
    error: string | null;

    /**
     * Comment page Id
     *
     * @type {string}
     * @memberOf IPostCommentPresentationProps
     */
    pageId: string;

    /**
     * Comment page Title
     *
     * @type {string}
     * @memberOf IPostCommentPresentationProps
     */
    pageTitle: string | undefined;

    /**
     * Comment publication Id
     *
     * @type {string}
     * @memberOf IPostCommentPresentationProps
     */
    publicationId: string;

    /**
     * Comment publication Title
     *
     * @type {string}
     * @memberOf IPostCommentPresentationProps
     */
    publicationTitle: string | undefined;

    /**
     * If comment is saving
     *
     * @type {boolean}
     * @memberOf IPostCommentPresentationProps
     */
    commentIsSaving: boolean;

    /**
     * Comment publication language
     *
     * @type {string}
     * @memberOf IPostCommentPresentationProps
     */
    language: string;
}

export interface IPostCommentPresentationState {
    name: string;
    email: string;
    comment: string;
    parentId: number;
    edited: {
        name: boolean;
        email: boolean;
        comment: boolean;
    };
}

export interface IPC {
    [key: string]: boolean;
}

export class PostCommentPresentation extends React.Component<
    IPostCommentPresentationProps & IPostCommentPresentationDispatchProps,
    IPostCommentPresentationState
    > {
    /**
     * Context types
     *
     * @static
     * @type {React.ValidationMap<IAppContext>}
     */
    public static contextTypes: React.ValidationMap<IAppContext> = {
        services: PropTypes.object.isRequired
    };

    /**
     * Global context
     *
     * @type {IAppContext}
     */
    public context: IAppContext;

    public form: HTMLFormElement;

    protected initialState: IPostCommentPresentationState;

    constructor() {
        super();
        this.initialState = {
            name: "",
            email: "",
            comment: "",
            parentId: 0,
            edited: {
                name: false,
                email: false,
                comment: false
            }
        };
        this.state = this.initialState;

        this.handleBlur = this.handleBlur.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleReset = this.handleReset.bind(this);
    }

    /**
     *
     * @param {React.ChangeEvent} event
     *
     * @memberof PostCommentPresentation
     */
    public handleChange(event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>): void {
        const htmlElement = event.currentTarget;
        this.setState({
            ...this.state,
            [htmlElement.getAttribute("id") as string]: htmlElement.value
        });
    }

    /**
     *
     * @param {React.FormEvent<HTMLFormElement>} event
     * @memberof PostCommentPresentation
     */
    public handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        const { handleSubmit } = this.props;

        handleSubmit(event, this.getCommentData());
        this.form = event.currentTarget;
    }

    /**
     *
     * @param {React.FormEvent<HTMLFormElement>} event
     * @memberof PostCommentPresentation
     */
    public handleReset(event: React.FormEvent<HTMLFormElement>): void {
        const { handleReset } = this.props;
        if (handleReset) {
            handleReset(event);
        }
        this.resetState();
    }

    /**
     *
     * @param {IPostCommentPresentationDispatchProps} nextProps
     * @memberof PostCommentPresentation
     */
    public componentWillReceiveProps(nextProps: IPostCommentPresentationDispatchProps): void {
        if (!nextProps.commentIsSaving && !nextProps.error) {
            if (this.form) {
                this.form.reset();
            }
            this.resetState();
        }
    }

    /**
     *
     * @param {string} name
     * @param {string} email
     * @param {string} comment
     * @returns {IPC}
     *
     * @memberof PostCommentPresentation
     */
    public validateInput(name: string, email: string, comment: string): IPC {
        return {
            name: name.length === 0,
            email: email.length === 0,
            comment: comment.length === 0
        };
    }

    /**
     *
     * @param {React.FocusEvent} event
     *
     * @memberof PostCommentPresentation
     */
    public handleBlur(event: React.FocusEvent<HTMLElement>): void {
        const field = event.currentTarget.getAttribute("id") as string;
        this.setState({
            ...this.state,
            edited: { ...this.state.edited, [field]: true }
        });
    }

    /**
     *
     * @returns {JSX.Element}
     *
     * @memberof PostCommentPresentation
     */
    public render(): JSX.Element {
        const { error } = this.props;
        const { name, email, comment } = this.state;
        const { formatMessage } = this.context.services.localizationService;
        const errors: IPC = this.validateInput(name, email, comment);
        const isDisabled = Object.keys(errors).some(key => errors[key]);

        const isError = (field: string) => {
            const hasError = errors[field];
            const shouldShow = (this.state.edited as IPC)[field];
            return hasError ? shouldShow : false;
        };

        const getInputClassNames = (field: string): string => {
            return ClassNames("sdl-input-text", isError(field) ? "error" : "");
        };
        const getTextareaClassNames = (field: string): string => {
            return ClassNames("sdl-textarea", isError(field) ? "error" : "");
        };

        return (
            <div className="sdl-dita-delivery-postcomment">
                <form
                    onSubmit={this.handleSubmit}
                    onReset={this.handleReset}
                    id="form"
                >
                    <div>
                        <input
                            className={getInputClassNames("name")}
                            type="text"
                            id="name"
                            placeholder={formatMessage(
                                "component.post.comment.placeholder.name"
                            )}
                            onChange={this.handleChange}
                            onBlur={this.handleBlur}
                        />
                        <span>
                            {formatMessage("component.post.comment.no.name")}
                        </span>
                    </div>
                    <div>
                        <input
                            className={getInputClassNames("email")}
                            type="text"
                            id="email"
                            placeholder={formatMessage(
                                "component.post.comment.placeholder.email"
                            )}
                            onChange={this.handleChange}
                            onBlur={this.handleBlur}
                        />
                        <span>
                            {formatMessage("component.post.comment.no.email")}
                        </span>
                    </div>
                    <div>
                        <textarea
                            className={getTextareaClassNames("comment")}
                            id="comment"
                            placeholder={formatMessage(
                                "component.post.comment.placeholder.content"
                            )}
                            onChange={this.handleChange}
                            onBlur={this.handleBlur}
                        />
                        <span>
                            {formatMessage("component.post.comment.no.content")}
                        </span>
                    </div>
                    <button
                        type="submit"
                        disabled={isDisabled}
                        className="sdl-button graphene sdl-button-purpose-confirm"
                        form="form"
                        value="Submit"
                    >
                        {formatMessage("component.post.comment.submit")}
                    </button>
                    <button
                        type="reset"
                        className="sdl-button graphene"
                        value="Cancel"
                    >
                        {formatMessage("components.conditions.dialog.cancel")}
                    </button>
                </form>
                {error && (
                    <div className="sdl-dita-delivery-postcomment-error">
                        {formatMessage("component.post.comment.post.error")}
                    </div>
                )}
            </div>
        );
    }

    protected getCommentData(): IPostComment {
        const { name, email, comment } = this.state;
        const { getLanguage } = this.context.services.localizationService;
        const {
            publicationId,
            publicationTitle,
            pageId,
            pageTitle
        } = this.props;

        const language = getLanguage();

        return {
            publicationId,
            publicationTitle,
            publicationUrl: window.location.origin + Url.getPublicationUrl(publicationId, publicationTitle),
            pageId,
            pageTitle,
            pageUrl: window.location.origin + Url.getPageUrl(publicationId, pageId, publicationTitle, pageTitle),
            language,
            username: name,
            email,
            content: comment,
            parentId: 0
        };
    }

    private resetState(): void {
        this.setState(this.initialState);
    }
}

export class PostCommentReplyPresentation extends PostCommentPresentation {
    /**
     * Context types
     *
     * @static
     * @type {React.ValidationMap<IAppContext>}
     */
    public static contextTypes: React.ValidationMap<IAppContext> = {
        services: PropTypes.object.isRequired
    };

    /**
     * Global context
     *
     * @type {IAppContext}
     */
    public context: IAppContext;

    public textareaInput: HTMLTextAreaElement;

    /**
     *
     * @param {string} comment
     * @returns {IPC}
     *
     * @memberof PostCommentReplyPresentation
     */
    public validateInput(comment: string): IPC {
        return {
            comment: comment.length === 0
        };
    }

    /**
     * Invoked once, only on the client (not on the server), immediately after the initial rendering occurs.
     */
    public componentDidMount(): void {
        // autofocus the input on mount
        if (this.textareaInput) {
            this.textareaInput.focus();
        }
    }

    /**
     *
     * @returns {JSX.Element}
     *
     * @memberof PostCommentReplyPresentation
     */
    public render(): JSX.Element {
        const { error, parentId } = this.props;
        const { comment } = this.state;
        const { formatMessage } = this.context.services.localizationService;
        const errors: IPC = this.validateInput(comment);
        const isDisabled = Object.keys(errors).some(key => errors[key]);

        const isError = (field: string) => {
            const hasError = errors[field];
            const shouldShow = (this.state.edited as IPC)[field];
            return hasError ? shouldShow : false;
        };

        const getTextareaClassNames = (field: string): string => {
            return ClassNames("sdl-textarea", isError(field) ? "error" : "");
        };

        return (
            <div className="sdl-dita-delivery-postreply">
                <form
                    onSubmit={this.handleSubmit}
                    onReset={this.handleReset}
                    id={`reply-form-${parentId}`}
                >
                    <div>
                        <textarea
                            ref={(textareaInput: HTMLTextAreaElement) => {
                                this.textareaInput = textareaInput;
                            }}
                            className={getTextareaClassNames("comment")}
                            id="comment"
                            placeholder={formatMessage(
                                "component.post.reply.placeholder"
                            )}
                            onChange={this.handleChange}
                            onBlur={this.handleBlur}
                        />
                        <span>
                            {formatMessage("component.post.comment.no.content")}
                        </span>
                    </div>
                    <button
                        type="submit"
                        disabled={isDisabled}
                        className="sdl-button graphene sdl-button-purpose-confirm"
                        form={`reply-form-${parentId}`}
                        value="Submit"
                    >
                        {formatMessage("component.post.reply.submit")}
                    </button>
                    <button
                        type="reset"
                        className="sdl-button graphene"
                        value="Cancel"
                    >
                        {formatMessage("components.conditions.dialog.cancel")}
                    </button>
                </form>
                {error && (
                    <div className="sdl-dita-delivery-postcomment-error">
                        {formatMessage("component.post.comment.post.error")}
                    </div>
                )}
            </div>
        );
    }

    /**
     *
     * @memberof PostCommentPresentation
     */
    protected getCommentData(): IPostComment {
        const parentId = this.props.parentId || 0;
        return { ...super.getCommentData(), parentId };
    }
}
