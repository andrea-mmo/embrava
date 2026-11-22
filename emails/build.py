#!/usr/bin/env python3
"""Embrava · email builder.

Generates the six concept emails (welcome x3, abandoned cart x2, launch x1).

    python3 build.py             -> preview files in this folder (sample data, relative images)
    python3 build.py --klaviyo   -> klaviyo/ folder (merge tags, absolute image URLs)

Only the Klaviyo merge tags marked "untested" in the README of the case study
have not been run against a real account.
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
KLAVIYO = "--klaviyo" in sys.argv
PAGES = "https://andrea-mmo.github.io/embrava/"
IMG = PAGES + "emails/img/" if KLAVIYO else "img/"
SHOP = PAGES if KLAVIYO else "../"
OUT = HERE / "klaviyo" if KLAVIYO else HERE

# Palette (terracotta lives only inside the logo images)
ESPRESSO, SAND, CREAM, DARK, MUTED, SURFACE = "#3A2A22", "#D9C4A2", "#F4EEE3", "#2A2624", "#7A706A", "#FBFAF7"
OUTER = "#E9E1D2"
FONT = "Jost, 'Helvetica Neue', Helvetica, Arial, sans-serif"

# Merge tags (Klaviyo) or sample data (preview)
FIRST = "{{ first_name|default:'there' }}" if KLAVIYO else "Sam"
UNSUB = "{% unsubscribe %}" if KLAVIYO else '<a href="#" style="color:%s">Unsubscribe</a>' % SAND
ADDRESS = "{{ organization.full_address }}" if KLAVIYO else "Embrava · concept brand, no postal address"
CART_URL = "{{ event.extra.checkout_url }}" if KLAVIYO else SHOP


def url(path=""):
    return SHOP + path


def img(name, w, alt, extra=""):
    return (f'<img src="{IMG}{name}" width="{w}" alt="{alt}" '
            f'style="display:block;width:100%;max-width:{w}px;height:auto;border:0" {extra}>')


def h1(text):
    return (f'<h1 class="h1" style="margin:0 0 20px;font-family:{FONT};font-size:26px;font-weight:300;'
            f'letter-spacing:.2em;text-transform:uppercase;line-height:1.35;color:{DARK}">{text}</h1>')


def eyebrow(text):
    return (f'<p style="margin:0 0 14px;font-family:{FONT};font-size:12px;font-weight:400;letter-spacing:.24em;'
            f'text-transform:uppercase;color:{MUTED}">{text}</p>')


def p(text, size=16, color=DARK, mb=18, extra=""):
    return (f'<p style="margin:0 0 {mb}px;font-family:{FONT};font-size:{size}px;font-weight:300;'
            f'line-height:1.6;color:{color};{extra}">{text}</p>')


def button(label, href, light=False):
    bg, fg = (CREAM, ESPRESSO) if light else (ESPRESSO, CREAM)
    return (f'<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>'
            f'<td bgcolor="{bg}" style="background:{bg}">'
            f'<a href="{href}" target="_blank" style="display:inline-block;padding:15px 32px;font-family:{FONT};'
            f'font-size:13px;font-weight:400;letter-spacing:.2em;text-transform:uppercase;text-decoration:none;'
            f'color:{fg}">{label}</a></td></tr></table>')


def link(label, href):
    return (f'<a href="{href}" target="_blank" style="font-family:{FONT};font-size:14px;color:{DARK};'
            f'text-decoration:underline;text-underline-offset:3px">{label}</a>')


def block(inner, bg=None, pad="40px 40px"):
    bgattr = f' bgcolor="{bg}" style="background:{bg};padding:{pad}"' if bg else f' style="padding:{pad}"'
    return f'<tr><td class="px"{bgattr}>{inner}</td></tr>'


def swatches():
    cells = ""
    for name, bg, fg, border in (("Espresso", ESPRESSO, CREAM, ESPRESSO), ("Sand", SAND, ESPRESSO, SAND),
                                 ("Cream", CREAM, ESPRESSO, SAND)):
        cells += (f'<td width="33%" align="center" bgcolor="{bg}" style="background:{bg};border:1px solid {border};'
                  f'padding:26px 0;font-family:{FONT};font-size:12px;letter-spacing:.2em;text-transform:uppercase;'
                  f'color:{fg}">{name}</td>')
    return (f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">'
            f'<tr>{cells}</tr></table>')


def three_cols(cells):
    """Three equal columns with real gaps; stack on mobile."""
    gap = '<td class="gap" width="12" style="width:12px;font-size:0;line-height:0">&nbsp;</td>'
    tds = [f'<td class="stack" width="32%" valign="top">{c}</td>' for c in cells]
    return ('<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
            + gap.join(tds) + '</tr></table>')


def kit_row(image, alt, name, items, price, was, href, last=False):
    border = "" if last else f"border-bottom:1px solid {SAND};"
    return (f'<tr><td style="padding:22px 0;{border}">'
            f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
            f'<td class="stack" width="42%" valign="middle" style="padding-right:22px">{img(image, 220, alt)}</td>'
            f'<td class="stack" valign="middle">'
            f'<p style="margin:0 0 6px;font-family:{FONT};font-size:15px;letter-spacing:.18em;text-transform:uppercase;color:{DARK}">{name}</p>'
            f'{p(items, 14, MUTED, 8)}'
            f'<p style="margin:0 0 14px;font-family:{FONT};font-size:16px;color:{DARK}">£{price} '
            f'<span style="color:{MUTED};text-decoration:line-through;font-weight:300">£{was}</span></p>'
            f'{link("View the " + name, href)}'
            f'</td></tr></table></td></tr>')


def page(title, preheader, rows):
    head_css = """
