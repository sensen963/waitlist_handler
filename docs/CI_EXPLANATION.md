# GitHub Actions CI の説明

このファイルは、[`/.github/workflows/ci.yml`](.github/workflows/ci.yml) で行っていることを、何のためにやっているのかという観点で1つずつ説明したものです。

## 全体の目的

この CI は、PR や main への push のたびに、backend と frontend が壊れていないかを自動で確認するためのものです。

効果としては、次のような問題を早い段階で見つけやすくなります。

- TypeScript の型エラー
- テストの失敗
- lint ルール違反
- Prisma の初期化や DB スキーマ周りの不整合
- フロントエンドのビルド失敗

## トリガー

### `push` to `main`

main ブランチに変更が入ったときに自動実行します。

効果:

- main に壊れた状態を入れていないかを毎回確認できます。
- リリース直前の見逃しを減らせます。

### `pull_request`

PR が作成・更新されたときに自動実行します。

効果:

- マージ前に問題を検出できます。
- レビュー担当者が手元で全部試さなくても、最低限の品質確認ができます。

## backend ジョブ

### `runs-on: ubuntu-latest`

GitHub が提供する Linux 環境で backend の検証を実行します。

効果:

- ローカル環境に依存せず、毎回同じ条件で動かせます。

### `defaults.run.working-directory: backend`

以降のコマンドを backend ディレクトリで実行します。

効果:

- `backend/package.json` のスクリプトをそのまま使えます。
- `cd backend` を毎回書かなくてよくなります。

### `DATABASE_URL: file:./prisma/ci.db`

CI 用の SQLite データベースを使う設定です。

効果:

- ローカルの開発用 DB に触らずに済みます。
- Prisma が必要とする接続先を CI で明示できます。

### `NODE_ENV: test`

テスト実行用の環境変数です。

効果:

- テスト時だけの挙動に切り替えやすくなります。
- `src/index.ts` のような起動処理をテストモードで抑止する設計と相性が良いです。

### `actions/checkout@v4`

リポジトリのソースコードを GitHub Actions の実行環境に取得します。

効果:

- CI が実際のコードを読んで検証できるようになります。

### `actions/setup-node@v4`

Node.js をインストールし、yarn のキャッシュも有効にします。

効果:

- Node のバージョン差による不安定さを減らせます。
- 依存関係のインストールが速くなります。

### `yarn install --frozen-lockfile`

lockfile 通りに依存関係をインストールします。

効果:

- ローカルと CI で違う依存バージョンが入る事故を防げます。
- lockfile が更新されていない変更を早く見つけられます。

### `npx prisma generate`

Prisma Client を生成します。

効果:

- Prisma の型付きクライアントを最新の schema に合わせて用意できます。
- schema 変更がコードに反映されていない問題を見つけやすくなります。

### `npx prisma db push`

SQLite のスキーマを CI 用 DB に反映します。

効果:

- Prisma schema と実際の DB 構造のズレを検出できます。
- テストが DB 初期化不足で落ちるのを防ぎます。

### `yarn test --runInBand`

backend のテストを実行します。

効果:

- API テストや service テストの失敗を検出できます。
- `--runInBand` により、テストを並列化せず順番に実行するため、SQLite やモックの扱いで起きる不安定さを減らせます。

### `yarn build`

TypeScript のビルドを実行します。

効果:

- 型エラーやコンパイルエラーを検出できます。
- テストだけでは見つからないビルド時の問題も拾えます。

## frontend ジョブ

### `runs-on: ubuntu-latest`

backend と同様に、Linux 上で frontend の検証を行います。

効果:

- 環境差による不具合を減らせます。

### `defaults.run.working-directory: frontend`

以降のコマンドを frontend ディレクトリで実行します。

効果:

- `frontend/package.json` のスクリプトを直接使えます。

### `actions/checkout@v4`

ソースコードを取得します。

効果:

- CI が frontend の実ファイルを検査できます。

### `actions/setup-node@v4`

Node.js と yarn キャッシュを設定します。

効果:

- 依存関係の再取得を減らして、実行時間を短縮できます。

### `yarn install --frozen-lockfile`

frontend の依存関係を lockfile 通りに入れます。

効果:

- 予期しない依存更新を防げます。

### `yarn lint`

ESLint を実行します。

効果:

- コーディング規約違反や危険な書き方を見つけられます。
- 実行時バグになる前に、静的に品質を保てます。

### `yarn test`

Vitest を使って frontend のテストを実行します。

効果:

- hook や component のロジック崩れを検出できます。
- UI の振る舞いが変わったときにすぐ気づけます。

### `yarn build`

Vite の本番ビルドを実行します。

効果:

- 開発サーバーでは見えないビルド時エラーを拾えます。
- 本番配布可能な形にできるか確認できます。

## この CI で特に効果が高い点

### 1. backend と frontend を分けている

片方が失敗しても、もう片方の結果は独立して分かります。

効果:

- 原因切り分けが速くなります。
- 修正対象をすぐ特定しやすくなります。

### 2. Prisma の初期化を CI に含めている

backend は SQLite と Prisma に依存しているため、ただテストを回すだけでは足りません。

効果:

- DB スキーマの不整合を早く検出できます。
- ローカルでは通るのに CI で落ちる問題を減らせます。

### 3. lint / test / build を全部回している

テストだけ、あるいは build だけでは拾えない問題があります。

効果:

- lint で静的な書き方の問題を防げます。
- test で振る舞いの問題を見つけられます。
- build で型やコンパイルの問題を見つけられます。

## 今後追加できること

- Docker イメージの build チェック
- main ブランチへのマージ必須化
- dependabot などによる依存更新の自動確認
- ステージング環境への自動デプロイ

## まとめ

この CI は、PR ごとに backend と frontend の品質を機械的に確認するためのものです。

最初の段階では、壊れたコードを main に入れないことと、原因切り分けを速くすることに最も効果があります。