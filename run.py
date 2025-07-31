from page.market import stock
from page.news import economy, realestate

with open("main.html", "w", encoding="utf-8") as f:
    f.write("""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Stock & News Dashboard</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>Stock & News Dashboard</h1>
    </header>
    <section id="stock">
        <h2>주식 정보</h2>
        %s
    </section>
    <section id="economy">
        <h2>경제 뉴스</h2>
        %s
    </section>
    <section id="realestate">
        <h2>부동산 뉴스</h2>
        %s
    </section>
</body>
</html>
""" % (stock(), economy(), realestate()))