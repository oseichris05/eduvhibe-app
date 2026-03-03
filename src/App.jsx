import Eduvhibe from './Eduvhibe'
import { UserProvider } from './UserContext.jsx'

function App() {
  return (
    <UserProvider>
    <Eduvhibe />
    </UserProvider>
  )
}

export default App