body{margin:0;padding:0;background:%s}
a{color:inherit}
@media only screen and (max-width:620px){
  .wrap{width:100%%!important}
  .px{padding-left:24px!important;padding-right:24px!important}
  .h1{font-size:21px!important}
  .stack{display:block!important;width:100%%!important;padding:0 0 14px!important}
  .gap{display:none!important}
  .stack img{max-width:none!important;width:100%%!important}
}""" % OUTER
    footer = (
        f'<tr><td class="px" align="center" bgcolor="{ESPRESSO}" style="background:{ESPRESSO};padding:44px 40px">'
        f'<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td>'
        f'<img src="{IMG}logo-espresso.png" width="200" alt="Embrava" style="display:block;width:200px;height:auto;border:0;background:{ESPRESSO}">'
        f'</td></tr></table>'
        f'<p style="margin:18px 0 26px;font-family:{FONT};font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:{SAND}">Strength. Character. Movement.</p>'
        f'<p style="margin:0 0 6px;font-family:{FONT};font-size:12px;font-weight:300;line-height:1.7;color:{SAND}">'
        f'You are receiving this because you signed up at embrava.<br>{UNSUB}</p>'
        f'<p style="margin:0;font-family:{FONT};font-size:12px;font-weight:300;line-height:1.7;color:{SAND}">{ADDRESS}</p>'
        f'<p style="margin:14px 0 0;font-family:{FONT};font-size:11px;font-weight:300;color:{SAND}">'
        f'Concept project: product images are mockups and prices are illustrative.</p>'
        f'</td></tr>')
    header = (
        f'<tr><td align="center" bgcolor="{CREAM}" style="background:{CREAM};padding:30px 40px 26px">'
        f'<a href="{url()}" target="_blank"><img src="{IMG}logo-cream.png" width="220" alt="Embrava" '
        f'style="display:block;width:220px;height:auto;border:0;background:{CREAM}"></a></td></tr>')
    return f"""<!doctype html>
