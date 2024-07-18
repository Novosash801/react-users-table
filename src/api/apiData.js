import React from 'react';

const apiData = async () => {
    try {
        const res = await fetch('https://dummyjson.com/users').then((res) => res.json());
        return res;
    } catch (error) {
        console.log(error);
    }
};

export default apiData;
