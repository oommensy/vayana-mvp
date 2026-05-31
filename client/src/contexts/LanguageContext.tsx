import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { type Language, t as translate, type TranslationKey } from "../../../shared/i18n";
import { trpc } from "../lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem("vayana_lang");
    return (stored as Language) || "en";
  });

  const { isAuthenticated } = useAuth();
  const updateProfile = trpc.users.updateProfile.useMutation();
  // Load preferred language from user profile when authenticated
  const { data: profile } = trpc.users.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Sync language from profile (profile takes precedence over localStorage)
  useEffect(() => {
    if (profile?.preferredLanguage && (profile.preferredLanguage === "en" || profile.preferredLanguage === "ml")) {
      const profileLang = profile.preferredLanguage as Language;
      setLangState(profileLang);
      localStorage.setItem("vayana_lang", profileLang);
    }
  }, [profile?.preferredLanguage]);

  const setLang = useCallback(
    (newLang: Language) => {
      setLangState(newLang);
      localStorage.setItem("vayana_lang", newLang);
      // Persist to user profile if logged in
      if (isAuthenticated) {
        updateProfile.mutate({ preferredLanguage: newLang });
      }
    },
    [updateProfile, isAuthenticated]
  );

  const t = useCallback(
    (key: TranslationKey) => translate(lang, key),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
