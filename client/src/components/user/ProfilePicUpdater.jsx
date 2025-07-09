// src/components/user/ProfilePicUpdater.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateProfilePic,
  setUserDetails,
  fetchUsers
} from "../../redux/slices/userSlice";
import ProfilePicEditor from "./ProfilePicEditor";
import axios from "axios";

const ProfilePicUpdater = ({ userId, onUpdate }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.user.userDetails);

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setEditorVisible(true);
    }
  };

  // Handle save after cropping/editing
  const handleEditorSave = async (blob) => {
    if (!userId || isNaN(userId)) {
      setMessage("Error: User ID is missing.");
      return;
    }

    const fileToUpload = new File([blob], "profilePic.png", {
      type: blob.type
    });
    if (!fileToUpload) {
      setMessage("Error: No file selected.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("profilePic", fileToUpload);
      formData.append("userId", userId);
      const response = await axios.put(
        `/api/users/${userId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 200 && response.data.profilePic) {
        setMessage("Profile picture updated successfully!");
        const newProfilePic = response.data.profilePic;
        dispatch(setUserDetails({
          ...userDetails,
          profilePic: newProfilePic
        }));
        dispatch(fetchUsers());
        if (onUpdate) onUpdate({ profilePic: newProfilePic });
        setEditorVisible(false);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      setMessage("Error updating profile picture.");
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditorVisible(false);
    setSelectedFile(null);
  };

  return (
    <div className="profile-pic-updater">
      {!selectedFile && (
        <>
          {/* Hidden file input */}
          <input
            id="profile-pic-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {/* Professional text button */}
          <label
            htmlFor="profile-pic-upload"
            className="file-upload-button"
            aria-label="Upload Profile Photo"
          >
            Upload Photo {/* Replaced emoji with clear, professional text */}
          </label>
        </>
      )}
      {editorVisible && selectedFile && (
        <ProfilePicEditor
          imageFile={selectedFile}
          onSave={handleEditorSave}
          onCancel={handleCancel}
        />
      )}
      {loading && <p className="status-message">Uploading…</p>}
      {message && <p className="status-message">{message}</p>}
    </div>
  );
};

export default ProfilePicUpdater;
