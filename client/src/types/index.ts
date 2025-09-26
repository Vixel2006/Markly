// client/src/types/index.ts
export interface Category {
  id: string;
  name: string;
  emoji?: string;
}

export interface Collection {
  id: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
  weeklyCount?: number;
  prevCount?: number;
  createdAt?: string;
}

export interface CategoryForDisplay extends Category {
  count: number;
  icon: string;
  color: string;
}

export interface CollectionForDisplay extends Collection {
  count: number;
}

export interface BackendBookmark {
  id: string;
  url: string;
  title: string;
  summary: string;
  tags: string[];
  collections: string[];
  category: string | null;
  created_at: string;
  user_id: string;
  is_fav: boolean;
  thumbnail?: string;
}

export interface FrontendBookmark {
  id: string;
  url: string;
  title: string;
  summary: string;
  tags: Tag[];
  collections: Collection[];
  categories: Category[];
  createdAt: string;
  isFav: boolean;
  userId: string;
  thumbnail?: string;
}

export interface BookmarkData {
  url: string;
  title: string;
  summary: string;
  tags: string[];
  collections: string[];
  category_id?: string;
  is_fav?: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}