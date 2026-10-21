package StaffSync

import grails.plugin.springsecurity.annotation.Secured
import grails.rest.RestfulController

@Secured(['ROLE_ADMIN', 'ROLE_EMPLOYEE'])
class TaskController extends RestfulController<Task> {
    static responseFormats = ['json']

    TaskController() {
        super(Task)
    }
}