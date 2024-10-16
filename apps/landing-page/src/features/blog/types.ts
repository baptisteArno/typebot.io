export interface BlogPostModel {
  title: string;
  description: string;
  author: string;
  postedAt?: Date;
}

export interface BlogPost extends BlogPostModel {
  slug: string;
}
