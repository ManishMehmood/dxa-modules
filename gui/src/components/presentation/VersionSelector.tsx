import * as React from "react";
import { IAppContext } from "components/container/App/App";
import { DropdownList } from "@sdl/controls-react-wrappers";
import { IProductReleaseVersion } from "interfaces/ProductReleaseVersion";
import { String } from "utils/String";

import "./styles/VersionSelector";
import "components/controls/styles/DropdownList";

/**
 * VersionSelector props
 *
 * @export
 * @interface IVersionSelectorProps
 */
export interface IVersionSelectorProps {
    selectedProductReleaseVersion?: string;
    productReleaseVersions: IProductReleaseVersion[];
    onChange: (productReleaseVersion: string) => void;
}

/**
 * VersionSelector
 */
export const VersionSelector: React.StatelessComponent<IVersionSelectorProps> =
    (props: IVersionSelectorProps, context: IAppContext): JSX.Element => {
        const { selectedProductReleaseVersion, productReleaseVersions, onChange } = props;
        const { formatMessage } = context.services.localizationService;
        return (
            <div className="sdl-dita-delivery-version-selector">
                <label>{formatMessage("productreleaseversions.version.label")}</label>
                <DropdownList propertyMappings={{ "text": "title" }}
                    selectedValue={selectedProductReleaseVersion
                        ? String.normalize(selectedProductReleaseVersion) : undefined}
                    options={productReleaseVersions || []}
                    onChange={onChange}
                    skin="graphene" />
            </div>
        );
    };

VersionSelector.contextTypes = {
    services: React.PropTypes.object.isRequired
} as React.ValidationMap<IAppContext>;
