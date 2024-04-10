import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import { ACCOUNTS_API_URL, DEFAULT_PROFILE_PIC } from "constants";

import "./profile.css";

import { useUser } from "contexts/UserContext";
import { TextFieldProfile } from "components/Form/Fields/TextField";

const Profile = () => {
    const { changeProfilePic } = useUser();

    const [profile, setProfile] = useState({
        user: { id: "", username: "", first_name: "", last_name: "", email: "" },
        profile_picture: "",
    });

    const [firstName, setFirstName] = useState(profile.user.first_name);
    const [lastName, setLastName] = useState(profile.user.last_name);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [errorMessage, setErrorMessage] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get(`${ACCOUNTS_API_URL}/profile/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => {
                setProfile(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    navigate("/unauthorized");
                }
            });
    }, [navigate]);

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleSubmit = () => {
        // Based on the out backend django API, if the field value is blank,
        // then we should not send it in the payload
        var payload = {};

        if (firstName) {
            payload.first_name = firstName;
        }

        if (lastName) {
            payload.last_name = lastName;
        }

        if (currentPassword) {
            payload.current_password = currentPassword;
            payload.new_password = newPassword;
            payload.confirm_password = confirmPassword;
        }

        axios
            .put(`${ACCOUNTS_API_URL}/profile/`, payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => {
                setProfile(response.data);
                setIsEditing(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setErrorMessage({});
            })
            .catch((error) => {
                if (error.response) {
                    setErrorMessage(error.response.data);
                }
            });
    };

    const updateProfilePic = (file) => {
        // Make API call to update the profile picture
        const formData = new FormData();
        formData.append("profile_picture", file);

        axios
            .put(`${ACCOUNTS_API_URL}/profile/`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => {
                // Force a component refresh
                setProfile(response.data);
                changeProfilePic(response.data.profile_picture);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <div className="jumbotron profile">
            <div className="profile-container center" id="content-wrap">
                <img
                    src={
                        profile.profile_picture !== null
                            ? `/media${profile.profile_picture}`
                            : DEFAULT_PROFILE_PIC
                    }
                    alt="User profile"
                    id="profile_pic"
                />
                <div className="d-flex justify-content-center">
                    <label
                        htmlFor="profile-upload"
                        id="upload-profile-pic"
                        className="btn btn-outline-info btn-sm"
                    >
                        Upload Profile Picture
                    </label>
                    <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                            // Make the API call to the backend to upload the image
                            if (event.target.files[0].size > 2097152) {
                                alert(
                                    "File is too big! Please upload a file less than 2MB."
                                );
                                return;
                            }
                            updateProfilePic(event.target.files[0]);
                        }}
                    />
                </div>
                <div>
                    <p>Username: {profile.user.username}</p>
                    {isEditing ? (
                        <div>
                            {/* Input fields for editing */}
                            <TextFieldProfile
                                className="form-group"
                                type="text"
                                label="First Name"
                                value={firstName}
                                onChange={setFirstName}
                                errorMessage={errorMessage.first_name}
                            />
                            <TextFieldProfile
                                className="form-group"
                                type="text"
                                label="Last Name"
                                value={lastName}
                                onChange={setLastName}
                                errorMessage={errorMessage.last_name}
                            />
                                <p>
                                    Leave password fields blank if you do not want to change your password
                                </p>
                                <TextFieldProfile
                                    className="form-group"
                                    type="password"
                                    label="Current Password"
                                    onChange={setCurrentPassword}
                                    errorMessage={errorMessage.current_password}
                                />
                                <TextFieldProfile
                                    className="form-group"
                                    type="password"
                                    label="New Password"
                                    onChange={setNewPassword}
                                    errorMessage={errorMessage.new_password}
                                />
                                <TextFieldProfile
                                    className="form-group"
                                    type="password"
                                    label="Confirm Password"
                                    onChange={setConfirmPassword}
                                    errorMessage={errorMessage.confirm_password}
                                />
                                {errorMessage.non_field_errors && (
                                    <p className="error">
                                        passwordError: {errorMessage.non_field_errors}
                                    </p>
                                )}
                            <button
                                className="button"
                                type="button"
                                onClick={handleSubmit}
                            >
                                Submit Change
                            </button>
                        </div>
                    ) : (
                        <div>
                            {/* Paragraphs for display */}
                            <p>Email: {profile.user.email}</p>
                            <p>First Name: {profile.user.first_name}</p>
                            <p>Last Name: {profile.user.last_name}</p>
                        </div>
                    )}
                    <button className="button" type="button" onClick={toggleEdit}>
                        {isEditing ? "Cancel Edit" : "Edit Profile"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
