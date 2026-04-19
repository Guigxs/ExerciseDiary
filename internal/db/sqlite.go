package db

import (
	"sync"

	"github.com/jmoiron/sqlx"

	// Import module for SQLite DB
	_ "modernc.org/sqlite"

	"github.com/aceberg/ExerciseDiary/internal/check"
	"github.com/aceberg/ExerciseDiary/internal/models"
)

var mu sync.Mutex

var dbConns = map[string]*sqlx.DB{}

func getDB(path string) *sqlx.DB {
	if conn, ok := dbConns[path]; ok {
		return conn
	}
	conn, err := sqlx.Connect("sqlite", path)
	check.IfError(err)
	dbConns[path] = conn
	return conn
}

func exec(path string, sqlStatement string, args ...interface{}) {
	mu.Lock()
	defer mu.Unlock()
	dbx := getDB(path)
	_, err := dbx.Exec(sqlStatement, args...)
	check.IfError(err)
}

// SelectEx - select all exercises from DB
func SelectEx(path string) (exes []models.Exercise) {
	mu.Lock()
	defer mu.Unlock()
	dbx := getDB(path)
	err := dbx.Select(&exes, "SELECT * FROM exercises ORDER BY ID ASC")
	check.IfError(err)
	return exes
}

// SelectSet - select all sets from DB
func SelectSet(path string) (sets []models.Set) {
	mu.Lock()
	defer mu.Unlock()
	dbx := getDB(path)
	err := dbx.Select(&sets, "SELECT * FROM sets ORDER BY ID ASC")
	check.IfError(err)
	return sets
}

// SelectW - select all weight from DB
func SelectW(path string) (w []models.BodyWeight) {
	mu.Lock()
	defer mu.Unlock()
	dbx := getDB(path)
	err := dbx.Select(&w, "SELECT * FROM weight ORDER BY ID ASC")
	check.IfError(err)
	return w
}

// SelectGroups - select all groups from DB
func SelectGroups(path string) (groups []models.ExGroup) {
	mu.Lock()
	defer mu.Unlock()
	dbx := getDB(path)
	err := dbx.Select(&groups, "SELECT * FROM groups ORDER BY NAME ASC")
	check.IfError(err)
	return groups
}

// CountExInGroup - count exercises belonging to a group
func CountExInGroup(path, group string) int {
	mu.Lock()
	defer mu.Unlock()
	dbx := getDB(path)
	var count int
	err := dbx.Get(&count, `SELECT COUNT(*) FROM exercises WHERE GR = ?`, group)
	check.IfError(err)
	return count
}
