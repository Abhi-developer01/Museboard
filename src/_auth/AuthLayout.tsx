import { Outlet, Navigate } from "react-router-dom";
import InAppBrowserWarning from "@/components/shared/InAppBrowserWarning";

import { useUserContext } from "@/context/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated } = useUserContext();

  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/home" />
      ) : (
        <>
          <section className="flex flex-1 justify-center items-center flex-col py-10">
            <InAppBrowserWarning />
            <Outlet />
          </section>

          <img
            src="/assets/images/Login.png"
            alt="logo"
            className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
          />
        </>
      )}
    </>
  );
}
