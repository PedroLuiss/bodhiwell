(function () {
  const data = window.BODHI_DATA || {};
  const meta = window.BODHI_SPECIALTY_META || {};

  const bwContainer = document.getElementById("bwContainer");
  const bwCenter = document.getElementById("bwCenter");
  const bwRight = document.getElementById("bwRight");
  const svgWrap = document.getElementById("svgWrap");

  const flowerVideo = document.getElementById("flowerVideo");
  const flowerFallback = document.getElementById("flowerFallback"); // ✅ NUEVO

  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  const stageTitle = document.getElementById("stageTitle");
  const stageSub = document.getElementById("stageSub");

  const panelTitle = document.getElementById("panelTitle");
  const panelHint = document.getElementById("panelHint");

  const tagsWrap = document.getElementById("tagsWrap");
  const resultsWrap = document.getElementById("resultsWrap");
  const moreBtn = document.getElementById("moreBtn");

  let selectedDim = null;

  // Selecciones
  let selectedSpecialty = null;       // click del usuario
  let suggestedTop = [];              // top 2 sugeridas
  let suggestedOthers = [];           // otros matches (para subir y mostrar si hay espacio)

  const VISIBLE_BASE = 8;
  const MAX_EXTRA_MATCHES = 10;

  const idToDim = {
    "petalo-cuerpo": "cuerpo",
    "petalo-mente": "mente",
    "petalo-energia": "energia",
    "petalo-conciencia": "conciencia",
  };

  const dimLabel = {
    cuerpo: "Cuerpo",
    mente: "Mente",
    energia: "Energía",
    conciencia: "Conciencia",
  };

  // ---------------------------------------------------------------------------
  // Intenciones
  // ---------------------------------------------------------------------------
  const intentMap = {
    ansiedad: ["ansiedad", "angustia", "nervios", "panico", "pánico", "ataque", "miedo"],
    estres: ["estrés", "estres", "burnout", "agotamiento", "tension", "tensión", "sobrecarga"],
    sueno: ["insomnio", "sueño", "sueno", "dormir", "desvelo", "descanso", "no duermo"],
    depresion: [
      "depresion", "depresión",
      "tristeza", "animo bajo", "ánimo bajo",
      "apatia", "apatía",
      "desmotivacion", "desmotivación",
      "sin ganas", "anhedonia", "anhedonía"
    ],
    piel: [
      "piel", "erupcion", "erupción", "sarpullido", "ronchas", "urticaria",
      "dermatitis", "eczema", "picazon", "picazón",
      "alergia", "alergias", "prurito", "irritacion", "irritación"
    ],
    dolor: ["dolor", "contractura", "migraña", "migrena", "lesión", "lesion"],
    digestion: ["digestión", "digestion", "intestino", "colon", "gases", "reflujo", "hinchazón", "hinchazon"],
    vitalidad: ["cansancio", "fatiga", "baja energia", "baja energía", "sin energia", "sin energía", "vitalidad"],
    proposito: ["propósito", "proposito", "sentido", "rumbo", "vocación", "vocacion", "direccion", "dirección"],
  };

  const intentToDim = {
    ansiedad: "mente",
    estres: "mente",
    sueno: "mente",
    depresion: "mente",
    piel: "cuerpo",
    dolor: "cuerpo",
    digestion: "cuerpo",
    vitalidad: "energia",
    proposito: "conciencia",
  };

  const dimKeywords = {
    cuerpo: ["dolor", "cuerpo", "movimiento", "lesion", "lesión", "digest", "fatiga", "inflam", "piel", "erupcion", "erupción", "ronchas", "urticaria", "dermatitis", "picazon", "picazón"],
    mente: ["ansiedad", "estres", "estrés", "insomnio", "miedo", "pensamientos", "emocion", "emoción", "depresion", "depresión", "tristeza", "apatia", "apatía"],
    energia: ["energia", "energía", "vitalidad", "armon", "equilibrio", "tension", "tensión"],
    conciencia: ["proposito", "propósito", "sentido", "claridad", "presencia", "evolucion", "evolución"],
  };

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalize(str) {
    return String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[®©™]/g, "")
      .replace(/[^\w\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeTight(str) {
    return normalize(str).replace(/[\s-]/g, "");
  }

  

  /* ==============================
     INTENTS v1 (Intención → Dimensión + Especialidades)
     “inteligente pero no pesado”
  ============================== */

  const BODHI_INTENTS = [
    // 🧠 MENTE
    { key:"autoestima_baja", dim:"mente", boost:["Psicología","Psicoterapia","Autoestima","Coaching"], patterns:[
      "no valgo", "no valgo nada", "no sirvo", "no soy suficiente", "me siento inutil", "me siento inútil",
      "baja autoestima", "autoestima", "me odio", "me siento menos", "soy un fracaso", "no puedo con esto"
    ]},
    { key:"ansiedad", dim:"mente", boost:["Gestión del estrés","Psicoterapia","Mindfulness","Psicología"], patterns:[
      "ansiedad","angustia","nervios","preocupacion","preocupación","inquietud","me cuesta respirar","tension","tensión"
    ]},
    { key:"panico", dim:"mente", boost:["Psicoterapia","Mindfulness","Hipnosis","Psicología"], patterns:[
      "ataque de panico","ataque de pánico","panico","pánico","palpitaciones","me falta el aire","terror","miedo intenso"
    ]},
    { key:"estres_burnout", dim:"mente", boost:["Gestión del estrés","Mindfulness","Coaching","Psicoterapia"], patterns:[
      "estres","estrés","burnout","agotamiento mental","colapsado","colapsada","sobrepasado","sobrepasada","saturado","saturada"
    ]},
    { key:"insomnio", dim:"mente", boost:["Mindfulness","Gestión del estrés","Hipnosis"], patterns:[
      "insomnio","no puedo dormir","me despierto", "sueño liviano","no descanso","me cuesta conciliar","me levanto cansado","me levanto cansada"
    ]},
    { key:"tristeza_depresiva", dim:"mente", boost:["Psicoterapia","Psicología"], patterns:[
      "depresion","depresión","tristeza","apatia","apatía","sin ganas","vacío","vacio","lloro mucho","me siento mal"
    ]},
    { key:"duelo", dim:"mente", boost:["Psicoterapia","Psicología","Mindfulness"], patterns:[
      "duelo","perdida","pérdida","fallecio","falleció","se murio","se murió","extraño mucho","no lo supero","no lo superó"
    ]},

    // 🩺 CUERPO
    { key:"dolor_espalda", dim:"cuerpo", boost:["Fisioterapia","Osteopatía","Kinesiología"], patterns:[
      "espalda","lumbalgia","ciatica","ciática","cervical","cervicalgia","postura"
    ]},
    { key:"digestivo", dim:"cuerpo", boost:["Medicina Funcional","Nutrición clínica","Medicina Integrativa"], patterns:[
      "digestion","digestión","hinchazon","hinchazón","gases","colon irritable","intestino","reflujo","acidez","constipacion","constipación","diarrea"
    ]},
    { key:"fatiga_fisica", dim:"cuerpo", boost:["Medicina Funcional","Medicina General","Nutrición clínica"], patterns:[
      "cansancio","fatiga","agotado","agotada","sin energia fisica","sin energía física","me pesa el cuerpo"
    ]},

    // ⚡ ENERGÍA
    { key:"baja_energia", dim:"energia", boost:["Reiki","Bioenergética","Qi Gong"], patterns:[
      "baja energia","baja energía","sin energia","sin energía","no tengo energia","no tengo energía","desbalance energetico","desbalance energético"
    ]},

    // 🌿 CONCIENCIA
    { key:"proposito_sentido", dim:"conciencia", boost:["Propósito de vida","Meditación","Evolución interior"], patterns:[
      "proposito","propósito","sentido","para que estoy","para qué estoy","no encuentro sentido","crisis existencial","existencial","no se quien soy"
    ]},
  ];

  function detectIntent(query) {
    const q = normalize(query);
    if (!q) return null;

    let best = null;
    let bestScore = 0;

    for (const intent of BODHI_INTENTS) {
      let score = 0;

      for (const p of (intent.patterns || [])) {
        const pn = normalize(p);
        if (!pn) continue;
        if (q.includes(pn)) score += pn.includes(" ") ? 6 : 3;
      }

      if (score > bestScore) {
        bestScore = score;
        best = intent;
      }
    }

    // Umbral mínimo para evitar falsos positivos
    if (best && bestScore >= 6) return best;
    return null;
  }

  function uniq(list) {
    const out = [];
    const seen = new Set();
    for (const x of (list || [])) {
      const k = normalizeTight(x);
      if (!k || seen.has(k)) continue;
      seen.add(k);
      out.push(x);
    }
    return out;
  }

  function tokenize(q) {
    const n = normalize(q);
    if (!n) return [];
    return n.split(" ").filter(Boolean);
  }

  const BODY_PART_TOKENS = new Set([
    "mano","manos","pie","pies","brazo","brazos","pierna","piernas","cabeza","cuello",
    "espalda","pecho","abdomen","panza","estomago","estómago","cara","piel",
    "ojos","oido","oídos","nariz","boca","garganta",
    "hombro","hombros","cadera","rodilla","rodillas","tobillo","tobillos",
    "muñeca","muñecas","codo","codos","dedo","dedos","uña","uñas"
  ]);

  function tokensForSemantic(query) {
    const tokens = tokenize(query);
    return tokens.filter(t => !BODY_PART_TOKENS.has(t));
  }

  function detectPreferredDim(query) {
    const tokens = tokenize(query);
    if (!tokens.length) return null;
    const tokenSet = new Set(tokens);

    for (const [intent, words] of Object.entries(intentMap)) {
      const normWords = words.map(normalize);
      if (normWords.some((w) => tokenSet.has(w))) {
        return intentToDim[intent] || null;
      }
    }
    return null;
  }

  function clearActivePetals() {
    document.querySelectorAll(".bw-petal.active").forEach((p) => p.classList.remove("active"));
  }

  // Tooltip flotante
  let tip = document.querySelector(".bw-float-tip");
  if (!tip) {
    tip = document.createElement("div");
    tip.className = "bw-float-tip";
    document.body.appendChild(tip);
  }
  function tipOn(text) { tip.textContent = text; tip.classList.add("is-on"); }
  function tipOff() { tip.classList.remove("is-on"); }
  function tipMove(e) { tip.style.left = e.clientX + "px"; tip.style.top = e.clientY + "px"; }

  function findPetalFromTarget(target, stopEl) {
    let n = target;
    while (n && n !== stopEl && n !== document) {
      if (n.classList && n.classList.contains("bw-petal")) return n;
      n = n.parentNode;
    }
    return null;
  }

  function setStageDefault() {
    if (stageTitle) stageTitle.textContent = "";
    if (stageSub) stageSub.textContent = "Elegí una dimensión para empezar o escribí tu búsqueda. Podés explorar desde Cuerpo, Mente, Energía o Conciencia.";
    if (bwContainer) bwContainer.classList.remove("has-selection");
  }

  function setStageNeutralHint() {
    if (stageTitle) stageTitle.textContent = "";
    if (stageSub) stageSub.textContent = "Probá con otra palabra (síntoma, emoción, zona del cuerpo o lo que querés lograr).";
    if (bwContainer) bwContainer.classList.remove("has-selection");
  }

  function setStageSelected(dimKey, reasonText) {
    const d = data[dimKey];
    if (stageTitle) stageTitle.textContent = d?.label || dimLabel[dimKey] || "";
    if (stageSub) stageSub.textContent = reasonText ? reasonText : (d?.frase || "");
    if (bwContainer) bwContainer.classList.add("has-selection");
  }

  // Índice rápido por nombre de especialidad
  const specialtyIndex = buildSpecialtyIndex(data);

  function buildSpecialtyIndex(bodhiData) {
    const idx = new Map();
    for (const [dim, d] of Object.entries(bodhiData || {})) {
      const list = Array.isArray(d.especialidades) ? d.especialidades : [];
      for (const spec of list) {
        const base = String(spec || "").trim();
        if (!base) continue;
        idx.set(normalizeTight(base), { dim, spec: base });
      }
    }
    return idx;
  }

  function matchSpecialtyName(query) {
    const qt = normalizeTight(query);
    if (!qt || qt.length < 3) return null;

    let best = null;
    for (const [k, v] of specialtyIndex.entries()) {
      if (k.length < 4) continue;
      if (qt.includes(k) || k.includes(qt)) {
        const score = Math.min(k.length, qt.length);
        if (!best || score > best.score) best = { ...v, score };
      }
    }
    return best;
  }

  function computeSemanticMatches(query, preferredDim) {
    const q = normalize(query);
    const qt = normalizeTight(query);
    const tokens = tokensForSemantic(query);
    if (!q || q.length < 3) return { dim: null, top: [], others: [] };

    const scored = [];

    for (const [specName, m] of Object.entries(meta)) {
      const dim = m?.dim;
      if (!dim) continue;

      const nameT = normalizeTight(specName);

      let score = 0;

      if (qt.includes(nameT) || nameT.includes(qt)) score += 120;

      const aliasArr = Array.isArray(m.alias) ? m.alias : [];
      for (const a of aliasArr) {
        const aT = normalizeTight(a);
        if (!aT) continue;
        if (qt.includes(aT) || aT.includes(qt)) score += 70;
      }

      const desc = normalize(m.descripcion || "");
      if (desc) {
        for (const t of tokens) {
          if (t.length >= 4 && desc.includes(t)) score += 6;
        }
      }

      const aborda = Array.isArray(m.aborda) ? m.aborda : [];
      for (const item of aborda) {
        const it = normalize(item);
        if (!it) continue;
        if (q.includes(it) || it.includes(q)) score += 30;
        for (const t of tokens) {
          if (t.length >= 4 && it.includes(t)) score += 10;
        }
      }

      const sit = Array.isArray(m.situaciones) ? m.situaciones : [];
      for (const item of sit) {
        const it = normalize(item);
        if (!it) continue;
        if (q.includes(it) || it.includes(q)) score += 26;
        for (const t of tokens) {
          if (t.length >= 4 && it.includes(t)) score += 8;
        }
      }

      const list = Array.isArray(data?.[dim]?.especialidades) ? data[dim].especialidades : [];
      if (list.includes(specName)) score += 8;

      if (score > 0) scored.push({ dim, spec: specName, score });
    }

    if (!scored.length) return { dim: preferredDim || null, top: [], others: [] };

    if (preferredDim) {
      const only = scored.filter((x) => x.dim === preferredDim).sort((a, b) => b.score - a.score);
      if (!only.length) return { dim: preferredDim, top: [], others: [] };

      const top = only.slice(0, 2).map(x => x.spec);
      const others = only.slice(2, 2 + MAX_EXTRA_MATCHES).map(x => x.spec);
      return { dim: preferredDim, top, others };
    }

    const bestByDim = new Map();
    for (const s of scored) {
      const prev = bestByDim.get(s.dim);
      if (!prev || s.score > prev) bestByDim.set(s.dim, s.score);
    }

    let bestDim = null;
    let bestDimScore = -1;
    for (const [dim, sc] of bestByDim.entries()) {
      if (sc > bestDimScore) {
        bestDimScore = sc;
        bestDim = dim;
      }
    }

    const inDim = scored.filter((x) => x.dim === bestDim).sort((a, b) => b.score - a.score);

    const top = inDim.slice(0, 2).map(x => x.spec);
    const others = inDim.slice(2, 2 + MAX_EXTRA_MATCHES).map(x => x.spec);

    return { dim: bestDim, top, others };
  }

  function renderTags() {
    if (tagsWrap) tagsWrap.classList.remove("is-hidden");
    if (resultsWrap) resultsWrap.classList.add("is-hidden");
    if (panelTitle) panelTitle.textContent = "Especialidades";
    if (panelHint) panelHint.textContent = "Elegí una o escribí lo que te pasa.";

    if (!selectedDim) {
      if (bwContainer) bwContainer.removeAttribute("data-dim");
      if (tagsWrap) tagsWrap.innerHTML = "";
      if (moreBtn) moreBtn.classList.add("is-hidden");
      if (searchInput) searchInput.placeholder = "Buscá por nombre, profesión o síntoma";
      return;
    }

    const d = data[selectedDim];
    if (!d) return;

    if (bwContainer) bwContainer.setAttribute("data-dim", selectedDim);

    clearActivePetals();
    const petalId = Object.keys(idToDim).find((k) => idToDim[k] === selectedDim);
    if (petalId) {
      const el = document.getElementById(petalId);
      if (el) el.classList.add("active");
    }

    if (searchInput) searchInput.placeholder = `Escribí dentro de ${d.label}…`;

    const list = Array.isArray(d.especialidades) ? d.especialidades : [];

    const wanted = [];
    if (selectedSpecialty && list.includes(selectedSpecialty)) wanted.push(selectedSpecialty);
    for (const s of suggestedTop) if (list.includes(s)) wanted.push(s);
    for (const s of suggestedOthers) if (list.includes(s)) wanted.push(s);

    const seen = new Set();
    const pinned = [];
    for (const x of wanted) {
      const k = normalizeTight(x);
      if (!seen.has(k)) { seen.add(k); pinned.push(x); }
    }

    const base = list.filter((x) => !seen.has(normalizeTight(x))).slice(0, VISIBLE_BASE);
    const visible = [...pinned, ...base];

    const topSet = new Set(suggestedTop.map(normalizeTight));
    const selectedT = selectedSpecialty ? normalizeTight(selectedSpecialty) : null;

    if (tagsWrap) {
      tagsWrap.innerHTML = visible.map((name) => {
        const nt = normalizeTight(name);
        const isSuggested = topSet.has(nt);
        const isSelected = selectedT && nt === selectedT;

        return `<button class="tag${isSuggested ? " is-suggested" : ""}${isSelected ? " is-selected" : ""}"
                  type="button"
                  data-dim="${escapeHtml(selectedDim)}"
                  data-tag="${escapeHtml(name)}">${escapeHtml(name)}</button>`;
      }).join("");
    }

    if (moreBtn) {
      moreBtn.classList.remove("is-hidden");
      moreBtn.textContent = suggestedTop.length
        ? `Ver profesionales en ${suggestedTop[0]} →`
        : (selectedSpecialty ? `Ver profesionales en ${selectedSpecialty} →` : "Ver profesionales →");
    }
  }

  function selectDimension(dimKey, reasonText) {
    if (!data[dimKey]) return;
    selectedDim = dimKey;
    setStageSelected(dimKey, reasonText || null);
    renderTags();
  }

  function clearSelection() {
    selectedDim = null;
    selectedSpecialty = null;
    suggestedTop = [];
    suggestedOthers = [];
    clearActivePetals();
    if (searchInput) searchInput.value = "";
    if (bwContainer) {
      bwContainer.classList.remove("has-selection");
      bwContainer.removeAttribute("data-dim");
    }
    setStageDefault();
    renderTags();
  }

  function scoreDimensionFromQuery(q) {
    const tokens = tokenize(q);
    if (!tokens.length) return null;

    const intent = detectIntent(q);
    const preferredDim = (intent && intent.dim) ? intent.dim : detectPreferredDim(q);

    const sem = computeSemanticMatches(q, preferredDim);

    if (intent && intent.dim) {
      const list = (data[intent.dim] && Array.isArray(data[intent.dim].especialidades)) ? data[intent.dim].especialidades : [];
      const boost = (intent.boost || []).filter((s) => list.includes(s));
      const merged = uniq([ ...boost, ...sem.top, ...sem.others ]);
      const top = merged.slice(0, 2);
      const others = merged.slice(2, 2 + MAX_EXTRA_MATCHES);
      return {
        dim: intent.dim,
        reason: top.length === 2
          ? `Sugerencias: ${top[0]} y ${top[1]}.`
          : (top.length === 1 ? `Sugerencia: ${top[0]}.` : `Podés empezar por ${dimLabel[intent.dim]} y refinar desde las especialidades.`),
        top,
        others
      };
    }
    if (sem.dim) {
      return {
        dim: sem.dim,
        reason: sem.top.length === 2
          ? `Sugerencias: ${sem.top[0]} y ${sem.top[1]}.`
          : (sem.top.length === 1 ? `Sugerencia: ${sem.top[0]}.` : null),
        top: sem.top,
        others: sem.others
      };
    }

    const nameHit = matchSpecialtyName(q);
    if (nameHit?.dim) {
      return { dim: nameHit.dim, reason: `Coincidencia con “${nameHit.spec}”.`, top: [nameHit.spec], others: [] };
    }

    if (preferredDim) {
      return { dim: preferredDim, reason: `Podés empezar por ${dimLabel[preferredDim]} y refinar desde las especialidades.`, top: [], others: [] };
    }

    let bestDim = null;
    let bestScore = 0;

    for (const [dim, kws] of Object.entries(dimKeywords)) {
      let score = 0;
      const nkws = kws.map(normalize);
      for (const t of tokens) {
        if (nkws.some((k) => k.includes(t) || t.includes(k))) score += 10;
      }
      if (score > bestScore) {
        bestScore = score;
        bestDim = dim;
      }
    }

    if (!bestDim) return null;
    return { dim: bestDim, reason: `Podés empezar por ${dimLabel[bestDim]} y refinar desde las especialidades.`, top: [], others: [] };
  }

  function suggestDimension() {
    const q = (searchInput?.value || "").trim();

    if (!q) {
      clearSelection();
      return;
    }

    const res = scoreDimensionFromQuery(q);

    if (!res) {
      selectedDim = null;
      selectedSpecialty = null;
      suggestedTop = [];
      suggestedOthers = [];
      clearActivePetals();
      if (bwContainer) {
        bwContainer.classList.remove("has-selection");
        bwContainer.removeAttribute("data-dim");
      }
      setStageNeutralHint();
      renderTags();
      return;
    }

    suggestedTop = Array.isArray(res.top) ? res.top.slice(0, 2) : [];
    suggestedOthers = Array.isArray(res.others) ? res.others : [];

    selectDimension(res.dim, res.reason);
  }

  // ✅ VIDEO: ocultar pétalos hasta terminar y permitir disparo por visibilidad cuando está embebido
  function initVideoPetals() {
    if (flowerFallback) flowerFallback.style.display = "none";
    if (!bwContainer || !flowerVideo) {
      if (bwContainer) bwContainer.classList.add("is-video-ended");
      return;
    }

    const isEmbedded = window.self !== window.top;
    let introStarted = false;

    const onEnded = () => {
      bwContainer.classList.remove("is-video-playing");
      bwContainer.classList.add("is-video-ended");
      if (flowerFallback) flowerFallback.style.display = "none";
      flowerVideo.style.display = "";
    };

    const onError = () => {
      flowerVideo.style.display = "none";
      if (flowerFallback) flowerFallback.style.display = "block";
      bwContainer.classList.remove("is-video-playing");
      bwContainer.classList.add("is-video-ended");
    };

    const startIntro = () => {
      if (introStarted) return;
      introStarted = true;
      bwContainer.classList.add("is-video-playing");
      bwContainer.classList.remove("is-video-ended");
      flowerVideo.currentTime = 0;
      const p = flowerVideo.play?.();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          onEnded();
        });
      }
    };

    flowerVideo.addEventListener("ended", onEnded);
    flowerVideo.addEventListener("error", onError);

    if (isEmbedded) {
      bwContainer.classList.remove("is-video-playing");
      bwContainer.classList.add("is-video-ended");
      flowerVideo.pause?.();
      flowerVideo.currentTime = 0;

      window.addEventListener("message", (event) => {
        const data = event.data || {};
        if (data.type !== "bw-search-visibility") return;
        if (data.playFlower) startIntro();
      });

      return;
    }

    startIntro();
  }

  // Interacciones SVG
  if (svgWrap) {
    svgWrap.addEventListener("mousemove", (e) => {
      const petal = findPetalFromTarget(e.target, svgWrap);
      if (!petal) return tipOff();

      const dim = idToDim[petal.id];
      if (!dim) return tipOff();

      tipMove(e);
      tipOn(dimLabel[dim] || dim);
    });

    svgWrap.addEventListener("mouseleave", () => tipOff());

    svgWrap.addEventListener("click", (e) => {
      const petal = findPetalFromTarget(e.target, svgWrap);
      if (!petal) return;

      e.preventDefault();
      e.stopPropagation();

      const dim = idToDim[petal.id];
      if (dim) {
        suggestedTop = [];
        suggestedOthers = [];
        selectedSpecialty = null;
        selectDimension(dim, null);
      }
    });

    svgWrap.addEventListener("keydown", (e) => {
      const petal = findPetalFromTarget(e.target, svgWrap);
      if (!petal) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const dim = idToDim[petal.id];
        if (dim) {
          suggestedTop = [];
          suggestedOthers = [];
          selectedSpecialty = null;
          selectDimension(dim, null);
        }
      }
    });
  }

  if (bwContainer) {
    bwContainer.addEventListener("click", (e) => {
      const t = e.target;
      if (bwRight && bwRight.contains(t)) return;

      if (bwCenter && bwCenter.contains(t)) {
        const petal = findPetalFromTarget(t, bwCenter);
        if (petal) return;
        clearSelection();
        return;
      }

      clearSelection();
    });
  }

  if (tagsWrap) {
    tagsWrap.addEventListener("click", (e) => {
      const btn = e.target?.closest(".tag");
      if (!btn) return;

      const tag = btn.getAttribute("data-tag");
      const dim = btn.getAttribute("data-dim");

      if (!dim || !tag) return;

      // 👉 Cuando tengas la página real, cambia esta ruta
      const url = `/profesionales.html?dim=${encodeURIComponent(dim)}&esp=${encodeURIComponent(tag)}`;

      console.log("Redirigiendo a:", url);

      // 🔵 Por ahora solo mostramos en consola
      // window.location.href = url;
    });
  }

  if (moreBtn) {
    moreBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!selectedDim) return;

      const dim = selectedDim;
      const q = (searchInput?.value || "").trim();
      const top = suggestedTop;
      const selected = selectedSpecialty;

      console.log("CTA: ver profesionales (pendiente de ruta)", { dim, q, suggestedTop: top, selectedSpecialty: selected });
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      suggestDimension();
    });
  }

  if (searchInput) {
    let tmr = null;

    let ignoreNextInput = false;

    searchInput.addEventListener("input", () => {
      if (ignoreNextInput) {
        ignoreNextInput = false;
        return; // ← no re-ejecuta sugerencia cuando el cambio viene de un click en tag
      }
      clearTimeout(tmr);
      tmr = setTimeout(() => suggestDimension(), 160);
    });
  }

  // Init
  initVideoPetals();
  setStageDefault();
  renderTags();
})();
