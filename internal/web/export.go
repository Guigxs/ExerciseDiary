package web

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/aceberg/ExerciseDiary/internal/db"
	"github.com/aceberg/ExerciseDiary/internal/models"
)

type exportData struct {
	Exercises []models.Exercise `json:"exercises"`
	Sets      []models.Set      `json:"sets"`
}

func exportHandler(c *gin.Context) {
	name := c.Query("name")

	exercises := db.SelectEx(appConfig.DBPath)
	sets := db.SelectSet(appConfig.DBPath)

	if name != "" {
		var filteredEx []models.Exercise
		for _, ex := range exercises {
			if ex.Name == name {
				filteredEx = append(filteredEx, ex)
			}
		}
		var filteredSets []models.Set
		for _, s := range sets {
			if s.Name == name {
				filteredSets = append(filteredSets, s)
			}
		}
		exercises = filteredEx
		sets = filteredSets
	}

	data := exportData{Exercises: exercises, Sets: sets}

	filename := "exercise-diary-all.json"
	if name != "" {
		safe := strings.NewReplacer("/", "-", "\\", "-", " ", "_").Replace(name)
		filename = "exercise-diary-" + safe + ".json"
	}

	c.Header("Content-Disposition", `attachment; filename="`+filename+`"`)
	c.Header("Content-Type", "application/json")
	c.JSON(http.StatusOK, data)
}

func importHandler(c *gin.Context) {
	file, err := c.FormFile("importfile")
	if err != nil {
		c.String(http.StatusBadRequest, "No file uploaded: "+err.Error())
		return
	}

	f, err := file.Open()
	if err != nil {
		c.String(http.StatusInternalServerError, "Could not open file: "+err.Error())
		return
	}
	defer f.Close()

	var data exportData
	if err := json.NewDecoder(f).Decode(&data); err != nil {
		c.String(http.StatusBadRequest, "Invalid JSON: "+err.Error())
		return
	}

	for _, ex := range data.Exercises {
		db.InsertEx(appConfig.DBPath, ex)
	}
	for _, s := range data.Sets {
		db.InsertSet(appConfig.DBPath, s)
	}

	c.Redirect(http.StatusFound, "/stats/")
}
