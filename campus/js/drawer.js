"use strict2;

const CampusDrawer = (() => {
const state = {
isOpen: false,
activeContentId: "",
lastFocusedElement: null
};

const elements = {
    backdrop: null,
    drawer: null,
    closeButton: null,
    eyebrow: null,
    title: null,
    summary: null,
    meta: null,
    problem: null,
    reframe: null,
    possibilities: null,
    checkpoints: null,
    nextMove: null,
    limitation: null,
    related: null
};

function initializeElements() {
    elements.backdrop =
        document.getElementById("drawerBackdrop");

    elements.drawer =
        document.getElementById("detailDrawer");

    elements.closeButton =
        document.getElementById("drawerClose");

    elements.eyebrow =
        document.getElementById("drawerEyebrow");

    elements.title =
        document.getElementById("drawerTitle");

    elements.summary =
        document.getElementById("drawerSummary");

    elements.meta =
        document.getElementById("drawerMeta");

    elements.problem =
        document.getElementById("drawerProblem");

    elements.reframe =
        document.getElementById("drawerReframe");

    elements.possibilities =
        document.getElementById(
            "drawerPossibilities"
        );

    elements.checkpoints =
        document.getElementById(
            "drawerCheckpoints"
        );

    elements.nextMove =
        document.getElementById("drawerNextMove");

    elements.limitation =
        document.getElementById(
            "drawerLimitation"
        );

    elements.related =
        document.getElementById("drawerRelated");
}

function isReady() {
    return Boolean(
        elements.backdrop &&
        elements.drawer &&
        elements.closeButton
    );
}

function normalizeString(value, fallback = "") {
    if (typeof value !== "string") {
        return fallback;
    }

    const normalized = value.trim();

    return normalized || fallback;
}

function normalizeArray(value) {
    return Array.isArray(value)
        ? value
        : [];
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatType(type) {
    const normalized =
        normalizeString(type, "content");

    return normalized.toUpperCase();
}

function formatDate(value) {
    const normalized =
        normalizeString(value);

    if (!normalized) {
        return "";
    }

    const match = normalized.match(
        /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/
    );

    if (!match) {
        return normalized;
    }

    return [
        match[1],
        match[2],
        match[3]
    ].join(".");
}

function getContentById(contentId) {
    if (
        typeof CampusSearch !== "undefined" &&
        CampusSearch &&
        typeof CampusSearch.byId === "function"
    ) {
        return CampusSearch.byId(contentId);
    }

    const db = window.CampusDB;

    if (!db) {
        return null;
    }

    if (
        db.relatedMap instanceof Map &&
        db.relatedMap.has(contentId)
    ) {
        return db.relatedMap.get(contentId);
    }

    return normalizeArray(db.all).find((item) => {
        return item.id === contentId;
    }) || null;
}

function getRelatedContents(content) {
    if (!content) {
        return [];
    }

    if (
        typeof CampusSearch !== "undefined" &&
        CampusSearch &&
        typeof CampusSearch.related === "function"
    ) {
        return CampusSearch.related(content.id);
    }

    return normalizeArray(content.relatedIds)
        .map((contentId) => {
            return getContentById(contentId);
        })
        .filter(Boolean);
}

function getFocusableElements() {
    if (!elements.drawer) {
        return [];
    }

    const selector = [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])"
    ].join(",");

    return Array.from(
        elements.drawer.querySelectorAll(selector)
    ).filter((element) => {
        return (
            !element.hidden &&
            element.getAttribute("aria-hidden") !==
                "true"
        );
    });
}

function setText(element, value, fallback = "") {
    if (!element) {
        return;
    }

    element.textContent =
        normalizeString(value, fallback);
}

function renderMeta(content) {
    if (!elements.meta) {
        return;
    }

    const items = [];

    const code =
        normalizeString(content.code);

    const status =
        normalizeString(
            content.statusLabel,
            normalizeString(content.status)
        );

    const version =
        normalizeString(content.version);

    const updatedAt =
        formatDate(content.updatedAt);

    if (code) {
        items.push({
            value: code,
            className: "tag"
        });
    }

    if (status) {
        items.push({
            value: status.toUpperCase(),
            className: [
                "tag",
                normalizeString(
                    content.statusClass
                )
            ]
                .filter(Boolean)
                .join(" ")
        });
    }

    if (version) {
        items.push({
            value: "VERSION " + version,
            className: "tag"
        });
    }

    if (updatedAt) {
        items.push({
            value: updatedAt,
            className: "tag"
        });
    }

    normalizeArray(content.tags).forEach((tag) => {
        const value = normalizeString(tag);

        if (!value) {
            return;
        }

        items.push({
            value,
            className: "tag"
        });
    });

    elements.meta.innerHTML = items
        .map((item) => {
            return (
                '<span class="' +
                escapeHtml(item.className) +
                '">' +
                escapeHtml(item.value) +
                "</span>"
            );
        })
        .join("");
}

function renderPossibilities(content) {
    if (!elements.possibilities) {
        return;
    }

    const possibilities =
        normalizeArray(content.possibilities);

    if (possibilities.length === 0) {
        elements.possibilities.innerHTML =
            '<div class="drawer-list-item">' +
            "<strong>Under review</strong>" +
            "<span>No possibilities are available.</span>" +
            "</div>";

        return;
    }

    elements.possibilities.innerHTML =
        possibilities
            .map((item, index) => {
                const title =
                    normalizeString(
                        item.title,
                        "Possibility " +
                            String(index + 1)
                    );

                const description =
                    normalizeString(
                        item.description,
                        "No description."
                    );

                return (
                    '<div class="drawer-list-item">' +
                    "<strong>" +
                    escapeHtml(title) +
                    "</strong>" +
                    "<span>" +
                    escapeHtml(description) +
                    "</span>" +
                    "</div>"
                );
            })
            .join("");
}

function renderCheckpoints(content) {
    if (!elements.checkpoints) {
        return;
    }

    const checkpoints =
        normalizeArray(content.checkpoints);

    if (checkpoints.length === 0) {
        elements.checkpoints.innerHTML =
            '<div class="drawer-list-item">' +
            "<strong>Under review</strong>" +
            "<span>No checkpoints are available.</span>" +
            "</div>";

        return;
    }

    elements.checkpoints.innerHTML =
        checkpoints
            .map((item, index) => {
                const title =
                    normalizeString(
                        item.title,
                        "Checkpoint " +
                            String(index + 1)
                    );

                const description =
                    normalizeString(
                        item.description,
                        "No description."
                    );

                const method =
                    normalizeString(item.method);

                const reference =
                    normalizeString(item.reference);

                const details = [
                    description,
                    method
                        ? "Method: " + method
                        : "",
                    reference
                        ? "Reference: " + reference
                        : ""
                ]
                    .filter(Boolean)
                    .join(" ");

                return (
                    '<div class="drawer-list-item">' +
                    "<strong>" +
                    escapeHtml(title) +
                    "</strong>" +
                    "<span>" +
                    escapeHtml(details) +
                    "</span>" +
                    "</div>"
                );
            })
            .join("");
}

function renderRelated(content) {
    if (!elements.related) {
        return;
    }

    const relatedContents =
        getRelatedContents(content);

    if (relatedContents.length === 0) {
        elements.related.innerHTML =
            '<div class="drawer-related-item">' +
            "<strong>No related content</strong>" +
            "<span>Related thinking is under review.</span>" +
            "</div>";

        return;
    }

    elements.related.innerHTML =
        relatedContents
            .map((related) => {
                const type =
                    formatType(related.type);

                const code =
                    normalizeString(
                        related.code,
                        related.id
                    );

                return (
                    '<button class="drawer-related-item"' +
                    ' type="button"' +
                    ' data-drawer-content-id="' +
                    escapeHtml(related.id) +
                    '">' +
                    "<strong>" +
                    escapeHtml(related.title) +
                    "</strong>" +
                    "<span>" +
                    escapeHtml(
                        type + " / " + code
                    ) +
                    "</span>" +
                    "</button>"
                );
            })
            .join("");
}

function render(content) {
    const type = formatType(content.type);

    const code =
        normalizeString(
            content.code,
            content.id
        );

    setText(
        elements.eyebrow,
        type + " / " + code,
        "ADJUSTMENT THINKING"
    );

    setText(
        elements.title,
        content.title,
        "Untitled"
    );

    setText(
        elements.summary,
        content.summary,
        "No summary."
    );

    setText(
        elements.problem,
        content.problem,
        "No problem statement."
    );

    setText(
        elements.reframe,
        content.reframe,
        "No reframe statement."
    );

    setText(
        elements.nextMove,
        content.nextMove,
        "No next move."
    );

    setText(
        elements.limitation,
        content.limitation,
        "This content may include working hypotheses."
    );

    renderMeta(content);
    renderPossibilities(content);
    renderCheckpoints(content);
    renderRelated(content);
}

function updateUrl(contentId) {
    const url = new URL(window.location.href);

    if (contentId) {
        url.searchParams.set("content", contentId);
    } else {
        url.searchParams.delete("content");
    }

    window.history.replaceState(
        window.history.state,
        "",
        url
    );
}

function open(
    contentId,
    triggerElement = null,
    options = {}
) {
    if (!isReady()) {
        return false;
    }

    const content =
        getContentById(contentId);

    if (!content) {
        console.warn(
            "[CampusDrawer] Content not found:",
            contentId
        );

        return false;
    }

    const preserveFocus =
        options.preserveFocus === true;

    const updateHistory =
        options.updateHistory !== false;

    if (
        !preserveFocus &&
        triggerElement instanceof HTMLElement
    ) {
        state.lastFocusedElement =
            triggerElement;
    }

    state.activeContentId = content.id;

    render(content);

    elements.drawer.classList.add("is-open");
    elements.drawer.setAttribute(
        "aria-hidden",
        "false"
    );

    elements.backdrop.classList.add("is-open");
    elements.backdrop.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add("menu-open");

    state.isOpen = true;

    if (updateHistory) {
        updateUrl(content.id);
    }

    window.requestAnimationFrame(() => {
        elements.closeButton.focus();
    });

    document.dispatchEvent(
        new CustomEvent("campus:drawer-open", {
            detail: {
                content
            }
        })
    );

    return true;
}

function close(options = {}) {
    if (!isReady() || !state.isOpen) {
        return;
    }

    const restoreFocus =
        options.restoreFocus !== false;

    const updateHistory =
        options.updateHistory !== false;

    elements.drawer.classList.remove("is-open");
    elements.drawer.setAttribute(
        "aria-hidden",
        "true"
    );

    elements.backdrop.classList.remove("is-open");
    elements.backdrop.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove("menu-open");

    state.isOpen = false;
    state.activeContentId = "";

    if (updateHistory) {
        updateUrl("");
    }

    if (
        restoreFocus &&
        state.lastFocusedElement instanceof
            HTMLElement &&
        document.contains(
            state.lastFocusedElement
        )
    ) {
        state.lastFocusedElement.focus();
    }

    state.lastFocusedElement = null;

    document.dispatchEvent(
        new CustomEvent("campus:drawer-close")
    );
}

function trapFocus(event) {
    if (
        !state.isOpen ||
        event.key !== "Tab"
    ) {
        return;
    }

    const focusableElements =
        getFocusableElements();

    if (focusableElements.length === 0) {
        event.preventDefault();
        elements.drawer.focus();
        return;
    }

    const firstElement =
        focusableElements[0];

    const lastElement =
        focusableElements[
            focusableElements.length - 1
        ];

    if (
        event.shiftKey &&
        document.activeElement === firstElement
    ) {
        event.preventDefault();
        lastElement.focus();
        return;
    }

    if (
        !event.shiftKey &&
        document.activeElement === lastElement
    ) {
        event.preventDefault();
        firstElement.focus();
    }
}

function handleKeydown(event) {
    if (
        event.key === "Escape" &&
        state.isOpen
    ) {
        event.preventDefault();
        close();
        return;
    }

    trapFocus(event);
}

function handleBackdropPointerDown(event) {
    if (event.target === elements.backdrop) {
        close();
    }
}

function findContentTrigger(target) {
    if (!(target instanceof Element)) {
        return null;
    }

    return target.closest(
        [
            "[data-drawer-content-id]",
            "[data-content-id]",
            "[data-thinking-id]",
            "[data-update-content-id]"
        ].join(",")
    );
}

function getTriggerContentId(trigger) {
    return (
        trigger.dataset.drawerContentId ||
        trigger.dataset.contentId ||
        trigger.dataset.thinkingId ||
        trigger.dataset.updateContentId ||
        ""
    );
}

function handleDocumentClick(event) {
    const trigger =
        findContentTrigger(event.target);

    if (!trigger) {
        return;
    }

    const contentId =
        getTriggerContentId(trigger);

    if (!contentId) {
        return;
    }

    event.preventDefault();

    open(contentId, trigger, {
        preserveFocus:
            trigger.closest(
                "#detailDrawer"
            ) !== null
    });
}

function handleUrlState() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    const contentId =
        normalizeString(
            params.get("content")
        );

    if (!contentId) {
        return;
    }

    open(contentId, null, {
        preserveFocus: true,
        updateHistory: false
    });
}

