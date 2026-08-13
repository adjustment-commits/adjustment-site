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
drawerQuestionHeading:document.getElementById("drawerQuestionHeading"),
drawerQuestion:document.getElementById("drawerQuestion"),
drawerCommonTheoryHeading:document.getElementById("drawerCommonTheoryHeading"),
drawerCommonTheory:document.getElementById("drawerCommonTheory"),
drawerAdjustmentViewHeading:document.getElementById("drawerAdjustmentViewHeading"),
drawerAdjustmentView:document.getElementById("drawerAdjustmentView"),
drawerWhy:document.getElementById("drawerWhy"),
drawerCheckpoints:document.getElementById("drawerCheckpoints"),
drawerPdsEvaluation:document.getElementById("drawerPdsEvaluation"),
drawerTrackingData:document.getElementById("drawerTrackingData"),
drawerHypotheses:document.getElementById("drawerHypotheses"),
drawerResearchQuestions:document.getElementById("drawerResearchQuestions"),
drawerPerformanceConnection:document.getElementById("drawerPerformanceConnection"),
drawerInterpretation:document.getElementById("drawerInterpretation"),
drawerLimitations:document.getElementById("drawerLimitations"),
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
  if (
    !elements.phenomenonList ||
    phenomenonAccordionElements.root
  ) {
    return;
  }

  const parent =
    elements.phenomenonList.parentElement;

  if (!parent) {
    return;
  }

  const root =
    document.createElement("section");

  root.className =
    "phenomenon-accordion";

  const toggle =
    document.createElement("button");

  toggle.className =
    "phenomenon-accordion-toggle";

  toggle.type = "button";

  toggle.setAttribute(
    "aria-expanded",
    "false"
  );

  toggle.setAttribute(
    "aria-controls",
    "phenomenonAccordionBody"
  );

 toggle.innerHTML =
  '<span class="phenomenon-accordion-heading">' +
    '<span class="phenomenon-accordion-label">\u8ab2\u984c\u3092\u9078\u3076</span>' +
    '<span class="phenomenon-accordion-count">0 ITEMS</span>' +
  '</span>' +
  '<span class="phenomenon-accordion-current">\u8ab2\u984c\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044</span>' +
  '<span class="phenomenon-accordion-icon">+</span>';


  const body =
    document.createElement("div");

  body.id =
    "phenomenonAccordionBody";

  body.className =
    "phenomenon-accordion-body";

  body.hidden = true;

  parent.insertBefore(
    root,
    elements.phenomenonList
  );

  root.appendChild(toggle);
  root.appendChild(body);
  body.appendChild(elements.phenomenonList);

  phenomenonAccordionElements.root =
    root;

  phenomenonAccordionElements.toggle =
    toggle;

  phenomenonAccordionElements.body =
    body;

  phenomenonAccordionElements.count =
    toggle.querySelector(
      ".phenomenon-accordion-count"
    );

  phenomenonAccordionElements.current =
    toggle.querySelector(
      ".phenomenon-accordion-current"
    );

  phenomenonAccordionElements.icon =
    toggle.querySelector(
      ".phenomenon-accordion-icon"
    );

  toggle.addEventListener(
    "click",
    togglePhenomenonAccordion
  );

  syncPhenomenonAccordion();
}

function openPhenomenonAccordion() {
  state.phenomenonAccordionOpen = true;
  syncPhenomenonAccordion();
}

function closePhenomenonAccordion() {
  state.phenomenonAccordionOpen = false;
  syncPhenomenonAccordion();
}

function togglePhenomenonAccordion() {
  state.phenomenonAccordionOpen =
    !state.phenomenonAccordionOpen;

  syncPhenomenonAccordion();
}

function syncPhenomenonAccordion() {
  const {
    root,
    toggle,
    body,
    count,
    current,
    icon
  } = phenomenonAccordionElements;

  if (
    !root ||
    !toggle ||
    !body
  ) {
    return;
  }

  const isOpen =
    state.phenomenonAccordionOpen;

  toggle.setAttribute(
    "aria-expanded",
    String(isOpen)
  );

  body.hidden =
    !isOpen;

  root.classList.toggle(
    "is-open",
    isOpen
  );

  if (icon) {
    icon.textContent =
      isOpen
        ? "\u2212"
        : "+";
  }

  const itemCount =
    state.data &&
    Array.isArray(state.data.phenomena)
      ? state.data.phenomena.length
      : 0;

  if (count) {
    count.textContent =
      `${itemCount} ITEMS`;
  }

  const activePhenomenon =
    getActivePhenomenon();

  if (current) {
    current.textContent =
      activePhenomenon
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
return typeof value === "string"
? value.trim()
: fallback;
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

function getContentById(contentId) {
if (!state.data) {
return null;
}

return state.data.contents.find((content) => {
return content.id === contentId;
}) || null;
}

function getPhenomenonById(phenomenonId) {
if (!state.data) {
return null;
}

return state.data.phenomena.find((phenomenon) => {
return phenomenon.id === phenomenonId;
}) || null;
}

function getActivePhenomenon() {
return getPhenomenonById(
state.activePhenomenonId
);
}

function getFacilityByType(type) {
if (!state.data) {
return null;
}

return state.data.facilities.find((facility) => {
return facility.type === type;
}) || null;
}

function getRelatedContents(ids) {
return normalizeArray(ids)
.map((contentId) => {
return getContentById(contentId);
})
.filter(Boolean);
}
  
function getTopicById(topicId) {
  if (!state.data) {
    return null;
  }

  return state.data.topics.find((topic) => {
    return topic.id === topicId;
  }) || null;
}

function getRelatedTopics(ids) {
  return normalizeArray(ids)
    .map((topicId) => {
      return getTopicById(topicId);
    })
    .filter(Boolean);
}
  
function getPhenomenaByTopicId(topicId) {
  const normalizedTopicId = normalizeString(topicId);
  const phenomena = state.data?.phenomena;

  if (!normalizedTopicId || !Array.isArray(phenomena)) {
    return [];
  }

  return phenomena.filter((phenomenon) => {
    const relatedTopicIds = normalizeArray(phenomenon?.relatedTopicIds);
    return relatedTopicIds.includes(normalizedTopicId);
  });
}

function formatTypeLabel(type) {
return TYPE_LABELS[type] ||
normalizeString(type,"CONTENT").toUpperCase();
}

function formatTypeJapaneseLabel(type) {
return TYPE_JAPANESE_LABELS[type] ||
"\u8cc7\u6599";
}

function formatDate(value) {
const text = normalizeString(value);

if (!text) {
return "";
}

const normalized = text
.replaceAll("/",".")
.replaceAll("-",".");

const parts = normalized.split(".");

if (parts.length !== 3) {
return text;
}

const year = parts[0];
const month = parts[1];
const day = parts[2];

if (
year.length !== 4 ||
month.length < 1 ||
month.length > 2 ||
day.length < 1 ||
day.length > 2 ||
Number.isNaN(Number(year)) ||
Number.isNaN(Number(month)) ||
Number.isNaN(Number(day))
) {
return text;
}

return (
year +
"." +
month.padStart(2,"0") +
"." +
day.padStart(2,"0")
);
}

function getFocusableElements(container) {
if (!container) {
return [];
}

return Array.from(
container.querySelectorAll(
[
"a[href]",
"button:not([disabled])",
"input:not([disabled])",
"textarea:not([disabled])",
"select:not([disabled])",
"[tabindex]:not([tabindex='-1'])"
].join(",")
)
).filter((element) => {
return (
!element.hidden &&
element.getAttribute("aria-hidden") !== "true"
);
});
}

function setLoadingState(isLoading) {
if (elements.phenomenonList) {
elements.phenomenonList.setAttribute(
"aria-busy",
String(isLoading)
);
}

if (elements.bookshelf) {
elements.bookshelf.setAttribute(
"aria-busy",
String(isLoading)
);
}

if (elements.reloadDataButton) {
elements.reloadDataButton.disabled = isLoading;
elements.reloadDataButton.textContent = isLoading
? "\u8aad\u307f\u8fbc\u307f\u4e2d"
: "\u518d\u8aad\u307f\u8fbc\u307f";
}
}

function showDataError(message) {
if (!elements.dataErrorSection) {
return;
}

if (elements.dataErrorMessage) {
elements.dataErrorMessage.textContent =
normalizeString(
message,
"data\u30d5\u30a9\u30eb\u30c0\u5185\u306eJSON\u30d5\u30a1\u30a4\u30eb\u306e\u914d\u7f6e\u3068\u5f62\u5f0f\u3092\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044\u3002"
);
}

elements.dataErrorSection.hidden = false;
}

function hideDataError() {
if (elements.dataErrorSection) {
elements.dataErrorSection.hidden = true;
}
}

function validateRelatedIds(ids,contentIds,location,errors) {
normalizeArray(ids).forEach((relatedId) => {
const normalizedId = normalizeString(relatedId);

if (normalizedId && !contentIds.has(normalizedId)) {
errors.push(
`${location}\u306b\u5b58\u5728\u3057\u306a\u3044content ID\u300c${normalizedId}\u300d\u304c\u3042\u308a\u307e\u3059\u3002`
);
}
});
}

function validateNonEmptyText(value, location, errors) {
  if (!normalizeString(value)) {
    errors.push(`${location}\u304c\u3042\u308a\u307e\u305b\u3093\u3002`);
  }
}

function validateRelatedTopicIds(
  ids,
  validTopicIds,
  location,
  errors
) {
  if (!Array.isArray(ids)) {
    errors.push(
      `${location}\u306f\u914d\u5217\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
    );
    return;
  }

  const localTopicIds = new Set();

  ids.forEach((topicId, index) => {
    const normalizedId = normalizeString(topicId);

    if (!normalizedId) {
      errors.push(
        `${location}[${index}]\u306btopic ID\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
      );
      return;
    }

    if (localTopicIds.has(normalizedId)) {
      errors.push(
        `${location}\u5185\u3067topic ID\u300c${normalizedId}\u300d\u304c\u91cd\u8907\u3057\u3066\u3044\u307e\u3059\u3002`
      );
      return;
    }

    localTopicIds.add(normalizedId);

    if (
      validTopicIds instanceof Set &&
      !validTopicIds.has(normalizedId)
    ) {
      errors.push(
        `${location}\u306b\u5b58\u5728\u3057\u306a\u3044topic ID\u300c${normalizedId}\u300d\u304c\u3042\u308a\u307e\u3059\u3002`
      );
    }
  });
}

