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
  day: string; // "2026-06-19" — the day key this post lives on
  timeLabel: string; // "7:30 AM" (display)
  timeValue: string; // "07:30" (for the edit input)
  authorName: string;
  authorImage: string | null;
  images: { id: string; url: string }[];
  comments: CommentView[];
  loveCount: number;
  lovedByMe: boolean;
  canDelete: boolean;
  canEdit: boolean; // owner only
};

export type Viewer = {
  isAuthed: boolean;
  canInteract: boolean; // signed in and not banned
  eventOpen: boolean;
};
