package StaffSync

import grails.gorm.transactions.ReadOnly
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.annotation.Secured
import grails.rest.RestfulController
import static org.springframework.http.HttpStatus.*

@Secured(['ROLE_ADMIN'])
@ReadOnly
class UserController extends RestfulController<User> {
    static responseFormats = ['json']

    UserController() {
        super(User)
    }

    @Override
    def index(Integer max) {
        // Handle pagination defaults (allow up to 100 items by default for dashboard views)
        params.max = Math.min(max ?: 100, 1000)

        def usersList
        if (params.departmentId && params.departmentId.toString().isLong()) {
            Long deptId = params.departmentId.toLong()
            usersList = User.where {
                department.id == deptId
            }.list(params)
        } else {
            usersList = User.list(params)
        }

        respond usersList.collect { userToMap(it) }
    }

    @Override
    def show() {
        User user = User.get(params.id)
        if (!user) {
            render status: NOT_FOUND
            return
        }

        respond userToMap(user)
    }

    @Override
    @Transactional
    def save() {
        if (!request.JSON) {
            render status: BAD_REQUEST
            return
        }

        // Create a detached copy of the JSON so we can safely manipulate it
        def payload = new HashMap<>(request.JSON as Map)

        // Extract role (default to ROLE_EMPLOYEE if not specified)
        def roleAuthority = payload.remove('role') ?: 'ROLE_EMPLOYEE'
        if (roleAuthority instanceof String && !roleAuthority.startsWith('ROLE_')) {
            roleAuthority = "ROLE_${roleAuthority}"
        }

        // Handle department assignment safely
        Department department = null
        if (payload.containsKey('department')) {
            def deptVal = payload.remove('department')
            if (deptVal instanceof Map && deptVal.id) {
                department = Department.get(deptVal.id as Long)
            } else if (deptVal instanceof Number || (deptVal instanceof String && deptVal.isLong())) {
                department = Department.get(deptVal as Long)
            }
        } else if (payload.containsKey('departmentId') && payload.departmentId) {
            def deptId = payload.remove('departmentId')
            if (deptId instanceof Number || (deptId instanceof String && deptId.isLong())) {
                department = Department.get(deptId as Long)
            }
        }

        // Remove non-persistent / nested helper properties before binding
        payload.remove('id')
        payload.remove('version')
        payload.remove('roles')
        payload.remove('authorities')
        payload.remove('tasks')

        // Default password if omitted
        if (!payload.password || !payload.password.toString().trim()) {
            payload.password = 'password123'
        }

        User user = new User(payload)
        user.department = department

        if (!user.validate()) {
            respond user.errors, [status: UNPROCESSABLE_ENTITY]
            return
        }

        user.save(flush: true)
        if (user.hasErrors()) {
            respond user.errors, [status: UNPROCESSABLE_ENTITY]
            return
        }

        // Safely link the extracted role
        Role role = Role.findByAuthority(roleAuthority as String) ?: new Role(authority: roleAuthority as String).save(flush: true)
        if (role) {
            UserRole.create(user, role, true)
        }

        response.status = CREATED.value()
        respond userToMap(user)
    }

    @Override
    @Transactional
    def update() {
        User user = User.get(params.id)
        if (!user) {
            render status: NOT_FOUND
            return
        }

        if (!request.JSON) {
            render status: BAD_REQUEST
            return
        }

        def payload = new HashMap<>(request.JSON as Map)

        // Extract role
        def roleAuthority = payload.remove('role')
        if (roleAuthority instanceof String && !roleAuthority.startsWith('ROLE_')) {
            roleAuthority = "ROLE_${roleAuthority}"
        }

        // Handle department assignment
        if (payload.containsKey('department')) {
            def deptVal = payload.remove('department')
            if (deptVal instanceof Map && deptVal.id) {
                user.department = Department.get(deptVal.id as Long)
            } else if (deptVal instanceof Number || (deptVal instanceof String && deptVal.isLong())) {
                user.department = Department.get(deptVal as Long)
            } else if (deptVal == null || deptVal == '') {
                user.department = null
            }
        } else if (payload.containsKey('departmentId')) {
            def deptId = payload.remove('departmentId')
            user.department = (deptId && deptId.toString().isLong()) ? Department.get(deptId as Long) : null
        }

        // Handle password: only update if explicitly provided and non-blank
        if (payload.containsKey('password')) {
            def newPassword = payload.remove('password')
            if (newPassword && newPassword.toString().trim()) {
                user.password = newPassword.toString().trim()
            }
        }

        // Remove non-persistent / nested helper properties before binding
        payload.remove('id')
        payload.remove('version')
        payload.remove('roles')
        payload.remove('authorities')
        payload.remove('tasks')

        // Bind the remaining safe fields
        user.properties = payload

        if (!user.validate()) {
            respond user.errors, [status: UNPROCESSABLE_ENTITY]
            return
        }

        user.save(flush: true)
        if (user.hasErrors()) {
            respond user.errors, [status: UNPROCESSABLE_ENTITY]
            return
        }

        // Update the extracted role explicitly if provided
        if (roleAuthority) {
            Role newRole = Role.findByAuthority(roleAuthority as String) ?: new Role(authority: roleAuthority as String).save(flush: true)
            if (newRole && !UserRole.exists(user.id, newRole.id)) {
                UserRole.removeAll(user)
                UserRole.findAllByUser(user).each { it.delete(flush: true) }
                UserRole.create(user, newRole, true)
            }
        }

        response.status = OK.value()
        respond userToMap(user)
    }

    @Override
    @Transactional
    def delete() {
        User user = User.get(params.id)
        if (!user) {
            render status: NOT_FOUND
            return
        }

        // Remove foreign key references in user_roles first to prevent constraint violations
        UserRole.removeAll(user)
        UserRole.findAllByUser(user).each { it.delete(flush: true) }
        user.delete(flush: true)

        render status: NO_CONTENT
    }

    /**
     * Maps User domain model to a clean, safe JSON structure.
     * Protects password hash from being exposed while including role, systemRole, and department metadata.
     */
    protected Map userToMap(User user) {
        if (!user) {
            return null
        }

        def authorities = (user.authorities*.authority?.findAll() ?: []) as List<String>
        def primaryRole = authorities.contains('ROLE_ADMIN') ? 'ROLE_ADMIN' : 'ROLE_EMPLOYEE'

        [
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            jobTitle: user.jobTitle ?: '',
            enabled: user.enabled,
            department: user.department ? [
                id: user.department.id,
                name: user.department.name,
                code: user.department.code
            ] : null,
            role: primaryRole,
            systemRole: primaryRole,
            roles: authorities,
            authorities: authorities.collect { [authority: it] }
        ]
    }
}