function validatePhenomenonQuestion(
  question,
  phenomenonIndex,
  errors
) {
  const location = `phenomena[${phenomenonIndex}].question`;

  if (!isPlainObject(question)) {
    errors.push(
      `${location}\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
    );

    return new Set();
  }

  validateNonEmptyText(
    question.title,
    `${location}.title`,
    errors
  );

  validateNonEmptyText(
    question.text,
    `${location}.text`,
    errors
  );

  if (!Array.isArray(question.choices)) {
    errors.push(
      `${location}.choices\u306f\u914d\u5217\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
    );

    return new Set();
  }

  if (question.choices.length === 0) {
    errors.push(
      `${location}.choices\u306b\u9078\u629e\u80a2\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
    );
  }

  const choiceIds = new Set();

  question.choices.forEach((choice, choiceIndex) => {
    const choiceLocation = `${location}.choices[${choiceIndex}]`;

    if (!isPlainObject(choice)) {
      errors.push(
        `${choiceLocation}\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
      );
      return;
    }

    const choiceId = normalizeString(choice.id);

    if (!choiceId) {
      errors.push(
        `${choiceLocation}.id\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
      );
    } else if (choiceIds.has(choiceId)) {
      errors.push(
        `${location}.choices\u5185\u3067id\u300c${choiceId}\u300d\u304c\u91cd\u8907\u3057\u3066\u3044\u307e\u3059\u3002`
      );
    } else {
      choiceIds.add(choiceId);
    }

    validateNonEmptyText(
      choice.label,
      `${choiceLocation}.label`,
      errors
    );
  });

  return choiceIds;
}


function validateThinkingFlow(
thinkingFlow,
choiceIds,
phenomenonIndex,
errors
) {
const location =
`phenomena[${phenomenonIndex}].thinkingFlow`;

if (!isPlainObject(thinkingFlow)) {
errors.push(
`${location}\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
);
return;
}

const requiredSections = [
[
"entryQuestion",
thinkingFlow.entryQuestion,
true
],
[
"commonTheory",
thinkingFlow.commonTheory,
false
],
[
"adjustmentView",
thinkingFlow.adjustmentView,
false
],
[
"nextStep",
thinkingFlow.nextStep,
false
]
];

requiredSections.forEach(
([sectionName, section, requiresTitle]) => {
const sectionLocation =
`${location}.${sectionName}`;
  if (!isPlainObject(section)) {
    errors.push(
      `${sectionLocation}\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
    );
    return;
  }

  if (requiresTitle) {
    validateNonEmptyText(
      section.title,
      `${sectionLocation}.title`,
      errors
    );
  }

  validateNonEmptyText(
    section.text,
    `${sectionLocation}.text`,
    errors
  );
}
);
  
  if (!Array.isArray(thinkingFlow.branches)) {
    
    errors.push(
      `${location}.branches\u306f\u914d\u5217\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
    );
  } else {
    const branchIds = new Set();

    thinkingFlow.branches.forEach((branch, branchIndex) => {
      const branchLocation = `${location}.branches[${branchIndex}]`;

      if (!isPlainObject(branch)) {
        errors.push(
          `${branchLocation}\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
        );
        return;
      }

      const branchId = normalizeString(branch.id);

      if (!branchId) {
        errors.push(
          `${branchLocation}.id\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
        );
      } else if (branchIds.has(branchId)) {
        errors.push(
          `${location}.branches\u5185\u3067id\u300c${branchId}\u300d\u304c\u91cd\u8907\u3057\u3066\u3044\u307e\u3059\u3002`
        );
      } else {
        branchIds.add(branchId);
      }

      const next = normalizeString(branch.next);

      if (!next) {
        errors.push(
          `${branchLocation}.next\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
        );
      } else if (next !== "commonTheory") {
        errors.push(
          `${branchLocation}.next\u300c${next}\u300d\u306f\u73fe\u884c\u306e6STEP\u4ed5\u69d8\u3067\u306f\u300ccommonTheory\u300d\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
        );
      }
    });

    choiceIds.forEach((choiceId) => {
      if (!branchIds.has(choiceId)) {
        errors.push(
          `${location}.branches\u306bquestion choice\u300c${choiceId}\u300d\u306b\u5bfe\u5fdc\u3059\u308bbranch\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
        );
      }
    });

    branchIds.forEach((branchId) => {
      if (!choiceIds.has(branchId)) {
        errors.push(
          `${location}.branches\u306eid\u300c${branchId}\u300d\u306b\u5bfe\u5fdc\u3059\u308bquestion choice\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
        );
      }
    });
  }

  const premium = thinkingFlow.premium;

  if (!isPlainObject(premium)) {
    errors.push(
      `${location}.premium\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
    );
    return;
  }

  if (typeof premium.locked !== "boolean") {
    errors.push(
      `${location}.premium.locked\u306fboolean\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
    );
  }

  validateNonEmptyText(premium.title, `${location}.premium.title`, errors);

  validateNonEmptyText(premium.text, `${location}.premium.text`, errors);
}


function validateResearchDetail(
researchDetail,
contentIndex,
errors
) {
const location =
`contents[${contentIndex}].researchDetail`;

if (!isPlainObject(researchDetail)) {
errors.push(
`${location}\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
);
return;
}

const requiredTextSections = [
"question",
"commonTheory",
"adjustmentView",
"why",
"fieldCheck",
"pdsEvaluation",
"tracking"
];

requiredTextSections.forEach((sectionName) => {
const section =
researchDetail[sectionName];

const sectionLocation =
`${location}.${sectionName}`;

if (!isPlainObject(section)) {
errors.push(
`${sectionLocation}\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
);
return;
}

validateNonEmptyText(
section.title,
`${sectionLocation}.title`,
errors
);

validateNonEmptyText(
section.text,
`${sectionLocation}.text`,
errors
);

if (
Object.prototype.hasOwnProperty.call(
section,
"points"
) &&
!Array.isArray(section.points)
) {
errors.push(
`${sectionLocation}.points\u306f\u914d\u5217\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
);
}
});

if (!Array.isArray(researchDetail.hypotheses)) {
errors.push(
`${location}.hypotheses\u306f\u914d\u5217\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
);
} else {
researchDetail.hypotheses.forEach(
(item,index) => {
const itemLocation =
`${location}.hypotheses[${index}]`;

if (!isPlainObject(item)) {
errors.push(
`${itemLocation}\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
);
return;
}

validateNonEmptyText(
item.id,
`${itemLocation}.id`,
errors
);

validateNonEmptyText(
item.title,
`${itemLocation}.title`,
errors
);

validateNonEmptyText(
item.text,
`${itemLocation}.text`,
errors
);

validateNonEmptyText(
item.status,
`${itemLocation}.status`,
errors
);
}
);
}

if (!Array.isArray(researchDetail.researchQuestions)) {
errors.push(
`${location}.researchQuestions\u306f\u914d\u5217\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
);
} else {
researchDetail.researchQuestions.forEach(
(item,index) => {
const itemLocation =
`${location}.researchQuestions[${index}]`;

if (!isPlainObject(item)) {
errors.push(
`${itemLocation}\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
);
return;
}

validateNonEmptyText(
item.id,
`${itemLocation}.id`,
errors
);

validateNonEmptyText(
item.text,
`${itemLocation}.text`,
errors
);

validateNonEmptyText(
item.status,
`${itemLocation}.status`,
errors
);
}
);
}
}

// ==========================================
// 1. validateCaseDetail 関数の修正版
// ==========================================
function validateCaseDetail(caseDetail, contentIndex, errors) {
  const location = `contents[${contentIndex}].caseDetail`;

  if (!isPlainObject(caseDetail)) {
    errors.push(`${location}はオブジェクトである必要があります。`);
    return;
  }

  const requiredSections = [
    "background",
    "phenomenon",
    "initialInterpretation",
    "assessment",
    "intervention",
    "response",
    "interpretation",
    "limitations"
  ];

  requiredSections.forEach((sectionName) => {
    const section = caseDetail[sectionName];
    const sectionLocation = `${location}.${sectionName}`;

    if (!isPlainObject(section)) {
      errors.push(`${sectionLocation}はオブジェクトである必要があります。`);
      return;
    }

    validateNonEmptyText(
      section.title,
      `${sectionLocation}.title`,
      errors
    );

    validateNonEmptyText(
      section.text,
      `${sectionLocation}.text`,
      errors
    );

    if (
      Object.prototype.hasOwnProperty.call(section, "points") &&
      !Array.isArray(section.points)
    ) {
      errors.push(`${sectionLocation}.pointsは配列である必要があります。`);
    }
  });
}


function validateData(data) {
  const errors = [];

  if (!isPlainObject(data)) {
    return {
      valid: false,
      errors: [
        "Campus\u30c7\u30fc\u30bf\u306e\u30eb\u30fc\u30c8\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002"
      ]
    };
  }

  if (!Array.isArray(data.phenomena)) {
    errors.push(
      "phenomena\u306f\u914d\u5217\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002"
    );
  }

  if (!Array.isArray(data.topics)) {
    errors.push(
      "topics\u306f\u914d\u5217\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002"
    );
  }

  if (!Array.isArray(data.contents)) {
    errors.push(
      "contents\u306f\u914d\u5217\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002"
    );
  }

  if (!Array.isArray(data.updates)) {
    errors.push(
      "updates\u306f\u914d\u5217\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002"
    );
  }

  if (!Array.isArray(data.facilities)) {
    errors.push(
      "facilities\u306f\u914d\u5217\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002"
    );
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors
    };
  }

  const contentIds = new Set();
  const phenomenonIds = new Set();
  const topicIds = new Set();
  const facilityTypes = new Set();

  const allowedTopicCategories = new Set([
    "foundation",
    "body",
    "movement"
  ]);

  data.topics.forEach((topic, index) => {
    if (!isPlainObject(topic)) {
      errors.push(
        `topics[${index}]\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
      );
      return;
    }

    const id = normalizeString(topic.id);

    if (!id) {
      errors.push(
        `topics[${index}].id\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
      );
    } else if (topicIds.has(id)) {
      errors.push(
        `topics\u5185\u3067id\u300c${id}\u300d\u304c\u91cd\u8907\u3057\u3066\u3044\u307e\u3059\u3002`
      );
    } else {
      topicIds.add(id);
    }

    if (!normalizeString(topic.label)) {
      errors.push(
        `topics[${index}].label\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
      );
    }

    const category = normalizeString(topic.category);

    if (!category) {
      errors.push(
        `topics[${index}].category\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
      );
    } else if (!allowedTopicCategories.has(category)) {
      errors.push(
        `topics[${index}].category\u300c${category}\u300d\u306f\u672a\u5b9a\u7fa9\u3067\u3059\u3002`
      );
    }

    if (!normalizeString(topic.summary)) {
      errors.push(
        `topics[${index}].summary\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
      );
    }
  });

  data.topics.forEach((topic, index) => {
    if (!isPlainObject(topic)) {
      return;
    }

    validateRelatedTopicIds(
      topic.relatedTopicIds,
      topicIds,
      `topics[${index}].relatedTopicIds`,
      errors
    );
  });

 data.contents.forEach((content, index) => {
  if (!isPlainObject(content)) {
    errors.push(
      `contents[${index}]はオブジェクトである必要があります。`
    );
    return;
  }

  const id = normalizeString(content.id);

  if (!id) {
    errors.push(
      `contents[${index}].idがありません。`
    );
  } else if (contentIds.has(id)) {
    errors.push(
      `contents内でid「${id}」が重複しています。`
    );
  } else {
    contentIds.add(id);
  }

  if (!normalizeString(content.type)) {
    errors.push(
      `contents[${index}].typeがありません。`
    );
  }

  if (!normalizeString(content.title)) {
    errors.push(
      `contents[${index}].titleがありません。`
    );
  }
});




  data.topics.forEach((topic, index) => {
    if (!isPlainObject(topic)) {
      return;
    }

    validateRelatedIds(
      topic.relatedContentIds,
      contentIds,
      `topics[${index}].relatedContentIds`,
      errors
    );
  });

  data.phenomena.forEach((phenomenon, index) => {
    if (!isPlainObject(phenomenon)) {
      errors.push(
        `phenomena[${index}]\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
      );
      return;
    }

    const id = normalizeString(phenomenon.id);

    if (!id) {
      errors.push(
        `phenomena[${index}].id\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
      );
    } else if (phenomenonIds.has(id)) {
      errors.push(
        `phenomena\u5185\u3067id\u300c${id}\u300d\u304c\u91cd\u8907\u3057\u3066\u3044\u307e\u3059\u3002`
      );
    } else {
      phenomenonIds.add(id);
    }

    if (!normalizeString(phenomenon.label)) {
      errors.push(
        `phenomena[${index}].label\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
      );
    }

    if (!normalizeString(phenomenon.title)) {
      errors.push(
        `phenomena[${index}].title\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
      );
    }

    if (!normalizeString(phenomenon.description)) {
      errors.push(
        `phenomena[${index}].description\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
      );
    }

    const choiceIds = validatePhenomenonQuestion(
      phenomenon.question,
      index,
      errors
    );

    validateThinkingFlow(
      phenomenon.thinkingFlow,
      choiceIds,
      index,
      errors
    );

    validateRelatedTopicIds(
      phenomenon.relatedTopicIds,
      topicIds,
      `phenomena[${index}].relatedTopicIds`,
      errors
    );

    validateRelatedIds(
      phenomenon.relatedIds,
      contentIds,
      `phenomena[${index}].relatedIds`,
      errors
    );
  });

 data.contents.forEach((content, index) => {
  if (!isPlainObject(content)) {
    return;
  }

  const contentType = normalizeString(content.type);

  if (
    contentType === "research" &&
    Object.prototype.hasOwnProperty.call(content, "researchDetail")
  ) {
    validateResearchDetail(
      content.researchDetail,
      index,
      errors
    );
  }

  if (
    contentType === "case" &&
    Object.prototype.hasOwnProperty.call(content, "caseDetail")
  ) {
    validateCaseDetail(
      content.caseDetail,
      index,
      errors
    );
  }

  validateRelatedIds(
    content.relatedIds,
    contentIds,
    `contents[${index}].relatedIds`,
    errors
  );

  if (
    contentType === "research" &&
    isPlainObject(content.researchDetail) &&
    isPlainObject(content.researchDetail.pdsEvaluation)
  ) {
    validateRelatedIds(
      content.researchDetail.pdsEvaluation.relatedIds,
      contentIds,
      `contents[${index}].researchDetail.pdsEvaluation.relatedIds`,
      errors
    );
  }
});

  data.updates.forEach((update, index) => {
    if (!isPlainObject(update)) {
      errors.push(
        `updates[${index}]\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
      );
      return;
    }

    const contentId = normalizeString(update.contentId);

    if (!contentId) {
      errors.push(
        `updates[${index}].contentId\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
      );
    } else if (!contentIds.has(contentId)) {
      errors.push(
        `updates[${index}]\u306econtentId\u300c${contentId}\u300d\u306b\u5bfe\u5fdc\u3059\u308b\u8cc7\u6599\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
      );
    }
  });

  data.facilities.forEach((facility, index) => {
    if (!isPlainObject(facility)) {
      errors.push(
        `facilities[${index}]\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
      );
      return;
    }

    const type = normalizeString(facility.type);

    if (!type) {
      errors.push(
        `facilities[${index}].type\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
      );
    } else if (facilityTypes.has(type)) {
      errors.push(
        `facilities\u5185\u3067type\u300c${type}\u300d\u304c\u91cd\u8907\u3057\u3066\u3044\u307e\u3059\u3002`
      );
    } else {
      facilityTypes.add(type);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}



function normalizeQuestion(question) {
  const source = isPlainObject(question) ? question : {};

  return {
    title: normalizeString(
      source.title,
      "\u307e\u305a\u8003\u3048\u3066\u307f\u307e\u3057\u3087\u3046"
    ),
    text: normalizeString(
      source.text,
      "\u3053\u306e\u73fe\u8c61\u3092\u3069\u306e\u3088\u3046\u306b\u6349\u3048\u3066\u3044\u307e\u3059\u304b\u3002"
    ),
    description: normalizeString(
      source.description,
      "\u307e\u305a\u81ea\u5206\u306e\u6349\u3048\u65b9\u3092\u78ba\u8a8d\u3057\u307e\u3059\u3002"
    ),
    choices: normalizeArray(source.choices)
      .filter(isPlainObject)
      .map((choice, index) => {
        return {
          id: normalizeString(
            choice.id,
            `choice-${index + 1}`
          ),
          label: normalizeString(
            choice.label,
            `CHOICE ${index + 1}`
          ),
          response: normalizeString(choice.response)
        };
      })
  };
}


function normalizeThinkingFlow(thinkingFlow) {
  const source = isPlainObject(thinkingFlow) ? thinkingFlow : {};

  const entryQuestion = isPlainObject(source.entryQuestion)
    ? source.entryQuestion
    : {};

  const commonTheory = isPlainObject(source.commonTheory)
    ? source.commonTheory
    : {};

  const adjustmentView = isPlainObject(source.adjustmentView)
    ? source.adjustmentView
    : {};

  const nextStep = isPlainObject(source.nextStep) ? source.nextStep : {};

  const premium = isPlainObject(source.premium) ? source.premium : {};

  return {
    entryQuestion: {
      title: normalizeString(entryQuestion.title),
      text: normalizeString(entryQuestion.text),
    },
    branches: normalizeArray(source.branches)
      .filter(isPlainObject)
      .map((branch, index) => {
        return {
          id: normalizeString(branch.id, `branch-${index + 1}`),
          next: normalizeString(branch.next),
        };
      }),
    commonTheory: {
      text: normalizeString(commonTheory.text)},
    adjustmentView: {
      text: normalizeString(adjustmentView.text)},
    nextStep: {
      text: normalizeString(nextStep.text)},
    premium: {
      locked: Boolean(premium.locked),
      title: normalizeString(premium.title),
      text: normalizeString(premium.text),
    },
  };
}


function normalizeResearchTextSection(section) {
const source =
isPlainObject(section)
? section
: {};

return {
title:normalizeString(source.title),
text:normalizeString(source.text),
points:normalizeArray(source.points)
.map((item) => normalizeString(item))
.filter(Boolean)
};
}

function normalizeResearchDetail(researchDetail) {
if (!isPlainObject(researchDetail)) {
return null;
}

const pdsEvaluation =
normalizeResearchTextSection(
researchDetail.pdsEvaluation
);

pdsEvaluation.relatedIds =
normalizeArray(
researchDetail.pdsEvaluation &&
researchDetail.pdsEvaluation.relatedIds
)
.map((item) => normalizeString(item))
.filter(Boolean);

return {
question:
normalizeResearchTextSection(
researchDetail.question
),
commonTheory:
normalizeResearchTextSection(
researchDetail.commonTheory
),
adjustmentView:
normalizeResearchTextSection(
researchDetail.adjustmentView
),
why:
normalizeResearchTextSection(
researchDetail.why
),
fieldCheck:
normalizeResearchTextSection(
researchDetail.fieldCheck
),
pdsEvaluation,
tracking:
normalizeResearchTextSection(
researchDetail.tracking
),
hypotheses:
normalizeArray(
researchDetail.hypotheses
)
.filter(isPlainObject)
.map((item,index) => {
return {
id:normalizeString(
item.id,
`research-hypothesis-${index + 1}`
),
title:normalizeString(item.title),
text:normalizeString(item.text),
status:normalizeString(
item.status,
"ACTIVE"
)
};
}),
researchQuestions:
normalizeArray(
researchDetail.researchQuestions
)
.filter(isPlainObject)
.map((item,index) => {
return {
id:normalizeString(
item.id,
`research-question-${index + 1}`
),
text:normalizeString(item.text),
status:normalizeString(
item.status,
"OPEN"
)
};
})
};
}

function normalizePdsTextSection(section) {
  const source = isPlainObject(section) ? section : {};

  return {
    title: normalizeString(source.title),
    text: normalizeString(source.text),
    points: normalizeArray(source.points)
      .map((item) => normalizeString(item))
      .filter(Boolean)
  };
}

function normalizePdsEvaluationItem(item) {
  const source = isPlainObject(item) ? item : {};
  const method = isPlainObject(source.method) ? source.method : {};

  return {
    title: normalizeString(source.title),
    japaneseTitle: normalizeString(source.japaneseTitle),
    objective: normalizeString(source.objective),

    method: {
      title: normalizeString(method.title),
      text: normalizeString(method.text)
    },

    checkpoints: normalizeArray(source.checkpoints)
      .filter(isPlainObject)
      .map((checkpoint, index) => {
        return {
          id: normalizeString(checkpoint.id, `pds-checkpoint-${index + 1}`),
          title: normalizeString(checkpoint.title, `CHECK ${index + 1}`),
          text: normalizeString(checkpoint.text)
        };
      })
  };
}

function normalizePdsDetail(pdsDetail) {
  if (!isPlainObject(pdsDetail)) {
    return null;
  }

  return {
    definition: normalizePdsTextSection(pdsDetail.definition),
    purpose: normalizePdsTextSection(pdsDetail.purpose),
    principles: normalizePdsTextSection(pdsDetail.principles),
    evaluationItem: normalizePdsEvaluationItem(pdsDetail.evaluationItem),
    performanceConnection: normalizePdsTextSection(pdsDetail.performanceConnection),
    interpretation: normalizePdsTextSection(pdsDetail.interpretation),
    limitations: normalizePdsTextSection(pdsDetail.limitations)
  };
}

function normalizeCaseDetail(caseDetail) {
if (!isPlainObject(caseDetail)) {
return null;
}

return {
background:
normalizeResearchTextSection(
caseDetail.background
),
phenomenon:
  normalizeResearchTextSection(
    caseDetail.phenomenon
  ),

initialInterpretation:
  normalizeResearchTextSection(
    caseDetail.initialInterpretation
  ),

assessment:
  normalizeResearchTextSection(
    caseDetail.assessment
  ),

intervention:
  normalizeResearchTextSection(
    caseDetail.intervention
  ),

response:
  normalizeResearchTextSection(
    caseDetail.response
  ),

interpretation:
  normalizeResearchTextSection(
    caseDetail.interpretation
  ),

limitations:
  normalizeResearchTextSection(
    caseDetail.limitations
  )
};
}
  
function normalizeData(data) {
return {
meta: {
  ...DEFAULT_META,
  ...(isPlainObject(data.meta) ? data.meta : {})
},


    topics: data.topics.map((topic) => {
  return {
    id: normalizeString(topic.id),
    label: normalizeString(topic.label),
    category: normalizeString(topic.category),
    summary: normalizeString(topic.summary),
    relatedTopicIds: normalizeArray(topic.relatedTopicIds)
      .map((item) => normalizeString(item))
      .filter(Boolean),
    relatedContentIds: normalizeArray(topic.relatedContentIds)
      .map((item) => normalizeString(item))
      .filter(Boolean)
  };
}),

phenomena: data.phenomena.map((phenomenon) => {
  const thinkingFlow = normalizeThinkingFlow(
    phenomenon.thinkingFlow
  );

  const checkpoints = normalizeArray(
    phenomenon.checkpoints
  );

  return {
    id: normalizeString(phenomenon.id),

    label: normalizeString(
      phenomenon.label,
      "\u73fe\u8c61"
    ),

    title: normalizeString(
      phenomenon.title,
      "\u73fe\u8c61\u3092\u6574\u7406\u4e2d\u3067\u3059\u3002"
    ),

    description: normalizeString(
      phenomenon.description,
      "\u95a2\u9023\u3059\u308b\u60c5\u5831\u3092\u6574\u7406\u3057\u3066\u3044\u307e\u3059\u3002"
    ),

    path: normalizeArray(phenomenon.path)
      .map((item) => normalizeString(item))
      .filter(Boolean),

    question: normalizeQuestion(
      phenomenon.question
    ),

    thinkingFlow,

    adjustmentView: {
      text: normalizeString(
        thinkingFlow.adjustmentView.text
      )
    },

    why: {
      text: normalizeString(
        thinkingFlow.commonTheory.text
      ),
      points: []
    },

    branches: thinkingFlow.branches,

    checkpoints: checkpoints
      .filter(isPlainObject)
      .map((checkpoint, index) => {
        return {
          id: normalizeString(
            checkpoint.id,
            `checkpoint-${index + 1}`
          ),
          title: normalizeString(
            checkpoint.title || checkpoint.label,
            `CHECK ${index + 1}`
          ),
          description: normalizeString(
            checkpoint.description
          )
        };
      }),

    nextAction: {
      text: normalizeString(
        thinkingFlow.nextStep.text
      ),
      relatedIds: []
    },

    relatedIds: normalizeArray(phenomenon.relatedIds)
      .map((item) => normalizeString(item))
      .filter(Boolean),

    relatedTopicIds: normalizeArray(phenomenon.relatedTopicIds)
      .map((item) => normalizeString(item))
      .filter(Boolean)
  };
}),

contents: data.contents.map((content) => {
  return {
    id: normalizeString(content.id),

    type: normalizeString(
      content.type,
      "research"
    ),

    code: normalizeString(
      content.code,
      "NO-CODE"
    ),

    title: normalizeString(
      content.title,
      "\u7121\u984c"
    ),

    summary: normalizeString(
      content.summary,
      "\u6982\u8981\u3092\u6574\u7406\u4e2d\u3067\u3059\u3002"
    ),

    tags: normalizeArray(content.tags)
      .map((item) => normalizeString(item))
      .filter(Boolean),

    status: normalizeString(
      content.status,
      "DRAFT"
    ),

    statusClass: normalizeString(
      content.statusClass
    ),

    updatedAt: normalizeString(
      content.updatedAt
    ),

    observation: normalizeString(
      content.observation,
      "\u73fe\u5728\u6574\u7406\u4e2d\u3067\u3059\u3002"
    ),

    thinking: normalizeString(
      content.thinking,
      "\u73fe\u5728\u6574\u7406\u4e2d\u3067\u3059\u3002"
    ),

    verification: normalizeString(
      content.verification,
      "\u73fe\u5728\u691c\u8a3c\u4e2d\u3067\u3059\u3002"
    ),

    limitation: normalizeString(
      content.limitation,
      "\u73fe\u6642\u70b9\u3067\u306f\u4eee\u8aac\u6bb5\u968e\u3092\u542b\u307f\u307e\u3059\u3002\u500b\u5225\u306e\u8a3a\u65ad\u3084\u552f\u4e00\u306e\u6b63\u89e3\u3092\u793a\u3059\u3082\u306e\u3067\u306f\u3042\u308a\u307e\u305b\u3093\u3002"
    ),

    researchDetail:
      normalizeString(content.type) === "research"
        ? normalizeResearchDetail(content.researchDetail)
        : null,

    pdsDetail:
      normalizeString(content.type) === "pds"
        ? normalizePdsDetail(content.pdsDetail)
        : null,

    caseDetail:
      normalizeString(content.type) === "case"
        ? normalizeCaseDetail(content.caseDetail)
        : null,

    relatedIds: normalizeArray(content.relatedIds)
      .map((item) => normalizeString(item))
      .filter(Boolean)
  };
}),

updates: data.updates.map((update) => {
  return {
    id: normalizeString(update.id),

    contentId: normalizeString(
      update.contentId
    ),

    date: normalizeString(
      update.date
    ),

    label: normalizeString(
      update.label,
      "UPDATED"
    ),

    labelClass: normalizeString(
      update.labelClass
    ),

    title: normalizeString(
      update.title,
      "\u66f4\u65b0\u60c5\u5831"
    ),

    summary: normalizeString(
      update.summary,
      "\u5185\u5bb9\u3092\u66f4\u65b0\u3057\u307e\u3057\u305f\u3002"
    )
  };
}),

facilities: data.facilities.map((facility) => {
  return {
    type: normalizeString(
      facility.type
    ),

    code: normalizeString(
      facility.code,
      "?"
    ),

    name: normalizeString(
      facility.name,
      "Facility"
    ),

    japaneseName: normalizeString(
      facility.japaneseName,
      "\u7814\u7a76\u65bd\u8a2d"
    ),

    description: normalizeString(
      facility.description,
      "\u8cc7\u6599\u3092\u5206\u985e\u3057\u3066\u4fdd\u7ba1\u3057\u3066\u3044\u307e\u3059\u3002"
    ),

    detail: normalizeString(
      facility.detail,
      "Archive"
    ),

    status: normalizeString(
      facility.status,
      "OPEN"
    )
  };
})
  };
}


async function fetchJsonFile(name,url) {
const response = await fetch(
url,
{
method:"GET",
cache:"no-store",
headers:{
"Accept":"application/json"
}
}
);

if (!response.ok) {
throw new Error(
`${name} data request failed. HTTP ${response.status}`
);
}

try {
return await response.json();
} catch (error) {
throw new Error(
`${name} could not be parsed as JSON.`
);
}
}

async function fetchCampusData() {
  const [
    meta,
    phenomena,
    topics,
    research,
    pds,
    cases,
    dictionary,
    updates,
    facilities
  ] = await Promise.all([
    fetchJsonFile(
      "meta.json",
      DATA_URLS.meta
    ),
    fetchJsonFile(
      "phenomena.json",
      DATA_URLS.phenomena
    ),
    fetchJsonFile(
      "topics.json",
      DATA_URLS.topics
    ),
    fetchJsonFile(
      "research.json",
      DATA_URLS.research
    ),
    fetchJsonFile(
      "pds.json",
      DATA_URLS.pds
    ),
    fetchJsonFile(
      "cases.json",
      DATA_URLS.cases
    ),
    fetchJsonFile(
      "dictionary.json",
      DATA_URLS.dictionary
    ),
    fetchJsonFile(
      "updates.json",
      DATA_URLS.updates
    ),
    fetchJsonFile(
      "facilities.json",
      DATA_URLS.facilities
    )
  ]);

  const data = {
    meta: {
      version: normalizeString(
        meta &&
        meta.site &&
        meta.site.version,
        DEFAULT_META.version
      ),
      updatedAt: normalizeString(
        meta &&
        meta.site &&
        meta.site.updatedAt
      ),
      copyright: normalizeString(
        meta &&
        meta.branding &&
        meta.branding.copyright,
        DEFAULT_META.copyright
      )
    },
    phenomena,
    topics,
    contents: [
      ...research,
      ...pds,
      ...cases,
      ...dictionary
    ],
    updates,
    facilities
  };

  const validation = validateData(data);

  if (!validation.valid) {
    throw new Error(
      validation.errors.join(" ")
    );
  }

  return normalizeData(data);
}

function renderMeta() {
if (!state.data) {
return;
}

const version = normalizeString(
state.data.meta.version,
DEFAULT_META.version
);

const copyright = normalizeString(
state.data.meta.copyright,
DEFAULT_META.copyright
);

if (elements.campusVersion) {
elements.campusVersion.textContent =
version;
}

if (elements.footerCopyright) {
elements.footerCopyright.textContent =
copyright;
}
}

function renderPhenomena() {
  if (!elements.phenomenonList || !state.data) {
    return;
  }

  if (state.data.phenomena.length === 0) {
    elements.phenomenonList.innerHTML =
      '<div class="empty-message">\u8868\u793a\u3067\u304d\u308b\u73fe\u8c61\u304c\u3042\u308a\u307e\u305b\u3093\u3002</div>';

    elements.phenomenonList.setAttribute(
      "aria-busy",
      "false"
    );

    syncPhenomenonAccordion();

    return;
  }

  elements.phenomenonList.innerHTML =
    state.data.phenomena
      .map((phenomenon, index) => {
        const isActive =
          phenomenon.id ===
          state.activePhenomenonId;

        const itemNumber =
          String(index + 1).padStart(2, "0");

        return `
<button
class="concern-button${isActive ? " is-active" : ""}"
type="button"
data-phenomenon-id="${escapeHtml(phenomenon.id)}"
aria-pressed="${String(isActive)}"
aria-label="${escapeHtml(phenomenon.label)}"
          >
          <span class="concern-code">${escapeHtml(itemNumber)}</span>
<span class="concern-main">
  <strong>${escapeHtml(phenomenon.label)}</strong>
  <span>${escapeHtml(phenomenon.description)}</span>
</span>
<span class="concern-arrow">${isActive ? "CHECK" : ">"}</span>
          </button>
        `;
      })
      .join("");

  elements.phenomenonList
    .querySelectorAll(
      "[data-phenomenon-id]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          selectPhenomenon(
            button.dataset.phenomenonId
          );
        }
      );
    });

  elements.phenomenonList.setAttribute(
    "aria-busy",
    "false"
  );

  syncPhenomenonAccordion();
}


function sortContentsForBookshelf(contents) {
const activePhenomenon =
getActivePhenomenon();

const relatedIds = new Set(
activePhenomenon
? activePhenomenon.relatedIds
: []
);

return [...contents].sort((a,b) => {
const aRelated = relatedIds.has(a.id)
? 1
: 0;

const bRelated = relatedIds.has(b.id)
? 1
: 0;

if (aRelated !== bRelated) {
return bRelated - aRelated;
}

return a.code.localeCompare(
b.code,
"ja",
{
numeric:true,
sensitivity:"base"
}
);
});
}

function renderBooks() {
if (!elements.bookshelf || !state.data) {
return;
}

const activePhenomenon =
getActivePhenomenon();

const relatedIds = new Set(
activePhenomenon
? activePhenomenon.relatedIds
: []
);

const sortedContents =
sortContentsForBookshelf(
state.data.contents
);

if (sortedContents.length === 0) {
elements.bookshelf.innerHTML =
'<div class="loading-placeholder">\u8868\u793a\u3067\u304d\u308b\u8cc7\u6599\u304c\u3042\u308a\u307e\u305b\u3093\u3002</div>';

elements.bookshelf.setAttribute(
"aria-busy",
"false"
);

return;
}

elements.bookshelf.innerHTML =
sortedContents
.map((content) => {
const isRelated =
relatedIds.has(content.id);

const isSelected =
state.selectedContentId ===
content.id;

return (
'<button' +
' class="book' +
(isRelated ? " is-related" : "") +
(isSelected ? " is-selected" : "") +
'"' +
' type="button"' +
' data-content-id="' +
escapeHtml(content.id) +
'"' +
' data-type="' +
escapeHtml(content.type) +
'"' +
' aria-label="' +
escapeHtml(
`${formatTypeJapaneseLabel(content.type)}\uff1a${content.title}`
) +
'"' +
' aria-pressed="' +
String(isSelected) +
'"' +
'>' +
'<span class="book-type">' +
escapeHtml(
formatTypeLabel(content.type)
) +
'</span>' +
'<h4>' +
escapeHtml(content.title) +
'</h4>' +
'<p>' +
escapeHtml(content.code) +
'</p>' +
'</button>'
);
})
.join("");

elements.bookshelf
.querySelectorAll("[data-content-id]")
.forEach((button) => {
button.addEventListener(
"click",
() => {
const contentId =
button.dataset.contentId;

state.selectedContentId =
contentId;

renderBooks();
openContent(contentId,button);
}
);
});

elements.bookshelf.setAttribute(
"aria-busy",
"false"
);
}

function renderQuestionResponse(response) {
  if (!elements.entryPanel) {
    return;
  }

  const source = isPlainObject(response) ? response : {};
  const isUnlocked = Boolean(state.selectedChoiceId);

  elements.entryPanel.hidden = !isUnlocked;

  if (elements.entryTitle) {
    elements.entryTitle.textContent = isUnlocked
      ? normalizeString(source.title)
      : "";
  }

  if (elements.entryText) {
    elements.entryText.textContent = isUnlocked
      ? normalizeString(source.text)
      : "";
  }
}



function selectQuestionChoice(choiceId) {
  const phenomenon = getActivePhenomenon();

  if (!phenomenon) {
    return;
  }

  const choice = phenomenon.question.choices.find(
    (item) => item.id === choiceId
  );

  if (!choice) {
    return;
  }

  const branch = phenomenon.thinkingFlow.branches.find(
    (item) => item.id === choice.id
  );

  if (!branch) {
    console.warn(
      "[Digital Research Campus] thinkingFlow branch not found:",
      choice.id
    );
    return;
  }

  state.selectedChoiceId = choice.id;

  if (elements.questionChoices) {
    elements.questionChoices
      .querySelectorAll("[data-choice-id]")
      .forEach((button) => {
        const isSelected = button.dataset.choiceId === choice.id;

        button.classList.toggle("is-active", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
      });
  }

  renderQuestionResponse(phenomenon.thinkingFlow.entryQuestion);

  renderWhy(phenomenon);
  renderAdjustmentView(phenomenon);
  renderNextStep(phenomenon);
  renderPremium(phenomenon);
  renderRelatedTopics(phenomenon);

  if (elements.insightCount) {
    elements.insightCount.textContent = "STEP 6 / 6";
  }
}


function renderQuestion(phenomenon) {
  if (elements.questionTitle) {
    elements.questionTitle.textContent =
      phenomenon.question.title;
  }

  if (elements.questionText) {
    elements.questionText.textContent =
      phenomenon.question.text;
  }

  if (!elements.questionChoices) {
    return;
  }

  if (phenomenon.question.choices.length === 0) {
    elements.questionChoices.innerHTML =
      "\u9078\u629e\u80a2\u3092\u6574\u7406\u4e2d\u3067\u3059\u3002";
    return;
  }

  elements.questionChoices.innerHTML = phenomenon.question.choices
    .map((choice, index) => {
      const isSelected = choice.id === state.selectedChoiceId;

      return (
        '<button' +
        ' class="question-choice' + (isSelected ? " is-active" : "") + '"' +
        ' type="button"' +
        ' data-choice-id="' + escapeHtml(choice.id) + '"' +
        ' aria-pressed="' + String(isSelected) + '"' +
        '>' +
        '<span>' + String(index + 1).padStart(2, "0") + '</span>' +
        '<span>' + escapeHtml(choice.label) + '</span>' +
        '</button>'
      );
    })
    .join("");

  elements.questionChoices
    .querySelectorAll("[data-choice-id]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        selectQuestionChoice(button.dataset.choiceId);
      });
    });

  renderQuestionResponse(
    state.selectedChoiceId
      ? phenomenon.thinkingFlow.entryQuestion
      : null
  );
}

function renderAdjustmentView(phenomenon) {
const isUnlocked =
Boolean(state.selectedChoiceId);

if (elements.adjustmentPanel) {
elements.adjustmentPanel.hidden =
!isUnlocked;
}

if (elements.adjustmentText) {
elements.adjustmentText.textContent =
isUnlocked
? phenomenon.thinkingFlow.adjustmentView.text
: "";
}
}

function renderWhy(phenomenon) {
const isUnlocked =
Boolean(state.selectedChoiceId);

if (elements.commonTheoryPanel) {
elements.commonTheoryPanel.hidden =
!isUnlocked;
}

if (elements.whyText) {
elements.whyText.textContent =
isUnlocked
? phenomenon.thinkingFlow.commonTheory.text
: "";
}

if (elements.whyPoints) {
elements.whyPoints.innerHTML =
"";
}
}

function renderNextStep(phenomenon) {
const isUnlocked =
Boolean(state.selectedChoiceId);

if (elements.nextStepPanel) {
elements.nextStepPanel.hidden =
!isUnlocked;
}

if (elements.nextStepText) {
elements.nextStepText.textContent =
isUnlocked
? phenomenon.thinkingFlow.nextStep.text
: "";
}
}

function renderPremium(phenomenon) {
  const isUnlocked = Boolean(state.selectedChoiceId);

  const premium = phenomenon.thinkingFlow.premium;

  if (elements.premiumPanel) {
    elements.premiumPanel.hidden = !isUnlocked;

    elements.premiumPanel.classList.toggle(
      "is-locked",
      Boolean(isUnlocked && premium.locked)
    );
  }

  if (elements.premiumTitle) {
    elements.premiumTitle.textContent = isUnlocked
      ? premium.title
      : "";
  }

  if (elements.premiumText) {
    elements.premiumText.textContent = isUnlocked
      ? premium.text
      : "";
  }
}

function renderRelatedTopics(phenomenon) {
  // DOM要素が存在しない場合は処理を中断
  if (!elements.relatedTopicsPanel || !elements.relatedTopicList) {
    return;
  }

  // phenomenon や relatedTopicIds が未定義の場合の安全策
  const topicIds = phenomenon?.relatedTopicIds || [];
  const relatedTopics = getRelatedTopics(topicIds);

  elements.relatedTopicsPanel.hidden = false;

  // 関連トピックがない場合
  if (relatedTopics.length === 0) {
    elements.relatedTopicList.innerHTML = "関連する概念を整理中です。";
    return;
  }

  // 関連トピックのリストを HTML として描画
  elements.relatedTopicList.innerHTML = relatedTopics
    .map((topic) => {
      const isActive = topic.id === state.activeTopicId;

      return (
        '<button' +
        ' class="topic-item' +
        (isActive ? " is-active" : "") +
        '"' +
        ' type="button"' +
        ' data-topic-id="' +
        escapeHtml(topic.id) +
        '"' +
        ' aria-pressed="' +
        String(isActive) +
        '"' +
        '>' +
        '<span class="topic-category">' +
        escapeHtml(topic.category.toUpperCase()) +
        '</span>' +
        '<strong class="topic-label">' +
        escapeHtml(topic.label) +
        '</strong>' +
        '<p class="topic-summary">' +
        escapeHtml(topic.summary) +
        '</p>' +
        '</button>'
      );
    })
    .join("");

  bindTopicViewEvents();
}

function bindTopicViewEvents() {
  if (!elements.relatedTopicList) {
    return;
  }

  // トピック開閉ボタンのイベントリスナー設定
  elements.relatedTopicList
    .querySelectorAll("[data-topic-id]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        openTopic(button.dataset.topicId, button);
      });
    });

  // コンテンツ開閉ボタンのイベントリスナー設定
  elements.relatedTopicList
    .querySelectorAll("[data-topic-content-id]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        openContent(button.dataset.topicContentId, button);
      });
    });

  // 現象選択ボタンのイベントリスナー設定
  elements.relatedTopicList
    .querySelectorAll("[data-topic-phenomenon-id]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        selectPhenomenon(button.dataset.topicPhenomenonId);
      });
    });

  // 戻るボタンのイベントリスナー設定
  const backButton =
    elements.relatedTopicList.querySelector("[data-topic-back]");

  if (backButton) {
    backButton.addEventListener("click", closeTopic);
  }
}

