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

import * as ClassNames from "classnames";
import * as React from "react";
import * as ReactDOM from "react-dom";

import "./Dropdown.less";

/**
 * Event extension for TypeScript to get event's path property
 */
interface IPathEvent extends MouseEvent {
    path: HTMLElement[];
}

/**
 * Dropdown value item
 *
 * @export
 * @interface IDropdownValue
 */
export interface IDropdownValue {
    /**
     * Text of dropdown item
     *
     * @type {string}
     */
    text: string;
    /**
     * Value of dropdown item
     *
     * @type {string}
     */
    value: string;
    /**
     * Value's direction of dropdown item
     *
     * @type {string}
     */
    direction?: string;
}

/**
 * Toggle states to hide \ show dropdown
 *
 * @export
 */
export enum DropdownToggleState {
    "OFF",
    "ON"
};

/**
 * Interface for onChange event function
 *
 * @export
 * @interface IOnChangeEvent
 */
export interface IOnChangeEvent {
    /**
     * Function interface
     *
     * @returns {void}
     */
    (index: string): void;
}

/**
 * Dropdown interface
 *
 * @export
 * @interface IDrodownProps
 */
export interface IDropdownProps {
    /**
     * Initial selected item of dropdown
     *
     * @type {IDropdownValue}
     */
    selected?: IDropdownValue;
    /**
     * Placeholder for dropdown text when no element is selected
     *
     * @type {string}
     */
    placeHolder?: string;
    /**
     * List of dropdown items
     *
     * @type {IDropdownValue[]}
     */
    items: IDropdownValue[];
    /**
     * Executed function of selected item
     *
     * @type {IClick}
     */
    onChange?: IOnChangeEvent;
}

/**
 * Dropdown state
 *
 * @export
 * @interface
 */
export interface IDropdownState {
    /**
     * Current status of dropdown component (shown \ hidden)
     *
     * @type {DropdownToggleState}
     */
    status: DropdownToggleState;
    /**
     * Current selected item
     * @type {IDropdownValue | null}
     */
    selected: IDropdownValue | null;
}

/**
 * Dropdown
 */
export class Dropdown extends React.Component<IDropdownProps, IDropdownState> {

    private _element: HTMLElement;

    /**
     * Creates an instance of Dropdown
     *
     */
    constructor() {
        super();
        this.state = {
            selected: null,
            status: DropdownToggleState.OFF
        };

        this.onFocusout = this.onFocusout.bind(this);
        this.toggleOff = this.toggleOff.bind(this);
        this.toggleOff();
    }

    /**
     * Check if dropdown is opened
     *
     * @returns {boolean} true if dropdown is openen, otherwise false
     */
    public isOpen(): boolean {
        return this.state.status == DropdownToggleState.ON;
    }

    /**
     * Open dropdown
     *
     * @returns {void}
     */
    public toggleOn(): void {
        /* istanbul ignore if */
        if (!this.isOpen()) {
            this.setState({
                status: DropdownToggleState.ON
            } as IDropdownState);
        }
    }

    /**
     * Close dropdown
     *
     * @returns {void}
     */
    public toggleOff(): void {
        /* istanbul ignore if */
        if (this.isOpen()) {
            this.setState({
                status: DropdownToggleState.OFF
            } as IDropdownState);
        };
    }

    /**
     * Switch dropdown state
     *
     * @returns {void}
     */
    public toggle(): void {
        if (this.isOpen()) {
            this.toggleOff();
        } else {
            this.toggleOn();
        }
    }

    /**
     * Return current value of selected item
     *
     * @returns {string | null}
     */
    public getValue(): string | null {
        return this.state.selected && this.state.selected.value;
    }

    /**
     * Return current text of selected item
     *
     * @returns {string | null}
     */
    public getText(): string | null {
        return this.state.selected && this.state.selected.text;
    }

