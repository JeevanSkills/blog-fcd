export interface Blogs {
  id: number;
  title: string;
  author: string;
  summary: string;
}


export const blogs : Blogs[] = [
  {
    id: 1,
    title: "First Blog Post",
    author: "Alice",
    summary: "This is a summary of the first blog post.",
  },
  {
    id: 2,
    title: "Second Blog Post",
    author: "Bob",
    summary: "This is a summary of the second blog post.",
  },
  {
    id: 3,
    title: "Third Blog Post",
    author: "Charlie",
    summary: "This is a summary of the third blog post.",
  },
];