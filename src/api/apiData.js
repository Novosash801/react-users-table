
const apiData = async () => {
    try {
        const response = await fetch('https://dummyjson.com/users');
        if (!response.ok) {
            // Проверка на статус ответа
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
        return { error: error.message };
    }
};

export default apiData;

