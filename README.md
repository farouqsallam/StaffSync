
# StaffSync

StaffSync is a full-stack, role-based employee management platform designed to streamline administrative oversight and employee task tracking. The system provides separate, secure experiences for Administrators and Employees, featuring interactive data visualization and robust data validation.

## Tech Stack

**Frontend:**
* Vue 3 (Composition API) powered by Vite
* PrimeVue & Tailwind CSS for UI components and styling
* Pinia for global state management (Authentication & User Data)
* Vue Router for protected route navigation
* Vee-Validate for frontend schema-based form validation
* Chart.js (via PrimeVue) for dashboard data visualization

**Backend:**
* Grails 7.2.4 (REST API Profile)
* Groovy 
* PostgreSQL for relational data storage
* Spring Security REST for JWT-based authentication

## Core Functionality

### Role-Based Access Control (RBAC)
* **Authentication:** Secure login system utilizing JSON Web Tokens (JWT).
* **Route Protection:** Frontend routing and backend endpoints are strictly isolated based on user roles.

### Admin Experience
* **Global Dashboard:** Visual analytics and charts displaying aggregated company metrics (e.g., employee headcounts, task completion rates).
* **Staff Management:** Full CRUD (Create, Read, Update, Delete) capabilities for employee records. 
* **Role Assignment:** Ability to promote employees to administrative roles or restrict access.
* **Data Tables:** Advanced data tables featuring sorting, pagination, and filtering for large employee datasets.

### Employee Experience
* **Personal Dashboard:** A focused view displaying the employee's specific profile, assigned tasks, and daily metrics.
* **Profile Management:** Secure environment for employees to view and update their own authorized personal information.
* **Task/Attendance Tracking:** Interfaces dedicated to managing individual workflow and reporting.

## Architecture Highlights
* **Separation of Concerns:** Completely decoupled frontend and backend communicating exclusively via RESTful JSON endpoints.
* **Responsive Design:** Mobile-first, fully responsive user interface utilizing Tailwind CSS utility classes alongside PrimeVue components.
* **Form Integrity:** Comprehensive data validation handled on both the client side (Vee-Validate) and server side (Grails domain constraints) to ensure database integrity.
