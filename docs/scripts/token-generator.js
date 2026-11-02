const PERMISSIONS = [
  {
    key: "metadata",
    label: "Metadata",
    group: "repository",
    levels: ["read"],
    note: "Always read. Required for every repository call.",
  },
  {
    key: "contents",
    label: "Contents",
    group: "repository",
    levels: ["read", "write"],
    note: "Files, branches and code search.",
  },
  {
    key: "issues",
    label: "Issues",
    group: "repository",
    levels: ["read", "write"],
    note: "Issues, comments, labels and sub-issues.",
  },
  {
    key: "pull_requests",
    label: "Pull requests",
    group: "repository",
    levels: ["read", "write"],
    note: "Read, create and merge pull requests.",
  },
  {
    key: "administration",
    label: "Administration",
    group: "repository",
    levels: ["read", "write"],
    note: "Create and delete repositories. Test suite only.",
  },
  {
    key: "issue_fields",
    label: "Issue fields",
    group: "organization",
    levels: ["read", "write"],
    note: "Organization-level Priority, Effort and dates.",
  },
  {
    key: "issue_types",
    label: "Issue types",
    group: "organization",
    levels: ["read"],
    note: "List organization issue types.",
  },
  {
    key: "organization_projects",
    label: "Projects",
    group: "organization",
    levels: ["read", "write"],
    note: "Organization Projects v2.",
  },
  {
    key: "members",
    label: "Members",
    group: "organization",
    levels: ["read"],
    note: "Optional. Not used by current tools.",
  },
];

const PRESETS = {
  "read-only": {
    metadata: "read",
    contents: "read",
    issues: "read",
    pull_requests: "read",
    issue_fields: "read",
    issue_types: "read",
    organization_projects: "read",
  },
  "read-write": {
    metadata: "read",
    contents: "write",
    issues: "write",
    pull_requests: "write",
    issue_fields: "write",
    issue_types: "read",
    organization_projects: "write",
  },
  "test-suite": {
    metadata: "read",
    contents: "write",
    issues: "write",
    pull_requests: "write",
    administration: "write",
    issue_fields: "write",
    issue_types: "read",
    organization_projects: "write",
    members: "read",
  },
};

let selected = { ...PRESETS["read-write"] };

function ownerType() {
  const checked = document.querySelector('input[name="owner-type"]:checked');
  return checked ? checked.value : "organization";
}

function applyOwnerVisibility() {
  const personal = ownerType() === "personal";
  document.querySelectorAll('#permission-groups [data-group="organization"]').forEach((element) => {
    element.classList.toggle("hidden", personal);
  });
}

function renderPermissions() {
  const container = document.getElementById("permission-groups");
  container.innerHTML = "";

  for (const group of ["repository", "organization"]) {
    const section = document.createElement("div");
    section.dataset.group = group;

    const heading = document.createElement("h3");
    heading.className = "mb-2 text-sm font-semibold uppercase tracking-wider text-base-content/50";
    heading.textContent = group === "repository" ? "Repository permissions" : "Organization permissions";
    section.appendChild(heading);

    for (const permission of PERMISSIONS.filter((item) => item.group === group)) {
      const isMetadata = permission.key === "metadata";
      const active = selected[permission.key];

      const row = document.createElement("div");
      row.className = "flex items-start justify-between gap-3 border-b border-base-300/60 py-2 last:border-0";

      const label = document.createElement("label");
      label.className = "flex cursor-pointer items-start gap-3";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "checkbox checkbox-primary checkbox-sm mt-0.5";
      checkbox.dataset.key = permission.key;
      checkbox.checked = isMetadata || Boolean(active);
      checkbox.disabled = isMetadata;

      const text = document.createElement("span");
      const title = document.createElement("span");
      title.className = "block text-base font-medium";
      title.textContent = permission.label;
      const note = document.createElement("span");
      note.className = "block text-sm text-base-content/60";
      note.textContent = permission.note;
      text.append(title, note);

      label.append(checkbox, text);
      row.appendChild(label);

      if (permission.levels.length > 1) {
        const select = document.createElement("select");
        select.className = "select select-bordered select-xs w-24";
        select.dataset.level = permission.key;
        select.disabled = !active;
        for (const level of permission.levels) {
          const option = document.createElement("option");
          option.value = level;
          option.textContent = level;
          option.selected = (active || "read") === level;
          select.appendChild(option);
        }
        row.appendChild(select);
      }

      section.appendChild(row);
    }

    container.appendChild(section);
  }

  applyOwnerVisibility();
}

