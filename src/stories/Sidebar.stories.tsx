import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from '../components//common/Sidebar';
import { withRouter } from 'storybook-addon-remix-react-router';
import { AuthContext }  from '../context/AuthContext';

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Navigation/Sidebar',
  component: Sidebar,
  decorators: [
    withRouter,
    (Story) => (
      <AuthContext.Provider value={{
        session: { 
          user: { email: 'tea.lover@example.com' } 
        } as any,
        signOut: async () => console.log("Signed out!"),
        signUpNewUser: async () => ({ success: false }),
        signInUser: async () => ({ success: false }),
        refreshSession: async () => console.log("Session refreshed!"),
      }}>
        <div className="flex h-screen bg-cream">
          <Story />
        </div>
      </AuthContext.Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Expanded: Story = {};

export const Collapsed: Story = {
  play: async ({ canvasElement }) => {
    const mainContent = canvasElement.querySelector('main');
    if (mainContent) {
      mainContent.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }
  },
  decorators: [
    (Story) => (
      <AuthContext.Provider value={{
        session: { 
          user: { email: 'tea.lover@example.com' } 
        } as any,
        signOut: async () => console.log("Signed out!"),
        signUpNewUser: async () => ({ success: false }),
        signInUser: async () => ({ success: false }),
        refreshSession: async () => console.log("Session refreshed!"),
      }}>
        <div className="flex h-screen bg-cream">
          <Story />
          <main className="flex-1 p-8">
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-2xl font-bold text-dark-brown mb-4">Main Content Area</h2>
              <p className="text-gray-600">Click on the sidebar to expand</p>
            </div>
          </main>
        </div>
      </AuthContext.Provider>
    ),
  ],
};