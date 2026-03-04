export interface ProviderDetail {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  description: string | null;
  trustScore: number | null;
  reviewCount: number;
  categories: string[];
  planCount: number;
}

export interface ProviderReview {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  isVerified: boolean;
  createdAt: string;
  user: {
    name: string | null;
  };
}
