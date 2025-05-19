import { createBrowserRouter } from "react-router-dom"
import Home from "../pages/Home"
import Layout from "../layout/Layout"
import PostDetails from "../pages/PostDetails"
import AdminLogin from "../pages/AdminLogin"
import AdminLayout from "../layout/AdminLayout"
import AdminDashboard from "../pages/AdminDashboard"
export const Router = createBrowserRouter([
    {
        path: "/",
        element: <Layout/>,
        children: [
            {
                path: "/",
                element: <Home/>
            }
        ]
    },
    {
        path: "/post/:id",
        element: <Layout/>,
        children: [
            {
                index: true,
                element: <PostDetails/>
            }
        ]
    },
    {
        path: "/admin",
        element: <AdminLogin/>
    },
    {
        path: "/admin/:adminId",
        element: <AdminLayout/>,
        children: [
            {
                index: true,
                element: <AdminDashboard/>
            }
        ]
    }
])