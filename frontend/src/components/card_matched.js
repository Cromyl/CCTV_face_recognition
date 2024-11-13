import React from 'react';

function CardMatched({ fileName, embeddings ,onRemove}) {
  const base64ToImageSrc = (base64String) => `data:image/jpeg;base64,${base64String}`;

  const handleAccept = async () => {
    try {
      const requestBody = {
        file: fileName,
        embedding: embeddings
      };

      const response = await fetch('https://cctv-face-recognition-apis.onrender.com/api/delete_from_matched', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const result = await response.json();
        // alert(result.message);
        onRemove();
      } else {
        const error = await response.json();
        console.error('Server Error:', error);
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      alert('Failed to upload data');
    }
  };


return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title text-center">Identified Face Image</h5>
        <div className="d-flex justify-content-center">
          <img
            src={base64ToImageSrc(fileName)}
            alt="Unmatched Face"
            className="img-fluid rounded mb-3"
            style={{ height: '200px', objectFit: 'cover' }}
          />
        </div>
        <div className="d-flex justify-content-center gap-2">
          <button className="btn btn-danger " onClick={handleAccept} style={{ marginRight: '5px' }}>
            Remove
          </button>
          {/* <button className="btn btn-success" onClick={onRemove}>
          Keep
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default CardMatched;
