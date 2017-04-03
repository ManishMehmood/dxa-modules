import { Store } from "redux";
import { String } from "sdl-models";
import { language } from "store/reducers/Language";
import { changeLanguage } from "store/actions/Actions";
import { ILocalizationService, ILanguage } from "services/interfaces/LocalizationService";
import { IState } from "store/interfaces/State";
import { browserHistory } from "react-router";

interface IDic { [path: string]: string; };
interface IDics { [lang: string]: IDic; };

export const DEFAULT_LANGUAGE: string = "en";
export const DEFAULT_LANGUAGES = ["en", "nl"];
const LANGUAGE_LOCALSTORAGE: string =  "sdl-dita-delivery-app-langugae";

const LanguageMap = require("resources/resources.languages.resjson") as ILanguage[];

const loadDics = (langs: string[]): IDics => Object.assign({},
     ...langs.map(lang => require(`resources/resources.${lang}`))
    .map((dictionary: {}) => dictionary as IDic)
    .map((dictionary: IDic, index: number) => ({[langs[index]]: dictionary})));

const Resources: IDics = loadDics(DEFAULT_LANGUAGES);
const translate = (lang: string) => (path: string) => lang in Resources ? Resources[lang][path] : null;

const formatMessage = (resource: string, variables?: string[]) => Array.isArray(variables) ? String.format(resource, variables) : resource;

/**
 * Localization service
 *
 * @export
 * @class LocalizationService
 * @implements {ILocalizationService}
 */
export class LocalizationService implements ILocalizationService {
    /**
     *
     * @type {string[]}
     * @memberOf LocalizationService
     */
    public rtlLanguages: string[] = ["ar", "dv", "fa", "ff", "he", "iw", "ps", "ur"];

    private language: string;

    /**
     * Creates an instance of LocalizationService.
     */
    public constructor() {
        this.language = localStorage.getItem(LANGUAGE_LOCALSTORAGE) || DEFAULT_LANGUAGE;

        this.formatMessage = this.formatMessage.bind(this);
        this.getDirection = this.getDirection.bind(this);
    }

    /**
     * Save current store to local storage
     *
     * @param {Store<IState>} store
     * @returns void
     */
    public setStore(store: Store<IState>): void {
        store.dispatch(changeLanguage(this.language));
        store.subscribe((): void => {
            const newLanguage = store.getState().language;

            if (newLanguage !== this.language) {
                this.language = newLanguage;
                localStorage.setItem(LANGUAGE_LOCALSTORAGE, this.language);
                this.reloadPage();
            }
        });
    }

    /**
     * Format a message
     *
     * @param {string} path Resource path
     * @param {string[]} [variables] Variables
     * @returns {string}
     */
    public formatMessage(path: string, variables?: string[]): string {
        const resource = translate(this.language)(path) || translate(DEFAULT_LANGUAGE)(path);
        return resource ? formatMessage(resource, variables) : `[${language}] Unable to localize: ${path}`;
    }

    /**
     * Get list of all languages
     *
     * @returns {ILanguage[]}
     */
    public getLanguages(): ILanguage[] {
        return DEFAULT_LANGUAGES.map((isoCode: string): ILanguage => ({"name": this.isoToName(isoCode), "iso": isoCode}));
    }

    /**
     * Convert language iso code to its name
     *
     * @param   {string} iso
     * @returns {string}
     */
    public isoToName(iso: string): string {
        const options = LanguageMap.filter((language: ILanguage) => language.iso == iso);
        return options[0] && options[0].name || iso;
    }

    /**
     * Convert language name to its iso code
     *
     * @param   {string} name
     * @returns {string}
     */
    public nameToIso(name: string): string {
        const options = LanguageMap.filter((language: ILanguage) => language.name == name);
        return options[0] && options[0].iso || name;
    }

    /**
     * Determine language direction
     *
     * @param {string} lang
     * @returns {("rtl" | "ltr")}
     */
    public getDirection(lang: string): "rtl" | "ltr" {
        return this.rtlLanguages.some((val: string) => val === lang) ? "rtl" : "ltr";
    }

    /**
     * This method forces page to reload. It helps to refersh all components.
     */
    private reloadPage(): void {
        const prevPathname = browserHistory.getCurrentLocation().pathname;

        setTimeout(() => {
            //don't need refresh is somebody changed path already it already.
            if (prevPathname === browserHistory.getCurrentLocation().pathname) {
                browserHistory.replace(prevPathname);
            }
        }, 200);
    }
}

export let localization = new LocalizationService();
