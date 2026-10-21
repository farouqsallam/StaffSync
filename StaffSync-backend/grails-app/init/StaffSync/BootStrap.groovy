package StaffSync

import java.time.LocalDate

class BootStrap {

    def init = { servletContext ->
        // Wrap everything in a transaction
        User.withTransaction { status ->

            // 1. Seed Roles
            Role adminRole = Role.findByAuthority('ROLE_ADMIN') ?: new Role(authority: 'ROLE_ADMIN').save(flush: true)
            Role employeeRole = Role.findByAuthority('ROLE_EMPLOYEE') ?: new Role(authority: 'ROLE_EMPLOYEE').save(flush: true)

            // 2. Seed Departments
            Department engineering = Department.findByCode('ENG') ?: new Department(
                    name: 'Engineering',
                    code: 'ENG'
            ).save(flush: true)

            Department hr = Department.findByCode('HR') ?: new Department(
                    name: 'Human Resources',
                    code: 'HR'
            ).save(flush: true)

            // 3. Seed an Initial Admin User
            User adminUser = User.findByUsername('admin')
            if (!adminUser) {
                adminUser = new User(
                        username: 'admin',
                        password: 'password123',
                        fullName: 'System Administrator',
                        email: 'admin@staffsync.com',
                        jobTitle: 'Lead DevOps & Admin',
                        enabled: true,
                        department: engineering
                ).save(flush: true, failOnError: true)

                UserRole.create(adminUser, adminRole, true)
            }

            // 4. Seed a Sample Employee User
            User employeeUser = User.findByUsername('john_doe')
            if (!employeeUser) {
                employeeUser = new User(
                        username: 'john_doe',
                        password: 'password123',
                        fullName: 'John Doe',
                        email: 'john@staffsync.com',
                        jobTitle: 'Frontend Engineer',
                        enabled: true,
                        department: engineering
                ).save(flush: true, failOnError: true)

                UserRole.create(employeeUser, employeeRole, true)
            }

            // 5. Seed Sample Tasks
            if (Task.count() == 0) {
                new Task(
                        title: 'Set up Vite with PrimeVue',
                        description: 'Initialize Vue project and install UI components.',
                        status: 'COMPLETED',
                        priority: 'HIGH',
                        dueDate: LocalDate.now().minusDays(1),
                        assignedTo: employeeUser
                ).save(flush: true)

                new Task(
                        title: 'Build Authentication Views',
                        description: 'Implement Vee-Validate login forms.',
                        status: 'IN_PROGRESS',
                        priority: 'HIGH',
                        dueDate: LocalDate.now().plusDays(2),
                        assignedTo: employeeUser
                ).save(flush: true)

                new Task(
                        title: 'Design Dashboard Analytics',
                        description: 'Gather metrics for department headcounts and task completion rates.',
                        status: 'TODO',
                        priority: 'MEDIUM',
                        dueDate: LocalDate.now().plusDays(5),
                        assignedTo: adminUser
                ).save(flush: true)
            }

            println "=== StaffSync Database Seeding Completed Successfully ==="
        }
    }

    def destroy = {
    }

}