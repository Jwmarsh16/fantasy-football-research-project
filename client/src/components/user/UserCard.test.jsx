import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import UserCard from './UserCard';

describe('UserCard', () => {
  it('renders user info and link', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      profilePic: '',
      isFake: false,
    };

    render(
      <MemoryRouter>
        <UserCard user={mockUser} />
      </MemoryRouter>
    );

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View profile for testuser' })).toHaveAttribute('href', '/profile/1');
  });

  it('shows initials when a photo fails and tries a new photo when it changes', () => {
    const user = { id: 1, username: 'Test User', profilePic: '/old-photo.jpg' };
    const { rerender } = render(
      <MemoryRouter>
        <UserCard user={user} />
      </MemoryRouter>
    );

    fireEvent.error(screen.getByAltText(''));
    expect(screen.getByText('TU')).toBeInTheDocument();
    expect(screen.queryByAltText('')).not.toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <UserCard user={{ ...user, profilePic: '/new-photo.jpg' }} />
      </MemoryRouter>
    );

    expect(screen.getByAltText('')).toHaveAttribute('src', '/new-photo.jpg');
    expect(screen.queryByText('TU')).not.toBeInTheDocument();
  });
});
