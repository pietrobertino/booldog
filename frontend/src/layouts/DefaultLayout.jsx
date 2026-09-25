import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";
import SideCart from "../components/SideCart";
import Overlay from "../components/Overlay";
import { Outlet } from 'react-router-dom'

export default function DefaultLayout() {

    return (
        <>
            <AppHeader />
            <main>
                <Outlet />
            </main>
            <SideCart />
            <Overlay />
            <AppFooter />
        </>
    )
}