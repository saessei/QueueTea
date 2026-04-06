import { useState } from "react";
import { UserAuth } from "../context/AuthContext";

export const Settings = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const { user } = UserAuth();
    
  return (
    <div>Settings</div>
  )
}
