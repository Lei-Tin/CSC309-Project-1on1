import { Outlet } from 'react-router-dom';


const CustomNavbarLogged = () => {
    return (
        <>
            <header>
                <h1>This is a header</h1>
            </header>
        <Outlet/>
        </>
    )
}

export default CustomNavbarLogged;