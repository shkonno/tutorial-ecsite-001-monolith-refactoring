'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  FiArrowRight,
  FiShoppingCart,
  FiTrash2,
} from 'react-icons/fi';
import CartItem from '@/components/cart/CartItem';
import LoadingSpinner from '@/components/LoadingSpinner';
import { clearCart } from '@/lib/actions/cart';

interface CartData {
  items: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      stock: number;
      imageUrl: string | null;
    };
  }>;
  total: number;
  itemCount: number;
}

export default function CartPage() {
  const router = useRouter();
  const { status } = useSession();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');
      if (!response.ok) {
        throw new Error('カートの取得に失敗しました');
      }
      const data = (await response.json()) as CartData;
      setCart(data);
    } catch (err) {
      console.error('カート取得エラー:', err);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      void fetchCart();
    }
  }, [status, router, fetchCart]);

  const handleClearCart = useCallback(async () => {
    if (!confirm('カート内のすべての商品を削除しますか？')) return;
    setClearing(true);
    const result = await clearCart();
    setClearing(false);

    if (result.success) {
      void fetchCart();
    } else if (result.error) {
      alert(result.error);
    }
  }, [fetchCart]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
        <p>カートの読み込みに失敗しました。</p>
      </div>
    );
  }

  const isEmpty = cart.items.length === 0;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="bg-[#121217] pb-12 pt-20 text-[#f5f5f7]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6">
          <div>
            <span className="text-[12px] uppercase tracking-[0.28em] text-white/60">
              Cart
            </span>
            <h1 className="mt-6 text-[clamp(32px,4vw,40px)] font-semibold leading-tight">
              ショッピングカート
            </h1>
            <p className="mt-4 text-sm text-white/70">
              {isEmpty
                ? 'カートは空です。'
                : `${cart.itemCount}個の商品が入っています。`}
            </p>
          </div>
          {!isEmpty && (
            <button
              onClick={handleClearCart}
              disabled={clearing}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:text-white disabled:opacity-40"
            >
              <FiTrash2 className="h-4 w-4" />
              すべて削除
            </button>
          )}
        </div>
      </section>

 904      <section className="-mt-12 rounded-t-[40px] bg-[#fbfbfd] pb-20 pt-12 shadow-[0_-24px_60px_rgba(12,12,17,0.18)]">
        <div className="mx-auto w-full max-w-6xl px-6">
          {isEmpty ? (
            <div className="rounded-[32px] border border-black/5 bg-white/90 p-12 text-center shadow-[0_30px_80px_rgba(12,12,17,0.12)]">
              <FiShoppingCart className="mx-auto mb-4 h-24 w-24 text-black/10" />
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">
                カートは空です
              </h2>
              <p className="mt-3 text-[var(--foreground-muted)]">
                商品を追加して、ショッピングを始めましょう。
              </p>
              <Link
                href="/products"
                className="mt-8 inline-flex items-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
              >
                商品を見る
                <FiArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <CartItem key={item.id} item={item} onUpdate={fetchCart} />
                ))}
              </div>

              <div className="lg:sticky lg:top-28">
                <div className="rounded-[32px] border border-black/5 bg-white/95 p-8 shadow-[0_35px_80px_rgba(12,12,17,0.12)]">
                  <h2 className="text-xl font-semibold text-[var(--foreground)]">
                    注文サマリー
                  </h2>

                  <div className="mt-6 space-y-3 text-sm text-[var(--foreground-muted)]">
                    <div className="flex justify-between">
                      <span>商品点数</span>
                      <span>{cart.itemCount}点</span>
                    </div>
                    <div className="flex justify-between">
                      <span>小計</span>
                      <span>¥{cart.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>配送料</span>
                      <span className="text-emerald-600">無料</span>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-black/5 pt-4">
                    <div className="flex justify-between text-lg font-semibold text-[var(--foreground)]">
                      <span>合計</span>
                      <span>¥{cart.total.toLocaleString()}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
                  >
                    レジに進む
                    <FiArrowRight className="h-5 w-5" />
                  </Link>

                  <Link
                    href="/products"
                    className="mt-4 block text-center text-sm font-semibold text-[var(--accent)] transition hover:text-[var(--accent-hover)]"
                  >
                    買い物を続ける
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
