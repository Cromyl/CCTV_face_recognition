import React, { useEffect, useState } from 'react';
import Card from './card';

const URL = `http://localhost:5000/api/fetch_all_unMatched`;

function Unmatched() {
  const [temp, setTemp] = useState([]);
  const [embeddings, setEmbeddings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [totalPages, setTotalPages] = useState(1); // Track total pages
  const [loading, setLoading] = useState(false); // Track loading state

  // Fetch data function with pagination support
  const fetchData = async (page) => {
    if (loading || page > totalPages) return;

    setLoading(true);
    try {
      const response = await fetch(`${URL}?page=${page}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();
      const fileNames = result.data.map(item => item.file);
      const embeddingValues = result.data.map(item => item.embeddings);

      // Append new data to the existing data
      setTemp((prevTemp) => [...prevTemp, ...fileNames]);
      setEmbeddings((prevEmbeddings) => [...prevEmbeddings, ...embeddingValues]);
      setTotalPages(result.totalPages); // Update total pages from API response
      setCurrentPage(page); // Update current page
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData(1);
  }, []);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50 &&
        !loading &&
        currentPage < totalPages
      ) {
        fetchData(currentPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage, totalPages, loading]);

  const handleRemoveCard = (index) => {
    const updatedFiles = temp.filter((_, i) => i !== index);
    const updatedEmbeddings = embeddings.filter((_, i) => i !== index);

    setTemp(updatedFiles);
    setEmbeddings(updatedEmbeddings);
  };

  // Refetch latest data
  const handleRefetch = () => {
    setTemp([]);
    setEmbeddings([]);
    setCurrentPage(1);
    fetchData(1); // Fetch from the first page again
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Unmatched Faces</h1>
      <div className="text-center mb-3">
        <button className="btn btn-primary" onClick={handleRefetch} disabled={loading}>
          Refetch New Entries
        </button>
      </div>
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
      {loading && <p className="text-center">Loading...</p>}
    </div>
  );
}

export default Unmatched;
