import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import 'components/Accounts/authentication.css';

import { ACCOUNTS_API_URL } from 'constants';
import { TextField } from 'components/Form';
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
            <section className="jumbotron text-center">
                <div className="form-container">
                    <h1 className="display-4">Register</h1>
                    <form className="authentication-form" id="register-form" onSubmit={handleSubmit}>
                        <TextField className="txt_field" type="text" label="Username" value={username} onChange={setUsername} errorMessage={errorMessage.username} />
                        <TextField className="txt_field" type="text" label="First Name" value={firstName} onChange={setFirstName} errorMessage={errorMessage.first_name} />
                        <TextField className="txt_field" type="text" label="Last Name" value={lastName} onChange={setLastName} errorMessage={errorMessage.last_name} />
                        <TextField className="txt_field" type="email" label="Email" value={email} onChange={setEmail} errorMessage={errorMessage.email} />
                        <TextField className="txt_field" type="password" label="Password" value={password} onChange={setPassword} errorMessage={errorMessage.password} />
                        <TextField className="txt_field" type="password" label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} errorMessage={errorMessage.non_field_errors} />
                        <div className="form-check">
                            <label htmlFor="consent">I agree to the terms and conditions</label>
                            <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
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