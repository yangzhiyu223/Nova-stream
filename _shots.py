import asyncio, sys
from playwright.async_api import async_playwright

PAGES = ["index","categories","creators","creator","watch","profile","search","messages","friends","upload","settings","login","feed","empty"]

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="msedge")
        ctx = await b.new_context(viewport={"width":1440,"height":900})
        await ctx.add_init_script("try{sessionStorage.setItem('ns_notice_seen','1')}catch(e){}")
        pg = await ctx.new_page()
        for name in PAGES:
            await pg.goto(f"file:///C:/Users/b2238/Desktop/novastream/{name}.html")
            await pg.wait_for_timeout(900)
            try:
                await pg.click(".ns-notice-btn", timeout=800)
                await pg.wait_for_timeout(400)
            except Exception:
                pass
            await pg.wait_for_timeout(400)
            await pg.screenshot(path=f"C:/Users/b2238/Desktop/novastream/shot_{name}.png")
            print(name, "done")
        await b.close()

asyncio.run(main())
