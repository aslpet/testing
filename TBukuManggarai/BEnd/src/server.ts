// backend/src/server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database (untuk demo, gunakan database asli di production)
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  cover: string;
  description: string;
}

const users: User[] = [];
const books: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    year: 1925,
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
    description: 'A classic American novel set in the Jazz Age'
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    year: 1949,
    cover: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400',
    description: 'A dystopian social science fiction novel'
  },
  {
    id: '3',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    year: 1960,
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    description: 'A novel about racial injustice in the Deep South'
  },
  {
    id: '4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    year: 1813,
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    description: 'A romantic novel of manners'
  }
];

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Bookstore API is running' });
});

// Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword
    };

    users.push(newUser);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, {
      expiresIn: '24h'
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h'
    });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all books
app.get('/api/books', (req: Request, res: Response) => {
  res.json(books);
});

// Get book by ID
app.get('/api/books/:id', (req: Request, res: Response) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  res.json(book);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(cors({
  origin: 'http://localhost:5173', // URL frontend Vite
  credentials: true
}));