export interface Bookmark {
  ID: string;
  CreatedAt: string;
  UserID: string;
  URL: string;
  Title: string;
  Summary: string;
  TagsID: string[];
  CollectionsID: string[];
  CategoryID?: string;
  IsFav: boolean;
}

export interface Category {
  ID: string;
  Name: string;
  Emoji?: string;
}

export interface Collection {
  ID: string;
  Name: string;
}

export interface Tag {
  ID: string;
  Name: string;
}
