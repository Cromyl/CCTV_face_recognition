import React, { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CrowdDensity = () => {
    const [dataPoints, setDataPoints] = useState({ x: [], y: [] });
    const [ws, setWs] = useState(null);
    const chartRef = useRef(null); // Create a ref to target the chart element

    const data = {
        labels: dataPoints.x,
        datasets: [
            {
                label: 'Number of People',
                data: dataPoints.y,
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                fill: false,
                tension: 0.1,
            },
        ],
    };
    
    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
        },
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                title: {
                    display: true,
                    text: 'Frame',  // Label for the x-axis
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Number of People',  // Label for the y-axis
                },
            },
        },
    };
    

    const addDataPoint = (x, y) => {
        setDataPoints((prevData) => ({
            x: [...prevData.x, x],
            y: [...prevData.y, y],
        }));
    };

    const downloadChartAsImage = () => {
        const chart = chartRef.current?.chart; // Access the chart instance directly from the ref
        if (chart) {
            const imageUrl = chart.toBase64Image(); // Get the chart as a base64 image
            const a = document.createElement('a'); // Create a temporary anchor element
            a.href = imageUrl;
            a.download = 'crowd_density_chart.jpg'; // Set the file name
            a.click(); // Trigger the download
        } else {
            console.error('Chart instance not found');
        }
    };

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:65432');

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        ws.onmessage = async (event) => {
            const textData = await event.data.text(); // Convert Blob to text
            const numbers = textData.slice(1, -1).split(',').map(Number);

            const num1 = numbers[0];
            const num2 = numbers[1];

            addDataPoint(num1, num2);
        };

        ws.onclose = (event) => {
            console.log('WebSocket connection closed:', event);
            if (!event.wasClean) {
                console.log('Reconnecting...');
                setTimeout(() => setWs(new WebSocket('ws://localhost:65432')), 1000);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            ws.close();
        };

        setWs(ws);

        return () => {
            ws.close();
        };
    }, []);

    return (
        <div>
            {/* <h2>Crowd Density Data</h2> */}
            <Line ref={chartRef} data={data} options={options} />
            {/* <button onClick={downloadChartAsImage}>Download Graph as JPG</button> */}
        </div>
    );
};

export default CrowdDensity;
