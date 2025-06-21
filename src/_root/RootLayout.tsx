import { Outlet, Navigate } from "react-router-dom";

import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import Loader from "@/components/shared/Loader";
import { useUserContext } from "@/context/AuthContext";

const RootLayout = () => {
  const { isAuthenticated, isLoading } = useUserContext();

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  return (
    <>
      {!isAuthenticated ? (
        <Navigate to="/sign-in" />
      ) : (
        <div className="w-full md:flex">
          <Topbar />
          <LeftSidebar />

          <section className="flex flex-1 h-full">
            <Outlet />
          </section>

          <Bottombar />
        </div>
      )}
    </>
  );
};

export default RootLayout;
