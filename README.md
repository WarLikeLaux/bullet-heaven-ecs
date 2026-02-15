# 🎮 Bullet Heaven (ECS)

<div align="center">

![Status](https://img.shields.io/badge/status-in_development-orange?style=flat-square)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/three.js-black?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![pnpm](https://img.shields.io/badge/pnpm-%234a4a4a.svg?style=flat-square&logo=pnpm&logoColor=f69220)](https://pnpm.io/)
[![Vitest](https://img.shields.io/badge/vitest-%236E9F18.svg?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![ESLint](https://img.shields.io/badge/eslint-%234B32C3.svg?style=flat-square&logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/prettier-%23F7B93E.svg?style=flat-square&logo=prettier&logoColor=black)](https://prettier.io/)

</div>

**Чистый TypeScript + Three.js + ECS Архитектура**

_(Никаких React-оберток, Unity или Godot. Только чистый код, математика и производительность.)_

---

## 🚀 Обзор

Инженерное портфолио в жанре **Bullet Hell / Survivor-like**.

Мы не "накликиваем" игру в редакторе. Мы пишем её архитектуру. Это демонстрация того, как backend-подход (строгая типизация, управление памятью, ECS) работает во фронтенде.

### Почему это круто?

Для **PHP Full Stack (Backend Focus)** разработчика это идеальный кейс:

1. **Архитектура системы:** не лапша из скриптов, а строгий ECS-фреймворк. 5000+ сущностей, 60 FPS.
2. **Строгая типизация:** TypeScript на стероидах - дженерики, интерфейсы, защита от выстрела в ногу. Как PHP 8+, но в браузере.
3. **Оптимизация:** мы сами управляем памятью (object pooling) и циклом рендера. Никакого оверхеда.
4. **Прозрачность:** нет "черных ящиков". Каждый кадр просчитывается явно.

## 🛠 Технологический стек

- **Runtime:** Vanilla TypeScript (без фреймворков для логики).
- **Renderer:** [Three.js](https://threejs.org/) (WebGL).
- **Architecture:** [Miniplex](https://github.com/hmans/miniplex) (ECS - Entity Component System).
- **Bundler:** [Vite](https://vitejs.dev/) (быстрый HMR и сборка).
- **DX:** ESLint, Prettier, Vitest.
- **Platform:** Web & Yandex.Games SDK.

## 🏗 Архитектура: ECS

Мы отказались от ООП-наследования (`class Bullet extends GameObject`). Только **Data-Oriented Design**.

- **Entities (Сущности):** просто ID.
- **Components (Компоненты):** данные (как столбцы в БД).
- **Systems (Системы):** логика (как SQL-запросы или сервисы).

Схема работы похожа на базу данных в памяти:

```typescript
const moving = world.with('position', 'velocity');

for (const entity of moving) {
  entity.position.add(entity.velocity);
}
```

## 🚀 Быстрый старт

```bash
pnpm install
pnpm dev
```

## 👨‍💻 Разработка

| Команда              | Описание                  |
| -------------------- | ------------------------- |
| `pnpm dev`           | Запуск dev-сервера        |
| `pnpm check`         | Полная проверка проекта   |
| `pnpm test`          | Запуск тестов             |
| `pnpm test:watch`    | Тесты в watch-режиме      |
| `pnpm test:coverage` | Отчет о покрытии          |
| `pnpm lint`          | Проверка линтером         |
| `pnpm lint:fix`      | Автоисправление линтером  |
| `pnpm format`        | Форматирование кода       |
| `pnpm format:check`  | Проверка форматирования   |
| `pnpm typecheck`     | Проверка типов TypeScript |
| `pnpm build`         | Продакшн-сборка           |
| `pnpm h`             | Список всех команд        |

## 📂 Структура проекта

- `src/core/` - ECS ядро: сущности, компоненты, системы.
- `src/main.ts` - точка входа и игровой цикл.
- `tests/` - тесты систем.
- `docs/` - архитектурные решения и философия.
- `.agent/` - контекст для AI-помощника.

---

_Код написан так, чтобы его было приятно читать бэкендеру. Чисто, строго, быстро._
