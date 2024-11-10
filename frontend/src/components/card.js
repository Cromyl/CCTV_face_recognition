import React from 'react';

function Card({ fileName, embeddings ,onRemove}) {
  const base64ToImageSrc = (base64String) => `data:image/jpeg;base64,${base64String}`;

  const handleAccept = async () => {
    try {
      const requestBody = {
        file: fileName,
        embedding: embeddings
      };

      const response = await fetch('http://localhost:5000/api/upload_to_Matched', {
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

//   return (
//     <div className="card">
//       <h3>Unidentified Face Image</h3>
//       <img
//         src={base64ToImageSrc(fileName)}
//         alt="Unmatched Face"
//         style={{ width: '200px', height: '200px', objectFit: 'cover' }}
//       />
//       <div>
//         <button onClick={handleAccept}>Accept this person</button>
//         <button onClick={onRemove}>Decline</button>
//       </div>
//     </div>
//   );
return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title text-center">Unidentified Face Image</h5>
        <div className="d-flex justify-content-center">
          <img
            src={base64ToImageSrc(fileName)}
            alt="Unmatched Face"
            className="img-fluid rounded mb-3"
            style={{ height: '200px', objectFit: 'cover' }}
          />
        </div>
        <div className="d-flex justify-content-center gap-2">
          <button className="btn btn-success " onClick={handleAccept} style={{ marginRight: '5px' }}>
            Accept
          </button>
          <button className="btn btn-danger" onClick={onRemove}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

export default Card;
