import { Database } from '@root/src/types/supabase_types';
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type User = false | Database['public']['Tables']['users']['Row'];

type UserStorage = BaseStorage<{ user: User; verifyingEmail: string | null }> & {
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  setVerifyingEmail: (email: string) => Promise<void>;
};

const storage = createStorage<{ user: User; verifyingEmail: string | null }>(
  'user-storage-key-1',
  { user: null, verifyingEmail: null },
  {
    storageType: StorageType.Local,
    liveUpdate: true,
  },
);

const userStorage: UserStorage = {
  ...storage,
  login: async (user: User) => {
    await storage.set(() => {
      return { user, verifyingEmail: null };
    });
  },
  logout: async () => {
    await storage.set(() => {
      return { user: null, verifyingEmail: null };
    });
  },
  setVerifyingEmail: async (email: string | null) => {
    await storage.set(() => {
      return { user: null, verifyingEmail: email };
    });
  },
};

export default userStorage;
