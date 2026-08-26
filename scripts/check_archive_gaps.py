#!/usr/bin/env python3
"""
大樹小講「歷史紀錄自動同步檢查」（2026-08-27 教練要求建立）

背景：index.html 的 SESSION_DATES 會把過期場次自動從「近期場次」清單移除
（buildSessions() 的 `d.date >= today` 過濾），但 archive/大樹小講_歷史講座紀錄.html
的 EVENTS 是另一份手動維護的清單（含宣傳圖 img/連結 link 等豐富內容），
兩份資料互不相通——場次過期後「消失」但沒有被搬進歷史紀錄，教練覺得像是
憑空不見了。

這支腳本不會、也不能完全自動化搬移（EVENTS 每筆需要一張宣傳圖 img，
這是設計素材，AI 沒有），但能做到「系統」該做的部分：找出哪些已經
過去的場次，還沒有出現在歷史紀錄裡，變成一張永遠不會漏掉的檢查清單。

用法：python3 scripts/check_archive_gaps.py
建議時機：每次新增/修改 SESSION_DATES 之後、或教練問「歷史紀錄齊不齊」時跑一次。
"""
import re
import sys
from datetime import date
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
INDEX_HTML = REPO / "index.html"
ARCHIVE_HTML = REPO / "archive" / "大樹小講_歷史講座紀錄.html"


def parse_session_dates(text: str):
    m = re.search(r"const SESSION_DATES = \[(.*?)\n\];", text, re.S)
    if not m:
        return []
    block = m.group(1)
    entries = []
    for entry_match in re.finditer(r"\{([^{}]*)\}", block):
        entry = entry_match.group(1)
        date_m = re.search(r"date:'([\d-]+)'", entry)
        topic_m = re.search(r"topic:'([^']*)'", entry)
        location_m = re.search(r"location:'([^']*)'", entry)
        if date_m:
            entries.append({
                "date": date_m.group(1),
                "topic": topic_m.group(1) if topic_m else "",
                "location": location_m.group(1) if location_m else "",
            })
    return entries


def parse_archive_dates(text: str) -> set:
    m = re.search(r"const EVENTS = \[(.*?)\n\];", text, re.S)
    if not m:
        return set()
    block = m.group(1)
    dates = set()
    # archive 的 date 欄位是中文全稱「2026 年 8 月 26 日」，轉成 YYYY-MM-DD 方便比對
    for date_m in re.finditer(r"(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日", block):
        y, mo, d = date_m.groups()
        dates.add(f"{y}-{int(mo):02d}-{int(d):02d}")
    return dates


def main():
    if not INDEX_HTML.exists() or not ARCHIVE_HTML.exists():
        print("找不到 index.html 或 archive 頁面，請確認在 bigtree repo 根目錄執行")
        sys.exit(1)

    sessions = parse_session_dates(INDEX_HTML.read_text(encoding="utf-8"))
    archived_dates = parse_archive_dates(ARCHIVE_HTML.read_text(encoding="utf-8"))

    today_str = date.today().isoformat()
    past_sessions = [s for s in sessions if s["date"] < today_str]
    gaps = [s for s in past_sessions if s["date"] not in archived_dates]

    if not gaps:
        print(f"✅ 檢查 {len(past_sessions)} 場已過期場次，全部已收錄進歷史紀錄，沒有缺漏")
        return

    print(f"⚠️ 發現 {len(gaps)} 場已過期場次尚未收錄進歷史紀錄（archive/大樹小講_歷史講座紀錄.html）：")
    for g in gaps:
        print(f"  - {g['date']}｜{g['location']}｜{g['topic']}")
    print("\n這些場次需要一張宣傳圖(img)才能加進 EVENTS 陣列，這部分需要教練提供"
          "素材或授權用其他既有照片代替，AI 不會自己生圖。")
    sys.exit(2)


if __name__ == "__main__":
    main()
