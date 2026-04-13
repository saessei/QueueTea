import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profileService } from '../services/profileService';
import supabase from '../config/supabaseClient';

// 1. Setup mocks for both Database and Auth
const mockDbResponse = vi.fn();
const mockAuthResponse = vi.fn();

vi.mock('../config/supabaseClient', () => ({
  default: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: () => mockDbResponse(),
      then: (onfulfilled: (value: unknown) => void) => onfulfilled(mockDbResponse()),
    })),
    auth: {
      updateUser: vi.fn(() => mockAuthResponse()),
    },
  }
}));

describe('Profile Service Endpoint Testing', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

//   Happy route: Get Profile
  it('should return profile data when user exists', async () => {
    const mockUser = { full_name: 'Barista Bob' };
    mockDbResponse.mockResolvedValue({ data: mockUser, error: null });

    const result = await profileService.getProfile('user-123');

    expect(result).toEqual(mockUser);
    expect(supabase.from).toHaveBeenCalledWith('profiles');
  });

//   Profile Not Found 
  it('should return an empty name if profile is missing', async () => {
    mockDbResponse.mockResolvedValue({ 
      data: null, 
      error: { code: 'PGRST116', message: 'Not found' } 
    });

    const result = await profileService.getProfile('new-user');

    expect(result).toEqual({ full_name: "" });
  });

//   Happy Route: Update Name
  it('should successfully upsert the profile name', async () => {
    mockDbResponse.mockResolvedValue({ error: null });

    await expect(profileService.updateName('user-123', 'New Name'))
      .resolves.not.toThrow();
      
    expect(supabase.from).toHaveBeenCalledWith('profiles');
  });

//   Happy Route: Update Password
  it('should successfully update the user password', async () => {
    mockAuthResponse.mockResolvedValue({ data: {}, error: null });

    await expect(profileService.updatePassword('newSecurePassword123'))
      .resolves.not.toThrow();

    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ 
      password: 'newSecurePassword123' 
    });
  });

//   Sad Route: Auth Error
  it('should throw an error if password update fails', async () => {
    mockAuthResponse.mockResolvedValue({ 
      data: null, 
      error: { message: 'Password too weak' } 
    });

    await expect(profileService.updatePassword('123'))
      .rejects.toThrow('Password too weak');
  });
});