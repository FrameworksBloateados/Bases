let nextId = 1

export type User = {
  id: number
  email: string
  passwordHash: string
}

const users: User[] = []

export const findUserByEmail = (email: string) => {
  return users.find((u) => u.email === email)
}

export const addUser = ({ email, passwordHash }: { email: string; passwordHash: string }) => {
  const user: User = { id: nextId++, email, passwordHash }
  users.push(user)
  return user
}

export const findUserById = (id: number) => {
  return users.find((u) => u.id === id)
}
