import { Models } from "appwrite";

export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};



export type INewPost = {
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
  user: IUser;
};



export type IUpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: URL;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUser = {
  $id: string;
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  imageId?: string;
  bio: string;
  posts?: Models.Document[];
  save?: Models.Document[];
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};
