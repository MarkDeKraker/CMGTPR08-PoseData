import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <>
      <NavBar />
      <main className="flex justify-center mt-40">
        <section className="border-2 rounded-lg  p-2 max-w-xl shadow-lg">
          <h2 className="font-medium text-center mt-2">
            CMGTPRG02-8 / Posedata
          </h2>
          <p className="text-center text-gray-400 mb-2">Mark de Kraker</p>
          <p className="text-center">
            Met deze applicatie kunt u Google Maps besturen met behulp van
            handgebaren. Beweeg eenvoudig uw handen voor de camera en zie hoe de
            kaart reageert op uw bewegingen.
          </p>
          <div className="border-b-2 my-4"></div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/navigation")}
              className="bg-black text-white p-2 rounded-lg w-full hover:bg-black/80"
            >
              Navigatie
            </button>
            <button
              onClick={() => navigate("faq")}
              className="bg-black text-white p-2 rounded-lg w-full hover:bg-black/80"
            >
              FAQ
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
