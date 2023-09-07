package com.knetminer.datasource.configs;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.neo4j.driver.AuthToken;
import org.neo4j.driver.AuthTokens;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "neo4j")
public class Neo4jDriverProperties {

    private String uri;
    private Authentication authentication;

    private static final Logger logger = LogManager.getLogger(Neo4jDriverProperties.class);

    public String getUri() {
        return uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public Authentication getAuthentication() {
        return authentication;
    }

    public void setAuthentication(Authentication authentication) {
        this.authentication = authentication;
    }

    public static class Authentication {

        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public AuthToken asAuthToken() {
            logger.info("Authentication token's username is " + username + ", password is " + password + ".");
            return AuthTokens.basic(username, password);
        }
    }
}
