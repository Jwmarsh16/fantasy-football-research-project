import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfilePic, setUserDetails, fetchUsers } from "../../redux/slices/userSlice";
import ProfilePicEditor from "./ProfilePicEditor";
import axios from "axios";

const ProfilePicUpdater = ({ userId, onUpdate }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.user.userDetails); // ✅ Get user details from Redux

  // ✅ Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setEditorVisible(true);
    }
  };

  // ✅ Handle save action after image editing
  const handleEditorSave = async (blob) => {
    console.log("Attempting to upload profile picture for userId:", userId);

    if (!userId || isNaN(userId)) {
      console.error("Error: userId is undefined or invalid:", userId);
      setMessage("Error: User ID is missing.");
      return;
    }

    const fileToUpload = new File([blob], "profilePic.png", { type: blob.type });

    if (!fileToUpload) {
      console.error("Error: No file selected for upload.");
      setMessage("Error: No file selected.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("profilePic", fileToUpload);
      formData.append("userId", userId);

      // ✅ Send file to Flask backend (uploads to AWS S3)
      const response = await axios.put(
        `/api/users/${userId}`,  // ✅ Use a relative path
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      

      console.log("Server response:", response);

      if (response.status === 200 && response.data.profilePic) {
        setMessage("Profile picture updated successfully!");

        // ✅ Use the full pre-signed URL directly from the backend
        const newProfilePic = response.data.profilePic;

        dispatch(setUserDetails({ ...userDetails, profilePic: newProfilePic }));
        dispatch(fetchUsers());

        // ✅ Call `onUpdate` to refresh UI immediately
        if (onUpdate) {
          console.log("Calling onUpdate to refresh UI with new profile picture.");
          onUpdate({ profilePic: newProfilePic }); // ✅ Ensure Redux and UI update with the correct pre-signed URL
        }

        // ✅ Reset state
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

  // ✅ Handle cancel action
  const handleCancel = () => {
    setEditorVisible(false);
    setSelectedFile(null);
  };

  return (
    <div className="profile-pic-updater">
      {!selectedFile && (
        <input type="file" accept="image/*" onChange={handleFileChange} />
      )}
      {editorVisible && selectedFile && (
        <ProfilePicEditor
          imageFile={selectedFile}
          onSave={handleEditorSave}
          onCancel={handleCancel}
        />
      )}
      {loading && <p>Uploading...</p>}
      {message && <p>{message}</p>}
    </div>
  );
};

export default ProfilePicUpdater;
