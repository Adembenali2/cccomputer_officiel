document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const overlay = document.getElementById("sidebarOverlay");

  function toggleSidebar() {
    if (!sidebar) return;
    sidebar.classList.toggle("sidebar-open");
    if (overlay) overlay.classList.toggle("show");
  }

  sidebarToggle?.addEventListener("click", toggleSidebar);
  overlay?.addEventListener("click", toggleSidebar);

  const currentFile = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".sidebar .nav-link").forEach((link) => {
    const href = (link.getAttribute("href") || "").toLowerCase();
    const isActive = href === currentFile;
    link.classList.toggle("active", isActive);
    if (isActive) {
      // Evite de recharger la meme page en mode file:// (cause l'erreur unsafe attempt in frame).
      link.dataset.selfLink = "true";
      link.removeAttribute("href");
      link.setAttribute("aria-current", "page");
    }
  });

  // En mode file:// dans une frame, recharger la meme page peut lever une erreur de securite.
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = (link.getAttribute("href") || "").trim();
    if (!href) return;
    if (href === "#") {
      link.addEventListener("click", (event) => event.preventDefault());
      return;
    }
    try {
      const url = new URL(href, window.location.href);
      const targetFile = (url.pathname.split("/").pop() || "").toLowerCase();
      if (targetFile && targetFile === currentFile) {
        link.addEventListener("click", (event) => event.preventDefault());
      }
    } catch (error) {
      // Ignore les href non parsables
    }
  });

  document.querySelectorAll(".action-delete").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      window.confirm("Confirmer la suppression de cet élément ?");
    });
  });

  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle ? themeToggle.querySelector("i") : null;
  const savedTheme = localStorage.getItem("erp-theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }

  function syncThemeIcon() {
    if (!themeIcon) return;
    const dark = document.body.classList.contains("dark-mode");
    themeIcon.classList.toggle("bi-moon-stars", !dark);
    themeIcon.classList.toggle("bi-sun", dark);
  }

  syncThemeIcon();

  function initBootstrapTooltips(scope = document) {
    scope.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((element) => {
      bootstrap.Tooltip.getOrCreateInstance(element);
    });
  }

  initBootstrapTooltips();

  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const dark = document.body.classList.contains("dark-mode");
    localStorage.setItem("erp-theme", dark ? "dark" : "light");
    syncThemeIcon();
  });

  const detailModalElement = document.getElementById("clientDetailsModal");
  const clientsModalElement = document.getElementById("clientsModal");
  const savFormModalElement = document.getElementById("savFormModal");
  const callFormModalElement = document.getElementById("callFormModal");
  const livraisonFormModalElement = document.getElementById("livraisonFormModal");
  const historyListModalElement = document.getElementById("historyListModal");
  const clientSearchInput = document.getElementById("clientSearchInput");
  const detailModal = detailModalElement ? new bootstrap.Modal(detailModalElement) : null;
  const clientsModal = clientsModalElement ? bootstrap.Modal.getOrCreateInstance(clientsModalElement) : null;
  const savFormModal = savFormModalElement ? new bootstrap.Modal(savFormModalElement) : null;
  const callFormModal = callFormModalElement ? new bootstrap.Modal(callFormModalElement) : null;
  const livraisonFormModal = livraisonFormModalElement ? new bootstrap.Modal(livraisonFormModalElement) : null;
  const historyListModal = historyListModalElement ? new bootstrap.Modal(historyListModalElement) : null;

  let activeClientButton = null;

  function filterClients() {
    const query = (clientSearchInput?.value || "").trim().toLowerCase();
    document.querySelectorAll(".client-trigger").forEach((button) => {
      const card = button.closest(".col-12");
      const haystack = [
        button.dataset.clientName || "",
        button.dataset.clientContact || "",
        button.dataset.clientEmail || "",
      ].join(" ").toLowerCase();
      const show = !query || haystack.includes(query);
      if (card) {
        card.classList.toggle("d-none", !show);
      }
    });
  }

  const consumptionFilter = document.getElementById("consumptionFilter");
  const consumptionSvg = document.getElementById("consumptionSvg");
  const chartTooltip = document.getElementById("chartTooltip");
  const paymentsFilter = document.getElementById("paymentsFilter");
  const paymentsPaidCount = document.getElementById("paymentsPaidCount");
  const paymentsPaidAmount = document.getElementById("paymentsPaidAmount");
  const paymentsDueCount = document.getElementById("paymentsDueCount");
  const paymentsDueAmount = document.getElementById("paymentsDueAmount");
  const paymentsDetailList = document.getElementById("paymentsDetailList");
  const paymentsData = {
    month: {
      paid: { count: "9 factures", amount: "12 480 EUR" },
      due: { count: "4 factures", amount: "3 960 EUR" },
      details: [
        "Beta Conseil - FAC-2026-102 - Retard de 12 jours",
        "Delta Immo - FAC-2026-104 - Echeance aujourd'hui",
        "Zeta Sante - FAC-2026-112 - Relance envoyee",
      ],
    },
    year: {
      paid: { count: "121 factures", amount: "166 300 EUR" },
      due: { count: "18 factures", amount: "23 740 EUR" },
      details: [
        "Top client payeur : Orion Tech - 24 600 EUR",
        "Encaissement moyen : 13 858 EUR / mois",
        "Factures a risque : 5 dossiers avec +30 jours",
      ],
    },
  };
  const consumptionData = {
    day: [
      { label: "Lun", nb: 9, color: 3, sav: 2, livraisons: 1, paiements: "1 paye / 0 retard" },
      { label: "Mar", nb: 11, color: 4, sav: 3, livraisons: 2, paiements: "2 payes / 1 retard" },
      { label: "Mer", nb: 8, color: 3, sav: 1, livraisons: 1, paiements: "1 paye / 0 retard" },
      { label: "Jeu", nb: 12, color: 5, sav: 4, livraisons: 3, paiements: "2 payes / 1 retard" },
      { label: "Ven", nb: 10, color: 4, sav: 3, livraisons: 2, paiements: "1 paye / 1 retard" },
      { label: "Sam", nb: 6, color: 2, sav: 1, livraisons: 1, paiements: "0 paye / 1 retard" },
    ],
    month: [
      { label: "Jan", nb: 58, color: 22, sav: 11, livraisons: 15, paiements: "8 payes / 3 retard" },
      { label: "Fev", nb: 65, color: 26, sav: 13, livraisons: 18, paiements: "9 payes / 2 retard" },
      { label: "Mar", nb: 61, color: 24, sav: 12, livraisons: 17, paiements: "7 payes / 4 retard" },
      { label: "Avr", nb: 72, color: 30, sav: 17, livraisons: 21, paiements: "9 payes / 4 retard" },
      { label: "Mai", nb: 68, color: 28, sav: 15, livraisons: 19, paiements: "10 payes / 3 retard" },
      { label: "Juin", nb: 75, color: 35, sav: 18, livraisons: 24, paiements: "12 payes / 2 retard" },
    ],
    year: [
      { label: "2021", nb: 540, color: 180, sav: 122, livraisons: 186, paiements: "102 payes / 18 retard" },
      { label: "2022", nb: 590, color: 210, sav: 131, livraisons: 204, paiements: "109 payes / 15 retard" },
      { label: "2023", nb: 620, color: 230, sav: 144, livraisons: 216, paiements: "113 payes / 17 retard" },
      { label: "2024", nb: 670, color: 255, sav: 156, livraisons: 235, paiements: "118 payes / 14 retard" },
      { label: "2025", nb: 705, color: 272, sav: 161, livraisons: 248, paiements: "121 payes / 13 retard" },
      { label: "2026", nb: 740, color: 290, sav: 169, livraisons: 261, paiements: "126 payes / 11 retard" },
    ],
  };

  function buildLinePath(points) {
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
  }

  function showChartTooltip(point, seriesName, value) {
    if (!chartTooltip) return;
    chartTooltip.innerHTML = `<strong>${point.label}</strong><br>${seriesName}: ${value}k<br>SAV: ${point.sav}<br>Livraisons: ${point.livraisons}<br>Paiements: ${point.paiements}`;
    chartTooltip.style.left = `${(point.x / 640) * 100}%`;
    chartTooltip.style.top = `${(point.y / 260) * 100}%`;
    chartTooltip.classList.remove("d-none");
  }

  function hideChartTooltip() {
    chartTooltip?.classList.add("d-none");
  }

  function renderPayments(range) {
    const data = paymentsData[range] || paymentsData.month;
    if (paymentsPaidCount) paymentsPaidCount.textContent = data.paid.count;
    if (paymentsPaidAmount) paymentsPaidAmount.textContent = data.paid.amount;
    if (paymentsDueCount) paymentsDueCount.textContent = data.due.count;
    if (paymentsDueAmount) paymentsDueAmount.textContent = data.due.amount;
    if (paymentsDetailList) {
      paymentsDetailList.innerHTML = data.details.map((item) => `<li>${item}</li>`).join("");
    }
  }

  function renderConsumptionChart(range) {
    if (!consumptionSvg) return;
    const data = consumptionData[range] || consumptionData.month;
    const width = 640;
    const height = 260;
    const left = 40;
    const right = 610;
    const top = 30;
    const bottom = 220;
    const step = (right - left) / (data.length - 1);
    const maxValue = Math.max(...data.map((d) => Math.max(d.nb, d.color))) * 1.15;
    const toY = (v) => bottom - ((v / maxValue) * (bottom - top));

    const nbPoints = data.map((d, i) => ({ ...d, x: left + (i * step), y: toY(d.nb), value: d.nb }));
    const colorPoints = data.map((d, i) => ({ ...d, x: left + (i * step), y: toY(d.color), value: d.color }));

    consumptionSvg.innerHTML = `
      <line x1="${left}" y1="${top}" x2="${left}" y2="${bottom}" class="chart-axis"></line>
      <line x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}" class="chart-axis"></line>
      <line x1="${left}" y1="${bottom - 40}" x2="${right}" y2="${bottom - 40}" class="chart-grid"></line>
      <line x1="${left}" y1="${bottom - 80}" x2="${right}" y2="${bottom - 80}" class="chart-grid"></line>
      <line x1="${left}" y1="${bottom - 120}" x2="${right}" y2="${bottom - 120}" class="chart-grid"></line>
      <line x1="${left}" y1="${bottom - 160}" x2="${right}" y2="${bottom - 160}" class="chart-grid"></line>
      <path d="${buildLinePath(nbPoints)}" class="curve-nb curve-animated"></path>
      <path d="${buildLinePath(colorPoints)}" class="curve-color curve-animated"></path>
      ${nbPoints.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="4" class="point-nb chart-node" data-series="Noir et blanc" data-index="${p.label}" data-value="${p.value}"></circle><text x="${p.x}" y="${p.y - 12}" class="value-nb">${p.value}k</text>`).join("")}
      ${colorPoints.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="4" class="point-color chart-node" data-series="Couleur" data-index="${p.label}" data-value="${p.value}"></circle><text x="${p.x}" y="${p.y + 17}" class="value-color">${p.value}k</text>`).join("")}
      ${data.map((d, i) => `<text x="${left + (i * step)}" y="240" class="month-label">${d.label}</text>`).join("")}
    `;

    consumptionSvg.querySelectorAll(".chart-node").forEach((node) => {
      node.addEventListener("mouseenter", () => {
        const label = node.getAttribute("data-index");
        const series = node.getAttribute("data-series");
        const value = node.getAttribute("data-value");
        const point = data.find((d) => d.label === label);
        if (point) showChartTooltip({ ...point, x: Number(node.getAttribute("cx")), y: Number(node.getAttribute("cy")) }, series, value);
      });
      node.addEventListener("mouseleave", hideChartTooltip);
    });
  }

  const planningCalendarGrid = document.getElementById("planningCalendarGrid");
  const calendarMonthLabel = document.getElementById("calendarMonthLabel");
  const calendarPrevMonth = document.getElementById("calendarPrevMonth");
  const calendarNextMonth = document.getElementById("calendarNextMonth");
  const calendarUserFilter = document.getElementById("calendarUserFilter");
  const calendarTypeFilter = document.getElementById("calendarTypeFilter");
  const planningData = [
    { date: "2026-04-03", type: "sav", user: "Youssef El Idrissi", client: "Beta Conseil", time: "09:00", title: "Calibration couleur" },
    { date: "2026-04-03", type: "livraison", user: "Nadia K.", client: "Orion Tech", time: "11:00", title: "Toner noir x4" },
    { date: "2026-04-05", type: "sav", user: "Karim B.", client: "Gamma Industrie", time: "10:30", title: "Bourrage papier recurrent" },
    { date: "2026-04-07", type: "livraison", user: "Nadia K.", client: "Delta Immo", time: "14:00", title: "Papier A4 x12" },
    { date: "2026-04-08", type: "sav", user: "Youssef El Idrissi", client: "Nova Legal", time: "15:30", title: "Compteur non remonte" },
    { date: "2026-04-11", type: "sav", user: "Amine S.", client: "Zeta Sante", time: "08:45", title: "Remplacement tambour" },
    { date: "2026-04-12", type: "livraison", user: "Rachid M.", client: "Epsilon RH", time: "13:00", title: "Toner cyan x2" },
    { date: "2026-04-15", type: "sav", user: "Karim B.", client: "Orion Tech", time: "16:15", title: "Firmware + tests" },
    { date: "2026-04-17", type: "livraison", user: "Rachid M.", client: "Alpha Bureau", time: "09:30", title: "LCD 24 pouces x1" },
    { date: "2026-04-18", type: "sav", user: "Amine S.", client: "Beta Conseil", time: "11:00", title: "Connexion scanner" },
    { date: "2026-04-22", type: "livraison", user: "Nadia K.", client: "Gamma Industrie", time: "10:00", title: "PC bureautique x2" },
    { date: "2026-04-25", type: "sav", user: "Youssef El Idrissi", client: "Delta Immo", time: "14:30", title: "Tete impression a nettoyer" },
    { date: "2026-05-04", type: "livraison", user: "Rachid M.", client: "Zeta Sante", time: "08:30", title: "Toner magenta x3" },
    { date: "2026-05-06", type: "sav", user: "Karim B.", client: "Epsilon RH", time: "12:15", title: "Rouleau d'entrainement" },
    { date: "2026-05-09", type: "sav", user: "Amine S.", client: "Orion Tech", time: "09:45", title: "Alerte fusion basse" },
    { date: "2026-05-12", type: "livraison", user: "Nadia K.", client: "Nova Legal", time: "15:00", title: "Papier A3 x6" },
  ];
  let calendarCursor = new Date(2026, 3, 1);

  function toDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function renderPlanningCalendar() {
    if (!planningCalendarGrid) return;
    const monthStart = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
    const monthEnd = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 0);
    const firstWeekday = (monthStart.getDay() + 6) % 7;
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - firstWeekday);

    const userValue = calendarUserFilter?.value || "all";
    const typeValue = calendarTypeFilter?.value || "all";
    const filteredEvents = planningData.filter((item) => {
      const matchesUser = userValue === "all" || item.user === userValue;
      const matchesType = typeValue === "all" || item.type === typeValue;
      return matchesUser && matchesType;
    });

    const eventsByDay = {};
    filteredEvents.forEach((item) => {
      if (!eventsByDay[item.date]) eventsByDay[item.date] = [];
      eventsByDay[item.date].push(item);
    });

    if (calendarMonthLabel) {
      calendarMonthLabel.textContent = monthStart.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    }

    planningCalendarGrid.innerHTML = "";
    for (let i = 0; i < 42; i += 1) {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + i);
      const key = toDateKey(day);
      const entries = eventsByDay[key] || [];
      const outside = day < monthStart || day > monthEnd;
      const cell = document.createElement("div");
      cell.className = `calendar-day-cell${outside ? " is-outside" : ""}`;
      cell.innerHTML = `
        <div class="calendar-day-head">
          <span class="calendar-day-number">${day.getDate()}</span>
          <span class="small text-muted">${entries.length ? `${entries.length} evt` : ""}</span>
        </div>
        ${entries.slice(0, 3).map((evt) => `
          <div class="calendar-event calendar-event-${evt.type}">
            <div class="calendar-event-title">${evt.time} - ${evt.user}</div>
            <div class="calendar-event-meta">${evt.client} - ${evt.title}</div>
          </div>
        `).join("")}
        ${entries.length > 3 ? `<div class="small text-muted">+${entries.length - 3} autre(s)</div>` : ""}
      `;
      planningCalendarGrid.appendChild(cell);
    }
  }

  if (planningCalendarGrid) {
    const users = Array.from(new Set(planningData.map((item) => item.user)));
    if (calendarUserFilter) {
      users.forEach((user) => {
        const option = document.createElement("option");
        option.value = user;
        option.textContent = user;
        calendarUserFilter.appendChild(option);
      });
    }
    renderPlanningCalendar();
    calendarPrevMonth?.addEventListener("click", () => {
      calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
      renderPlanningCalendar();
    });
    calendarNextMonth?.addEventListener("click", () => {
      calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
      renderPlanningCalendar();
    });
    calendarUserFilter?.addEventListener("change", renderPlanningCalendar);
    calendarTypeFilter?.addEventListener("change", renderPlanningCalendar);
  }

  const printerHistoryModalElement = document.getElementById("printerHistoryModal");
  const printerHistoryModal = printerHistoryModalElement ? new bootstrap.Modal(printerHistoryModalElement) : null;
  const printerHistoryBody = document.getElementById("printerHistoryBody");
  const printerHistoryName = document.getElementById("printerHistoryName");
  const printerHistorySerial = document.getElementById("printerHistorySerial");
  const printerHistoryIp = document.getElementById("printerHistoryIp");
  const printerHistoryClient = document.getElementById("printerHistoryClient");

  function renderPrinterHistory(row) {
    if (!printerHistoryBody || !printerHistoryName || !printerHistorySerial || !printerHistoryIp || !printerHistoryClient) return;
    printerHistoryName.textContent = row.dataset.printerName || "Photocopieur";
    printerHistorySerial.textContent = row.dataset.printerSerial || "-";
    const ip = row.children[2]?.textContent?.trim() || "-";
    const client = row.children[3]?.textContent?.trim() || "-";
    const tonerGroupHtml = row.querySelector(".toner-vertical-group")?.outerHTML || "";
    const tonerLabelsHtml = row.querySelector(".toner-vertical-labels")?.outerHTML || "";
    const currentTonerHtml = tonerGroupHtml
      ? `<div class="toner-history-wrap">${tonerGroupHtml}${tonerLabelsHtml}</div>`
      : "-";
    printerHistoryIp.textContent = ip;
    printerHistoryClient.textContent = client;
    const entries = (row.dataset.counterHistory || "").split("|").filter(Boolean);

    if (!entries.length) {
      printerHistoryBody.innerHTML = '<tr><td colspan="6" class="text-muted">Aucun historique disponible.</td></tr>';
      return;
    }
    printerHistoryBody.innerHTML = entries.map((entry, index) => {
      const [date, nbRaw, colorRaw] = entry.split(";");
      const nb = Number(nbRaw || 0);
      const color = Number(colorRaw || 0);
      const nextEntry = entries[index + 1] ? entries[index + 1].split(";") : null;
      const nextNb = nextEntry ? Number(nextEntry[1] || 0) : nb;
      const nextColor = nextEntry ? Number(nextEntry[2] || 0) : color;
      const deltaNb = nb - nextNb;
      const deltaColor = color - nextColor;
      const nbVarHtml = deltaNb > 0 ? `<span class="text-success fw-semibold">+${deltaNb}</span>` : '<span class="text-muted">-</span>';
      const colorVarHtml = deltaColor > 0 ? `<span class="text-success fw-semibold">+${deltaColor}</span>` : '<span class="text-muted">-</span>';
      return `<tr><td>${date || "-"}</td><td>${nb.toLocaleString("fr-FR")}</td><td>${color.toLocaleString("fr-FR")}</td><td class="text-center">${currentTonerHtml}</td><td>${nbVarHtml}</td><td>${colorVarHtml}</td></tr>`;
    }).join("");
  }

  document.querySelectorAll(".printer-row-clickable").forEach((row) => {
    row.addEventListener("click", (event) => {
      renderPrinterHistory(row);
      printerHistoryModal?.show();
    });
  });

  const savDetailsModalElement = document.getElementById("savDetailsModal");
  const savDetailsModal = savDetailsModalElement ? new bootstrap.Modal(savDetailsModalElement) : null;
  const savStatusEdit = document.getElementById("savStatusEdit");
  const savTechnicianCommentEdit = document.getElementById("savTechnicianCommentEdit");
  const saveSavDetailsBtn = document.getElementById("saveSavDetailsBtn");
  let activeSavRow = null;
  function setSavDetail(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "-";
  }
  function getSavStatusBadge(status) {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "en attente") return '<span class="badge text-bg-secondary">En attente</span>';
    if (normalized === "résolu" || normalized === "resolu") return '<span class="badge text-bg-success">Résolu</span>';
    return '<span class="badge text-bg-warning">En cours</span>';
  }
  document.querySelectorAll(".sav-row-clickable").forEach((row) => {
    row.addEventListener("click", () => {
      activeSavRow = row;
      setSavDetail("savDetailTicket", row.dataset.savTicket);
      setSavDetail("savDetailClient", row.dataset.savClient);
      setSavDetail("savDetailMachine", row.dataset.savMachine);
      setSavDetail("savDetailTechnician", row.dataset.savTechnician);
      setSavDetail("savDetailPriority", row.dataset.savPriority);
      setSavDetail("savDetailStatus", row.dataset.savStatus);
      setSavDetail("savDetailOpened", row.dataset.savOpened);
      setSavDetail("savDetailPlanned", row.dataset.savPlanned);
      setSavDetail("savDetailProblem", row.dataset.savProblem);
      setSavDetail("savDetailLevel", row.dataset.savLevel);
      if (savStatusEdit) savStatusEdit.value = row.dataset.savStatus || "En cours";
      if (savTechnicianCommentEdit) savTechnicianCommentEdit.value = row.dataset.savComment || "";
      savDetailsModal?.show();
    });
  });
  saveSavDetailsBtn?.addEventListener("click", () => {
    if (!activeSavRow) return;
    const status = savStatusEdit?.value || "En cours";
    const comment = savTechnicianCommentEdit?.value.trim() || "";
    activeSavRow.dataset.savStatus = status;
    activeSavRow.dataset.savComment = comment;
    const statusCell = activeSavRow.children[5];
    if (statusCell) statusCell.innerHTML = getSavStatusBadge(status);
    savDetailsModal?.hide();
  });

  function parseFrDateTime(value) {
    const [datePart, timePart] = String(value || "").trim().split(" ");
    if (!datePart) return null;
    const [day, month, year] = datePart.split("/").map((n) => Number(n));
    const [hour, minute] = (timePart || "00:00").split(":").map((n) => Number(n));
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day, hour || 0, minute || 0, 0, 0);
  }

  function applyCounterDelayAlerts() {
    const rows = document.querySelectorAll(".printer-row-clickable");
    if (!rows.length) return;
    const now = new Date();
    rows.forEach((row) => {
      const dateCell = row.children[5];
      if (!dateCell) return;
      dateCell.querySelector(".counter-delay-badge")?.remove();
      row.classList.remove("row-counter-alert");
      const lastReadingDate = parseFrDateTime(dateCell.textContent);
      if (!lastReadingDate) return;
      const diffMs = now.getTime() - lastReadingDate.getTime();
      const daysWithoutReading = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (daysWithoutReading >= 3) {
        row.classList.add("row-counter-alert");
        const badge = document.createElement("span");
        badge.className = "counter-delay-badge";
        badge.textContent = `${daysWithoutReading} jour${daysWithoutReading > 1 ? "s" : ""} sans releve`;
        dateCell.appendChild(document.createElement("br"));
        dateCell.appendChild(badge);
      }
    });
  }

  applyCounterDelayAlerts();

  const printerSearchInput = document.getElementById("printerSearchInput");
  const printerStatusFilter = document.getElementById("printerStatusFilter");
  const printerDelayFilter = document.getElementById("printerDelayFilter");

  function getDaysWithoutReading(row) {
    const dateCell = row.children[5];
    if (!dateCell) return -1;
    const rawDate = (dateCell.textContent || "").split("\n")[0].trim();
    const lastReadingDate = parseFrDateTime(rawDate);
    if (!lastReadingDate) return -1;
    const diffMs = Date.now() - lastReadingDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  function applyPrinterFilters() {
    const normalize = (value) => String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    const query = (printerSearchInput?.value || "").trim().toLowerCase();
    const status = normalize(printerStatusFilter?.value || "all");
    const delay = printerDelayFilter?.value || "all";
    const rows = document.querySelectorAll(".printer-row-clickable");
    rows.forEach((row) => {
      const rowText = row.textContent.toLowerCase();
      const rowStatus = normalize((row.children[9]?.textContent || "").trim());
      const daysWithoutReading = getDaysWithoutReading(row);
      const matchQuery = !query || rowText.includes(query);
      const matchStatus = status === "all" || rowStatus.includes(status);
      const matchDelay = delay === "all"
        || (delay === "late3" && daysWithoutReading >= 3)
        || (delay === "late7" && daysWithoutReading >= 7);
      row.classList.toggle("d-none", !(matchQuery && matchStatus && matchDelay));
    });
  }

  printerSearchInput?.addEventListener("input", applyPrinterFilters);
  printerStatusFilter?.addEventListener("change", applyPrinterFilters);
  printerDelayFilter?.addEventListener("change", applyPrinterFilters);
  applyPrinterFilters();

  const clientsSearchInput = document.getElementById("clientsSearchInput");
  function applyClientsFilter() {
    const query = (clientsSearchInput?.value || "").trim().toLowerCase();
    document.querySelectorAll("#clientsTableBody tr").forEach((row) => {
      const match = !query || row.textContent.toLowerCase().includes(query);
      row.classList.toggle("d-none", !match);
    });
  }
  clientsSearchInput?.addEventListener("input", applyClientsFilter);

  const addClientModalElement = document.getElementById("addClientModal");
  const addClientModal = addClientModalElement ? new bootstrap.Modal(addClientModalElement) : null;
  const editClientModalElement = document.getElementById("editClientModal");
  const editClientModal = editClientModalElement ? new bootstrap.Modal(editClientModalElement) : null;
  const openAddClientModalBtn = document.getElementById("openAddClientModalBtn");
  const generateContractBtn = document.getElementById("generateContractBtn");
  const saveClientBtn = document.getElementById("saveClientBtn");
  const saveEditClientBtn = document.getElementById("saveEditClientBtn");
  const sameDeliveryAddress = document.getElementById("sameDeliveryAddress");
  const clientDeliveryAddress = document.getElementById("clientDeliveryAddress");
  const clientAdresse = document.getElementById("clientAdresse");
  const clientCodePostal = document.getElementById("clientCodePostal");
  const clientVille = document.getElementById("clientVille");
  const clientContractPreview = document.getElementById("clientContractPreview");
  const clientsTableBody = document.getElementById("clientsTableBody");
  let activeClientRow = null;
  let isContractGenerated = false;

  const postalCityMap = new Map();
  let postalMapLoaded = false;

  function toDisplayCity(raw) {
    const source = String(raw || "").trim().toLowerCase();
    if (!source) return "";
    return source.replace(/(^|[\s-])([a-zà-öø-ÿ])/g, (match, sep, ch) => `${sep}${ch.toUpperCase()}`);
  }

  async function loadPostalMapFromJson() {
    if (postalMapLoaded) return;
    postalMapLoaded = true;
    postalCityMap.set("93800", "Epinay-sur-Seine");
    if (window.location.protocol === "file:") return;
    try {
      const response = await fetch("data/codes-postaux.json");
      if (!response.ok) return;
      const json = await response.json();
      if (!Array.isArray(json)) return;
      json.forEach((entry) => {
        const code = String(entry?.code_postal || "").trim();
        const commune = String(entry?.nom_commune || "").trim();
        if (!code || !commune) return;
        if (!postalCityMap.has(code)) {
          postalCityMap.set(code, toDisplayCity(commune));
        }
      });
    } catch (error) {
      // Fallback conservé en mode statique si le JSON ne peut pas être chargé.
    }
  }

  function syncDeliveryAddress() {
    if (!sameDeliveryAddress || !clientDeliveryAddress || !clientAdresse) return;
    if (sameDeliveryAddress.checked) {
      clientDeliveryAddress.value = clientAdresse.value.trim();
      clientDeliveryAddress.setAttribute("disabled", "disabled");
    } else {
      clientDeliveryAddress.removeAttribute("disabled");
    }
  }

  function markContractAsDirty() {
    isContractGenerated = false;
    if (saveClientBtn) saveClientBtn.disabled = true;
  }

  function collectHoraires(prefix) {
    const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    const h = {};
    jours.forEach((j) => {
      h[j.toLowerCase()] = {
        md: document.getElementById(`${prefix}${j}MD`)?.value || "",
        mf: document.getElementById(`${prefix}${j}MF`)?.value || "",
        ad: document.getElementById(`${prefix}${j}AD`)?.value || "",
        af: document.getElementById(`${prefix}${j}AF`)?.value || "",
        f: document.getElementById(`${prefix}${j}F`)?.checked || false,
      };
    });
    return JSON.stringify(h);
  }

  function fillHoraires(prefix, jsonStr) {
    try {
      const h = JSON.parse(jsonStr || "{}");
      const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
      jours.forEach((j) => {
        const d = h[j.toLowerCase()] || {};
        const el = (sfx) => document.getElementById(`${prefix}${j}${sfx}`);
        if (el("MD")) el("MD").value = d.md || "";
        if (el("MF")) el("MF").value = d.mf || "";
        if (el("AD")) el("AD").value = d.ad || "";
        if (el("AF")) el("AF").value = d.af || "";
        if (el("F")) el("F").checked = d.f || false;
      });
    } catch (_) {}
  }

  function parseAddress(fullAddress) {
    const value = String(fullAddress || "").trim();
    const match = value.match(/^(.*?),\s*(\d{5})\s*(.+)$/);
    if (!match) return { street: value, postalCode: "", city: "" };
    return { street: match[1].trim(), postalCode: match[2].trim(), city: match[3].trim() };
  }

  function setClientRowDataset(row, data) {
    row.dataset.clientRaison = data.raisonSociale || "";
    row.dataset.clientDirigeant = data.dirigeant || "";
    row.dataset.clientEmail = data.email || "";
    row.dataset.clientTelephone = data.telephone || "";
    row.dataset.clientTelephone2 = data.telephone2 || "";
    row.dataset.clientAdresse = data.adresse || "";
    row.dataset.clientCodePostal = data.codePostal || "";
    row.dataset.clientVille = data.ville || "";
    row.dataset.clientSiret = data.siret || "";
    row.dataset.clientTva = data.tva || "";
    row.dataset.clientCodeInterne = data.codeInterne || "";
    row.dataset.clientContractNumber = data.contractNumber || "";
    row.dataset.clientParrain = data.parrain || "";
    row.dataset.clientOffre = data.offre || "";
    row.dataset.clientDeliveryAddress = data.deliveryAddress || "";
    row.dataset.uploadRibName = data.uploadRibName || "";
    row.dataset.uploadIdentityName = data.uploadIdentityName || "";
    row.dataset.uploadKbisName = data.uploadKbisName || "";
    row.dataset.uploadOtherName = data.uploadOtherName || "";
    // Nouveaux champs contrat
    row.dataset.clientModePaiement = data.modePaiement || "prelevement";
    row.dataset.clientNumeroCheque = data.numeroCheque || "";
    row.dataset.clientMarque = data.marque || "RICOH";
    row.dataset.clientModele = data.modele || "";
    row.dataset.clientNumeroSerie = data.numeroSerie || "";
    row.dataset.clientCompteurNB = data.compteurNB || "0";
    row.dataset.clientCompteurCouleur = data.compteurCouleur || "0";
    row.dataset.clientResponsableBoutique = data.responsableBoutique || "";
    row.dataset.clientTelephoneResponsable = data.telephoneResponsable || "";
    row.dataset.clientHoraires = data.horaires || "{}";
    row.dataset.clientTarifCopieNB = data.tarifCopieNB || "";
    row.dataset.clientTarifCopieCouleur = data.tarifCopieCouleur || "";
    row.dataset.clientTarifImpressionNB = data.tarifImpressionNB || "";
    row.dataset.clientTarifImpressionCouleur = data.tarifImpressionCouleur || "";
    row.dataset.clientTarifScan = data.tarifScan || "";
    row.dataset.clientTarifFax = data.tarifFax || "";
    row.dataset.clientIban = data.iban || "";
    row.dataset.clientBic = data.bic || "";
  }

  function getClientDataFromRow(row) {
    const raisonSociale = row.dataset.clientRaison || row.children[0]?.textContent?.trim() || "";
    const dirigeant = row.dataset.clientDirigeant || row.children[1]?.textContent?.trim() || "";
    const email = row.dataset.clientEmail || row.children[2]?.textContent?.trim() || "";
    const telephone = row.dataset.clientTelephone || row.children[3]?.textContent?.trim() || "";
    const parsedAddress = parseAddress(row.children[4]?.textContent?.trim() || "");
    return {
      raisonSociale,
      dirigeant,
      email,
      telephone,
      telephone2: row.dataset.clientTelephone2 || "",
      adresse: row.dataset.clientAdresse || parsedAddress.street,
      codePostal: row.dataset.clientCodePostal || parsedAddress.postalCode,
      ville: row.dataset.clientVille || parsedAddress.city,
      siret: row.dataset.clientSiret || "",
      tva: row.dataset.clientTva || "",
      codeInterne: row.dataset.clientCodeInterne || "",
      contractNumber: row.dataset.clientContractNumber || "",
      parrain: row.dataset.clientParrain || "",
      offre: row.dataset.clientOffre || "",
      deliveryAddress: row.dataset.clientDeliveryAddress || row.dataset.clientAdresse || parsedAddress.street,
      uploadRibName: row.dataset.uploadRibName || "",
      uploadIdentityName: row.dataset.uploadIdentityName || "",
      uploadKbisName: row.dataset.uploadKbisName || "",
      uploadOtherName: row.dataset.uploadOtherName || "",
      // Nouveaux champs
      modePaiement: row.dataset.clientModePaiement || "prelevement",
      numeroCheque: row.dataset.clientNumeroCheque || "",
      marque: row.dataset.clientMarque || "RICOH",
      modele: row.dataset.clientModele || "",
      numeroSerie: row.dataset.clientNumeroSerie || "",
      compteurNB: row.dataset.clientCompteurNB || "0",
      compteurCouleur: row.dataset.clientCompteurCouleur || "0",
      responsableBoutique: row.dataset.clientResponsableBoutique || "",
      telephoneResponsable: row.dataset.clientTelephoneResponsable || "",
      horaires: row.dataset.clientHoraires || "{}",
      tarifCopieNB: row.dataset.clientTarifCopieNB || "",
      tarifCopieCouleur: row.dataset.clientTarifCopieCouleur || "",
      tarifImpressionNB: row.dataset.clientTarifImpressionNB || "",
      tarifImpressionCouleur: row.dataset.clientTarifImpressionCouleur || "",
      tarifScan: row.dataset.clientTarifScan || "",
      tarifFax: row.dataset.clientTarifFax || "",
      iban: row.dataset.clientIban || "",
      bic: row.dataset.clientBic || "",
    };
  }

  function bindClientRows() {
    document.querySelectorAll("#clientsTableBody tr").forEach((row) => {
      if (row.dataset.detailsBound === "true") return;
      row.dataset.detailsBound = "true";
      row.style.cursor = "pointer";
      row.addEventListener("click", (event) => {
        if (event.target.closest(".table-actions")) return;
        const data = getClientDataFromRow(row);
        activeClientRow = row;
        document.getElementById("editClientRaisonSociale").value = data.raisonSociale;
        document.getElementById("editClientDirigeant").value = data.dirigeant;
        document.getElementById("editClientEmail").value = data.email;
        document.getElementById("editClientTelephone").value = data.telephone;
        document.getElementById("editClientTelephone2").value = data.telephone2;
        document.getElementById("editClientAdresse").value = data.adresse;
        document.getElementById("editClientCodePostal").value = data.codePostal;
        document.getElementById("editClientVille").value = data.ville;
        document.getElementById("editClientSiret").value = data.siret;
        document.getElementById("editClientTva").value = data.tva;
        document.getElementById("editClientCodeInterne").value = data.codeInterne;
        document.getElementById("editClientContractNumber").value = data.contractNumber;
        document.getElementById("editClientParrain").value = data.parrain;
        document.getElementById("editClientOffre").value = data.offre;
        document.getElementById("editClientDeliveryAddress").value = data.deliveryAddress;
        document.getElementById("editUploadRibName").value = data.uploadRibName;
        document.getElementById("editUploadIdentityName").value = data.uploadIdentityName;
        document.getElementById("editUploadKbisName").value = data.uploadKbisName;
        document.getElementById("editUploadOtherName").value = data.uploadOtherName;
        document.getElementById("editUploadRib").value = "";
        document.getElementById("editUploadIdentity").value = "";
        document.getElementById("editUploadKbis").value = "";
        document.getElementById("editUploadOther").value = "";
        // Nouveaux champs
        const editModeRadio = document.querySelector(`input[name="editClientModePaiement"][value="${data.modePaiement || "prelevement"}"]`);
        if (editModeRadio) editModeRadio.checked = true;
        const editChequeWrap = document.getElementById("editClientNumeroChequeWrapper");
        if (editChequeWrap) editChequeWrap.style.display = data.modePaiement === "cheque" ? "" : "none";
        document.getElementById("editClientNumeroCheque").value = data.numeroCheque || "";
        document.getElementById("editClientMarque").value = data.marque || "RICOH";
        document.getElementById("editClientModele").value = data.modele || "";
        document.getElementById("editClientNumeroSerie").value = data.numeroSerie || "";
        document.getElementById("editClientCompteurNB").value = data.compteurNB || "0";
        document.getElementById("editClientCompteurCouleur").value = data.compteurCouleur || "0";
        document.getElementById("editClientResponsableBoutique").value = data.responsableBoutique || "";
        document.getElementById("editClientTelephoneResponsable").value = data.telephoneResponsable || "";
        fillHoraires("editH", data.horaires || "{}");
        document.getElementById("editClientTarifCopieNB").value = data.tarifCopieNB || "";
        document.getElementById("editClientTarifCopieCouleur").value = data.tarifCopieCouleur || "";
        document.getElementById("editClientTarifImpressionNB").value = data.tarifImpressionNB || "";
        document.getElementById("editClientTarifImpressionCouleur").value = data.tarifImpressionCouleur || "";
        document.getElementById("editClientTarifScan").value = data.tarifScan || "";
        document.getElementById("editClientTarifFax").value = data.tarifFax || "";
        document.getElementById("editClientIban").value = data.iban || "";
        document.getElementById("editClientBic").value = data.bic || "";
        editClientModal?.show();
      });
    });
  }

  openAddClientModalBtn?.addEventListener("click", () => {
    prepareNewClientIdentity();
    if (clientContractPreview) clientContractPreview.value = "";
    isContractGenerated = false;
    if (saveClientBtn) saveClientBtn.disabled = true;
    addClientModal?.show();
  });

  sameDeliveryAddress?.addEventListener("change", syncDeliveryAddress);
  clientAdresse?.addEventListener("input", syncDeliveryAddress);

  clientCodePostal?.addEventListener("input", async () => {
    await loadPostalMapFromJson();
    const code = clientCodePostal.value.trim();
    const city = postalCityMap.get(code);
    if (city) {
      clientVille.value = city;
    }
    markContractAsDirty();
  });

  [
    "clientRaisonSociale",
    "clientDirigeant",
    "clientEmail",
    "clientTelephone",
    "clientTelephone2",
    "clientAdresse",
    "clientVille",
    "clientSiret",
    "clientTva",
    "clientParrain",
    "clientOffre",
    "clientDeliveryAddress",
  ].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", markContractAsDirty);
    document.getElementById(id)?.addEventListener("change", markContractAsDirty);
  });

  generateContractBtn?.addEventListener("click", async () => {
    const contractData = {
      raisonSociale: document.getElementById("clientRaisonSociale")?.value.trim() || "",
      dirigeant: document.getElementById("clientDirigeant")?.value.trim() || "",
      email: document.getElementById("clientEmail")?.value.trim() || "",
      telephone: document.getElementById("clientTelephone")?.value.trim() || "",
      telephone2: document.getElementById("clientTelephone2")?.value.trim() || "-",
      adresse: document.getElementById("clientAdresse")?.value.trim() || "",
      codePostal: document.getElementById("clientCodePostal")?.value.trim() || "",
      ville: document.getElementById("clientVille")?.value.trim() || "",
      siret: document.getElementById("clientSiret")?.value.trim() || "",
      tva: document.getElementById("clientTva")?.value.trim() || "",
      codeInterne: document.getElementById("clientCodeInterne")?.value.trim() || "",
      contractNumber: document.getElementById("clientContractNumber")?.value.trim() || "",
      parrain: document.getElementById("clientParrain")?.value.trim() || "",
      offre: document.getElementById("clientOffre")?.value.trim() || "",
      deliveryAddress: document.getElementById("clientDeliveryAddress")?.value.trim() || document.getElementById("clientAdresse")?.value.trim() || "",
      modePaiement: document.querySelector('input[name="clientModePaiement"]:checked')?.value || "prelevement",
      numeroCheque: document.getElementById("clientNumeroCheque")?.value.trim() || "",
      marque: document.getElementById("clientMarque")?.value.trim() || "RICOH",
      modele: document.getElementById("clientModele")?.value.trim() || "",
      numeroSerie: document.getElementById("clientNumeroSerie")?.value.trim() || "",
      compteurNB: document.getElementById("clientCompteurNB")?.value || "0",
      compteurCouleur: document.getElementById("clientCompteurCouleur")?.value || "0",
      responsableBoutique: document.getElementById("clientResponsableBoutique")?.value.trim() || "",
      telephoneResponsable: document.getElementById("clientTelephoneResponsable")?.value.trim() || "",
      horaires: collectHoraires("h"),
      tarifCopieNB: document.getElementById("clientTarifCopieNB")?.value || "",
      tarifCopieCouleur: document.getElementById("clientTarifCopieCouleur")?.value || "",
      tarifImpressionNB: document.getElementById("clientTarifImpressionNB")?.value || "",
      tarifImpressionCouleur: document.getElementById("clientTarifImpressionCouleur")?.value || "",
      tarifScan: document.getElementById("clientTarifScan")?.value || "",
      tarifFax: document.getElementById("clientTarifFax")?.value || "",
      iban: document.getElementById("clientIban")?.value.trim() || "",
      bic: document.getElementById("clientBic")?.value.trim() || "",
    };
    if (!contractData.raisonSociale || !contractData.dirigeant || !contractData.email || !contractData.telephone || !contractData.adresse || !contractData.codePostal || !contractData.ville || !contractData.siret || !contractData.tva || !contractData.offre) {
      window.alert("Merci de remplir les informations obligatoires avant de générer le contrat PDF.");
      return;
    }
    const previewBuilder = window.buildClientContractPreview;
    const preview = typeof previewBuilder === "function"
      ? previewBuilder(contractData)
      : "";
    if (clientContractPreview) clientContractPreview.value = preview;
    const pdfGenerator = window.generateClientContractPdf;
    const generated = typeof pdfGenerator === "function"
      ? await pdfGenerator(contractData)
      : false;
    if (!generated) {
      window.alert("Impossible de générer le PDF du contrat.");
      return;
    }
    isContractGenerated = true;
    if (saveClientBtn) saveClientBtn.disabled = false;
  });

  function getUsedClientNumbers() {
    const used = new Set();
    document.querySelectorAll("#clientsTableBody tr").forEach((row) => {
      const value = String(row.dataset.clientCodeInterne || "").trim().toUpperCase();
      if (/^C\d{5}$/.test(value)) used.add(value);
    });
    return used;
  }

  function getNextClientNumber() {
    const used = getUsedClientNumbers();
    const key = "erp-next-client-number";
    const saved = Number(localStorage.getItem(key) || "1");
    let candidate = Number.isFinite(saved) && saved > 0 ? saved : 1;
    while (used.has(`C${String(candidate).padStart(5, "0")}`)) {
      candidate += 1;
    }
    localStorage.setItem(key, String(candidate + 1));
    return `C${String(candidate).padStart(5, "0")}`;
  }

  function generateContractNumber(clientNumber) {
    const digits = String(clientNumber || "").replace(/\D/g, "").padStart(5, "0").slice(-5);
    const year = new Date().getFullYear();
    return `CTR-${year}-${digits}`;
  }

  function prepareNewClientIdentity() {
    const codeInput = document.getElementById("clientCodeInterne");
    const contractInput = document.getElementById("clientContractNumber");
    if (!codeInput || !contractInput) return;
    const clientNumber = getNextClientNumber();
    codeInput.value = clientNumber;
    contractInput.value = generateContractNumber(clientNumber);
  }

  saveClientBtn?.addEventListener("click", () => {
    const raisonSociale = document.getElementById("clientRaisonSociale")?.value.trim() || "";
    const dirigeant = document.getElementById("clientDirigeant")?.value.trim() || "";
    const email = document.getElementById("clientEmail")?.value.trim() || "";
    const telephone = document.getElementById("clientTelephone")?.value.trim() || "";
    const adresse = document.getElementById("clientAdresse")?.value.trim() || "";
    const codePostal = document.getElementById("clientCodePostal")?.value.trim() || "";
    const ville = document.getElementById("clientVille")?.value.trim() || "";
    const siret = document.getElementById("clientSiret")?.value.trim() || "";
    const tva = document.getElementById("clientTva")?.value.trim() || "";
    const codeInterne = document.getElementById("clientCodeInterne")?.value.trim() || getNextClientNumber();
    const contractNumber = document.getElementById("clientContractNumber")?.value.trim() || generateContractNumber(codeInterne);
    const telephone2 = document.getElementById("clientTelephone2")?.value.trim() || "";
    const parrain = document.getElementById("clientParrain")?.value.trim() || "";
    const offre = document.getElementById("clientOffre")?.value.trim() || "";
    const deliveryAddress = document.getElementById("clientDeliveryAddress")?.value.trim() || adresse;
    const uploadRibName = document.getElementById("uploadRib")?.files?.[0]?.name || "";
    const uploadIdentityName = document.getElementById("uploadIdentity")?.files?.[0]?.name || "";
    const uploadKbisName = document.getElementById("uploadKbis")?.files?.[0]?.name || "";
    const uploadOtherName = document.getElementById("uploadOther")?.files?.[0]?.name || "";
    const modePaiement = document.querySelector('input[name="clientModePaiement"]:checked')?.value || "prelevement";
    const numeroCheque = document.getElementById("clientNumeroCheque")?.value.trim() || "";
    const marque = document.getElementById("clientMarque")?.value.trim() || "RICOH";
    const modele = document.getElementById("clientModele")?.value.trim() || "";
    const numeroSerie = document.getElementById("clientNumeroSerie")?.value.trim() || "";
    const compteurNB = document.getElementById("clientCompteurNB")?.value || "0";
    const compteurCouleur = document.getElementById("clientCompteurCouleur")?.value || "0";
    const responsableBoutique = document.getElementById("clientResponsableBoutique")?.value.trim() || "";
    const telephoneResponsable = document.getElementById("clientTelephoneResponsable")?.value.trim() || "";
    const horaires = collectHoraires("h");
    const tarifCopieNB = document.getElementById("clientTarifCopieNB")?.value || "";
    const tarifCopieCouleur = document.getElementById("clientTarifCopieCouleur")?.value || "";
    const tarifImpressionNB = document.getElementById("clientTarifImpressionNB")?.value || "";
    const tarifImpressionCouleur = document.getElementById("clientTarifImpressionCouleur")?.value || "";
    const tarifScan = document.getElementById("clientTarifScan")?.value || "";
    const tarifFax = document.getElementById("clientTarifFax")?.value || "";
    const iban = document.getElementById("clientIban")?.value.trim() || "";
    const bic = document.getElementById("clientBic")?.value.trim() || "";
    if (!isContractGenerated) {
      window.alert("Merci de générer le contrat avant d'enregistrer le client.");
      return;
    }
    if (!raisonSociale || !dirigeant || !email || !telephone || !adresse || !codePostal || !ville || !siret || !tva || !offre) {
      window.alert("Merci de remplir les informations obligatoires du client.");
      return;
    }
    if (clientsTableBody) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${raisonSociale}</td>
        <td>${dirigeant}</td>
        <td>${email}</td>
        <td>${telephone}</td>
        <td>${adresse}, ${codePostal} ${ville}</td>
        <td class="text-muted">-</td>
      `;
      setClientRowDataset(row, {
        raisonSociale, dirigeant, email, telephone, telephone2, adresse, codePostal, ville, siret, tva, codeInterne, contractNumber, parrain, offre, deliveryAddress,
        uploadRibName, uploadIdentityName, uploadKbisName, uploadOtherName,
        modePaiement, numeroCheque, marque, modele, numeroSerie, compteurNB, compteurCouleur,
        responsableBoutique, telephoneResponsable, horaires,
        tarifCopieNB, tarifCopieCouleur, tarifImpressionNB, tarifImpressionCouleur, tarifScan, tarifFax,
        iban, bic,
      });
      clientsTableBody.prepend(row);
      initBootstrapTooltips(row);
    }
    document.getElementById("addClientForm")?.reset();
    const contractInput = document.getElementById("clientContractNumber");
    if (contractInput) contractInput.value = "";
    if (clientContractPreview) clientContractPreview.value = "";
    isContractGenerated = false;
    if (saveClientBtn) saveClientBtn.disabled = true;
    if (sameDeliveryAddress) sameDeliveryAddress.checked = true;
    syncDeliveryAddress();
    addClientModal?.hide();
    bindClientRows();
    applyClientsFilter();
  });

  saveEditClientBtn?.addEventListener("click", () => {
    if (!activeClientRow) return;
    const data = {
      raisonSociale: document.getElementById("editClientRaisonSociale")?.value.trim() || "",
      dirigeant: document.getElementById("editClientDirigeant")?.value.trim() || "",
      email: document.getElementById("editClientEmail")?.value.trim() || "",
      telephone: document.getElementById("editClientTelephone")?.value.trim() || "",
      telephone2: document.getElementById("editClientTelephone2")?.value.trim() || "",
      adresse: document.getElementById("editClientAdresse")?.value.trim() || "",
      codePostal: document.getElementById("editClientCodePostal")?.value.trim() || "",
      ville: document.getElementById("editClientVille")?.value.trim() || "",
      siret: document.getElementById("editClientSiret")?.value.trim() || "",
      tva: document.getElementById("editClientTva")?.value.trim() || "",
      codeInterne: document.getElementById("editClientCodeInterne")?.value.trim() || "",
      contractNumber: document.getElementById("editClientContractNumber")?.value.trim() || "",
      parrain: document.getElementById("editClientParrain")?.value.trim() || "",
      offre: document.getElementById("editClientOffre")?.value.trim() || "",
      deliveryAddress: document.getElementById("editClientDeliveryAddress")?.value.trim() || "",
      uploadRibName: document.getElementById("editUploadRibName")?.value.trim() || "",
      uploadIdentityName: document.getElementById("editUploadIdentityName")?.value.trim() || "",
      uploadKbisName: document.getElementById("editUploadKbisName")?.value.trim() || "",
      uploadOtherName: document.getElementById("editUploadOtherName")?.value.trim() || "",
      modePaiement: document.querySelector('input[name="editClientModePaiement"]:checked')?.value || "prelevement",
      numeroCheque: document.getElementById("editClientNumeroCheque")?.value.trim() || "",
      marque: document.getElementById("editClientMarque")?.value.trim() || "RICOH",
      modele: document.getElementById("editClientModele")?.value.trim() || "",
      numeroSerie: document.getElementById("editClientNumeroSerie")?.value.trim() || "",
      compteurNB: document.getElementById("editClientCompteurNB")?.value || "0",
      compteurCouleur: document.getElementById("editClientCompteurCouleur")?.value || "0",
      responsableBoutique: document.getElementById("editClientResponsableBoutique")?.value.trim() || "",
      telephoneResponsable: document.getElementById("editClientTelephoneResponsable")?.value.trim() || "",
      horaires: collectHoraires("editH"),
      tarifCopieNB: document.getElementById("editClientTarifCopieNB")?.value || "",
      tarifCopieCouleur: document.getElementById("editClientTarifCopieCouleur")?.value || "",
      tarifImpressionNB: document.getElementById("editClientTarifImpressionNB")?.value || "",
      tarifImpressionCouleur: document.getElementById("editClientTarifImpressionCouleur")?.value || "",
      tarifScan: document.getElementById("editClientTarifScan")?.value || "",
      tarifFax: document.getElementById("editClientTarifFax")?.value || "",
      iban: document.getElementById("editClientIban")?.value.trim() || "",
      bic: document.getElementById("editClientBic")?.value.trim() || "",
    };
    const newRib = document.getElementById("editUploadRib")?.files?.[0]?.name;
    const newIdentity = document.getElementById("editUploadIdentity")?.files?.[0]?.name;
    const newKbis = document.getElementById("editUploadKbis")?.files?.[0]?.name;
    const newOther = document.getElementById("editUploadOther")?.files?.[0]?.name;
    if (newRib) data.uploadRibName = newRib;
    if (newIdentity) data.uploadIdentityName = newIdentity;
    if (newKbis) data.uploadKbisName = newKbis;
    if (newOther) data.uploadOtherName = newOther;
    if (!data.raisonSociale || !data.dirigeant || !data.email || !data.telephone || !data.adresse || !data.codePostal || !data.ville) {
      window.alert("Merci de remplir les informations principales du client.");
      return;
    }
    activeClientRow.children[0].textContent = data.raisonSociale;
    activeClientRow.children[1].textContent = data.dirigeant;
    activeClientRow.children[2].textContent = data.email;
    activeClientRow.children[3].textContent = data.telephone;
    activeClientRow.children[4].textContent = `${data.adresse}, ${data.codePostal} ${data.ville}`;
    setClientRowDataset(activeClientRow, data);
    editClientModal?.hide();
    applyClientsFilter();
  });

  bindClientRows();

  function fillList(targetId, value) {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.innerHTML = "";
    value.split("|").filter(Boolean).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      target.appendChild(li);
    });
    setupShowMore(targetId);
  }

  function renderPhotocopieurs(value) {
    const target = document.getElementById("detailPhotocopieurs");
    if (!target) return;
    target.innerHTML = "";
    target.className = "photocopier-list";

    value.split("|").filter(Boolean).forEach((item) => {
      const [name, ip, mac, serial, counterBw, counterColor, tonerLevel, staleDays] = item.split(";;");
      const wrapper = document.createElement("div");
      wrapper.className = "photocopier-item";

      const days = Number(staleDays || 0);
      const alertHtml = days >= 4
        ? `<div class="photocopier-alert"><span class="badge text-bg-danger">Alerte compteur non recu depuis ${days} jours</span></div>`
        : `<div class="photocopier-alert"><span class="badge text-bg-success">Compteur recu il y a ${days} jour(s)</span></div>`;
      const tonerBars = (tonerLevel || "").split(",").map((entry) => {
        const part = entry.trim();
        if (!part) return "";
        const [label, percentText] = part.split(" ");
        const percent = Number((percentText || "0").replace("%", ""));
        const colorMap = {
          "Noir": "#111827",
          "Cyan": "#06b6d4",
          "Magenta": "#d946ef",
          "Jaune": "#facc15",
        };
        const barColor = colorMap[label] || "#6b7280";
        return `
          <div class="toner-item">
            <div class="toner-label-row">
              <span>${label}</span>
              <span>${percent}%</span>
            </div>
            <div class="toner-bar">
              <div class="toner-bar-fill" style="width: ${percent}%; background: ${barColor};"></div>
            </div>
          </div>
        `;
      }).join("");

      wrapper.innerHTML = `
        <p><strong>${name || ""}</strong></p>
        <p>IP : ${ip || "-"}</p>
        <p>MAC : ${mac || "-"}</p>
        <p>N° serie : ${serial || "-"}</p>
        <p>Compteur noir et blanc : ${counterBw || "-"}</p>
        <p>Compteur couleur : ${counterColor || "-"}</p>
        <div class="toner-group">
          <p class="mb-2">Niveau toner</p>
          ${tonerBars || "<p>-</p>"}
        </div>
        ${alertHtml}
      `;
      target.appendChild(wrapper);
    });
  }

  function prependListItem(targetId, value) {
    const target = document.getElementById(targetId);
    if (!target || !value) return;
    const li = document.createElement("li");
    li.textContent = value;
    target.prepend(li);
    setupShowMore(targetId);
  }

  function setupShowMore(targetId) {
    const list = document.getElementById(targetId);
    const buttonMap = {
      detailCalls: "toggleCallsBtn",
      detailSav: "toggleSavBtn",
      detailLivraisons: "toggleLivraisonsBtn",
    };
    const button = document.getElementById(buttonMap[targetId]);
    if (!list || !button) return;

    const items = Array.from(list.querySelectorAll("li"));
    const shouldCollapse = items.length > 1;

    items.forEach((item, index) => {
      item.classList.toggle("is-hidden", shouldCollapse && index >= 1);
    });

    button.classList.toggle("d-none", !shouldCollapse);
    button.textContent = "Voir plus";
  }

  function generateSavNumber() {
    const today = new Date();
    const year = String(today.getFullYear());
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const prefix = `SAV${year}${month}${day}`;
    let highest = 0;

    document.querySelectorAll(".client-trigger").forEach((button) => {
      (button.dataset.clientSav || "").split("|").filter(Boolean).forEach((entry) => {
        const match = entry.match(/^SAV\d{8}(\d{3})/);
        if (match && entry.startsWith(prefix)) {
          highest = Math.max(highest, Number(match[1]));
        }
      });
    });

    return `${prefix}${String(highest + 1).padStart(3, "0")}`;
  }

  document.querySelectorAll(".client-trigger").forEach((button) => {
    button.addEventListener("click", () => {
      activeClientButton = button;
      document.getElementById("detailClientName").textContent = button.dataset.clientName || "";
      document.getElementById("detailClientEmail").textContent = button.dataset.clientEmail || "";
      document.getElementById("detailClientLastName").textContent = button.dataset.clientLastname || "";
      document.getElementById("detailClientFirstName").textContent = button.dataset.clientFirstname || "";
      document.getElementById("detailClientManager").textContent = button.dataset.clientManager || "";
      document.getElementById("detailClientPhone").textContent = button.dataset.clientPhone || "";
      document.getElementById("detailClientPhone2").textContent = button.dataset.clientPhone2 || "";
      document.getElementById("detailClientCity").textContent = button.dataset.clientCity || "";
      document.getElementById("detailClientAddress").textContent = button.dataset.clientAddress || "";
      document.getElementById("detailClientWeekHours").innerHTML = (button.dataset.clientHours || "")
        .split("|")
        .filter(Boolean)
        .map((line) => {
          const [day, hours] = line.split(": ");
          return `<div class="week-hours-item"><span class="week-hours-day">${day}</span><span>${hours || ""}</span></div>`;
        })
        .join("");
      document.getElementById("detailClientRib").textContent = button.dataset.clientRib || "";
      document.getElementById("detailClientLastPayment").textContent = button.dataset.clientLastPayment || "";
      document.getElementById("detailClientInvoice").textContent = button.dataset.clientInvoice || "";
      document.getElementById("detailClientUnpaidInvoice").textContent = button.dataset.clientUnpaid || "";

      renderPhotocopieurs(button.dataset.clientPhotocopieurs || "");
      fillList("detailCalls", button.dataset.clientCalls || "");
      fillList("detailSav", button.dataset.clientSav || "");
      fillList("detailLivraisons", button.dataset.clientLivraison || "");

      clientsModal?.hide();
      detailModal?.show();
    });
  });

  clientSearchInput?.addEventListener("input", filterClients);
  clientsModalElement?.addEventListener("shown.bs.modal", () => {
    if (clientSearchInput) {
      clientSearchInput.value = "";
      filterClients();
      clientSearchInput.focus();
    }
  });

  if (consumptionFilter && consumptionSvg) {
    renderConsumptionChart(consumptionFilter.value || "month");
    consumptionSvg.addEventListener("mouseleave", hideChartTooltip);
    consumptionFilter.addEventListener("change", () => {
      hideChartTooltip();
      renderConsumptionChart(consumptionFilter.value);
    });
  }

  if (paymentsFilter) {
    renderPayments(paymentsFilter.value || "month");
    paymentsFilter.addEventListener("change", () => {
      renderPayments(paymentsFilter.value);
    });
  }

  document.getElementById("openCallModalBtn")?.addEventListener("click", () => {
    if (!activeClientButton || !callFormModal) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    document.getElementById("callClient").value = activeClientButton.dataset.clientName || "";
    document.getElementById("callReason").value = "";
    document.getElementById("callTime").value = time;
    document.getElementById("callAnsweredBy").value = "";
    document.getElementById("callComment").value = "";
    callFormModal.show();
  });

  document.getElementById("saveCallBtn")?.addEventListener("click", () => {
    const client = document.getElementById("callClient").value.trim();
    const reason = document.getElementById("callReason").value.trim();
    const time = document.getElementById("callTime").value.trim();
    const answeredBy = document.getElementById("callAnsweredBy").value;
    const comment = document.getElementById("callComment").value.trim();
    if (!activeClientButton || !client || !reason || !time || !answeredBy) {
      window.alert("Merci de remplir les informations de l'appel.");
      return;
    }
    const now = new Date();
    const date = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    const commentPart = comment ? ` - Commentaire: ${comment}` : "";
    const value = `${date} ${time} - ${client} - ${reason} - Répondu par ${answeredBy}${commentPart}`;
    const current = activeClientButton.dataset.clientCalls || "";
    activeClientButton.dataset.clientCalls = value + (current ? `|${current}` : "");
    prependListItem("detailCalls", value);
    callFormModal?.hide();
  });

  document.querySelectorAll(".toggle-more").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.target;
      const sourceList = document.getElementById(targetId);
      const modalTitle = document.getElementById("historyListModalLabel");
      const modalContent = document.getElementById("historyListContent");
      const titleMap = {
        detailCalls: "Tous les appels telephoniques",
        detailSav: "Tous les SAV",
        detailLivraisons: "Toutes les livraisons",
      };

      if (!sourceList || !modalContent || !modalTitle) return;

      modalTitle.textContent = titleMap[targetId] || "Historique complet";
      modalContent.innerHTML = "";
      sourceList.querySelectorAll("li").forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item.textContent;
        modalContent.appendChild(li);
      });

      historyListModal?.show();
    });
  });

  document.getElementById("openSavModalBtn")?.addEventListener("click", () => {
    if (!activeClientButton || !savFormModal) return;
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("savGeneratedNumber").value = generateSavNumber();
    document.getElementById("savTechnician").value = "";
    document.getElementById("savPlannedDate").value = "";
    document.getElementById("savOpenedDate").value = today;
    document.getElementById("savProblem").value = "";
    document.getElementById("savLevel").value = "";
    document.getElementById("savStatus").value = "En attente";
    document.getElementById("savComment").value = "";
    savFormModal.show();
  });

  document.getElementById("saveSavBtn")?.addEventListener("click", () => {
    const savNumber = document.getElementById("savGeneratedNumber").value.trim();
    const technician = document.getElementById("savTechnician").value;
    const plannedDate = document.getElementById("savPlannedDate").value;
    const openedDate = document.getElementById("savOpenedDate").value;
    const problem = document.getElementById("savProblem").value;
    const priority = document.getElementById("savLevel").value;
    const status = document.getElementById("savStatus").value;
    const comment = document.getElementById("savComment").value.trim();

    if (!activeClientButton || !savNumber || !technician || !plannedDate || !openedDate || !problem || !priority || !status) {
      window.alert("Merci de remplir toutes les informations du SAV.");
      return;
    }

    const formattedDate = plannedDate.split("-").reverse().join("/");
    const formattedOpenedDate = openedDate.split("-").reverse().join("/");
    const commentPart = comment ? ` - Commentaire: ${comment}` : "";
    const value = `${savNumber} - ${problem} - Priorité ${priority} - ${technician} - Statut ${status} - Ouvert le ${formattedOpenedDate} - Prévu le ${formattedDate}${commentPart}`;
    const current = activeClientButton.dataset.clientSav || "";
    activeClientButton.dataset.clientSav = value + (current ? `|${current}` : "");
    prependListItem("detailSav", value);
    savFormModal?.hide();
  });

  document.getElementById("openLivraisonModalBtn")?.addEventListener("click", () => {
    if (!activeClientButton || !livraisonFormModal) return;
    document.getElementById("livraisonProduct").value = "";
    document.getElementById("livraisonQuantity").value = "";
    document.getElementById("livraisonDriver").value = "";
    document.getElementById("livraisonPlannedDate").value = "";
    document.getElementById("livraisonSlot").value = "";
    document.getElementById("livraisonComment").value = "";
    document.getElementById("livraisonStockInfo").textContent = "Stock disponible : -";
    livraisonFormModal.show();
  });

  document.getElementById("livraisonProduct")?.addEventListener("change", (event) => {
    const selected = event.target.selectedOptions[0];
    const stock = selected?.dataset.stock || "-";
    document.getElementById("livraisonStockInfo").textContent = `Stock disponible : ${stock}`;
  });

  document.getElementById("saveLivraisonBtn")?.addEventListener("click", () => {
    const product = document.getElementById("livraisonProduct").value;
    const quantity = Number(document.getElementById("livraisonQuantity").value);
    const driver = document.getElementById("livraisonDriver").value;
    const plannedDate = document.getElementById("livraisonPlannedDate").value;
    const slot = document.getElementById("livraisonSlot").value;
    const comment = document.getElementById("livraisonComment").value.trim();
    const selected = document.getElementById("livraisonProduct").selectedOptions[0];
    const stock = Number(selected?.dataset.stock || 0);

    if (!activeClientButton || !product || !quantity || !driver || !plannedDate || !slot) {
      window.alert("Merci de remplir les informations de livraison.");
      return;
    }

    if (quantity > stock) {
      window.alert(`Stock insuffisant pour ${product}. Disponible : ${stock}.`);
      return;
    }

    const formattedDate = plannedDate.split("-").reverse().join("/");
    const commentPart = comment ? ` - Commentaire: ${comment}` : "";
    const value = `${product} x${quantity} - Livreur ${driver} - Livraison prévue ${formattedDate} - Créneau ${slot}${commentPart}`;
    const current = activeClientButton.dataset.clientLivraison || "";
    activeClientButton.dataset.clientLivraison = value + (current ? `|${current}` : "");
    prependListItem("detailLivraisons", value);
    livraisonFormModal?.hide();
  });

  const chatForm = document.getElementById("chatForm");
  const chatMessages = document.getElementById("chatMessages");
  const chatMessageInput = document.getElementById("chatMessageInput");
  const chatAuthor = document.getElementById("chatAuthor");
  const chatImageInput = document.getElementById("chatImageInput");
  const chatImagePreview = document.getElementById("chatImagePreview");
  const chatClearImage = document.getElementById("chatClearImage");
  const chatMentionSuggestions = document.getElementById("chatMentionSuggestions");
  const chatMemberCount = document.getElementById("chatMemberCount");

  if (chatForm && chatMessages && chatMessageInput && chatAuthor && chatImageInput && chatImagePreview && chatClearImage && chatMentionSuggestions) {
    let selectedImageData = "";
    const members = [
      "Romain Lefevre",
      "Camille Dupont",
      "Yanis Touati",
      "Sarah Benali",
      "Thomas Garcia",
      "Julie Martin",
      "Amine B.",
      "Karim T.",
    ];
    const currentUser = () => chatAuthor.value.trim();
    chatMemberCount.textContent = `${members.length} membres`;

    const initialMessages = [
      { author: "Camille Dupont", text: "Bonjour equipe, le SAV de Gamma Industrie est en cours.", time: "09:20", mine: false },
      { author: "Romain Lefevre", text: "Top. @Camille Dupont tiens-nous au courant apres intervention.", time: "09:24", mine: true },
      { author: "Sarah Benali", text: "Je peux prendre la suite sur le ticket suivant.", time: "09:31", mine: false },
    ];

    function escapeHtml(value) {
      return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function renderMentions(text) {
      return escapeHtml(text).replace(/@([A-Za-zÀ-ÖØ-öø-ÿ.\- ]{2,40})/g, (match) => {
        return `<span class="chat-mention">${match.trim()}</span>`;
      });
    }

    function getTimeNow() {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    }

    function addChatMessage({ author, text, time, mine, image }) {
      const row = document.createElement("div");
      row.className = `chat-msg${mine ? " mine" : ""}`;
      const safeAuthor = escapeHtml(author);
      const imageBlock = image ? `<img src="${image}" alt="Photo envoyee" class="chat-msg-image">` : "";
      row.innerHTML = `
        <article class="chat-bubble">
          <div class="chat-msg-header">
            <span class="chat-msg-author">${safeAuthor}</span>
            <span class="chat-msg-time">${time}</span>
          </div>
          ${text ? `<p class="chat-msg-text">${renderMentions(text)}</p>` : ""}
          ${imageBlock}
        </article>
      `;
      chatMessages.appendChild(row);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatMessages.innerHTML = `<div class="text-center"><span class="chat-day-label">Aujourd'hui</span></div>`;
    initialMessages.forEach(addChatMessage);

    function resetImage() {
      selectedImageData = "";
      chatImageInput.value = "";
      chatImagePreview.classList.add("d-none");
      chatImagePreview.innerHTML = "";
      chatClearImage.classList.add("d-none");
    }

    function closeSuggestions() {
      chatMentionSuggestions.classList.add("d-none");
      chatMentionSuggestions.innerHTML = "";
    }

    function showMentionSuggestions() {
      const inputValue = chatMessageInput.value;
      const cursorPos = chatMessageInput.selectionStart || 0;
      const beforeCursor = inputValue.slice(0, cursorPos);
      const match = beforeCursor.match(/@([A-Za-zÀ-ÖØ-öø-ÿ.\- ]*)$/);
      if (!match) {
        closeSuggestions();
        return;
      }
      const query = match[1].trim().toLowerCase();
      const filtered = members.filter((member) => member.toLowerCase().includes(query)).slice(0, 6);
      if (!filtered.length) {
        closeSuggestions();
        return;
      }

      chatMentionSuggestions.innerHTML = "";
      filtered.forEach((member) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "chat-mention-item";
        button.textContent = `@${member}`;
        button.addEventListener("click", () => {
          const start = cursorPos - match[0].length;
          const newValue = `${inputValue.slice(0, start)}@${member} ${inputValue.slice(cursorPos)}`;
          chatMessageInput.value = newValue;
          chatMessageInput.focus();
          const newCursor = start + member.length + 2;
          chatMessageInput.setSelectionRange(newCursor, newCursor);
          closeSuggestions();
        });
        chatMentionSuggestions.appendChild(button);
      });
      chatMentionSuggestions.classList.remove("d-none");
    }

    chatMessageInput.addEventListener("input", showMentionSuggestions);
    chatMessageInput.addEventListener("click", showMentionSuggestions);
    chatMessageInput.addEventListener("blur", () => {
      setTimeout(closeSuggestions, 120);
    });

    chatImageInput.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        resetImage();
        return;
      }
      if (!file.type.startsWith("image/")) {
        window.alert("Selectionnez uniquement une image.");
        resetImage();
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        selectedImageData = String(reader.result || "");
        chatImagePreview.innerHTML = `<img src="${selectedImageData}" alt="Apercu de la photo">`;
        chatImagePreview.classList.remove("d-none");
        chatClearImage.classList.remove("d-none");
      };
      reader.readAsDataURL(file);
    });

    chatClearImage.addEventListener("click", resetImage);

    chatForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = chatMessageInput.value.trim();
      if (!text && !selectedImageData) {
        window.alert("Ajoutez un message ou une photo.");
        return;
      }
      addChatMessage({
        author: currentUser(),
        text,
        time: getTimeNow(),
        mine: true,
        image: selectedImageData || "",
      });
      chatMessageInput.value = "";
      resetImage();
      closeSuggestions();
    });
  }

  const clientsMapElement = document.getElementById("clientsMap");
  const mapClientList = document.getElementById("mapClientList");
  const mapClientSearch = document.getElementById("mapClientSearch");
  const mapClientCount = document.getElementById("mapClientCount");
  const mapDateFilter = document.getElementById("mapDateFilter");
  const mapTypeFilter = document.getElementById("mapTypeFilter");
  const generateRouteBtn = document.getElementById("generateRouteBtn");
  const clearRouteBtn = document.getElementById("clearRouteBtn");
  const routeSummary = document.getElementById("routeSummary");
  const routeStops = document.getElementById("routeStops");

  if (
    clientsMapElement &&
    mapClientList &&
    mapClientSearch &&
    mapClientCount &&
    mapDateFilter &&
    mapTypeFilter &&
    generateRouteBtn &&
    clearRouteBtn &&
    routeSummary &&
    routeStops &&
    typeof L !== "undefined"
  ) {
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const clients = [
      { name: "Alpha Bureau", city: "Paris", address: "18 rue Lafayette, 75009 Paris", lat: 48.8764, lng: 2.3376 },
      { name: "Beta Conseil", city: "Lyon", address: "42 avenue Foch, 69006 Lyon", lat: 45.7719, lng: 4.8525 },
      { name: "Gamma Industrie", city: "Lille", address: "7 zone industrielle Nord, 59000 Lille", lat: 50.6472, lng: 3.0753 },
      { name: "Delta Immo", city: "Bordeaux", address: "12 quai des Chartrons, 33000 Bordeaux", lat: 44.8565, lng: -0.5657 },
      { name: "Epsilon RH", city: "Marseille", address: "25 boulevard Michelet, 13008 Marseille", lat: 43.2698, lng: 5.3959 },
      { name: "Zeta Santé", city: "Nantes", address: "3 rue de la Santé, 44000 Nantes", lat: 47.2168, lng: -1.5534 },
      { name: "Nova Legal", city: "Strasbourg", address: "8 place Broglie, 67000 Strasbourg", lat: 48.5866, lng: 7.7465 },
      { name: "Orion Tech", city: "Montpellier", address: "55 rue de la République, 34000 Montpellier", lat: 43.6095, lng: 3.8767 },
    ];

    const interventions = [
      { client: "Gamma Industrie", type: "sav", date: todayIso, label: "SAV - Tete d'impression HS", hour: "09:00" },
      { client: "Beta Conseil", type: "sav", date: todayIso, label: "SAV - Calibration couleur", hour: "10:30" },
      { client: "Orion Tech", type: "livraison", date: todayIso, label: "Livraison - Papier A4 x12", hour: "11:00" },
      { client: "Epsilon RH", type: "livraison", date: todayIso, label: "Livraison - Toner noir x4", hour: "14:00" },
      { client: "Delta Immo", type: "sav", date: todayIso, label: "SAV - Controle final", hour: "16:30" },
      { client: "Alpha Bureau", type: "livraison", date: "2026-04-17", label: "Livraison - Kit maintenance", hour: "09:45" },
      { client: "Nova Legal", type: "sav", date: "2026-04-17", label: "SAV - Module fax", hour: "11:15" },
    ];

    const typeLabel = { sav: "SAV", livraison: "Livraison" };
    const map = L.map(clientsMapElement).setView([46.7, 2.3], 5.8);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const markerLayer = L.layerGroup().addTo(map);
    let routeLayer = null;
    mapDateFilter.value = todayIso;

    function getFilteredInterventions() {
      const query = mapClientSearch.value.trim().toLowerCase();
      const selectedDate = mapDateFilter.value;
      const selectedType = mapTypeFilter.value;
      return interventions
        .filter((item) => {
          if (selectedDate && item.date !== selectedDate) return false;
          if (selectedType !== "all" && item.type !== selectedType) return false;
          const client = clients.find((entry) => entry.name === item.client);
          if (!client) return false;
          const searchable = `${client.name} ${client.city} ${client.address} ${item.label}`.toLowerCase();
          return !query || searchable.includes(query);
        })
        .map((item) => {
          const client = clients.find((entry) => entry.name === item.client);
          return { ...item, ...client };
        })
        .sort((a, b) => a.hour.localeCompare(b.hour));
    }

    function clearRoute() {
      if (routeLayer) {
        map.removeLayer(routeLayer);
        routeLayer = null;
      }
      routeSummary.textContent = "";
      routeStops.innerHTML = "";
    }

    function renderMapAndList() {
      clearRoute();
      markerLayer.clearLayers();
      const visible = getFilteredInterventions();
      mapClientList.innerHTML = "";

      visible.forEach((entry) => {
        const markerColor = entry.type === "sav" ? "red" : "blue";
        const icon = L.divIcon({
          className: "custom-marker",
          html: `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${markerColor};border:2px solid #fff;box-shadow:0 0 0 1px #64748b;"></span>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        const marker = L.marker([entry.lat, entry.lng], { icon }).addTo(markerLayer).bindPopup(`
          <strong>${entry.name}</strong><br>
          ${typeLabel[entry.type]} - ${entry.hour}<br>
          ${entry.label}<br>
          <small>${entry.address}</small>
        `);

        const item = document.createElement("button");
        item.type = "button";
        item.className = "map-client-item";
        item.innerHTML = `<strong>${entry.name}</strong><small>${typeLabel[entry.type]} - ${entry.hour} - ${entry.city}</small>`;
        item.addEventListener("click", () => {
          map.setView([entry.lat, entry.lng], 12);
          marker.openPopup();
        });
        mapClientList.appendChild(item);
      });

      mapClientCount.textContent = `${visible.length} intervention${visible.length > 1 ? "s" : ""}`;
      if (!visible.length) {
        mapClientList.innerHTML = `<div class="p-3 small text-muted">Aucune intervention pour ce filtre.</div>`;
      } else {
        const bounds = L.latLngBounds(visible.map((entry) => [entry.lat, entry.lng]));
        map.fitBounds(bounds.pad(0.2));
      }
    }

    function generateRoute() {
      clearRoute();
      const stops = getFilteredInterventions();
      if (!stops.length) {
        routeSummary.textContent = "Aucune intervention pour generer un trajet.";
        return;
      }

      const ordered = [...stops];
      for (let i = 1; i < ordered.length; i += 1) {
        let nearestIndex = i;
        let nearestDistance = Number.POSITIVE_INFINITY;
        for (let j = i; j < ordered.length; j += 1) {
          const dx = ordered[i - 1].lat - ordered[j].lat;
          const dy = ordered[i - 1].lng - ordered[j].lng;
          const distance = Math.sqrt((dx * dx) + (dy * dy));
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = j;
          }
        }
        if (nearestIndex !== i) {
          const tmp = ordered[i];
          ordered[i] = ordered[nearestIndex];
          ordered[nearestIndex] = tmp;
        }
      }

      routeLayer = L.polyline(
        ordered.map((item) => [item.lat, item.lng]),
        { color: "#0d6efd", weight: 4, opacity: 0.75, dashArray: "8 6" },
      ).addTo(map);

      routeSummary.textContent = `Itineraire genere (${ordered.length} arret${ordered.length > 1 ? "s" : ""})`;
      routeStops.innerHTML = "";
      ordered.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${item.name} - ${typeLabel[item.type]} (${item.hour})`;
        routeStops.appendChild(li);
      });

      map.fitBounds(routeLayer.getBounds().pad(0.2));
    }

    renderMapAndList();
    mapClientSearch.addEventListener("input", renderMapAndList);
    mapDateFilter.addEventListener("change", renderMapAndList);
    mapTypeFilter.addEventListener("change", renderMapAndList);
    generateRouteBtn.addEventListener("click", generateRoute);
    clearRouteBtn.addEventListener("click", clearRoute);
  }
});
