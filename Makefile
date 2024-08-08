build_frontend:
	@clear

	@echo "Installing dependencies"
	@npx --yes pnpm -C frontend install

	@echo "Compiling frontend"
	@npx pnpm -C frontend build

	@echo "Compiled frontend successfully"

compile_local: build_frontend
		@echo "Compiling ReSysTor"
		goreleaser build --snapshot --verbose --clean

release: build_frontend
	goreleaser release

