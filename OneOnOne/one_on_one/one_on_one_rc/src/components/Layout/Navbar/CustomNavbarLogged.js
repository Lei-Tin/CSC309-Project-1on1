import { Outlet } from 'react-router-dom';

// TODO: Implement the header, add links to other pages. 
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