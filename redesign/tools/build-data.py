#!/usr/bin/env python3
"""Собирает redesign/js/data.js из content/*.json (те же данные, что правит админка).
Запуск из корня репозитория:  python3 redesign/tools/build-data.py"""
import json, pathlib
root = pathlib.Path(__file__).resolve().parents[2]
items = json.load(open(root / 'content/products.json', encoding='utf-8'))['items']
reviews = json.load(open(root / 'content/reviews.json', encoding='utf-8'))
site = json.load(open(root / 'content/site.json', encoding='utf-8'))
messages = json.loads((root / 'content/messages.json').read_text(encoding='utf-8'))
hero = json.loads((root / 'content/hero.json').read_text(encoding='utf-8'))
page = json.loads((root / 'content/page.json').read_text(encoding='utf-8'))
out = []
for p in items:
    img = p.get('image') or ''
    if p.get('show') is False or not img.startswith('/img/unsorted/'):
        continue
    img = img.lstrip('/')
    folder, filename = img.rsplit('/', 1)
    thumb = f'{folder}/thumbs/{filename}'
    if not (root / 'public' / thumb).is_file():
        thumb = img
    cat = p['cat'] if p['cat'] in ('berry', 'meat', 'sea', 'dried', 'sweet', 'snack') else 'meat'
    out.append({
        'id': p['id'], 'cat': cat, 'name': p['name'], 'desc': p['desc'], 'price': int(p['price']),
        'img': img, 'thumb': thumb,
        'orderPhoto': f'tg/{p["id"]}.jpg' if (root / 'public' / 'tg' / f'{p["id"]}.jpg').is_file() else img,
        'hit': bool(p.get('hit')), 'hitOrder': p.get('hitOrder', 99),
    })
js = '/* Сгенерировано redesign/tools/build-data.py из content/*.json — не править руками */\n'
js += 'window.SB_DATA = ' + json.dumps({'items': out, 'reviews': reviews['reviews'], 'site': site, 'messages': messages, 'hero': hero, 'page': page}, ensure_ascii=False, indent=1) + ';\n'
(root / 'redesign/js/data.js').write_text(js, encoding='utf-8')
from collections import Counter
print(len(out), Counter(i['cat'] for i in out))
