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
preview = (dist / 'index.html').read_text(encoding='utf-8')
preview = preview.replace('<head>', '<head>\n    <meta name="robots" content="noindex, follow">', 1)
(dist / 'editor-preview.html').write_text(preview, encoding='utf-8')

runpy.run_path(str(red / 'tools' / 'build-data.py'))

for d in ('css', 'js', 'vendor'):
    target = dist / d
    if target.exists():
        shutil.rmtree(target)
    shutil.copytree(red / d, target)

html = (red / 'index.html').read_text(encoding='utf-8')

# Новая главная заменяет HTML, который собрал Vite. Поэтому SEO-метаданные
# и JSON-LD нужно заново сформировать из тех же content/*.json, что использует админка.
import json, re
from html import escape as escape_html

site = json.loads((root / 'content' / 'site.json').read_text(encoding='utf-8'))
hero = json.loads((root / 'content' / 'hero.json').read_text(encoding='utf-8'))
faq = json.loads((root / 'content' / 'faq.json').read_text(encoding='utf-8'))['items']
products = json.loads((root / 'content' / 'products.json').read_text(encoding='utf-8'))['items']
visible = [p for p in products if p.get('show') is not False and (p.get('image') or '').startswith('/img/unsorted/')]
prices = [int(p['price']) for p in visible if int(p.get('price') or 0) > 0]

def replace_one(source, pattern, value, label):
    updated, count = re.subn(
        pattern,
        lambda match: match.group(1) + escape_html(str(value), quote=True) + match.group(2),
        source,
        count=1,
    )
    if count != 1:
        sys.exit(f'Не удалось обновить {label} в redesign/index.html')
    return updated

html = replace_one(html, r'(<li><b>)\d+\+(</b><span>реальных работ в каталоге</span>)', len(visible), 'число работ в каталоге')
meat_prices = [int(p['price']) for p in visible if p.get('cat') == 'meat' and int(p.get('price') or 0) > 0]
if meat_prices:
    meat_min = f'{min(meat_prices):,}'.replace(',', ' ')
    html = replace_one(html, r'(<dt>Мясной букет</dt><dd>)()(съедается в тот же вечер</dd>)', f'от {meat_min} ₽ · ', 'цена мясного букета')
html = replace_one(html, r'(<title>)[^<]*(</title>)', site.get('seoTitle') or site['brand'], 'title')
html = replace_one(html, r'(<meta name="description" content=")[^"]*(")', site.get('seoDescription') or '', 'description')
html = replace_one(html, r'(<meta property="og:title" content=")[^"]*(")', site.get('seoTitle') or site['brand'], 'og:title')
html = replace_one(html, r'(<meta property="og:description" content=")[^"]*(")', site.get('seoDescription') or '', 'og:description')
html = replace_one(html, r'(<meta property="og:site_name" content=")[^"]*(")', site['brand'], 'og:site_name')

canonical = re.search(r'<link rel="canonical" href="([^"]+)"', html)
if not canonical:
    sys.exit('В redesign/index.html отсутствует canonical URL')
site_url = canonical.group(1).rstrip('/')
digits = re.sub(r'\D', '', str(site.get('phone', '')))
if digits.startswith('8'):
    digits = '7' + digits[1:]
if digits:
    html = html.replace('tel:+79631282556', 'tel:+' + digits).replace('https://t.me/+79631282556', 'https://t.me/+' + digits)
    html = html.replace('+7 (963) 128-25-56', escape_html(site['phone']))

hero_lines = hero['title'].replace(' в Ульяновске —', '\nв Ульяновске —').splitlines()
hero_heading = ''.join(f'<span class="line"><span>{escape_html(line)}</span></span>' for line in hero_lines)
accent = hero['titleAccent']
if accent.startswith('подарок '):
    hero_heading += f'<span class="line"><span>подарок <em class="gold">{escape_html(accent[8:])}</em></span></span>'
elif accent:
    hero_heading += f'<span class="line"><span><em class="gold">{escape_html(accent)}</em></span></span>'
