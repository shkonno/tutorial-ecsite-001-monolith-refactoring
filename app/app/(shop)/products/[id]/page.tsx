'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  FiChevronLeft,
  FiPackage,
  FiShoppingCart,
  FiTruck,
} from 'react-icons/fi';
import LoadingSpinner, { LoadingButton } from '@/components/LoadingSpinner';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: string | null;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(errorData?.error || '商品が見つかりません');
      }

      const data = (await response.json()) as Product;
      setProduct(data);
    } catch (err: unknown) {
      console.error('商品取得エラー:', err);
      const message =
        err instanceof Error
          ? err.message
          : '商品の取得中にエラーが発生しました';
      setError(message);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = useCallback(async () => {
    if (!productId) return;
    setAddingToCart(true);

    const { addToCart } = await import('@/lib/actions/cart');
    const result = await addToCart(productId, quantity);

    setAddingToCart(false);

    if (result.success) {
      router.refresh();
      alert('カートに追加しました！');
    } else {
      alert(result.error || 'カートへの追加に失敗しました');
    }
  }, [productId, quantity, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-6 text-center text-[var(--foreground)]">
        <h1 className="text-2xl font-semibold">
          {error || '商品が見つかりません'}
        </h1>
        <p className="mt-4 text-[var(--foreground-muted)]">
          お探しの商品は現在ご利用いただけません。
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex items-center rounded-full border border-black/10 px-6 py-3 text-sm font-semibold transition hover:border-black/20"
        >
          商品一覧に戻る
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  const quantityOptions = useMemo(
    () => Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1),
    [product.stock],
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="bg-[#121217] pb-10 pt-20 text-[#f5f5f7]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6">
          <div>
            <Link
              href="/products"
              className="inline-flex items-center text-sm font-semibold text-white/60 transition hover:text-white"
            >
              <FiChevronLeft className="mr-2 h-4 w-4" />
              商品一覧に戻る
            </Link>
            <h1 className="mt-6 text-[clamp(30px,3.4vw,40px)] font-semibold leading-tight">
              {product.name}
            </h1>
          </div>
          <span className="hidden rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/60 md:inline-flex">
            PDP Layout
          </span>
        </div>
      </section>

      <section className="-mt-12 rounded-t-[40px] bg-[#fbfbfd] pb-20 pt-10 shadow-[0_-24px_60px_rgba(12,12,17,0.18)]">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-8">
              <div className="relative overflow-hidden rounded-[32px] border border-black/5 bg-[#f6f6f8] shadow-[0_35px_80px_rgba(15,15,16,0.12)]">
                <div className="relative aspect-[4/3]">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--foreground-muted)]">
                      画像なし
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/45 to-transparent" />
                  {product.category && (
                    <span className="absolute left-6 top-6 rounded-full bg-white/90 px-4 py-1 text-xs font-semibold text-[var(--foreground)] shadow">
                      {getCategoryName(product.category)}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_25px_70px_rgba(15,15,16,0.08)]">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  商品説明
                </h2>
                <p className="mt-4 leading-relaxed text-[var(--foreground-muted)]">
                  {product.description || '商品説明はありません'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_30px_80px_rgba(15,15,16,0.12)]">
                {product.category && (
                  <span className="rounded-full bg-[#f0f0f5] px-4 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-[var(--foreground-muted)]">
                    {getCategoryName(product.category)}
                  </span>
                )}

                <div className="mt-6 text-3xl font-semibold text-[var(--foreground)]">
                  ¥{product.price.toLocaleString()}
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm font-semibold">
                  <FiPackage className="h-5 w-5 text-[var(--foreground-muted)]" />
                  <span className={isOutOfStock ? 'text-red-600' : 'text-emerald-600'}>
                    {isOutOfStock ? '在庫切れ' : `在庫: ${product.stock}個`}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                  <FiTruck className="h-5 w-5" />
                  <span>通常2-3営業日でお届け</span>
                </div>

                {!isOutOfStock && (
                  <div className="mt-8">
                    <label className="block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--foreground-muted)]">
                      数量
                    </label>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                    >
                      {quantityOptions.map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || addingToCart}
                  className={`mt-8 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${
                    isOutOfStock || addingToCart
                      ? 'cursor-not-allowed bg-black/5 text-[var(--foreground-muted)]'
                      : 'bg-[var(--accent)] text-white shadow-[0_20px_40px_rgba(0,113,227,0.25)] hover:bg-[var(--accent-hover)]'
                  }`}
                >
                  {addingToCart ? (
                    <LoadingButton />
                  ) : (
                    <>
                      <FiShoppingCart className="h-5 w-5" />
                      <span>{isOutOfStock ? '在庫切れ' : 'カートに追加'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-[32px] border border-black/5 bg-white/90 p-6 text-sm text-[var(--foreground-muted)] shadow-[0_15px_50px_rgba(15,15,16,0.06)]">
                <p className="font-semibold text-[var(--foreground)]">
                  比較モジュール、レビュー、推奨アクセサリも同じトーンで表示されます。
                </p>
                <p className="mt-3 leading-relaxed">
                  Appleライクな余白とタイポスケールを採用し、アクセントカラーは製品カテゴリに合わせてトークンで切り替え可能です。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function getCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    electronics: '家電',
    fashion: 'ファッション',
    books: '書籍',
  };
  return categoryMap[category] || category;
}
