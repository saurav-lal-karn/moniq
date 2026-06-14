package config

import (
	"strings"

	"github.com/saurav-lal-karn/moniq/backend/pkg/jwt"
)

// getParamsJWT - read parameters from env
/*
	getParamsJWT() reads the parameters for JWT from the environment variables and returns
	them as an instance of the middlewares.JWTParameters struct. The function first retrieves
	the values from environment variables using os.Getenv() and then converts the values to
	the appropriate type using strconv.Atoi() where needed. The function returns the parameter
	struct and any errors encountered during the retrieval or conversion process.
*/
func getParamsJWT(config *Config) (params jwt.JWTParameters, err error) {
	params.AccessKey = []byte(strings.TrimSpace(config.AccessKey))
	params.AccessKeyTTL = config.AccessKeyTTL
	params.RefreshKey = []byte(strings.TrimSpace(config.RefreshKey))
	params.RefreshKeyTTL = config.RefreshKeyTTL

	return
}

// setParamsJWT - set parameters for JWT
/*
	setParamsJWT() sets the retrieved parameters in the jwtUtils.JWTParams struct.
	This struct is used globally throughout the project.
*/
func setParamsJWT(c jwt.JWTParameters) {
	jwt.JWTParams.AccessKey = c.AccessKey
	jwt.JWTParams.AccessKeyTTL = c.AccessKeyTTL
	jwt.JWTParams.RefreshKey = c.RefreshKey
	jwt.JWTParams.RefreshKeyTTL = c.RefreshKeyTTL
}

// InitJWTParams
/*
	InitJWTParams() initializes the JWT parameters by calling getParamsJWT() to retrieve
	the parameters, and then calls setParamsJWT() to set the parameters globally in jwtUtils.JWTParams.
*/
func InitJWTParams(config *Config) {
	var JWT jwt.JWTParameters
	JWT, err := getParamsJWT(config)
	if err != nil {
		return
	}

	// set params globally
	setParamsJWT(JWT)
}
