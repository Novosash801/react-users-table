import { Button, Input, Space, Table, message, Modal, Tooltip } from 'antd';
import { Resizable } from 'react-resizable';
import styles from './styles.module.scss';
import { useEffect, useState } from 'react';
import apiData from '../../api/apiData'; // Импорт стилей для react-resizable

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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const res = await apiData();
            setIsLoading(false);

            if (res.error) {
                // Обработка ошибки
                message.error(`Ошибка: ${res.error}`);
                return;
            }

            const modUsers = res.users.map((item) => ({
                ...item,
                key: item.id,
                name: `${item.firstName} ${item.maidenName || ''} ${item.lastName}`,
                address: `${item.address.city}, ${item.address.address}`,
            }));
            setUsers(modUsers);
            setFilteredData(modUsers);
        } catch (error) {
            setIsLoading(false);
            console.error('Ошибка при обработке данных:', error);
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
                width: 50,
            },
            {
                title: 'ФИО',
                dataIndex: 'name',
                sorter: (a, b) => a.name.localeCompare(b.name, 'en-US'),
                sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
                align: 'center',
                width: 200,
                ellipsis: true,
            },
            {
                title: 'Возраст',
                dataIndex: 'age',
                sorter: (a, b) => a.age - b.age,
                sortOrder: sortedInfo.columnKey === 'age' && sortedInfo.order,
                align: 'center',
                width: 100,
            },
            {
                title: 'Пол',
                dataIndex: 'gender',
                sorter: (a, b) => a.gender.localeCompare(b.gender),
                sortOrder: sortedInfo.columnKey === 'gender' && sortedInfo.order,
                align: 'center',
                width: 100,
            },
            { title: 'Телефон', dataIndex: 'phone', align: 'center', width: 150, ellipsis: true },
            {
                title: 'Адрес',
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
            const newWidth = Math.max(size.width, 50); // Минимальная ширина 50px

            // Суммарная ширина всех столбцов
            const totalWidth = newColumns.reduce((sum, col, colIndex) => {
                return sum + (colIndex === index ? newWidth : col.width || 0);
            }, 0);

            if (totalWidth <= 1200) {
                // Максимальная ширина таблицы 1200px
                newColumns[index] = {
                    ...newColumns[index],
                    width: newWidth,
                };
                setColumns(newColumns);
            }
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

    const showModal = (record) => {
        setSelectedUser(record);
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
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
                    Поиск
                </Button>
                <Button onClick={clearAll} className={styles.clearBtn}>
                    Сброс
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
                style={{ cursor: 'pointer' }}
                onChange={handleChange}
                pagination={{
                    current: currentPage,
                    onChange: (page, pageSize) => {
                        setCurrentPage(page);
                    },
                }}
                scroll={{ x: true }}
                onRow={(record) => ({
                    onClick: () => showModal(record),
                })}
            />
            <Modal
                title='Подробная информация о пользователе'
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}>
                {selectedUser && (
                    <div>
                        <p>
                            <strong>ФИО:</strong> {selectedUser.name}
                        </p>
                        <p>
                            <strong>Возраст:</strong> {selectedUser.age}
                        </p>
                        <p>
                            <strong>Адрес:</strong> {selectedUser.address}
                        </p>
                        <p>
                            <strong>Рост:</strong> {selectedUser.height} см
                        </p>
                        <p>
                            <strong>Вес:</strong> {selectedUser.weight} кг
                        </p>
                        <p>
                            <strong>Номер телефона:</strong> {selectedUser.phone}
                        </p>
                        <p>
                            <strong>Email:</strong> {selectedUser.email}
                        </p>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default UserTable;
