import React, { useEffect, useState } from 'react';
import Card from './card';  

const URL = `http://localhost:5000/api/fetch_all_unMatched`;

function Unmatched() {
  const [temp, setTemp] = useState([]);
  const [embeddings, setEmbeddings] = useState([]); 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(URL);

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const result = await response.json();
        
        const fileNames = result.map(item => item.file);  
        const embeddingValues = result.map(item => item.embeddings);  

        setTemp(fileNames);
        setEmbeddings(embeddingValues);
        // console.log(result);  
        // console.log("EMEDINGVVVVVVVVVVVVVVVVVVVVVVVVVVVV")
        // console.log(embeddingValues);
        console.log(embeddings[0]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  const handleRemoveCard = (index) => {
    const updatedFiles = temp.filter((_, i) => i !== index);
    const updatedEmbeddings = embeddings.filter((_, i) => i !== index);

    setTemp(updatedFiles);
    setEmbeddings(updatedEmbeddings);
  };

//   return (
//     <div>
//       <h1>Unmatched Faces</h1>
//       <ul>
//         {Array.isArray(temp) && Array.isArray(embeddings) && temp.length > 0 && embeddings.length > 0 ? (
//           temp.map((fileName, index) => (
//             <li key={index}>
//               <Card fileName={fileName} embeddings={embeddings[index]} onRemove={() => handleRemoveCard(index)} />
//             </li>
//           ))
//         ) : (
//           <p>No unmatched faces found</p>
//         )}
//       </ul>
//     </div>
//   );
return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Unmatched Faces</h1>
      <div className="row">
        {Array.isArray(temp) && temp.length > 0 ? (
          temp.map((fileName, index) => (
            <div key={index} className="col-lg-3 col-md-4 col-sm-6 mb-4">
              <Card 
                fileName={fileName} 
                embeddings={embeddings[index]} 
                onRemove={() => handleRemoveCard(index)} 
              />
            </div>
          ))
        ) : (
          <p className="text-center">No unmatched faces found</p>
        )}
      </div>
    </div>
  );
}

export default Unmatched;
