<p align="center">
  <img src="assets/banner.png" alt="Student Management System Banner" width="100%" />
</p>

<h1 align="center">🎓 EduManage — Student Management System</h1>

<p align="center">
  <strong>A modern, full-stack enterprise campus management portal engineered with Spring Boot, Next.js, and PostgreSQL.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-3.4+-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

---

## 📌 Overview

**EduManage** is a modern, enterprise-grade Student Management System designed to streamline academic operations across administrators, educators, and students. Featuring a decoupled architecture, the platform pairs a robust **Spring Boot (Java 21)** RESTful backend with an interactive **Next.js 16 (React 19)** web interface.

---

## ✨ Key Features

### 🛡️ Role-Based Access Control (RBAC)
* **JWT Authentication**: Stateless, token-based authentication with BCrypt password hashing.
* **Granular Permissions**: Method-level security (`@PreAuthorize`) enforcing distinct privileges across **ADMIN**, **TEACHER**, and **STUDENT** roles.

---

### 👨‍💼 Administrator Portal
* **Live Analytics Dashboard**: Real-time KPI cards displaying total active students, pending registrations, faculty headcounts, and total courses.
* **Student Approval Workflow**: Review new student registration requests; approve or reject with automatic status updates.
* **Teacher Management**: Onboard faculty accounts with automated profile creation and safe deletion (automatic course disassociation and credential cleanup).
* **Course Catalog Control**: Create, update, assign instructors to courses, and remove course offerings.

---

### 👩‍🏫 Teacher Portal
* **My Assigned Courses**: View active courses taught, credit counts, and real-time student enrollment rosters.
* **Student Directory**: Inspect student information for classes taught by the instructor.
* **Faculty Profile**: Manage personal contact details, department affiliation, and security credentials.

---

