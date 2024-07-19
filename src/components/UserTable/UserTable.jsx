import { Pagination, Table } from 'antd';
import styles from './styles.module.scss';
import { useEffect, useState } from 'react';
import apiData from '../../api/apiData';

const UserTable = () => {
    const [users, setUsers] = useState([]);
    const [loading, setIsLoading] = useState(false);
    const [sortedInfo, setSortedInfo] = useState({});

    useEffect(() => {
        setIsLoading(true);
        const fetchData = async () => {
            try {
                const res = await apiData();
                // console.log(res.users);
                setIsLoading(false);

                setUsers(res.users);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, []);

    const handleChange = (...sorter) => {
        const {order, field} = sorter[2];
        setSortedInfo({columnKey: field, order });
    };

    const modData = users.map(({ body, ...item }) => ({
        ...item,
        key: item.id,
        info: body,
        name: `${item.firstName} ${item.maidenName} ${item.lastName}`,
        address: `${item.address.city}, ${item.address.address}`,
    }));

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id,
            sortOrder: sortedInfo.columnKey === 'id' && sortedInfo.order,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name, 'en-US'),
            sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
            align: 'center',
        },
        {
            title: 'Age',
            dataIndex: 'age',
            sorter: (a, b) => a.age - b.age,
            sortOrder: sortedInfo.columnKey === 'age' && sortedInfo.order,
            align: 'center',
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            sorter: (a, b) => a.gender.localeCompare(b.gender),
            sortOrder: sortedInfo.columnKey === 'gender' && sortedInfo.order,
            align: 'center',
        },
        { title: 'Number', dataIndex: 'phone', align: 'center' },
        {
            title: 'Address',
            dataIndex: 'address',
            sorter: (a, b) => a.address.localeCompare(b.address),
            sortOrder: sortedInfo.columnKey === 'address' && sortedInfo.order,
            align: 'center',
        },
    ];

    return (
        <>
            <Table
                columns={columns}
                dataSource={modData}
                bordered
                loading={loading}
                className={styles.table}
                onChange={handleChange}
            />
        </>
    );
};

export default UserTable;