function renderTopicView(topic) {
  if (
    !topic ||
    !elements.relatedTopicsPanel ||
    !elements.relatedTopicList
  ) {
    return;
  }

  const relatedTopics = getRelatedTopics(topic.relatedTopicIds);
  const relatedContents = getRelatedContents(topic.relatedContentIds);
  const relatedPhenomena = getPhenomenaByTopicId(topic.id);

  const relatedTopicsHtml =
    relatedTopics.length > 0
      ? relatedTopics
          .map((related) => {
            return (
              '<button' +
              ' class="topic-item"' +
              ' type="button"' +
              ' data-topic-id="' +
              escapeHtml(related.id) +
              '"' +
              ' aria-pressed="false"' +
              '>' +
              '<span class="topic-category">' +
              escapeHtml(related.category.toUpperCase()) +
              '</span>' +
              '<strong class="topic-label">' +
              escapeHtml(related.label) +
              '</strong>' +
              '<p class="topic-summary">' +
              escapeHtml(related.summary) +
              '</p>' +
              '</button>'
            );
          })
          .join("")
      : '\u95a2\u9023\u3059\u308b\u6982\u5ff5\u306f\u307e\u3060\u3042\u308a\u307e\u305b\u3093\u3002';

  const relatedContentsHtml =
    relatedContents.length > 0
      ? relatedContents
          .map((content) => {
            return (
              '<button' +
              ' class="topic-item"' +
              ' type="button"' +
              ' data-topic-content-id="' +
              escapeHtml(content.id) +
              '"' +
              '>' +
              '<span class="topic-category">' +
              escapeHtml(formatTypeLabel(content.type)) +
              '</span>' +
              '<strong class="topic-label">' +
              escapeHtml(content.title) +
              '</strong>' +
              '<p class="topic-summary">' +
              escapeHtml(content.summary) +
              '</p>' +
              '</button>'
            );
          })
          .join("")
      : '\u3053\u306e\u6982\u5ff5\u306b\u95a2\u9023\u4ed8\u3051\u3089\u308c\u305f\u8cc7\u6599\u306f\u307e\u3060\u3042\u308a\u307e\u305b\u3093\u3002';

  const relatedPhenomenaHtml =
    relatedPhenomena.length > 0
      ? relatedPhenomena
          .map((phenomenon) => {
            return (
              '<button' +
              ' class="topic-item"' +
              ' type="button"' +
              ' data-topic-phenomenon-id="' +
              escapeHtml(phenomenon.id) +
              '"' +
              '>' +
              '<span class="topic-category">PHENOMENON</span>' +
              '<strong class="topic-label">' +
              escapeHtml(phenomenon.label) +
              '</strong>' +
              '<p class="topic-summary">' +
              escapeHtml(phenomenon.description) +
              '</p>' +
              '</button>'
            );
          })
          .join("")
      : '\u3053\u306e\u6982\u5ff5\u306b\u95a2\u9023\u4ed8\u3051\u3089\u308c\u305f\u73fe\u8c61\u306f\u307e\u3060\u3042\u308a\u307e\u305b\u3093\u3002';

  elements.relatedTopicsPanel.hidden = false;

  elements.relatedTopicList.innerHTML =
    '<button' +
    ' class="topic-back"' +
    ' type="button"' +
    ' data-topic-back' +
    '>' +
    '\u2190 RELATED TOPICS' +
    '</button>' +
    '<div class="topic-card main-topic">' +
    '<span class="topic-category">' +
    escapeHtml(topic.category.toUpperCase()) +
    '</span>' +
    '<h3 class="topic-label">' +
    escapeHtml(topic.label) +
    '</h3>' +
    '<p class="topic-summary">' +
    escapeHtml(topic.summary) +
    '</p>' +
    '</div>' +
    '<div class="topic-header">' +
    '<span class="topic-category">RELATED TOPICS</span>' +
    '<h3 class="topic-title">\u95a2\u9023\u3059\u308b\u6982\u5ff5</h3>' +
    '<p class="topic-summary">\u3053\u306e\u6982\u5ff5\u304b\u3089\u3001\u5225\u306e\u8996\u70b9\u3078\u601d\u8003\u3092\u5e83\u3052\u307e\u3059\u3002</p>' +
    '</div>' +
    relatedTopicsHtml +
    '<div class="topic-header">' +
    '<span class="topic-category">RELATED CONTENT</span>' +
    '<h3 class="topic-title">\u95a2\u9023\u3059\u308b\u8cc7\u6599</h3>' +
    '<p class="topic-summary">\u3053\u306e\u6982\u5ff5\u3092\u3001\u7814\u7a76\u30fb\u8a55\u4fa1\u30fb\u4e8b\u4f8b\u30fb\u7528\u8a9e\u304b\u3089\u3055\u3089\u306b\u78ba\u8a8d\u3057\u307e\u3059\u3002</p>' +
    '</div>' +
    relatedContentsHtml +
    '<div class="topic-header">' +
    '<span class="topic-category">RELATED PHENOMENA</span>' +
    '<h3 class="topic-title">\u3053\u306e\u6982\u5ff5\u3068\u95a2\u4fc2\u3059\u308b\u73fe\u8c61</h3>' +
    '<p class="topic-summary">\u3053\u306e\u6982\u5ff5\u304c\u3001\u5b9f\u969b\u306e\u30d5\u30a3\u30fc\u30eb\u30c9\u3067\u3069\u306e\u3088\u3046\u306a\u73fe\u8c61\u3068\u3064\u306a\u304c\u308b\u304b\u3092\u78ba\u8a8d\u3057\u307e\u3059\u3002</p>' +
    '</div>' +
    relatedPhenomenaHtml;

  bindTopicViewEvents();
}

