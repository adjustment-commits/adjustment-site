"use strict";

const CampusDrawer = (() => {
const state = {
isOpen:false,
activeContentId:"",
lastFocusedElement:null
};

const elements = {
backdrop:null,
drawer:null,
closeButton:null,
eyebrow:null,
title:null,
summary:null,
meta:null,
question:null,
commonTheory:null,
adjustmentView:null,
why:null,
checkpoints:null,
pdsEvaluation:null,
trackingData:null,
hypotheses:null,
researchQuestions:null,
related:null
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

elements.question =
document.getElementById("drawerQuestion");

elements.commonTheory =
document.getElementById("drawerCommonTheory");

elements.adjustmentView =
document.getElementById("drawerAdjustmentView");

elements.why =
document.getElementById("drawerWhy");

elements.checkpoints =
document.getElementById("drawerCheckpoints");

elements.pdsEvaluation =
document.getElementById("drawerPdsEvaluation");

elements.trackingData =
document.getElementById("drawerTrackingData");

elements.hypotheses =
document.getElementById("drawerHypotheses");

elements.researchQuestions =
document.getElementById("drawerResearchQuestions");

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

function normalizeString(
value,
fallback = ""
) {
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

function isPlainObject(value) {
return (
value !== null &&
typeof value === "object" &&
!Array.isArray(value)
);
}

function hasRenderableValue(value) {
if (typeof value === "string") {
return normalizeString(value) !== "";
}

if (Array.isArray(value)) {
return value.length > 0;
}

if (isPlainObject(value)) {
return (
normalizeString(value.title) !== "" ||
normalizeString(value.text) !== "" ||
normalizeString(value.description) !== "" ||
normalizeString(value.summary) !== "" ||
normalizeArray(value.items).length > 0 ||
normalizeArray(value.points).length > 0 ||
normalizeArray(value.choices).length > 0
);
}

return false;
}

function escapeHtml(value) {
return String(value ?? "")
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");
}

function formatType(type) {
const normalized =
normalizeString(type,"content");

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

function setSectionVisible(
element,
isVisible
) {
if (!element) {
return;
}

const section = element.closest(
".drawer-section"
);

if (section) {
section.hidden = !isVisible;
}
}

function renderEmpty(
element,
title = "æ´çä¸­",
text = "ç¾å¨ãåå®¹ãæ´çãã¦ãã¾ãã"
) {
if (!element) {
return;
}

element.innerHTML =
'<div class="drawer-list-item">' +
"<strong>" +
escapeHtml(title) +
"</strong>" +
"<span>" +
escapeHtml(text) +
"</span>" +
"</div>";
}

function renderGenericListHtml(items) {
return normalizeArray(items)
.map((item,index) => {
if (typeof item === "string") {
const text = normalizeString(item);

if (!text) {
return "";
}

return (
'<div class="drawer-list-item">' +
"<strong>" +
escapeHtml(
String(index + 1).padStart(2,"0")
) +
"</strong>" +
"<span>" +
escapeHtml(text) +
"</span>" +
"</div>"
);
}

if (!isPlainObject(item)) {
return "";
}

const title =
normalizeString(
item.title,
normalizeString(
item.label,
"é ç® " + String(index + 1)
)
);

const text =
normalizeString(
item.text,
normalizeString(
item.description,
normalizeString(
item.method,
normalizeString(item.reference)
)
)
);

return (
'<div class="drawer-list-item">' +
"<strong>" +
escapeHtml(title) +
"</strong>" +
(
text
? "<span>" +
escapeHtml(text) +
"</span>"
: ""
) +
"</div>"
);
})
.filter(Boolean)
.join("");
}

function renderTextBlock(
element,
value,
fallbackTitle = "æ´çä¸­",
fallbackText = "ç¾å¨ãåå®¹ãæ´çãã¦ãã¾ãã"
) {
if (!element) {
return;
}

if (typeof value === "string") {
const text = normalizeString(value);

if (!text) {
renderEmpty(
element,
fallbackTitle,
fallbackText
);
return;
}

element.innerHTML =
'<p class="drawer-content-text">' +
escapeHtml(text) +
"</p>";

return;
}

if (isPlainObject(value)) {
const title =
normalizeString(value.title);

const text =
normalizeString(
value.text,
normalizeString(
value.description,
normalizeString(value.summary)
)
);

const items =
normalizeArray(value.items);

const points =
normalizeArray(value.points);

const listItems =
items.length > 0
? items
: points;

const parts = [];

if (title) {
parts.push(
'<h4 class="drawer-content-title">' +
escapeHtml(title) +
"</h4>"
);
}

if (text) {
parts.push(
'<p class="drawer-content-text">' +
escapeHtml(text) +
"</p>"
);
}

if (listItems.length > 0) {
parts.push(
renderGenericListHtml(listItems)
);
}

if (parts.length === 0) {
renderEmpty(
element,
fallbackTitle,
fallbackText
);
return;
}

element.innerHTML =
parts.join("");

return;
}

if (Array.isArray(value)) {
if (value.length === 0) {
renderEmpty(
element,
fallbackTitle,
fallbackText
);
return;
}

element.innerHTML =
renderGenericListHtml(value);

return;
}

renderEmpty(
element,
fallbackTitle,
fallbackText
);
}

function getContentById(contentId) {
const normalizedId =
normalizeString(contentId);

if (!normalizedId) {
return null;
}

if (
typeof CampusSearch !== "undefined" &&
CampusSearch &&
typeof CampusSearch.byId === "function"
) {
const searched =
CampusSearch.byId(normalizedId);

if (searched) {
return searched;
}
}

const db = window.CampusDB;

if (!db) {
return null;
}

const mapCandidates = [
db.relatedMap,
db.contentMap,
db.phenomenonMap,
db.allMap
];

for (const candidate of mapCandidates) {
if (
candidate instanceof Map &&
candidate.has(normalizedId)
) {
return candidate.get(normalizedId);
}
}

const collections = [
db.all,
db.contents,
db.phenomena,
db.research,
db.pds,
db.cases,
db.dictionary
];

for (const collection of collections) {
const found =
normalizeArray(collection).find((item) => {
return (
item &&
item.id === normalizedId
);
});

if (found) {
return found;
}
}

return null;
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
const related =
CampusSearch.related(content.id);

if (Array.isArray(related)) {
return related;
}
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

function setText(
element,
value,
fallback = ""
) {
if (!element) {
return;
}

element.textContent =
normalizeString(value,fallback);
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

const evidenceLevel =
normalizeString(content.evidenceLevel);

if (code) {
items.push({
value:code,
className:"tag"
});
}

if (status) {
items.push({
value:status.toUpperCase(),
className:[
"tag",
normalizeString(content.statusClass)
]
.filter(Boolean)
.join(" ")
});
}

if (version) {
items.push({
value:"VERSION " + version,
className:"tag"
});
}

if (updatedAt) {
items.push({
value:updatedAt,
className:"tag"
});
}

if (evidenceLevel) {
items.push({
value:"EVIDENCE " + evidenceLevel,
className:"tag"
});
}

normalizeArray(content.tags).forEach((tag) => {
const value = normalizeString(tag);

if (!value) {
return;
}

items.push({
value,
className:"tag"
});
});

elements.meta.innerHTML =
items
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

function renderQuestion(content) {
if (!elements.question) {
return;
}

const question =
content.question;

if (!isPlainObject(question)) {
renderTextBlock(
elements.question,
question,
"åããæ´çä¸­",
"æåã«èããåããæ´çãã¦ãã¾ãã"
);
return;
}

const title =
normalizeString(question.title);

const text =
normalizeString(question.text);

const choices =
normalizeArray(question.choices);

const parts = [];

if (title) {
parts.push(
'<h4 class="drawer-content-title">' +
escapeHtml(title) +
"</h4>"
);
}

if (text) {
parts.push(
'<p class="drawer-content-text">' +
escapeHtml(text) +
"</p>"
);
}

if (choices.length > 0) {
parts.push(
'<div class="drawer-choice-list">' +
choices
.map((choice,index) => {
const label =
isPlainObject(choice)
? normalizeString(
choice.label,
"é¸æè¢ " +
String(index + 1)
)
: normalizeString(
choice,
"é¸æè¢ " +
String(index + 1)
);

return (
'<div class="drawer-choice-item">' +
'<span class="drawer-choice-number">' +
escapeHtml(
String(index + 1).padStart(2,"0")
) +
"</span>" +
"<span>" +
escapeHtml(label) +
"</span>" +
"</div>"
);
})
.join("") +
"</div>"
);
}

if (parts.length === 0) {
renderEmpty(
elements.question,
"åããæ´çä¸­",
"æåã«èããåããæ´çãã¦ãã¾ãã"
);
return;
}

elements.question.innerHTML =
parts.join("");
}

function renderCommonTheory(content) {
const value =
content.commonTheory ??
content.generalTheory ??
content.commonView ??
"";

renderTextBlock(
elements.commonTheory,
value,
"ä¸è¬çãªèãæ¹ãæ´çä¸­",
"ä¸è¬çã«èãããã¦ããåå ãè¦æ¹ãæ´çãã¦ãã¾ãã"
);
}

function renderAdjustmentView(content) {
const value =
content.adjustmentView ??
content.reframe ??
content.thinking ??
"";

renderTextBlock(
elements.adjustmentView,
value,
"æãæ¹ãæ´çä¸­",
"adjustmentã¨ãã¦ã®æãæ¹ãæ´çãã¦ãã¾ãã"
);
}

function renderWhy(content) {
renderTextBlock(
elements.why,
content.why,
"çç±ãæ´çä¸­",
"ãªãããèããã®ããæ´çãã¦ãã¾ãã"
);
}

function renderCheckpoints(content) {
if (!elements.checkpoints) {
return;
}

const checkpoints =
normalizeArray(content.checkpoints);

if (checkpoints.length === 0) {
renderEmpty(
elements.checkpoints,
"ç¢ºèªé ç®ãæ´çä¸­",
"ç¾å ´ã§ç¢ºèªããé ç®ãæ´çãã¦ãã¾ãã"
);
return;
}

elements.checkpoints.innerHTML =
renderGenericListHtml(checkpoints);
}

function renderPdsEvaluation(content) {
const value =
content.pdsEvaluation ??
content.pds ??
"";

renderTextBlock(
elements.pdsEvaluation,
value,
"PDSé ç®ãæ´çä¸­",
"PDSã§ç¢ºèªããé ç®ãæ´çãã¦ãã¾ãã"
);
}

function renderTrackingData(content) {
const value =
content.trackingData ??
content.tracking ??
content.performanceData ??
"";

renderTextBlock(
elements.trackingData,
value,
"ç«¶æãã¼ã¿ãæ´çä¸­",
"ç«¶æãã¼ã¿ã§ç¢ºèªããé ç®ãæ´çãã¦ãã¾ãã"
);
}

function renderHypotheses(content) {
const value =
content.hypotheses ??
content.hypothesis ??
content.possibilities ??
"";

renderTextBlock(
elements.hypotheses,
value,
"ä»®èª¬ãæ´çä¸­",
"ç¾æç¹ã§èããããä»®èª¬ãæ´çãã¦ãã¾ãã"
);
}

function renderResearchQuestions(content) {
const value =
content.researchQuestions ??
content.researchQuestion ??
"";

renderTextBlock(
elements.researchQuestions,
value,
"æ¤è¨¼èª²é¡ãæ´çä¸­",
"ä»å¾æ¤è¨¼ãããåããæ´çãã¦ãã¾ãã"
);
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
"<strong>é¢é£è³æãæ´çä¸­</strong>" +
"<span>é¢é£ããæèãè³æãæ´çãã¦ãã¾ãã</span>" +
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

const title =
normalizeString(
related.title,
"ç¡é¡"
);

return (
'<button class="drawer-related-item"' +
' type="button"' +
' data-drawer-content-id="' +
escapeHtml(related.id) +
'">' +
"<strong>" +
escapeHtml(title) +
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
const type =
formatType(
normalizeString(
content.type,
content.question
? "phenomenon"
: "content"
)
);

const code =
normalizeString(
content.code,
content.id
);

const commonTheory =
content.commonTheory ??
content.generalTheory ??
content.commonView ??
"";

const adjustmentView =
content.adjustmentView ??
content.reframe ??
content.thinking ??
"";

const pdsEvaluation =
content.pdsEvaluation ??
content.pds ??
"";

const trackingData =
content.trackingData ??
content.tracking ??
content.performanceData ??
"";

const hypotheses =
content.hypotheses ??
content.hypothesis ??
content.possibilities ??
"";

const researchQuestions =
content.researchQuestions ??
content.researchQuestion ??
"";

setText(
elements.eyebrow,
type + " / " + code,
"ADJUSTMENT THINKING"
);

setText(
elements.title,
content.title,
normalizeString(
content.label,
"æèã¿ã¤ãã«"
)
);

setText(
elements.summary,
content.summary,
normalizeString(
content.description,
"æ¦è¦ãæ´çãã¦ãã¾ãã"
)
);

renderMeta(content);
renderQuestion(content);
renderCommonTheory(content);
renderAdjustmentView(content);
renderWhy(content);
renderCheckpoints(content);
renderPdsEvaluation(content);
renderTrackingData(content);
renderHypotheses(content);
renderResearchQuestions(content);
renderRelated(content);

setSectionVisible(
elements.question,
hasRenderableValue(content.question)
);

setSectionVisible(
elements.commonTheory,
hasRenderableValue(commonTheory)
);

setSectionVisible(
elements.adjustmentView,
hasRenderableValue(adjustmentView)
);

setSectionVisible(
elements.why,
hasRenderableValue(content.why)
);

setSectionVisible(
elements.checkpoints,
normalizeArray(content.checkpoints).length > 0
);

setSectionVisible(
elements.pdsEvaluation,
hasRenderableValue(pdsEvaluation)
);

setSectionVisible(
elements.trackingData,
hasRenderableValue(trackingData)
);

setSectionVisible(
elements.hypotheses,
hasRenderableValue(hypotheses)
);

setSectionVisible(
elements.researchQuestions,
hasRenderableValue(researchQuestions)
);

setSectionVisible(
elements.related,
getRelatedContents(content).length > 0
);
}

function updateUrl(contentId) {
const url =
new URL(window.location.href);

if (contentId) {
url.searchParams.set(
"content",
contentId
);
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

state.activeContentId =
content.id;

render(content);

elements.drawer.classList.add(
"is-open"
);

elements.drawer.setAttribute(
"aria-hidden",
"false"
);

elements.backdrop.classList.add(
"is-open"
);

elements.backdrop.setAttribute(
"aria-hidden",
"false"
);

document.body.classList.add(
"menu-open"
);

state.isOpen = true;

if (updateHistory) {
updateUrl(content.id);
}

window.requestAnimationFrame(() => {
elements.closeButton.focus();
});

document.dispatchEvent(
new CustomEvent(
"campus:drawer-open",
{
detail:{
content
}
}
)
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

elements.drawer.classList.remove(
"is-open"
);

elements.drawer.setAttribute(
"aria-hidden",
"true"
);

elements.backdrop.classList.remove(
"is-open"
);

elements.backdrop.setAttribute(
"aria-hidden",
"true"
);

document.body.classList.remove(
"menu-open"
);

state.isOpen = false;
state.activeContentId = "";

if (updateHistory) {
updateUrl("");
}

if (
restoreFocus &&
state.lastFocusedElement instanceof HTMLElement &&
document.contains(
state.lastFocusedElement
)
) {
state.lastFocusedElement.focus();
}

state.lastFocusedElement = null;

document.dispatchEvent(
new CustomEvent(
"campus:drawer-close"
)
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

open(contentId,trigger,{
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
if (state.isOpen) {
close({
restoreFocus:false,
updateHistory:false
});
}

return;
}

open(contentId,null,{
preserveFocus:true,
updateHistory:false
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

if (
!elements.drawer.hasAttribute(
"tabindex"
)
) {
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
once:true
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

if (
document.readyState === "loading"
) {
document.addEventListener(
"DOMContentLoaded",
CampusDrawer.initialize,
{
once:true
}
);
} else {
CampusDrawer.initialize();
}
