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
	electron-packager app FlipFlip --platform=win32 --arch=ia32 --overwrite
	electron-packager app FlipFlip --platform=linux --arch=x64 --overwrite
	electron-packager app FlipFlip --platform=linux --arch=ia32 --overwrite
	zip -r release/FlipFlip-Mac.zip FlipFlip-darwin-x64
	zip -r release/FlipFlip-Windows.zip FlipFlip-win32-x64
	zip -r release/FlipFlip-Windows-32bit.zip FlipFlip-win32-ia32
	zip -r release/FlipFlip-Linux.zip FlipFlip-linux-x64
	zip -r release/FlipFlip-Linux-32bit.zip FlipFlip-linux-ia32