    /**
     * Component will mount
     */
    public componentWillMount(): void {
        const props = this.props;
        let selected: IDropdownValue | null = (props.selected) ? props.selected
            : (props.placeHolder) ? null
            : props.items[0];

        this.setState({
            selected
        } as IDropdownState);
    }

    /**
     * Component did mount
     */
    public componentDidMount(): void {
        const domNode = ReactDOM.findDOMNode(this);
        this._element = domNode as HTMLElement;
        document.addEventListener("click", this.onFocusout);
        window.addEventListener("resize", this.toggleOff);
    }

    /**
     * Remove listeners when component about to be unmounted
     */
    public componentWillUnmount(): void {
        document.removeEventListener("click", this.onFocusout);
        window.removeEventListener("resize", this.toggleOff);
    }

    /**
     * Render the component
     *
     * @returns {JSX.Element}
     */
    public render(): JSX.Element {
        const dropdownClasses = ClassNames("sdl-dita-delivery-dropdown", {
            "open": this.isOpen()
        });

        const items = this.props.items.map((item, index): JSX.Element => {
            const itemStyle = item.direction ? {direction: item.direction} : undefined;
            if (this.state.selected && item.value == this.state.selected.value) {
                return (<li key={item.value} className="active">
                        <a style={itemStyle}>
                            {item.text}
                            <span className="checked"/>
                        </a>
                    </li>);
            } else {
                return (
                    <li key={item.value} onClick={this.onClickItem.bind(this, index)}>
                        <a style={itemStyle}>{item.text}</a>
                    </li>
                );
            }
        });
        const options = this.props.items.map(item => <option key={item.value} value={item.value}>{item.text}</option>);

        return (
            <div className={dropdownClasses}>
                <button className="dropdown-toggle" type="button" data-toggle="dropdown" onClick={this.toggle.bind(this)}>
                    {this._getButtonText()}
                    <span className="caret">
                    </span>
                </button>
                <div className="dropdown-menu">
                    <div className="dropdown-arrow"></div>
                    <ul className="dropdown-items">
                        {items}
                    </ul>
                </div>
                <select defaultValue={this.state.selected && this.state.selected.value || undefined} onChange={this.onChangeSelect.bind(this)}>
                    {options}
                </select>
            </div>
        );
    }

    private _getButtonText(): string {
        let buttonText;
        if (this.state.selected) {
            buttonText = this.state.selected.text;
        } else if (this.props.placeHolder) {
            buttonText = this.props.placeHolder;
        } else {
            buttonText = "";
        }
        return buttonText;
    }

    private onFocusout(event: MouseEvent): void {
        const eventWithPath = event as IPathEvent;
        const eventPath = eventWithPath.path || this.eventPath(event);

        /* istanbul ignore if */
        if (eventPath && eventPath.indexOf(this._element) == -1) {
            this.toggleOff();
        }
    }

    private onClickItem(index: number): void {
        this.setState({
            selected: this.props.items[index]
        } as IDropdownState);
        this.toggleOff();

        /* istanbul ignore if */
        if (this.props.onChange) {
            this.props.onChange(this.props.items[index].value);
        }
    }

    private onChangeSelect(event: React.FormEvent<HTMLSelectElement>): void {
        const selectedValue = event.currentTarget.value;
        const items = this.props.items;
        const values = items.map((item: IDropdownValue) => item.value);
        return this.onClickItem(values.indexOf(selectedValue));
    }

    private eventPath(event: MouseEvent): (Element | Document | Window)[] {
        const path: (Element | Document | Window)[] = [];
        let currentElement = event.target as HTMLElement | null;

        while (currentElement) {
            path.push(currentElement);
            currentElement = currentElement.parentElement;
        }
        /* istanbul ignore if */
        if (path.indexOf(window) === -1 && path.indexOf(document) === -1) {
            path.push(document);
        }
        /* istanbul ignore if */
        if (path.indexOf(window) === -1) {
            path.push(window);
        }

        return path;
    }
}
