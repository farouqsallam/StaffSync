package StaffSync

import grails.plugin.springsecurity.annotation.Secured
import grails.rest.RestfulController

@Secured(['ROLE_ADMIN', 'ROLE_EMPLOYEE'])
class TaskController extends RestfulController<Task> {
    static responseFormats = ['json']

    TaskController() {
        super(Task)
    }

    @Override
    def index(Integer max) {
        // Handle pagination defaults
        params.max = Math.min(max ?: 10, 100)

        if (params.userId) {

            def taskList = Task.where {
                assignedTo.id == params.userId.toLong()
            }.list(params)

            respond taskList
        } else {
            // Fall back to the default RestfulController behavior (return all)
            super.index(max)
        }
    }
}