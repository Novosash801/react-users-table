import { Button, Input, Space, Table } from 'antd';
import { Resizable } from 'react-resizable';
import styles from './styles.module.scss';
import { useEffect, useState } from 'react';
import apiData from '../../api/apiData';// Импорт стилей для react-resizable

const ResizableTitle = (props) => {
    const { onResize, width, ...restProps } = props;

    if (!width) {
        return <th {...restProps} />;
    }

    return (
        <Resizable
            width={width}
            height={0}
            handle={
                <span
                    className='react-resizable-handle'
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                />
            }
            onResize={onResize}
            draggableOpts={{ enableUserSelectHack: false }}>
            <th {...restProps} />
        </Resizable>
    );
};

const UserTable = () => {
    const [users, setUsers] = useState([]);
    const [loading, setIsLoading] = useState(false);
    const [sortedInfo, setSortedInfo] = useState({});
    const [searchData, setSearchData] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredData, setFilteredData] = useState([]);
    const [columns, setColumns] = useState([]);

    const fetchData = async () => {
        try {
            const res = await apiData();
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

    useEffect(() => {
        setColumns([
            {
                title: 'ID',
                dataIndex: 'id',
                sorter: (a, b) => a.id - b.id,
                sortOrder: sortedInfo.columnKey === 'id' && sortedInfo.order,
                width: 100,
            },
            {
                title: 'Name',
                dataIndex: 'name',
                sorter: (a, b) => a.name.localeCompare(b.name, 'en-US'),
                sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
                align: 'center',
                width: 200,
                ellipsis: true,
            },
            {
                title: 'Age',
                dataIndex: 'age',
                sorter: (a, b) => a.age - b.age,
                sortOrder: sortedInfo.columnKey === 'age' && sortedInfo.order,
                align: 'center',
                width: 100,
            },
            {
                title: 'Gender',
                dataIndex: 'gender',
                sorter: (a, b) => a.gender.localeCompare(b.gender),
                sortOrder: sortedInfo.columnKey === 'gender' && sortedInfo.order,
                align: 'center',
                width: 100,
            },
            { title: 'Number', dataIndex: 'phone', align: 'center', width: 150, ellipsis: true },
            {
                title: 'Address',
                dataIndex: 'address',
                sorter: (a, b) => a.address.localeCompare(b.address),
                sortOrder: sortedInfo.columnKey === 'address' && sortedInfo.order,
                align: 'center',
                width: 250,
                ellipsis: true,
            },
        ]);
    }, [sortedInfo]);

    const handleResize =
        (index) =>
        (e, { size }) => {
            const newColumns = [...columns];
            newColumns[index] = {
                ...newColumns[index],
                width: Math.max(size.width, 50), // Минимальная ширина 50px
            };
            setColumns(newColumns);
        };

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

    const components = {
        header: {
            cell: ResizableTitle,
        },
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
                components={components}
                columns={columns.map((col, index) => ({
                    ...col,
                    onHeaderCell: (column) => ({
                        width: column.width,
                        onResize: handleResize(index),
                    }),
                }))}
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
