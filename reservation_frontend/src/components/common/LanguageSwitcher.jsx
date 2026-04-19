import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

const LanguageSwitcher = ({ variant = 'dropdown' }) => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language || 'en';

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    document.dir = langCode === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = langCode;
  };

  if (variant === 'buttons') {
    return (
      <div className="flex items-center gap-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              currentLang === lang.code
                ? 'bg-primary-600 text-white'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={lang.label}
          >
            <span className="mr-1">{lang.flag}</span>
            {lang.code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-primary-600 transition-colors">
        <Globe size={18} />
        <span>{languages.find(l => l.code === currentLang)?.flag}</span>
        <span className="hidden sm:inline">{t('common.language')}</span>
      </button>
      
      <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2 ${
              currentLang === lang.code ? 'text-primary-600 font-medium bg-primary-50' : 'text-gray-700'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
            {currentLang === lang.code && (
              <span className="ml-auto text-primary-600">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
