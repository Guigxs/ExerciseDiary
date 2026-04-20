package web

import (
	// "log"
	"net/http"
	"sort"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"

	"github.com/aceberg/ExerciseDiary/internal/db"
	"github.com/aceberg/ExerciseDiary/internal/models"
)

func addWeightHandler(c *gin.Context) {
	var w models.BodyWeight

	w.Date = c.PostForm("date")
	weightStr := c.PostForm("weight")

	w.Weight, _ = decimal.NewFromString(weightStr)

	db.InsertW(appConfig.DBPath, w)

	referer := c.Request.Referer()
	if referer == "" {
		referer = "/"
	}
	c.Redirect(http.StatusFound, referer)
}

func deleteWeightHandler(c *gin.Context) {
	idStr := c.PostForm("id")
	id, _ := strconv.Atoi(idStr)
	db.DeleteW(appConfig.DBPath, id)
	c.Redirect(http.StatusFound, "/weight/")
}

func weightHandler(c *gin.Context) {
	var guiData models.GuiData

	exData.Weight = db.SelectW(appConfig.DBPath)

	guiData.Config = appConfig
	guiData.Version = appVersion
	guiData.ExData = exData

	// Sort weight by Date
	sort.Slice(guiData.ExData.Weight, func(i, j int) bool {
		return guiData.ExData.Weight[i].Date < guiData.ExData.Weight[j].Date
	})

	c.HTML(http.StatusOK, "header.html", guiData)
	c.HTML(http.StatusOK, "weight.html", guiData)
}
