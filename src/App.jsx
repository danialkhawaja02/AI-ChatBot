import Chatbot from "./components/Chatbot"
import Content from "./components/Content"



function App() {
  return (
    <>
      <div className="w-full flex md:justify-center py-14">
        <div className="max-w-7xl flex flex-col items-center">
          <Content/>
          <Chatbot/>
        </div>
      </div>
    </>
  )
}

export default App
