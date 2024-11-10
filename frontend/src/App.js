import logo from './logo.svg';
import './App.css';
import CrowdDensity from './components/crowdDensity';
import CurrentUTC from './components/CurrentTime';

function App() {
  return (
    <>
    <CurrentUTC/>
    <CrowdDensity/>
    </>
  );
}

export default App;
