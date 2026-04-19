[![Main-Docker](https://github.com/aceberg/exercisediary/actions/workflows/main-docker.yml/badge.svg)](https://github.com/aceberg/exercisediary/actions/workflows/main-docker.yml)
[![Go Report Card](https://goreportcard.com/badge/github.com/aceberg/exercisediary)](https://goreportcard.com/report/github.com/aceberg/exercisediary)
[![Maintainability](https://api.codeclimate.com/v1/badges/e8f67994120fc7936aeb/maintainability)](https://codeclimate.com/github/aceberg/ExerciseDiary/maintainability)

<h1><a href="https://github.com/aceberg/exercisediary">
    <img src="https://raw.githubusercontent.com/aceberg/exercisediary/main/assets/logo.png" width="35" />
</a>Exercise Diary</h1>

Workout diary with GitHub-style year visualization

- [Quick start](#quick-start)
- [Binary](#binary)
- [Config](#config)
- [Options](#options)
- [Export / Import](#export--import)
- [Local network only](#local-network-only)
- [Roadmap](docs/ROADMAP.md)
- [Thanks](#thanks)

![Screenshot](https://raw.githubusercontent.com/aceberg/ExerciseDiary/main/assets/Screenshot.png)

## Quick start

Build and run with Docker Compose (recommended):

```sh
docker compose up -d
```

Or run directly:

```sh
docker run --name exdiary \
  -e "TZ=Europe/Paris" \
  -v exdiary-data:/data/ExerciseDiary \
  -p 8851:8851 \
  exercisediary:local
```

> **Note:** the `docker-compose.yml` builds the image from source. Set your timezone in the `TZ` environment variable before deploying.

## Binary

PPA for amd64 .deb is [here](https://github.com/aceberg/ppa). For other binary options please look at the [latest release](https://github.com/aceberg/ExerciseDiary/releases/latest).

## Config

Configuration can be done through the config file, the web GUI (`/config/`) or environment variables. Variable names in `config.yaml` are the same but in lowercase.

| Variable | Description | Default |
| --- | --- | --- |
| AUTH | Enable session-cookie authentication | false |
| AUTH_EXPIRE | Session expiration time. Number + suffix: **m, h, d** or **M** | 7d |
| AUTH_USER | Username | "" |
| AUTH_PASSWORD | Encrypted password (bcrypt). [How to encrypt?](docs/BCRYPT.md) | "" |
| HOST | Listen address | 0.0.0.0 |
| PORT | Port for web GUI | 8851 |
| THEME | Any theme from [bootswatch.com](https://bootswatch.com) (lowercase) or [extras](https://github.com/aceberg/aceberg-bootswatch-fork) (emerald, grass, grayscale, ocean, sand, wood) | grass |
| COLOR | Background colour: `light` or `dark` | light |
| HEATCOLOR | Heatmap colour (hex) | #03a70c |
| DATEFORMAT | Date display format: `DD/MM/YYYY`, `MM/DD/YYYY` or `YYYY-MM-DD` | DD/MM/YYYY |
| PAGESTEP | Rows per page on Stats / Weight | 10 |
| TZ | Server timezone (e.g. `Europe/Paris`) | "" |

## Options

| Flag | Description | Default |
| --- | --- | --- |
| `-d` | Path to config/data directory | /data/ExerciseDiary |
| `-n` | URL of local JS & themes ([node-bootstrap](https://github.com/aceberg/my-dockerfiles/tree/main/node-bootstrap)) | "" |

## Export / Import

The **Stats** page provides export and import buttons for backup or data migration.

**Export**
- *All exercises & sets* — downloads a single `exercise-diary-all.json` containing every exercise definition and every recorded set.
- *This exercise only* — downloads a filtered JSON for the exercise currently selected in the dropdown.

**Import**
- Click **Import**, select a `.json` file previously exported from Exercise Diary, then confirm.  
- Existing records are preserved — only new entries are inserted.

The JSON format is:
```json
{
  "exercises": [ { "ID": 1, "GR": "Push", "NAME": "Push-up", ... } ],
  "sets":      [ { "ID": 1, "DATE": "2026-01-01", "NAME": "Push-up", "REPS": 20, "WEIGHT": "0" } ]
}
```

## Local network only

By default, the app pulls themes, icons and fonts from the internet. For an air-gapped setup, use the companion [node-bootstrap](https://github.com/aceberg/my-dockerfiles/tree/main/node-bootstrap) image and [docker-compose-local.yml](docker-compose-local.yml):

```sh
# Edit docker-compose-local.yml: replace YOUR_SERVER_IP with your host IP or DNS name
docker compose -f docker-compose-local.yml up -d
```

Or run manually:
```sh
docker run --name node-bootstrap \
  -v ~/.dockerdata/icons:/app/icons \
  -p 8850:8850 \
  aceberg/node-bootstrap

docker run --name exdiary \
  -v exdiary-data:/data/ExerciseDiary \
  -p 8851:8851 \
  exercisediary:local -n "http://$YOUR_SERVER_IP:8850"
```

## Roadmap

Moved to [docs/ROADMAP.md](docs/ROADMAP.md)

## Thanks

- All Go packages listed in [dependencies](https://github.com/aceberg/exercisediary/network/dependencies)
- [Bootstrap](https://getbootstrap.com/)
- Themes: [Free themes for Bootstrap](https://bootswatch.com)
- [Chart.js](https://github.com/chartjs/Chart.js) and [chartjs-chart-matrix](https://github.com/kurkle/chartjs-chart-matrix)
- Favicon and logo: [Flaticon](https://www.flaticon.com/icons/)