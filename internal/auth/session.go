package auth

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/google/uuid"
)

// StartSession for new login
func StartSession(c *gin.Context, conf *Conf) {

	sessionToken := uuid.NewString()

	sessionMu.Lock()
	allSessions[sessionToken] = time.Now().Add(conf.Expire)
	sessionMu.Unlock()

	setTokenCookie(c, sessionToken)

	c.Redirect(http.StatusFound, "/")
}

// LogOut - log out
func LogOut(c *gin.Context) {

	sessionToken := getTokenFromCookie(c)

	sessionMu.Lock()
	delete(allSessions, sessionToken)
	sessionMu.Unlock()

	setTokenCookie(c, "")

	c.Redirect(http.StatusFound, "/")
}