function openTopic(topicId, triggerElement = null) {
  const topic = getTopicById(topicId);

  if (!topic) {
    return;
  }

  state.activeTopicId = topic.id;

  renderTopicView(topic);

  updateUrlState({
    topic: topic.id
  });

  if (
    triggerElement instanceof HTMLElement &&
    elements.relatedTopicsPanel
  ) {
    elements.relatedTopicsPanel.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

function closeTopic() {
  const phenomenon = getActivePhenomenon();

  state.activeTopicId = "";

  updateUrlState({
    topic: ""
  });

  if (phenomenon) {
    renderRelatedTopics(phenomenon);
    return;
  }

  if (elements.relatedTopicList) {
    elements.relatedTopicList.innerHTML = "";
  }
}



function renderRelatedContents(phenomenon) {
  if (!elements.relatedList) {
    return;
  }

  const mergedIds = [
    ...phenomenon.relatedIds,
    ...phenomenon.nextAction.relatedIds,
  ];

  const uniqueIds = [...new Set(mergedIds)];

  const relatedContents = getRelatedContents(uniqueIds);

  if (relatedContents.length === 0) {
    elements.relatedList.innerHTML =
      "\u95a2\u9023\u8cc7\u6599\u3092\u6574\u7406\u4e2d\u3067\u3059\u3002";
    return;
  }

  elements.relatedList.innerHTML = relatedContents
    .map((content) => {
      return (
        `<button` +
        ` class="related-item"` +
        ` type="button"` +
        ` data-related-id="${escapeHtml(content.id)}"` +
        `>` +
        `<span>${escapeHtml(content.code)}</span>` +
        `<span>${escapeHtml(content.title)}</span>` +
        `<span>${escapeHtml(content.summary)}</span>` +
        `<span>\u2192</span>` +
        `</button>`
      );
    })
    .join("");

  elements.relatedList
    .querySelectorAll("[data-related-id]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const contentId = button.dataset.relatedId;

        state.selectedContentId = contentId;

        renderBooks();

        openContent(contentId, button);
      });
    });
}


