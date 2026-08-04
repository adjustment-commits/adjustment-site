"use strict";

const CampusLoader = (() => {

    const DATA_ROOT = "./data";

    const DATASETS = [
        "research",
        "cases",
        "pds",
        "dictionary",
        "updates"
    ];

    const db = {
        meta: {},
        schema: {},
        research: [],
        cases: [],
        pds: [],
        dictionary: [],
        updates: [],
        all: [],
        relatedMap: new Map(),
        searchIndex: []
    };

    async function load() {

        await loadMeta();

        await loadSchema();

        await loadDatasets();

        buildAll();

        buildRelatedMap();

        buildSearchIndex();

        sortCollections();

        validateRelations();

        window.CampusDB = db;

        document.dispatchEvent(
            new CustomEvent("campus:loaded", {
                detail: db
            })
        );

        return db;

    }

    async function loadMeta() {

        db.meta = await fetchJson(`${DATA_ROOT}/meta.json`);

    }

    async function loadSchema() {

        db.schema = await fetchJson(`${DATA_ROOT}/schema.json`);

    }

    async function loadDatasets() {

        for (const name of DATASETS) {

            const url = `${DATA_ROOT}/${name}.json`;

            try {

                const json = await fetchJson(url);

                db[name] = Array.isArray(json)
                    ? json
                    : json[name] || [];

            } catch (error) {

                console.warn(`Cannot load ${url}`, error);

                db[name] = [];

            }

        }

    }

    function buildAll() {

        db.all = [];

        DATASETS.forEach(type => {

            db[type].forEach(item => {

                item.type = type;

                db.all.push(item);

            });

        });

    }

    function buildRelatedMap() {

        db.relatedMap.clear();

        db.all.forEach(item => {

            db.relatedMap.set(item.id, item);

        });

    }

    function buildSearchIndex() {

        db.searchIndex = db.all.map(item => {

            return {

                id: item.id,

                type: item.type,

                text: [
                    item.title,
                    item.summary,
                    item.problem,
                    item.reframe,
                    item.body,
                    ...(item.tags || []),
                    ...(item.keywords || [])
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()

            };

        });

    }

    function sortCollections() {

        DATASETS.forEach(type => {

            db[type].sort((a, b) => {

                const da = a.updatedAt || "";
                const dbb = b.updatedAt || "";

                return dbb.localeCompare(da);

            });

        });

    }

    function validateRelations() {

        db.all.forEach(item => {

            if (!Array.isArray(item.relatedIds)) {
                return;
            }

            item.relatedIds.forEach(id => {

                if (!db.relatedMap.has(id)) {

                    console.warn(
                        `[Campus] Missing related item: ${item.id} -> ${id}`
                    );

                }

            });

        });

    }

    async function fetchJson(url) {

        const response = await fetch(url, {
            cache: "no-cache"
        });

        if (!response.ok) {

            throw new Error(
                `${response.status} ${response.statusText}`
            );

        }

        return response.json();

    }

    return {

        load,

        get database() {
            return db;
        }

    };

})();

document.addEventListener("DOMContentLoaded", () => {

    CampusLoader.load();

});
