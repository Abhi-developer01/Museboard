import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '@/context/AuthContext';
import Loader from '@/components/shared/Loader';

const OAuthCallback = () => {
  const { checkAuthUser } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const isLoggedIn = await checkAuthUser();
      if (isLoggedIn) {
        navigate('/home', { replace: true });
      } else {
        navigate('/sign-in', { replace: true });
      }
    };

    handleAuth();
  }, [checkAuthUser, navigate]);

  return (
    <div className="w-full h-screen flex-center">
      <Loader />
      <p className="ml-2">Finalizing login...</p>
    </div>
  );
};

export default OAuthCallback;
