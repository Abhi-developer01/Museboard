import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  Home,
  Explore,
  Saved,
  CreatePost,
  Profile,
  EditPost,
  PostDetails,
  UpdateProfile,
  AllUsers,
} from "@/_root/pages";
import AuthLayout from "./_auth/AuthLayout";
import RootLayout from "./_root/RootLayout";
import SignupForm from "@/_auth/forms/SignupForm";
import SigninForm from "@/_auth/forms/SigninForm";
import OAuthCallback from "./_auth/pages/OAuthCallback";
import { Toaster } from "@/components/ui/toaster";
import LinkedInModal from "./components/shared/LinkedInModal";

import "./globals.css";

const App = () => {
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);

  useEffect(() => {
    if (navigator.userAgent.includes("LinkedIn")) {
      setShowLinkedInModal(true);
    }
  }, []);

  return (
    <main className="flex h-screen">
      {showLinkedInModal && <LinkedInModal />}

      <Routes>
        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* public routes */}
        <Route element={<AuthLayout />}>
          <Route index element={<SigninForm />} />
          <Route path="/sign-in" element={<SigninForm />} />
          <Route path="/sign-up" element={<SignupForm />} />
        </Route>

        {/* private routes */}
        <Route element={<RootLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/update-post/:id" element={<EditPost />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/profile/:id/*" element={<Profile />} />
          <Route path="/update-profile/:id" element={<UpdateProfile />} />
        </Route>
      </Routes>

      <Toaster />
    </main>
  );
};

export default App;