function renderInsight() {
  if (!state.data) {
    return;
  }

  const phenomenon = getActivePhenomenon();

  if (!phenomenon) {
    if (elements.insightCount) {
      elements.insightCount.textContent = "STEP 1 / 6";
    }

    if (elements.questionTitle) {
      elements.questionTitle.textContent = "\u8ab2\u984c\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002";
    }

    if (elements.questionText) {
      elements.questionText.textContent = "\u8ab2\u984c\u3092\u9078\u629e\u3059\u308b\u3068\u8cea\u554f\u304c\u8868\u793a\u3055\u308c\u307e\u3059\u3002";
    }

    // \u8981\u7d20\u306e\u30af\u30ea\u30a2\u51e6\u7406\uff08innerHTML\uff09
    [
      elements.questionChoices,
      elements.whyPoints,
      elements.relatedTopicList,
      elements.relatedList
    ].forEach((element) => {
      if (element) {
        element.innerHTML = "";
      }
    });

    // \u30d1\u30cd\u30eb\u306e\u975e\u8868\u793a\u51e6\u7406
    [
      elements.entryPanel,
      elements.commonTheoryPanel,
      elements.adjustmentPanel,
      elements.nextStepPanel,
      elements.premiumPanel
    ].forEach((panel) => {
      if (panel) {
        panel.hidden = true;
      }
    });

    // \u30c6\u30ad\u30b9\u30c8\u8981\u7d20\u306e\u30af\u30ea\u30a2\u51e6\u7406\uff08textContent\uff09
    [
      elements.entryTitle,
elements.entryText,
elements.adjustmentText,
elements.whyText,
elements.nextStepText,
elements.premiumTitle,
elements.premiumText
].forEach((element) => {
if (element) {
element.textContent = "";
      }
    });

    return;
  }

  if (elements.insightCount) {
    elements.insightCount.textContent = state.selectedChoiceId
      ? "STEP 6 / 6"
      : "STEP 1 / 6";
  }

  renderQuestion(phenomenon);
  renderWhy(phenomenon);
  renderAdjustmentView(phenomenon);
  renderNextStep(phenomenon);
  renderPremium(phenomenon);
  renderRelatedTopics(phenomenon);
  renderRelatedContents(phenomenon);
}


