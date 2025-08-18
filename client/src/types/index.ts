
interface Bookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  created_at: string;
  user_id: string;
}

// And for sidebar categories, etc. (already defined but for completeness)
interface Category {
  name: string;
  count: number;
  icon: string;
  color: string;
}
