(() => {
"use strict";

const DATA_URL = "./data/campus-data.json";

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
data:null,
activePhenomenonId:"",
selectedContentId:"",
activeFacilityType:"",
lastFocusedElement:null,
drawerOpen:false,
mobileMenuOpen:false
};

const elements = {
siteHeader:document.getElementById("siteHeader"),
campusVersion:document.getElementById("campusVersion"),
footerCopyright:document.getElementById("footerCopyright"),

mobileMenuButton:document.getElementById("mobileMenuButton"),
mobileNav:document.getElementById("mobileNav"),

phenomenonList:document.getElementById("phenomenonList"),
bookshelf:document.getElementById("bookshelf"),

insightPanel:document.getElementById("insightPanel"),
insightCount:document.getElementById("insightCount"),
insightTitle:document.getElementById("insightTitle"),
insightDescription:document.getElementById("insightDescription"),
insightPath:document.getElementById("insightPath"),
relatedList:document.getElementById("relatedList"),

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
drawerObservation:document.getElementById("drawerObservation"),
drawerThinking:document.getElementById("drawerThinking"),
drawerVerification:document.getElementById("drawerVerification"),
drawerLimitation:document.getElementById("drawerLimitation"),
drawerRelated:document.getElementById("drawerRelated"),

heroFloatingBooks:document.getElementById("heroFloatingBooks")
};

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
return"";
}

const normalized = text
.replaceAll("/", ".")
.replaceAll("-", ".");

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
      "data/campus-data.json\u306e\u914d\u7f6e\u3068JSON\u5f62\u5f0f\u3092\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044\u3002"
    );
}

elements.dataErrorSection.hidden = false;

}

function hideDataError() {
if (elements.dataErrorSection) {
elements.dataErrorSection.hidden = true;
}
}

