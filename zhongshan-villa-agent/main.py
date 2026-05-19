"""中山壹号墅 公众号内容系统 — 统一入口

用法:
  # 运行情报采集（自动模式，由GitHub Actions定时触发）
  python main.py scout

  # 生成文章初稿（手动模式）
  python main.py workshop --pillar 1 --community "凯茵新城别墅"
  python main.py workshop --pillar 2 --topic "别墅庭院的四季打理"
  python main.py workshop --pillar 3
  python main.py workshop --pillar 4 --topic "探访秀丽湖山庄业主陈生"

  # 转换为Jacky口播版
  python main.py hub --input output/2026-05-20-凯茵新城别墅-别墅深探.md
"""

import sys
import argparse
from datetime import datetime

from scout import run_scout
from pusher import push_to_wechat


def cmd_scout():
    """运行情报采集，推送选题简报到微信"""
    brief = run_scout()

    date_str = datetime.now().strftime("%m/%d")
    title = f"🏡 中山壹号墅选题简报 {date_str}"
    result = push_to_wechat(title, brief)

    if result.get("code") == 200:
        print("[main] 选题简报已推送到微信")
    else:
        print(f"[main] 推送失败: {result.get('msg')}")

    # 同时打印到控制台
    print(brief)


def cmd_workshop(args):
    """运行内容工坊"""
    from workshop import generate_article, generate_video_script, save_output

    community = args.community or ""
    topic = args.topic or ""

    print(f"[main] 内容工坊启动 | 支柱{args.pillar} | 楼盘:{community} | 主题:{topic}")

    article = generate_article(
        pillar=args.pillar,
        community=community,
        topic=topic,
    )

    script = generate_video_script(article)

    filepath = save_output(article, script, args.pillar, community)
    print(f"[main] 初稿生成完成 -> {filepath}")
    print("[main] 请润色后发布。")


def cmd_hub(args):
    """运行生态枢纽"""
    from hub import convert_to_jacky_style, generate_cross_promo

    output_path = convert_to_jacky_style(args.input)

    # 同时输出互推文案
    cross_promo = generate_cross_promo()
    print(cross_promo)
    print(f"[main] Jacky口播版 -> {output_path}")


def main():
    parser = argparse.ArgumentParser(description="中山壹号墅 公众号内容系统")
    subparsers = parser.add_subparsers(dest="command", help="子命令")

    # scout 子命令
    subparsers.add_parser("scout", help="运行情报采集，推送选题简报")

    # workshop 子命令
    workshop_parser = subparsers.add_parser("workshop", help="运行内容工坊，生成初稿")
    workshop_parser.add_argument("--pillar", type=int, required=True, choices=[1, 2, 3, 4],
                                 help="内容支柱: 1=别墅深探 2=生活方式 3=市场内参 4=IP故事")
    workshop_parser.add_argument("--community", type=str, default="",
                                 help="目标楼盘名称（支柱1必填）")
    workshop_parser.add_argument("--topic", type=str, default="",
                                 help="文章主题")

    # hub 子命令
    hub_parser = subparsers.add_parser("hub", help="转换为Jacky口播版")
    hub_parser.add_argument("--input", type=str, required=True,
                            help="公众号文章路径")

    args = parser.parse_args()

    if args.command == "scout":
        cmd_scout()
    elif args.command == "workshop":
        cmd_workshop(args)
    elif args.command == "hub":
        cmd_hub(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
