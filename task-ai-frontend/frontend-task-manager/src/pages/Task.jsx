import React from 'react';
import { TaskList } from '../components/task/TasksList';

export const Task = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <TaskList />
      </div>
    </div>
  );
};