import { useState, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import { profileService } from "../services/profileService";

export const Settings = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const { session } = UserAuth();
  const user = session?.user;

  useEffect(() => {
    if (session?.user?.id) {
      profileService
        .getProfile(session.user.id)
        .then((data) => {
          setName(data.full_name || "");
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [session]);

  const handleUpdateName = async () => {
    if (!session?.user?.id) {
    console.error("No user found!");
    return;
  }

  try {
    await profileService.updateName(session.user.id, name);
    console.log("Name updated successfully!");
    alert("Name updated!"); 
  } catch (err) {
    console.error("Update failed:", err);
  }
};

  return <div>Settings</div>;
};