function bindEvents() {
    elements.closeButton.addEventListener(
        "click",
        () => {
            close();
        }
    );

    elements.backdrop.addEventListener(
        "pointerdown",
        handleBackdropPointerDown
    );

    document.addEventListener(
        "click",
        handleDocumentClick
    );

    document.addEventListener(
        "keydown",
        handleKeydown
    );

    window.addEventListener(
        "popstate",
        handleUrlState
    );
}

function initialize() {
    initializeElements();

    if (!isReady()) {
        console.warn(
            "[CampusDrawer] Required elements are missing."
        );

        return;
    }

    if (!elements.drawer.hasAttribute("tabindex")) {
        elements.drawer.setAttribute(
            "tabindex",
            "-1"
        );
    }

    bindEvents();

    if (window.CampusDB) {
        handleUrlState();
    } else {
        document.addEventListener(
            "campus:loaded",
            handleUrlState,
            {
                once: true
            }
        );
    }
}

function getActiveContent() {
    return getContentById(
        state.activeContentId
    );
}

return {
    initialize,
    open,
    close,
    getActiveContent,

    get isOpen() {
        return state.isOpen;
    },

    get activeContentId() {
        return state.activeContentId;
    }
};

})();

if (document.readyState === "loading") {
document.addEventListener(
"DOMContentLoaded",
CampusDrawer.initialize,
{
once: true
}
);
} else {
CampusDrawer.initialize();
}                     
