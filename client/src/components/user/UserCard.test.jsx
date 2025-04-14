// UserCard.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
    expect(screen.getByRole('link', { name: /view profile/i })).toBeInTheDocument();
  });
});
