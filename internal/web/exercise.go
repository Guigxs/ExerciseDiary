package web

import (
	"net/http"
	"sort"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"

	"github.com/aceberg/ExerciseDiary/internal/db"
	"github.com/aceberg/ExerciseDiary/internal/models"
)

func exerciseHandler(c *gin.Context) {
	var guiData models.GuiData
	var id int

	exData.Exs = db.SelectEx(appConfig.DBPath)

	// Sort by Place (numeric) so drag-and-drop order is preserved
	sort.Slice(exData.Exs, func(i, j int) bool {
		pi, _ := strconv.Atoi(exData.Exs[i].Place)
		pj, _ := strconv.Atoi(exData.Exs[j].Place)
		return pi < pj
	})

	guiData.Config = appConfig
	guiData.ExData = exData
	guiData.Groups = db.SelectGroups(appConfig.DBPath)

	idStr, ok := c.GetQuery("id")
	if ok && idStr != "new" {
		id, _ = strconv.Atoi(idStr)
		for _, oneEx := range exData.Exs {
			if oneEx.ID == id {
				guiData.OneEx = oneEx
				break
			}
		}
	}

	c.HTML(http.StatusOK, "header.html", guiData)
	c.HTML(http.StatusOK, "exercise.html", guiData)
}

func saveExerciseHandler(c *gin.Context) {
	var oneEx models.Exercise

	oneEx.Group = c.PostForm("group")
	oneEx.Name = c.PostForm("name")
	oneEx.Descr = c.PostForm("descr")
	oneEx.Image = c.PostForm("image")

	id := c.PostForm("id")
	weight := c.PostForm("weight")
	reps := c.PostForm("reps")
	sets := c.PostForm("sets")

	oneEx.ID, _ = strconv.Atoi(id)
	oneEx.Weight, _ = decimal.NewFromString(weight)
	oneEx.Reps, _ = strconv.Atoi(reps)
	oneEx.Sets, _ = strconv.Atoi(sets)
	if oneEx.Sets <= 0 {
		oneEx.Sets = 3
	}

	if oneEx.ID != 0 {
		// Editing: preserve the existing place so order is not lost
		currentExs := db.SelectEx(appConfig.DBPath)
		for _, ex := range currentExs {
			if ex.ID == oneEx.ID {
				oneEx.Place = ex.Place
				break
			}
		}
		db.DeleteEx(appConfig.DBPath, oneEx.ID)
	} else {
		// New exercise: append at end of its group
		oneEx.Place = strconv.Itoa(db.CountExInGroup(appConfig.DBPath, oneEx.Group))
	}

	db.InsertEx(appConfig.DBPath, oneEx)
	exData.Exs = db.SelectEx(appConfig.DBPath)

	c.Redirect(http.StatusFound, "/exercise/")
}

func deleteExerciseHandler(c *gin.Context) {
	idStr := c.PostForm("id")
	id, _ := strconv.Atoi(idStr)

	db.DeleteEx(appConfig.DBPath, id)
	exData.Exs = db.SelectEx(appConfig.DBPath)

	c.Redirect(http.StatusFound, "/exercise/")
}

func saveOrderHandler(c *gin.Context) {
	ids := c.PostFormArray("ids[]")
	for i, idStr := range ids {
		id, _ := strconv.Atoi(idStr)
		db.UpdateExPlace(appConfig.DBPath, id, i)
	}
	exData.Exs = db.SelectEx(appConfig.DBPath)
	c.Redirect(http.StatusFound, "/exercise/")
}

func addGroupHandler(c *gin.Context) {
	name := c.PostForm("name")
	if name != "" {
		db.InsertGroup(appConfig.DBPath, name)
	}
	c.Redirect(http.StatusFound, "/exercise/")
}

func deleteGroupHandler(c *gin.Context) {
	idStr := c.PostForm("id")
	id, _ := strconv.Atoi(idStr)
	db.DeleteGroup(appConfig.DBPath, id)
	c.Redirect(http.StatusFound, "/exercise/")
}
