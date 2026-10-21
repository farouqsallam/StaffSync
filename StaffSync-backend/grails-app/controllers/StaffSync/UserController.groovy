package StaffSync

import grails.plugin.springsecurity.annotation.Secured
import grails.rest.RestfulController

@Secured(['ROLE_ADMIN'])
class UserController extends RestfulController<User> {
    static responseFormats = ['json']

    UserController() {
        super(User)
    }
}