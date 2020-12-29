import get from "lodash/get";
import kebabCase from "lodash/kebabCase";
import { plugins } from "@webiny/plugins";
import { PbRenderElementStylePlugin, PbRenderResponsiveModePlugin } from "../../../../types";

export default {
    name: "pb-render-page-element-style-height",
    type: "pb-render-page-element-style",
    renderStyle({ element, style }) {
        const { height } = get(element, "data.settings", {});
        if (!height) {
            return style;
        }

        // Get display modes
        const displayModeConfigs = plugins
            .byType<PbRenderResponsiveModePlugin>("pb-render-responsive-mode")
            .map(pl => pl.config);
        // Set per-device property value
        displayModeConfigs.forEach(({ displayMode }) => {
            style[`--${kebabCase(displayMode)}-height`] = get(
                height,
                `${displayMode}.value`,
                "auto"
            );
        });

        return style;
    }
} as PbRenderElementStylePlugin;
