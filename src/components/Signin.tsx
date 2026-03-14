import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import * as React from "react";

export const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { session, signInUser } = UserAuth()!;
  const navigate = useNavigate();
  console.log(session);
  console.log(email, password);

  const handleSignIn = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const result = await signInUser(email, password);

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
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSignIn}
        className="max-w-md w-full p-8 rounded-lg shadow-lg"
      >
        <h2 className="font-bold pb-2 text-center">Sign in</h2>
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link className="text-blue-600 hover:underline" to="/signup">
            Sign up
          </Link>
        </p>
        <div className="flex flex-col py-4">
          <input
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="p-3 mt-6 rounded border"
            type="email"
            name=""
            id=""
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="p-3 mt-6 rounded border"
            type="password"
            name=""
            id=""
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-6 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          > {loading ? "Logging in..." : "Sign In"}
          </button>
          {error && <p className="text-red-500 pt-4 text-center">{error}</p>}
        </div>
      </form>
    </div>
  );
};

export default Signin;