function setPresetCustom() {
  document.getElementById("preset").value = "custom";
}

function validate(owner, name, days) {
  if (!owner) return "Enter an organization or username.";
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner)) {
    return "Owner names use letters, numbers and hyphens, and cannot start or end with a hyphen.";
  }
  if (!name) return "Enter a token name.";
  if (name.length > 40) return "Token names are limited to 40 characters.";
  if (!Number.isInteger(days) || days < 1 || days > 366) {
    return "Expiration must be between 1 and 366 days.";
  }
  return null;
}

function buildUrl() {
  const type = ownerType();
  const owner = document.getElementById("owner-name").value.trim();
  const name = document.getElementById("token-name").value.trim();
  const description = document.getElementById("token-description").value.trim();
  const expiresValue = document.getElementById("expires-in").value;
  const days =
    expiresValue === "custom"
      ? Number(document.getElementById("expires-custom").value)
      : Number(expiresValue);

  const urlInput = document.getElementById("token-url");
  const open = document.getElementById("open-token");
  const errorBox = document.getElementById("form-error");

  const error = validate(owner, name, days);
  if (error) {
    urlInput.value = "";
    open.href = "#";
    open.classList.add("btn-disabled");
    open.setAttribute("aria-disabled", "true");
    errorBox.textContent = error;
    errorBox.classList.remove("hidden");
    return;
  }

  const params = new URLSearchParams();
  params.set("name", name);
  if (description) params.set("description", description);
  params.set("target_name", owner);
  params.set("expires_in", String(days));
  params.set("metadata", "read");

  for (const [key, level] of Object.entries(selected)) {
    if (!level || key === "metadata") continue;
    const permission = PERMISSIONS.find((item) => item.key === key);
    if (type === "personal" && permission && permission.group === "organization") continue;
    params.set(key, level);
  }

  const url = "https://github.com/settings/personal-access-tokens/new?" + params.toString();
  urlInput.value = url;
  open.href = url;
  open.classList.remove("btn-disabled");
  open.removeAttribute("aria-disabled");
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  renderPermissions();

  const container = document.getElementById("permission-groups");

  container.addEventListener("change", (event) => {
    const checkbox = event.target.closest('input[type="checkbox"][data-key]');
    const levelSelect = event.target.closest("select[data-level]");

    if (checkbox) {
      const key = checkbox.dataset.key;
      const permission = PERMISSIONS.find((item) => item.key === key);
      const select = container.querySelector(`select[data-level="${key}"]`);

      if (checkbox.checked) {
        selected[key] = select ? select.value : permission.levels[0];
        if (select) select.disabled = false;
      } else {
        delete selected[key];
        if (select) select.disabled = true;
      }
      setPresetCustom();
      buildUrl();
    }

    if (levelSelect) {
      selected[levelSelect.dataset.level] = levelSelect.value;
      setPresetCustom();
      buildUrl();
    }
  });

  document.getElementById("preset").addEventListener("change", (event) => {
    const preset = event.target.value;
    if (preset !== "custom") {
      selected = { ...PRESETS[preset] };
      renderPermissions();
    }
    buildUrl();
  });

  document.querySelectorAll('input[name="owner-type"]').forEach((element) => {
    element.addEventListener("change", () => {
      applyOwnerVisibility();
      buildUrl();
    });
  });

  ["owner-name", "token-name", "token-description"].forEach((id) => {
    document.getElementById(id).addEventListener("input", buildUrl);
  });

  document.getElementById("expires-in").addEventListener("change", (event) => {
    document
      .getElementById("custom-expiry")
      .classList.toggle("hidden", event.target.value !== "custom");
    buildUrl();
  });

  document.getElementById("expires-custom").addEventListener("input", buildUrl);

  const open = document.getElementById("open-token");
  open.addEventListener("click", (event) => {
    if (open.getAttribute("aria-disabled") === "true") event.preventDefault();
  });

  const copy = document.getElementById("copy-url");
  copy.addEventListener("click", async () => {
    const url = document.getElementById("token-url").value;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      copy.textContent = "Copied";
      setTimeout(() => {
        copy.textContent = "Copy URL";
      }, 1500);
    } catch (error) {
      document.getElementById("token-url").select();
    }
  });

  buildUrl();
});
