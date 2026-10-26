package StaffSync

import grails.testing.gorm.DataTest
import grails.testing.web.controllers.ControllerUnitTest
import spock.lang.Specification
import static org.springframework.http.HttpStatus.*

class DummySecurityService {
    def passwordEncoder = [encode: { String pwd -> "encoded_${pwd}" }]
    String encodePassword(String pwd) { "encoded_${pwd}" }
}

class UserControllerSpec extends Specification implements ControllerUnitTest<UserController>, DataTest {

    void setupSpec() {
        mockDomains(User, Role, UserRole, Department, Task)
    }

    def setup() {
        defineBeans {
            springSecurityService(DummySecurityService)
        }
    }

    void "test index returns list of users with role and department info"() {
        given:
        Department dept = new Department(name: 'Engineering', code: 'ENG').save(flush: true)
        Role adminRole = new Role(authority: 'ROLE_ADMIN').save(flush: true)
        User user = new User(
            username: 'admin',
            password: 'password123',
            fullName: 'Admin User',
            email: 'admin@staffsync.com',
            jobTitle: 'Administrator',
            department: dept
        ).save(flush: true)
        UserRole.create(user, adminRole, true)

        when:
        controller.index()

        then:
        response.status == OK.value()
        def json = response.json
        json.size() == 1
        json[0].username == 'admin'
        json[0].fullName == 'Admin User'
        json[0].role == 'ROLE_ADMIN'
        json[0].systemRole == 'ROLE_ADMIN'
        json[0].department.id == dept.id
        json[0].password == null
    }

    void "test index filters by departmentId"() {
        given:
        Department eng = new Department(name: 'Engineering', code: 'ENG').save(flush: true)
        Department hr = new Department(name: 'Human Resources', code: 'HR').save(flush: true)
        Role empRole = new Role(authority: 'ROLE_EMPLOYEE').save(flush: true)

        User user1 = new User(username: 'u1', password: 'pw', fullName: 'U1', email: 'u1@s.com', department: eng).save(flush: true)
        User user2 = new User(username: 'u2', password: 'pw', fullName: 'U2', email: 'u2@s.com', department: hr).save(flush: true)
        UserRole.create(user1, empRole, true)
        UserRole.create(user2, empRole, true)

        when:
        params.departmentId = eng.id.toString()
        controller.index()

        then:
        response.status == OK.value()
        def json = response.json
        json.size() == 1
        json[0].username == 'u1'
    }

    void "test save creates user with role and department"() {
        given:
        Department dept = new Department(name: 'Engineering', code: 'ENG').save(flush: true)
        new Role(authority: 'ROLE_ADMIN').save(flush: true)

        request.method = 'POST'
        request.json = [
            username: 'newadmin',
            password: 'secretpassword',
            fullName: 'New Admin',
            email: 'newadmin@staffsync.com',
            jobTitle: 'Admin Lead',
            enabled: true,
            department: [id: dept.id],
            role: 'ROLE_ADMIN'
        ]

        when:
        controller.save()

        then:
        response.status == CREATED.value()
        def json = response.json
        json.username == 'newadmin'
        json.role == 'ROLE_ADMIN'
        json.department.id == dept.id
        json.password == null

        User created = User.findByUsername('newadmin')
        created != null
        created.department == dept
        UserRole.exists(created.id, Role.findByAuthority('ROLE_ADMIN').id)
    }

    void "test update modifies user and role without breaking on removeAll"() {
        given:
        Department dept = new Department(name: 'Engineering', code: 'ENG').save(flush: true)
        Role empRole = new Role(authority: 'ROLE_EMPLOYEE').save(flush: true)
        Role adminRole = new Role(authority: 'ROLE_ADMIN').save(flush: true)

        User user = new User(
            username: 'jane',
            password: 'pw',
            fullName: 'Jane Doe',
            email: 'jane@staffsync.com',
            jobTitle: 'Developer',
            department: dept
        ).save(flush: true)
        UserRole.create(user, empRole, true)

        request.method = 'PUT'
        params.id = user.id
        request.json = [
            fullName: 'Jane Updated',
            email: 'jane@staffsync.com',
            jobTitle: 'Engineering Manager',
            role: 'ROLE_ADMIN'
        ]

        when:
        controller.update()

        then:
        response.status == OK.value()
        def json = response.json
        json.fullName == 'Jane Updated'
        json.jobTitle == 'Engineering Manager'
        json.role == 'ROLE_ADMIN'

        UserRole.exists(user.id, adminRole.id)
        !UserRole.exists(user.id, empRole.id)
    }

    void "test delete cleans up UserRole and deletes user"() {
        given:
        Role empRole = new Role(authority: 'ROLE_EMPLOYEE').save(flush: true)
        User user = new User(
            username: 'deleteme',
            password: 'pw',
            fullName: 'Delete Me',
            email: 'delete@staffsync.com'
        ).save(flush: true)
        UserRole.create(user, empRole, true)

        request.method = 'DELETE'
        params.id = user.id

        when:
        controller.delete()

        then:
        response.status == NO_CONTENT.value()
        User.get(user.id) == null
        UserRole.where { user == user }.count() == 0
    }
}
