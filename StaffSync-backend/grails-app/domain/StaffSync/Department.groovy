package StaffSync

class Department {
    String name
    String code

    static hasMany = [users: User]

    static constraints = {
        name blank: false, unique: true, maxSize: 100
        code blank: false, unique: true, maxSize: 10
    }

    static mapping = {
        table 'departments'
        sort 'name'
    }
}
