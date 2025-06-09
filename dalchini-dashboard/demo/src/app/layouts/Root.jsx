// Import Dependencies
import { Outlet, ScrollRestoration } from "react-router";
import { lazy } from "react";

// Local Imports
import { useAuth } from "contexts/AuthContext";
import { SplashScreen } from "components/template/SplashScreen";
import { Progress } from "components/template/Progress";
import { Loadable } from "components/shared/Loadable";

const Toaster = Loadable(lazy(() => import("components/template/Toaster")));
const Customizer = Loadable(
  lazy(() => import("components/template/Customizer")),
);
const Tooltip = Loadable(lazy(() => import("components/template/Tooltip")));

// ----------------------------------------------------------------------

function Root() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <>
      <Progress />
      <ScrollRestoration />
      <Outlet />
      <Tooltip />
      <Toaster />
      <Customizer />
    </>
  );
}

export default Root;
