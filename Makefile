build:
	@clear

	@echo "Installing dependencies"
	@npm install --prefix frontend

	@echo "Compiling frontend"
	@npm run build --prefix frontend
	
	@echo "Compiling resystor"
	@go build -o resystor .

	@echo "Compiled successfully"