function renderUpdates() {
if (!elements.updateGrid || !state.data) {
return;
}

const updates = [...state.data.updates]
.sort((a,b) => {
return b.date.localeCompare(a.date);
})
.slice(0,6);

if (updates.length === 0) {
elements.updateGrid.innerHTML =
'<div class="loading-placeholder">\u66f4\u65b0\u60c5\u5831\u306f\u307e\u3060\u3042\u308a\u307e\u305b\u3093\u3002</div>';
return;
}

elements.updateGrid.innerHTML =
updates
.map((update) => {
const content =
getContentById(update.contentId);

const typeLabel = content
? formatTypeLabel(content.type)
: "CONTENT";

return (
'<article' +
' class="panel update-card"' +
' data-update-content-id="' +
escapeHtml(update.contentId) +
'"' +
' tabindex="0"' +
' role="button"' +
' aria-label="' +
escapeHtml(
`${update.title}\u306e\u8a73\u7d30\u3092\u898b\u308b`
) +
'"' +
'>' +
'<div class="update-head">' +
'<span class="tag ' +
escapeHtml(update.labelClass) +
'">' +
escapeHtml(update.label) +
'</span>' +
'<span class="update-date">' +
escapeHtml(
formatDate(update.date)
) +
'</span>' +
'</div>' +
'<h3>' +
escapeHtml(update.title) +
'</h3>' +
'<p>' +
escapeHtml(update.summary) +
'</p>' +
'<div class="update-footer">' +
'<span>' +
escapeHtml(typeLabel) +
'</span>' +
'<strong>' +
'OPEN \u2192' +
'</strong>' +
'</div>' +
'</article>'
);
})
.join("");

elements.updateGrid
.querySelectorAll(
"[data-update-content-id]"
)
.forEach((card) => {
const openCard = () => {
openContent(
card.dataset.updateContentId,
card
);
};

card.addEventListener(
"click",
openCard
);

card.addEventListener(
"keydown",
(event) => {
if (
event.key === "Enter" ||
event.key === " "
) {
event.preventDefault();
openCard();
}
}
);
});
}

