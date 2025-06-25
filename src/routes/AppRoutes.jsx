import { Routes, Route } from "react-router-dom";
import LPHome from "../pages/landingpage/LPHome";
import LPAbout from "../pages/landingpage/LPAbout";
import LPContact from "../pages/landingpage/LPContact";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import Home from "../pages/app/Home";
import RequireAuth from "../routes/RequireAuth";
import RedirectIfAuthenticated from "../routes/RedirectIfAuthenticated";
import LandingPageLayout from "../pages/layout/LandingPageLayout";
import AppLayout from "../pages/layout/AppLayout";
import AddPost from "../pages/app/AddPost";

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
                <LPHome />
              </LandingPageLayout>
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/about"
          element={
            <RedirectIfAuthenticated>
              <LandingPageLayout>
                <LPAbout />
              </LandingPageLayout>
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/contact"
          element={
            <RedirectIfAuthenticated>
              <LandingPageLayout>
                <LPContact />
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
        path="/add-post"
        element={
          <RequireAuth>
            <AppLayout>
              <AddPost />
            </AppLayout>
          </RequireAuth>
        }/>
      </Routes>
    </>
  );
}

export default AppRoutes;
