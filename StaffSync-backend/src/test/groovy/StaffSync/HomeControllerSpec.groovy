package StaffSync

import grails.testing.web.controllers.ControllerUnitTest
import spock.lang.Specification

class DepartmentControllerSpec extends Specification implements ControllerUnitTest<DepartmentController> {

    def setup() {
    }

    def cleanup() {
    }

    void "test controller instance exists"() {
        expect:
            controller != null
    }
}
