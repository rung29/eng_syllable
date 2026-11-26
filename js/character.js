/**
 * 音節道館的角色、腰帶與答題動畫。
 */

const MASCOT_CHARACTER_BY_THEME = new Map([
  ['dojo', 'poby'],
  ['sushi', 'mimi'],
  ['magic', 'lulu'],
  ['brawl', 'bibi']
]);

class IllustratedMascot {
  constructor(containerId, character) {
    this.currentState = 'idle';
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'mascot-wrapper mascot-illustrated state-idle';
    this.wrapper.dataset.character = character;
    this.wrapper.setAttribute('aria-hidden', 'true');

    const art = document.createElement('img');
    art.className = 'mascot-illustration';
    art.src = 'assets/' + character + '.webp';
    art.alt = '';
    art.draggable = false;

    const marker = document.createElement('span');
    marker.className = 'mascot-belt-marker';
    const reaction = document.createElement('span');
    reaction.className = 'mascot-reaction';

    this.wrapper.append(art, marker, reaction);
    document.getElementById(containerId).replaceChildren(this.wrapper);
  }

  setBeltColor(color) {
    this.wrapper.style.setProperty('--mascot-belt', color);
  }

  setState(state) {
    clearTimeout(this.stateResetTimer);
    clearTimeout(this.impactTimer);
    this.wrapper.classList.replace('state-' + this.currentState, 'state-' + state);
    this.currentState = state;
  }

  triggerChop(onImpact) {
    this.setState('chop');
    this.impactTimer = setTimeout(() => {
      if (this.wrapper.isConnected) onImpact?.();
    }, 280);
    this.stateResetTimer = setTimeout(() => this.setState('idle'), 650);
  }

  triggerWin() {
    this.setState('win');
    this.stateResetTimer = setTimeout(() => this.setState('idle'), 2200);
  }

  triggerFail() {
    this.setState('fail');
    this.stateResetTimer = setTimeout(() => this.setState('idle'), 1500);
  }

  destroy() {
    clearTimeout(this.stateResetTimer);
    clearTimeout(this.impactTimer);
    this.wrapper.remove();
  }
}

class MascotFactory {
  static create(theme, containerId) {
    const character = MASCOT_CHARACTER_BY_THEME.get(theme) ?? 'poby';
    return new IllustratedMascot(containerId, character);
  }
}

window.MascotFactory = MascotFactory;
