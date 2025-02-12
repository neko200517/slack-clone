import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export const useCurrentUser = () => {
  const data = useQuery(api.users.current);
  // undefined: データが存在していて読み込み中の場合
  // null: データが存在しない場合
  const isLoading = data === undefined;

  return { data, isLoading };
};
