'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FiCheckCircle, FiCreditCard, FiTruck } from 'react-icons/fi';
import LoadingSpinner, { LoadingButton } from '@/components/LoadingSpinner';
import { createOrder } from '@/lib/actions/order';

interface CartData {
  items: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      imageUrl: string | null;
    };
  }>;
  total: number;
  itemCount: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    shippingName: '',
    shippingEmail: '',
    shippingAddress: '',
  });

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');
      if (!response.ok) {
        throw new Error('カートの取得に失敗しました');
      }

      const data = (await response.json()) as CartData;
      if (data.items.length === 0) {
        router.push('/cart');
        return;
      }

      setCart(data);
    } catch (err) {
      console.error('カート取得エラー:', err);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      setFormData((prev) => ({
        ...prev,
        shippingName: session?.user?.name || prev.shippingName,
        shippingEmail: session?.user?.email || prev.shippingEmail,
      }));
      void fetchCart();
    }
  }, [status, session, router, fetchCart]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!cart || cart.items.length === 0) {
        alert('カートが空です');
        return;
      }

      setSubmitting(true);
      const result = await createOrder(formData);

      if (result.success && result.orderId) {
        router.push(`/orders/${result.orderId}?success=true`);
      } else {
        alert(result.error || '注文の作成に失敗しました');
        setSubmitting(false);
      }
    },
    [cart, formData, router],
  );

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="bg-[#121217] pb-12 pt-20 text-[#f5f5f7]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6">
          <div>
            <span className="text-[12px] uppercase tracking-[0.28em] text-white/60">
              Checkout
            </span>
            <h1 className="mt-6 text-[clamp(32px,4vw,40px)] font-semibold leading-tight">
              配送情報の確認
            </h1>
            <p className="mt-4 text-sm text-white/70">
              お届け先の詳細と支払い方法を確認し、注文を確定します。
            </p>
          </div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:text-white"
          >
            カートに戻る
          </Link>
        </div>
      </section>

      <section className="-mt-12 rounded-t-[40px] bg-[#fbfbfd] pb-20 pt-12 shadow-[0_-24px_60px_rgba(12,12,17,0.18)]">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="rounded-[32px] border border-black/5 bg-white/95 p-8 shadow-[0_30px_70px_rgba(12,12,17,0.12)]">
              <div className="flex items-center gap-3">
                <FiTruck className="h-6 w-6 text-[var(--accent)]" />
                <h2 className="text-xl font-semibold text-[var(--foreground)]">
                  配送先情報
                </h2>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                    お名前 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shippingName}
                    onChange={(e) => setFormData({ ...formData, shippingName: e.target.value })}
                    className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                    placeholder="山田太郎"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                    メールアドレス *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.shippingEmail}
                    onChange={(e) => setFormData({ ...formData, shippingEmail: e.target.value })}
                    className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                    配送先住所 *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                    className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                    placeholder="〒100-0001 東京都千代田区千代田1-1-1"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-black/5 bg-white/95 p-8 shadow-[0_25px_60px_rgba(12,12,17,0.08)]">
              <div className="flex items-center gap-3">
                <FiCreditCard className="h-6 w-6 text-[var(--accent)]" />
                <h2 className="text-xl font-semibold text-[var(--foreground)]">
                  支払い方法
                </h2>
              </div>

              <div className="mt-6 rounded-2xl border border-black/10 bg-[#f5f5f7] p-5 text-sm text-[var(--foreground-muted)]">
                <p>
                  📝 <span className="font-semibold text-[var(--foreground)]">デモモード:</span>{' '}
                  実際の決済処理は行われません。
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[var(--foreground-muted)]">
                  本番ではStripe等のゲートウェイを統合します。
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed"
            >
              {submitting ? (
                <LoadingButton />
              ) : (
                <>
                  <FiCheckCircle className="h-5 w-5" />
                  注文を確定する
                </>
              )}
            </button>
          </form>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-black/5 bg-white/95 p-8 shadow-[0_30px_80px_rgba(12,12,17,0.12)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                注文サマリー
              </h2>
              <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                {cart.itemCount}点の商品がカートに入っています。
              </p>

              <div className="mt-6 space-y-3 text-sm text-[var(--foreground-muted)]">
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

              <div className="mt-6 space-y-3 text-xs uppercase tracking-[0.22em] text-[var(--foreground-muted)]">
                <p>すべての個人情報は安全に送信されます。</p>
                <p>発送準備が整い次第、メールでお知らせします。</p>
              </div>
            </div>

            <div className="rounded-[32px] border border-black/5 bg-white/90 p-6 text-sm text-[var(--foreground-muted)] shadow-[0_20px_60px_rgba(12,12,17,0.08)]">
              <p className="font-semibold text-[var(--foreground)]">
                ご注文内容はマイページからいつでも確認できます。
              </p>
              <p className="mt-2">
                注文確定後に届くメール内のリンクから、配送状況をリアルタイムで追跡できます。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
