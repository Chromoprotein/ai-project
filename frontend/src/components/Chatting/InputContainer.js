import { FaArrowAltCircleUp } from "react-icons/fa";
import { RiAttachment2 } from "react-icons/ri";

export function InputContainer({handleSubmit, query, handleQuery, handleFileChange, preview, handleRemoveImage}) {

  const handleButtonClick = (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <form className="inputContainer" onSubmit={handleSubmit}>
      <textarea id="queryArea" name="queryArea" value={query} onChange={handleQuery} placeholder="Type a message"></textarea>

      {preview && (
        <div>
          <img
            src={preview}
            alt="Selected thumbnail"
            style={{ width: '100px', height: '100px', objectFit: 'cover', cursor: 'pointer' }}
            onClick={handleRemoveImage}
          />
        </div>
      )}

      <input type="file" id="file-upload" onChange={handleFileChange} style={{ display: 'none' }} />

      <div className="buttonContainer">
        <button className="roundButton" onClick={handleButtonClick}><RiAttachment2 /></button>

        <button className="roundButton" type="submit"><FaArrowAltCircleUp /></button>
      </div>
    </form>
  );
}
