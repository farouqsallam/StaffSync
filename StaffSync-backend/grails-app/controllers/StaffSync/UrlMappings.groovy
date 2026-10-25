package StaffSync

class UrlMappings {
    static mappings = {
        "/departments/$departmentId/users"(controller: 'user', action: 'index', method: 'GET')
        "/users/$userId/tasks"(controller: 'task', action: 'index', method: 'GET')
        "/tasks"(resources: 'task')
        "/departments"(resources: 'department')
        "/users"(resources: 'user')

        "/"(view: '/index')
        "500"(view: '/error')
        "404"(view: '/404')
    }
}
