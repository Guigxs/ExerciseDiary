package models

import (
	"github.com/shopspring/decimal"

	"github.com/aceberg/ExerciseDiary/internal/auth"
)

// Conf - web gui config
type Conf struct {
	Host       string
	Port       string
	Theme      string
	Color      string
	Icon       string
	DBPath     string
	DirPath    string
	ConfPath   string
	NodePath   string
	HeatColor  string
	DateFormat string
	PageStep   int
	Auth       bool
}

// Exercise - one exercise
type Exercise struct {
	ID     int             `db:"ID"`
	Group  string          `db:"GR"`
	Place  string          `db:"PLACE"`
	Name   string          `db:"NAME"`
	Descr  string          `db:"DESCR"`
	Image  string          `db:"IMAGE"`
	Color  string          `db:"COLOR"`
	Weight decimal.Decimal `db:"WEIGHT"`
	Reps   int             `db:"REPS"`
	Sets   int             `db:"SETS"`
}

// Set - one set
type Set struct {
	ID     int             `db:"ID"`
	Date   string          `db:"DATE"`
	Name   string          `db:"NAME"`
	Color  string          `db:"COLOR"`
	Weight decimal.Decimal `db:"WEIGHT"`
	Reps   int             `db:"REPS"`
}

// AllExData - all sets and exercises
type AllExData struct {
	Exs    []Exercise
	Sets   []Set
	Weight []BodyWeight
}

// HeatMapData - data for HeatMap
type HeatMapData struct {
	X string
	Y string
	D string
	V int
}

// BodyWeight - store weight
type BodyWeight struct {
	ID     int             `db:"ID"`
	Date   string          `db:"DATE"`
	Weight decimal.Decimal `db:"WEIGHT"`
}

// ExGroup - a named exercise group
type ExGroup struct {
	ID   int    `db:"ID"`
	Name string `db:"NAME"`
}

// GuiData - web gui data
type GuiData struct {
	Config   Conf
	Themes   []string
	ExData   AllExData
	GroupMap map[string]string
	OneEx    Exercise
	HeatMap  []HeatMapData
	Version  string
	Auth     auth.Conf
	Groups   []ExGroup
}