function validateData(data) {
const errors = [];

if (!isPlainObject(data)) {
  return {
    valid:false,
    errors:[
      "Campus\u30c7\u30fc\u30bf\u306e\u30eb\u30fc\u30c8\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002"
    ]
  };
}

if (!Array.isArray(data.phenomena)) {
  errors.push(
    "phenomena\u306f\u914d\u5217\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002"
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
    valid:false,
    errors
  };
}

const contentIds = new Set();
const phenomenonIds = new Set();
const facilityTypes = new Set();

data.contents.forEach((content,index) => {
  if (!isPlainObject(content)) {
    errors.push(
      `contents[${index}]\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
    );
    return;
  }

  const id = normalizeString(content.id);

  if (!id) {
    errors.push(
      `contents[${index}].id\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
    );
  } else if (contentIds.has(id)) {
    errors.push(
      `contents\u5185\u3067id\u300c${id}\u300d\u304c\u91cd\u8907\u3057\u3066\u3044\u307e\u3059\u3002`
    );
  } else {
    contentIds.add(id);
  }

  if (!normalizeString(content.type)) {
    errors.push(
      `contents[${index}].type\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
    );
  }

  if (!normalizeString(content.title)) {
    errors.push(
      `contents[${index}].title\u304c\u3042\u308a\u307e\u305b\u3093\u3002`
    );
  }
});

data.phenomena.forEach((phenomenon,index) => {
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

  normalizeArray(
    phenomenon.relatedIds
  ).forEach((relatedId) => {
    if (!contentIds.has(relatedId)) {
      errors.push(
        `phenomena[${index}]\u306erelatedIds\u306b\u5b58\u5728\u3057\u306a\u3044content ID\u300c${relatedId}\u300d\u304c\u3042\u308a\u307e\u3059\u3002`
      );
    }
  });
});

data.contents.forEach((content,index) => {
  normalizeArray(
    content.relatedIds
  ).forEach((relatedId) => {
    if (!contentIds.has(relatedId)) {
      errors.push(
        `contents[${index}]\u306erelatedIds\u306b\u5b58\u5728\u3057\u306a\u3044content ID\u300c${relatedId}\u300d\u304c\u3042\u308a\u307e\u3059\u3002`
      );
    }
  });
});

data.updates.forEach((update,index) => {
  if (!isPlainObject(update)) {
    errors.push(
      `updates[${index}]\u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002`
    );
    return;
  }

  const contentId = normalizeString(
    update.contentId
  );

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

data.facilities.forEach((facility,index) => {
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
  valid:errors.length === 0,
  errors
};

}

function normalizeData(data) {
return {
meta:{
...DEFAULT_META,
...(isPlainObject(data.meta)
? data.meta
: {})
},

  phenomena:data.phenomena.map((phenomenon) => {
    return {
      id:normalizeString(phenomenon.id),
      label:normalizeString(
        phenomenon.label,
        "\u73fe\u8c61"
      ),
      title:normalizeString(
        phenomenon.title,
        "\u73fe\u8c61\u3092\u6574\u7406\u4e2d\u3067\u3059\u3002"
      ),
      description:normalizeString(
        phenomenon.description,
        "\u95a2\u9023\u3059\u308b\u60c5\u5831\u3092\u6574\u7406\u3057\u3066\u3044\u307e\u3059\u3002"
      ),
      path:normalizeArray(phenomenon.path)
        .map((item) => normalizeString(item))
        .filter(Boolean),
      relatedIds:normalizeArray(
        phenomenon.relatedIds
      )
        .map((item) => normalizeString(item))
        .filter(Boolean)
    };
  }),

  contents:data.contents.map((content) => {
    return {
      id:normalizeString(content.id),
      type:normalizeString(
        content.type,
        "research"
      ),
      code:normalizeString(
        content.code,
        "NO-CODE"
      ),
      title:normalizeString(
        content.title,
        "\u7121\u984c"
      ),
      summary:normalizeString(
        content.summary,
        "\u6982\u8981\u3092\u6574\u7406\u4e2d\u3067\u3059\u3002"
      ),
      tags:normalizeArray(content.tags)
        .map((item) => normalizeString(item))
        .filter(Boolean),
      status:normalizeString(
        content.status,
        "DRAFT"
      ),
      statusClass:normalizeString(
        content.statusClass
      ),
      updatedAt:normalizeString(
        content.updatedAt
      ),
      observation:normalizeString(
        content.observation,
        "\u73fe\u5728\u6574\u7406\u4e2d\u3067\u3059\u3002"
      ),
      thinking:normalizeString(
        content.thinking,
        "\u73fe\u5728\u6574\u7406\u4e2d\u3067\u3059\u3002"
      ),
      verification:normalizeString(
        content.verification,
        "\u73fe\u5728\u691c\u8a3c\u4e2d\u3067\u3059\u3002"
      ),
      limitation:normalizeString(
        content.limitation,
        "\u73fe\u6642\u70b9\u3067\u306f\u4eee\u8aac\u6bb5\u968e\u3092\u542b\u307f\u307e\u3059\u3002\u500b\u5225\u306e\u8a3a\u65ad\u3084\u552f\u4e00\u306e\u6b63\u89e3\u3092\u793a\u3059\u3082\u306e\u3067\u306f\u3042\u308a\u307e\u305b\u3093\u3002"
      ),
      relatedIds:normalizeArray(
        content.relatedIds
      )
        .map((item) => normalizeString(item))
        .filter(Boolean)
    };
  }),

  updates:data.updates.map((update) => {
    return {
      id:normalizeString(update.id),
      contentId:normalizeString(
        update.contentId
      ),
      date:normalizeString(update.date),
      label:normalizeString(
        update.label,
        "UPDATED"
      ),
      labelClass:normalizeString(
        update.labelClass
      ),
      title:normalizeString(
        update.title,
        "\u66f4\u65b0\u60c5\u5831"
      ),
      summary:normalizeString(
        update.summary,
        "\u5185\u5bb9\u3092\u66f4\u65b0\u3057\u307e\u3057\u305f\u3002"
      )
    };
  }),

  facilities:data.facilities.map((facility) => {
    return {
      type:normalizeString(
        facility.type
      ),
      code:normalizeString(
        facility.code,
        "?"
      ),
      name:normalizeString(
        facility.name,
        "Facility"
      ),
      japaneseName:normalizeString(
        facility.japaneseName,
        "\u7814\u7a76\u65bd\u8a2d"
      ),
      description:normalizeString(
        facility.description,
        "\u8cc7\u6599\u3092\u5206\u985e\u3057\u3066\u4fdd\u7ba1\u3057\u3066\u3044\u307e\u3059\u3002"
      ),
      detail:normalizeString(
        facility.detail,
        "Archive"
      ),
      status:normalizeString(
        facility.status,
        "OPEN"
      )
    };
  })
};

}

async function fetchCampusData() {
const response = await fetch(
DATA_URL,
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
    `Campus\u30c7\u30fc\u30bf\u306e\u53d6\u5f97\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002HTTP ${response.status}`
  );
}

let data;

try {
  data = await response.json();
} catch (error) {
  throw new Error(
    "campus-data.json\u3092JSON\u3068\u3057\u3066\u89e3\u6790\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002\u672b\u5c3e\u30ab\u30f3\u30de\u3001\u5f15\u7528\u7b26\u3001\u62ec\u5f27\u3092\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044\u3002"
  );
}

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
    '<div class="loading-placeholder">\u8868\u793a\u3067\u304d\u308b\u73fe\u8c61\u304c\u3042\u308a\u307e\u305b\u3093\u3002</div>';

  return;
}

elements.phenomenonList.innerHTML =
  state.data.phenomena
    .map((phenomenon) => {
      const isActive =
        phenomenon.id ===
        state.activePhenomenonId;

      return (
        '<button' +
          ' class="phenomenon-button' +
          (isActive ? " is-active" : "") +
          '"' +
          ' type="button"' +
          ' data-phenomenon-id="' +
          escapeHtml(phenomenon.id) +
          '"' +
          ' aria-pressed="' +
          String(isActive) +
          '"' +
        ">" +
          escapeHtml(phenomenon.label) +
        "</button>"
      );
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
        ">" +
          '<span class="book-type">' +
            escapeHtml(
              formatTypeLabel(content.type)
            ) +
          "</span>" +
          "<h4>" +
            escapeHtml(content.title) +
          "</h4>" +
          "<p>" +
            escapeHtml(content.code) +
          "</p>" +
        "</button>"
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

function renderInsight() {
if (!state.data) {
return;
}

const phenomenon =
  getActivePhenomenon();

if (!phenomenon) {
  if (elements.insightCount) {
    elements.insightCount.textContent =
      "0 CONNECTIONS";
  }

  if (elements.insightTitle) {
    elements.insightTitle.textContent =
      "\u73fe\u8c61\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002";
  }

  if (elements.insightDescription) {
    elements.insightDescription.textContent =
      "\u4e00\u3064\u306e\u73fe\u8c61\u304b\u3089\u3001\u3069\u306e\u9818\u57df\u3078\u8996\u70b9\u304c\u5e83\u304c\u308b\u306e\u304b\u3092\u8868\u793a\u3057\u307e\u3059\u3002";
  }

  if (elements.insightPath) {
    elements.insightPath.innerHTML = "";
  }

  if (elements.relatedList) {
    elements.relatedList.innerHTML = "";
  }

  return;
}

const relatedContents =
  getRelatedContents(
    phenomenon.relatedIds
  );

if (elements.insightCount) {
  elements.insightCount.textContent =
    `${relatedContents.length} CONNECTIONS`;
}

if (elements.insightTitle) {
  elements.insightTitle.textContent =
    phenomenon.title;
}

if (elements.insightDescription) {
  elements.insightDescription.textContent =
    phenomenon.description;
}

if (elements.insightPath) {
  elements.insightPath.innerHTML =
    phenomenon.path.length > 0
      ? phenomenon.path
          .map((node) => {
            return (
              '<span class="path-node">' +
                escapeHtml(node) +
              "</span>"
            );
          })
          .join("")
      : (
        '<span class="path-node">' +
          "\u601d\u8003\u7d4c\u8def\u3092\u6574\u7406\u4e2d\u3067\u3059\u3002" +
        "</span>"
      );
}

if (!elements.relatedList) {
  return;
}

if (relatedContents.length === 0) {
  elements.relatedList.innerHTML =
    '<div class="loading-placeholder">\u95a2\u9023\u8cc7\u6599\u3092\u6574\u7406\u4e2d\u3067\u3059\u3002</div>';

  return;
}

elements.relatedList.innerHTML =
  relatedContents
    .map((content) => {
      return (
        '<button' +
          ' class="related-item"' +
          ' type="button"' +
          ' data-related-id="' +
          escapeHtml(content.id) +
          '"' +
        ">" +
          '<span class="related-code">' +
            escapeHtml(content.code) +
          "</span>" +
          '<span class="related-main">' +
            "<strong>" +
              escapeHtml(content.title) +
            "</strong>" +
            "<span>" +
              escapeHtml(content.summary) +
            "</span>" +
          "</span>" +
          '<span class="related-arrow" aria-hidden="true">' +
            "\u2192" +
          "</span>" +
        "</button>"
      );
    })
    .join("");

elements.relatedList
  .querySelectorAll("[data-related-id]")
  .forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        const contentId =
          button.dataset.relatedId;

        state.selectedContentId =
          contentId;

        renderBooks();
        openContent(contentId,button);
      }
    );
  });

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
        ">" +
          '<div class="update-head">' +
            '<span class="tag ' +
              escapeHtml(update.labelClass) +
            '">' +
              escapeHtml(update.label) +
            "</span>" +
            '<span class="update-date">' +
              escapeHtml(
                formatDate(update.date)
              ) +
            "</span>" +
          "</div>" +
          "<h3>" +
            escapeHtml(update.title) +
          "</h3>" +
          "<p>" +
            escapeHtml(update.summary) +
          "</p>" +
          '<div class="update-footer">' +
            "<span>" +
              escapeHtml(typeLabel) +
            "</span>" +
            "<strong>" +
              "OPEN \u2192" +
            "</strong>" +
          "</div>" +
        "</article>"
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
        ">" +
          '<span class="facility-icon">' +
            escapeHtml(facility.code) +
          "</span>" +
          '<span class="facility-name">' +
            escapeHtml(facility.name) +
            '<span class="facility-japanese">' +
              escapeHtml(
                facility.japaneseName
              ) +
            "</span>" +
          "</span>" +
          '<span class="facility-description">' +
            escapeHtml(
              facility.description
            ) +
          "</span>" +
          '<span class="facility-footer">' +
            "<span>" +
              escapeHtml(
                `${facility.detail} / ${itemCount} ITEMS`
              ) +
            "</span>" +
            "<strong>" +
              escapeHtml(facility.status) +
            "</strong>" +
          "</span>" +
        "</button>"
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
const phenomenon =
getPhenomenonById(phenomenonId);

if (!phenomenon) {
  return;
}

state.activePhenomenonId =
  phenomenon.id;

state.selectedContentId = "";
state.activeFacilityType = "";

renderPhenomena();
renderBooks();
renderInsight();
renderFacilities();

updateUrlState({
  phenomenon:phenomenon.id,
  content:""
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
        "</span>"
      );
    })
    .join("");

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
      "<strong>" +
        "\u95a2\u9023\u3059\u308b\u601d\u8003\u3092\u6574\u7406\u4e2d\u3067\u3059\u3002" +
      "</strong>" +
    "</div>";

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
        ">" +
          "<strong>" +
            escapeHtml(related.title) +
          "</strong>" +
          "<span>" +
            escapeHtml(
              `${formatTypeLabel(related.type)} / ${related.code}`
            ) +
          "</span>" +
        "</button>"
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
const url = new URL(
window.location.href
);

if (
  Object.prototype.hasOwnProperty.call(
    changes,
    "phenomenon"
  )
) {
  const phenomenon =
    normalizeString(
      changes.phenomenon
    );

  if (phenomenon) {
    url.searchParams.set(
      "phenomenon",
      phenomenon
    );
  } else {
    url.searchParams.delete(
      "phenomenon"
    );
  }
}

if (
  Object.prototype.hasOwnProperty.call(
    changes,
    "content"
  )
) {
  const content =
    normalizeString(
      changes.content
    );

  if (content) {
    url.searchParams.set(
      "content",
      content
    );
  } else {
    url.searchParams.delete(
      "content"
    );
  }
}

window.history.replaceState(
  {},
  "",
  url
);

}

function applyUrlState() {
if (!state.data) {
return;
}

const params =
  new URLSearchParams(
    window.location.search
  );

const phenomenonId =
  params.get("phenomenon");

const contentId =
  params.get("content");

if (
  phenomenonId &&
  getPhenomenonById(phenomenonId)
) {
  state.activePhenomenonId =
    phenomenonId;
}

if (
  contentId &&
  getContentById(contentId)
) {
  state.selectedContentId =
    contentId;
}

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

if (state.data.phenomena.length > 0) {
  state.activePhenomenonId =
    state.data.phenomena[0].id;
}

applyUrlState();
renderAll();

if (state.selectedContentId) {
  openContent(
    state.selectedContentId,
    null,
    {
      preserveFocus:true
    }
  );
}

}

async function loadCampusData() {
setLoadingState(true);
hideDataError();

try {
  state.data =
    await fetchCampusData();

  initializeState();
} catch (error) {
  console.error(
    "[Digital Research Campus]",
    error
  );

  state.data = null;

  if (elements.phenomenonList) {
    elements.phenomenonList.innerHTML =
      '<div class="loading-placeholder">\u73fe\u8c61\u30c7\u30fc\u30bf\u3092\u8868\u793a\u3067\u304d\u307e\u305b\u3093\u3002</div>';
  }

  if (elements.bookshelf) {
    elements.bookshelf.innerHTML =
      '<div class="loading-placeholder">\u8cc7\u6599\u30c7\u30fc\u30bf\u3092\u8868\u793a\u3067\u304d\u307e\u305b\u3093\u3002</div>';
  }

  if (elements.updateGrid) {
    elements.updateGrid.innerHTML =
      '<div class="loading-placeholder">\u66f4\u65b0\u60c5\u5831\u3092\u8868\u793a\u3067\u304d\u307e\u305b\u3093\u3002</div>';
  }

  if (elements.facilityGrid) {
    elements.facilityGrid.innerHTML =
      '<div class="loading-placeholder">\u65bd\u8a2d\u60c5\u5831\u3092\u8868\u793a\u3067\u304d\u307e\u305b\u3093\u3002</div>';
  }

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
