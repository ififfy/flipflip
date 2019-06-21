.PHONY: app

app:
	yarn production
	rm -rf app
	mkdir -p app
	mkdir -p release
	cp -r dist app/dist
	cp package.json app/package.json
	electron-packager app FlipFlip --platform=darwin --arch=x64 --icon="src/renderer/icons/flipflip_logo.icns" --overwrite
	electron-packager app FlipFlip --platform=win32 --arch=x64 --icon="src/renderer/icons/flipflip_logo.ico" --overwrite
	electron-packager app FlipFlip --platform=win32 --arch=ia32 --icon="src/renderer/icons/flipflip_logo.ico" --overwrite
	electron-packager app FlipFlip --platform=linux --arch=x64 --icon="src/renderer/icons/flipflip_logo.iconset/icon_512x512@2x.png" --overwrite
	electron-packager app FlipFlip --platform=linux --arch=ia32 --icon="src/renderer/icons/flipflip_logo.iconset/icon_512x512@2x.png" --overwrite
	zip -r release/FlipFlip-Mac.zip FlipFlip-darwin-x64
	zip -r release/FlipFlip-Windows.zip FlipFlip-win32-x64
	zip -r release/FlipFlip-Windows-32bit.zip FlipFlip-win32-ia32
	zip -r release/FlipFlip-Linux.zip FlipFlip-linux-x64
	zip -r release/FlipFlip-Linux-32bit.zip FlipFlip-linux-ia32
