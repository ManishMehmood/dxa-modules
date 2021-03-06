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

export interface IPostComment {
    /**
     *
     * @type {number}
     * @memberof IPostComment
     */
    publicationId: string;
    /**
     *
     * @type {number}
     * @memberof IPostComment
     */
    publicationTitle: string | undefined;
    /**
     *
     * @type {number}
     * @memberof IPostComment
     */
    publicationUrl: string;
    /**
     *
     * @type {number}
     * @memberof IPostComment
     */
    pageTitle: string | undefined;
    /**
     *
     * @type {number}
     * @memberof IPostComment
     */
    pageId: string;
    /**
     *
     * @type {number}
     * @memberof IPostComment
     */
    pageUrl: string;
    /**
     *
     * @type {string}
     * @memberof IPostComment
     */
    username: string;
    /**
     *
     * @type {string}
     * @memberof IPostComment
     */
    email: string;
    /**
     *
     * @type {string}
     * @memberof IPostComment
     */
    content: string;
    /**
     *
     * @type {number}
     * @memberof IPostComment
     */
    parentId: number;
    /**
     *
     * @type {number}
     * @memberof IPostComment
     */
    language: string;
}
