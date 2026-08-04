"use strict";

const CampusSearch = (() => {

    function normalize(value) {

        return String(value || "")
            .trim()
            .toLowerCase();

    }

    function score(text, keyword) {

        if (!keyword) {
            return 1;
        }

        let total = 0;

        let index = text.indexOf(keyword);

        while (index !== -1) {

            total += 1;

            index = text.indexOf(keyword, index + keyword.length);

        }

        return total;

    }

    function search(options = {}) {

        const db = window.CampusDB;

        if (!db) {
            return [];
        }

        const keyword = normalize(options.keyword);

        const type = normalize(options.type);

        const category = normalize(options.category);

        const status = normalize(options.status);

        const featured =
            options.featured === true;

        return db.all
            .map(item => {

                const text = normalize([
                    item.title,
                    item.summary,
                    item.problem,
                    item.reframe,
                    item.body,
                    ...(item.tags || []),
                    ...(item.keywords || [])
                ].join(" "));

                return {
                    item,
                    score: score(text, keyword)
                };

            })
            .filter(result => {

                if (keyword && result.score === 0) {
                    return false;
                }

                if (
                    type &&
                    normalize(result.item.type) !== type
                ) {
                    return false;
                }

                if (
                    category &&
                    normalize(result.item.category) !== category
                ) {
                    return false;
                }

                if (
                    status &&
                    normalize(result.item.status) !== status
                ) {
                    return false;
                }

                if (
                    featured &&
                    result.item.featured !== true
                ) {
                    return false;
                }

                return true;

            })
            .sort((a, b) => {

                if (a.score !== b.score) {
                    return b.score - a.score;
                }

                return (b.item.updatedAt || "")
                    .localeCompare(a.item.updatedAt || "");

            })
            .map(result => result.item);

    }

    function byId(id) {

        const db = window.CampusDB;

        if (!db) {
            return null;
        }

        return db.relatedMap.get(id) || null;

    }

    function related(id) {

        const item = byId(id);

        if (!item) {
            return [];
        }

        return (item.relatedIds || [])
            .map(byId)
            .filter(Boolean);

    }

    function latest(type, count = 5) {

        const db = window.CampusDB;

        if (!db) {
            return [];
        }

        if (!db[type]) {
            return [];
        }

        return [...db[type]]
            .sort((a, b) =>
                (b.updatedAt || "")
                    .localeCompare(a.updatedAt || "")
            )
            .slice(0, count);

    }

    function featured(count = 6) {

        const db = window.CampusDB;

        if (!db) {
            return [];
        }

        return db.all
            .filter(item => item.featured)
            .sort((a, b) =>
                (b.updatedAt || "")
                    .localeCompare(a.updatedAt || "")
            )
            .slice(0, count);

    }

    function tags() {

        const db = window.CampusDB;

        if (!db) {
            return [];
        }

        const set = new Set();

        db.all.forEach(item => {

            (item.tags || []).forEach(tag => {

                set.add(tag);

            });

        });

        return [...set].sort();

    }

    function categories() {

        const db = window.CampusDB;

        if (!db) {
            return [];
        }

        const set = new Set();

        db.all.forEach(item => {

            if (item.category) {

                set.add(item.category);

            }

        });

        return [...set].sort();

    }

    return {

        search,

        byId,

        related,

        latest,

        featured,

        tags,

        categories

    };

})();
