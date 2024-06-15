import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NavigationPage from "./pages/NavigationPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/navigation" element={<NavigationPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
