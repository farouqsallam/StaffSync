package StaffSync

import java.time.LocalDate

class Task {
    String title
    String description
    String status      // 'TODO', 'IN_PROGRESS', 'COMPLETED'
    String priority    // 'LOW', 'MEDIUM', 'HIGH'
    LocalDate dueDate


    User assignedTo

    static belongsTo = [assignedTo: User]

    static constraints = {
        title blank: false, maxSize: 150
        description nullable: true, maxSize: 1000
        status inList: ['TODO', 'IN_PROGRESS', 'COMPLETED']
        priority inList: ['LOW', 'MEDIUM', 'HIGH']
        dueDate nullable: true
        assignedTo nullable: false
    }

    static mapping = {
        table 'tasks'
        description type: 'text'
        sort dueDate: 'asc'
    }
}
