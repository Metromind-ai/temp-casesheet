# MetroMind — MCLA 2.3 Integrated Case Sheet

A static, browser-only web form that captures the full **MCLA 2.3 Pilot Edition** intake — Part 1 case sheet (Sections A–G), Section H five-layer assessment with MRS add-on, final formulation, Section I summary, and Section L provisional diagnosis. The completed case sheet is exported as a downloadable JSON file. Nothing is uploaded to any server.

## What's inside

```
metromind-form/
├── index.html      # The form
├── style.css       # Styling
├── script.js       # Layer/MRS rendering, scoring, anchor tooltips, JSON export
└── README.md
```

## Running it locally

It's a plain static site — just open `index.html` in a browser. No build step, no server, no installation.

If you'd like a local web server (some browsers restrict things like file downloads when opened via `file://`), any static server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Hosting

Because the app is fully static, it can be deployed to any static host (GitHub Pages, Netlify, Cloudflare Pages, S3 + CloudFront, Azure Static Web Apps, etc.).

## What the form does

### Part 1 — Integrated Case Sheet
Free-text fields, dropdowns, and date pickers covering:

- **Section A** — Basic Details (Full Name is required; this becomes the filename)
- **Section B** — Presenting Complaints + 5Ps Formulation
- **Section C** — History (HPI, Past Psychiatric, Medical, Substance Use)
- **Section D** — Family History
- **Section E** — Personal History
- **Section F** — Mental Status Examination + Cognitive Functions
- **Section G** — Risk Assessment

Every section is collapsible — click its header to fold/unfold.

### Section H — MCLA 2.3 Five-Layer Assessment

Each layer (L1–L5) is rendered as a card containing:

- **7 items** with **0 / 1 / 2 / 3** radio circles. Hovering or focusing any score circle shows the **behavioural anchor** for that score, drawn from the Mini Scoring Handbook (Part 2 of the source document). Example: hovering "2" on L1 item 1 shows *"One first-degree relative"*.
- A **live-calculated total** (out of 21) that updates as soon as scores are clicked.
- A **Time Code** dropdown: A / S / C / E / L (with full descriptions).
- A **Resistance** dropdown: R0 / R1 / R2 / R3 (with full descriptions). These automatically mirror into the Final Formulation block, so the clinician can update either place.
- **Pattern checkboxes** (different per layer — e.g. L1 has *Circadian / Underactivation / Hyperreactive / Hormonal-medical / Mixed*; L2 has *Executive dysfunction / Salience dysregulation / Loop-rigidity / Mixed*; etc.).
- A **🚩 Red Flag** banner showing the layer-specific warning signs (the exact text from the document) plus a tickbox to record whether any of those red flags are present in this patient.

### MRS — L1 Add-on
Below L1 there's a **Medication Relevance Score** block:
- 10 criteria as checkboxes
- Live total **0–10** with band label (*Low / Consider review / Strong / High priority*)
- **Primary Biological Need** options (INHIBIT / EXCITE / STABILIZE / RESET RHYTHM / MEDICAL WORKUP)
- **Suggested Action** options

### Final Formulation + Resistance Logic
Auto-filled scores summary (editable), dominant/secondary layers, interaction chain, problem type, treatment targets, per-layer resistance grid, lowest-resistance lever, highest-resistance core, strategic sequence, and treatment map.

### Sections I & L
5-Layer formulation summary, provisional diagnosis, signature, and date.

## What the downloaded JSON file looks like

The file is named `<patient_name>_<timestamp>.json` (lowercased, spaces → underscores, special characters stripped). For example, "Priya Menon" → `priya_menon_2026-04-26T05-00-00.json`.

A simplified shape:

```json
{
  "instrument": "MCLA 2.3 — Pilot Edition with MRS",
  "sectionA": { "fullName": "Priya Menon", "ageSex": "28 / F", "...": "..." },
  "sectionB": { "complaints": "...", "fivePs": { "presenting": "...", "...": "..." } },
  "sectionC": { "hpi": "...", "pastPsych": "...", "medical": "...", "substance": "..." },
  "sectionD": { "...": "..." },
  "sectionE": { "...": "..." },
  "sectionF": { "...": "...", "cog": { "memory": "...", "...": "..." } },
  "sectionG": { "...": "..." },
  "sectionH_MCLA": {
    "layers": [
      {
        "layerId": "L1",
        "title": "L1 — Biological Signals & Regulation",
        "totalScore": 11,
        "maxScore": 21,
        "timeCode": "S",
        "resistance": "R1",
        "patterns": ["Circadian", "Hyperreactive"],
        "redFlagAcknowledged": false,
        "redFlagsList": "total insomnia, severe reversal, suspected apnea, manic decreased sleep, severe weight change",
        "items": [
          { "number": 1, "name": "Family Loading / Genetic Risk",
            "description": "mood disorder, psychosis, ADHD, addiction, suicide",
            "score": 2, "anchorMet": "One first-degree relative" }
        ]
      }
    ],
    "MRS": {
      "criteriaSelected": ["Severe insomnia", "Marked impairment", "..."],
      "totalScore": 6,
      "maxScore": 10,
      "band": "Strong",
      "primaryBiologicalNeed": ["RESET RHYTHM (circadian)"],
      "suggestedAction": ["Combined med + therapy"]
    },
    "finalFormulation": {
      "scoresSummary": "L1 11/21 / L2 12/21 / L3 11/21 / L4 12/21 / L5 8/21",
      "dominantLayers": "L2 + L4",
      "secondaryLayers": "L1, L3",
      "interactionChain": "L1 hyperreactivity → L2 initiation blocks → L3 avoidance → L4 rumination",
      "problemType": ["Rigid"],
      "resistancePerLayer": { "L1": "R1", "L2": "R1", "L3": "R0", "L4": "R2", "L5": "R2" },
      "lowestResistanceLever": "L3 (R0) — behavioural activation first",
      "highestResistanceCore": "L5 (R2) — identity work later",
      "strategicSequence": "...",
      "treatmentMap": "..."
    }
  },
  "sectionI": { "summary": "...", "active": "...", "problemType": "Rigid", "treatmentSequence": "..." },
  "sectionL": { "provisionalDiagnosis": "...", "signature": "...", "date": "2026-04-26" }
}
```

Each scored item carries:
- `number` and `name` — what the item is
- `score` — the 0–3 the clinician selected (or `null` if not scored)
- `anchorMet` — the behavioural anchor string corresponding to that score (e.g. "Frequent non-restorative")

So the JSON is fully self-describing: a downstream reader can see both the score and what the score means, without needing the original handbook.

## Privacy

All data stays in the browser. The JSON file is generated locally and downloaded to the clinician's own device — nothing is transmitted over the network.

---

*MCLA 2.3 Pilot Edition · Developed by Dr. Thalhath P · MetroMind, Kerala, India*
