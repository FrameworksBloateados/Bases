let nextId = 1

export type User = {
  id: number
  email: string
  passwordHash: string
}

const users: User[] = []

export function findUserByEmail(email: string) {
  return users.find((u) => u.email === email)
}

export function addUser({ email, passwordHash }: { email: string; passwordHash: string }) {
  const user: User = { id: nextId++, email, passwordHash }
  users.push(user)
  return user
}

export function findUserById(id: number) {
  return users.find((u) => u.id === id)
}
