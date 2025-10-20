import info from "../public/info.json";

import { BrowserRouter, Route, Routes, useParams } from 'react-router'
import './App.css'
import RepoBrowser from './components/RepoBrowser'
import { ThemeProvider } from './providers/ThemeProvider'

export function Wrapper() {
  const {login} = useParams();
  return (<RepoBrowser login={login!}/>)
}


function App() {
  return (
    <ThemeProvider>
    <main className='h-full'>
    <BrowserRouter>
      <Routes>
        <Route path="/repo-browser/" element={<RepoBrowser login={info.owner.login}/>} />
        <Route path="/repo-browser/:login" element={<Wrapper/>} />
      </Routes>
  </BrowserRouter>
  </main>
  </ThemeProvider>
  )
}

export default App;