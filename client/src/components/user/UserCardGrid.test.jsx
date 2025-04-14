// UserCardGrid.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserCardGrid from './UserCardGrid';

describe('UserCardGrid', () => {
  it('renders all user cards', () => {
    const mockUsers = [
      { id: 1, username: 'test1', profilePic: '', isFake: false },
      { id: 2, username: 'test2', profilePic: '', isFake: true },
    ];

    render(
      <MemoryRouter>
        <UserCardGrid users={mockUsers} />
      </MemoryRouter>
    );

    expect(screen.getByText('test1')).toBeInTheDocument();
    expect(screen.getByText('test2')).toBeInTheDocument();
  });
});
