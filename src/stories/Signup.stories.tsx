import { Meta, StoryObj } from "@storybook/react";
import { Signup } from "../components/Signup";
import { AuthContext } from "../context/AuthContext";
import { BrowserRouter } from "react-router-dom";

const MockProviders = ({ children, authValue }: any) => (
  <BrowserRouter>
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  </BrowserRouter>
);

const meta: Meta<typeof Signup> = {
  title: "Pages/Signin",
  component: Signup,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Signup>;

// reusable function to fill out the form
const fillForm = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  
  const nameInput = canvas.getByPlaceholderText("Name");
  const emailInput = canvas.getByPlaceholderText("Email");
  const passwordInput = canvas.getByPlaceholderText("Password");
  const submitButton = canvas.getByRole("button", { name: /sign in/i });

  // Simulate typing
  await userEvent.type(emailInput, "boba.lover@example.com", { delay: 50 });
  await userEvent.type(passwordInput, "Password123!", { delay: 50 });
  
  // Verify values are present
  await expect(emailInput).toHaveValue("boba.lover@example.com");
  await expect(passwordInput).toHaveValue("Password123!");

  return { submitButton, canvas };
};
