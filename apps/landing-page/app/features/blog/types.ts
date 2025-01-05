export interface BlogPostModel {
  title: string;
  description: string;
  author: string;
  image?: string;
  postedAt?: Date;
}

export interface BlogPost extends BlogPostModel {
  slug: string;
}
