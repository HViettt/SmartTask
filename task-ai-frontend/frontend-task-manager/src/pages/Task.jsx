import React from 'react';
import { TaskList } from '../components/task/TasksList';

export const Task = () => {
  return (
    <div className="w-full max-w-7xl mx-auto animate-fadeIn">
      <TaskList />
    </div>
  );
};