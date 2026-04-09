import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { Signup } from "../components/Signup";
import { Signin } from "../components/Signin";
import { Kiosk } from "../components/Kiosk";
import { QueuedOrders } from "../components/QueuedOrders";
import { Settings } from "../components/Settings";


export const router = createBrowserRouter([
    { path: "/", element: <App /> },
    { path: "/signup", element: <Signup /> },
    { path: "/signin", element: <Signin /> },
    { path: "/kiosk", element: <Kiosk /> },
    { path: "/queued-orders", element: <QueuedOrders /> },
    { path: "/settings", element: <Settings /> },
])