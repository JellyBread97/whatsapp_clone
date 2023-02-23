export type User = {
  username: string;
  socketId: string;
};

type Content = {
  text: string;
  media: string;
};

export type Message = {
  sender: string;
  // content: Content;
  text: string;
  createdAt: string;
};
