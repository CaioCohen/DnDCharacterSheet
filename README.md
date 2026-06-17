# DnD Character Sheet

Projeto em React + Vite para gerenciar uma ficha de D&D.

## Como rodar localmente

```bash
npm install
npm run dev
```

O app normalmente sobe em `http://localhost:5173/`.

## Build de producao

```bash
npm run build
```

## Preview do build

```bash
npm run preview
```

## Deploy no GitHub Pages

O deploy deste repositorio e feito com `gh-pages` usando o conteudo da pasta `dist`.

```bash
npm run deploy
```

Esse comando executa o build antes de publicar, por causa do script `predeploy`.

## Deploy manual via `gh`

Se voce quiser checar o status do deploy com a GitHub CLI:

```bash
gh api repos/CaioCohen/dndCharacterSheet/actions/runs?per_page=5
gh api repos/CaioCohen/dndCharacterSheet/branches/main --jq .commit.sha
gh api repos/CaioCohen/dndCharacterSheet/branches/gh-pages --jq .commit.sha
```
