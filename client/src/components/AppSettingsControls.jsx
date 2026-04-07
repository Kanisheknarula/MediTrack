import { Languages, Moon, Sun } from 'lucide-react';
import { useAppSettings } from '../context/AppSettingsContext';

const AppSettingsControls = ({ variant = 'floating' }) => {
  const { theme, language, languages, setLanguage, toggleTheme, t } = useAppSettings();
  const floating = variant === 'floating';

  return (
    <div className={`${floating ? 'fixed bottom-4 right-4 z-[60] shadow-2xl shadow-slate-950/20' : ''} flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-2 rounded-lg border border-white/20 bg-slate-950/90 p-2 text-white backdrop-blur`}>
      <button
        type="button"
        onClick={toggleTheme}
        className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-emerald-50"
        title={t('theme')}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        {theme === 'dark' ? t('light') : t('dark')}
      </button>

      <label className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-black">
        <Languages size={16} />
        <span className="sr-only">{t('language')}</span>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="bg-transparent text-xs font-black text-white outline-none"
          aria-label={t('language')}
        >
          {languages.map((option) => (
            <option key={option.code} value={option.code} className="bg-slate-950 text-white">
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default AppSettingsControls;
