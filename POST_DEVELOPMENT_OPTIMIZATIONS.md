# 📌 MIOS — Post-Development Optimization Backlog

> **Note:** This backlog is saved per CEO instructions on 2026-07-30. Remind the CEO of these items once the full MIOS application (all 6 Slices) has been built and tested.

---

## 1. ⚡ AI Quick-Paste / Campaign Parser Optimizations
- **Enhanced Natural Language Heuristics:** Refine keyword matching for edge-case marketing reports (e.g., WhatsApp informal chats, complex agency CSV/table paste).
- **Optional LLM Integration:** Option to connect an LLM endpoint (Gemini/OpenAI) for fuzzy parsing of unstructured executive call notes or unstructured voice-to-text transcripts.
- **Custom Metric Mapping:** Allow users to define custom keywords or aliases for their specific agency or pest control service offerings.

---

## 2. 📊 Campaign & Metric View Polish
- **Granular Date Range & Filter Drilldowns:** Add custom date range pickers and platform-specific comparison views on `/campaigns`.
- **CVR & ROAS Benchmark Alerts:** Highlight campaigns that exceed or fall below historical company averages.
- **Bulk Operations:** Multi-select table actions for archiving, cloning, or exporting campaign reports.

---

## 3. 🎨 General Performance & UI/UX Polish
- **Keyboard Shortcuts:** Quick-command palette (`Cmd/Ctrl + K`) to jump between campaigns, creatives, and experiments.
- **Offline / Caching Enhancements:** Optimistic UI updates with SWR / React Query caching for instant transitions.
