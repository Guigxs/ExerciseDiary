package auth

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Auth - main auth func
func Auth(conf *Conf) gin.HandlerFunc {
	return func(c *gin.Context) {

		if !conf.Auth || conf.User == "" || conf.Password == "" {
			c.Next()
			return
		}

		sessionToken := getTokenFromCookie(c)

		sessionMu.RLock()
		userSession, exists := allSessions[sessionToken]
		sessionMu.RUnlock()

		if !exists {
			c.Redirect(http.StatusFound, "/login/")
			return
		}
		if userSession.Before(time.Now()) {
			sessionMu.Lock()
			delete(allSessions, sessionToken)
			sessionMu.Unlock()
			c.Redirect(http.StatusFound, "/login/")
			return
		}

		sessionMu.Lock()
		allSessions[sessionToken] = time.Now().Add(conf.Expire)
		sessionMu.Unlock()

		c.Next()
	}
}
