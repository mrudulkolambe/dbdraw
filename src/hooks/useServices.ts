import { useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';
import ProjectService from '@/api/services/projects';
import TableService from '@/api/services/tables';
import EdgeService from '@/api/services/edges';

export const useServices = () => {
  const { getToken } = useAuth();

  const services = useMemo(() => {
    const getTokenFn = async () => {
      try {
        console.log('Fetching token from Clerk...');
        return await getToken();
      } catch (error) {
        console.error('Failed to get token from Clerk:', error);
        return null;
      }
    };

    return {
      projectService: new ProjectService(getTokenFn),
      tableService: new TableService(getTokenFn),
      edgeService: new EdgeService(getTokenFn),
    };
  }, [getToken]);

  return services;
};
