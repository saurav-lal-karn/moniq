package helper

func NormalizePaginationRequest(req *PaginationRequest) *PaginationRequest {
	if req.Page <= 0 {
		req.Page = 1
	}

	if req.Limit <= 0 {
		req.Limit = 10
	}

	if req.Limit > 100 {
		req.Limit = 100
	}

	req.Offset = (req.Page - 1) * req.Limit

	if req.Order == "" {
		req.Order = "desc"
	}

	if req.Sort == "" {
		req.Sort = "createdAt"
	}

	if req.Filters == nil {
		req.Filters = make(map[string]string)
	}

	return req
}