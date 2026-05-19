import traceback
from datetime import datetime
from competitor_watcher import fetch_competitors, summarize_competitors
from topic_selector import select_topic, save_to_history
from script_writer import build_script, build_platform_posts
from video_generator import generate_video
from review_packager import build_review_package, push_to_wechat


def main():
    print(f"=== 三姐老火靓汤 AI视频智能体 | {datetime.now().isoformat()} ===\n")

    # ① 竞品监控
    print("[1/5] 抓取竞品动态...")
    competitors = fetch_competitors()
    competitor_summary = summarize_competitors(competitors)
    print(competitor_summary[:200])
    print()

    # ② AI选题
    print("[2/5] AI选题中...")
    topic_info = select_topic(competitor_summary)
    print(f"  主题类型: {topic_info.get('topic_type')}")
    print(f"  主打汤品: {topic_info.get('main_soup')}")
    print(f"  切入角度: {topic_info.get('angle')}")
    print()

    # ③ AI写脚本
    print("[3/5] AI生成脚本...")
    script = build_script(topic_info)
    print(f"  标题: {script.get('title')}")
    full = script.get('full_script', '')
    print(f"  脚本长度: {len(full)}字")
    print(f"  标签: {' '.join(script.get('hashtags', []))}")
    print()

    # 各平台发布文案
    platform_posts = build_platform_posts(script)
    for platform in platform_posts:
        print(f"  {platform}发布文案已生成")

    # ④ 视频生成
    print("\n[4/5] 生成视频制作包...")
    try:
        video_result = generate_video(script, topic_info)
        print(f"  状态: {video_result.get('status')}")
        print(f"  制作指导: {video_result.get('production_guide')}")
    except Exception as e:
        print(f"  视频生成异常: {e}")
        traceback.print_exc()
        video_result = {"status": "failed", "production_guide": "", "video_path": ""}

    # ⑤ 审核推送
    print("\n[5/5] 打包推送到微信...")
    review_content = build_review_package(topic_info, script, platform_posts, video_result)
    push_result = push_to_wechat(review_content)

    # 记录到历史
    save_to_history(
        topic=f"{topic_info.get('topic_type')}: {topic_info.get('main_soup')}",
        script_title=script.get("title", ""),
    )

    # 输出结果摘要
    print("\n" + "=" * 50)
    print("📊 生成完成")
    print(f"  选题: {topic_info.get('topic_type')}")
    print(f"  汤品: {topic_info.get('main_soup')}")
    print(f"  标题: {script.get('title')}")
    print(f"  推送: {'成功' if push_result.get('code') == 200 else '失败/未配置'}")

    # 打印完整审核包（本地查看用）
    print("\n" + "=" * 50)
    print("📋 审核包预览（前500字）:")
    print(review_content[:500])

    print("\n=== Done ===")
    return review_content


if __name__ == "__main__":
    main()
