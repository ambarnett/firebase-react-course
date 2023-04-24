import { useEffect, useState } from 'react';
import './App.css';
import { Auth } from './components/auth';
import { db } from './config/firebase';
import { getDocs, collection } from 'firebase/firestore';

function App() {
  const [movieList, setMovieList] = useState([])
  const moviesCollectionRef = collection(db, "movies")
  
  useEffect(() => {
    const getMovieList = async () => {
      //READ THE DATA FROM DB
      try {
        const data = await getDocs(moviesCollectionRef)
        const filteredData = data.docs.map(doc => ({...doc.data(), id:doc.id})) // this removes a lot of the extra stuff that firestore wants to return on the console.log
        setMovieList(filteredData);
      } catch (err) {
        console.error(err)
      }
    }  
    
    getMovieList();
  }, [])

  
  return (
    <div className="App">
      <Auth />
      <div>{ movieList.map((movie) => (
        <div>
          <h1>{ movie.title }</h1>
          <p>Release Date: { movie.releaseDate }</p>
          <p>{movie.receivedAnOscar ? "no award for this one" : "This won an Oscar" }</p>
        </div>
      ))}</div>
    </div>
  );
}

export default App;
