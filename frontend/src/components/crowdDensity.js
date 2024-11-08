import React, { useEffect, useState } from 'react';

const CrowdDensity = () => {
    const [dataList, setDataList] = useState([]);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:65432');

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
            // ws.send('Hello from React client');
        };

        ws.onmessage = (event) => {
            console.log('Received:', event.data);
            setDataList((prevData) => [...prevData, event.data]);
        };

        ws.onclose = () => console.log('WebSocket connection closed');

        // Cleanup on component unmount
        return () => ws.close();
    }, []);

    return (
        <div>
            <h1>Crowd Density Data</h1>
            <ul>
                {dataList.map((data, index) => (
                    <li key={index}>{data}</li>
                ))}
            </ul>
        </div>
    );
};

export default CrowdDensity;
