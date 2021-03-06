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

import { IState } from "store/interfaces/State";
import { connect } from "react-redux";
import { CommentsListPresentation } from "@sdl/dd/CommentsList/CommentsListPresentation";
import { getCurrentLocation } from "store/reducers/Reducer";
import { getComments, getCommentErrorMessage } from "store/reducers/Reducer";
import { saveReply, fetchComments } from "store/actions/Api";

const mapStateToProps = (state: IState) => {
    const { pageId, publicationId } = getCurrentLocation(state);
    const comments = getComments(state, publicationId, pageId);
    const error = getCommentErrorMessage(state, publicationId, pageId);

    return { pageId, publicationId, comments, error };
};

const mapDispatchToState = {
    saveReply,
    fetchComments
};

export const CommentsList = connect(mapStateToProps, mapDispatchToState)(CommentsListPresentation);
