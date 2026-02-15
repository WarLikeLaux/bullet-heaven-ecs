import { UpgradeDef } from '@/core/upgrades';
import styles from './upgrade-select.module.css';

function createCard(
  upgrade: UpgradeDef,
  onSelect: (id: string) => void
): HTMLElement {
  const card = document.createElement('div');
  card.className = styles.card;

  const icon = document.createElement('div');
  icon.className = styles.icon;
  icon.textContent = upgrade.icon;

  const name = document.createElement('div');
  name.className = styles.name;
  name.textContent = upgrade.name;

  const desc = document.createElement('div');
  desc.className = styles.desc;
  desc.textContent = upgrade.description;

  card.appendChild(icon);
  card.appendChild(name);
  card.appendChild(desc);
  card.addEventListener('click', () => onSelect(upgrade.id));

  return card;
}

export function showUpgradeSelect(upgrades: UpgradeDef[]): Promise<string> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = styles.overlay;

    const title = document.createElement('div');
    title.className = styles.title;
    title.textContent = 'УЛУЧШЕНИЕ';

    const cardsContainer = document.createElement('div');
    cardsContainer.className = styles.cards;

    for (const upgrade of upgrades) {
      const card = createCard(upgrade, (id) => {
        overlay.remove();
        resolve(id);
      });
      cardsContainer.appendChild(card);
    }

    overlay.appendChild(title);
    overlay.appendChild(cardsContainer);
    document.body.appendChild(overlay);
  });
}