### 🧑‍🎓 Student Portal
* **Self-Service Registration**: Fast onboarding flow with pending status tracking until administrative review.
* **Course Catalog & Enrollment**: Browse available courses with assigned lecturers, descriptions, and credit ratings. 1-click self-enrollment.
* **My Enrolled Courses**: Track courses you are currently attending.
* **Student Profile**: Manage personal contact details and review registration status.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | [Next.js 16](https://nextjs.org/) (Turbopack, App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/) |
| **UI Components** | [Lucide React](https://lucide.dev/), [React Hot Toast](https://react-hot-toast.com/), [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| **Backend** | [Spring Boot](https://spring.io/projects/spring-boot), [Java 21](https://www.oracle.com/java/), [Spring Security](https://spring.io/projects/spring-security) |
| **Persistence** | [Spring Data JPA](https://spring.io/projects/spring-data-jpa), [Hibernate](https://hibernate.org/), [HikariCP](https://github.com/brettwooldridge/HikariCP) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) / [Supabase](https://supabase.com/) |
| **Security** | [JJWT](https://github.com/jwtk/jjwt) (JSON Web Token), [BCrypt](https://en.wikipedia.org/wiki/Bcrypt) |

---

## 🚀 Getting Started

### Prerequisites
* **Java**: JDK 21 or higher installed (`java -version`)
* **Node.js**: v18.18 or higher (`node -v`)
* **Git**: Installed and configured

---

### 1. Clone the Repository
```bash
git clone https://github.com/IrushaDilshan/student-management-system.git
cd student-management-system
```

---

### 2. Configure & Start the Backend

1. Navigate to the backend directory:
   ```powershell
   cd backend
   ```
2. Check `src/main/resources/application.properties` to ensure your database connection is active:
   ```properties
   server.port=8081
   spring.datasource.url=jdbc:postgresql://<HOST>:<PORT>/<DATABASE>?sslmode=require
   spring.datasource.username=<USERNAME>
   spring.datasource.password=<PASSWORD>
   ```
3. Run the Spring Boot application using the Maven wrapper:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
   *The backend starts at **`http://localhost:8081`** and automatically seeds the default administrator account.*

---

### 3. Configure & Start the Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```powershell
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Access the web application at **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Default Credentials

The system automatically initializes an administrator account on first startup via `DataSeeder`:

| Role | Username | Password | Purpose |
|---|---|---|---|
| **System Admin** | `admin` | `admin123` | System management, approving students, adding teachers & courses |

> 💡 **Tip:** To test Teacher accounts, log in as **Admin**, navigate to **Teachers** (`/admin/teachers`), and create a new faculty account. To test Student accounts, visit the **[Register Page](http://localhost:3000/register)**, create an account, and approve it from the Admin dashboard.

---

## 📡 API Endpoints Overview

### Authentication (`/api/auth`)
* `POST /api/auth/login` — Authenticate and receive JWT token
* `POST /api/auth/student/signup` — Public student registration (sets status to `PENDING`)
* `GET  /api/auth/admin/pending-students` — List pending student approvals *(Admin only)*
* `PUT  /api/auth/admin/approve-student/{id}?status=ACTIVE|REJECTED` — Approve/reject student *(Admin only)*

### Courses (`/api/courses`)
* `GET    /api/courses` — Retrieve all courses
* `POST   /api/courses` — Create new course *(Admin, Teacher)*
* `PUT    /api/courses/{id}` — Update course details *(Admin, Teacher)*
* `DELETE /api/courses/{id}` — Delete course safely *(Admin, Teacher)*
* `PUT    /api/courses/{courseId}/assign-teacher/{teacherId}` — Assign teacher to course *(Admin only)*

### Teachers (`/api/teachers` & `/api/teacher/dashboard`)
* `GET    /api/teachers` — List all faculty profiles *(Admin only)*
* `DELETE /api/teachers/{id}` — Remove teacher account *(Admin only)*
* `GET    /api/teacher/dashboard/courses` — Get courses assigned to current teacher *(Teacher only)*
* `GET    /api/teacher/dashboard/students` — Get enrolled students across teacher's courses *(Teacher only)*
* `GET    /api/teacher/dashboard/profile` — Get teacher profile *(Teacher only)*
* `PUT    /api/teacher/dashboard/profile` — Update teacher profile & password *(Teacher only)*

### Students (`/api/students`)
* `GET    /api/students` — List all active students
* `GET    /api/students/me` — Retrieve logged-in student's profile
* `PUT    /api/students/me` — Update logged-in student's personal details
* `GET    /api/students/my-courses` — List enrolled courses
* `POST   /api/students/enroll/{courseId}` — Enroll in a course

---

## 📁 Project Structure

```text
student-management-system/
├── assets/
│   └── banner.png                # Project hero mockup banner
├── backend/
│   ├── src/main/java/backend/
│   │   ├── config/               # Security, JWT filter, CORS & DataSeeder
│   │   ├── controller/           # REST API Controllers (Auth, Admin, Teacher, Student, Course)
│   │   ├── dto/                  # Request & Response Data Transfer Objects
│   │   ├── exception/            # Global exception handling
│   │   ├── model/                # JPA Entities (User, Teacher, Student, Course)
│   │   ├── repository/           # Spring Data JPA Repositories
│   │   └── service/              # Core business logic services
│   ├── src/main/resources/       # application.properties & SQL resources
│   └── pom.xml                   # Maven dependencies & build configuration
├── frontend/
│   ├── app/
│   │   ├── admin/                # Admin views (Dashboard, Courses, Students, Teachers)
│   │   ├── teacher/              # Teacher views (Dashboard, Courses, Profile, Students)
│   │   ├── student/              # Student views (Dashboard, Courses, Profile)
│   │   ├── login/                # Authentication page
│   │   ├── register/             # Student self-registration page
│   │   └── globals.css           # Tailwind CSS design system
│   ├── components/               # AppLayout, Sidebar, Navigation
│   │   └── ui/                   # CourseCard, ConfirmModal reusable components
│   ├── lib/                      # Axios API client with JWT interceptors
│   └── package.json
└── README.md
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
