import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import Home from "../pages/app/Home";
import RequireAuth from "../routes/RequireAuth";
import RedirectIfAuthenticated from "../routes/RedirectIfAuthenticated";
import LandingPageLayout from "../pages/layout/LandingPageLayout";
import AppLayout from "../pages/layout/AppLayout";
import Profile from "../pages/app/Profile";
import Heatmap from "../pages/app/Heatmap";
import LandingPage from "../pages/landingpage/LandingPage";

function AppRoutes() {
  return (
    <>
      <Routes>
        {/* Route for Landing Page - Home, About, Contact*/}
        <Route
          path="/"
          element={
            <RedirectIfAuthenticated>
              <LandingPageLayout>
                <LandingPage/>
              </LandingPageLayout>
            </RedirectIfAuthenticated>
          }
        />
        
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <LandingPageLayout>
                <LoginPage />
              </LandingPageLayout>
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuthenticated>
              <LandingPageLayout>
                <RegisterPage />
              </LandingPageLayout>
            </RedirectIfAuthenticated>
          }
        />

        {/* Route for App - Home, Heatmap, Add Post, Adoption Listings, Profile */}
        <Route
          path="/home"
          element={
            <RequireAuth>
              <AppLayout>
                <Home />
              </AppLayout>
            </RequireAuth>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <AppLayout>
                <Profile/>
              </AppLayout>
            </RequireAuth>
          }
        />

       <Route
          path="/heatmap"
          element={
            <RequireAuth>
              <AppLayout>
                <Heatmap />
              </AppLayout>
            </RequireAuth>
          }
        />

      </Routes>
    </>
  );
}

export default AppRoutes;
