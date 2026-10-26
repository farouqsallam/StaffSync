package StaffSync


import grails.plugin.springsecurity.rest.token.rendering.AccessTokenJsonRenderer
import grails.plugin.springsecurity.rest.token.AccessToken
import groovy.json.JsonBuilder

class CustomLoginResponseRenderer implements AccessTokenJsonRenderer {

    @Override
    String generateJson(AccessToken accessToken) {
        def principal = accessToken.principal

        // Safely extract the database ID from the authenticated user principal
        def databaseId = principal?.hasProperty('id') ? principal.id : null

        // Build the exact JSON map you want returned to the Vue frontend
        def responseMap = [
                access_token: accessToken.accessToken,
                username    : principal.username,
                userId      : databaseId,
                roles       : accessToken.authorities?.collect { it.authority }
        ]

        // If your app is configured to use refresh tokens, include it safely
        if (accessToken.refreshToken) {
            responseMap.refresh_token = accessToken.refreshToken
        }

        return new JsonBuilder(responseMap).toString()
    }
}
