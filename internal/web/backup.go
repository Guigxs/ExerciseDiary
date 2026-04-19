package web

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/aceberg/ExerciseDiary/internal/db"
	"github.com/aceberg/ExerciseDiary/internal/models"
)

type fullBackupData struct {
	Exercises []models.Exercise   `json:"exercises"`
	Sets      []models.Set        `json:"sets"`
	Groups    []models.ExGroup    `json:"groups"`
	Weight    []models.BodyWeight `json:"weight"`
	Config    models.Conf         `json:"config"`
}

func backupHandler(c *gin.Context) {
	var guiData models.GuiData
	guiData.Config = appConfig
	c.HTML(http.StatusOK, "header.html", guiData)
	c.HTML(http.StatusOK, "backup.html", guiData)
}

func backupExportHandler(c *gin.Context) {
	data := fullBackupData{
		Exercises: db.SelectEx(appConfig.DBPath),
		Sets:      db.SelectSet(appConfig.DBPath),
		Groups:    db.SelectGroups(appConfig.DBPath),
		Weight:    db.SelectW(appConfig.DBPath),
		Config:    appConfig,
	}

	c.Header("Content-Disposition", `attachment; filename="exercise-diary-backup.json"`)
	c.Header("Content-Type", "application/json")
	c.JSON(http.StatusOK, data)
}

func backupImportHandler(c *gin.Context) {
	file, err := c.FormFile("backupfile")
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

	var data fullBackupData
	if err := json.NewDecoder(f).Decode(&data); err != nil {
		c.String(http.StatusBadRequest, "Invalid JSON: "+err.Error())
		return
	}

	mode := c.PostForm("mode") // "replace" or "merge"
	if mode == "replace" {
		db.ClearEx(appConfig.DBPath)
		db.ClearSet(appConfig.DBPath)
		db.ClearW(appConfig.DBPath)
		db.ClearGroups(appConfig.DBPath)
	}

	for _, g := range data.Groups {
		db.InsertGroup(appConfig.DBPath, g.Name)
	}
	for _, ex := range data.Exercises {
		db.InsertEx(appConfig.DBPath, ex)
	}
	for _, s := range data.Sets {
		db.InsertSet(appConfig.DBPath, s)
	}
	for _, w := range data.Weight {
		db.InsertW(appConfig.DBPath, w)
	}

	// Refresh in-memory cache
	exData.Exs = db.SelectEx(appConfig.DBPath)
	exData.Sets = db.SelectSet(appConfig.DBPath)
	exData.Weight = db.SelectW(appConfig.DBPath)

	c.Redirect(http.StatusFound, "/backup/?restored=1")
}
