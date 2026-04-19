package web

import (
	"fmt"
	"net/http"
	"sort"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/aceberg/ExerciseDiary/internal/db"
	"github.com/aceberg/ExerciseDiary/internal/models"
)

func indexHandler(c *gin.Context) {
	var guiData models.GuiData

	exData.Exs = db.SelectEx(appConfig.DBPath)
	exData.Sets = db.SelectSet(appConfig.DBPath)
	exData.Weight = db.SelectW(appConfig.DBPath)

	guiData.Config = appConfig
	guiData.ExData = exData
	guiData.GroupMap = createGroupMap()
	guiData.HeatMap = generateHeatMap()

	// Sort exercises by Place (numeric)
	sort.Slice(guiData.ExData.Exs, func(i, j int) bool {
		pi, _ := strconv.Atoi(guiData.ExData.Exs[i].Place)
		pj, _ := strconv.Atoi(guiData.ExData.Exs[j].Place)
		return pi < pj
	})

	// Sort weight by Date
	sort.Slice(guiData.ExData.Weight, func(i, j int) bool {
		return guiData.ExData.Weight[i].Date < guiData.ExData.Weight[j].Date
	})

	c.HTML(http.StatusOK, "header.html", guiData)
	c.HTML(http.StatusOK, "index.html", guiData)
}

func createGroupMap() map[string]string {
	i := 0
	grMap := make(map[string]string)

	for _, ex := range exData.Exs {

		_, ok := grMap[ex.Group]
		if !ok {
			grMap[ex.Group] = "grID" + fmt.Sprintf("%d", i)
			i = i + 1
		}
	}
	return grMap
}
