/**
 * DOM-level page translator.
 *
 * Walks the rendered DOM and replaces English text nodes with Hindi
 * translations from the dictionary — without touching React source code,
 * CSS, or any element attributes.
 *
 * Protected from translating:
 *  - Elements inside [data-no-translate] containers
 *  - <input>, <textarea>, <select>, <code>, <pre>, <script>, <style>, <svg>
 *  - Patient data values (names, IDs, phone numbers, medical readings)
 *    are excluded because they never appear as exact dictionary keys
 *
 * MutationObserver integration keeps translations in sync when React
 * re-renders parts of the page (e.g. tab switches, role changes).
 */

import { translations } from "./translations";

// Tags whose text content must never be touched
const SKIP_TAGS = new Set([
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "CODE",
  "PRE",
  "SCRIPT",
  "STYLE",
  "SVG",
  "PATH",
]);

// ─── State ─────────────────────────────────────────────────────────
const originalTexts = new WeakMap<Node, string>();
// Store the *original English* placeholder for each element so we can
// restore it when switching back to English. Keyed by Element.
const originalPlaceholders = new WeakMap<Element, string>();
const placeholderKeys = new WeakSet<Element>();
let isTranslating = false;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let observer: MutationObserver | null = null;
let currentLanguage = "en";

// Pre-sort dictionary keys longest-first so substring matches are greedy
const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);

// ─── Helpers ───────────────────────────────────────────────────────
function shouldSkipNode(node: Node): boolean {
  const parent = node.parentElement;
  if (!parent) return true;
  if (SKIP_TAGS.has(parent.tagName)) return true;
  if (parent.closest("[data-no-translate]")) return true;
  if (parent.closest("input, textarea, select, code, pre, script, style, svg"))
    return true;
  return false;
}

/**
 * Try to translate a text node.
 * Returns true if the node was modified.
 */
function translateTextNode(node: Text): boolean {
  const raw = node.textContent;
  if (!raw) return false;

  const text = raw.trim();
  if (text.length < 2) return false;

  // Store original on first encounter
  if (!originalTexts.has(node)) {
    originalTexts.set(node, raw);
  }

  // 1. Exact match
  if (translations[text]) {
    const leading = raw.match(/^(\s*)/)?.[0] ?? "";
    const trailing = raw.match(/(\s*)$/)?.[0] ?? "";
    node.textContent = leading + translations[text] + trailing;
    return true;
  }

  // 2. Greedy substring replacement (longest key first)
  let result = text;
  let modified = false;
  for (const key of sortedKeys) {
    if (key.length < 3) continue; // skip very short keys to avoid false matches
    if (result.includes(key)) {
      result = result.replace(key, translations[key]);
      modified = true;
    }
  }

  if (modified) {
    const leading = raw.match(/^(\s*)/)?.[0] ?? "";
    const trailing = raw.match(/(\s*)$/)?.[0] ?? "";
    node.textContent = leading + result + trailing;
    return true;
  }

  return false;
}

/**
 * Restore a single text node to its original English content.
 */
function restoreTextNode(node: Text): boolean {
  const original = originalTexts.get(node);
  if (original !== undefined && node.textContent !== original) {
    node.textContent = original;
    return true;
  }
  return false;
}

/**
 * Translate the `placeholder` attribute of form controls (input, textarea, select).
 *
 * Unlike visible text nodes, placeholder attributes are not picked up by the
 * TreeWalker (we skip those element subtrees so we never corrupt user-typed
 * values). So we walk them separately here and translate/restore the
 * attribute string — leaving the actual `value`/`textContent` of the control
 * untouched.
 *
 * We remember the original English placeholder so switching back to English
 * restores it exactly (rather than double-translating).
 */
const PLACEHOLDER_ATTRS = ["placeholder"] as const;

function translateElementAttrs(el: HTMLElement): boolean {
  if (el.closest("[data-no-translate]")) return false;

  let modified = false;
  for (const attr of PLACEHOLDER_ATTRS) {
    const raw = el.getAttribute(attr);
    if (!raw) continue;

    // Remember the original English placeholder once.
    if (!originalPlaceholders.has(el)) {
      originalPlaceholders.set(el, raw);
    } else if (!placeholderKeys.has(el)) {
      // Already processed in a previous run — start from the original English
      // so repeated passes never double-translate.
      el.setAttribute(attr, originalPlaceholders.get(el)!);
    }
    placeholderKeys.add(el);

    const trimmed = raw.trim();
    if (trimmed.length < 2) continue;

    // Exact match
    if (translations[trimmed]) {
      el.setAttribute(attr, translations[trimmed]);
      modified = true;
      continue;
    }
    // Greedy substring replacement (longest key first)
    let result = trimmed;
    let didMatch = false;
    for (const key of sortedKeys) {
      if (key.length < 3) continue;
      if (result.includes(key)) {
        result = result.split(key).join(translations[key]);
        didMatch = true;
      }
    }
    if (didMatch) {
      el.setAttribute(attr, result);
      modified = true;
    }
  }
  return modified;
}

function restoreElementAttrs(el: HTMLElement): boolean {
  if (!placeholderKeys.has(el)) return false;
  let modified = false;
  for (const attr of PLACEHOLDER_ATTRS) {
    const original = originalPlaceholders.get(el);
    if (original === undefined) continue;
    if (el.getAttribute(attr) !== original) {
      el.setAttribute(attr, original);
      modified = true;
    }
  }
  return modified;
}

// ─── Public API ────────────────────────────────────────────────────

/**
 * Walk the entire document.body and translate every eligible text node.
 */
export function translatePage(language: string): void {
  if (isTranslating) return;
  if (language === "en") {
    restorePage();
    return;
  }

  isTranslating = true;
  currentLanguage = language;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return shouldSkipNode(node)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT;
    },
  });

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    translateTextNode(node);
  }

  // Also translate placeholder attributes on form controls (these are
  // skipped by the text-node walker so user-entered values stay intact).
  const formControls = document.querySelectorAll<HTMLElement>(
    "input, textarea, select",
  );
  formControls.forEach((el) => translateElementAttrs(el));

  isTranslating = false;
}

/**
 * Restore every previously-translated text node to its original English.
 */
export function restorePage(): void {
  if (isTranslating) return;
  isTranslating = true;
  currentLanguage = "en";

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return shouldSkipNode(node)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT;
    },
  });

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    restoreTextNode(node);
  }

  // Restore placeholder attributes to their original English.
  const formControls = document.querySelectorAll<HTMLElement>(
    "input, textarea, select",
  );
  formControls.forEach((el) => restoreElementAttrs(el));

  isTranslating = false;
}

/**
 * Start observing DOM mutations so newly-rendered text nodes
 * are automatically translated.
 */
export function setupObserver(): void {
  if (observer) return;

  observer = new MutationObserver((mutations) => {
    if (isTranslating) return;
    if (currentLanguage === "en") return;

    // Only re-translate if there are relevant mutations
    const hasRelevantChange = mutations.some(
      (m) => m.type === "characterData" || m.type === "childList",
    );
    if (!hasRelevantChange) return;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      translatePage(currentLanguage);
    }, 150);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

/**
 * Stop observing and clear pending timers.
 */
export function disconnectObserver(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

/**
 * Get the current active language of the translator.
 */
export function getCurrentLanguage(): string {
  return currentLanguage;
}
