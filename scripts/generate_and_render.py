#!/usr/bin/env python3
"""End-to-end script generation + timeline build + render command.

Usage: py scripts/generate_and_render.py <viral|flash|deep> "<topic>"

Example: py scripts/generate_and_render.py viral "中山买错房亏47万"
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.script_writer import generate_scripts_for_tier
from shared.timeline_builder import script_to_timeline_json


def main():
    if len(sys.argv) < 3:
        print("Usage: py scripts/generate_and_render.py <viral|flash|deep> <topic>")
        print("Example: py scripts/generate_and_render.py viral '中山买错房亏47万'")
        sys.exit(1)

    tier = sys.argv[1]
    topic = sys.argv[2]

    valid_tiers = {"viral", "flash", "deep"}
    if tier not in valid_tiers:
        print(f"Unknown tier: {tier}. Use: {', '.join(sorted(valid_tiers))}")
        sys.exit(1)

    # Load API key from environment or sanjie-soup-agent config
    api_key = os.environ.get("DEEPSEEK_API_KEY", "")
    if not api_key:
        try:
            sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'sanjie-soup-agent'))
            from config import DEEPSEEK_API_KEY
            api_key = DEEPSEEK_API_KEY
        except ImportError:
            print("ERROR: DEEPSEEK_API_KEY not found.")
            print("Set the DEEPSEEK_API_KEY environment variable or configure sanjie-soup-agent/config.py")
            sys.exit(1)

    # Step 1: Generate script
    print(f"\n📝 Generating {tier} script for: {topic}")
    suggestions = [topic]
    scripts = generate_scripts_for_tier(suggestions, tier, api_key)

    if not scripts:
        print("❌ Script generation failed (API may be unavailable)")
        sys.exit(1)

    script = scripts[0]
    print(f"   Title: {script.get('title', 'N/A')}")
    print(f"   Hook: {script.get('hook', 'N/A')}")
    print(f"   CTA: {script.get('cta', 'N/A')}")

    # Step 2: Build timeline JSON
    print(f"\n🎬 Building timeline JSON...")
    timeline_path = script_to_timeline_json(script, tier=tier)
    print(f"   Saved: {timeline_path}")

    # Step 3: Print render command
    output_filename = os.path.basename(timeline_path).replace('.json', '.mov')
    print(f"\n🎥 To render, run:")
    print(f"   cd remotion-realestate")
    print(f"   npx tsx scripts/render_pip.ts ../{timeline_path.replace(chr(92), '/')} out/{output_filename}")
    print(f"\n✅ Done! Script + Timeline generated.")


if __name__ == "__main__":
    main()
