# 📚 Library Management System API

## 👩🏾‍💻 Technologies
- [x] Node.js  
- [x] Express.js  
- [x] PostgreSQL  
- [x] Prisma ORM  
- [x] TypeScript  
- [x] JWT Authentication  
- [x] Jest + Supertest  

---

## 💻 Requirements to install code
Before starting, check the following requirements:
* Node.js (16+)
* Git
* Docker and Docker Compose
* Visual Studio Code (recommended IDE)
* PostgreSQL (if not using Docker)

---

## 🚀 Installing app code

If you have SSH configured, run:
```bash
git clone git@github.com:renanzitoo/library-system-api
```

If you don’t have SSH configured, run:
```bash
git clone https://github.com/renanzitoo/library-system-api
```

After installing, open the project folder and run:
```bash
npm install
```

### Configure environment variables
Create a `.env` file in the project root:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/library"
JWT_SECRET="your_secret_key"
```

### Run database with Docker
```bash
docker compose up -d
```

### Run migrations
```bash
npx prisma migrate dev
```

### Start development server
```bash
npm run dev
```

The server will be available at: [http://localhost:3000](http://localhost:3000)

---

## 📌 API Endpoints

### Authentication
- `POST /auth/register` → Register a new user  
- `POST /auth/login` → Authenticate user  

### Books
- `GET /books` → List all books (requires authentication)  
- `GET /books/search?q=term` → Search books (requires authentication)  
- `POST /books` → Create new book (admin only)  
- `PUT /books/:id` → Update book (admin only)  
- `DELETE /books/:id` → Delete book (admin only)  

### Rentals
- `POST /rentals/rent` → Rent a book (requires authentication)  
- `POST /rentals/return` → Return a book (requires authentication)  
- `GET /rentals/my` → Get rentals for logged-in user  

---

## 🧪 Testing

Run tests with:
```bash
npm test
```

Other commands:
```bash
npm run test:unit        # Run unit tests
npm run test:integration # Run integration tests
npm run test:coverage    # Run tests with coverage
```

---

## 📫 Contributing
1. Fork this repository  
2. Create a new branch: `git checkout -b <branch_name>`  
3. Make your changes and commit: `git commit -m '<commit_message>'`  
4. Push to branch: `git push origin <branch_name>`  
5. Create a pull request  

See GitHub docs on [how to create a pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

---

## 🤝 By

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/renanzitoo">
        <img src="https://avatars.githubusercontent.com/u/91814882?v=4" width="100px;"/><br>
        <sub>
          <b>Renan Costa</b>
        </sub>
      </a>
    </td>
  </tr>
</table>