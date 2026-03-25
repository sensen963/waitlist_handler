# 技術解説：待ち列管理システム（完全版）

このドキュメントでは、本プロジェクトのソースコードを読み解くために必要な技術要素を、具体的なコード例と共に詳しく解説します。特に React と TypeScript のモダンな構文に焦点を当てています。

---

## 1. TypeScript：安全な開発を支える「型」の構文

### インターフェースとオプショナルプロパティ
`frontend/src/api/queue.ts` で定義されているデータの形です。
```typescript
export interface QueueEntry {
  id: number;
  ticketNumber: string;
  groupsAhead?: number; // 「?」はこの項目が無くても良い（undefinedになり得る）ことを示す
}
```
**初心者のためのポイント**: `groupsAhead` はサーバーからデータを受け取るタイミングによっては存在しない可能性があるため、`?` を付けて「あってもなくても良い」と定義しています。

### ユニオン型 (Union Types)
`frontend/src/App.tsx` で見られる、複数の候補から一つを選ぶ型です。
```typescript
const [view, setView] = useState<"kiosk" | "user" | "staff" | "home">("home");
```
**解説**: `view` 変数には、この4つの文字列以外は絶対に入らないことが保証されます。タイポ（打ち間違い）を即座にエラーとして検知できます。

### 型キャストと unknown 型
`frontend/src/hooks/useKiosk.ts` のエラー処理で使用しています。
```typescript
} catch (error: unknown) {
  const errorData = (error as AxiosError).response?.data?.error;
}
```
**解説**: `catch` で捕まえる `error` は中身が不明なため `unknown` 型です。そのままではプロパティにアクセスできないため、`as AxiosError` と書くことで「これは Axios のエラー型として扱ってくれ」とコンパイラに指示（キャスト）しています。

---

## 2. React：モダンなUI構築の記法

### 分割代入 (Destructuring)
コンポーネントの引数（Props）を受け取る際に多用されます。
```typescript
const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => { ... }
```
**解説**:
- `{ children, variant }`: `props.children` や `props.variant` と書かずに、直接変数として取り出しています。
- `variant = 'primary'`: 値が渡されなかった場合のデフォルト値を指定しています。

### スプレッド演算子 (Spread Operator)
`...props` のように、残りのすべての要素をまとめて扱う記法です。
```typescript
<button className={...} {...props}>
```
**解説**: `Button` コンポーネントに渡された、`onClick` や `type` などの標準的な HTML 属性を、そのまま内部の `button` タグに「流し込んで」います。

### 条件付きレンダリング (Conditional Rendering)
`frontend/src/pages/KioskPage.tsx` で頻出する記法です。
```typescript
{issuedTicket ? (
  <TicketResult ticket={issuedTicket} />
) : (
  <IssueTicketForm onIssue={issueTicket} />
)}
```
**解説**: `? :` は三項演算子です。「チケットが発行済みなら A を、そうでなければ B を表示する」というロジックを HTML の中に直接書けます。
また、`{message.text && <div>{message.text}</div>}` のように `&&` を使うと、「左側が true の時だけ右側を表示する」というショートカット記法になります。

---

## 3. React Hooks：ロジックの共通化

### カスタムフックの設計パターン
`frontend/src/hooks/useQueueManagement.ts` は、スタッフ画面の全ロジックを持っています。
```typescript
export const useQueueManagement = () => {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  
  const fetchQueue = async () => { ... };
  
  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000); // 5秒ごとのポーリング
    return () => clearInterval(interval); // クリーンアップ
  }, []);

  return { queue, serveEntry, reorder }; // 必要なものだけ公開
};
```
**解説**: 画面（Page）には「表示」だけをさせ、API呼び出しやタイマー処理（ポーリング）はすべてこのフックに隠蔽しています。これにより、同じロジックを別の画面でも再利用できるようになります。

---

## 4. バックエンド：Express と Zod

### 非同期エラーの集中管理
`backend/src/routes/queue.routes.ts` の `asyncHandler` です。
```typescript
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
```
**解説**: Node.js の非同期処理でエラーが起きた場合、通常は `try-catch` で囲む必要があります。これを関数でラップすることで、エラーが発生したら自動的に `next(error)` が呼ばれ、共通のエラーミドルウェアへ飛ぶようになっています。

### Zod による宣言的バリデーション
```typescript
const addEntrySchema = z.object({
  peopleCount: z.number().min(1),
  phoneNumber: z.string().min(1),
});
// ... 
const { peopleCount, phoneNumber } = addEntrySchema.parse(req.body);
```
**解説**: 送られてきたデータが「1以上の数値か」「文字列か」を一行でチェックします。不正なデータなら即座にエラーを投げ、後続のビジネスロジックにゴミが入るのを防ぎます。

---

## 5. データベース：Prisma トランザクション

### データの整合性確保
`backend/src/services/queue.service.ts` の `reorder` メソッドです。
```typescript
return await prisma.$transaction(async (tx) => {
  const updates = newQueue.map((e, i) =>
    tx.queueEntry.update({ ... })
  );
  await Promise.all(updates);
  return await tx.queueEntry.findMany({ ... });
});
```
**解説**: 「待ち順の並び替え」のように、複数のレコードを同時に更新する場合、一つでも失敗したら全体を元に戻す必要があります。`$transaction` を使うことで、DBの整合性を「100%か0%か」の状態に保っています。

---

## 6. スタイリング：Tailwind CSS と ユーティリティ

### `cn` 関数（クラスの動的結合）
`frontend/src/components/ui/Button.tsx` で使用されています。
```typescript
className={cn(
  'rounded-lg transition-colors',
  variants[variant],
  className
)}
```
**解説**: Tailwind CSS では、条件によってクラス名を付け替えることが多いため、`clsx` と `tailwind-merge` を組み合わせた `cn` 関数を使用しています。これにより、「背景色を変更しつつ、外側から渡されたクラス名で上書きする」といった処理が衝突なく行えます。

---

## まとめ
本プロジェクトは、**「型による保護（TypeScript）」「ロジックの分離（Hooks / Services）」「データの整合性（Transactions）」** という、モダンなWeb開発のベストプラクティスを凝縮した構成になっています。
コードを読む際は、まず `Interface` でデータの形を理解し、次に `Hooks` でデータの流れを追うのが近道です。
