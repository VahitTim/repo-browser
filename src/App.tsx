import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import RepoBrowser from './components/RepoBrowser'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <RepoBrowser/>
    </>
  )
}

export default App
