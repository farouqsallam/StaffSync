import StaffSync.CustomLoginResponseRenderer

// Place your Spring DSL code here
beans = {
    // Override the default Spring Security REST renderer
    accessTokenJsonRenderer(CustomLoginResponseRenderer)
}