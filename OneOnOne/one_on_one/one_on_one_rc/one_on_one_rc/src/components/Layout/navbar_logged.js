import { Outlet, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';



const navbar_logged = () => {
    return (
        <>
            <header>
                <h1>This is a header</h1>
            </header>
        <Outlet/>
        </>
    )
}

export default navbar_logged;