import logo from './logo.svg';
import './App.css';
import {useState, useEffect} from 'react'

async function fetchGreeting() {
  const response = await fetch("/graphql", {
    method: "POST",
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query {
          hello
        }
      `,
    }),
  })

  const responseBody = await response.json();
  console.log(responseBody);
}

function App() {

  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, []);

  // useEffect(() => {
  //   fetchGreeting();
  // }, [data]);

  return (
    <div className="App">
      <header className="App-header">
        <p>{!data ? "Loading..." : data}</p>
      </header>
    </div>
  );
}

export default App;
