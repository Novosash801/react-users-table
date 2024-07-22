import { Button, Input, Pagination, Space, Table } from 'antd';
import styles from './styles.module.scss';
import { Resizable } from 'react-resizable';
import { useEffect, useState } from 'react';
import apiData from '../../api/apiData';

// const ResizableTitle = (props) => {
//     const { onResize, width, ...restProps } = props;
//     return (
//         <Resizable
//             width={width}
//             height={0}
//             onResize={onResize}
//             minConstraints={[50, 0]} // Минимальная ширина 50px
//         >
//             <th {...restProps} style={{ ...restProps.style, overflow: 'hidden' }} />
//         </Resizable>
//     );
// };

const UserTable = () => {
    const [users, setUsers] = useState([]);
    const [loading, setIsLoading] = useState(false);
    const [sortedInfo, setSortedInfo] = useState({});
    const [searchData, setSearchData] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredData, setFilteredData] = useState([]);

    const fetchData = async () => {
        try {
            const res = await apiData();
            // console.log(res.users);
            setIsLoading(false);
            const modUsers = res.users.map((item) => ({
                ...item,
                key: item.id,
                name: `${item.firstName} ${item.maidenName || ''} ${item.lastName}`,
                address: `${item.address.city}, ${item.address.address}`,
            }));
            setUsers(modUsers);
            setFilteredData(modUsers);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchData();
    }, []);

   
    const handleChange = (pagination, filters, sorter) => {
        const { order, field } = sorter;
        setSortedInfo({ columnKey: field, order });
    };

    const clearAll = () => {
        setSortedInfo({});
        setSearchData('');
        setCurrentPage(1);
        fetchData();
    };

    // const modData = users.map((item) => ({
    //     ...item,
    //     key: item.id,
    //     name: `${item.firstName} ${item.maidenName || ''} ${item.lastName}`,
    //     address: `${item.address.city}, ${item.address.address}`,
    // }));

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
            width: 200, // Начальная ширина, которую можно изменить
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

    const handleSearch = (e) => {
        setSearchData(e.target.value);
        if (e.target.value === '') {
            setFilteredData(users);
        }
    };
    const globalSearch = () => {
        const searchLower = searchData.toLowerCase();
        const filtered = users.filter((value) => {
            const fullName =
                `${value.firstName || ''} ${value.maidenName || ''} ${value.lastName || ''}`.toLowerCase();
            const address = value.address.toLowerCase();

            return (
                fullName.includes(searchData.toLowerCase()) ||
                (value.age && value.age.toString().includes(searchData)) ||
                (value.gender && value.gender.toLowerCase().includes(searchData.toLowerCase())) ||
                (value.phone && value.phone.toLowerCase().includes(searchData.toLowerCase())) ||
                address.includes(searchLower)
            );
        });
        setFilteredData(filtered);
    };

    return (
        <>
            <Space style={{ marginBottom: 16 }}>
                <Input
                    placeholder='Введите данные...'
                    onChange={handleSearch}
                    type='text'
                    allowClear
                    value={searchData}
                    className={styles.input}
                />
                <Button type='primary' onClick={globalSearch}>
                    Search
                </Button>
                <Button onClick={clearAll} className={styles.clearBtn}>
                    Clear All
                </Button>
            </Space>
            <Table
                columns={columns}
                dataSource={filteredData.length ? filteredData : users}
                bordered
                loading={loading}
                className={styles.table}
                onChange={handleChange}
                pagination={{
                    current: currentPage,
                    onChange: (page, pageSize) => {
                        setCurrentPage(page);
                    },

                }}
            />
        </>
    );
};

export default UserTable;
