package StaffSync

class UrlMappings {
    static mappings = {
        "/tasks"(resources: 'task')
        "/departments"(resources: 'department')
        "/users"(resources: 'user')

        "/"(view: '/index')
        "500"(view: '/error')
        "404"(view: '/404')
    }
}
