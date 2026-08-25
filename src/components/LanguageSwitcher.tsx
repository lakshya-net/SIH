"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n, type Language } from "@/lib/i18n";

export const languages: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "bn", label: "বাংলা", flag: "🇮🇳" },
];

export function LanguageDropdown() {
  const { language, setLanguage, t } = useI18n();
  const currentLang = languages.find((l) => l.code === language)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <Globe className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs">
            {currentLang.flag} {currentLang.label}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-xs text-slate-400 font-normal">
          {t("selectLanguage")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-2 cursor-pointer ${
              language === lang.code ? "bg-emerald-50 text-emerald-700" : ""
            }`}
          >
            <span className="text-base">{lang.flag}</span>
            <span className="text-sm">{lang.label}</span>
            {language === lang.code && (
              <div className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function LanguageButtonBar() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={language === lang.code ? "default" : "outline"}
          size="lg"
          className={`text-base ${
            language === lang.code ? "bg-cyan-600 hover:bg-cyan-700" : ""
          }`}
          onClick={() => setLanguage(lang.code)}
        >
          <span className="mr-1.5 text-lg">{lang.flag}</span>
          {lang.label}
        </Button>
      ))}
    </div>
  );
}