<html lang="en-GB" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>{title}</title>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400&display=swap" rel="stylesheet">
<style>{head_css}</style>
</head>
<body style="margin:0;padding:0;background:{OUTER}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:{OUTER}">{preheader}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="{OUTER}" style="background:{OUTER}">
<tr><td align="center" style="padding:28px 12px">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="{CREAM}" style="width:600px;max-width:600px;background:{CREAM}">
{header}
{rows}
{footer}
</table>
</td></tr></table>
</body>
</html>
"""


def hero(name, alt):
    return f'<tr><td style="padding:0;font-size:0;line-height:0">{img(name, 600, alt)}</td></tr>'


# ---------------------------------------------------------------- emails
EMAILS = {}

# W1 · Welcome, sent immediately
EMAILS["welcome-1"] = dict(
    subject="Welcome to Embrava",
    preheader="Free UK delivery on your first order, no minimum.",
    rows=hero("bag_sand.jpg", "Embrava gym bag in sand") + block(
        eyebrow("Welcome") + h1(f"Hello {FIRST}.") +
        p("Embrava is training gear for people who lift, stretch or run, and then go for a coffee. "
          "Everything comes in three warm colours, Espresso, Sand and Cream, so whatever you pick goes with the rest.") +
        p("Start with one piece or a whole kit. You choose.", mb=28) +
        button("Shop the range", url("#shop")), pad="44px 40px 36px") +
    block(
        f'<p style="margin:0 0 8px;font-family:{FONT};font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:{MUTED}">Your welcome gift</p>'
        f'<p style="margin:0 0 8px;font-family:{FONT};font-size:22px;font-weight:300;letter-spacing:.14em;text-transform:uppercase;color:{DARK}">Free UK delivery</p>'
        + p("On your first order, with no minimum spend. Use the code at checkout within 14 days.", 15, DARK, 14) +
        f'<p style="margin:0;font-family:{FONT};font-size:18px;letter-spacing:.3em;color:{ESPRESSO}"><strong style="font-weight:500">WELCOME</strong></p>',
        bg=SAND, pad="34px 40px") +
    block(swatches(), pad="36px 40px 44px"),
)

# W2 · Kits, +2 days
EMAILS["welcome-2"] = dict(
    subject="Where do you train?",
    preheader="Three kits, and each one saves 20%.",
    rows=block(
        eyebrow("Kits") + h1("Where do you<br>train?") +
        p("Pick the kit that fits your week. Each one costs 20% less than buying the pieces on their own, "
          "and every kit comes with free UK delivery.", mb=8), pad="44px 40px 8px") +
    block(
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' +
        kit_row("kit_gym.jpg", "The Gym kit: gym bag, shaker and lifting straps", "Gym kit",
                "Gym bag, shaker, lifting straps. For weights and the gym.", "44", "55", url("#kits")) +
        kit_row("kit_home.jpg", "The Home kit: yoga mat, mini bands and socks", "Home kit",
                "Yoga mat, mini bands, socks. For mat work at home.", "36.80", "46", url("#kits")) +
        kit_row("kit_starter.jpg", "The Starter kit: tote bag, bottle and scrunchie", "Starter kit",
                "Tote bag, insulated bottle, scrunchie. Your first week.", "24.80", "31", url("#kits"), last=True) +
        '</table>', pad="0 40px 12px") +
    block(p("Your free delivery code <strong style=\"font-weight:500\">WELCOME</strong> is still waiting for your first order.", 14, MUTED, 0),
          pad="12px 40px 44px"),
)

# W3 · Build your own, +5 days
EMAILS["welcome-3"] = dict(
    subject="Build your own kit",
    preheader="Any three pieces, in any colours, for 15% less.",
    rows=block(
        eyebrow("Build your own kit") + h1("Your combo,<br>your colours.") +
        p("None of the kits quite right? Pick any three pieces, in any colours, and save 15% on the lot. "
          "Here is one way to do it.", mb=8), pad="44px 40px 28px") +
    block(three_cols([
        img("bottle_espresso.jpg", 168, "Insulated bottle in espresso") + p("Insulated bottle<br>Espresso · £14", 13, MUTED, 0, "padding-top:8px"),
        img("tote_cream.jpg", 168, "Tote bag in cream") + p("Tote bag<br>Cream · £12", 13, MUTED, 0, "padding-top:8px"),
        img("socks_sand.jpg", 168, "Socks in sand") + p("Socks<br>Sand · £8", 13, MUTED, 0, "padding-top:8px"),
    ]), pad="0 40px 28px") +
    block(
        f'<p style="margin:0 0 6px;font-family:{FONT};font-size:15px;color:{DARK}">Three pieces, £34. With 15% off: '
        f'<strong style="font-weight:500">£28.90</strong>.</p>'
        + p("Add a fourth and free UK delivery starts from £40.", 14, MUTED, 24) +
        button("Start building", url("#build")), pad="0 40px 36px") +
    block(p("Still using your <strong style=\"font-weight:500\">WELCOME</strong> code? It covers delivery on your first order for 14 days after you signed up.",
            14, DARK, 0), bg=SAND, pad="28px 40px"),
)

# C1 · Abandoned cart, +1 hour
cart_item = (
    '<table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid %s;border-bottom:1px solid %s"><tr>'
    '<td width="120" style="padding:18px 20px 18px 0">%s</td>'
    '<td valign="middle" style="padding:18px 0"><p style="margin:0 0 4px;font-family:%s;font-size:15px;letter-spacing:.14em;text-transform:uppercase;color:%s">Gym bag</p>'
    '<p style="margin:0;font-family:%s;font-size:13px;font-weight:300;color:%s">Espresso · Qty 1</p></td>'
    '<td align="right" valign="middle" style="padding:18px 0;font-family:%s;font-size:15px;color:%s">£35.00</td>'
    '</tr></table>'
) % (SAND, SAND, img("bag_espresso.jpg", 120, "Gym bag in espresso"), FONT, DARK, FONT, MUTED, FONT, DARK)

EMAILS["cart-1"] = dict(
    subject="Still thinking it over?",
    preheader="Your Gym bag is waiting in your basket.",
    rows=block(
        eyebrow("Your basket") + h1("You left something<br>behind.") +
        p("No rush. We have kept your basket as you left it.", mb=26) + cart_item +
        p("Free UK delivery starts at £40. You are £5 away.", 14, MUTED, 28, "padding-top:18px") +
        button("Return to your basket", CART_URL), pad="48px 40px 52px"),
)

# C2 · Abandoned cart, +24 hours
EMAILS["cart-2"] = dict(
    subject="Make it a kit and save £11",
    preheader="The Gym kit is £44 for three pieces, with free delivery.",
    rows=hero("kit_gym.jpg", "The Gym kit: gym bag, shaker and lifting straps") + block(
        eyebrow("A thought on your basket") + h1("Make it<br>a kit.") +
        p("Your Gym bag is £35 on its own. Add a shaker and lifting straps and the Gym kit comes to "
          "<strong style=\"font-weight:500\">£44</strong> instead of £55, with free UK delivery.", mb=28) +
        button("Get the Gym kit", url("#kits")) +
        p(f'<br>{link("Or go back to your basket", CART_URL)}', 14, DARK, 0), pad="44px 40px 52px"),
)

# L1 · Launch campaign
EMAILS["launch"] = dict(
    subject="The first Embrava collection is here",
    preheader="Espresso, Sand, Cream. Three kits, one range.",
    rows=hero("bag_sand.jpg", "Embrava gym bag in sand") + block(
        eyebrow("The first collection") + h1("Espresso.<br>Sand. Cream.") +
        p("Eleven pieces, three colours, made to go together. For the week you actually have: weights, mat work, "
          "and the coffee afterwards.", mb=28) +
        button("Shop the collection", url("#shop")), pad="44px 40px 36px") +
    block(swatches(), pad="0 40px 40px") +
    block(
        eyebrow("Three kits") +
        three_cols([
            img(f, 168, alt) + p(f"{name}<br>£{price}", 13, DARK, 0, "padding-top:8px")
            for f, alt, name, price in (
                ("kit_gym.jpg", "The Gym kit", "Gym kit", "44"),
                ("kit_home.jpg", "The Home kit", "Home kit", "36.80"),
                ("kit_starter.jpg", "The Starter kit", "Starter kit", "24.80"))
        ]) +
        p(f'Every kit saves 20%. Or <a href="{url("#build")}" target="_blank" style="color:{DARK}">build your own</a>: any three pieces, 15% off.',
          14, MUTED, 0, "padding-top:20px"),
        bg=SAND, pad="36px 40px"),
)


def main():
    OUT.mkdir(exist_ok=True)
    for name, e in EMAILS.items():
        (OUT / f"{name}.html").write_text(page(e["subject"], e["preheader"], e["rows"]), encoding="utf-8")
    print(f"Wrote {len(EMAILS)} emails to {OUT}")


if __name__ == "__main__":
    main()
