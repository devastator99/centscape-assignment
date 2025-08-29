export type WishlistItem = {
    id: number;
    title: string | null;
    image: string | null;
    price: string | null;
    currency: string | null;
    siteName: string | null;
    sourceUrl: string;
    normalizedUrl: string | null;
    createdAt: string; // ISO
  };
  