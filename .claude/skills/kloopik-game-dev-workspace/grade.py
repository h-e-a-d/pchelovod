#!/usr/bin/env python3
"""Grade assertion checks for kloopik-game-dev eval iteration-1."""
import json, re, os, sys

BASE = "/Users/egalvans/.claude/skills/kloopik-game-dev-workspace/iteration-1"

def read(path):
    try:
        with open(path) as f:
            return f.read()
    except:
        return ""

def check(text, pattern, flags=re.IGNORECASE):
    return bool(re.search(pattern, text, flags))

def grade_catalog(path):
    text = read(path)
    if not text:
        return False, "file missing"
    try:
        data = json.loads(text)
        required = ["slug","title","category","description","emoji","controls","howToPlay","about"]
        missing = [f for f in required if f not in data]
        if missing:
            return False, f"missing fields: {missing}"
        return True, f"all fields present, slug={data['slug']}"
    except Exception as e:
        return False, str(e)

EVALS = [
    {
        "name": "tetris-add",
        "configs": ["with_skill", "without_skill"],
        "assertions": [
            ("game_html_present",       lambda h,_: (len(h)>100, f"len={len(h)}")),
            ("catalog_entry_complete",  lambda _,c: grade_catalog(c)),
            ("gamesdk_showad_preroll",  lambda h,_: (check(h, r'await\s+GameSDK\.showAd\(\)'), "checked preroll pattern")),
            ("gamesdk_showad_interstitial", lambda h,_: (h.count("GameSDK.showAd()")>=2, f"showAd count={h.count('GameSDK.showAd()')}")),
            ("gamesdk_save_called",     lambda h,_: (check(h, r'GameSDK\.save\('), "checked save call")),
            ("onsaveloaded_implemented",lambda h,_: (check(h, r'function\s+onSaveLoaded'), "checked function def")),
            ("all_7_tetrominoes",       lambda h,_: (all(p in h for p in ['I','O','T','S','Z','J','L']) and check(h, r'tetromino|piece|shape', re.I), "checked piece defs")),
            ("arrow_key_preventdefault",lambda h,_: (check(h, r'preventDefault'), "checked preventDefault")),
            ("dark_theme",              lambda h,_: (check(h, r'#0{1,3}[a-f0-9]{0,4}|#000|background.*#[01]', re.I), "checked dark bg")),
            ("line_clear_logic",        lambda h,_: (check(h, r'splice|clearLine|full|complete', re.I), "checked line-clear")),
        ]
    },
    {
        "name": "flappy-bird-clone",
        "configs": ["with_skill", "without_skill"],
        "assertions": [
            ("game_html_present",       lambda h,_: (len(h)>100, f"len={len(h)}")),
            ("catalog_entry_complete",  lambda _,c: grade_catalog(c)),
            ("gamesdk_showad_preroll",  lambda h,_: (check(h, r'await\s+GameSDK\.showAd\(\)'), "checked preroll")),
            ("gamesdk_showad_interstitial", lambda h,_: (h.count("GameSDK.showAd()")>=2, f"showAd count={h.count('GameSDK.showAd()')}")),
            ("gamesdk_save_called",     lambda h,_: (check(h, r'GameSDK\.save\('), "checked save")),
            ("onsaveloaded_implemented",lambda h,_: (check(h, r'function\s+onSaveLoaded'), "checked function def")),
            ("requestanimationframe_loop",lambda h,_: (check(h, r'requestAnimationFrame'), "checked rAF")),
            ("gravity_physics",         lambda h,_: (check(h, r'gravity|vel[oY]|vy\s*[\+\-]?=', re.I), "checked gravity")),
            ("pipe_scrolling",          lambda h,_: (check(h, r'pipe|obstacle|column', re.I), "checked pipes")),
            ("dark_theme",              lambda h,_: (check(h, r'#0{1,3}[a-f0-9]{0,4}|#000|background.*#[01]', re.I), "checked dark bg")),
        ]
    },
    {
        "name": "minesweeper-add",
        "configs": ["with_skill", "without_skill"],
        "assertions": [
            ("game_html_present",       lambda h,_: (len(h)>100, f"len={len(h)}")),
            ("catalog_entry_complete",  lambda _,c: grade_catalog(c)),
            ("gamesdk_showad_preroll",  lambda h,_: (check(h, r'await\s+GameSDK\.showAd\(\)'), "checked preroll")),
            ("gamesdk_showad_interstitial", lambda h,_: (h.count("GameSDK.showAd()")>=2, f"showAd count={h.count('GameSDK.showAd()')}")),
            ("gamesdk_save_called",     lambda h,_: (check(h, r'GameSDK\.save\('), "checked save")),
            ("onsaveloaded_implemented",lambda h,_: (check(h, r'function\s+onSaveLoaded'), "checked function def")),
            ("right_click_flag",        lambda h,_: (check(h, r'contextmenu|right.?click|button.*2|button===2', re.I), "checked right-click")),
            ("flood_fill_reveal",       lambda h,_: (check(h, r'flood|queue|recursive|reveal.*neighbor|BFS', re.I), "checked flood-fill")),
            ("first_click_safety",      lambda h,_: (check(h, r'first.?click|firstClick|safe|after.*click|placeMines', re.I), "checked first-click safety")),
            ("dark_theme",              lambda h,_: (check(h, r'#0{1,3}[a-f0-9]{0,4}|#000|background.*#[01]', re.I), "checked dark bg")),
        ]
    },
]

results = {}
for ev in EVALS:
    ev_name = ev["name"]
    results[ev_name] = {}
    for cfg in ev["configs"]:
        html_path = f"{BASE}/{ev_name}/{cfg}/outputs/game.html"
        cat_path  = f"{BASE}/{ev_name}/{cfg}/outputs/catalog_entry.json"
        html = read(html_path)
        expectations = []
        passed = 0
        for (assert_id, fn) in ev["assertions"]:
            ok, evidence = fn(html, cat_path)
            expectations.append({"text": assert_id, "passed": ok, "evidence": evidence})
            if ok: passed += 1
        grading = {"pass_count": passed, "total": len(ev["assertions"]), "pass_rate": round(passed/len(ev["assertions"]),2), "expectations": expectations}
        out_dir = f"{BASE}/{ev_name}/{cfg}"
        with open(f"{out_dir}/grading.json", "w") as f:
            json.dump(grading, f, indent=2)
        results[ev_name][cfg] = grading
        print(f"{ev_name}/{cfg}: {passed}/{len(ev['assertions'])} passed")

print("\n--- SUMMARY ---")
for ev_name, cfgs in results.items():
    for cfg, g in cfgs.items():
        print(f"  {ev_name}/{cfg}: {g['pass_rate']*100:.0f}%")
