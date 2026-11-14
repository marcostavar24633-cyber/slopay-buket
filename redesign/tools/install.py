#!/usr/bin/env python3
"""Ставит редизайн главной в готовую сборку сайта.

Запускается в GitHub Pages после `vite build` и пререндера:
    python3 redesign/tools/install.py dist

Что делает:
  1. пересобирает redesign/js/data.js из content/*.json (правки админки попадают на сайт);
  2. копирует redesign/css, js, vendor в dist/;
  3. заменяет dist/index.html новой главной и поправляет пути к политике, оферте и иконкам.
Остальные страницы старой сборки (privacy, oferta, corporate, admin, страницы категорий,
sitemap.xml, robots.txt, img, tg, CNAME) остаются как есть.

Откат на старую главную: убрать шаг «Новая главная» из .github/workflows/pages.yml.
"""
import pathlib
import runpy
import shutil
import sys

root = pathlib.Path(__file__).resolve().parents[2]
red = root / 'redesign'
dist = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'dist').resolve()
if not (dist / 'index.html').exists():
    sys.exit(f'Нет сборки в {dist}: сначала vite build')

# Сохраняем исходное приложение Vite: новая главная статическая и не поддерживает протокол визуального редактора.
# Админка открывает этот файл во фрейме, чтобы postMessage и черновики продолжали работать.
shutil.copy2(dist / 'index.html', dist / 'editor-preview.html')

runpy.run_path(str(red / 'tools' / 'build-data.py'))

for d in ('css', 'js', 'vendor'):
    target = dist / d
    if target.exists():
        shutil.rmtree(target)
    shutil.copytree(red / d, target)

html = (red / 'index.html').read_text(encoding='utf-8')
for a, b in {
    '../privacy/': 'privacy/',
    '../oferta/': 'oferta/',
    '../public/favicon-64.png': 'favicon-64.png',
    '../public/apple-touch-icon.png': 'apple-touch-icon.png',
}.items():
    html = html.replace(a, b)
assert '../' not in html, 'в index.html остались пути на уровень выше'
(dist / 'index.html').write_text(html, encoding='utf-8')

# все картинки, на которые ссылается новая главная, должны быть в сборке
import json, re
data = json.loads((red / 'js' / 'data.js').read_text(encoding='utf-8').split('=', 1)[1].rstrip().rstrip(';'))
need = {i['img'] for i in data['items']} | {i['thumb'] for i in data['items']}
need |= set(re.findall(r'(?:src|srcset)="(img/[^" ]+)', html))
missing = [p for p in need if not (dist / p).exists()]
if missing:
    sys.exit('В сборке нет картинок: ' + ', '.join(sorted(missing)[:10]))
print(f'Новая главная установлена в {dist}: {len(data["items"])} работ, картинки на месте')
