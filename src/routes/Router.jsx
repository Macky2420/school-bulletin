import { createBrowserRouter } from "react-router-dom"
import Home from "../pages/Home"
import Layout from "../layout/Layout"
import AdminLogin from "../pages/AdminLogin"
import AdminLayout from "../layout/AdminLayout"
import AdminDashboard from "../pages/AdminDashboard"
import Settings from "../pages/Settings"
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
    },
    {
        path: "/home/:adminId",
        element: <AdminLayout/>,
        children: [
            {
                index: true,
                element: <Home/>
            }
        ]
    },
    {
        path: "/setting/:adminId",
        element: <AdminLayout/>,
        children: [
            {
                index: true,
                element: <Settings/>
            }
        ]
    }
])