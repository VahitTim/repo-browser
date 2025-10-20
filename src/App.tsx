import './App.css'
import RepoBrowser from './components/RepoBrowser'
import { ThemeProvider } from './providers/ThemeProvider'

function App() {
  return (
    <ThemeProvider>
      <main className='h-screen'>
        <RepoBrowser/>
      </main>
    </ThemeProvider>
  )
}

export default App
