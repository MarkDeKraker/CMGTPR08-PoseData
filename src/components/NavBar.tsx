import { Link, useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();
  return (
    <div className="bg-black p-2">
      <div className="flex justify-between">
        <div onClick={() => navigate("/")} className="cursor-pointer">
          <h1 className="font-medium text-2xl text-white">
            CMGTPRG02-8 / Posedata
          </h1>
        </div>
        <div className="flex space-x-4">
          <Link to="/navigation" className="text-white mr-2">
            Navigatie
          </Link>
        </div>
      </div>
    </div>
  );
}
