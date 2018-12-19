.PHONY: app

app:
	yarn production
	rm -rf app
	mkdir -p app
	cp -r dist app/dist
	cp package.json app/package.json
	electron-packager app FlipFlip --platform=darwin arch=x64 --overwrite
