import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ACCOUNTS_API_URL } from 'constants'; 

import 'components/Accounts/authentication.css';

import { TextField } from 'components/Form/Fields/TextField';

import { useUser } from 'contexts/UserContext';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [nonFieldError, setNonFieldError] = useState('');
    const navigate = useNavigate();

    const { login, logout } = useUser();


    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { username, password };
        axios.post(`${ACCOUNTS_API_URL}/login/`, payload)
        .then((response) => {
            const token = response.data.token;
            login(token);
            
            navigate('/calendars');
        })
        .catch((error) => {
            if (error.response) {
                // Reset previous errors
                setNonFieldError(error.response.data.non_field_errors[0]);
                
            }
        });
    };

    // On load, check if the user is already logged in
    // If logged in, then redirect to the profile page
    if (localStorage.getItem('token') !== null) {
        // Use axios to verify if the token is valid
        axios.get(`${ACCOUNTS_API_URL}/profile/`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }).then(() => {
            navigate('/calendars/');
        }).catch(() => {
            // This is when we failed to verify the token
            // Probably because the token timed out
            logout(); 
        });
    }

    return (
        <main>
            <section className="jumbotron text-center">
                <div className="form-container">
                    <h1 className="display-4">Login</h1>
                    <form className="authentication-form" id="login-form" onSubmit={handleSubmit}>
                        <TextField className="txt_field" type="text" label="Username" value={username} onChange={setUsername} />
                        <TextField className="txt_field" type="password" label="Password" value={password} onChange={setPassword} />
                        <span className="error_message">{nonFieldError}</span>
                        <div className="pass">Forgot Password?</div>
                        <input type="submit" value="Login" />
                        <div className="signup_link">
                            Not a member? <Link to="/accounts/register">Register</Link>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}

export default Login;