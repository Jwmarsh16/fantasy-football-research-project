import React, { useRef, useState } from 'react';
import AvatarEditor from 'react-avatar-editor';

const ProfilePicEditor = ({ imageFile, onSave }) => {
  const editorRef = useRef(null);
  const [scale, setScale] = useState(1);

  // When the user clicks save, get the adjusted image as a blob
  const handleSave = () => {
    if (editorRef.current) {
      editorRef.current.getImageScaledToCanvas().toBlob((blob) => {
        // Pass the blob to the parent component (which can then update via Redux)
        onSave(blob);
      });
    }
  };

  return (
    <div>
      <AvatarEditor
        ref={editorRef}
        image={imageFile}
        width={150}
        height={150}
        border={50}
        borderRadius={75}
        color={[255, 255, 255, 0.6]} // RGBA background color
        scale={scale}
        rotate={0}
      />
      <div>
        <label>Zoom:</label>
        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
        />
      </div>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default ProfilePicEditor;
