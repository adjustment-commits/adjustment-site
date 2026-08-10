(() => {
"use strict";

const DATA_URLS = {
  meta: "./data/meta.json",
  phenomena: "./data/phenomena.json",
  topics: "./data/topics.json",
  research: "./data/research.json",
  pds: "./data/pds.json",
  cases: "./data/cases.json",
  dictionary: "./data/dictionary.json",
  updates: "./data/updates.json",
  facilities: "./data/facilities.json"
};

const TYPE_LABELS = {
research:"RESEARCH",
pds:"PDS",
case:"CASE",
dictionary:"DICTIONARY"
};

const TYPE_JAPANESE_LABELS = {
research:"\u7814\u7a76",
pds:"PDS\u8a55\u4fa1",
case:"\u73fe\u5834\u4e8b\u4f8b",
dictionary:"\u7528\u8a9e\u30fb\u6982\u5ff5"
};

const DEFAULT_META = {
version:"Campus",
copyright:"\u00a9 adjustment Digital Research Campus"
};

const state = {
  data: null,
  activePhenomenonId: "",
  activeTopicId: "",
  selectedChoiceId: "",
  selectedContentId: "",
  activeFacilityType: "",
  lastFocusedElement: null,
  drawerOpen: false,
  mobileMenuOpen: false,
  phenomenonAccordionOpen: false
};

const elements = {
siteHeader:document.getElementById("siteHeader"),
campusVersion:document.getElementById("campusVersion"),
footerCopyright:document.getElementById("footerCopyright"),
mobileMenuButton:document.getElementById("mobileMenuButton"),
mobileNav:document.getElementById("mobileNav"),
phenomenonList:document.getElementById("phenomenonList"),
bookshelf:document.getElementById("bookshelf"),
insightPanel: document.getElementById("insightPanel"),
insightCount: document.getElementById("insightCount"),
questionTitle: document.getElementById("questionTitle"),
questionText: document.getElementById("questionText"),
questionChoices: document.getElementById("questionChoices"),
entryPanel: document.getElementById("entryPanel"),
entryTitle: document.getElementById("entryTitle"),
entryText: document.getElementById("entryText"),
commonTheoryPanel: document.getElementById("commonTheoryPanel"),
whyTitle: document.getElementById("whyTitle"),
whyText: document.getElementById("whyText"),
whyPoints: document.getElementById("whyPoints"),
adjustmentPanel: document.getElementById("adjustmentPanel"),
adjustmentTitle: document.getElementById("adjustmentTitle"),
adjustmentText: document.getElementById("adjustmentText"),
nextStepPanel: document.getElementById("nextStepPanel"),
nextStepTitle: document.getElementById("nextStepTitle"),
nextStepText: document.getElementById("nextStepText"),
premiumPanel: document.getElementById("premiumPanel"),
premiumTitle: document.getElementById("premiumTitle"),
premiumText: document.getElementById("premiumText"),
relatedTopicsPanel: document.getElementById("relatedTopicsPanel"),
relatedTopicList: document.getElementById("relatedTopicList"),
relatedList: document.getElementById("relatedList"),
updateGrid:document.getElementById("updateGrid"),
facilityGrid:document.getElementById("facilityGrid"),
dataErrorSection:document.getElementById("dataErrorSection"),
dataErrorMessage:document.getElementById("dataErrorMessage"),
reloadDataButton:document.getElementById("reloadDataButton"),
drawerBackdrop:document.getElementById("drawerBackdrop"),
detailDrawer:document.getElementById("detailDrawer"),
drawerClose:document.getElementById("drawerClose"),
drawerEyebrow:document.getElementById("drawerEyebrow"),
drawerTitle:document.getElementById("drawerTitle"),
drawerSummary:document.getElementById("drawerSummary"),
drawerMeta:document.getElementById("drawerMeta"),
drawerQuestion:document.getElementById("drawerQuestion"),
drawerCommonTheory:document.getElementById("drawerCommonTheory"),
drawerAdjustmentView:document.getElementById("drawerAdjustmentView"),
drawerWhy:document.getElementById("drawerWhy"),
drawerCheckpoints:document.getElementById("drawerCheckpoints"),
drawerPdsEvaluation:document.getElementById("drawerPdsEvaluation"),
drawerTrackingData:document.getElementById("drawerTrackingData"),
drawerHypotheses:document.getElementById("drawerHypotheses"),
drawerResearchQuestions:document.getElementById("drawerResearchQuestions"),
drawerObservation:document.getElementById("drawerObservation"),
drawerThinking:document.getElementById("drawerThinking"),
drawerVerification:document.getElementById("drawerVerification"),
drawerLimitation:document.getElementById("drawerLimitation"),
drawerRelated:document.getElementById("drawerRelated"),
heroFloatingBooks:document.getElementById("heroFloatingBooks")
};

const phenomenonAccordionElements = {
  root: null,
  toggle: null,
  body: null,
  count: null,
  current: null,
  icon: null
};

function initializePhenomenonAccordion() {
  if (!elements.phenomenonList || phenomenonAccordionElements.root) return;
  const parent = elements.phenomenonList.parentElement;
  if (!parent) return;
  const root = document.createElement("section");
  root.className = "phenomenon-accordion";
  const toggle = document.createElement("button");
  toggle.className = "phenomenon-accordion-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-expanded","false");
  toggle.setAttribute("aria-controls","phenomenonAccordionBody");
  toggle.innerHTML =
    '<span class="phenomenon-accordion-heading">' +
      '<span class="phenomenon-accordion-label">\u8ab2\u984c\u3092\u9078\u3076</span>' +
      '<span class="phenomenon-accordion-count">0 ITEMS</span>' +
    '</span>' +
    '<span class="phenomenon-accordion-current">\u8ab2\u984c\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044</span>' +
    '<span class="phenomenon-accordion-icon">+</span>';
  const body = document.createElement("div");
  body.id = "phenomenonAccordionBody";
  body.className = "phenomenon-accordion-body";
  body.hidden = true;
  parent.insertBefore(root,elements.phenomenonList);
  root.appendChild(toggle);
  root.appendChild(body);
  body.appendChild(elements.phenomenonList);
  phenomenonAccordionElements.root = root;
  phenomenonAccordionElements.toggle = toggle;
  phenomenonAccordionElements.body = body;
  phenomenonAccordionElements.count = toggle.querySelector(".phenomenon-accordion-count");
  phenomenonAccordionElements.current = toggle.querySelector(".phenomenon-accordion-current");
  phenomenonAccordionElements.icon = toggle.querySelector(".phenomenon-accordion-icon");
  toggle.addEventListener("click",togglePhenomenonAccordion);
  syncPhenomenonAccordion();
}

function togglePhenomenonAccordion() {
  state.phenomenonAccordionOpen = !state.phenomenonAccordionOpen;
  syncPhenomenonAccordion();
}

function syncPhenomenonAccordion() {
  const {root,toggle,body,count,current,icon} = phenomenonAccordionElements;
  if (!root || !toggle || !body) return;
  const isOpen = state.phenomenonAccordionOpen;
  toggle.setAttribute("aria-expanded",String(isOpen));
  body.hidden = !isOpen;
  root.classList.toggle("is-open",isOpen);
  if (icon) icon.textContent = isOpen ? "\u2212" : "+";
  const itemCount = state.data && Array.isArray(state.data.phenomena) ? state.data.phenomena.length : 0;
  if (count) count.textContent = `${itemCount} ITEMS`;
  const activePhenomenon = getActivePhenomenon();
  if (current) {
    current.textContent = activePhenomenon
      ? `\u9078\u629e\u4e2d\uff1a${activePhenomenon.label}`
      : "\u8ab2\u984c\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044";
  }
}

function escapeHtml(value) {
return String(value ?? "")
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");
}

function normalizeString(value,fallback = "") {
return typeof value === "string" ? value.trim() : fallback;
}

function normalizeArray(value) {
return Array.isArray(value) ? value : [];
}

function isPlainObject(value) {
return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getContentById(contentId) {
if (!state.data) return null;
return state.data.contents.find((content) => content.id === contentId) || null;
}

function getPhenomenonById(phenomenonId) {
if (!state.data) return null;
return state.data.phenomena.find((phenomenon) => phenomenon.id === phenomenonId) || null;
}

function getActivePhenomenon() {
return getPhenomenonById(state.activePhenomenonId);
}

function getFacilityByType(type) {
if (!state.data) return null;
return state.data.facilities.find((facility) => facility.type === type) || null;
}

function getRelatedContents(ids) {
return normalizeArray(ids).map((contentId) => getContentById(contentId)).filter(Boolean);
}

function getTopicById(topicId) {
if (!state.data) return null;
return state.data.topics.find((topic) => topic.id === topicId) || null;
}

function getRelatedTopics(ids) {
return normalizeArray(ids).map((topicId) => getTopicById(topicId)).filter(Boolean);
}

function getPhenomenaByTopicId(topicId) {
const normalizedTopicId = normalizeString(topicId);
const phenomena = state.data?.phenomena;
if (!normalizedTopicId || !Array.isArray(phenomena)) return [];
return phenomena.filter((phenomenon) => normalizeArray(phenomenon?.relatedTopicIds).includes(normalizedTopicId));
}

function formatTypeLabel(type) {
return TYPE_LABELS[type] || normalizeString(type,"CONTENT").toUpperCase();
}

function formatTypeJapaneseLabel(type) {
return TYPE_JAPANESE_LABELS[type] || "\u8cc7\u6599";
}

function formatDate(value) {
const text = normalizeString(value);
if (!text) return "";
const normalized = text.replaceAll("/",".").replaceAll("-",".");
const parts = normalized.split(".");
if (parts.length !== 3) return text;
const [year,month,day] = parts;
if (
year.length !== 4 ||
month.length < 1 ||
month.length > 2 ||
day.length < 1 ||
day.length > 2 ||
Number.isNaN(Number(year)) ||
Number.isNaN(Number(month)) ||
Number.isNaN(Number(day))
) return text;
return year + "." + month.padStart(2,"0") + "." + day.padStart(2,"0");
}

function validateNonEmptyText(value, location, errors) {
if (!normalizeString(value)) errors.push(`${location}\u304c\u3042\u308a\u307e\u305b\u3093\u3002`);
}

function validateRelatedIds(ids,contentIds,location,errors) {
normalizeArray(ids).forEach((relatedId) => {
const normalizedId = normalizeString(relatedId);
if (normalizedId && !contentIds.has(normalizedId)) {
errors.push(`${location}\u306b\u5b58\u5728\u3057\u306a\u3044content ID\u300c${normalizedId}\u300d\u304c\u3042\u308a\u307e\u3059\u3002`);
}
});
}

function validateRelatedTopicIds(ids,validTopicIds,location,errors) {
if (!Array.isArray(ids)) {
errors.push(`${location}\u306f\u914d\u5217\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`);
return;
}
const localTopicIds = new Set();
ids.forEach((topicId,index) => {
const normalizedId = normalizeString(topicId);
if (!normalizedId) {
errors.push(`${location}[${index}]\u306btopic ID\u304c\u3042\u308a\u307e\u305b\u3093\u3002`);
return;
}
if (localTopicIds.has(normalizedId)) {
errors.push(`${location}\u5185\u3067topic ID\u300c${normalizedId}\u300d\u304c\u91cd\u8907\u3057\u3066\u3044\u307e\u3059\u3002`);
return;
}
localTopicIds.add(normalizedId);
if (validTopicIds instanceof Set && !validTopicIds.has(normalizedId)) {
errors.push(`${location}\u306b\u5b58\u5728\u3057\u306a\u3044topic ID\u300c${normalizedId}\u300d\u304c\u3042\u308a\u307e\u3059\u3002`);
}
});
}

function validateResearchDetail(researchDetail,contentIndex,errors) {
const location = `contents[${contentIndex}].researchDetail`;
if (!isPlainObject(researchDetail)) {
errors.push(`${location}\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`);
return;
}
["question","commonTheory","adjustmentView","why","fieldCheck","pdsEvaluation","tracking"].forEach((sectionName) => {
const section = researchDetail[sectionName];
const sectionLocation = `${location}.${sectionName}`;
if (!isPlainObject(section)) {
errors.push(`${sectionLocation}\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`);
return;
}
validateNonEmptyText(section.title,`${sectionLocation}.title`,errors);
validateNonEmptyText(section.text,`${sectionLocation}.text`,errors);
if (Object.prototype.hasOwnProperty.call(section,"points") && !Array.isArray(section.points)) {
errors.push(`${sectionLocation}.points\u306f\u914d\u5217\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`);
}
});
if (!Array.isArray(researchDetail.hypotheses)) {
errors.push(`${location}.hypotheses\u306f\u914d\u5217\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`);
}
if (!Array.isArray(researchDetail.researchQuestions)) {
errors.push(`${location}.researchQuestions\u306f\u914d\u5217\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`);
}
}

function normalizeResearchTextSection(section) {
const source = isPlainObject(section) ? section : {};
return {
title:normalizeString(source.title),
text:normalizeString(source.text),
points:normalizeArray(source.points).map((item) => normalizeString(item)).filter(Boolean)
};
}

function normalizeResearchDetail(researchDetail) {
if (!isPlainObject(researchDetail)) return null;
const pdsEvaluation = normalizeResearchTextSection(researchDetail.pdsEvaluation);
pdsEvaluation.relatedIds = normalizeArray(researchDetail.pdsEvaluation && researchDetail.pdsEvaluation.relatedIds)
.map((item) => normalizeString(item)).filter(Boolean);
return {
question:normalizeResearchTextSection(researchDetail.question),
commonTheory:normalizeResearchTextSection(researchDetail.commonTheory),
adjustmentView:normalizeResearchTextSection(researchDetail.adjustmentView),
why:normalizeResearchTextSection(researchDetail.why),
fieldCheck:normalizeResearchTextSection(researchDetail.fieldCheck),
pdsEvaluation,
tracking:normalizeResearchTextSection(researchDetail.tracking),
hypotheses:normalizeArray(researchDetail.hypotheses).filter(isPlainObject).map((item,index) => ({
id:normalizeString(item.id,`research-hypothesis-${index + 1}`),
title:normalizeString(item.title),
text:normalizeString(item.text),
status:normalizeString(item.status,"ACTIVE")
})),
researchQuestions:normalizeArray(researchDetail.researchQuestions).filter(isPlainObject).map((item,index) => ({
id:normalizeString(item.id,`research-question-${index + 1}`),
text:normalizeString(item.text),
status:normalizeString(item.status,"OPEN")
}))
};
}

function normalizeData(data) {
return {
meta:{...DEFAULT_META,...(isPlainObject(data.meta) ? data.meta : {})},
topics:data.topics.map((topic) => ({
id:normalizeString(topic.id),
label:normalizeString(topic.label),
category:normalizeString(topic.category),
summary:normalizeString(topic.summary),
relatedTopicIds:normalizeArray(topic.relatedTopicIds).map((item) => normalizeString(item)).filter(Boolean),
relatedContentIds:normalizeArray(topic.relatedContentIds).map((item) => normalizeString(item)).filter(Boolean)
})),
phenomena:data.phenomena.map((phenomenon) => ({
...phenomenon,
id:normalizeString(phenomenon.id),
label:normalizeString(phenomenon.label,"\u73fe\u8c61"),
title:normalizeString(phenomenon.title,"\u73fe\u8c61\u3092\u6574\u7406\u4e2d\u3067\u3059\u3002"),
description:normalizeString(phenomenon.description,"\u95a2\u9023\u3059\u308b\u60c5\u5831\u3092\u6574\u7406\u3057\u3066\u3044\u307e\u3059\u3002"),
relatedIds:normalizeArray(phenomenon.relatedIds).map((item) => normalizeString(item)).filter(Boolean),
relatedTopicIds:normalizeArray(phenomenon.relatedTopicIds).map((item) => normalizeString(item)).filter(Boolean)
})),
contents:data.contents.map((content) => ({
id:normalizeString(content.id),
type:normalizeString(content.type,"research"),
code:normalizeString(content.code,"NO-CODE"),
title:normalizeString(content.title,"\u7121\u984c"),
summary:normalizeString(content.summary,"\u6982\u8981\u3092\u6574\u7406\u4e2d\u3067\u3059\u3002"),
tags:normalizeArray(content.tags).map((item) => normalizeString(item)).filter(Boolean),
status:normalizeString(content.status,"DRAFT"),
statusClass:normalizeString(content.statusClass),
updatedAt:normalizeString(content.updatedAt),
observation:normalizeString(content.observation,"\u73fe\u5728\u6574\u7406\u4e2d\u3067\u3059\u3002"),
thinking:normalizeString(content.thinking,"\u73fe\u5728\u6574\u7406\u4e2d\u3067\u3059\u3002"),
verification:normalizeString(content.verification,"\u73fe\u5728\u691c\u8a3c\u4e2d\u3067\u3059\u3002"),
limitation:normalizeString(content.limitation,"\u73fe\u6642\u70b9\u3067\u306f\u4eee\u8aac\u6bb5\u968e\u3092\u542b\u307f\u307e\u3059\u3002"),
researchDetail:normalizeString(content.type) === "research" ? normalizeResearchDetail(content.researchDetail) : null,
relatedIds:normalizeArray(content.relatedIds).map((item) => normalizeString(item)).filter(Boolean)
})),
updates:data.updates,
facilities:data.facilities
};
}

function validateData(data) {
const errors = [];
if (!isPlainObject(data)) return {valid:false,errors:["Campus data root invalid."]};
["phenomena","topics","contents","updates","facilities"].forEach((key) => {
if (!Array.isArray(data[key])) errors.push(`${key} must be an array.`);
});
if (errors.length) return {valid:false,errors};
const contentIds = new Set(data.contents.map((x)=>normalizeString(x.id)).filter(Boolean));
const topicIds = new Set(data.topics.map((x)=>normalizeString(x.id)).filter(Boolean));
data.topics.forEach((topic,index)=>{
validateRelatedTopicIds(topic.relatedTopicIds,topicIds,`topics[${index}].relatedTopicIds`,errors);
validateRelatedIds(topic.relatedContentIds,contentIds,`topics[${index}].relatedContentIds`,errors);
});
data.contents.forEach((content,index)=>{
validateRelatedIds(content.relatedIds,contentIds,`contents[${index}].relatedIds`,errors);
if (normalizeString(content.type)==="research" && Object.prototype.hasOwnProperty.call(content,"researchDetail")) {
validateResearchDetail(content.researchDetail,index,errors);
if (isPlainObject(content.researchDetail) && isPlainObject(content.researchDetail.pdsEvaluation)) {
validateRelatedIds(content.researchDetail.pdsEvaluation.relatedIds,contentIds,`contents[${index}].researchDetail.pdsEvaluation.relatedIds`,errors);
}
}
});
return {valid:errors.length===0,errors};
}

async function fetchJsonFile(name,url) {
const response = await fetch(url,{method:"GET",cache:"no-store",headers:{"Accept":"application/json"}});
if (!response.ok) throw new Error(`${name} data request failed. HTTP ${response.status}`);
return await response.json();
}

async function fetchCampusData() {
const [meta,phenomena,topics,research,pds,cases,dictionary,updates,facilities] = await Promise.all([
fetchJsonFile("meta.json",DATA_URLS.meta),
fetchJsonFile("phenomena.json",DATA_URLS.phenomena),
fetchJsonFile("topics.json",DATA_URLS.topics),
fetchJsonFile("research.json",DATA_URLS.research),
fetchJsonFile("pds.json",DATA_URLS.pds),
fetchJsonFile("cases.json",DATA_URLS.cases),
fetchJsonFile("dictionary.json",DATA_URLS.dictionary),
fetchJsonFile("updates.json",DATA_URLS.updates),
fetchJsonFile("facilities.json",DATA_URLS.facilities)
]);
const data = {
meta:{
version:normalizeString(meta && meta.site && meta.site.version,DEFAULT_META.version),
updatedAt:normalizeString(meta && meta.site && meta.site.updatedAt),
copyright:normalizeString(meta && meta.branding && meta.branding.copyright,DEFAULT_META.copyright)
},
phenomena,topics,contents:[...research,...pds,...cases,...dictionary],updates,facilities
};
const validation = validateData(data);
if (!validation.valid) throw new Error(validation.errors.join(" "));
return normalizeData(data);
}

function renderMeta() {
if (!state.data) return;
if (elements.campusVersion) elements.campusVersion.textContent = normalizeString(state.data.meta.version,DEFAULT_META.version);
if (elements.footerCopyright) elements.footerCopyright.textContent = normalizeString(state.data.meta.copyright,DEFAULT_META.copyright);
}

function renderPhenomena() {
if (!elements.phenomenonList || !state.data) return;
elements.phenomenonList.innerHTML = state.data.phenomena.map((phenomenon,index) => {
const isActive = phenomenon.id === state.activePhenomenonId;
return `<button class="concern-button${isActive ? " is-active" : ""}" type="button" data-phenomenon-id="${escapeHtml(phenomenon.id)}" aria-pressed="${String(isActive)}"><span class="concern-code">${String(index+1).padStart(2,"0")}</span><span class="concern-main"><strong>${escapeHtml(phenomenon.label)}</strong><span>${escapeHtml(phenomenon.description)}</span></span><span class="concern-arrow">${isActive ? "CHECK" : ">"}</span></button>`;
}).join("");
elements.phenomenonList.querySelectorAll("[data-phenomenon-id]").forEach((button)=>{
button.addEventListener("click",()=>selectPhenomenon(button.dataset.phenomenonId));
});
syncPhenomenonAccordion();
}

function sortContentsForBookshelf(contents) {
const activePhenomenon = getActivePhenomenon();
const relatedIds = new Set(activePhenomenon ? activePhenomenon.relatedIds : []);
return [...contents].sort((a,b)=>{
const ar = relatedIds.has(a.id)?1:0;
const br = relatedIds.has(b.id)?1:0;
if (ar!==br) return br-ar;
return a.code.localeCompare(b.code,"ja",{numeric:true,sensitivity:"base"});
});
}

function renderBooks() {
if (!elements.bookshelf || !state.data) return;
const activePhenomenon = getActivePhenomenon();
const relatedIds = new Set(activePhenomenon ? activePhenomenon.relatedIds : []);
elements.bookshelf.innerHTML = sortContentsForBookshelf(state.data.contents).map((content)=>{
const isRelated = relatedIds.has(content.id);
const isSelected = state.selectedContentId===content.id;
return '<button class="book'+(isRelated?' is-related':'')+(isSelected?' is-selected':'')+'" type="button" data-content-id="'+escapeHtml(content.id)+'" data-type="'+escapeHtml(content.type)+'" aria-pressed="'+String(isSelected)+'"><span class="book-type">'+escapeHtml(formatTypeLabel(content.type))+'</span><h4>'+escapeHtml(content.title)+'</h4><p>'+escapeHtml(content.code)+'</p></button>';
}).join("");
elements.bookshelf.querySelectorAll("[data-content-id]").forEach((button)=>{
button.addEventListener("click",()=>openContent(button.dataset.contentId,button));
});
}

function renderQuestionResponse(response) {
if (!elements.entryPanel) return;
const source = isPlainObject(response) ? response : {};
const isUnlocked = Boolean(state.selectedChoiceId);
elements.entryPanel.hidden = !isUnlocked;
if (elements.entryTitle) elements.entryTitle.textContent = isUnlocked ? normalizeString(source.title) : "";
if (elements.entryText) elements.entryText.textContent = isUnlocked ? normalizeString(source.text) : "";
}

function renderQuestion(phenomenon) {
if (elements.questionTitle) elements.questionTitle.textContent = phenomenon.question?.title || "";
if (elements.questionText) elements.questionText.textContent = phenomenon.question?.text || "";
if (!elements.questionChoices) return;
const choices = normalizeArray(phenomenon.question?.choices);
elements.questionChoices.innerHTML = choices.map((choice,index)=>'<button class="question-choice" type="button" data-choice-id="'+escapeHtml(choice.id)+'"><span>'+String(index+1).padStart(2,"0")+'</span><span>'+escapeHtml(choice.label)+'</span></button>').join("");
elements.questionChoices.querySelectorAll("[data-choice-id]").forEach((button)=>{
button.addEventListener("click",()=>selectQuestionChoice(button.dataset.choiceId));
});
}

function selectQuestionChoice(choiceId) {
const phenomenon = getActivePhenomenon();
if (!phenomenon) return;
const choice = normalizeArray(phenomenon.question?.choices).find((item)=>item.id===choiceId);
if (!choice) return;
state.selectedChoiceId = choice.id;
renderQuestionResponse(phenomenon.thinkingFlow?.entryQuestion || null);
if (elements.commonTheoryPanel) elements.commonTheoryPanel.hidden = false;
if (elements.adjustmentPanel) elements.adjustmentPanel.hidden = false;
if (elements.nextStepPanel) elements.nextStepPanel.hidden = false;
if (elements.premiumPanel) elements.premiumPanel.hidden = false;
if (elements.whyText) elements.whyText.textContent = phenomenon.thinkingFlow?.commonTheory?.text || "";
if (elements.adjustmentText) elements.adjustmentText.textContent = phenomenon.thinkingFlow?.adjustmentView?.text || "";
if (elements.nextStepText) elements.nextStepText.textContent = phenomenon.thinkingFlow?.nextStep?.text || "";
if (elements.premiumTitle) elements.premiumTitle.textContent = phenomenon.thinkingFlow?.premium?.title || "";
if (elements.premiumText) elements.premiumText.textContent = phenomenon.thinkingFlow?.premium?.text || "";
if (elements.insightCount) elements.insightCount.textContent = "STEP 6 / 6";
renderRelatedTopics(phenomenon);
}

function renderRelatedTopics(phenomenon) {
if (!elements.relatedTopicList) return;
const relatedTopics = getRelatedTopics(phenomenon.relatedTopicIds);
elements.relatedTopicList.innerHTML = relatedTopics.map((topic)=>'<button class="topic-item" type="button" data-topic-id="'+escapeHtml(topic.id)+'"><span class="topic-category">'+escapeHtml(topic.category.toUpperCase())+'</span><strong class="topic-label">'+escapeHtml(topic.label)+'</strong><p class="topic-summary">'+escapeHtml(topic.summary)+'</p></button>').join("");
elements.relatedTopicList.querySelectorAll("[data-topic-id]").forEach((button)=>button.addEventListener("click",()=>openTopic(button.dataset.topicId,button)));
}

function openTopic(topicId) {
const topic = getTopicById(topicId);
if (!topic || !elements.relatedTopicList) return;
state.activeTopicId = topic.id;
const relatedTopics = getRelatedTopics(topic.relatedTopicIds);
const relatedContents = getRelatedContents(topic.relatedContentIds);
const relatedPhenomena = getPhenomenaByTopicId(topic.id);
elements.relatedTopicList.innerHTML =
`<div class="topic-card main-topic"><span class="topic-category">${escapeHtml((topic.category||"").toUpperCase())}</span><h3 class="topic-label">${escapeHtml(topic.label||"")}</h3><p class="topic-summary">${escapeHtml(topic.summary||"")}</p></div>` +
`<div class="topic-header"><span class="topic-category">RELATED TOPICS</span><h3 class="topic-title">\u95a2\u9023\u3059\u308b\u6982\u5ff5</h3></div>` +
relatedTopics.map((x)=>`<button class="topic-item" type="button" data-topic-id="${escapeHtml(x.id)}"><span class="topic-category">${escapeHtml((x.category||"").toUpperCase())}</span><span class="topic-title">${escapeHtml(x.label||"")}</span><p class="topic-summary">${escapeHtml(x.summary||"")}</p></button>`).join("") +
`<div class="topic-header"><span class="topic-category">RELATED CONTENT</span><h3 class="topic-title">\u95a2\u9023\u3059\u308b\u8cc7\u6599</h3></div>` +
relatedContents.map((x)=>`<button class="topic-item" type="button" data-topic-content-id="${escapeHtml(x.id)}"><span class="topic-category">${escapeHtml(formatTypeLabel(x.type))}</span><span class="topic-title">${escapeHtml(x.title||"")}</span><p class="topic-summary">${escapeHtml(x.summary||"")}</p></button>`).join("") +
`<div class="topic-header"><span class="topic-category">RELATED PHENOMENA</span><h3 class="topic-title">\u3053\u306e\u6982\u5ff5\u3068\u95a2\u4fc2\u3059\u308b\u73fe\u8c61</h3></div>` +
relatedPhenomena.map((x)=>`<button class="topic-item" type="button" data-topic-phenomenon-id="${escapeHtml(x.id)}"><span class="topic-category">PHENOMENON</span><span class="topic-title">${escapeHtml(x.label||"")}</span><p class="topic-summary">${escapeHtml(x.description||"")}</p></button>`).join("");
elements.relatedTopicList.querySelectorAll("[data-topic-id]").forEach((button)=>button.addEventListener("click",()=>openTopic(button.dataset.topicId)));
elements.relatedTopicList.querySelectorAll("[data-topic-content-id]").forEach((button)=>button.addEventListener("click",()=>openContent(button.dataset.topicContentId,button)));
elements.relatedTopicList.querySelectorAll("[data-topic-phenomenon-id]").forEach((button)=>button.addEventListener("click",()=>selectPhenomenon(button.dataset.topicPhenomenonId)));
updateUrlState({topic:topic.id});
}

function renderRelatedContents(phenomenon) {
if (!elements.relatedList) return;
const relatedContents = getRelatedContents(phenomenon.relatedIds || []);
elements.relatedList.innerHTML = relatedContents.map((content)=>`<button class="related-item" type="button" data-related-id="${escapeHtml(content.id)}"><span>${escapeHtml(content.code)}</span><span>${escapeHtml(content.title)}</span><span>${escapeHtml(content.summary)}</span><span>\u2192</span></button>`).join("");
elements.relatedList.querySelectorAll("[data-related-id]").forEach((button)=>button.addEventListener("click",()=>openContent(button.dataset.relatedId,button)));
}

function renderInsight() {
const phenomenon = getActivePhenomenon();
if (!phenomenon) return;
renderQuestion(phenomenon);
renderRelatedTopics(phenomenon);
renderRelatedContents(phenomenon);
}

function renderUpdates() {
if (!elements.updateGrid || !state.data) return;
elements.updateGrid.innerHTML = state.data.updates.slice(0,6).map((update)=>`<article class="panel update-card" data-update-content-id="${escapeHtml(update.contentId)}" tabindex="0" role="button"><h3>${escapeHtml(update.title||"")}</h3><p>${escapeHtml(update.summary||"")}</p></article>`).join("");
elements.updateGrid.querySelectorAll("[data-update-content-id]").forEach((card)=>card.addEventListener("click",()=>openContent(card.dataset.updateContentId,card)));
}

function renderFacilities() {
if (!elements.facilityGrid || !state.data) return;
elements.facilityGrid.innerHTML = state.data.facilities.map((facility)=>`<button class="facility-button" type="button" data-facility-type="${escapeHtml(facility.type)}" data-type="${escapeHtml(facility.type)}"><span class="facility-icon">${escapeHtml(facility.code||"?")}</span><span class="facility-name">${escapeHtml(facility.name||"Facility")}<span class="facility-japanese">${escapeHtml(facility.japaneseName||"")}</span></span><span class="facility-description">${escapeHtml(facility.description||"")}</span></button>`).join("");
elements.facilityGrid.querySelectorAll("[data-facility-type]").forEach((button)=>button.addEventListener("click",()=>openFacility(button.dataset.facilityType,button)));
}

function selectPhenomenon(phenomenonId) {
const phenomenon = getPhenomenonById(phenomenonId);
if (!phenomenon) return;
state.activePhenomenonId = phenomenon.id;
state.activeTopicId = "";
state.selectedChoiceId = "";
state.selectedContentId = "";
state.activeFacilityType = "";
state.phenomenonAccordionOpen = false;
renderPhenomena();
renderBooks();
renderInsight();
renderFacilities();
syncPhenomenonAccordion();
updateUrlState({phenomenon:phenomenon.id,content:"",topic:""});
}

function openFacility(type,triggerElement=null) {
if (!state.data) return;
const matchingContents = state.data.contents.filter((content)=>content.type===type);
if (!matchingContents.length) return;
state.activeFacilityType = type;
openContent(matchingContents[0].id,triggerElement);
}

function renderDrawerMeta(content) {
if (!elements.drawerMeta) return;
const values = [content.code,content.status,formatDate(content.updatedAt),...normalizeArray(content.tags)].filter(Boolean);
elements.drawerMeta.innerHTML = values.map((value)=>'<span class="tag">'+escapeHtml(value)+'</span>').join("");
}

function setDrawerSectionVisible(element,isVisible) {
if (!element) return;
const section = element.closest(".drawer-section");
if (section) section.hidden = !isVisible;
}

function clearResearchDrawerSections() {
[elements.drawerQuestion,elements.drawerCommonTheory,elements.drawerAdjustmentView,elements.drawerWhy,elements.drawerCheckpoints,elements.drawerPdsEvaluation,elements.drawerTrackingData,elements.drawerHypotheses,elements.drawerResearchQuestions].forEach((element)=>{
if (!element) return;
element.innerHTML="";
setDrawerSectionVisible(element,false);
});
}

function renderResearchSection(element,section) {
if (!element) return;
const source = isPlainObject(section) ? section : {};
const parts = [];
if (source.title) parts.push('<h4 class="drawer-content-title">'+escapeHtml(source.title)+'</h4>');
if (source.text) parts.push('<p class="drawer-content-text">'+escapeHtml(source.text)+'</p>');
if (normalizeArray(source.points).length) {
parts.push(normalizeArray(source.points).map((point,index)=>'<div class="drawer-list-item"><strong>'+String(index+1).padStart(2,"0")+'</strong><span>'+escapeHtml(point)+'</span></div>').join(""));
}
element.innerHTML = parts.join("");
setDrawerSectionVisible(element,parts.length>0);
}

function renderResearchDetail(content) {
clearResearchDrawerSections();
if (!content || content.type!=="research" || !isPlainObject(content.researchDetail)) return;
const d = content.researchDetail;
renderResearchSection(elements.drawerQuestion,d.question);
renderResearchSection(elements.drawerCommonTheory,d.commonTheory);
renderResearchSection(elements.drawerAdjustmentView,d.adjustmentView);
renderResearchSection(elements.drawerWhy,d.why);
renderResearchSection(elements.drawerCheckpoints,d.fieldCheck);
renderResearchSection(elements.drawerPdsEvaluation,d.pdsEvaluation);
renderResearchSection(elements.drawerTrackingData,d.tracking);
if (elements.drawerHypotheses) {
elements.drawerHypotheses.innerHTML = normalizeArray(d.hypotheses).map((item)=>'<div class="drawer-list-item"><strong>'+escapeHtml((item.status||"ACTIVE")+" / "+(item.title||""))+'</strong><span>'+escapeHtml(item.text||"")+'</span></div>').join("");
setDrawerSectionVisible(elements.drawerHypotheses,normalizeArray(d.hypotheses).length>0);
}
if (elements.drawerResearchQuestions) {
elements.drawerResearchQuestions.innerHTML = normalizeArray(d.researchQuestions).map((item,index)=>'<div class="drawer-list-item"><strong>'+escapeHtml((item.status||"OPEN")+" / "+String(index+1).padStart(2,"0"))+'</strong><span>'+escapeHtml(item.text||"")+'</span></div>').join("");
setDrawerSectionVisible(elements.drawerResearchQuestions,normalizeArray(d.researchQuestions).length>0);
}
}

function renderDrawerRelated(content) {
if (!elements.drawerRelated) return;
const relatedContents = getRelatedContents(content.relatedIds);
elements.drawerRelated.innerHTML = relatedContents.map((related)=>'<button class="drawer-related-item" type="button" data-drawer-related-id="'+escapeHtml(related.id)+'"><strong>'+escapeHtml(related.title)+'</strong><span>'+escapeHtml(formatTypeLabel(related.type)+" / "+related.code)+'</span></button>').join("");
elements.drawerRelated.querySelectorAll("[data-drawer-related-id]").forEach((button)=>button.addEventListener("click",()=>openContent(button.dataset.drawerRelatedId,button,{preserveFocus:true})));
}

function openContent(contentId,triggerElement=null,options={}) {
const content = getContentById(contentId);
if (!content || !elements.detailDrawer) return;
if (!options.preserveFocus && triggerElement instanceof HTMLElement) state.lastFocusedElement = triggerElement;
state.selectedContentId = content.id;
if (elements.drawerEyebrow) elements.drawerEyebrow.textContent = `${formatTypeLabel(content.type)} / ${content.code}`;
if (elements.drawerTitle) elements.drawerTitle.textContent = content.title;
if (elements.drawerSummary) elements.drawerSummary.textContent = content.summary;
renderResearchDetail(content);
renderDrawerMeta(content);
renderDrawerRelated(content);
renderBooks();
elements.detailDrawer.classList.add("is-open");
elements.detailDrawer.setAttribute("aria-hidden","false");
if (elements.drawerBackdrop) {
elements.drawerBackdrop.classList.add("is-open");
elements.drawerBackdrop.setAttribute("aria-hidden","false");
}
document.body.classList.add("menu-open");
state.drawerOpen = true;
updateUrlState({content:content.id});
if (elements.drawerClose) elements.drawerClose.focus();
}

function closeDrawer() {
if (!elements.detailDrawer) return;
elements.detailDrawer.classList.remove("is-open");
elements.detailDrawer.setAttribute("aria-hidden","true");
if (elements.drawerBackdrop) {
elements.drawerBackdrop.classList.remove("is-open");
elements.drawerBackdrop.setAttribute("aria-hidden","true");
}
document.body.classList.remove("menu-open");
state.drawerOpen = false;
state.selectedContentId = "";
renderBooks();
updateUrlState({content:""});
}

function openMobileMenu() {
if (!elements.mobileNav || !elements.mobileMenuButton) return;
elements.mobileNav.hidden=false;
elements.mobileNav.classList.add("is-open");
elements.mobileMenuButton.setAttribute("aria-expanded","true");
state.mobileMenuOpen=true;
}

function closeMobileMenu() {
if (!elements.mobileNav || !elements.mobileMenuButton) return;
elements.mobileNav.classList.remove("is-open");
elements.mobileNav.hidden=true;
elements.mobileMenuButton.setAttribute("aria-expanded","false");
state.mobileMenuOpen=false;
}

function toggleMobileMenu() {
state.mobileMenuOpen ? closeMobileMenu() : openMobileMenu();
}

function syncMobileNavigation() {
if (window.matchMedia("(min-width:1101px)").matches) closeMobileMenu();
}

function updateUrlState(changes) {
const url = new URL(window.location.href);
["phenomenon","content","topic"].forEach((key)=>{
if (Object.prototype.hasOwnProperty.call(changes,key)) {
const value = normalizeString(changes[key]);
if (value) url.searchParams.set(key,value);
else url.searchParams.delete(key);
}
});
window.history.replaceState({},"",url);
}

function applyUrlState() {
if (!state.data) return;
const params = new URLSearchParams(window.location.search);
const phenomenon = params.get("phenomenon");
const content = params.get("content");
const topic = params.get("topic");
if (phenomenon && getPhenomenonById(phenomenon)) state.activePhenomenonId = phenomenon;
if (content && getContentById(content)) state.selectedContentId = content;
if (topic && getTopicById(topic)) state.activeTopicId = topic;
}

function renderAll() {
renderMeta();
renderPhenomena();
renderBooks();
renderInsight();
renderUpdates();
renderFacilities();
}

function initializeState() {
if (!state.data) return;
if (state.data.phenomena.length) state.activePhenomenonId = state.data.phenomena[0].id;
applyUrlState();
renderAll();
if (state.activeTopicId) openTopic(state.activeTopicId);
if (state.selectedContentId) openContent(state.selectedContentId,null,{preserveFocus:true});
}

function setLoadingState(isLoading) {
if (elements.reloadDataButton) elements.reloadDataButton.disabled = isLoading;
}

function hideDataError() {
if (elements.dataErrorSection) elements.dataErrorSection.hidden=true;
}

function showDataError(message) {
if (elements.dataErrorSection) elements.dataErrorSection.hidden=false;
if (elements.dataErrorMessage) elements.dataErrorMessage.textContent=message;
}

async function loadCampusData() {
setLoadingState(true);
hideDataError();
try {
state.data = await fetchCampusData();
initializeState();
} catch (error) {
console.error("[Digital Research Campus]",error);
state.data = null;
showDataError(error instanceof Error ? error.message : "Campus data load error.");
} finally {
setLoadingState(false);
}
}

function initializeEvents() {
if (elements.mobileMenuButton) elements.mobileMenuButton.addEventListener("click",toggleMobileMenu);
if (elements.drawerClose) elements.drawerClose.addEventListener("click",closeDrawer);
if (elements.drawerBackdrop) elements.drawerBackdrop.addEventListener("pointerdown",(event)=>{if(event.target===elements.drawerBackdrop) closeDrawer();});
if (elements.reloadDataButton) elements.reloadDataButton.addEventListener("click",loadCampusData);
document.addEventListener("keydown",(event)=>{
if (event.key==="Escape") {
if (state.drawerOpen) closeDrawer();
else if (state.mobileMenuOpen) closeMobileMenu();
}
});
window.addEventListener("resize",syncMobileNavigation,{passive:true});
}

function initialize() {
initializePhenomenonAccordion();
initializeEvents();
syncMobileNavigation();
loadCampusData();
}

if (document.readyState==="loading") {
document.addEventListener("DOMContentLoaded",initialize,{once:true});
} else {
initialize();
}
})();
