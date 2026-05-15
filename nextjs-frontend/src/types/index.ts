export interface Article {
  id: number;
  title: string;
  category_id: number;
  user_id: number;
  lock_version: number;
  view_count: number;
  created_at: string;
  category: Category;
  user?: User;
  sections?: Section[];
  images?: ArticleImage[];
}

export interface ArticleImage {
  id: number;
  article_id: number;
  section_id: number | null;
  file_path: string;
  type: "thumbnail" | "content";
  display_order?: number;
}

export interface Category {
  id: number;
  code: string;
  name: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface Section {
  id: number;
  title: string;
  content: string;
  order: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "member" | "admin";
  is_banned: boolean;
}

export interface Report {
  id: number;
  article_id: number;
  user_id: number | null;
  reason: string;
  status: "open" | "resolved";
  admin_comment: string | null;
  created_at: string;
  article: {
    id: number;
    title: string;
  };
}
