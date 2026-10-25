#!/usr/bin/env python3
"""posts/ フォルダのMarkdown記事を読み込み、assets/js/posts.js を自動生成します。

使い方:  python3 build_posts.py
(GitHubにアップロードした場合は、GitHub Actionsが自動で実行します)
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
POSTS_DIR = ROOT / "posts"
OUTPUT = ROOT / "assets" / "js" / "posts.js"
DATA_JS = ROOT / "assets" / "js" / "data.js"


def category_ids():
    text = DATA_JS.read_text(encoding="utf-8")
    block = text.split("const CATEGORIES", 1)[-1].split("];", 1)[0]
    return set(re.findall(r'id:\s*"([^"]+)"', block))


def split_front_matter(text):
    text = text.lstrip("\ufeff")
    m = re.match(r"---[ \t]*\r?\n(.*?)\r?\n---[ \t]*\r?\n?(.*)", text, re.S)
    if not m:
        return {}, text
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line and not line.lstrip().startswith("#"):
            key, value = line.split(":", 1)
            meta[key.strip()] = value.strip().strip("\"'")
    return meta, m.group(2)


SAFE_URL = re.compile(r"^(https?://|/|\.{0,2}/|assets/|#|mailto:)", re.I)


def inline(text):
    text = html.escape(text, quote=False)

    def img(m):
        alt, url = m.group(1), m.group(2)
        if not SAFE_URL.match(url):
            return m.group(0)
        return f'<img src="{url}" alt="{html.escape(alt)}" loading="lazy">'

    def link(m):
        label, url = m.group(1), m.group(2)
        if not SAFE_URL.match(url):
            return m.group(0)
        external = url.lower().startswith("http")
        extra = ' target="_blank" rel="noopener noreferrer"' if external else ""
        return f'<a href="{url}"{extra}>{label}</a>'

    text = re.sub(r"!\[([^\]]*)\]\(([^)\s]+)\)", img, text)
    text = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", link, text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    return text


def markdown_to_html(md):
    out = []
    for block in re.split(r"\n\s*\n", md.strip().replace("\r\n", "\n")):
        lines = [l.rstrip() for l in block.split("\n") if l.strip()]
        if not lines:
            continue
        first = lines[0]
        if first.startswith("### "):
            out.append(f"<h3>{inline(first[4:])}</h3>")
            rest = lines[1:]
            if rest:
                out.append(f"<p>{'<br>'.join(inline(l) for l in rest)}</p>")
        elif first.startswith("## "):
            out.append(f"<h2>{inline(first[3:])}</h2>")
            rest = lines[1:]
            if rest:
                out.append(f"<p>{'<br>'.join(inline(l) for l in rest)}</p>")
        elif all(re.match(r"[-*] ", l) for l in lines):
            out.append("<ul>" + "".join(f"<li>{inline(l[2:])}</li>" for l in lines) + "</ul>")
        elif all(re.match(r"\d+\. ", l) for l in lines):
            out.append("<ol>" + "".join(f"<li>{inline(re.sub(r'^\d+\. ', '', l))}</li>" for l in lines) + "</ol>")
        elif all(l.startswith(">") for l in lines):
            out.append("<blockquote>" + "<br>".join(inline(l.lstrip("> ")) for l in lines) + "</blockquote>")
        elif len(lines) == 1 and re.fullmatch(r"!\[[^\]]*\]\([^)\s]+\)", lines[0]):
            out.append(f"<figure>{inline(lines[0])}</figure>")
        else:
            out.append("<p>" + "<br>".join(inline(l) for l in lines) + "</p>")
    return "\n".join(out)


def plain_first_paragraph(md):
    for block in re.split(r"\n\s*\n", md.strip()):
        line = block.strip().split("\n")[0]
        if line and not re.match(r"(#|!\[|[-*>] |\d+\. )", line):
            return re.sub(r"[*\[\]]|\([^)]*\)", "", line)[:90]
    return ""


def main():
    valid = category_ids()
    posts, problems = [], []
    for path in sorted(POSTS_DIR.glob("*.md")):
        if path.name.startswith("_") or path.name.lower() == "readme.md":
            continue
        meta, body = split_front_matter(path.read_text(encoding="utf-8"))
        if meta.get("draft", "").lower() in ("true", "yes", "1"):
            print(f"  下書きのためスキップ: {path.name}")
            continue

        m = re.match(r"(\d{4}-\d{2}-\d{2})-(.+)", path.stem)
        date = meta.get("date") or (m.group(1) if m else "")
        post_id = meta.get("id") or (m.group(2) if m else path.stem)
        title = meta.get("title", "")
        category = meta.get("category", "")

        if not title:
            problems.append(f"{path.name}: title がありません")
            continue
        if category not in valid:
            problems.append(f"{path.name}: category「{category}」が不正です (使えるID: {', '.join(sorted(valid))})")
            continue
        if not date:
            problems.append(f"{path.name}: 日付がありません (ファイル名を 2026-11-01-名前.md にするか、date: を書いてください)")
            continue

        post = {
            "id": post_id,
            "title": title,
            "description": meta.get("description") or plain_first_paragraph(body),
            "category": category,
            "tags": [t.strip() for t in re.split(r"[,、]", meta.get("tags", "")) if t.strip()],
            "date": date,
            "bodyHtml": markdown_to_html(body),
        }
        if meta.get("image"):
            post["image"] = meta["image"]
        if meta.get("relatedVideo"):
            post["relatedVideo"] = meta["relatedVideo"]
        posts.append(post)

    ids = [p["id"] for p in posts]
    for dup in {i for i in ids if ids.count(i) > 1}:
        problems.append(f"記事ID「{dup}」が重複しています")

    if problems:
        print("エラー:")
        for p in problems:
            print("  - " + p)
        sys.exit(1)

    posts.sort(key=lambda p: p["date"], reverse=True)
    OUTPUT.write_text(
        "/* このファイルは build_posts.py が自動生成します。直接編集しないでください。\n"
        "   記事は posts/ フォルダのMarkdownファイルを編集してください。 */\n"
        "const POSTS = " + json.dumps(posts, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    print(f"{len(posts)} 件の記事を {OUTPUT.relative_to(ROOT)} に書き出しました。")


if __name__ == "__main__":
    main()
