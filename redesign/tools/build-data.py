#!/usr/bin/env python3
"""Собирает redesign/js/data.js из content/*.json (те же данные, что правит админка).
Запуск из корня репозитория:  python3 redesign/tools/build-data.py"""
import json, pathlib
root = pathlib.Path(__file__).resolve().parents[2]
items = json.load(open(root / 'content/products.json', encoding='utf-8'))['items']
reviews = json.load(open(root / 'content/reviews.json', encoding='utf-8'))
site = json.load(open(root / 'content/site.json', encoding='utf-8'))
out = []
for p in items:
    if p.get('show') is False or not p.get('image'):
        continue
    img = p['image']                      # /img/real/berry/yag-1.webp
    cat = img.split('/')[3]
    cat = p['cat'] if p['cat'] in ('berry', 'meat', 'sea', 'dried', 'sweet', 'snack') else 'meat'
    out.append({
        'id': p['id'], 'cat': cat, 'name': p['name'], 'desc': p['desc'], 'price': int(p['price']),
        'img': img.lstrip('/'), 'thumb': img.lstrip('/').replace('/' + img.split('/')[3] + '/', '/' + img.split('/')[3] + '/thumbs/'),
        'hit': bool(p.get('hit')), 'hitOrder': p.get('hitOrder', 99),
    })
js = '/* Сгенерировано redesign/tools/build-data.py из content/*.json — не править руками */\n'
js += 'window.SB_DATA = ' + json.dumps({'items': out, 'reviews': reviews['reviews'], 'site': site}, ensure_ascii=False, indent=1) + ';\n'
(root / 'redesign/js/data.js').write_text(js, encoding='utf-8')
from collections import Counter
print(len(out), Counter(i['cat'] for i in out))
