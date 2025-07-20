/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Author {
  id: string;
  uuid: string;
  username: string;
  name: string;
  avatar: string;
  is_following: boolean;
  is_official: boolean;
}

export interface Tag {
  name: string;
  slug: string;
}

export interface Category {
  name: string;
  slug: string;
}

export interface Recook {
  recook_count: number;
  recook_list: any[];
}

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  cover_url: string;
  rating: number;
  cooking_time: number;
  calories: string;
  release_date: number;
  is_editorial: boolean;
  step_count: number;
  premium_content: boolean;
  visited_count: number;
  is_bookmark: boolean;
  updated_at: number;
  subcategory: string;
  price: number;
  author: Author;
  recook: Recook;
  category: Category;
  tags: Tag[];
}
