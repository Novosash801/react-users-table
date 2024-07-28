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
    const [loading, setLoading] = useState(false);
    const [sortedInfo, setSortedInfo] = useState({});
    const [searchData, setSearchData] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredData, setFilteredData] = useState([]);
    const [columns, setColumns] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://dummyjson.com/users');
            const result = await response.json();
            setLoading(false);

            if (result.error) {
                message.error(`Ошибка: ${result.error}`);
                return;
            }

            const modUsers = result.users.map((item) => ({
                ...item,
                key: item.id,
                name: `${item.firstName} ${item.maidenName || ''} ${item.lastName}`,
                address: `${item.address.city}, ${item.address.address}`,
            }));
            setUsers(modUsers);
            setFilteredData(modUsers);
        } catch (error) {
            setLoading(false);
            console.error('Ошибка при обработке данных:', error);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, []);

    useEffect(() => {
        const getSortTooltipText = (columnKey) => {
            if (sortedInfo.columnKey === columnKey) {
                if (sortedInfo.order === 'ascend') return ' (по возрастанию)';
                if (sortedInfo.order === 'descend') return ' (по убыванию)';
            }
            return '';
        };

        setColumns([
            {
                title: () => <span>ID {getSortTooltipText('id')}</span>,
                dataIndex: 'id',
                sorter: (a, b) => a.id - b.id,
                sortOrder: sortedInfo.columnKey === 'id' && sortedInfo.order,
                width: 50,
            },
            {
                title: () => <span>ФИО {getSortTooltipText('name')}</span>,
                dataIndex: 'name',
                sorter: (a, b) => a.name.localeCompare(b.name, 'en-US'),
                sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
                align: 'center',
                width: 200,
                ellipsis: true,
            },
            {
                title: () => <span>Возраст {getSortTooltipText('age')}</span>,
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
            {
                title: 'Номер',
                dataIndex: 'phone',
                align: 'center',
                width: 150,
                ellipsis: true,
            },
            {
                title: () => <span>Адрес {getSortTooltipText('address')}</span>,
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
            const newWidth = Math.max(size.width, 50);

            const totalWidth = newColumns.reduce((sum, col, colIndex) => {
                return sum + (colIndex === index ? newWidth : col.width || 0);
            }, 0);

            if (totalWidth <= 1200) {
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
        setFilteredData(users);
    };

    const handleSearch = async (e) => {
        const query = e.target.value.toLowerCase();
        setSearchData(query);

        if (query === '') {
            setFilteredData(users);
            return;
        }

        const filtered = users.filter((item) =>
            Object.keys(item).some((key) => String(item[key]).toLowerCase().includes(query)),
        );
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
                showSorterTooltip={false}
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
