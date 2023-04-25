import { useEffect, useState } from 'react';
import './App.css';
import { Auth } from './components/auth';
import { auth, db, storage } from './config/firebase';
import { getDocs, collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';

function App() {
  const [movieList, setMovieList] = useState([])
  const [newMovieTitle, setNewMovieTitle] = useState("")
  const [newReleaseDate, setNewReleaseDate] = useState("")
  const [wonOscar, setWonOscar] = useState(false)
  const [updatedMovieTitle, setUpdatedMovieTitle] = useState("")
  const [fileUpload, setFileUpload] = useState(null)
  const moviesCollectionRef = collection(db, "movies")
  
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
  
  useEffect(() => {
    getMovieList();
  }, [])

  const onSubmitMovie = async () => {
    try {
      await addDoc(moviesCollectionRef,
        {
          title: newMovieTitle,
          releaseDate: newReleaseDate,
          receivedAnOscar: wonOscar,
          userId: auth?.currentUser?.uid
        })
      getMovieList()
    } catch (err) {
      console.error(err)
    }
  }

  const deleteMovie = async (id) => {
    try {
      const movieDoc = doc(db, "movies", id)
      await deleteDoc(movieDoc)
      getMovieList()
    } catch (err) {
      console.error(err)
    }
  }

  const updateMovieTitle = async (id) => {
    try {
      const movieDoc = doc(db, "movies", id)
      await updateDoc(movieDoc, { title: updatedMovieTitle })
      getMovieList()
    } catch (err) {
      console.error(err)
    }
  }

  const uploadFile = async () => {
    if (!fileUpload) return;
    try {
      const filesFolderRef = ref(storage, `projectFiles/${fileUpload.name}`)
      await uploadBytes(filesFolderRef, fileUpload)
    } catch (err) {
      console.error(err)
    }
  }

  
  return (
    <div className="App">
      <Auth />
      <div>
        <input
          type="text"
          placeholder='Movie title...'
          onChange={ e => setNewMovieTitle(e.target.value) }
        />
        <input
          type="number"
          placeholder='Release Date...'
          onChange={ e => setNewReleaseDate(Number(e.target.value)) }
        />
        <input
          type="checkbox"
          checked={ wonOscar }
          onChange={ e => setWonOscar(e.target.checked) }
        />
        <label>Received an Oscar</label>
        <button onClick={onSubmitMovie}>Submit Movie</button>
      </div>
      <div>{ movieList.map((movie) => (
        <div>
          <h1>{ movie.title }</h1>
          <p>Release Date: { movie.releaseDate }</p>
          <p>{ movie.receivedAnOscar ?
            "This won an Oscar" : "no award for this one" }</p>
          <button onClick={ () => deleteMovie(movie.id) }>Delete Movie</button>
          
          <input type="text" placeholder='New title...' onChange={e => setUpdatedMovieTitle(e.target.value)} />
          <button onClick={() => updateMovieTitle(movie.id)}>Update Title</button>
        </div>
      )) }</div>


      <div>
        <input type="file" onChange={e => setFileUpload(e.target.files[0])} />
        <button onClick={uploadFile}>Upload file</button>
      </div>
    </div>
  );
}

export default App;
