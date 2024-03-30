import { React, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../../static/css/accounts/authentication.css';
import { ACCOUNTS_API_URL } from '../../../constants';
import axios from "axios";



function Register() {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [consent, setConsent] = useState(false);

    const [errorMessage, setErrorMessage] = useState({});
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (consent === false) {
            setErrorMessage({ ...errorMessage, consent: "Please agree to the terms and conditions" });
            return;
        }

        const payload = {
            username: username,
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password,
            confirm_password: confirmPassword,
        };
        
        axios.post(`${ACCOUNTS_API_URL}/register/`, payload)
        .then(() => {
            navigate('/accounts/login');
        })
        .catch((error) => {
            if (error.response){
                setErrorMessage(error.response.data);
            }
        });

    };

    return (
        <main>
            <section className="text-center">
                <div className="form-container">
                    <h1 className="display-4">Register</h1>
                    <form className="authentication-form" id="register-form" onSubmit={handleSubmit}>
                        <div className="txt_field">
                            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} />
                            <span className="error_message">{errorMessage.username}</span>
                            <label>Name</label>
                        </div>
                        <div className="txt_field">
                            <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            <span className = "error_message">{errorMessage.first_name}</span>
                            <label>First Name</label>
                        </div>
                        <div className="txt_field">
                            <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            <span className = "error_message">{errorMessage.lastName}</span>
                            <label>Last Name</label>
                        </div>
                        <div className="txt_field">
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                            <span className = "error_message">{errorMessage.email}</span>
                            <label>Email</label>
                        </div>
                        <div className="txt_field">
                            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                            <span className = "error_message">{errorMessage.password}</span>
                            <label>Password</label>
                        </div>
                        <div className="txt_field">
                            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            <span className = "error_message">{errorMessage.confirm_password}</span>
                            <label>Confirm Password</label>
                        </div>
                        <div className="form-check">
                            <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                            <label htmlFor="consent">I agree to the terms and conditions</label>
                            <p className="error_message">{errorMessage.consent}</p>
                        </div>
                        <input type="submit" value="Register" />
                    </form>
                </div>
            </section>
        </main>
    );
}


export default Register;