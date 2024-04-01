import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css"
import axios from "axios";
import { ACCOUNTS_API_URL, REQUEST_HEADER_CONFIG } from "constants";

const TextField = ({ type, label, value, onChange }) => {
    return (
        <div className="form-group">
            <label htmlFor={label}>{label}:</label>
            <input type={type} id={label} value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
    );
};


const Profile = () => {
    const [profile, setProfile] = useState({
        user: { id: '', username: '', first_name: '', last_name: '', email: '' },
        profile_picture: '',
    });

    const [firstName, setFirstName] = useState(profile.user.first_name);
    const [lastName, setLastName] = useState(profile.user.last_name);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePic, setProfilePic] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    axios.get(`${ACCOUNTS_API_URL}/profile/`, REQUEST_HEADER_CONFIG)
        .then((response) => {
            setProfile(response.data);
        })
        .catch((error) => {
            if (error.response && error.response.status === 401) {
                navigate('/unauthorized');
            }
        });
    
    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };
    

    return (
        <div id="content-wrap">
            <div className="profile-container center">
                <img src={profilePic || '/assets/default_profile_pic.png'} alt="User profile" id="profile_pic" />
                <button id="upload-profile-pic">Upload Profile Picture</button>
            </div>
            <div className="profile-container">
                <h2>{profile.user.username}</h2>
                <button onClick={toggleEdit}>{isEditing ? "Cancel Edit" : "Edit Profile"}</button>
                {isEditing ? (
                    <div>
                        {/* Input fields for editing */}
                        <TextField type="text" label="First Name" value={firstName} onChange={setFirstName} />
                        <TextField type="text" label="Last Name" value={lastName} onChange={setLastName} />
                        <TextField type="password" label="Current Password" onChange={setCurrentPassword} />
                        <TextField type="password" label="New Password" onChange={setNewPassword} />
                        <TextField type="password" label="Confirm Password" onChange={setConfirmPassword} />
                        <button type="button" onClick={toggleEdit}>Submit Change</button>
                    </div>
                ) : (
                    <div>
                        {/* Paragraphs for display */}
                        <p>Email: {profile.user.email}</p>
                        <p>First Name: {profile.user.first_name}</p>
                        <p>Last Name: {profile.user.last_name}</p>
                    </div>
                )}
            </div>
        </div>
    )

};

export default Profile;
