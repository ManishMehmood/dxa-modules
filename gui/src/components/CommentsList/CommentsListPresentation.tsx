import * as React from "react";
import { Comment } from "@sdl/dd/Comment/Comment";
import { IComment, ICommentDate } from "interfaces/Comments";
import { IAppContext } from "@sdl/dd/container/App/App";

import "@sdl/dd/CommentsList/styles/CommentsList";

export interface ICommentsListProps {
    comments: IComment[];
}

export interface ICommentsListState {
    showComments: number;
}

const DEFAULT_AMOUNT: number = 5;
const INCREMENT: number = 10;

export class CommentsListPresentation extends React.Component<ICommentsListProps, ICommentsListState> {
    /**
     * Context types
     *
     * @static
     * @type {React.ValidationMap<IAppContext>}
     */
    public static contextTypes: React.ValidationMap<IAppContext> = {
        services: React.PropTypes.object.isRequired
    };

    /**
     * Global context
     *
     * @type {IAppContext}
     */
    public context: IAppContext;

    constructor() {
        super();
        this.state = {
            showComments: DEFAULT_AMOUNT
        };

        this.showMoreComments = this.showMoreComments.bind(this);
    }

    public render(): JSX.Element {
        const { formatMessage, getLanguage } = this.context.services.localizationService;
        const { comments } = this.props;
        let { showComments } = this.state;

        const calcCreationDate = (dateObject: ICommentDate): string => {
            var options = { year: "numeric", month: "long", day: "numeric" };
            const date = new Date(dateObject.year, dateObject.monthValue, dateObject.dayOfMonth).toLocaleString(getLanguage(), options);
            return date;
        };

        const displayedComments = comments.slice(0, showComments);
        const totalCommentsCount: number = comments.length;
        const displayedCommentsCount: number = displayedComments.length;

        return (
            <div className="sdl-dita-delivery-comments-list">
                {totalCommentsCount > 0 && <span>{formatMessage("components.commentslist.comments", [displayedCommentsCount.toString()])}</span>}
                {displayedComments.map((comment, index) => {
                    return <Comment key={comment.id} userName={comment.user.name} creationDate={calcCreationDate(comment.creationDate)} content={comment.content} />;
                })}
                {totalCommentsCount > displayedCommentsCount && <div className="sdl-dita-delivery-comments-list-more">
                    <button className="sdl-button graphene sdl-button-purpose-ghost" onClick={this.showMoreComments}>{formatMessage("component.comments.list.more")}</button>
                    <div>{formatMessage("component.comments.list.amount", [displayedCommentsCount.toString(), totalCommentsCount.toString()])}</div>
                </div>}
            </div>
        );
    }

    private showMoreComments(): void {
        this.setState((prevState: ICommentsListState, props: ICommentsListProps) => {
            return { showComments: prevState.showComments + INCREMENT };
        });
    }
}
