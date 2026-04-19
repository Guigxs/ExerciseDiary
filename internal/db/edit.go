package db

import (
	"github.com/aceberg/ExerciseDiary/internal/models"
)

// Create - create table if not exists
func Create(path string) {

	sqlStatement := `CREATE TABLE IF NOT EXISTS exercises (
		"ID"		INTEGER PRIMARY KEY,
		"GR"		TEXT,
		"PLACE"		TEXT,
		"NAME"		TEXT,
		"DESCR"		TEXT,
		"IMAGE"		TEXT,
		"COLOR"		TEXT,
		"WEIGHT"	INTEGER,
		"REPS"		INTEGER,
		"SETS"		INTEGER DEFAULT 3
	);`
	exec(path, sqlStatement)
	// Migrate: add SETS column if it doesn't exist yet (for existing DBs)
	exec(path, `ALTER TABLE exercises ADD COLUMN "SETS" INTEGER DEFAULT 3;`)

	sqlStatement = `CREATE TABLE IF NOT EXISTS sets (
		"ID"		INTEGER PRIMARY KEY,
		"DATE"		TEXT,
		"NAME"		TEXT,
		"COLOR"		TEXT,
		"WEIGHT"	INTEGER,
		"REPS"		INTEGER
	);`
	exec(path, sqlStatement)

	sqlStatement = `CREATE TABLE IF NOT EXISTS weight (
		"ID"		INTEGER PRIMARY KEY,
		"DATE"		TEXT,
		"WEIGHT"    INTEGER
	);`
	exec(path, sqlStatement)

	sqlStatement = `CREATE TABLE IF NOT EXISTS groups (
		"ID"	 INTEGER PRIMARY KEY,
		"NAME"	 TEXT UNIQUE NOT NULL
	);`
	exec(path, sqlStatement)

	// Migrate existing group names from exercises
	exec(path, `INSERT OR IGNORE INTO groups (NAME) SELECT DISTINCT GR FROM exercises WHERE GR != '';`)
}

// InsertEx - insert one exercise into DB
func InsertEx(path string, ex models.Exercise) {
	sqlStatement := `INSERT INTO exercises (GR, PLACE, NAME, DESCR, IMAGE, COLOR, WEIGHT, REPS, SETS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
	exec(path, sqlStatement, ex.Group, ex.Place, ex.Name, ex.Descr, ex.Image, ex.Color, ex.Weight, ex.Reps, ex.Sets)
}

// InsertSet - insert one set into DB
func InsertSet(path string, ex models.Set) {
	sqlStatement := `INSERT INTO sets (DATE, NAME, COLOR, WEIGHT, REPS) VALUES (?, ?, ?, ?, ?);`
	exec(path, sqlStatement, ex.Date, ex.Name, ex.Color, ex.Weight, ex.Reps)
}

// InsertW - insert weight
func InsertW(path string, ex models.BodyWeight) {
	sqlStatement := `INSERT INTO weight (DATE, WEIGHT) VALUES (?, ?);`
	exec(path, sqlStatement, ex.Date, ex.Weight)
}

// DeleteEx - delete one exercise
func DeleteEx(path string, id int) {
	exec(path, `DELETE FROM exercises WHERE ID = ?;`, id)
}

// DeleteSet - delete one set
func DeleteSet(path string, id int) {
	exec(path, `DELETE FROM sets WHERE ID = ?;`, id)
}

// DeleteW - delete weight
func DeleteW(path string, id int) {
	exec(path, `DELETE FROM weight WHERE ID = ?;`, id)
}

// ClearEx - delete all exercises from table
func ClearEx(path string) {
	sqlStatement := `DELETE FROM exercises;`
	exec(path, sqlStatement)
}

// ClearSet - delete all sets from table
func ClearSet(path string) {
	sqlStatement := `DELETE FROM sets;`
	exec(path, sqlStatement)
}

// InsertGroup - insert a named group
func InsertGroup(path, name string) {
	exec(path, `INSERT OR IGNORE INTO groups (NAME) VALUES (?);`, name)
}

// DeleteGroup - delete a group by ID
func DeleteGroup(path string, id int) {
	exec(path, `DELETE FROM groups WHERE ID = ?;`, id)
}

// ClearW - delete all body weight records
func ClearW(path string) {
	exec(path, `DELETE FROM weight;`)
}

// ClearGroups - delete all groups
func ClearGroups(path string) {
	exec(path, `DELETE FROM groups;`)
}

// UpdateExPlace - update the place (order) of an exercise
func UpdateExPlace(path string, id, place int) {
	exec(path, `UPDATE exercises SET PLACE = ? WHERE ID = ?;`, place, id)
}
