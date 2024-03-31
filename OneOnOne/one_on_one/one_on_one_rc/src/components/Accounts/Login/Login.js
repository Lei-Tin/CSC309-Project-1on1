import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ACCOUNTS_API_URL } from '../../../constants'; 

import '../authentication.css';

import TextField from '../../Form/Fields/TextField';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [nonFieldError, setNonFieldError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { username, password };
        axios.post(`${ACCOUNTS_API_URL}/login/`, payload)
        .then((response) => {
            const token = response.data.token;
            localStorage.setItem('token', token);
            // TODO: Redirect to calendar page
            navigate('/');
        })
        .catch((error) => {
            if (error.response) {
                // Reset previous errors
                console.log(error.response.data);
                setNonFieldError(error.response.data.non_field_errors[0]);
                
            }
        });
    };

    return (
        <main>
            <section className="jumbotron text-center">
                <div className="form-container">
                    <h1 className="display-4">Login</h1>
                    <form className="authentication-form" id="login-form" onSubmit={handleSubmit}>
                        <TextField type="text" label="Username" value={username} onChange={setUsername} />
                        <TextField type="password" label="Password" value={password} onChange={setPassword} />
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