import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import { useGetSavedPosts } from "@/lib/react-query/queries";

const Saved = () => {
  const { user } = useUserContext();
  const { data: savedPosts, isLoading } = useGetSavedPosts(user.id);

  // Log the final data for debugging, as requested.
  console.log("Final saved posts data received by frontend:", savedPosts);

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <img
          src="/assets/icons/save.svg"
          width={36}
          height={36}
          alt="save"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
      </div>

      {isLoading ? (
        <Loader />
      ) : savedPosts && savedPosts.length > 0 ? (
        <GridPostList posts={savedPosts} showUser={false} />
      ) : (
        <p className="text-light-4">No saved posts yet.</p>
      )}
    </div>
  );
};

export default Saved;
