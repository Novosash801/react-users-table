import { useState } from 'react';
import UserTable from './components/UserTable/UserTable';

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <div className='container'>
                <h1 className='title'>User table App 📒</h1>
                <UserTable />
            </div>
        </>
    );
}

export default App;
