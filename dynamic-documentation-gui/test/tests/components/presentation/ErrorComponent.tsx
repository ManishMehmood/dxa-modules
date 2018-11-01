import * as React from "react";
import * as ReactDOM from "react-dom";
import { Error, IErrorProps } from "@sdl/dd/presentation/Error";
import { ComponentWithContext } from "test/mocks/ComponentWithContext";
import { TestBase } from "@sdl/models";
import { Button } from "@sdl/controls-react-wrappers";
import { ButtonPurpose } from "@sdl/controls";

import { RENDER_DELAY } from "test/Constants";

class ErrorComponent extends TestBase {

    public runTests(): void {

        describe(`Error component tests.`, (): void => {
            const target = super.createTargetElement();
            const onClickHome = jasmine.createSpy("homeSpy");
            const onClickReturn = jasmine.createSpy("returnSpy");
            const title: string = "Error Title";
            const messages: string[] = ["Something went wrong", "What do you want to do?"];
            const buttons = <div>
                <Button skin="graphene" purpose={ButtonPurpose.CONFIRM} events={{"click": onClickHome}}>Home</Button>
                <Button skin="graphene" purpose={ButtonPurpose.CONFIRM} events={{"click": onClickReturn}}>Return</Button>
            </div>;

            const props: IErrorProps = {
                buttons: buttons,
                title: title,
                messages: messages
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

            it("Correct component render", (): void => {
                this._renderComponent(props, target);
                const errorElement = document.querySelector(".sdl-dita-delivery-error") as HTMLElement;
                const errorButtons = errorElement.querySelectorAll(".sdl-button");
                const errorTitle = errorElement.querySelectorAll("h1");
                const errorMessage = errorElement.querySelectorAll("p");

                expect(errorElement).not.toBeNull();
                expect(errorButtons.length).toBe(2);
                expect(errorTitle.length).toBe(1);
                expect(errorTitle.item(0).textContent).toBe(props.title);
                expect(errorMessage.length).toBe(2);
                expect(errorMessage.item(0).textContent).toBe(props.messages[0]);
                expect(errorMessage.item(1).textContent).toBe(props.messages[1]);
            });

            it("Check button clicks", (done: () => void): void => {
                this._renderComponent(props, target);
                const errorElement = document.querySelector(".sdl-dita-delivery-error") as HTMLButtonElement;
                const errorButtons = errorElement.querySelectorAll(".sdl-button") as NodeListOf<HTMLButtonElement>;

                errorButtons.item(0).click();
                errorButtons.item(1).click();
                setTimeout((): void => {
                    expect(onClickHome).toHaveBeenCalled();
                    expect(onClickReturn).toHaveBeenCalled();
                    done();
                }, RENDER_DELAY);
            });
        });
    }

    private _renderComponent(props: IErrorProps, target: HTMLElement): void {
        ReactDOM.render(<ComponentWithContext><Error {...props} /></ComponentWithContext>, target);
    }
}

new ErrorComponent().runTests();