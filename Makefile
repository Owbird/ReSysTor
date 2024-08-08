build:
	@clear

	@echo "Installing dependencies"
	@npx --yes pnpm -C frontend install

	@echo "Compiling frontend"
	@npx pnpm -C frontend build
	
	@echo "Compiling resystor"
	@go build -o resystor .

	@echo "Compiled successfully"