function renderFacilities() {
if (!elements.facilityGrid || !state.data) {
return;
}

if (state.data.facilities.length === 0) {
elements.facilityGrid.innerHTML =
'<div class="loading-placeholder">\u65bd\u8a2d\u60c5\u5831\u306f\u307e\u3060\u3042\u308a\u307e\u305b\u3093\u3002</div>';
return;
}

elements.facilityGrid.innerHTML =
state.data.facilities
.map((facility) => {
const itemCount =
state.data.contents.filter(
(content) => {
return (
content.type ===
facility.type
);
}
).length;

const isActive =
state.activeFacilityType ===
facility.type;

return (
'<button' +
' class="facility-button' +
(isActive ? " is-active" : "") +
'"' +
' type="button"' +
' data-facility-type="' +
escapeHtml(facility.type) +
'"' +
' data-type="' +
escapeHtml(facility.type) +
'"' +
' aria-pressed="' +
String(isActive) +
'"' +
'>' +
'<span class="facility-icon">' +
escapeHtml(facility.code) +
'</span>' +
'<span class="facility-name">' +
escapeHtml(facility.name) +
'<span class="facility-japanese">' +
escapeHtml(
facility.japaneseName
) +
'</span>' +
'</span>' +
'<span class="facility-description">' +
escapeHtml(
facility.description
) +
'</span>' +
'<span class="facility-footer">' +
'<span>' +
escapeHtml(
`${facility.detail} / ${itemCount} ITEMS`
) +
'</span>' +
'<strong>' +
escapeHtml(facility.status) +
'</strong>' +
'</span>' +
'</button>'
);
})
.join("");

elements.facilityGrid
.querySelectorAll(
"[data-facility-type]"
)
.forEach((button) => {
button.addEventListener(
"click",
() => {
openFacility(
button.dataset.facilityType,
button
);
}
);
});
}

function selectPhenomenon(phenomenonId) {
  const phenomenon = getPhenomenonById(phenomenonId);

  if (!phenomenon) {
    return;
  }

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

  updateUrlState({
    phenomenon: phenomenon.id,
    content: "",
    topic: ""
  });
}


function openFacility(type,triggerElement = null) {
if (!state.data) {
return;
}

const facility =
getFacilityByType(type);

const matchingContents =
state.data.contents.filter(
(content) => {
return content.type === type;
}
);

if (!facility || matchingContents.length === 0) {
return;
}

state.activeFacilityType = type;
renderFacilities();

const firstContent =
matchingContents[0];

openContent(
firstContent.id,
triggerElement
);
}

function renderDrawerMeta(content) {
if (!elements.drawerMeta) {
return;
}

const metaItems = [
{
value:content.code,
className:"tag"
},
{
value:content.status,
className:
`tag ${content.statusClass}`.trim()
},
{
value:formatDate(content.updatedAt),
className:"tag"
}
].filter((item) => item.value);

const tags = content.tags.map((tag) => {
return {
value:tag,
className:"tag"
};
});

elements.drawerMeta.innerHTML =
[...metaItems,...tags]
.map((item) => {
return (
'<span class="' +
escapeHtml(item.className) +
'">' +
escapeHtml(item.value) +
'</span>'
);
})
.join("");
}


function setDrawerSectionVisible(
element,
isVisible
) {
if (!element) {
return;
}

const section =
element.closest(
".drawer-section"
);

if (section) {
section.hidden = !isVisible;
}
}
  
function renderDrawerSectionHeadings(contentType) {
const isPds = contentType === "pds";

if (elements.drawerQuestionHeading) {
elements.drawerQuestionHeading.textContent = isPds
? "PDS OVERVIEW / PDSについて"
: "QUESTION / 最初の問い";
}

if (elements.drawerCommonTheoryHeading) {
elements.drawerCommonTheoryHeading.textContent = isPds
? "PURPOSE / 評価の目的"
: "COMMON THEORY / 一般的な考え方";
}

if (elements.drawerAdjustmentViewHeading) {
elements.drawerAdjustmentViewHeading.textContent = isPds
? "PRINCIPLES / 評価の考え方"
: "ADJUSTMENT VIEW / 捉え直し";
}
}
  
function clearResearchDrawerSections() {
[
elements.drawerQuestion,
elements.drawerCommonTheory,
elements.drawerAdjustmentView,
elements.drawerWhy,
elements.drawerCheckpoints,
elements.drawerPdsEvaluation,
elements.drawerTrackingData,
elements.drawerHypotheses,
elements.drawerResearchQuestions,
elements.drawerPerformanceConnection,
elements.drawerInterpretation,
elements.drawerLimitations
].forEach((element) => {
if (!element) {
return;
}

element.innerHTML = "";
setDrawerSectionVisible(
element,
false
);
});
}

function renderResearchSection(
element,
section
) {
if (!element) {
return;
}

const source =
isPlainObject(section)
? section
: {};

const title =
normalizeString(source.title);

const bodyText =
normalizeString(source.text);

const points =
normalizeArray(source.points)
.map((item) => normalizeString(item))
.filter(Boolean);

const parts = [];

if (title) {
parts.push(
'<h4 class="drawer-content-title">' +
escapeHtml(title) +
'</h4>'
);
}

if (bodyText) {
parts.push(
'<p class="drawer-content-text">' +
escapeHtml(bodyText) +
'</p>'
);
}

if (points.length > 0) {
parts.push(
points
.map((point,index) => {
return (
'<div class="drawer-list-item">' +
'<strong>' +
escapeHtml(
String(index + 1).padStart(2,"0")
) +
'</strong>' +
'<span>' +
escapeHtml(point) +
'</span>' +
'</div>'
);
})
.join("")
);
}

element.innerHTML =
parts.join("");

setDrawerSectionVisible(
element,
parts.length > 0
);
}

function renderResearchHypotheses(
hypotheses
) {
const element =
elements.drawerHypotheses;

if (!element) {
return;
}

const items =
normalizeArray(hypotheses);

if (items.length === 0) {
element.innerHTML = "";
setDrawerSectionVisible(
element,
false
);
return;
}

element.innerHTML =
items
.map((item,index) => {
const title =
normalizeString(
item.title,
`HYPOTHESIS ${index + 1}`
);

const status =
normalizeString(
item.status,
"ACTIVE"
);

const itemText =
normalizeString(item.text);

return (
'<div class="drawer-list-item">' +
'<strong>' +
escapeHtml(
`${status} / ${title}`
) +
'</strong>' +
(
itemText
? '<span>' +
escapeHtml(itemText) +
'</span>'
: ""
) +
'</div>'
);
})
.join("");

setDrawerSectionVisible(
element,
true
);
}

function renderResearchQuestions(
questions
) {
const element =
elements.drawerResearchQuestions;

if (!element) {
return;
}

const items =
normalizeArray(questions);

if (items.length === 0) {
element.innerHTML = "";
setDrawerSectionVisible(
element,
false
);
return;
}

element.innerHTML =
items
.map((item,index) => {
const status =
normalizeString(
item.status,
"OPEN"
);

const itemText =
normalizeString(item.text);

return (
'<div class="drawer-list-item">' +
'<strong>' +
escapeHtml(
`${status} / ${String(index + 1).padStart(2,"0")}`
) +
'</strong>' +
(
itemText
? '<span>' +
escapeHtml(itemText) +
'</span>'
: ""
) +
'</div>'
);
})
.join("");

setDrawerSectionVisible(
element,
true
);
}

function renderResearchDetail(content) {
clearResearchDrawerSections();

if (
!content ||
content.type !== "research" ||
!isPlainObject(content.researchDetail)
) {
return;
}

const detail =
content.researchDetail;

renderResearchSection(
elements.drawerQuestion,
detail.question
);

renderResearchSection(
elements.drawerCommonTheory,
detail.commonTheory
);

renderResearchSection(
elements.drawerAdjustmentView,
detail.adjustmentView
);

renderResearchSection(
elements.drawerWhy,
detail.why
);

renderResearchSection(
elements.drawerCheckpoints,
detail.fieldCheck
);

renderResearchSection(
elements.drawerPdsEvaluation,
detail.pdsEvaluation
);

renderResearchSection(
elements.drawerTrackingData,
detail.tracking
);

renderResearchHypotheses(
detail.hypotheses
);

renderResearchQuestions(
detail.researchQuestions
);
}

function renderPdsDetail(content) {
  clearResearchDrawerSections();

  if (
    !content ||
    content.type !== "pds" ||
    !isPlainObject(content.pdsDetail)
  ) {
    return;
  }

  const detail = content.pdsDetail;

  // 1. 各テキストセクションのレンダリング
  renderResearchSection(
    elements.drawerQuestion,
    detail.definition
  );

  renderResearchSection(
    elements.drawerCommonTheory,
    detail.purpose
  );

  renderResearchSection(
    elements.drawerAdjustmentView,
    detail.principles
  );

  // 2. evaluationItem (評価項目およびチェックポイント) のレンダリング
const evaluationItem = detail.evaluationItem;
if (
elements.drawerPdsEvaluation &&
isPlainObject(evaluationItem)
) {
const parts = [];

if (evaluationItem.title) {
  parts.push(
    '<h4 class="drawer-content-title">' +
    escapeHtml(evaluationItem.title) +
    '</h4>'
  );
}

if (evaluationItem.japaneseTitle) {
  parts.push(
    '<p class="drawer-content-text">' +
    escapeHtml(evaluationItem.japaneseTitle) +
    '</p>'
  );
}

if (evaluationItem.objective) {
  parts.push(
    '<div class="drawer-list-item">' +
    '<strong>OBJECTIVE</strong>' +
    '<span>' +
    escapeHtml(evaluationItem.objective) +
    '</span>' +
    '</div>'
  );
}

if (
  isPlainObject(evaluationItem.method) &&
  (
    evaluationItem.method.title ||
    evaluationItem.method.text
  )
) {
  parts.push(
    '<div class="drawer-list-item">' +
    '<strong>' +
    escapeHtml(
      evaluationItem.method.title ||
      "METHOD"
    ) +
    '</strong>' +
    (
      evaluationItem.method.text
        ? '<span>' +
          escapeHtml(evaluationItem.method.text) +
          '</span>'
        : ""
    ) +
    '</div>'
  );
}

if (
  Array.isArray(evaluationItem.checkpoints) &&
  evaluationItem.checkpoints.length > 0
) {
  evaluationItem.checkpoints.forEach(
    (checkpoint, index) => {
      parts.push(
        '<div' +
        ' class="drawer-list-item"' +
        ' id="' +
        escapeHtml(checkpoint.id) +
        '"' +
        '>' +
        '<strong>' +
        escapeHtml(
          String(index + 1).padStart(2, "0")
        ) +
        " / " +
        escapeHtml(checkpoint.title) +
        '</strong>' +
        (
          checkpoint.text
            ? '<span>' +
              escapeHtml(checkpoint.text) +
              '</span>'
            : ""
        ) +
        '</div>'
      );
    }
  );
}

elements.drawerPdsEvaluation.innerHTML =
  parts.join("");

setDrawerSectionVisible(
  elements.drawerPdsEvaluation,
  parts.length > 0
);
  }

  // 3. 残りのテキストセクションのレンダリング
  renderResearchSection(
    elements.drawerPerformanceConnection,
    detail.performanceConnection
  );

  renderResearchSection(
    elements.drawerInterpretation,
    detail.interpretation
  );

  renderResearchSection(
    elements.drawerLimitations,
    detail.limitations
  );
}

