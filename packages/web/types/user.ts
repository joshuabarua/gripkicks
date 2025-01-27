// user.ts
export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    phone: number;
  }

  export interface Users {
    users: User[];
  }