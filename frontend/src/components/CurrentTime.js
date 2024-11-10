import React, { useState, useEffect } from 'react';

function CurrentUTC() {
    const [utcTime, setUtcTime] = useState(new Date().toISOString());

    useEffect(() => {
        const interval = setInterval(() => {
            setUtcTime(new Date().toISOString());
        }, 1000);

        return () => clearInterval(interval); // Clear interval on component unmount
    }, []);

    return (
        <div>
            {/* <h3>Current UTC Time:</h3> */}
            <p>{utcTime}</p>
        </div>
    );
}

export default CurrentUTC;
