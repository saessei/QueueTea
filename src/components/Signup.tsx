import { useState } from "react";
import { Header } from "./common/Header";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import * as React from "react";
import '../index.css'

export const Signup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("")
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { session, signUpNewUser } = UserAuth()!;
  const navigate = useNavigate();
  console.log(session);
  console.log(email, name, password);

  const handleSignUp = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const result = await signUpNewUser(email, password);

      if (result.success) {
        navigate("/dashboard");
      }
    } catch (error) {
      setError("An error occured.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream h-screen w-full overflow-hidden">
      <Header/>
    <div className="flex flex-col items-center justify-center min-h-screen bg-cream -mt-12">
      
      <form
        onSubmit={handleSignUp}
        className="max-w-md w-full p-8 rounded-xl shadow-lg bg-white"
      >
        <h2 className="text-brown-two text-2xl font-semibold font-fredoka pb-2 text-center">SIGN UP NOW!</h2>
        <p className="text-center text-sm text-gray-600 font-quicksand">
          Already have an account?{" "}
          <Link className="text-brown-two font-semibold px-2 bg-cream border border-brown rounded-full hover:underline" to="/signin">
            Sign in
          </Link>
        </p>
        <div className="flex flex-col py-4 font-quicksand text-brown-two">
          Full Name
          <input
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="p-3 mt-2 mb-4 rounded-3xl bg-gray-100"
            type="name"
            name=""
            id=""
          />
          Email
          <input
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="p-3 mt-2 mb-4 rounded-3xl bg-gray-100"
            type="email"
            name=""
            id=""
          />
          Password
          <input
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="p-3 mt-2 rounded-3xl bg-gray-100"
            type="password"
            name=""
            id=""
          />
          <div className="flex flex-row gap-3 mt-6 items-center justify-center">
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl font-semibold bg-gradient-to-r from-brown-two to-dark-brown px-4 py-2 text-white duration-300 hover:scale-[1.05]"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
            <button
              type="button"
              className="rounded-2xl font-semibold border border-gray-300 px-4 py-2 text-gray-700 bg-white duration-300 hover:bg-gray-100 hover:scale-[1.05] flex items-center justify-center gap-2"
            >
              Continue with
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" className="w-4 h-4">
                <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.4-34.1-4.1-50.3H272v95.4h146.9c-6.4 34.8-25.8 64.3-55 84.2v69.9h88.7c52.1-48 82-118.8 82-199.2z"/>
                <path fill="#34A853" d="M272 544.3c74.7 0 137.4-24.7 183-66.9l-88.7-69.9c-24.6 16.5-56.5 26.2-94.3 26.2-72.5 0-134-48.9-155.9-114.9H23.8v72.1C69.6 487.6 165.2 544.3 272 544.3z"/>
                <path fill="#FBBC05" d="M116.1 327.8c-10.5-31.5-10.5-65.5 0-97l-92.3-71.5C7.4 185.5 0 231.5 0 278.4s7.4 92.9 23.8 135.1l92.3-71.5z"/>
                <path fill="#EA4335" d="M272 107.7c39.5 0 75 13.6 102.8 40.3l77.1-77.1C409.3 24.7 346.6 0 272 0 165.2 0 69.6 56.6 23.8 140.9l92.3 71.5C138 156.5 199.5 107.7 272 107.7z"/>
              </svg>
              
            </button>
          </div>
          {error && <p className="text-red-500 pt-4 text-center">{error}</p>}
        </div>
      </form>
    </div>
    </div>
  );
};

export default Signup;