function renderDrawerRelated(content) {
if (!elements.drawerRelated) {
return;
}

const relatedContents =
getRelatedContents(
content.relatedIds
);

if (relatedContents.length === 0) {
elements.drawerRelated.innerHTML =
'<div class="drawer-related-item">' +
'<strong>' +
'\u95a2\u9023\u3059\u308b\u601d\u8003\u3092\u6574\u7406\u4e2d\u3067\u3059\u3002' +
'</strong>' +
'</div>';
return;
}

elements.drawerRelated.innerHTML =
relatedContents
.map((related) => {
return (
'<button' +
' class="drawer-related-item"' +
' type="button"' +
' data-drawer-related-id="' +
escapeHtml(related.id) +
'"' +
'>' +
'<strong>' +
escapeHtml(related.title) +
'</strong>' +
'<span>' +
escapeHtml(
`${formatTypeLabel(related.type)} / ${related.code}`
) +
'</span>' +
'</button>'
);
})
.join("");

elements.drawerRelated
.querySelectorAll(
"[data-drawer-related-id]"
)
.forEach((button) => {
button.addEventListener(
"click",
() => {
openContent(
button.dataset.drawerRelatedId,
button,
{
preserveFocus:true
}
);
}
);
});
}

function openContent(
contentId,
triggerElement = null,
options = {}
) {
const content =
getContentById(contentId);

if (!content || !elements.detailDrawer) {
return;
}

const preserveFocus =
Boolean(options.preserveFocus);

if (
!preserveFocus &&
triggerElement instanceof HTMLElement
) {
state.lastFocusedElement =
triggerElement;
}

state.selectedContentId =
content.id;

if (elements.drawerEyebrow) {
elements.drawerEyebrow.textContent =
`${formatTypeLabel(content.type)} / ${content.code}`;
}

if (elements.drawerTitle) {
elements.drawerTitle.textContent =
content.title;
}

if (elements.drawerSummary) {
elements.drawerSummary.textContent =
content.summary;
}

if (elements.drawerObservation) {
elements.drawerObservation.textContent =
content.observation;
}

if (elements.drawerThinking) {
elements.drawerThinking.textContent =
content.thinking;
}

if (elements.drawerVerification) {
elements.drawerVerification.textContent =
content.verification;
}

if (elements.drawerLimitation) {
elements.drawerLimitation.textContent =
content.limitation;
}

renderDrawerSectionHeadings(content.type);

if (content.type === "research") {
renderResearchDetail(content);
} else if (content.type === "pds") {
renderPdsDetail(content);
} else {
clearResearchDrawerSections();
}

renderDrawerMeta(content);
renderDrawerRelated(content);
renderBooks();

elements.detailDrawer.classList.add(
"is-open"
);

elements.detailDrawer.setAttribute(
"aria-hidden",
"false"
);

if (elements.drawerBackdrop) {
elements.drawerBackdrop.classList.add(
"is-open"
);

elements.drawerBackdrop.setAttribute(
"aria-hidden",
"false"
);
}

document.body.classList.add(
"menu-open"
);

state.drawerOpen = true;

updateUrlState({
content:content.id
});

window.requestAnimationFrame(() => {
if (elements.drawerClose) {
elements.drawerClose.focus();
}
});
}

function closeDrawer(options = {}) {
if (!elements.detailDrawer) {
return;
}

const restoreFocus =
options.restoreFocus !== false;

elements.detailDrawer.classList.remove(
"is-open"
);

elements.detailDrawer.setAttribute(
"aria-hidden",
"true"
);

if (elements.drawerBackdrop) {
elements.drawerBackdrop.classList.remove(
"is-open"
);

elements.drawerBackdrop.setAttribute(
"aria-hidden",
"true"
);
}

document.body.classList.remove(
"menu-open"
);

state.drawerOpen = false;
state.selectedContentId = "";

renderBooks();

updateUrlState({
content:""
});

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
}

function trapDrawerFocus(event) {
if (
!state.drawerOpen ||
event.key !== "Tab" ||
!elements.detailDrawer
) {
return;
}

const focusableElements =
getFocusableElements(
elements.detailDrawer
);

if (focusableElements.length === 0) {
event.preventDefault();
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

function openMobileMenu() {
if (
!elements.mobileNav ||
!elements.mobileMenuButton
) {
return;
}

elements.mobileNav.hidden = false;
elements.mobileNav.classList.add(
"is-open"
);

elements.mobileMenuButton.setAttribute(
"aria-expanded",
"true"
);

elements.mobileMenuButton.setAttribute(
"aria-label",
"\u30e1\u30cb\u30e5\u30fc\u3092\u9589\u3058\u308b"
);

state.mobileMenuOpen = true;
}

function closeMobileMenu() {
if (
!elements.mobileNav ||
!elements.mobileMenuButton
) {
return;
}

elements.mobileNav.classList.remove(
"is-open"
);

elements.mobileNav.hidden = true;

elements.mobileMenuButton.setAttribute(
"aria-expanded",
"false"
);

elements.mobileMenuButton.setAttribute(
"aria-label",
"\u30e1\u30cb\u30e5\u30fc\u3092\u958b\u304f"
);

state.mobileMenuOpen = false;
}

function toggleMobileMenu() {
if (state.mobileMenuOpen) {
closeMobileMenu();
} else {
openMobileMenu();
}
}

function syncMobileNavigation() {
if (
window.matchMedia(
"(min-width:1101px)"
).matches
) {
closeMobileMenu();
}
}

function updateUrlState(changes) {
  const url = new URL(window.location.href);
  const keys = ["phenomenon", "content", "topic"];

  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(changes, key)) {
      const value = normalizeString(changes[key]);

      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    }
  });

  window.history.replaceState({}, "", url);
}


function applyUrlState() {
  if (!state.data) {
    return;
  }

  const params = new URLSearchParams(window.location.search);

  // \u30d1\u30e9\u30e1\u30fc\u30bf\u53d6\u5f97\u3068\u72b6\u614b\u8a2d\u5b9a\u306e\u30de\u30c3\u30d4\u30f3\u30b0
  const parameterMappings = [
    { key: "phenomenon", stateKey: "activePhenomenonId", validate: getPhenomenonById },
    { key: "content", stateKey: "selectedContentId", validate: getContentById },
    { key: "topic", stateKey: "activeTopicId", validate: getTopicById }
  ];

  parameterMappings.forEach(({ key, stateKey, validate }) => {
    const value = params.get(key);
    if (value && validate(value)) {
      state[stateKey] = value;
    }
  });
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
  if (!state.data) {
    return;
  }

  state.selectedChoiceId = "";
  state.activeTopicId = "";

  if (state.data.phenomena && state.data.phenomena.length > 0) {
    state.activePhenomenonId = state.data.phenomena[0].id;
  }

  applyUrlState();
  renderAll();

  if (state.activeTopicId) {
    openTopic(state.activeTopicId, null);
  }

  if (state.selectedContentId) {
    openContent(state.selectedContentId, null, {
      preserveFocus: true
    });
  }
}

async function loadCampusData() {
  setLoadingState(true);
  hideDataError();

  try {
    state.data = await fetchCampusData();
    initializeState();
  } catch (error) {
    console.error("[Digital Research Campus]", error);

    state.data = null;

    // \u30a8\u30e9\u30fc\u6642\u306e\u30d5\u30a9\u30fc\u30eb\u30d0\u30c3\u30af\u30c6\u30ad\u30b9\u30c8\u4e00\u62ec\u66f4\u65b0
    const errorMessages = [
      { element: elements.phenomenonList, text: "\u73fe\u8c61\u30c7\u30fc\u30bf\u3092\u8868\u793a\u3067\u304d\u307e\u305b\u3093\u3002" },
      { element: elements.bookshelf, text: "\u8cc7\u6599\u30c7\u30fc\u30bf\u3092\u8868\u793a\u3067\u304d\u307e\u305b\u3093\u3002" },
      { element: elements.updateGrid, text: "\u66f4\u65b0\u60c5\u5831\u3092\u8868\u793a\u3067\u304d\u307e\u305b\u3093\u3002" },
      { element: elements.facilityGrid, text: "\u65bd\u8a2d\u60c5\u5831\u3092\u8868\u793a\u3067\u304d\u307e\u305b\u3093\u3002" }
    ];

    errorMessages.forEach(({ element, text }) => {
      if (element) {
        element.textContent = text;
      }
    });

    showDataError(
      error instanceof Error
        ? error.message
        : "Campus\u30c7\u30fc\u30bf\u306e\u8aad\u307f\u8fbc\u307f\u4e2d\u306b\u4e0d\u660e\u306a\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f\u3002"
    );
  } finally {
    setLoadingState(false);
  }
}


function handleGlobalKeydown(event) {
if (event.key === "Escape") {
if (state.drawerOpen) {
closeDrawer();
return;
}

if (state.mobileMenuOpen) {
closeMobileMenu();

if (elements.mobileMenuButton) {
elements.mobileMenuButton.focus();
}
}
}

trapDrawerFocus(event);
}

function handleBackdropPointerDown(event) {
if (
event.target ===
elements.drawerBackdrop
) {
closeDrawer();
}
}

function initializeEvents() {
if (elements.mobileMenuButton) {
elements.mobileMenuButton.addEventListener(
"click",
toggleMobileMenu
);
}

if (elements.mobileNav) {
elements.mobileNav
.querySelectorAll("a")
.forEach((link) => {
link.addEventListener(
"click",
closeMobileMenu
);
});
}

if (elements.drawerClose) {
elements.drawerClose.addEventListener(
"click",
() => {
closeDrawer();
}
);
}

if (elements.drawerBackdrop) {
elements.drawerBackdrop.addEventListener(
"pointerdown",
handleBackdropPointerDown
);
}

if (elements.reloadDataButton) {
elements.reloadDataButton.addEventListener(
"click",
() => {
loadCampusData();
}
);
}

document.addEventListener(
"keydown",
handleGlobalKeydown
);

window.addEventListener(
"resize",
syncMobileNavigation,
{
passive:true
}
);
}

function initializeHeroMotion() {
if (
!elements.heroFloatingBooks ||
window.matchMedia(
"(prefers-reduced-motion:reduce)"
).matches
) {
return;
}

const floatingBooks =
Array.from(
elements.heroFloatingBooks.querySelectorAll(
".floating-book"
)
);

if (floatingBooks.length === 0) {
return;
}

let animationFrameId = 0;

const updatePosition = () => {
animationFrameId = 0;

const scrollY =
window.scrollY;

const viewportHeight =
window.innerHeight;

if (scrollY > viewportHeight) {
return;
}

floatingBooks.forEach(
(book,index) => {
const ratio =
0.015 + index * 0.004;

book.style.marginTop =
`${scrollY * ratio}px`;
}
);
};

window.addEventListener(
"scroll",
() => {
if (animationFrameId) {
return;
}

animationFrameId =
window.requestAnimationFrame(
updatePosition
);
},
{
passive:true
}
);
}

function initialize() {
initializePhenomenonAccordion();
initializeEvents();
initializeHeroMotion();
syncMobileNavigation();
loadCampusData();
}

if (
document.readyState === "loading"
) {
document.addEventListener(
"DOMContentLoaded",
initialize,
{
once:true
}
);
} else {
initialize();
}
})();
