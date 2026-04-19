package auth

import (
	"sync"
	"time"
)

// Conf - auth config
type Conf struct {
	Auth     bool
	User     string
	Password string
	ExpStr   string
	Expire   time.Duration
}

var sessionMu sync.RWMutex
var allSessions = map[string]time.Time{}

var cookieName = "exercisediary_session_token"
