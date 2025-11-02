import { z } from 'zod';

// ユーザー登録バリデーション
export const registerSchema = z.object({
  name: z.string().min(2, '名前は2文字以上で入力してください').max(100, '名前は100文字以内で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .max(100, 'パスワードは100文字以内で入力してください')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'パスワードは大文字、小文字、数字を含む必要があります'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ユーザーログインバリデーション
export const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// 商品作成/更新バリデーション
export const productSchema = z.object({
  name: z.string().min(1, '商品名は必須です').max(200, '商品名は200文字以内で入力してください'),
  description: z.string().min(1, '説明は必須です').max(5000, '説明は5000文字以内で入力してください'),
  price: z.number().min(0, '価格は0以上で入力してください').max(10000000, '価格は1000万円以内で入力してください'),
  stock: z.number().int('在庫数は整数で入力してください').min(0, '在庫数は0以上で入力してください').max(999999, '在庫数は999999以下で入力してください'),
  category: z.enum(['smartphone', 'tablet', 'laptop', 'desktop', 'wearable', 'audio', 'accessories', 'other'], {
    errorMap: () => ({ message: '有効なカテゴリを選択してください' }),
  }),
  imageUrl: z.string().url('有効なURLを入力してください').optional().or(z.literal('')),
  isPublished: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;

// カート追加バリデーション
export const cartAddSchema = z.object({
  productId: z.string().uuid('有効な商品IDを指定してください'),
  quantity: z.number().int('数量は整数で入力してください').min(1, '数量は1以上で入力してください').max(100, '数量は100以下で入力してください'),
});

export type CartAddInput = z.infer<typeof cartAddSchema>;

// カート更新バリデーション
export const cartUpdateSchema = z.object({
  itemId: z.string().uuid('有効なアイテムIDを指定してください'),
  quantity: z.number().int('数量は整数で入力してください').min(0, '数量は0以上で入力してください').max(100, '数量は100以下で入力してください'),
});

export type CartUpdateInput = z.infer<typeof cartUpdateSchema>;

// 注文作成バリデーション
export const orderCreateSchema = z.object({
  shippingName: z.string().min(1, '配送先名は必須です').max(100, '配送先名は100文字以内で入力してください'),
  shippingAddress: z.string().min(1, '配送先住所は必須です').max(500, '配送先住所は500文字以内で入力してください'),
  shippingCity: z.string().min(1, '市区町村は必須です').max(100, '市区町村は100文字以内で入力してください'),
  shippingPostalCode: z
    .string()
    .regex(/^\d{3}-?\d{4}$/, '郵便番号は「123-4567」の形式で入力してください'),
  shippingCountry: z.string().min(1, '国は必須です').max(100, '国は100文字以内で入力してください').default('日本'),
});

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;

// 注文ステータス更新バリデーション
export const orderStatusSchema = z.object({
  orderId: z.string().uuid('有効な注文IDを指定してください'),
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
    errorMap: () => ({ message: '有効なステータスを選択してください' }),
  }),
});

export type OrderStatusInput = z.infer<typeof orderStatusSchema>;

// ユーザーロール更新バリデーション
export const userRoleSchema = z.object({
  userId: z.string().uuid('有効なユーザーIDを指定してください'),
  role: z.enum(['USER', 'ADMIN'], {
    errorMap: () => ({ message: '有効なロールを選択してください' }),
  }),
});

export type UserRoleInput = z.infer<typeof userRoleSchema>;

// 画像アップロードバリデーション
export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'ファイルサイズは5MB以下にしてください')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),
      '画像形式はJPEG、PNG、WebP、GIFのみ対応しています',
    ),
});

export type ImageUploadInput = z.infer<typeof imageUploadSchema>;

// 検索バリデーション
export const searchSchema = z.object({
  query: z.string().min(1, '検索キーワードを入力してください').max(200, '検索キーワードは200文字以内で入力してください').optional(),
  category: z
    .enum(['smartphone', 'tablet', 'laptop', 'desktop', 'wearable', 'audio', 'accessories', 'other', 'all'])
    .optional(),
  minPrice: z.number().min(0, '最低価格は0以上で入力してください').optional(),
  maxPrice: z.number().min(0, '最高価格は0以上で入力してください').optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'created_desc']).optional().default('created_desc'),
  page: z.number().int('ページ番号は整数で入力してください').min(1, 'ページ番号は1以上で入力してください').optional().default(1),
  limit: z.number().int('取得件数は整数で入力してください').min(1, '取得件数は1以上で入力してください').max(100, '取得件数は100以下で入力してください').optional().default(20),
});

export type SearchInput = z.infer<typeof searchSchema>;

// IDバリデーション
export const idSchema = z.string().uuid('有効なIDを指定してください');

// ページネーションバリデーション
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// バリデーションヘルパー関数
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: z.ZodError } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
};

// エラーメッセージフォーマッター
export const formatZodErrors = (errors: z.ZodError): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};
  errors.errors.forEach((error) => {
    const path = error.path.join('.');
    formattedErrors[path] = error.message;
  });
  return formattedErrors;
};

