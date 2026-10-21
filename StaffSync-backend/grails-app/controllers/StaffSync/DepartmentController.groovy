package StaffSync

import grails.plugin.springsecurity.annotation.Secured
import grails.rest.RestfulController

@Secured(['ROLE_ADMIN'])
class DepartmentController extends RestfulController<Department> {
    static responseFormats = ['json']

    DepartmentController() {
        super(Department)
    }
}
