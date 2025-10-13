let nextId = 1;

export type User = {
  id: number;
  email: string;
  passwordHash: string;
};

const users: User[] = [];

export const findUserByEmail = (email: string) => {
  return users.find(u => u.email === email);
};

export const addUser = ({
  email,
  passwordHash,
}: {
  email: string;
  passwordHash: string;
}) => {
  const user: User = {id: nextId++, email, passwordHash};
  users.push(user);
  return user;
};

const findUserById = (id: number) => {
  return users.find(u => u.id === id);
};

export const getUserFromPayload = (payload: any) => {
  const userId = Number(payload.sub);
  if (!userId || Number.isNaN(userId)) return null;
  const user = findUserById(userId);
  if (!user) return null;
  return user;
};
