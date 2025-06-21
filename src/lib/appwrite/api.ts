import { ID, Query, Permission, Role } from "appwrite";

import { appwriteConfig, account, databases, storage, avatars } from "./config";
import { IUpdatePost, INewPost, INewUser, IUpdateUser, IUser } from "@/types";

// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP
export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user,
      [Permission.read(Role.any())]
    );

    return newUser;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== SIGN IN
export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailSession(user.email, user.password);

    return session;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== SIGN IN WITH GOOGLE
export async function signInWithGoogle() {
  try {
    await account.createOAuth2Session(
      "google",
      `${window.location.origin}/auth/callback`,
      `${window.location.origin}/sign-in`
    );
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== GET USER
export async function getCurrentUser(): Promise<IUser> {
  try {
    const currentAccount = await getAccount();

    if (!currentAccount) throw new Error("No current account found");

    let currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    let userDoc = currentUser.documents[0];

    if (!userDoc) {
      console.log("User authenticated but not in DB. Creating new user...");
      const avatarUrl = avatars.getInitials(currentAccount.name);
      const newUserDoc = await saveUserToDB({
        accountId: currentAccount.$id,
        name: currentAccount.name,
        email: currentAccount.email,
        username: currentAccount.email.split("@")[0],
        imageUrl: avatarUrl,
      });

      if (!newUserDoc) {
        throw new Error("Failed to create new user in database.");
      }
      userDoc = newUserDoc;
    }

    const savedPosts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      [Query.equal("user", userDoc.$id)]
    );

    const user: IUser = {
      $id: userDoc.$id,
      id: currentAccount.$id,
      name: userDoc.name,
      username: userDoc.username,
      email: userDoc.email,
      imageUrl: userDoc.imageUrl,
      imageId: userDoc.imageId,
      bio: userDoc.bio,
      save: savedPosts.documents,
    };

    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== SIGN OUT
export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {

  try {
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post
    
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.user.$id,
        creatorName: post.user.name,
        creatorImageUrl: post.user.imageUrl,
        caption: post.caption,
        imageUrl: fileUrl.href,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
        likes: [],
      },
      [Permission.read(Role.any())]
    );



    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file,
      [Permission.read(Role.any())]
    );

    return uploadedFile;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== GET FILE URL
export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFileView(
      appwriteConfig.storageId,
      fileId
    );

    return fileUrl;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== GET POSTS
export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw Error;

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    //  Update post
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl instanceof URL ? image.imageUrl.href : image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    // Failed to update
    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }

      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) throw Error;

  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.error(`--- [likePost] CRITICAL ERROR ---`, error);
    throw error;
  }
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
  try {
    // The `userId` parameter is the user's DOCUMENT ID from the 'users' collection.
    // The permissions require the user's AUTHENTICATION ID from Appwrite Auth.
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error("User not authenticated");
    const authId = currentAccount.$id;

    const existingSave = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      [Query.equal("user", userId), Query.equal("post", postId)]
    );

    if (existingSave.documents.length > 0) {
      return existingSave.documents[0];
    }

    const newSave = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId, // This correctly links to the user's document
        post: postId,
      },
      [
        // These permissions use the AUTH ID, which is now correct.
        Permission.read(Role.user(authId)),
        Permission.update(Role.user(authId)),
        Permission.delete(Role.user(authId)),
      ]
    );

    return newSave;
  } catch (error) {
    console.error("--- [savePost] CRITICAL ERROR ---", error);
    throw error;
  }
}
// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== GET SAVED POSTS
export async function getSavedPosts(userId: string) {
  try {
    console.log(`--- [getSavedPosts] Fetching for user: ${userId} ---`);
    
    const savedRecordsResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      [Query.equal("user", userId)]
    );
    console.log("[getSavedPosts] 1. Fetched saved records:", savedRecordsResponse);

    if (!savedRecordsResponse) throw new Error("Failed to fetch saved posts.");

        // The 'post' attribute on a 'save' document is just the ID string.
    const postIds = [
      ...new Set(savedRecordsResponse.documents.map((record) => record.post).filter(Boolean)),
    ];
    console.log("[getSavedPosts] 2. Extracted Post IDs:", postIds);

    if (postIds.length === 0) {
      console.log("[getSavedPosts] No post IDs found. Returning empty array.");
      return [];
    }

    const postsResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("$id", postIds)]
    );
    console.log("[getSavedPosts] 3. Fetched full posts:", postsResponse);

    const saveDateMap = new Map(
      savedRecordsResponse.documents.map((record) => [record.post?.$id, record.$createdAt])
    );

    const sortedPosts = postsResponse.documents.sort((a, b) => {
      const dateA = new Date(saveDateMap.get(a.$id) || 0).getTime();
      const dateB = new Date(saveDateMap.get(b.$id) || 0).getTime();
      return dateB - dateA;
    });
    console.log("[getSavedPosts] 4. Final sorted posts:", sortedPosts);

    return sortedPosts;
  } catch (error) {
    console.error("--- [getSavedPosts] CRITICAL ERROR ---", error);
    throw error;
  }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
  if (!userId) throw Error;

  try {
    const post = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)
export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );





    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    // Remove duplicate users based on their email address.
    const uniqueUsers = users.documents.filter(
      (user, index, self) =>
        index === self.findIndex((u) => u.email === user.email)
    );

    return { ...users, documents: uniqueUsers };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== GET USER BY ID
export async function getUserById(userId: string): Promise<IUser> {
  try {
    const userDoc = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!userDoc) throw new Error(`User with ID ${userId} not found.`);

    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userDoc.$id)]
    );

    if (!posts) throw new Error(`Posts for user with ID ${userId} not found.`);

    const user: IUser = {
      $id: userDoc.$id,
      id: userDoc.$id,
      name: userDoc.name,
      username: userDoc.username,
      email: userDoc.email,
      imageUrl: userDoc.imageUrl,
      imageId: userDoc.imageId,
      bio: userDoc.bio,
      posts: posts.documents,
    };

    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    //  Update user
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: typeof image.imageUrl === 'string' ? image.imageUrl : image.imageUrl.href,
        imageId: image.imageId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
