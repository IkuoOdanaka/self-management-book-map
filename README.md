# 書籍マップ

小田中育生の書籍について、章構成を「いま抱えている関心や悩みから辿れるナビゲーション」にしたページ集です。

| 書籍 | 公開URL |
|---|---|
| [エンジニアのための自己管理入門 堅牢でスケーラブルな働き方を構築する技術](https://www.shoeisha.co.jp/book/detail/9784798194066)<br>翔泳社・2026年6月24日発売／ISBN 978-4-7981-9406-6 | https://ikuoodanaka.github.io/self-management-book-map/ |
| [アジャイルチームによる目標づくりガイドブック OKRを機能させ成果に繋げるためのアプローチ](https://www.shoeisha.co.jp/book/detail/9784798184739)<br>翔泳社・2024年7月22日発売／ISBN 978-4-7981-8473-9 | https://ikuoodanaka.github.io/self-management-book-map/agile-goal-setting/ |

## これは何か

どちらの本も、頭から順に読む本ではなく **いま一番痛いところから開く本** です。
そのため「目次を眺める」よりも「自分の症状から章を選ぶ」ほうが早い。そこを一枚で見せるためのページです。

- 「忙しさから余白を取り戻したい」など、6つの関心から入口になる章を選択
- コンパクトな目次から各章へ直接移動
- 選んだ章のキャッチ・リード文・**こんなときに開く**・**この章で扱うこと**を優先表示
- キーワードと参考書籍は必要なときだけ展開し、ページの縦長化を抑制
- 感想ブログとSNSの反応を出典付きで紹介
- ページ下部に、著者の他の書籍マップへの相互リンク
- **章ごとのURL**（`…/#ch2`）と、X・はてなブックマーク・Facebook・リンクコピーへの共有ボタン

## 動かし方

ビルド不要・依存ゼロです。

```
open index.html
```

ES modules を使っていないので、`file://` で開いてもそのまま動きます。

## 構成

共通のエンジン（CSS/JS）と、書籍ごとのデータを分けています。
**1冊追加するのに触るのは `books/` の2ファイルと、薄いHTML 1枚だけ**です。

```
index.html                  エンジニアのための自己管理入門（サイトのトップ）
agile-goal-setting/
  index.html                アジャイルチームによる目標づくりガイドブック
assets/
  book-map.css              全書籍共通のスタイル。書籍固有の色は一切書かない
  book-map.js               全書籍共通の描画エンジン
books/
  catalog.js                書籍の一覧。相互リンクはここから作られる
  <slug>.js                 その書籍の章データ
  <slug>.css                その書籍の配色
  _TEMPLATE.js / _TEMPLATE.css   注釈つきの雛形
og/
  template.html             OGP画像の版下（?book=<slug> で切り替え）
  <slug>.png                生成したOGP画像 1200×630
og-image.png                自己管理入門のOGP画像（共有済みリンクがあるため位置を変えない）
```

各ページのHTMLに書いてあるのは、**JSでは代替できないものだけ**です。

- `<head>` のOGP・canonical … X や Slack のクローラーはJSを実行しないので静的に置く必要がある
- hero と footer … JSが落ちても書影と購入導線が残るようにする
- 配色ファイルへの `<link>` … 初期表示で色が飛ばないようにする

章の見出し・本文・参考書籍・読者の声は、すべて `books/<slug>.js` から描画されます。

## 1冊追加する

[AUTHORING.md](AUTHORING.md) に手順と、**1冊目と同じ深さで書くための指針**をまとめてあります。

```
1. books/_TEMPLATE.js  → books/<slug>.js   に章データを書く
2. books/_TEMPLATE.css → books/<slug>.css  に配色を書く
3. 既存のHTMLをコピーして <slug>/index.html を作り、head と hero を差し替える
4. books/catalog.js に1件足す（全ページの相互リンクに反映される）
5. og/template.html の OG_BOOKS に1件足して、OGP画像を生成する
```

書籍データの中身（各章の文言・参考書籍・読者の声の足し方）も AUTHORING.md にあります。
Amazonアソシエイトのタグは各書籍データの `amazonTag` にあります。空文字にするとタグなしの通常URLになります。

## 確認のしかた

```bash
# 両方のページを開く
open index.html agile-goal-setting/index.html
```

見ておきたいところ:

- 興味カードと目次タブを押して、章が切り替わり色が追随すること
- 章を切り替えるとURLの `#…` が変わり、そのURLを開き直すとその章から始まること
- 共有ボタンの文面に、開いている章が入っていること（`file://` で開いていても公開URLが共有される）
- 「キーワードと、この章の背景にある本を見る」を開いて、書影が出ること
- ライト／ダークの両方（macOSの外観設定を切り替える）
- 幅を狭めたときに崩れないこと

ライト／ダークをコマンドから確認したい場合、macOSがダークだとヘッドレスChromeもダークになります
（`--force-light-mode` は効きません）。ライト側だけを描画したいときは、CSSの
`@media (prefers-color-scheme: dark)` を一時的に `and (min-width: 99999px)` にした複製で確認できます。

## ライセンス

コードは MIT License（[LICENSE](LICENSE)）。
掲載している書籍の内容・要約文は書籍の著作物であり、MITの対象外です。

## フィードバック

本書やサイトへの感想、掲載候補、改善提案をIssueとPull Requestで受け付けています。
詳細は [CONTRIBUTING.md](CONTRIBUTING.md) をご覧ください。
