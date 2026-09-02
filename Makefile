# fiori-app Makefile — standalone SAP Fiori PoC app

.PHONY: help serve vendor-ui5 docker-up docker-down precommit pre-commit lint

help: ## Show this help
	@grep -E '^[a-zA-Z0-9_-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

precommit: ## Install pre-commit hooks
	python3 -m pre_commit install

pre-commit: ## Alias for precommit
	python3 -m pre_commit install

lint: ## Run all pre-commit hooks
	python3 -m pre_commit run --all-files

serve: ## Serve app on localhost:8080
	python3 -m http.server 8080

vendor-ui5: ## Vendor OpenUI5 runtime (~71 MB, one-time)
	bash scripts/vendor_ui5.sh

docker-up: ## Start Docker (nginx on 127.0.0.1:8080)
	docker compose up -d --build

docker-down: ## Stop Docker
	docker compose down
