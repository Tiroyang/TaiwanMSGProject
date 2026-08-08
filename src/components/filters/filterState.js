// src/components/filters/filterState.js

export function createInitialFilters() {
    return {
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

        langMV: {
            active: "orig",

            tri: {
                orig: new Map(),
                dub: new Map(),
                sub: new Map(),
            },

            preset: {
                orig: "all",
                dub: "all",
                sub: "all",
            },
        },

        langGM: {
            active: "sub",

            tri: {
                sub: new Map(),
                voice: new Map(),
                ui: new Map(),
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


/* =========================================================
   Reducer
========================================================= */

export function filterReducer(state, action) {
    switch (action.type) {
        /* =========================
           全部
        ========================= */

        case "RESET":
            return createInitialFilters();

        case "REPLACE":
            return cloneFilterState(action.value);

        /* =========================
           狀態
        ========================= */

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
                    action.names || []
                ),
            };

        case "TOGGLE_STATUS": {
            const nextHidden = new Set(
                state.statusHidden
            );

            if (
                nextHidden.has(action.status)
            ) {
                nextHidden.delete(
                    action.status
                );
            } else {
                nextHidden.add(
                    action.status
                );
            }

            const totalCount =
                action.totalCount || 0;

            let statusMode = "custom";

            if (nextHidden.size === 0) {
                statusMode = "all";
            } else if (
                totalCount > 0 &&
                nextHidden.size === totalCount
            ) {
                statusMode = "none";
            }

            return {
                ...state,

                statusHidden: nextHidden,
                statusMode,
            };
        }


        /* =========================
           日期
        ========================= */

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

                    hideNoDate:
                        action.value,
                },
            };

        case "RESET_DATE":
            return {
                ...state,

                dateRange: {
                    start: "",
                    end: "",
                    hideNoDate: false,
                },
            };


        /* =========================
           國家
        ========================= */

        case "SET_COUNTRY_TRI": {
            const next = new Map(
                state.countryTri
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

                countryTri: next,
                countryPreset: "custom",
                countryCoMode: false,
            };
        }

        case "SET_COUNTRY_STATE":
            return {
                ...state,

                countryTri: new Map(
                    action.countryTri || []
                ),

                countryPreset:
                    action.countryPreset ??
                    "none",

                countryCoMode:
                    Boolean(
                        action.countryCoMode
                    ),
            };

        case "RESET_COUNTRY":
            return {
                ...state,

                countryTri: new Map(),
                countryPreset: "none",
                countryCoMode: false,
            };


        /* =========================
           類型 / Genre
        ========================= */

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

        /* =========================
            收費模式 / Pricing Model
            遊戲專用
        ========================= */

        case "SET_PRICING_MODEL_TRI": {
            const next = new Map(
                state.pricingModelTri
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
                pricingModelTri: next,
            };
        }

        case "SET_PRICING_MODEL_ALL":
            return {
                ...state,
                pricingModelTri: new Map(),
            };

        case "SET_PRICING_MODEL_NONE": {
            const next = new Map();

            for (
                const name of action.names || []
            ) {
                next.set(
                    name,
                    "hide"
                );
            }

            return {
                ...state,
                pricingModelTri: next,
            };
        }

        case "RESET_PRICING_MODEL":
            return {
                ...state,
                pricingModelTri: new Map(),
            };

        case "SET_GENRE_ALL":
            return {
                ...state,
                genreTri: new Map(),
            };

        case "SET_GENRE_NONE": {
            const next = new Map();

            for (
                const name of action.names || []
            ) {
                next.set(name, "hide");
            }

            return {
                ...state,
                genreTri: next,
            };
        }

        case "SET_ADULT_HIDDEN": {
            const next = new Map(
                state.genreTri
            );

            if (action.value) {
                next.set(
                    "成人",
                    "hide"
                );
            } else {
                next.delete("成人");
            }

            return {
                ...state,
                genreTri: next,
            };
        }

        case "RESET_GENRE":
            return {
                ...state,
                genreTri: new Map(),
            };


        /* =========================
           語言
        ========================= */

        case "SET_LANG_ACTIVE":
            return {
                ...state,

                [action.langKey]: {
                    ...state[action.langKey],

                    active: action.value,
                },
            };

        case "SET_LANG_PRESET": {
            const {
                langKey,
                branch,
                mode,
                names = [],
            } = action;

            const nextTri = new Map();

            if (mode === "none") {
                for (const name of names) {
                    nextTri.set(
                        name,
                        "hide"
                    );
                }
            }

            return {
                ...state,

                [langKey]: {
                    ...state[langKey],

                    tri: {
                        ...state[langKey].tri,

                        [branch]:
                            nextTri,
                    },

                    preset: {
                        ...state[
                            langKey
                        ].preset,

                        [branch]: mode,
                    },
                },
            };
        }

        case "SET_LANG_TRI": {
            const {
                langKey,
                branch,
                name,
                value,
                names = [],
            } = action;

            const currentTri =
                state[langKey].tri[
                branch
                ] || new Map();

            const nextTri =
                new Map(currentTri);

            if (value === "show") {
                nextTri.delete(name);
            } else {
                nextTri.set(
                    name,
                    value
                );
            }

            const hasForce =
                names.some(
                    (item) =>
                        (
                            nextTri.get(item) ||
                            "show"
                        ) === "force"
                );

            const allShow =
                names.length > 0 &&
                names.every(
                    (item) =>
                        (
                            nextTri.get(item) ||
                            "show"
                        ) === "show"
                );

            const allHide =
                names.length > 0 &&
                names.every(
                    (item) =>
                        (
                            nextTri.get(item) ||
                            "show"
                        ) === "hide"
                );

            let preset =
                "custom";

            if (
                allShow &&
                !hasForce
            ) {
                preset = "all";
            } else if (
                allHide &&
                !hasForce
            ) {
                preset = "none";
            }

            return {
                ...state,

                [langKey]: {
                    ...state[langKey],

                    tri: {
                        ...state[
                            langKey
                        ].tri,

                        [branch]:
                            nextTri,
                    },

                    preset: {
                        ...state[
                            langKey
                        ].preset,

                        [branch]:
                            preset,
                    },
                },
            };
        }

        case "RESET_LANG":
            return {
                ...state,

                langMV: {
                    active: "orig",

                    tri: {
                        orig: new Map(),
                        dub: new Map(),
                        sub: new Map(),
                    },

                    preset: {
                        orig: "all",
                        dub: "all",
                        sub: "all",
                    },
                },

                langGM: {
                    active: "sub",

                    tri: {
                        sub: new Map(),
                        voice: new Map(),
                        ui: new Map(),
                    },

                    preset: {
                        sub: "all",
                        voice: "all",
                        ui: "all",
                    },
                },
            };


        /* =========================
           主視覺圖
        ========================= */

        case "SET_HIDE_NO_MAIN_IMAGE":
            return {
                ...state,

                hideNoMainImage:
                    action.value,
            };

        case "RESET_IMAGE":
            return {
                ...state,

                hideNoMainImage: false,
            };


        default:
            return state;
    }
}


/* =========================================================
   Clone
========================================================= */

export function cloneFilterState(state) {
    return {
        ...state,

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

        pricingModelTri: new Map(),

        langMV: {
            ...state.langMV,

            tri: {
                orig: new Map(
                    state.langMV.tri.orig
                ),

                dub: new Map(
                    state.langMV.tri.dub
                ),

                sub: new Map(
                    state.langMV.tri.sub
                ),
            },

            preset: {
                ...state.langMV.preset,
            },
        },

        langGM: {
            ...state.langGM,

            tri: {
                sub: new Map(
                    state.langGM.tri.sub
                ),

                voice: new Map(
                    state.langGM.tri.voice
                ),

                ui: new Map(
                    state.langGM.tri.ui
                ),
            },

            preset: {
                ...state.langGM.preset,
            },
        },
    };
}