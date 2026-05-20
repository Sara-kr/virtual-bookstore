\# Virtual Bookstore Platform



A full-stack virtual bookstore application built with \*\*Spring Boot\*\*, \*\*React\*\*, \*\*MySQL\*\*, \*\*Redis\*\*, \*\*JWT Authentication\*\*, and \*\*WebSocket notifications\*\*. The system supports book browsing, user authentication, cart management, order placement, reviews, notifications, and an admin dashboard for managing books, users, orders, and analytics.



\---



\## Features



\### User Features

\- User registration and login with JWT authentication

\- Browse books with pagination and sorting

\- Search books by title, author, category, and price range

\- View book details and reviews

\- Add books to cart

\- Update cart quantity and remove items

\- Place orders from cart

\- View order history and order details

\- Add and delete book reviews

\- Receive notifications



\### Admin Features

\- Admin login with role-based access

\- Dashboard analytics

\- Manage users

\- Activate/deactivate user accounts

\- Manage books: create, update, soft delete

\- View and update orders

\- View low-stock books

\- Send broadcast notifications



\### Backend Features

\- REST API with Spring Boot

\- JWT-based authentication and authorization

\- Role-based access control

\- MySQL database with JPA/Hibernate

\- Redis caching

\- WebSocket support

\- Swagger/OpenAPI documentation

\- Centralized exception handling



\---



\## Tech Stack



\### Frontend

\- React 18

\- React Router DOM

\- Axios

\- Tailwind CSS

\- SockJS

\- STOMP WebSocket Client



\### Backend

\- Java 17

\- Spring Boot 3

\- Spring Security

\- Spring Data JPA

\- MySQL

\- Redis

\- JWT

\- WebSocket

\- Swagger / OpenAPI

\- Maven



\---



\## Project Structure



```text

virtual-bookstore/

├── backend/

│   ├── src/

│   ├── pom.xml

│   └── Dockerfile

│

├── frontend/

│   ├── public/

│   ├── src/

│   ├── package.json

│   ├── package-lock.json

│   ├── tailwind.config.js

│   └── Dockerfile

│

├── README.md

└── .gitignore



\## Screenshots



\### Homepage



!\[Homepage](docs/screenshots/homepage.png)



\### Login Page



!\[Login Page](docs/screenshots/loginpage.png)



\### Dashboard



!\[Dashboard](docs/screenshots/dashboard.png)



\### Book Card / Cart View



!\[Book Card](docs/screenshots/card.png)



\## Backend Setup



\### Prerequisites



\- Java 17 or higher

\- Maven

\- MySQL

\- Redis



\### Database Setup



Create a MySQL database:



```sql

CREATE DATABASE virtual\_bookstore;

```



Backend configuration file:



`backend/src/main/resources/application.properties`



Recommended configuration:



```properties

spring.datasource.url=jdbc:mysql://localhost:3306/virtual\_bookstore?createDatabaseIfNotExist=true\&useSSL=false\&serverTimezone=UTC\&allowPublicKeyRetrieval=true

spring.datasource.username=${DB\_USERNAME:root}

spring.datasource.password=${DB\_PASSWORD:}

app.jwt.secret=${JWT\_SECRET:changeThisSecretBeforeProductionChangeThisSecretBeforeProduction}

```



\### Run Backend



```bash

cd backend

mvn spring-boot:run

```



Backend runs on:



```

http://localhost:8080

```



\---



\## Frontend Setup



\### Install Dependencies



```bash

cd frontend

npm install

```



\### Environment Variables



Create a `.env` file inside the frontend folder:



```env

REACT\_APP\_API\_URL=http://localhost:8080

REACT\_APP\_WS\_URL=http://localhost:8080/ws

```



\### Run Frontend



```bash

npm start

```



Frontend runs on:



```

http://localhost:3000

```



\---



\## API Documentation



Swagger UI is available after starting the backend:



```

http://localhost:8080/swagger-ui.html

```



OpenAPI JSON:



```

http://localhost:8080/api-docs

```



Health check:



```

http://localhost:8080/actuator/health

```



\---



\## Authentication



The application uses JWT authentication.



After login, the backend returns:



```json

{

&#x20; "accessToken": "JWT\_ACCESS\_TOKEN",

&#x20; "refreshToken": "JWT\_REFRESH\_TOKEN",

&#x20; "tokenType": "Bearer"

}

```



Use the access token in protected APIs:



```http

Authorization: Bearer JWT\_ACCESS\_TOKEN

```



Use the refresh token only with:



```http

POST /api/auth/refresh?refreshToken=JWT\_REFRESH\_TOKEN

```



\---



\## Default Credentials



The backend seeds default users during startup.



\### Admin



```

Email: admin@bookstore.com

Password: Admin@1234

```



\### Test User



```

Email: user@bookstore.com

Password: User@1234

```



\---



\## Main API Endpoints



\### Authentication



```http

POST /api/auth/register

POST /api/auth/login

POST /api/auth/refresh?refreshToken={refreshToken}

```



\### Books



```http

GET    /api/books

GET    /api/books/{id}

GET    /api/books/search

GET    /api/books/top-rated

GET    /api/books/latest

GET    /api/books/categories

POST   /api/books

PUT    /api/books/{id}

DELETE /api/books/{id}

```



\### Users



```http

GET /api/users/me

PUT /api/users/me

PUT /api/users/me/password

```



\### Cart



```http

GET    /api/cart

POST   /api/cart/add

PUT    /api/cart/items/{itemId}?quantity={quantity}

DELETE /api/cart/items/{itemId}

DELETE /api/cart/clear

```



\### Orders



```http

POST   /api/orders

GET    /api/orders/my-orders

GET    /api/orders/{orderId}

DELETE /api/orders/{orderId}/cancel

GET    /api/orders

PUT    /api/orders/{orderId}/status?status={status}

```



\### Reviews



```http

GET    /api/reviews/book/{bookId}

POST   /api/reviews/book/{bookId}?rating={rating}\&comment={comment}

DELETE /api/reviews/{reviewId}

```



\### Notifications



```http

GET /api/notifications

GET /api/notifications/unread-count

PUT /api/notifications/mark-all-read

PUT /api/notifications/{id}/read

```



\### Admin



```http

GET  /api/admin/analytics

GET  /api/admin/users

PUT  /api/admin/users/{userId}/toggle-status

POST /api/admin/broadcast

GET  /api/admin/low-stock

```



\---



\## Testing Status



The major backend APIs were tested successfully, including:



\- Authentication APIs

\- Book listing and search APIs

\- Cart APIs

\- Order APIs

\- Review APIs

\- Notification APIs

\- Admin dashboard APIs

\- Book management APIs

\- Order status update APIs



\---



\## Known Improvement



Soft-deleted books should be excluded from all public book listing APIs.



\---



\## Future Improvements



\- Payment gateway integration

\- Email notifications

\- Advanced admin analytics

\- Product image upload

\- Wishlist feature

\- Docker Compose setup

\- GitHub Actions CI/CD pipeline

\- Deployment to cloud platform



\---



\## Author



Saravanan



Java Backend Developer



GitHub: https://github.com/Sara-kr

