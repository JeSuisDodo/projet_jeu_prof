import type { Settings } from '../game/settings';
import { h, hideOverlay, showOverlay } from './overlay';

/** Icônes des boutons en haut à droite (dessinées ici, sans fichier image). */
export const ICONS = {
  map: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z" fill="currentColor" opacity=".25"/><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  journal: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17H7.5A2.5 2.5 0 0 0 5 21.5z" fill="currentColor" opacity=".25"/><path d="M5 21.5v-17A2.5 2.5 0 0 1 7.5 2H19v17H7.5A2.5 2.5 0 0 0 5 21.5zm0 0A2.5 2.5 0 0 0 7.5 24H19v-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 7h6M9 10.5h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  soundOn: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  soundOff: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 9.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
};

/** Fenêtre des paramètres : chaque changement s'applique et s'enregistre tout de suite. */
export function openSettings(settings: Settings, onChange: (s: Settings) => void): void {
  const panel = h('div', 'panel settings');
  panel.innerHTML = `
    <h2>Paramètres</h2>
    <label class="setting"><span>Musique</span>
      <input type="range" name="music" min="0" max="100" step="5" value="${Math.round(settings.music * 100)}"></label>
    <label class="setting"><span>Effets sonores</span>
      <input type="range" name="effects" min="0" max="100" step="5" value="${Math.round(settings.effects * 100)}"></label>
    <label class="setting check"><input type="checkbox" name="muted" ${settings.muted ? 'checked' : ''}>
      <span>Couper tout le son <small class="muted">(touche M)</small></span></label>
    <label class="setting check"><input type="checkbox" name="calm" ${settings.calm ? 'checked' : ''}>
      <span>Réduire les animations <small class="muted">(pas de particules ni de secousses)</small></span></label>
    <label class="setting check"><input type="checkbox" name="bigText" ${settings.bigText ? 'checked' : ''}>
      <span>Texte plus grand dans les fenêtres</span></label>
    <p class="muted">Les réglages sont gardés sur cet appareil. Raccourcis : V pour la carte de l’île, C pour le carnet, P pour les paramètres.</p>`;
  panel.addEventListener('input', (e) => {
    const input = e.target as HTMLInputElement;
    const key = input.name as keyof Settings;
    if (input.type === 'range') (settings[key] as number) = Number(input.value) / 100;
    else (settings[key] as boolean) = input.checked;
    onChange(settings);
  });
  const actions = h('div', 'row actions');
  const close = h('button', '', 'Fermer') as HTMLButtonElement;
  close.onclick = hideOverlay;
  actions.append(close);
  panel.append(actions);
  showOverlay(panel);
  close.focus({ preventScroll: true });
}
