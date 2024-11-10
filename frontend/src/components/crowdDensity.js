import React, { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CrowdDensity = () => {
    const [dataPoints, setDataPoints] = useState({ x: [], y: [] });
    const [ws, setWs] = useState(null);
    const chartRef = useRef(null);

    const fetchInitialData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/fetchChartData'); // Replace with your API endpoint
            const initialData = response.data;

            // Assuming each entry in the response has `frame_no` and `count`
            const xValues = initialData.map(entry => entry.frame_no);
            const yValues = initialData.map(entry => entry.count);

            setDataPoints({ x: xValues, y: yValues });
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

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
        maintainAspectRatio: false, // Allows the chart to adjust its aspect ratio
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
                    text: 'Frame',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Number of People',
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
        const chart = chartRef.current?.chart;
        if (chart) {
            const imageUrl = chart.toBase64Image();
            const a = document.createElement('a');
            a.href = imageUrl;
            a.download = 'crowd_density_chart.jpg';
            a.click();
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
            const textData = await event.data.text();
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
        <div style={{ width: '100%', maxWidth: '800px', height: '400px', margin: '0 auto' }}>
            <Line ref={chartRef} data={data} options={options} />
            {/* <button onClick={downloadChartAsImage}>Download Graph as JPG</button> */}
        </div>
    );
};

export default CrowdDensity;
