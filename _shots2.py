import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="msedge")
        ctx = await b.new_context(viewport={"width":1440,"height":900})
        await ctx.add_init_script("try{sessionStorage.setItem('ns_notice_seen','1');localStorage.setItem('ns_history',JSON.stringify(['游戏装备推荐','极简桌面']));}catch(e){}")
        pg = await ctx.new_page()

        # 搜索页：空态 + 联想展开
        await pg.goto("file:///C:/Users/b2238/Desktop/novastream/search.html")
        await pg.wait_for_timeout(900)
        await pg.click("#q")
        await pg.fill("#q", "游戏")
        await pg.wait_for_timeout(500)
        await pg.screenshot(path="C:/Users/b2238/Desktop/novastream/fix_search_suggest.png")

        # 搜索页：有结果的列表
        await pg.goto("file:///C:/Users/b2238/Desktop/novastream/search.html?q=%E6%B8%B8%E6%88%8F")
        await pg.wait_for_timeout(900)
        await pg.screenshot(path="C:/Users/b2238/Desktop/novastream/fix_search_result.png")

        # 订阅页 + 只看已订阅
        await ctx.add_init_script("try{localStorage.setItem('ns_subs',JSON.stringify(['Maya Chen']));}catch(e){}")
        await pg.goto("file:///C:/Users/b2238/Desktop/novastream/creators.html")
        await pg.wait_for_timeout(900)
        await pg.screenshot(path="C:/Users/b2238/Desktop/novastream/fix_creators.png")
        await pg.click("#onlySub")
        await pg.wait_for_timeout(500)
        await pg.screenshot(path="C:/Users/b2238/Desktop/novastream/fix_creators_only.png")

        await b.close()

asyncio.run(main())
