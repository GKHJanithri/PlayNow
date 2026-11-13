# 🏆 PlayNow – Sports Management System

A web-based Sports Management System designed to simplify sports equipment management and reservation processes. The system provides administrators with tools to manage sports items and allows students to view available equipment and make reservations.

## 📌 Project Overview

PlayNow is an academic group project developed to improve the management of sports facilities and equipment within an organization. It provides a centralized platform for managing equipment availability, student reservations, and item returns.

## ✨ Key Features

### Admin Module
- Add, update, view, and delete sports equipment.
- Manage equipment details, including names, descriptions, images, and quantities.
- Monitor available and reserved item quantities.
- Manage equipment reservations and returns.

### Student Module
- View available sports equipment.
- Browse equipment details.
- Reserve available sports items.
- Track reservation statuses.

### Reservation Management
- Manage equipment reservation records.
- Track reservation statuses: Reserved, Returned, and Late.
- Monitor equipment availability and usage.

## 🛠️ Technologies & Tools

| Category | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| API | REST API |
| Version Control | Git, GitHub |

## 🏗️ System Architecture

PlayNow follows a client-server architecture:

- **Frontend:** React.js provides the user interface and interacts with backend services.
- **Backend:** Node.js and Express.js handle application logic and API requests.
- **Database:** MongoDB stores equipment, reservation, and related application data.

## 🚀 Getting Started

### Prerequisites
- Node.js and npm
- MongoDB
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/GKHJanithri/PlayNow.git
   ```

2. Navigate to the project directory:

   ```bash
   cd PlayNow
   ```

3. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

4. Install backend dependencies:

   ```bash
   cd ../backend
   npm install
   ```

5. Configure the required environment variables for the backend, including your MongoDB connection string.

6. Start the frontend and backend using the development scripts defined in their respective `package.json` files.

## 👥 Project Type

Academic Group Project

Developed collaboratively as part of university coursework, involving frontend development, backend implementation, database management, and version control.

## 🎯 Learning Outcomes

- Practical experience in full-stack web application development.
- Understanding client-server architecture and REST API integration.
- Experience with database operations and CRUD functionality.
- Team collaboration and Git-based version control.
- Understanding software development workflows and project coordination.

## 📂 Repository Structure

```text
PlayNow/
│
├── backend/
│   └── Backend application
│
├── frontend/
│   └── React frontend application
│
└── README.md
```
