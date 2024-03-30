import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ACCOUNTS_API_URL } from '../../../constants'; // Ensure this is defined

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [nonFieldError, setNonFieldError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { username, password };
        axios.post(`${ACCOUNTS_API_URL}/login/`, payload)
        .then(() => {
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
            <section className="text-center">
                <div className="form-container">
                    <h1 className="display-4">Login</h1>
                    <form className="authentication-form" id="login-form" onSubmit={handleSubmit}>
                        <div className="txt_field">
                            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} />
                            <label>Username</label>
                        </div>
                        <div className="txt_field">
                            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                            <label>Password</label>
                        </div>
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