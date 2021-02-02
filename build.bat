rem build a jar package
call npm run build
@echo on
rd /S /Q "./build/src"
md "./build/src/main/resources"
xcopy /E /H /Y "./dist" "./build/src/main/resources"
rd /S /Q "./dist"
cd ./build
call mvn clean package
pause
