"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import {
  translatePage,
  restorePage,
  setupObserver,
  disconnectObserver,
} from "@/lib/dom-translator";

/**
 * Invisible component that bridges the I18nProvider language state
 * with the DOM-level translation engine.
 *
 * When the user switches language via the existing LanguageDropdown,
 * this component detects the change and walks the rendered DOM to
 * replace English text with Hindi — without touching any React
 * component source code, CSS, or element attributes.
 *
 * Mount it once inside the I18nProvider.
 */
export default function DomTranslator() {
  const { language } = useI18n();
  const initialized = useRef(false);

  // Set up MutationObserver on mount, tear down on unmount
  useEffect(() => {
    setupObserver();
    return () => disconnectObserver();
  }, []);

  // React to language changes
  useEffect(() => {
    // Skip the very first render — the page is already in English
    if (!initialized.current) {
      initialized.current = true;
      return;
    }

    // Small delay so React finishes rendering the new view
    // before we walk the DOM and translate text nodes.
    const timer = setTimeout(() => {
      if (language === "en") {
        restorePage();
      } else {
        translatePage(language);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [language]);

  // This component renders nothing
  return null;
}
