import type { PropsWithChildren } from "react";
import type { BlogPostModel } from "../types";

export type PostViewProps = PropsWithChildren<{
  post: BlogPostModel;
}>;

export default function Post(props: PostViewProps) {
  return (
    <div className="gap-10 my-20 w-full">
      <article className="prose prose-quoteless prose-neutral prose-invert max-w-none mx-auto gap-0 px-3 w-full">
        <header className="mx-auto w-full max-w-full sm:max-w-[46rem] px-3 md:px-0">
          <h1 className="mb-0">{props.post.title}</h1>
          <time dateTime={props.post.postedAt?.toISOString()}>
            {props.post.postedAt?.toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })}
          </time>
        </header>
        {props.children}
      </article>
    </div>
  );
}
