import { Context, ContextPlugin } from "@webiny/handler/types";
import { TypeValueEmitter } from "@webiny/api-headless-cms/content/plugins/utils/TypeValueEmitter";
import { CmsContext } from "@webiny/api-headless-cms/types";

export type CmsHttpParametersType = {
    type: string;
    locale: string;
};

const throwPlainError = (type: string): void => {
    throw new Error(`Missing context.http.path.parameter "${type}".`);
};

const throwRegexError = (type: string, regex: string): void => {
    throw new Error(`Parameter part "${type}" does not match a "${regex}" regex.`);
};

export const extractHandlerHttpParameters = (context: Context): CmsHttpParametersType => {
    const { key = "" } = context.http.path.parameters || {};
    const [type, locale] = key.split("/");
    if (!type) {
        throwPlainError("type");
    } else if (!locale) {
        throwPlainError("locale");
    } else if (locale.match(/^([a-zA-Z]{2})-([a-zA-Z]{2})$/) === null) {
        throwRegexError("locale", "^([a-zA-Z]{2})-([a-zA-Z]{2})$");
    }

    return {
        type,
        locale
    };
};

const setContextCmsVariables = async (context: CmsContext): Promise<void> => {
    const locale = await context.i18n.getLocale(context.cms.locale);
    if (!locale) {
        throw new Error(`There is no locale "${context.cms.locale}" in the system.`);
    }
    const settings = await context.cms.settings.get();
    context.cms.getLocale = () => locale;
    context.cms.getSettings = () => ({
        ...settings,
        contentModelLastChange: context.cms.settings.contentModelLastChange
    });
};

export default (options: any = {}): ContextPlugin<CmsContext> => ({
    type: "context",
    apply: async context => {
        const { type, locale } = extractHandlerHttpParameters(context);

        context.cms = {
            ...(context.cms || ({} as any)),
            type,
            locale,
            dataManagerFunction: options.dataManagerFunction,
            READ: type === "read",
            PREVIEW: type === "preview",
            MANAGE: type === "manage"
        };

        if (!context.cms.MANAGE) {
            context.resolvedValues = new TypeValueEmitter();
        }
        await setContextCmsVariables(context);
    }
});
