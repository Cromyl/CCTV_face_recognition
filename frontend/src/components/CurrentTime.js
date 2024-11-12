import React, { useState, useEffect } from 'react';

function CurrentUTC() {
    const [utcTime, setUtcTime] = useState(new Date().toISOString());

    const formatTime = (date) => {
        const dateString = date.toString();
        const date2 = dateString.substring(0, dateString.indexOf('T'));
        const time = dateString.substring(dateString.indexOf('T')+1,dateString.indexOf('.'));
        return "GMT : "+time+"  "+date2;
      };

    useEffect(() => {
        const interval = setInterval(() => {
            setUtcTime(new Date().toISOString());
        }, 1000);

        return () => clearInterval(interval); // Clear interval on component unmount
    }, []);

    return (
        <div>
            {/* <h3>Current UTC Time:</h3> */}
            <div style={styles.time}>{formatTime(utcTime)}</div>
        </div>
    );

    
}

const styles = {
    
    time: {
      color: '#fff',
      fontSize: '18px',
    },
    
  };

export default CurrentUTC;
