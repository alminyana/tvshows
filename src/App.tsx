import { Routes, Route } from 'react-router-dom';
import styles from './App.module.scss';

function App() {
  return (
    <div className={styles.app}>
      <Routes>
        <Route path="/" element={<h1>Hello World</h1>} />
      </Routes>
    </div>
  );
}

export default App;
