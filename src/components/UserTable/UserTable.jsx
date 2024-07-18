import { Table } from 'antd';
import styles from './styles.module.scss';
import { useEffect, useState } from 'react';
import apiData from '../../api/apiData';

const UserTable = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
     
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await apiData();
                console.log(res);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, []);

    return <>
        <h2>Table</h2>
    </>;
};

export default UserTable;
