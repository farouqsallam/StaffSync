package StaffSync

import grails.plugin.springsecurity.annotation.Secured
import grails.rest.RestfulController

@Secured(['ROLE_ADMIN'])
class UserController extends RestfulController<User> {
    static responseFormats = ['json']

    UserController() {
        super(User)
    }
    @Override
    def index(Integer max) {
        // Handle pagination defaults
        params.max = Math.min(max ?: 10, 100)

        if (params.departmentId) {
            // Efficiently query users by department ID using a GORM Where query
            def usersList = User.where {
                department.id == params.departmentId.toLong()
            }.list(params)

            respond usersList
        } else {
            // Fall back to the default RestfulController behavior (return all)
            super.index(max)
        }
    }
}