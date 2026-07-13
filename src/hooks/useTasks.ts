import { useState, useEffect } from 'react';
import { getCachedData, setCachedData, isCacheValid } from '@/lib/cache';

import { API_BASE_URL } from '@/lib/config';

export interface Task {
  id: number;
  type: string;
  title: string;
  description: string;
  difficulty: string;
  reward_amount: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const cacheKey = 'system_tasks';
      if (isCacheValid(cacheKey)) {
        const cached = getCachedData<Task[]>(cacheKey);
        if (cached) {
          setTasks(cached);
          setLoading(false);
          return;
        }
      }
      try {
        const res = await fetch(`${API_BASE_URL}/tasks/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch tasks');
        const data = await res.json();
        const tasksList = Array.isArray(data.results) ? data.results : [];
        setCachedData(cacheKey, tasksList);
        setTasks(tasksList);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  return { tasks, loading };
}
