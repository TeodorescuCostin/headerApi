import logo from './HeaderSvg.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          You want to leve the <code>MATRIX</code> we <code>NOD</code> to you. 😉
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Welcome to Header
        </a>
      </header>
    </div>
  );
}

export default App;

