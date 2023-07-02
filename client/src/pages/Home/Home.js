import GameBoard from '../../components/GameBoard/gameboard';
import Header from '../../components/Header/header';
import InstagramBoard from '../../components/InstagramBoard/instagramboard';
import './Home.css';
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

  // useEffect(() => {
  //   fetch("/api")
  //     .then((res) => res.json())
  //     .then((data) => setData(data.message));
  // }, []);

  // useEffect(() => {
  //   fetchGreeting();
  // }, [data]);

  return (
    <>
      <div className="dashboard">
        <GameBoard></GameBoard>
        <InstagramBoard></InstagramBoard>
      </div>

      <div className="group-stage">
        <GameBoard></GameBoard>
      </div>
    </>
  );
}

export default App;
