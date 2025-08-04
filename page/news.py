import requests
from bs4 import BeautifulSoup
from datetime import datetime

# 예시: 2025-08-04 14:23
today = datetime.now().strftime("%Y-%m-%d %H:%M")

def economy():
    url = "https://news.naver.com/breakingnews/section/101/258"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    html = f"""
    <div class='news-header'>[{today}] 주요 경제 뉴스 (네이버 기준)</div>
    <ul class='news-list'>
    """
    count = 0
    for item in soup.select("ul.sa_list > li"):
        link_tag = item.select_one("a.sa_text_title")
        if link_tag:
            title = link_tag.get_text(strip=True)
            href = link_tag["href"]
            html += f"<li><a href='{href}' target='_blank'>{title}</a></li>"
            count += 1
        if count >= 6:
            break
    html += "</ul></div>"
    return html

def realestate():
    url = "https://news.naver.com/breakingnews/section/101/260"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    html = f"""
    <div class='news-header'>[{today}] 주요 부동산 뉴스 (네이버 기준)</div>
    <ul class='news-list'>
    """
    count = 0
    for item in soup.select("ul.sa_list > li"):
        link_tag = item.select_one("a.sa_text_title")
        if link_tag:
            title = link_tag.get_text(strip=True)
            href = link_tag["href"]
            html += f"<li><a href='{href}' target='_blank'>{title}</a></li>"
            count += 1
        if count >= 6:
            break
    html += "</ul></div>"
    return html