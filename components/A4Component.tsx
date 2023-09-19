import React, { useState, useEffect } from 'react';

interface Props {
    scale: number;
}

const A4Component: React.FC<React.PropsWithChildren<Props>> = ({children, scale}) => {
    const width = 8.27 * scale; // in inches
    const height = 11.69 * scale; // in inches

    return (
        <div style={{
            width: `${width}in`,
            height: `${height}in`,
            // background: 'white',
            // boxShadow: '2px 2px 12px rgba(0,0,0,0.1)'
        }}>
            {children}
        </div>
    );
}

export default A4Component;