html = re.sub(r'(<h1 class="hero__title" id="hero-title">)[\s\S]*?(</h1>)',
              lambda m: m[1] + hero_heading + m[2], html, count=1)
html = replace_one(html, r'(<p class="hero__lead reveal-up">)[^<]*(</p>)', hero['subtitle'], 'подзаголовок первого экрана')
html = replace_one(html, r'(<a href="#catalog" class="btn btn--primary magnetic" data-cursor="heart">)[^<]*(<svg)', hero['quizButton'], 'кнопка каталога')
faq_rows = ''.join('<details class="qa"><summary>' + escape_html(item['q']) +
                   '<span class="qa__ico"></span></summary><div class="qa__a"><p>' + escape_html(item['a']) +
                   '</p></div></details>' for item in faq)
html = re.sub(r'(<div class="faq__list">)[\s\S]*?(\n    </div>\n  </div>\n</section>)',
              lambda m: m[1] + faq_rows + m[2], html, count=1)
threshold = f"{int(site['freeDeliveryFrom']):,}".replace(',', ' ')
html = html.replace('доставки от 8 000 ₽', f'доставки от {threshold} ₽')
html = html.replace('бесплатно от 8 000 ₽', f'бесплатно от {threshold} ₽')
html = html.replace('При заказе от 8 000 ₽.', f'При заказе от {threshold} ₽.')
html = replace_one(html, r'(<div><h3>Самовывоз — бесплатно</h3><p>)[^<]*(</p>)',
                   f"{site['address']}. {site['hours']}.", 'адрес самовывоза')
html = replace_one(html, r'(<a href="tel:\+\d+" class="menu__phone">[^<]*</a>\s*<p>)[^<]*(</p>)',
                   f"{site['address']} · {site['hours']}", 'контакты мобильного меню')
footer_address = '<br>'.join(escape_html(value) for value in (site['city'], site['address'], site['hours']))
html = re.sub(r'(<address class="footer__list">)[\s\S]*?(</address>)',
              lambda m: m[1] + footer_address + m[2], html, count=1)

schema = {
    '@context': 'https://schema.org',
    '@type': 'Florist',
    '@id': site_url + '/#org',
    'name': site['brand'],
    'url': site_url + '/',
    'logo': site_url + '/logo-256.webp',
    'image': site_url + '/og-image.jpg',
    'description': f"Съедобные букеты с доставкой в городе {site.get('city', '')}",
    'priceRange': f"{min(prices)}–{max(prices)} ₽" if prices else '',
    'currenciesAccepted': 'RUB',
    'address': {
        '@type': 'PostalAddress',
        'streetAddress': ', '.join(str(site.get('address', '')).split(',')[:2]).strip(),
        'addressLocality': site.get('city', ''),
        'addressCountry': 'RU',
    },
    'areaServed': {'@type': 'City', 'name': site.get('city', '')},
    'sameAs': [value for value in (site.get('reviewsUrl'), site.get('vk')) if value],
}
if digits:
    schema['telephone'] = '+' + digits
if site.get('email'):
    schema['email'] = site['email']
hours = re.search(r'(\d{1,2}):(\d{2})\D+(\d{1,2}):(\d{2})', str(site.get('hours', '')))
if hours:
    schema['openingHoursSpecification'] = {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        'opens': f"{int(hours.group(1)):02d}:{hours.group(2)}",
        'closes': f"{int(hours.group(3)):02d}:{hours.group(4)}",
    }
if site.get('ownerName'):
    schema['founder'] = {'@type': 'Person', 'name': site['ownerName']}
    if site.get('inn'):
        schema['taxID'] = site['inn']

schema_json = json.dumps(schema, ensure_ascii=False, separators=(',', ':')).replace('<', r'\u003c')
html, schema_count = re.subn(
    r'(<script type="application/ld\+json">)[\s\S]*?(</script>)',
    lambda match: match.group(1) + schema_json + match.group(2),
    html,
    count=1,
)
if schema_count != 1:
    sys.exit('Не удалось обновить JSON-LD в redesign/index.html')

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
