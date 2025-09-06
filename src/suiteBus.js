// Echo — Suite Bridge (Phase 1)
// Shared localStorage schema + helpers. Safe to import in any app.
// Keys: suite.intentions, suite.currentIntention, suite.suggestedRitual,
//       suite.journals, suite.tasks, suite.taskOutcomes, suite.insights
// All arrays append-only for now.

(function initSuiteBridge() {
  const BUS = {
    version: "v1",
    keys: {
      intentions: "suite.intentions",
      currentIntention: "suite.currentIntention",
      suggestedRitual: "suite.suggestedRitual",
      journals: "suite.journals",
      tasks: "suite.tasks",
      taskOutcomes: "suite.taskOutcomes",
      insights: "suite.insights",
    },
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return structuredClone(fallback);
      const parsed = JSON.parse(raw);
      return parsed ?? structuredClone(fallback);
    } catch {
      return structuredClone(fallback);
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Broadcast change for other tabs/apps
      window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify(value) }));
    } catch (e) {
      console.error("[SuiteBridge] write failed", key, e);
    }
  }

  function append(key, entry) {
    const list = read(key, []);
    list.push(entry);
    write(key, list);
  }

  // Minimal public API (hung off window so any app can call if needed later)
  const api = {
    BUS,
    // Echo-focused helpers (available to all apps)
    addInsight(content, meta = {}) {
      append(BUS.keys.insights, {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        content,
        meta,
        source: "echo",
      });
    },
    setSuggestedRitual(ritualId, reason) {
      write(BUS.keys.suggestedRitual, {
        ritualId,
        reason,
        at: new Date().toISOString(),
        source: "echo",
      });
    },
    setCurrentIntention(text, meta = {}) {
      write(BUS.keys.currentIntention, {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        text,
        meta,
        source: meta.source || "echo",
      });
      // also keep a history
      append(BUS.keys.intentions, { at: new Date().toISOString(), text, meta, source: "echo" });
    },
    // Generic (used by Rituals/Focus too)
    addJournal(entry) {
      append(BUS.keys.journals, { ...entry, id: crypto.randomUUID(), at: new Date().toISOString() });
    },
    addTask(task) {
      append(BUS.keys.tasks, { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    },
    addTaskOutcome(outcome) {
      append(BUS.keys.taskOutcomes, { ...outcome, id: crypto.randomUUID(), at: new Date().toISOString() });
    },
    // Readers
    getSuggestedRitual() {
      return read(BUS.keys.suggestedRitual, null);
    },
    getCurrentIntention() {
      return read(BUS.keys.currentIntention, null);
    },
  };

  // expose
  window.SUITE = api;
})();
