package StaffSync
import grails.util.Holders
import groovy.transform.EqualsAndHashCode
import groovy.transform.ToString

@EqualsAndHashCode(includes = 'username')
@ToString(includes = 'username', includeNames = true, includePackage = false)
class User implements Serializable {

    private static final long serialVersionUID = 1L

    transient springSecurityService // Injects the security service

    String username
    String password
    String fullName
    String email
    String jobTitle

    boolean enabled = true
    boolean accountExpired = false
    boolean accountLocked = false
    boolean passwordExpired = false

    Department department

    static belongsTo = [department: Department]
    static hasMany = [tasks: Task]

    Set<Role> getAuthorities() {
        (UserRole.findAllByUser(this) as List<UserRole>)*.role as Set<Role>
    }

    // Automatically hash the password before saving to PostgreSQL
    def beforeInsert() {
        encodePassword()
    }

    def beforeUpdate() {
        if (isDirty('password')) {
            encodePassword()
        }
    }

    protected void encodePassword() {
        def secService = springSecurityService ?: Holders.applicationContext.getBean('springSecurityService')
        password = secService?.passwordEncoder ? secService.encodePassword(password) : password
    }

    static constraints = {
        username blank: false, unique: true, maxSize: 50
        password blank: false, password: true
        fullName blank: false, maxSize: 100
        email blank: false, email: true, unique: true
        jobTitle nullable: true, maxSize: 100
        department nullable: true
    }

    static mapping = {
        table 'app_users'
        password column: '`password`'
    }
}