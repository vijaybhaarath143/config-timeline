export type CommentView = {
  id: string;
  body: string;
  authorId: string;
  authorName: string;
  authorImage: string | null;
  edited: boolean;
  mine: boolean;
  canDelete: boolean;
};

export type PostView = {
  id: string;
  caption: string;
  timeLabel: string; // "7:30 AM"
  authorName: string;
  authorImage: string | null;
  held: boolean; // PENDING — visible only to its author
  images: { id: string; url: string }[];
  comments: CommentView[];
  canDelete: boolean;
};

export type Viewer = {
  isAuthed: boolean;
  canInteract: boolean; // signed in and not banned
  eventOpen: boolean;
};
