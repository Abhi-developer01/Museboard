import { GridPostList, Loader } from "@/components/shared";
import { useGetCurrentUser } from "@/lib/react-query/queries";

const LikedPosts = () => {
  const { data: currentUser } = useGetCurrentUser();

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <>
      {(!currentUser.save || currentUser.save.length === 0) && (
        <p className="text-light-4">No liked posts</p>
      )}

      <GridPostList
        posts={currentUser.save?.map((record: any) => record.post).filter(Boolean) ?? []}
        showUser={false}
        showStats={false}
      />
    </>
  );
};

export default LikedPosts;
