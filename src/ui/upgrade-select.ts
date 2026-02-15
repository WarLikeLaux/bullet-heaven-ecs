import { UpgradeDef, getUpgradeDescription } from '@/core/upgrades';
import { Entity } from '@/core/ecs';
import styles from './upgrade-select.module.css';

function createCard(
  upgrade: UpgradeDef,
  player: Entity,
  onSelect: (id: string) => void
): HTMLElement {
  const card = document.createElement('div');
  card.className = styles.card;

  const level = player.upgradeLevels?.[upgrade.id] ?? 0;

  const icon = document.createElement('div');
  icon.className = styles.icon;
  icon.textContent = upgrade.icon;

  const name = document.createElement('div');
  name.className = styles.name;
  name.textContent = upgrade.name;

  const levelBadge = document.createElement('div');
  levelBadge.className = styles.level;
  levelBadge.textContent = level > 0 ? `Ур. ${level} → ${level + 1}` : 'НОВЫЙ';

  const desc = document.createElement('div');
  desc.className = styles.desc;
  desc.textContent = getUpgradeDescription(upgrade, player);

  card.appendChild(icon);
  card.appendChild(name);
  card.appendChild(levelBadge);
  card.appendChild(desc);
  card.addEventListener('click', () => onSelect(upgrade.id));

  return card;
}

export function showUpgradeSelect(
  upgrades: UpgradeDef[],
  player: Entity
): Promise<string> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = styles.overlay;

    const title = document.createElement('div');
    title.className = styles.title;
    title.textContent = 'УЛУЧШЕНИЕ';

    const cardsContainer = document.createElement('div');
    cardsContainer.className = styles.cards;

    for (const upgrade of upgrades) {
      const card = createCard(upgrade, player, (id) => {
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
