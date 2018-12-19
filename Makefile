.PHONY: app

app:
	yarn production
	rm -rf app
	mkdir -p app
	mkdir -p release
	cp -r dist app/dist
	cp package.json app/package.json
	electron-packager app FlipFlip --platform=darwin --arch=x64 --overwrite
	electron-packager app FlipFlip --platform=win32 --arch=x64 --overwrite
	zip -r release/FlipFlip-Mac.zip FlipFlip-darwin-x64
	zip -r release/FlipFlip-Windows.zip FlipFlip-win32-x64
