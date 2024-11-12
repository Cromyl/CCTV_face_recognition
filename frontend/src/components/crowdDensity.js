import React, { useEffect, useState, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const CrowdDensity = () => {
    const [dataPoints, setDataPoints] = useState({ x: [], y: [], known: [] });
    const [movingAverage, setMovingAverage] = useState([]);
    const [ws, setWs] = useState(null);
    const chartRef = useRef(null);

    const fetchInitialData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/fetchChartData');
            const initialData = response.data;

            const xValues = initialData.map(entry => entry.frame_no);
            const yValues = initialData.map(entry => entry.count);
            const knownHeadcount = initialData.map(entry => entry.known_headcount);
            setDataPoints({ x: xValues, y: yValues, known: knownHeadcount });
            calculateMovingAverage(yValues);
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const calculateMovingAverage = (yValues) => {
        const avgData = yValues.map((_, i, arr) => {
            const start = Math.max(0, i - 39);
            const subset = arr.slice(start, i + 1);
            const sum = subset.reduce((acc, val) => acc + val, 0);
            return sum / subset.length;
        });
        setMovingAverage(avgData);
    };

    const addDataPoint = (x, y, known) => {
        setDataPoints((prevData) => {
            const newX = [...prevData.x, x];
            const newY = [...prevData.y, y];
            const newKnown = [...prevData.known, known];
            calculateMovingAverage(newY);
            return { x: newX, y: newY, known: newKnown };
        });
    };

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

    const movingAverageData = {
        labels: dataPoints.x,
        datasets: [
            {
                label: '40-frame Moving Average',
                data: movingAverage,
                borderColor: 'rgba(255,99,132,1)',
                backgroundColor: 'rgba(255,99,132,0.2)',
                fill: false,
                tension: 0.1,
            },
        ],
    };

    const knownUnknownData = {
        labels: dataPoints.x,
        datasets: [
            {
                label: 'Known Headcount',
                data: dataPoints.known,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: 'Unknown Headcount',
                data: dataPoints.y.map((y, index) => Math.max(0, y - dataPoints.known[index])),
                backgroundColor: 'rgba(255, 206, 86, 0.6)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
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
            const knownHeadcount = numbers[2];

            addDataPoint(num1, num2, knownHeadcount);
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
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Crowd Density</h2>
            <div style={{ height: '400px' }}>
                <Line ref={chartRef} data={data} options={options} />
            </div>
            <h2>Rolling Average (Last 40 Frames)</h2>
            <div style={{ height: '400px', marginTop: '20px' }}>
                <Line data={movingAverageData} options={options} />
            </div>
            <h2>Known vs Unknown Headcount</h2>
            <div style={{ height: '400px', marginTop: '20px' }}>
                <Bar data={knownUnknownData} options={options} />
            </div>
        </div>
    );
};

export default CrowdDensity;
