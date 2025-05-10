export type CommitHistory = {
  abbreviated_commit: string;
  subject: string;
  body: string;
  author: {
    name: string;
    email: string;
    date: number;
  };
};

export type ObjectInfo = {
  path: string;
  commit: string;
  // "blob" or "tree" or "commit"
  type: "blob" | "tree" | "commit";
  last_modified: number | null;
  subject: string | null;
  author: string | null;
};
