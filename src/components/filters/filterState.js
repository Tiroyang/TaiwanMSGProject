// src/components/filters/filterState.js

export function createInitialFilters() {
    return {
        hideTypes: {
            movies: false,
            series: false,
            games: false,
        },

        statusMode: "all",
        statusHidden: new Set(),

        dateRange: {
            start: "",
            end: "",
            hideNoDate: false,
        },

        countryPreset: "none",
        countryTri: new Map(),
        countryCoMode: false,

        genreTri: new Map(),

        langMode: "none",

        langMV: {
            active: "orig",

            hidden: {
                orig: new Set(),
                dub: new Set(),
                sub: new Set(),
            },

            preset: {
                orig: "all",
                dub: "all",
                sub: "all",
            },
        },

        langGM: {
            active: "sub",

            hidden: {
                sub: new Set(),
                voice: new Set(),
                ui: new Set(),
            },

            preset: {
                sub: "all",
                voice: "all",
                ui: "all",
            },
        },

        hideNoMainImage: false,
    };
}

/* Reducer */
export function filterReducer(state, action) {
    switch (action.type) {
        case "RESET":
            return createInitialFilters();

        case "REPLACE":
            return action.value;

        case "TOGGLE_TYPE":
            return {
                ...state,
                hideTypes: {
                    ...state.hideTypes,
                    [action.key]:
                        !state.hideTypes[action.key],
                },
            };

        case "SET_DATE_START":
            return {
                ...state,
                dateRange: {
                    ...state.dateRange,
                    start: action.value,
                },
            };

        case "SET_DATE_END":
            return {
                ...state,
                dateRange: {
                    ...state.dateRange,
                    end: action.value,
                },
            };

        case "SET_HIDE_NO_DATE":
            return {
                ...state,
                dateRange: {
                    ...state.dateRange,
                    hideNoDate: action.value,
                },
            };

        case "TOGGLE_STATUS": {
            const next = new Set(
                state.statusHidden
            );

            if (next.has(action.status)) {
                next.delete(action.status);
            } else {
                next.add(action.status);
            }

            return {
                ...state,
                statusHidden: next,
                statusMode: action.mode || "custom",
            };
        }

        case "SET_STATUS_ALL":
            return {
                ...state,
                statusMode: "all",
                statusHidden: new Set(),
            };

        case "SET_STATUS_NONE":
            return {
                ...state,
                statusMode: "none",
                statusHidden: new Set(
                    action.names
                ),
            };

        case "SET_COUNTRY_TRI": {
            const next = new Map(
                state.countryTri
            );

            next.set(
                action.name,
                action.value
            );

            return {
                ...state,
                countryTri: next,
                countryPreset: "custom",
            };
        }

        case "SET_COUNTRY_STATE":
            return {
                ...state,
                countryTri:
                    action.countryTri,
                countryPreset:
                    action.countryPreset,
                countryCoMode:
                    action.countryCoMode,
            };

        case "SET_GENRE_TRI": {
            const next = new Map(
                state.genreTri
            );

            if (action.value === "show") {
                next.delete(action.name);
            } else {
                next.set(
                    action.name,
                    action.value
                );
            }

            return {
                ...state,
                genreTri: next,
            };
        }

        case "SET_GENRE_MAP":
            return {
                ...state,
                genreTri: action.value,
            };

        case "SET_LANG_MODE":
            return {
                ...state,
                langMode: action.value,
            };

        case "SET_LANG_ACTIVE":
            return {
                ...state,
                [action.langKey]: {
                    ...state[action.langKey],
                    active: action.value,
                },
            };

        case "SET_LANG_HIDDEN":
            return {
                ...state,
                [action.langKey]: {
                    ...state[action.langKey],

                    hidden: {
                        ...state[action.langKey].hidden,
                        [action.branch]:
                            action.hidden,
                    },

                    preset: {
                        ...state[action.langKey].preset,
                        [action.branch]:
                            action.preset,
                    },
                },
            };

        case "SET_HIDE_NO_MAIN_IMAGE":
            return {
                ...state,
                hideNoMainImage:
                    action.value,
            };

        default:
            return state;
    }
}

/* Clone Filter State */
export function cloneFilterState(state) {
    return {
        ...state,

        hideTypes: {
            ...state.hideTypes,
        },

        statusHidden: new Set(
            state.statusHidden
        ),

        dateRange: {
            ...state.dateRange,
        },

        countryTri: new Map(
            state.countryTri
        ),

        genreTri: new Map(
            state.genreTri
        ),

        langMV: {
            ...state.langMV,

            hidden: {
                orig: new Set(
                    state.langMV.hidden.orig
                ),

                dub: new Set(
                    state.langMV.hidden.dub
                ),

                sub: new Set(
                    state.langMV.hidden.sub
                ),
            },

            preset: {
                ...state.langMV.preset,
            },
        },

        langGM: {
            ...state.langGM,

            hidden: {
                sub: new Set(
                    state.langGM.hidden.sub
                ),

                voice: new Set(
                    state.langGM.hidden.voice
                ),

                ui: new Set(
                    state.langGM.hidden.ui
                ),
            },

            preset: {
                ...state.langGM.preset,
            },
        },
    };
}